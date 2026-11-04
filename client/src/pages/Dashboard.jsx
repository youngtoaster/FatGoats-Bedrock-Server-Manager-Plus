import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { safeCopyToClipboard } from '../utils/clipboard';
import {
  Play,
  RotateCcw,
  Square,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Package,
  Download,
  Clock,
  Radio,
  FolderArchive,
  Copy,
  Users,
  Activity,
  Cpu,
  HardDrive,
  Terminal,
  Sliders,
  Archive,
  ArrowRight,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  CloudRain,
  CloudLightning,
  Lock,
  ArrowUpCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { isAdmin, canControlServer } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isInstallingBds, setIsInstallingBds] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [actionMessage, setActionMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  // Remote Access & Crossplay Indicators
  const [tunnelStatus, setTunnelStatus] = useState(null);
  const [xboxStatus, setXboxStatus] = useState(null);
  const [copyToast, setCopyToast] = useState(null);

  const formatUptime = (seconds) => {
    if (!seconds || seconds <= 0 || isNaN(seconds)) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);

    return parts.join(' ');
  };

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getStatus();
      setStatus(data);
      if (data && data.autoUpdate !== undefined) {
        setAutoUpdate(Boolean(data.autoUpdate));
      }
    } catch (err) {
      setStatus((prev) => (prev ? { ...prev, state: 'stopped' } : { state: 'stopped', installed: false }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch version settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await api.Versions.getSettings();
        if (s && s.autoUpdate !== undefined) {
          setAutoUpdate(Boolean(s.autoUpdate));
        }
      } catch (_) {}
    };
    loadSettings();
  }, []);

  const fetchTunnelStatus = useCallback(async () => {
    try {
      const data = await api.Tunnel.getStatus();
      setTunnelStatus(data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    fetchTunnelStatus();
    const interval = setInterval(fetchTunnelStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchTunnelStatus]);

  const fetchXboxStatus = useCallback(async () => {
    try {
      const data = await api.Xbox.getStatus();
      setXboxStatus(data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchXboxStatus();
    const interval = setInterval(fetchXboxStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchXboxStatus]);

  const handleCopyAddress = async (text) => {
    if (!text) return;
    await safeCopyToClipboard(text);
    setCopyToast(`Copied ${text}`);
    setTimeout(() => setCopyToast(null), 3000);
  };

  const handleInstallLatest = async () => {
    if (!window.confirm('Download and install the latest official Minecraft Bedrock Dedicated Server build from Mojang? All worlds, server.properties, and packs will be preserved.')) {
      return;
    }

    setIsInstallingBds(true);
    setActionMessage({
      type: 'info',
      text: 'Downloading official Bedrock Dedicated Server package from Mojang CDN...',
    });

    try {
      const res = await api.Versions.installLatest();
      setActionMessage({
        type: 'success',
        text: res.message || 'Bedrock server binaries verified and ready.',
      });
      await fetchStatus();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to download and install Bedrock server.',
      });
    } finally {
      setIsInstallingBds(false);
    }
  };

  const handleToggleAutoUpdate = async (e) => {
    const newVal = e.target.checked;
    setAutoUpdate(newVal);
    setUpdatingSettings(true);
    try {
      await api.Versions.updateSettings(newVal);
      setActionMessage({
        type: 'success',
        text: `Automatic BDS binary updates ${newVal ? 'enabled' : 'disabled'}.`,
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setAutoUpdate(!newVal);
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to update auto-update setting.',
      });
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleAction = async (actionName, apiFn) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await apiFn();
      setActionMessage({
        type: 'success',
        text: res?.message || `Command completed: ${actionName}`,
      });
      setTimeout(() => setActionMessage(null), 4000);
      await fetchStatus();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || `Failed to execute: ${actionName}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isInstalled = status?.installed !== false;
  const serverState = status?.state || (status?.running ? 'running' : 'stopped');
  const playersCount = status?.players?.length ?? status?.playerCount ?? 0;
  const maxPlayers = status?.maxPlayers || 10;
  const playerPercent = Math.min(100, Math.round((playersCount / maxPlayers) * 100));

  const cpuUsageNum = status?.cpu != null ? Math.round(status.cpu) : (status?.stats?.cpu != null ? Math.round(status.stats.cpu) : 0);
  const memoryMb = status?.memory != null ? Math.round(status.memory) : (status?.stats?.memory != null ? Math.round(status.stats.memory) : 0);
  const allocatedRamMb = status?.systemMemory?.totalMb ? Math.round(status.systemMemory.totalMb) : 2048;
  const ramPercent = Math.min(100, Math.round((memoryMb / allocatedRamMb) * 100));

  const hostTotalGb = status?.systemMemory?.totalMb ? (status.systemMemory.totalMb / 1024).toFixed(1) : null;
  const hostFreeGb = status?.systemMemory?.freeMb ? (status.systemMemory.freeMb / 1024).toFixed(1) : null;
  const tpsVal = status?.tps != null ? Number(status.tps).toFixed(1) : (status?.stats?.tps != null ? Number(status.stats.tps).toFixed(1) : '20.0');
  const version = status?.version && status.version !== 'Unknown' ? status.version : (isInstalled ? 'BDS Detected' : 'Not installed');
  const uptimeSeconds = status?.uptimeSeconds ?? status?.uptime ?? 0;
  const activeWorldName = status?.activeWorld || status?.levelName || 'Bedrock level';

  return (
    <div className="dashboard-page">
      {/* Page Title & Subtitle */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Server overview</h1>
          <p className="page-sub-title">Process supervision, live telemetry, and server controls</p>
        </div>
        <div className="header-meta-actions">
          {/* Auto-update Toggle Switch */}
          {isAdmin && (
            <label className="auto-update-toggle-card" title="Automatically keep Bedrock server updated with Mojang's official build">
              <RefreshCw size={13} className="text-muted" />
              <span className="toggle-label-text">Auto-update:</span>
              <input
                type="checkbox"
                className="toggle-real-input"
                checked={autoUpdate}
                onChange={handleToggleAutoUpdate}
                disabled={updatingSettings}
              />
              <span className={`toggle-custom-pill ${autoUpdate ? 'on' : 'off'}`}>
                {autoUpdate ? 'ON' : 'OFF'}
              </span>
            </label>
          )}

          <div className="live-pulse-badge" title="Live telemetry polling active (1.5s interval)">
            <span className="pulse-dot" />
            <span>Live telemetry</span>
          </div>

          <button
            className="btn btn-secondary btn-sm d-flex items-center gap-1.5"
            onClick={fetchStatus}
            disabled={loading}
            title="Refresh telemetry"
          >
            <RefreshCw size={13} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className={`alert-toast alert-${actionMessage.type}`}>
          <span className="toast-icon">
            {actionMessage.type === 'success' && <CheckCircle2 size={15} />}
            {actionMessage.type === 'error' && <AlertTriangle size={15} />}
            {actionMessage.type === 'info' && <Info size={15} />}
          </span>
          <span className="toast-text">{actionMessage.text}</span>
          <button className="toast-dismiss" onClick={() => setActionMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Installation Prompt Banner if BDS is not installed */}
      {!isInstalled && (
        <div className="install-prompt-banner">
          <div className="prompt-content-flex">
            <Package size={22} className="text-muted" />
            <div className="prompt-text-group">
              <h3 className="prompt-heading">Bedrock Dedicated Server binary missing</h3>
              <p className="prompt-subtext">
                The BDS executable (<code>bedrock_server.exe</code>) has not been downloaded yet. Pull and extract Mojang's official server build with one click.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              className="btn btn-primary btn-install-now d-flex items-center gap-1.5"
              onClick={handleInstallLatest}
              disabled={isInstallingBds}
            >
              {isInstallingBds ? (
                <>
                  <RefreshCw size={14} className="spinning" />
                  <span>Installing BDS...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download official BDS</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Hero Power & Status Card */}
      <div className={`hero-status-panel state-${serverState.toLowerCase()}`}>
        <div className="hero-top-bar">
          <div className="hero-status-identity">
            <div className="radar-status-dot">
              <span className="radar-core" />
            </div>
            <div>
              <div className="hero-state-title">
                Status:{' '}
                <span className="state-badge-text">
                  {!isInstalled ? 'Not installed' : serverState.charAt(0).toUpperCase() + serverState.slice(1)}
                </span>
              </div>
              <div className="hero-engine-desc">
                <span>{version}</span>
                <span className="bullet-sep">•</span>
                <span>Port {status?.port || 19132} UDP</span>
                <span className="bullet-sep">•</span>
                <span>Active world: <strong>{activeWorldName}</strong></span>
              </div>
            </div>
          </div>

          {/* Power Controls */}
          {canControlServer && (
            <div className="hero-control-buttons">
              <button
                className="btn-power btn-power-start d-flex items-center gap-1.5"
                onClick={() => handleAction('start', api.start)}
                disabled={actionLoading || isInstallingBds || serverState === 'running' || serverState === 'starting'}
                title="Start Bedrock server process"
              >
                <Play size={13} fill="currentColor" />
                <span>Start</span>
              </button>

              <button
                className="btn-power btn-power-restart d-flex items-center gap-1.5"
                onClick={() => handleAction('restart', api.restart)}
                disabled={actionLoading || isInstallingBds || serverState === 'stopped' || !isInstalled}
                title="Restart Bedrock server process"
              >
                <RotateCcw size={13} />
                <span>Restart</span>
              </button>

              <button
                className="btn-power btn-power-stop d-flex items-center gap-1.5"
                onClick={() => handleAction('stop', api.stop)}
                disabled={actionLoading || isInstallingBds || serverState === 'stopped' || serverState === 'stopping'}
                title="Stop Bedrock server process"
              >
                <Square size={13} fill="currentColor" />
                <span>Stop</span>
              </button>

              {/* Master Control: Start All & Restart All */}
              <button
                className="btn-power btn-secondary d-flex items-center gap-1.5"
                onClick={() => handleAction('start all services', api.Server.startAll)}
                disabled={actionLoading || isInstallingBds}
                title="Start server, public tunnel, and Xbox relay"
              >
                <Play size={13} fill="currentColor" />
                <span>Start all</span>
              </button>

              <button
                className="btn-power btn-secondary d-flex items-center gap-1.5"
                onClick={() => handleAction('restart all services', api.Server.restartAll)}
                disabled={actionLoading || isInstallingBds}
                title="Restart server, public tunnel, and Xbox relay"
              >
                <RotateCcw size={13} />
                <span>Restart all</span>
              </button>

              {isAdmin && (
                <button
                  className="btn-power btn-secondary d-flex items-center gap-1.5"
                  onClick={handleInstallLatest}
                  disabled={actionLoading || isInstallingBds}
                  title="Check and install newest BDS release"
                >
                  <Download size={13} />
                  <span>{isInstallingBds ? 'Updating...' : 'Update build'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hero Metadata Strip */}
        <div className="hero-meta-strip">
          <div className="meta-pill">
            <Clock size={14} className="text-muted" />
            <div className="meta-info">
              <span className="meta-title">Uptime</span>
              <span className="meta-highlight font-mono">{formatUptime(uptimeSeconds)}</span>
            </div>
          </div>
          <div className="meta-pill">
            <Radio size={14} className="text-muted" />
            <div className="meta-info">
              <span className="meta-title">Network bind</span>
              <span className="meta-highlight font-mono">0.0.0.0:{status?.port || 19132}</span>
            </div>
          </div>
          <div className="meta-pill">
            <FolderArchive size={14} className="text-muted" />
            <div className="meta-info">
              <span className="meta-title">Active world</span>
              <span className="meta-highlight">{activeWorldName}</span>
            </div>
          </div>
          <div className="meta-pill">
            <Package size={14} className="text-muted" />
            <div className="meta-info">
              <span className="meta-title">Binary status</span>
              <span className={`meta-highlight ${isInstalled ? 'text-primary' : 'text-danger'}`}>
                {isInstalled ? 'Installed' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Crossplay & Public Access Quick Bar */}
      <div className="modern-card remote-access-summary-card mb-6">
        <div className="d-flex items-center justify-between flex-wrap gap-3 p-4">
          <div className="d-flex items-center gap-3">
            <Radio size={18} className="text-emerald" />
            <div>
              <div className="d-flex items-center gap-2">
                <h3 className="m-0 text-sm font-medium text-white">Crossplay and public access</h3>
                <span className="badge badge-primary text-xs">Playit + Xbox</span>
              </div>
              <p className="m-0 text-xs text-sub mt-0.5">
                Tunnel endpoints and Xbox Live console friend relay
              </p>
            </div>
          </div>

          <div className="d-flex items-center gap-3 flex-wrap">
            <div className="remote-status-chip">
              <span className="text-xs text-sub font-normal">Tunnel:</span>
              {tunnelStatus?.isRunning && tunnelStatus?.publicAddress ? (
                <div className="d-flex items-center gap-1.5">
                  <span className="channel-pill-online font-mono text-xs text-emerald">
                    {tunnelStatus.publicAddress}
                  </span>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary d-flex items-center gap-1"
                    title="Copy address"
                    onClick={() => handleCopyAddress(tunnelStatus.publicAddress)}
                  >
                    <Copy size={11} />
                    <span>Copy</span>
                  </button>
                </div>
              ) : tunnelStatus?.claimUrl || tunnelStatus?.state === 'awaiting_claim' ? (
                <span className="badge badge-warning text-xs">Setup required</span>
              ) : tunnelStatus?.isRunning ? (
                <span className="badge badge-info text-xs">Connected</span>
              ) : (
                <span className="badge badge-secondary text-xs">Offline</span>
              )}
            </div>

            <div className="remote-status-chip">
              <span className="text-xs text-sub font-normal">Xbox relay:</span>
              {xboxStatus?.state === 'running' ? (
                <span className="badge badge-success text-xs">
                  Online {xboxStatus?.account?.gamertag ? `(${xboxStatus.account.gamertag})` : ''}
                </span>
              ) : xboxStatus?.state === 'starting' ? (
                <span className="badge badge-warning text-xs">Starting...</span>
              ) : xboxStatus?.account?.authenticated ? (
                <span className="badge badge-secondary text-xs">
                  Offline {xboxStatus?.account?.gamertag ? `(${xboxStatus.account.gamertag})` : ''}
                </span>
              ) : (
                <span className="badge badge-secondary text-xs">Not linked</span>
              )}
            </div>

            <Link
              to="/xbox"
              className="btn btn-secondary btn-sm d-flex items-center gap-1.5"
            >
              <span>Manage access</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {copyToast && (
          <div className="px-4 pb-3">
            <div className="alert-toast alert-success py-1.5 px-3 text-xs m-0">
              <span>{copyToast}</span>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Stats Grid */}
      <div className="telemetry-grid">
        {/* Players Card */}
        <div className="telemetry-card">
          <div className="card-header-flex">
            <span className="telemetry-label">Players online</span>
            <Users size={16} className="text-muted" />
          </div>
          <div className="telemetry-main-metric">
            <span className="metric-number">{playersCount}</span>
            <span className="metric-denom">/ {maxPlayers}</span>
          </div>
          <div className="telemetry-meter-bar">
            <div className="meter-fill fill-green" style={{ width: `${Math.max(5, playerPercent)}%` }} />
          </div>
          <div className="telemetry-footer-text">
            <span>{playerPercent}% server capacity</span>
          </div>
        </div>

        {/* TPS Card */}
        <div className="telemetry-card">
          <div className="card-header-flex">
            <span className="telemetry-label">Simulation tick rate</span>
            <Activity size={16} className="text-muted" />
          </div>
          <div className="telemetry-main-metric">
            <span className="metric-number">{tpsVal}</span>
            <span className="metric-denom">TPS</span>
          </div>
          <div className="telemetry-meter-bar">
            <div className="meter-fill fill-emerald" style={{ width: `${(Number(tpsVal) / 20) * 100}%` }} />
          </div>
          <div className="telemetry-footer-text">
            <span>20.0 target rate</span>
          </div>
        </div>

        {/* CPU Card */}
        <div className="telemetry-card">
          <div className="card-header-flex">
            <span className="telemetry-label">CPU utilization</span>
            <Cpu size={16} className="text-muted" />
          </div>
          <div className="telemetry-main-metric">
            <span className="metric-number">{cpuUsageNum}</span>
            <span className="metric-denom">%</span>
          </div>
          <div className="telemetry-meter-bar">
            <div className="meter-fill fill-cyan" style={{ width: `${Math.min(100, Math.max(3, cpuUsageNum))}%` }} />
          </div>
          <div className="telemetry-footer-text">
            <span>{status?.pid ? `PID ${status.pid} • bedrock_server.exe` : 'Process idle'}</span>
          </div>
        </div>

        {/* RAM Card */}
        <div className="telemetry-card">
          <div className="card-header-flex">
            <span className="telemetry-label">Memory allocation</span>
            <HardDrive size={16} className="text-muted" />
          </div>
          <div className="telemetry-main-metric">
            <span className="metric-number">{memoryMb >= 1024 ? (memoryMb / 1024).toFixed(2) : memoryMb}</span>
            <span className="metric-denom">
              {memoryMb >= 1024 ? 'GB' : 'MB'} / {allocatedRamMb >= 1024 ? `${(allocatedRamMb / 1024).toFixed(0)} GB` : `${allocatedRamMb} MB`}
            </span>
          </div>
          <div className="telemetry-meter-bar">
            <div className="meter-fill fill-purple" style={{ width: `${Math.min(100, Math.max(4, ramPercent))}%` }} />
          </div>
          <div className="telemetry-footer-text">
            <span>
              {ramPercent}% of allocated limit{hostTotalGb ? ` • Host: ${hostFreeGb} GB free` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="quick-hub-section">
        <div className="hub-section-header">
          <h2 className="hub-title">Administrative modules</h2>
          <span className="hub-subtitle">Quick shortcuts to core server operations</span>
        </div>

        <div className="quick-hub-grid">
          <div className="hub-tile" onClick={() => navigate('/players')}>
            <div className="tile-icon-box">
              <Users size={18} className="text-muted" />
            </div>
            <div className="tile-content">
              <h3 className="tile-heading">Players and operators</h3>
              <p className="tile-description">Connected roster, historical directory, and permission tiers.</p>
            </div>
            <ArrowRight size={14} className="tile-arrow text-muted" />
          </div>

          <div className="hub-tile" onClick={() => navigate('/console')}>
            <div className="tile-icon-box">
              <Terminal size={18} className="text-muted" />
            </div>
            <div className="tile-content">
              <h3 className="tile-heading">Live console</h3>
              <p className="tile-description">Direct standard input and log stream for BDS process commands.</p>
            </div>
            <ArrowRight size={14} className="tile-arrow text-muted" />
          </div>

          <div className="hub-tile" onClick={() => navigate('/properties')}>
            <div className="tile-icon-box">
              <Sliders size={18} className="text-muted" />
            </div>
            <div className="tile-content">
              <h3 className="tile-heading">Server properties</h3>
              <p className="tile-description">Gamemodes, simulation distance, allowlists, and configuration parameters.</p>
            </div>
            <ArrowRight size={14} className="tile-arrow text-muted" />
          </div>

          <div className="hub-tile" onClick={() => navigate('/backups')}>
            <div className="tile-icon-box">
              <Archive size={18} className="text-muted" />
            </div>
            <div className="tile-content">
              <h3 className="tile-heading">Snapshots and backups</h3>
              <p className="tile-description">Save-hold LevelDB chunk snapshots and automated archives.</p>
            </div>
            <ArrowRight size={14} className="tile-arrow text-muted" />
          </div>
        </div>
      </div>

      {/* World & Time of Day Controls */}
      {isAdmin && (
        <div className="gameplay-controls-card">
          <div className="gameplay-header">
            <div className="gameplay-title-group">
              <Clock size={16} className="text-muted" />
              <div>
                <h3 className="gameplay-heading">World environment and time controls</h3>
                <p className="gameplay-desc">
                  Adjust daylight cycle and atmospheric weather conditions in the active world.
                </p>
              </div>
            </div>
            <div className="gameplay-status-pill">
              <span className={`dot ${serverState === 'running' ? 'dot-active' : 'dot-idle'}`} />
              <span>{serverState === 'running' ? 'Server connected' : 'Server stopped'}</span>
            </div>
          </div>

          <div className="gameplay-grid">
            {/* Primary Time of Day Toggle */}
            <div className="gameplay-subcard">
              <div className="subcard-title-row">
                <Sun size={14} className="text-muted" />
                <span className="subcard-title">Daylight control</span>
              </div>
              <p className="subcard-hint">Switch time of day in the active world.</p>
              
              <div className="time-toggle-actions">
                <button
                  className="btn-time-quick btn-time-day d-flex items-center gap-2"
                  disabled={serverState !== 'running' || actionLoading}
                  onClick={async () => {
                    try {
                      await api.Server.setTime('day');
                      setActionMessage({ type: 'success', text: 'Time set to day (1000 ticks).' });
                    } catch (e) {
                      setActionMessage({ type: 'error', text: e.message || 'Failed to change time' });
                    }
                  }}
                >
                  <Sun size={15} />
                  <div>
                    <span className="btn-label-bold">Day</span>
                    <span className="btn-label-sub">1000 ticks</span>
                  </div>
                </button>

                <button
                  className="btn-time-quick btn-time-night d-flex items-center gap-2"
                  disabled={serverState !== 'running' || actionLoading}
                  onClick={async () => {
                    try {
                      await api.Server.setTime('night');
                      setActionMessage({ type: 'success', text: 'Time set to night (13000 ticks).' });
                    } catch (e) {
                      setActionMessage({ type: 'error', text: e.message || 'Failed to change time' });
                    }
                  }}
                >
                  <Moon size={15} />
                  <div>
                    <span className="btn-label-bold">Night</span>
                    <span className="btn-label-sub">13000 ticks</span>
                  </div>
                </button>
              </div>

              {/* Specific time presets */}
              <div className="time-presets-strip">
                <button
                  className="preset-pill"
                  disabled={serverState !== 'running'}
                  onClick={() => api.Server.setTime('noon').then(() => setActionMessage({ type: 'success', text: 'Time set to noon.' }))}
                >
                  <Sun size={12} className="inline mr-1" /> Noon
                </button>
                <button
                  className="preset-pill"
                  disabled={serverState !== 'running'}
                  onClick={() => api.Server.setTime('sunset').then(() => setActionMessage({ type: 'success', text: 'Time set to sunset.' }))}
                >
                  <Sunset size={12} className="inline mr-1" /> Sunset
                </button>
                <button
                  className="preset-pill"
                  disabled={serverState !== 'running'}
                  onClick={() => api.Server.setTime('midnight').then(() => setActionMessage({ type: 'success', text: 'Time set to midnight.' }))}
                >
                  <Moon size={12} className="inline mr-1" /> Midnight
                </button>
                <button
                  className="preset-pill preset-lock"
                  disabled={serverState !== 'running'}
                  title="Freeze daylight cycle"
                  onClick={() => {
                    api.Server.setDaylightCycle(false)
                      .then(() => api.Server.setTime('day'))
                      .then(() => setActionMessage({ type: 'success', text: 'Daylight cycle locked to permanent day.' }));
                  }}
                >
                  <Lock size={11} className="inline mr-1" /> Lock day
                </button>
                <button
                  className="preset-pill"
                  disabled={serverState !== 'running'}
                  title="Enable natural daylight cycle"
                  onClick={() => {
                    api.Server.setDaylightCycle(true)
                      .then(() => setActionMessage({ type: 'success', text: 'Natural daylight cycle enabled.' }));
                  }}
                >
                  <RotateCcw size={11} className="inline mr-1" /> Normal cycle
                </button>
              </div>
            </div>

            {/* Weather Controls */}
            <div className="gameplay-subcard">
              <div className="subcard-title-row">
                <CloudSun size={14} className="text-muted" />
                <span className="subcard-title">Weather control</span>
              </div>
              <p className="subcard-hint">Set weather state across active chunks.</p>
              
              <div className="weather-btn-grid">
                <button
                  className="btn-weather btn-clear d-flex items-center gap-1.5"
                  disabled={serverState !== 'running'}
                  onClick={async () => {
                    try {
                      await api.Server.setWeather('clear');
                      setActionMessage({ type: 'success', text: 'Weather cleared.' });
                    } catch (e) {
                      setActionMessage({ type: 'error', text: e.message || 'Failed to set weather' });
                    }
                  }}
                >
                  <CloudSun size={14} />
                  <span>Clear</span>
                </button>

                <button
                  className="btn-weather btn-rain d-flex items-center gap-1.5"
                  disabled={serverState !== 'running'}
                  onClick={async () => {
                    try {
                      await api.Server.setWeather('rain');
                      setActionMessage({ type: 'success', text: 'Rain enabled.' });
                    } catch (e) {
                      setActionMessage({ type: 'error', text: e.message || 'Failed to set weather' });
                    }
                  }}
                >
                  <CloudRain size={14} />
                  <span>Rain</span>
                </button>

                <button
                  className="btn-weather btn-thunder d-flex items-center gap-1.5"
                  disabled={serverState !== 'running'}
                  onClick={async () => {
                    try {
                      await api.Server.setWeather('thunder');
                      setActionMessage({ type: 'success', text: 'Thunderstorm enabled.' });
                    } catch (e) {
                      setActionMessage({ type: 'error', text: e.message || 'Failed to set weather' });
                    }
                  }}
                >
                  <CloudLightning size={14} />
                  <span>Thunder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
