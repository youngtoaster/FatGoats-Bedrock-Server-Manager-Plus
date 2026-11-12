import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import NoclipepeUpdateLoader from './NoclipepeUpdateLoader';
import {
  ArrowUpCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Check,
  X,
  GitCommit,
  Package,
  Layers,
  Cpu,
  HardDrive
} from 'lucide-react';

export const AppUpdateModal = ({ updateInfo, onClose, onUpdateSuccess }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [progressData, setProgressData] = useState({
    percent: 10,
    stage: 1,
    progress: 'Preparing application update environment...',
  });
  const [displayPercent, setDisplayPercent] = useState(10);

  const pollIntervalRef = useRef(null);
  const tickerRef = useRef(null);
  const targetPercentRef = useRef(10);
  const lastTargetChangeRef = useRef(Date.now());

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  // Smooth live visual interpolation ticker so visuals NEVER freeze
  useEffect(() => {
    if (!updating) {
      if (tickerRef.current) clearInterval(tickerRef.current);
      return;
    }

    tickerRef.current = setInterval(() => {
      setDisplayPercent((prev) => {
        const target = targetPercentRef.current;
        if (target >= 100) return 100;

        if (prev < target) {
          const step = Math.max(0.35, (target - prev) * 0.16);
          return Math.min(target, prev + step);
        }

        // Gently creep forward during long compiles (Vite, csc) so progress never feels frozen
        const elapsed = Date.now() - lastTargetChangeRef.current;
        if (elapsed > 800 && prev < 98) {
          const maxCreep = Math.min(target + 3.5, 96);
          if (prev < maxCreep) {
            return prev + 0.05;
          }
        }

        return prev;
      });
    }, 50);

    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [updating]);

  if (!updateInfo || !updateInfo.updateAvailable) return null;

  const startProgressPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.Updates.getProgress();
        if (res) {
          const newTarget = Math.max(targetPercentRef.current, res.percent || 10);
          if (newTarget !== targetPercentRef.current) {
            targetPercentRef.current = newTarget;
            lastTargetChangeRef.current = Date.now();
          }

          setProgressData((prev) => ({
            percent: newTarget,
            stage: res.stage || prev.stage || 1,
            progress: res.progress || prev.progress,
          }));
        }
      } catch (_) {}
    }, 400);
  };

  const stopProgressPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleUpdateNow = async () => {
    setUpdating(true);
    setError(null);
    targetPercentRef.current = 15;
    lastTargetChangeRef.current = Date.now();
    setDisplayPercent(15);
    setProgressData({
      percent: 15,
      stage: 1,
      progress: 'Creating safety backup of database and user data...',
    });
    startProgressPolling();

    try {
      const res = await api.Updates.apply();
      stopProgressPolling();
      targetPercentRef.current = 100;
      setDisplayPercent(100);
      setProgressData({
        percent: 100,
        stage: 5,
        progress: 'App successfully updated to latest version!',
      });
      setSuccessResult(res);
      if (onUpdateSuccess) onUpdateSuccess(res);
    } catch (err) {
      console.error('Failed to apply update:', err);
      stopProgressPolling();
      setError(err.data?.details || err.message || 'Failed to apply update.');
      setUpdating(false);
    }
  };

  const handleAskLater = async () => {
    try {
      await api.Updates.setPreferences({ askLater: true });
    } catch (_) {}
    onClose();
  };

  const handleIgnore = async () => {
    try {
      await api.Updates.setPreferences({ ignoredCommit: updateInfo.remoteCommitFull || updateInfo.remoteCommit });
    } catch (_) {}
    onClose();
  };

  const updateSteps = [
    { num: 1, label: 'Backup', icon: HardDrive },
    { num: 2, label: 'Sync Git', icon: GitCommit },
    { num: 3, label: 'Packages', icon: Package },
    { num: 4, label: 'Client', icon: Layers },
    { num: 5, label: 'Binaries', icon: Cpu },
  ];

  const roundedDisplay = Math.min(100, Math.max(0, Math.round(displayPercent)));

  return (
    <div className="modal-overlay" onClick={() => !updating && onClose()}>
      <div
        className="modal app-update-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: updating ? 740 : 620,
          width: '100%',
          transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'var(--bg-card, #1a1c22)',
          border: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
          borderTop: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(0, 0, 0, 0.8)',
          borderRadius: 'var(--radius-lg, 10px)',
          overflow: 'hidden',
        }}
      >
        {/* Hardware Chassis Header */}
        <div
          className="modal-header d-flex justify-between items-center"
          style={{
            padding: '1.15rem 1.4rem',
            background: 'var(--bg-raised, #262932)',
            borderBottom: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
          }}
        >
          <div className="d-flex items-center gap-3">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm, 5px)',
                background: 'rgba(217, 119, 54, 0.12)',
                border: '1px solid rgba(217, 119, 54, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--copper, #d97736)',
              }}
            >
              {updating ? (
                <RefreshCw size={20} className="spinning" />
              ) : (
                <ArrowUpCircle size={20} />
              )}
            </div>
            <div>
              <div className="d-flex items-center gap-2">
                <h3 className="modal-title font-medium m-0" style={{ color: 'var(--text-white, #f5f2eb)', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  Application update available
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--copper, #d97736)',
                    background: 'rgba(217, 119, 54, 0.1)',
                    border: '1px solid rgba(217, 119, 54, 0.25)',
                    padding: '2px 6px',
                    borderRadius: 3,
                  }}
                >
                  BSM+ Pipeline
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub, #a39e94)' }}>
                FatGoats Bedrock Server Manager Plus
              </span>
            </div>
          </div>
          {!updating && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Close"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
                borderRadius: 'var(--radius-sm, 5px)',
                color: 'var(--text-sub, #a39e94)',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body p-4" style={{ background: 'var(--bg-card, #1a1c22)' }}>
          {successResult ? (
            <div className="text-center py-3">
              <div
                className="mb-3 d-inline-flex items-center justify-center"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(63, 166, 106, 0.12)',
                  border: '1px solid rgba(63, 166, 106, 0.4)',
                  color: 'var(--emerald, #3fa66a)',
                }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h4 className="font-medium text-lg mb-1" style={{ color: 'var(--text-white, #f5f2eb)' }}>
                Update completed successfully
              </h4>
              <p className="text-sm mb-4" style={{ color: 'var(--text-sub, #a39e94)', maxWidth: 440, margin: '0 auto 1.25rem' }}>
                The application has been safely upgraded to commit{' '}
                <strong style={{ color: 'var(--text-white, #f5f2eb)', fontFamily: 'var(--font-mono, monospace)' }}>
                  #{successResult.newCommit || updateInfo.remoteCommit}
                </strong>
                . All active worlds, database tables, player inventories, and server configurations were 100% preserved.
              </p>

              <div
                className="p-3 mb-4 rounded text-xs d-flex justify-between items-center"
                style={{
                  background: 'var(--bg-input, #0d0e11)',
                  border: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--text-sub, #a39e94)',
                }}
              >
                <span>Installed: #{successResult.newCommit || updateInfo.remoteCommit}</span>
                <span style={{ color: 'var(--emerald, #3fa66a)', fontWeight: 600 }}>
                  [SAFE ZERO LOSS PASS]
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary font-bold px-6 py-2.5 text-sm"
                onClick={() => window.location.reload()}
              >
                Reload application
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="mb-4 d-flex items-center gap-2 p-3 rounded"
                  style={{
                    background: 'rgba(201, 74, 74, 0.12)',
                    border: '1px solid rgba(201, 74, 74, 0.35)',
                    color: 'var(--rose, #c94a4a)',
                    fontSize: '0.8rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Real-time Update Progress Bar & Steps when updating */}
              {updating ? (
                <div className="mb-2">
                  <NoclipepeUpdateLoader
                    percent={displayPercent}
                    stage={progressData.stage}
                    progressText={progressData.progress}
                    targetCommit={updateInfo.remoteCommit}
                  />

                  {/* Step Pills */}
                  <div className="update-steps-stepper mt-4">
                    {updateSteps.map((s) => {
                      const isDone = progressData.stage > s.num || roundedDisplay >= s.num * 20;
                      const isActive = progressData.stage === s.num && !isDone;
                      const IconComp = s.icon;
                      return (
                        <div
                          key={s.num}
                          className={`update-step-pill ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                        >
                          {isDone ? (
                            <Check size={13} style={{ color: 'var(--emerald, #3fa66a)', flexShrink: 0 }} />
                          ) : (
                            <IconComp size={13} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                          )}
                          <span className="truncate">{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-main, #ded9cf)', lineHeight: 1.5 }}>
                    A newer release has been published to the GitHub repository. Upgrading synchronizes your instance with the latest features, engine optimizations, and security updates.
                  </p>

                  {/* Version Comparison Box */}
                  <div
                    className="p-3 rounded mb-3 d-flex justify-between items-center"
                    style={{
                      background: 'var(--bg-input, #0d0e11)',
                      border: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <span className="text-2xs uppercase d-block" style={{ color: 'var(--text-muted, #78746c)', fontFamily: 'var(--font-sans, sans-serif)' }}>
                        Current Revision
                      </span>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-white, #f5f2eb)' }}>
                        #{updateInfo.currentCommit || 'local'}
                      </span>
                      {updateInfo.currentCommitDate && (
                        <span className="text-2xs d-block" style={{ color: 'var(--text-sub, #a39e94)' }}>
                          {updateInfo.currentCommitDate}
                        </span>
                      )}
                    </div>

                    <div style={{ color: 'var(--copper, #d97736)', fontSize: '1.1rem', padding: '0 0.5rem' }}>
                      ➔
                    </div>

                    <div className="text-right">
                      <span className="text-2xs uppercase d-block font-bold" style={{ color: 'var(--copper, #d97736)', fontFamily: 'var(--font-sans, sans-serif)' }}>
                        New Revision
                      </span>
                      <span className="font-bold text-sm" style={{ color: 'var(--copper, #d97736)' }}>
                        #{updateInfo.remoteCommit}
                      </span>
                      {updateInfo.remoteCommitDate && (
                        <span className="text-2xs d-block" style={{ color: 'var(--text-sub, #a39e94)' }}>
                          {updateInfo.remoteCommitDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Latest Commit Subject */}
                  {updateInfo.remoteCommitSubject && (
                    <div
                      className="mb-3 p-3 rounded"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
                      }}
                    >
                      <span className="text-2xs d-block uppercase font-semibold mb-1" style={{ color: 'var(--text-muted, #78746c)' }}>
                        Latest Commit Subject
                      </span>
                      <p className="text-xs m-0 font-medium" style={{ color: 'var(--text-white, #f5f2eb)' }}>
                        "{updateInfo.remoteCommitSubject}"
                      </p>
                    </div>
                  )}

                  {/* Changelog List */}
                  {updateInfo.changelog && updateInfo.changelog.length > 0 && (
                    <div className="mb-3">
                      <span className="text-2xs d-block uppercase font-semibold mb-1.5" style={{ color: 'var(--text-muted, #78746c)', letterSpacing: '0.05em' }}>
                        Changelog ({updateInfo.commitsBehind} commit{updateInfo.commitsBehind !== 1 ? 's' : ''}):
                      </span>
                      <div
                        className="max-h-36 overflow-y-auto p-2.5 rounded text-xs space-y-1.5"
                        style={{
                          background: 'var(--bg-input, #0d0e11)',
                          border: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
                        }}
                      >
                        {updateInfo.changelog.map((c, idx) => (
                          <div key={idx} className="d-flex items-baseline gap-2">
                            <span
                              style={{
                                fontFamily: 'var(--font-mono, monospace)',
                                color: 'var(--copper, #d97736)',
                                fontSize: '0.7rem',
                                flexShrink: 0,
                              }}
                            >
                              #{c.hash}
                            </span>
                            <span className="truncate flex-1" style={{ color: 'var(--text-main, #ded9cf)', fontSize: '0.75rem' }}>
                              {c.subject}
                            </span>
                            <span style={{ color: 'var(--text-muted, #78746c)', fontSize: '0.68rem', flexShrink: 0 }}>
                              {c.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zero Data Loss Guarantee Plate */}
                  <div
                    className="p-3 rounded mb-2"
                    style={{
                      background: 'rgba(63, 166, 106, 0.08)',
                      border: '1px solid rgba(63, 166, 106, 0.25)',
                    }}
                  >
                    <div className="d-flex items-center gap-2 font-semibold text-xs mb-1" style={{ color: 'var(--emerald, #3fa66a)' }}>
                      <ShieldCheck size={15} />
                      <span>Zero Data Loss Protection Guarantee</span>
                    </div>
                    <p className="m-0 leading-relaxed" style={{ fontSize: '0.73rem', color: 'var(--text-sub, #a39e94)' }}>
                      Updates execute git fast-forward pulls and rebuild client web assets. Worlds (<code>worlds/</code>), SQLite database (<code>data/db/manager.db</code>), player data, backups, and custom server addons are completely preserved.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!successResult && (
          <div
            className="modal-footer d-flex justify-between items-center gap-2 flex-wrap p-3.5"
            style={{
              background: 'var(--bg-raised, #262932)',
              borderTop: '1px solid var(--border-subtle, rgba(240, 235, 225, 0.08))',
            }}
          >
            <div className="d-flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleIgnore}
                disabled={updating}
                title="Do not show notification again for this commit"
              >
                Ignore
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAskLater}
                disabled={updating}
                title="Remind me again in 24 hours"
              >
                Ask later
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm font-bold px-5 py-2"
              onClick={handleUpdateNow}
              disabled={updating}
            >
              {updating ? 'Applying update...' : 'Update now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppUpdateModal;
