const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

const router = express.Router();

// All user management routes require authentication and admin privileges
router.use(authenticate, requireAdmin);

/**
 * GET /
 * List all users (excluding password_hash)
 */
router.get('/', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, username, role, is_disabled, created_at
      FROM users
      ORDER BY id ASC
    `).all();

    return res.json({ users });
  } catch (err) {
    console.error('[UsersRoute] Error fetching users:', err);
    return res.status(500).json({ error: 'Failed to retrieve users', details: err.message });
  }
});

/**
 * PUT /:id/role
 * Update user role, prevent self-demotion, logAudit
 */
router.put('/:id/role', (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!role || !['admin', 'operator', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (admin, operator, or viewer).' });
    }

    if (req.user.id === targetUserId && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot demote yourself from the admin role.' });
    }

    const user = db.prepare('SELECT id, username, role, is_disabled FROM users WHERE id = ?').get(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // If demoting an admin, ensure there is at least one other active admin
    if (user.role === 'admin' && role !== 'admin') {
      const activeAdmins = db.prepare(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND (is_disabled = 0 OR is_disabled IS NULL) AND id != ?"
      ).get(targetUserId);
      if (!activeAdmins || activeAdmins.count < 1) {
        return res.status(400).json({ error: 'Cannot demote the only remaining active admin account.' });
      }
    }

    const updateStmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    updateStmt.run(role, targetUserId);

    logAudit(req.user.id, req.user.username, 'USER_ROLE_UPDATE', {
      targetUserId,
      targetUsername: user.username,
      previousRole: user.role,
      newRole: role
    });

    return res.json({
      success: true,
      message: `User ${user.username} role updated to ${role}.`,
      user: {
        id: user.id,
        username: user.username,
        role,
        is_disabled: user.is_disabled || 0
      }
    });
  } catch (err) {
    console.error('[UsersRoute] Error updating user role:', err);
    return res.status(500).json({ error: 'Failed to update user role', details: err.message });
  }
});

/**
 * PUT /:id/status
 * Enable or disable user account, prevent self-disabling, ensure at least one active admin remains, logAudit
 */
router.put('/:id/status', (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { disabled } = req.body;

    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ error: 'A boolean "disabled" property is required.' });
    }

    if (req.user.id === targetUserId && disabled) {
      return res.status(400).json({ error: 'You cannot disable your own account.' });
    }

    const user = db.prepare('SELECT id, username, role, is_disabled FROM users WHERE id = ?').get(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // If disabling an admin, ensure there is at least one other active admin
    if (disabled && user.role === 'admin') {
      const activeAdmins = db.prepare(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND (is_disabled = 0 OR is_disabled IS NULL) AND id != ?"
      ).get(targetUserId);
      if (!activeAdmins || activeAdmins.count < 1) {
        return res.status(400).json({ error: 'Cannot disable the only remaining active administrator account.' });
      }
    }

    const newDisabledValue = disabled ? 1 : 0;
    db.prepare('UPDATE users SET is_disabled = ? WHERE id = ?').run(newDisabledValue, targetUserId);

    // If default admin is disabled, record that it was decommissioned so it's never re-seeded
    if (disabled && user.username.toLowerCase() === 'admin') {
      db.setSetting('default_admin_seeded', 'true');
      db.setSetting('default_admin_removed', 'true');
    }

    logAudit(req.user.id, req.user.username, disabled ? 'USER_DISABLE' : 'USER_ENABLE', {
      targetUserId,
      targetUsername: user.username,
      previousStatus: user.is_disabled ? 'disabled' : 'active',
      newStatus: disabled ? 'disabled' : 'active'
    });

    return res.json({
      success: true,
      message: `User ${user.username} account has been ${disabled ? 'disabled' : 'enabled'}.`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_disabled: newDisabledValue
      }
    });
  } catch (err) {
    console.error('[UsersRoute] Error updating user status:', err);
    return res.status(500).json({ error: 'Failed to update user status', details: err.message });
  }
});

/**
 * DELETE /:id
 * Permanently delete user, prevent self-deletion, unlink invites, flag default admin removed, logAudit
 */
router.delete('/:id', (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    if (req.user.id === targetUserId) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if user is the last active admin
    if (user.role === 'admin') {
      const activeAdmins = db.prepare(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND (is_disabled = 0 OR is_disabled IS NULL) AND id != ?"
      ).get(targetUserId);
      if (!activeAdmins || activeAdmins.count < 1) {
        return res.status(400).json({ error: 'Cannot delete the only remaining active admin account.' });
      }
    }

    // If removing default admin account, permanently record that it was removed
    // so it will NEVER auto re-add itself on server reboot or database reload
    if (user.username.toLowerCase() === 'admin') {
      db.setSetting('default_admin_seeded', 'true');
      db.setSetting('default_admin_removed', 'true');
    }

    // Unlink any invite tokens created by this user to maintain database integrity
    try {
      db.prepare('UPDATE invites SET created_by = NULL WHERE created_by = ?').run(targetUserId);
    } catch (_) {}

    const deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');
    deleteStmt.run(targetUserId);

    logAudit(req.user.id, req.user.username, 'USER_DELETE', {
      targetUserId,
      targetUsername: user.username
    });

    return res.json({
      success: true,
      message: `User ${user.username} deleted successfully and will not be re-created.`
    });
  } catch (err) {
    console.error('[UsersRoute] Error deleting user:', err);
    return res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

/**
 * POST /invites
 * Create invite token (use uuid v4), logAudit
 */
router.post('/invites', (req, res) => {
  try {
    const { role = 'viewer' } = req.body;

    if (!['admin', 'operator', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either admin, operator, or viewer.' });
    }

    const token = uuidv4();
    const insertStmt = db.prepare(`
      INSERT INTO invites (token, role, used, created_by, created_at)
      VALUES (?, ?, 0, ?, datetime('now'))
    `);
    const info = insertStmt.run(token, role, req.user.id);

    logAudit(req.user.id, req.user.username, 'CREATE_INVITE', {
      inviteId: info.lastInsertRowid,
      token,
      role
    });

    return res.status(201).json({
      id: info.lastInsertRowid,
      token,
      role,
      used: 0,
      created_by: req.user.id
    });
  } catch (err) {
    console.error('[UsersRoute] Error creating invite:', err);
    return res.status(500).json({ error: 'Failed to create invite', details: err.message });
  }
});

/**
 * GET /invites
 * List invites
 */
router.get('/invites', (req, res) => {
  try {
    const invites = db.prepare(`
      SELECT i.id, i.token, i.role, i.used, i.created_by, i.created_at, u.username AS creator_username
      FROM invites i
      LEFT JOIN users u ON i.created_by = u.id
      ORDER BY i.id DESC
    `).all();

    return res.json({ invites });
  } catch (err) {
    console.error('[UsersRoute] Error listing invites:', err);
    return res.status(500).json({ error: 'Failed to retrieve invites', details: err.message });
  }
});

/**
 * DELETE /invites/:id
 * Delete invite, logAudit
 */
router.delete('/invites/:id', (req, res) => {
  try {
    const inviteId = parseInt(req.params.id, 10);
    const invite = db.prepare('SELECT id, token, role, used FROM invites WHERE id = ?').get(inviteId);

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found.' });
    }

    db.prepare('DELETE FROM invites WHERE id = ?').run(inviteId);

    logAudit(req.user.id, req.user.username, 'DELETE_INVITE', {
      inviteId,
      token: invite.token
    });

    return res.json({
      success: true,
      message: `Invite ${invite.token} deleted successfully.`
    });
  } catch (err) {
    console.error('[UsersRoute] Error deleting invite:', err);
    return res.status(500).json({ error: 'Failed to delete invite', details: err.message });
  }
});

module.exports = router;
