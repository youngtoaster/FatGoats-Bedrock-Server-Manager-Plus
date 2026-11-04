/**
 * FatGoats Bedrock Server Manager+
 * Showcase Console & Interaction Controller
 * Standards: 9-Pass Unslop UI, high tactile response, zero battery drain.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Toast Notification System
  // ==========================================================================
  const toastEl = document.getElementById('action-toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    const labelEl = toastEl.querySelector('.toast-label') || toastEl;
    labelEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // ==========================================================================
  // 2. Real Product Telemetry Pulse (Quiet, lightweight jitter)
  // ==========================================================================
  const cpuValEl = document.getElementById('preview-cpu');
  const cpuBarEl = document.getElementById('preview-cpu-bar');
  const ramValEl = document.getElementById('preview-ram');
  const ramBarEl = document.getElementById('preview-ram-bar');

  if (cpuValEl && cpuBarEl && ramValEl && ramBarEl) {
    setInterval(() => {
      const cpu = (3.2 + Math.random() * 2.4).toFixed(1);
      cpuValEl.textContent = `${cpu}%`;
      cpuBarEl.style.width = `${Math.min(100, Math.round(parseFloat(cpu) * 5.2))}%`;

      const ram = Math.floor(472 + Math.random() * 28);
      ramValEl.textContent = `${ram} MB / 8 GB`;
      ramBarEl.style.width = `${Math.round((ram / 8192) * 100 * 3.8)}%`;
    }, 2800);
  }

  // ==========================================================================
  // 3. Live Console Terminal Stream & Direct Player Controls
  // ==========================================================================
  const terminalEl = document.getElementById('preview-terminal');
  const terminalForm = document.getElementById('preview-terminal-form');
  const terminalInput = document.getElementById('preview-input');

  function getTimestamp() {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => String(n).padStart(2, '0'))
      .join(':');
  }

  function appendTerminalLine(tag, message, tagClass = 'tag-info') {
    if (!terminalEl) return;
    const row = document.createElement('div');
    row.className = 'log-line';
    row.innerHTML = `<span class="log-time">${getTimestamp()}</span> <span class="log-tag ${tagClass}">${tag}</span> <span>${escapeHtml(message)}</span>`;
    terminalEl.appendChild(row);

    // Keep log buffer bounded to 40 lines
    while (terminalEl.children.length > 40) {
      terminalEl.removeChild(terminalEl.firstChild);
    }
    terminalEl.scrollTop = terminalEl.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Direct Player Moderation Chips
  document.querySelectorAll('.action-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const player = btn.getAttribute('data-player') || 'Player';

      if (action === 'heal') {
        appendTerminalLine('SUPERVISOR', `execute at ${player} run effect give @s instant_health 1 255 true`, 'tag-ok');
        appendTerminalLine('SERVER', `Applied 20 HP instant health restoration to ${player}`, 'tag-info');
        showToast(`Instant health applied to ${player} (20 HP)`);
      } else if (action === 'feed') {
        appendTerminalLine('SUPERVISOR', `execute at ${player} run effect give @s saturation 1 255 true`, 'tag-ok');
        appendTerminalLine('SERVER', `Food saturation replenished for ${player}`, 'tag-info');
        showToast(`Food saturation restored for ${player}`);
      } else if (action === 'kick') {
        appendTerminalLine('SECURITY', `kick ${player} "Kicked by supervisor"`, 'tag-warn');
        appendTerminalLine('SERVER', `Player ${player} disconnected cleanly`, 'tag-info');
        showToast(`Player ${player} kicked from server`);
      } else if (action === 'ban') {
        appendTerminalLine('BANLIST', `Blacklisted XUID in manager.db SQLite table`, 'tag-err');
        appendTerminalLine('SECURITY', `Player ${player} banned. Persistent rejection rule active`, 'tag-warn');
        showToast(`Player ${player} permanently banned in SQLite`);
      }
    });
  });

  // Simulated Console Command Input
  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = terminalInput.value.trim();
      if (!raw) return;
      terminalInput.value = '';

      appendTerminalLine('INPUT', raw, 'tag-ok');

      setTimeout(() => {
        const lower = raw.toLowerCase();
        if (lower.startsWith('/time')) {
          appendTerminalLine('SERVER', `Set the time to ${raw.split(' ')[2] || 'day'}`, 'tag-info');
        } else if (lower.startsWith('/weather')) {
          appendTerminalLine('SERVER', `Changing weather to clear`, 'tag-info');
        } else if (lower.startsWith('/say')) {
          appendTerminalLine('CHAT', `[Server] ${raw.slice(5)}`, 'tag-info');
        } else if (lower.startsWith('/save hold')) {
          appendTerminalLine('BACKUP', `Saving... World chunk lock held for safe snapshot`, 'tag-ok');
        } else {
          appendTerminalLine('SERVER', `Command executed via BDS IPC pipe: "${raw}"`, 'tag-info');
        }
      }, 140);
    });
  }

  // ==========================================================================
  // 4. 1-Click Addon Auto-Installer Pipeline Simulation
  // ==========================================================================
  const dropzone = document.getElementById('addon-sim-dropzone');
  const pipelineStatus = document.getElementById('pipeline-status');
  const pipelineProgress = document.getElementById('pipeline-progress-fill');
  const completeNotice = document.getElementById('pipeline-complete-notice');

  const steps = [
    {
      row: document.getElementById('p-step-1'),
      badge: document.getElementById('p-step-1-state'),
      activeText: 'Decompressing...',
      doneText: 'Unpacked (140ms)'
    },
    {
      row: document.getElementById('p-step-2'),
      badge: document.getElementById('p-step-2-state'),
      activeText: 'Reading manifest...',
      doneText: 'Parsed (UUID ok)'
    },
    {
      row: document.getElementById('p-step-3'),
      badge: document.getElementById('p-step-3-state'),
      activeText: 'Splitting packs...',
      doneText: 'Separated BP/RP'
    },
    {
      row: document.getElementById('p-step-4'),
      badge: document.getElementById('p-step-4-state'),
      activeText: 'Injecting JSON...',
      doneText: 'Registered (LevelDB ok)'
    }
  ];

  let isPipelineBusy = false;

  if (dropzone) {
    dropzone.addEventListener('click', () => {
      if (isPipelineBusy) return;
      isPipelineBusy = true;

      // Reset previous state
      if (completeNotice) completeNotice.style.display = 'none';
      if (pipelineProgress) pipelineProgress.style.width = '0%';
      if (pipelineStatus) pipelineStatus.textContent = 'Processing...';

      steps.forEach(s => {
        if (s.row) s.row.classList.remove('active', 'done');
        if (s.badge) s.badge.textContent = 'Pending';
      });

      // Step 1: Decompress
      runStep(0, 25, () => {
        // Step 2: Manifest
        runStep(1, 50, () => {
          // Step 3: Split BP / RP
          runStep(2, 75, () => {
            // Step 4: World Registration
            runStep(3, 100, () => {
              if (pipelineStatus) pipelineStatus.textContent = 'Complete (0.84s)';
              if (completeNotice) completeNotice.style.display = 'flex';
              showToast('TrueWeapons.mcaddon installed and registered in 0.84s');
              isPipelineBusy = false;
            });
          });
        });
      });
    });
  }

  function runStep(index, progressPct, next) {
    const s = steps[index];
    if (s && s.row) s.row.classList.add('active');
    if (s && s.badge) s.badge.textContent = s.activeText;
    if (pipelineProgress) pipelineProgress.style.width = `${progressPct}%`;

    const delay = 180 + Math.floor(Math.random() * 50);
    setTimeout(() => {
      if (s && s.row) {
        s.row.classList.remove('active');
        s.row.classList.add('done');
      }
      if (s && s.badge) s.badge.textContent = s.doneText;
      next();
    }, delay);
  }

  // ==========================================================================
  // 5. Interactive FAQ Accordion
  // ==========================================================================
  document.querySelectorAll('.faq-row').forEach(row => {
    const trigger = row.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');
      // Single expansion accordion
      document.querySelectorAll('.faq-row').forEach(r => r.classList.remove('open'));
      if (!isOpen) {
        row.classList.add('open');
      }
    });
  });

  // ==========================================================================
  // 6. Fast Clipboard Copy on Quickstart Code Rows
  // ==========================================================================
  document.querySelectorAll('.copy-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(() => {
            btn.textContent = original;
          }, 1800);
          showToast('Copied to clipboard');
        }).catch(() => {
          fallbackCopy(text, btn);
        });
      } else {
        fallbackCopy(text, btn);
      }
    });
  });

  function fallbackCopy(text, btn) {
    const input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      const original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => {
        btn.textContent = original;
      }, 1800);
      showToast('Copied to clipboard');
    } catch (e) {
      showToast('Could not copy automatically');
    }
    document.body.removeChild(input);
  }

  // ==========================================================================
  // 7. Accessible Smooth In-Page Anchor Navigation
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
