import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import AppUpdateModal from './AppUpdateModal';
import {
  LayoutDashboard,
  Users,
  Terminal,
  Globe,
  Sliders,
  FolderArchive,
  Archive,
  Package,
  ShieldCheck,
  Settings,
  GitBranch,
  ClipboardList,
  Menu,
  X,
  Play,
  RotateCcw,
  Square,
  LogOut,
  Radio,
  Loader2,
  ArrowUpCircle,
  Server
} from 'lucide-react';

export const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const canControl = isAdmin || user?.role === 'operator';
  const [serverStatus, setServerStatus] = useState({ state: 'stopped', serverName: 'Bedrock Dedicated Server' });
  const [xboxStatus, setXboxStatus] = useState(null);
  const [tunnelStatus, setTunnelStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'start-all' | 'restart-all' | 'stop-all'
  const [actionToast, setActionToast] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchStatus = async () => {
    try {
      const [serverData, xData, tData] = await Promise.allSettled([
        api.getStatus(),
        api.Xbox.getStatus(),
        api.Tunnel.getStatus(),
      ]);

      if (serverData.status === 'fulfilled' && serverData.value) {
        const data = serverData.value;
        setServerStatus({
          state: data.state || (data.running ? 'running' : 'stopped'),
          serverName: data.serverName || data.name || 'Bedrock Server',
        });
      }

      if (xData.status === 'fulfilled' && xData.value) {
        setXboxStatus(xData.value);
      }

      if (tData.status === 'fulfilled' && tData.value) {
        setTunnelStatus(tData.value);
      }
    } catch (err) {
      setServerStatus((prev) => ({ ...prev, state: 'stopped' }));
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchStatus();
    const interval = setInterval(() => {
      if (isMounted) fetchStatus();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-check GitHub for app updates on launch
  useEffect(() => {
    let isMounted = true;
    const checkAppUpdates = async () => {
      try {
        const info = await api.Updates.getStatus(true);
        if (isMounted && info) {
          setUpdateInfo(info);
          if (info.shouldPrompt) {
            setShowUpdateModal(true);
          }
        }
      } catch (_) {}
    };
    checkAppUpdates();
    return () => {
      isMounted = false;
    };
  }, []);

  // React Bits Spotlight Card radial glare mouse tracking engine
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const card = e.target.closest(
            '.modern-card, .telemetry-card, .hero-status-panel, .panel-card, .backup-card, .world-card, .addon-card, .gameplay-controls-card, .spotlight-card'
          );
          if (card) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStartAll = async () => {
    setActionLoading('start-all');
    try {
      const res = await api.Server.startAll();
      setActionToast({ type: 'success', text: res?.message || 'Started all services (server, tunnel, and relay).' });
      setTimeout(() => setActionToast(null), 4000);
      await fetchStatus();
    } catch (err) {
      setActionToast({ type: 'error', text: err?.message || 'Failed to start all services.' });
      setTimeout(() => setActionToast(null), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestartAll = async () => {
    if (!window.confirm('Restart all services (Minecraft Server, Playit Tunnel, and Xbox Bot)?')) return;
    setActionLoading('restart-all');
    try {
      const res = await api.Server.restartAll();
      setActionToast({ type: 'success', text: res?.message || 'Restarted all services.' });
      setTimeout(() => setActionToast(null), 4000);
      await fetchStatus();
    } catch (err) {
      setActionToast({ type: 'error', text: err?.message || 'Failed to restart all services.' });
      setTimeout(() => setActionToast(null), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopAll = async () => {
    if (!window.confirm('Stop all services (Minecraft Server, Playit Tunnel, and Xbox Bot)?')) return;
    setActionLoading('stop-all');
    try {
      const res = await api.Server.stopAll();
      setActionToast({ type: 'success', text: res?.message || 'Stopped all services.' });
      setTimeout(() => setActionToast(null), 4000);
      await fetchStatus();
    } catch (err) {
      setActionToast({ type: 'error', text: err?.message || 'Failed to stop all services.' });
      setTimeout(() => setActionToast(null), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebarOnNav = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/players')) return 'Players and permissions';
    if (path.startsWith('/console')) return 'Console';
    if (path.startsWith('/properties')) return 'Server properties';
    if (path.startsWith('/worlds')) return 'Worlds and saves';
    if (path.startsWith('/backups')) return 'Backup archives';
    if (path.startsWith('/addons')) return 'Add-ons and mods';
    if (path.startsWith('/users')) return 'Access vault and users';
    if (path.startsWith('/settings')) return 'Settings and credentials';
    if (path.startsWith('/versions')) return 'Version management';
    if (path.startsWith('/audit')) return 'Security audit trail';
    if (path.startsWith('/xbox')) return 'Console and public access';
    return 'Server manager';
  };

  return (
    <div className="app-layout">
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-cube">
            <Server size={18} className="text-emerald" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Bedrock Panel</span>
            <span className="brand-badge">BDS Manager</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">Overview and monitoring</div>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebarOnNav}
          >
            <span className="nav-icon"><LayoutDashboard size={16} /></span>
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/players"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebarOnNav}
          >
            <span className="nav-icon"><Users size={16} /></span>
            <span className="nav-text">Players and operators</span>
          </NavLink>

          <NavLink
            to="/console"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebarOnNav}
          >
            <span className="nav-icon"><Terminal size={16} /></span>
            <span className="nav-text">Console</span>
          </NavLink>

          <NavLink
            to="/xbox"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebarOnNav}
          >
            <span className="nav-icon"><Radio size={16} /></span>
            <span className="nav-text">Crossplay and public access</span>
          </NavLink>

          {isAdmin && (
            <>
              <div className="nav-group-label">Configuration and worlds</div>
              <NavLink
                to="/properties"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><Sliders size={16} /></span>
                <span className="nav-text">Server properties</span>
              </NavLink>

              <NavLink
                to="/worlds"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><FolderArchive size={16} /></span>
                <span className="nav-text">Worlds and saves</span>
              </NavLink>

              <NavLink
                to="/backups"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><Archive size={16} /></span>
                <span className="nav-text">Backup archives</span>
              </NavLink>

              <NavLink
                to="/addons"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><Package size={16} /></span>
                <span className="nav-text">Addons and mods</span>
                <span className="nav-badge-pill">BP/RP</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <div className="nav-group-label">Security and system</div>
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><ShieldCheck size={16} /></span>
                <span className="nav-text">Users and access</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><Settings size={16} /></span>
                <span className="nav-text">Settings</span>
              </NavLink>

              <NavLink
                to="/versions"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><GitBranch size={16} /></span>
                <span className="nav-text">BDS versions</span>
              </NavLink>

              <NavLink
                to="/audit"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebarOnNav}
              >
                <span className="nav-icon"><ClipboardList size={16} /></span>
                <span className="nav-text">Audit trail</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer User Info */}
        <div
          className="sidebar-user-card clickable-user-card"
          onClick={() => {
            closeSidebarOnNav();
            navigate('/settings');
          }}
          title="Account settings"
        >
          <div className="user-avatar-badge">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="user-details-group">
            <span className="user-display-name">{user?.username || 'admin'}</span>
            <span className={`user-role-tag ${user?.role === 'admin' ? 'role-admin' : 'role-viewer'}`}>
              {user?.role === 'admin' ? 'Administrator' : 'Viewer'}
            </span>
          </div>
          <Settings size={14} className="user-settings-gear text-muted" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <button className="mobile-toggle-btn" onClick={toggleSidebar} aria-label="Toggle navigation">
              <Menu size={18} />
            </button>
            <div className="header-breadcrumbs">
              <span className="crumb-app">Minecraft BDS</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="header-center">
            {/* Live Server Status Indicator Pill */}
            <div className={`server-status-pill status-${serverStatus.state?.toLowerCase()}`}>
              <span className="pulse-indicator-dot" />
              <span className="status-pill-text">
                {serverStatus.state === 'running' && 'Server Online'}
                {serverStatus.state === 'starting' && 'Starting'}
                {serverStatus.state === 'stopping' && 'Stopping'}
                {serverStatus.state === 'stopped' && 'Server Offline'}
              </span>
            </div>

            {/* Xbox Live Bot Global Status Notifier Pill */}
            <div
              className={`xbox-status-pill ${
                xboxStatus?.state === 'running'
                  ? 'status-online'
                  : xboxStatus?.pendingLogin
                  ? 'status-pending'
                  : xboxStatus?.account?.authenticated
                  ? 'status-idle'
                  : 'status-offline'
              }`}
              onClick={() => navigate('/xbox')}
              title="Xbox Live bot status"
            >
              <Radio size={13} className="text-muted" />
              <span className="xbox-pill-dot" />
              <span className="xbox-pill-text">
                {xboxStatus?.state === 'running'
                  ? `Xbox: ${xboxStatus?.account?.gamertag || 'Relay Active'}`
                  : xboxStatus?.pendingLogin
                  ? 'Xbox: Login Code Ready'
                  : xboxStatus?.account?.authenticated
                  ? `Xbox: ${xboxStatus?.account?.gamertag}`
                  : 'Xbox: Disconnected'}
              </span>
            </div>

            {/* Global Master Power Controls */}
            {canControl && (
              <div className="header-master-controls">
                <button
                  type="button"
                  className="btn-header-power btn-start-all"
                  onClick={handleStartAll}
                  disabled={actionLoading !== null || (serverStatus.state === 'running' && tunnelStatus?.isRunning && xboxStatus?.state === 'running')}
                  title="Start server, tunnel, and Xbox relay"
                >
                  <span className="header-btn-icon">
                    {actionLoading === 'start-all' ? <Loader2 size={13} className="spinning" /> : <Play size={13} fill="currentColor" />}
                  </span>
                  <span>{actionLoading === 'start-all' ? 'Starting...' : 'Start all'}</span>
                </button>

                <button
                  type="button"
                  className="btn-header-power btn-restart-all"
                  onClick={handleRestartAll}
                  disabled={actionLoading !== null}
                  title="Restart server, tunnel, and Xbox relay"
                >
                  <span className="header-btn-icon">
                    {actionLoading === 'restart-all' ? <Loader2 size={13} className="spinning" /> : <RotateCcw size={13} />}
                  </span>
                  <span>{actionLoading === 'restart-all' ? 'Restarting...' : 'Restart all'}</span>
                </button>

                {(serverStatus.state === 'running' || tunnelStatus?.isRunning || xboxStatus?.state === 'running') && (
                  <button
                    type="button"
                    className="btn-header-power btn-stop-all"
                    onClick={handleStopAll}
                    disabled={actionLoading !== null}
                    title="Stop server, tunnel, and Xbox relay"
                  >
                    <span className="header-btn-icon">
                      {actionLoading === 'stop-all' ? <Loader2 size={13} className="spinning" /> : <Square size={13} fill="currentColor" />}
                    </span>
                    <span>{actionLoading === 'stop-all' ? 'Stopping...' : 'Stop all'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="header-right">
            <div className="header-user-actions">
              {updateInfo?.updateAvailable && (
                <button
                  type="button"
                  className="btn btn-warning btn-xs font-medium d-flex items-center gap-1.5 px-3 py-1.5"
                  onClick={() => setShowUpdateModal(true)}
                  title={`Update available: ${updateInfo.commitsBehind} new commit(s)`}
                >
                  <ArrowUpCircle size={13} />
                  <span>Update available ({updateInfo.commitsBehind})</span>
                </button>
              )}
              <span className="user-pill-chip">
                <span className="chip-avatar">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
                <span className="chip-name">{user?.username}</span>
              </span>
              <button onClick={handleLogout} className="btn-logout" title="Sign out">
                <LogOut size={14} className="logout-icon" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {showUpdateModal && updateInfo && (
          <AppUpdateModal
            updateInfo={updateInfo}
            onClose={() => setShowUpdateModal(false)}
            onUpdateSuccess={() => {
              api.Updates.getStatus(false).then((info) => setUpdateInfo(info)).catch(() => {});
            }}
          />
        )}

        {actionToast && (
          <div className={`header-action-toast toast-${actionToast.type}`}>
            <span>{actionToast.text}</span>
            <button
              onClick={() => setActionToast(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.4rem' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Page Content Container */}
        <main className="content-container">
          <Outlet />
        </main>

        {/* Mobile App Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebarOnNav}
          >
            <span className="mobile-nav-icon"><LayoutDashboard size={18} /></span>
            <span className="mobile-nav-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/console"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebarOnNav}
          >
            <span className="mobile-nav-icon"><Terminal size={18} /></span>
            <span className="mobile-nav-label">Console</span>
          </NavLink>

          {isAdmin ? (
            <NavLink
              to="/addons"
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebarOnNav}
            >
              <div className="mobile-nav-icon-wrap">
                <span className="mobile-nav-icon"><Package size={18} /></span>
              </div>
              <span className="mobile-nav-label">Addons</span>
            </NavLink>
          ) : (
            <NavLink
              to="/xbox"
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebarOnNav}
            >
              <div className="mobile-nav-icon-wrap">
                <span className="mobile-nav-icon"><Radio size={18} /></span>
                {xboxStatus?.account?.authenticated && (
                  <span className={`mobile-nav-badge-dot ${xboxStatus?.state === 'running' ? 'live' : 'ready'}`} />
                )}
              </div>
              <span className="mobile-nav-label">Xbox</span>
            </NavLink>
          )}

          <NavLink
            to="/players"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebarOnNav}
          >
            <span className="mobile-nav-icon"><Users size={18} /></span>
            <span className="mobile-nav-label">Players</span>
          </NavLink>

          <button
            type="button"
            className={`mobile-nav-item mobile-nav-menu-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
          >
            <div className="mobile-nav-icon-wrap">
              <span className="mobile-nav-icon"><Menu size={18} /></span>
              {xboxStatus?.state === 'running' && (
                <span className="mobile-nav-badge-dot live" title="Xbox relay active" />
              )}
            </div>
            <span className="mobile-nav-label">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
