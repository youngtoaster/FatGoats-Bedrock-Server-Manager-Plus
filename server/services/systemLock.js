const { EventEmitter } = require('events');

/**
 * SystemLock: Global Exclusive Operations Coordinator
 * Prevents race conditions, concurrent world/binary overwrites, and impossible states.
 * Empowers UX (disables conflicting buttons with clear status explanation),
 * DX (guarantees safe atomic operations with zero boilerplate),
 * and AX (exposes deterministic machine-readable lock metadata to AI agents).
 */
class SystemLockCoordinator extends EventEmitter {
  constructor() {
    super();
    this.activeLock = null; // { type, holder, description, acquiredAt, timeoutRef }
  }

  /**
   * Check if the system is currently locked
   * @returns {boolean}
   */
  isLocked() {
    return this.activeLock !== null;
  }

  /**
   * Get full metadata for active lock
   * @returns {Object|null}
   */
  getLockInfo() {
    if (!this.activeLock) return null;
    return {
      type: this.activeLock.type,
      holder: this.activeLock.holder,
      description: this.activeLock.description,
      acquiredAt: this.activeLock.acquiredAt,
      durationMs: Date.now() - new Date(this.activeLock.acquiredAt).getTime(),
    };
  }

  /**
   * Acquire exclusive lock for a critical task
   * @param {string} type - e.g. 'BACKUP_RESTORE' | 'VERSION_INSTALL' | 'APP_UPDATE' | 'WORLD_IMPORT'
   * @param {Object} options
   * @param {string} [options.holder='system'] - Identifier of who requested the lock
   * @param {string} [options.description] - Human-readable explanation for UI/agents
   * @param {number} [options.timeoutMs=180000] - Safety auto-release timeout (default 3 mins)
   * @returns {Object} lock handle with release() method
   */
  acquire(type, options = {}) {
    if (this.isLocked()) {
      const info = this.getLockInfo();
      const err = new Error(
        `System is currently locked by "${info.type}" (${info.description}). Please wait for it to complete.`
      );
      err.code = 'SYSTEM_LOCKED';
      err.lockInfo = info;
      throw err;
    }

    const acquiredAt = new Date().toISOString();
    const description = options.description || `Exclusive task: ${type}`;
    const holder = options.holder || 'system';
    const timeoutMs = options.timeoutMs || 180000;

    const timeoutRef = setTimeout(() => {
      console.warn(`[SystemLock] Warning: Lock "${type}" exceeded timeout of ${timeoutMs}ms. Auto-releasing.`);
      this.release(type, true);
    }, timeoutMs);

    this.activeLock = {
      type,
      holder,
      description,
      acquiredAt,
      timeoutRef,
    };

    console.log(`[SystemLock] Lock ACQUIRED: [${type}] - "${description}"`);
    this.emit('lock_acquired', this.getLockInfo());

    return {
      type,
      release: () => this.release(type),
    };
  }

  /**
   * Release the current lock
   * @param {string} [type] - Verification that caller matches active lock
   * @param {boolean} [forced=false]
   */
  release(type = null, forced = false) {
    if (!this.activeLock) return;

    if (type && this.activeLock.type !== type && !forced) {
      console.warn(`[SystemLock] Cannot release lock: active is "${this.activeLock.type}", attempted "${type}"`);
      return;
    }

    const releasedType = this.activeLock.type;
    if (this.activeLock.timeoutRef) {
      clearTimeout(this.activeLock.timeoutRef);
    }

    this.activeLock = null;
    console.log(`[SystemLock] Lock RELEASED: [${releasedType}]`);
    this.emit('lock_released', { type: releasedType, timestamp: new Date().toISOString() });
  }

  /**
   * Assert that the system is not locked, throwing if it is.
   * Convenient helper for service entrypoints (e.g. serverProcess.start())
   * @param {string} attemptedAction
   */
  assertNotLocked(attemptedAction = 'perform operation') {
    if (this.isLocked()) {
      const info = this.getLockInfo();
      const err = new Error(
        `Cannot ${attemptedAction}: System is locked by ${info.type} ("${info.description}").`
      );
      err.code = 'SYSTEM_LOCKED';
      err.lockInfo = info;
      throw err;
    }
  }
}

const systemLock = new SystemLockCoordinator();
module.exports = systemLock;
