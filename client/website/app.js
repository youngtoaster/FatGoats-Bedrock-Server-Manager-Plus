/* ==========================================================================
   FatGoats Bedrock Server Manager+ — Showcase Interactive Engine
   Interactive Dashboard Simulator, 3D Canvas Voxels, Web Audio, Tilt Physics
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Web Audio API Sound Synthesizer (Zero external audio files)
  // ==========================================================================
  let audioEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function soundClick() {
    playTone(800, 'triangle', 0.08, 0.08);
  }

  function soundHeal() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sine', 0.25, 0.08), idx * 60);
      });
    } catch (_) {}
  }

  function soundFeed() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      [440, 554.37, 659.25].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'triangle', 0.2, 0.08), idx * 70);
      });
    } catch (_) {}
  }

  function soundBan() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      playTone(180, 'sawtooth', 0.35, 0.15);
      setTimeout(() => playTone(110, 'sawtooth', 0.45, 0.2), 100);
    } catch (_) {}
  }

  // Audio Toggle Button
  const audioToggle = document.getElementById('audio-toggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      audioToggle.textContent = audioEnabled ? '🔊' : '🔇';
      showToast(audioEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted', 'info');
      if (audioEnabled) soundClick();
    });
  }

  // ==========================================================================
  // 2. Interactive Toast System
  // ==========================================================================
  const toastEl = document.getElementById('showcase-toast');
  let toastTimer = null;

  window.showToast = function (message, type = 'success') {
    if (!toastEl) return;
    const icons = {
      success: '✓',
      heal: '💖',
      feed: '🍖',
      ban: '🚫',
      kick: '👢',
      info: 'ℹ️',
      error: '⚠️'
    };
    const icon = icons[type] || '✓';
    toastEl.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  };

  // ==========================================================================
  // 3. Canvas 3D Floating Voxel & Starfield Particle Engine
  // ==========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    });

    // Particles
    const particles = [];
    const particleCount = Math.min(65, Math.floor(width / 22));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.6,
        color: ['rgba(16, 185, 129, 0.6)', 'rgba(6, 182, 212, 0.5)', 'rgba(99, 102, 241, 0.4)'][Math.floor(Math.random() * 3)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    // Floating Minecraft Voxel Cubes
    const cubes = [
      { x: width * 0.15, y: height * 0.25, size: 28, rot: 0.2, rotSpeed: 0.006, colorTop: '#34d399', colorLeft: '#10b981', colorRight: '#059669', type: 'emerald' },
      { x: width * 0.85, y: height * 0.35, size: 34, rot: 1.2, rotSpeed: -0.005, colorTop: '#38bdf8', colorLeft: '#0284c7', colorRight: '#0369a1', type: 'diamond' },
      { x: width * 0.82, y: height * 0.8, size: 26, rot: 2.1, rotSpeed: 0.007, colorTop: '#f87171', colorLeft: '#ef4444', colorRight: '#b91c1c', type: 'redstone' },
      { x: width * 0.18, y: height * 0.75, size: 32, rot: 0.8, rotSpeed: -0.006, colorTop: '#475569', colorLeft: '#334155', colorRight: '#1e293b', type: 'bedrock' },
    ];

    function drawIsometricCube(cx, cy, size, angle, cTop, cLeft, cRight) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.15);

      const h = size * 0.58;
      const w = size;

      // Top Face
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(w, -h * 0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(-w, -h * 0.5);
      ctx.closePath();
      ctx.fillStyle = cTop;
      ctx.fill();

      // Left Face
      ctx.beginPath();
      ctx.moveTo(-w, -h * 0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(0, h);
      ctx.lineTo(-w, h * 0.5);
      ctx.closePath();
      ctx.fillStyle = cLeft;
      ctx.fill();

      // Right Face
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, -h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = cRight;
      ctx.fill();

      ctx.restore();
    }

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Draw background particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // Draw connecting faint constellations
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw floating voxel cubes with mouse reaction
      for (const cube of cubes) {
        cube.rot += cube.rotSpeed;
        const offsetX = (mouseX - width / 2) * 0.025;
        const offsetY = (mouseY - height / 2) * 0.025;
        const bob = Math.sin(Date.now() * 0.0015 + cube.size) * 12;

        drawIsometricCube(
          cube.x + offsetX,
          cube.y + offsetY + bob,
          cube.size,
          cube.rot,
          cube.colorTop,
          cube.colorLeft,
          cube.colorRight
        );
      }

      requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }

  // ==========================================================================
  // 4. Interactive Live Dashboard Simulator (State Machine)
  // ==========================================================================
  const simState = {
    serverStatus: 'running', // 'running' | 'stopped' | 'starting'
    tps: 20.0,
    cpuPercent: 4.2,
    ramMb: 890,
    players: [
      { id: 'p1', name: 'AlexGamer', role: 'operator', ping: '18ms', isOp: true, isBanned: false },
      { id: 'p2', name: 'SteveCraft', role: 'member', ping: '32ms', isOp: false, isBanned: false },
      { id: 'p3', name: 'DiamondKing', role: 'member', ping: '24ms', isOp: false, isBanned: false },
      { id: 'p4', name: 'GriefBot99', role: 'visitor', ping: '120ms', isOp: false, isBanned: false }
    ],
    banned: [
      { name: 'XrayCheater', reason: 'Unfair Advantage (X-Ray)', date: 'Oct 26' }
    ],
    activeTab: 'overview',
    worldSeed: '420691337',
    worldType: 'DEFAULT'
  };

  const statusIndicator = document.getElementById('sim-status-circle');
  const statusText = document.getElementById('sim-status-text');
  const powerBtn = document.getElementById('sim-power-btn');
  const terminalScreen = document.getElementById('sim-terminal');
  const cmdInput = document.getElementById('sim-cmd-input');
  const cmdSubmit = document.getElementById('sim-cmd-submit');
  const playerListBody = document.getElementById('sim-player-tbody');
  const teleTps = document.getElementById('tele-tps');
  const teleCpu = document.getElementById('tele-cpu');
  const teleRam = document.getElementById('tele-ram');

  function logTerminal(text, type = 'info') {
    if (!terminalScreen) return;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    line.innerHTML = `<span style="color: #64748b;">[${time}]</span> ${text}`;
    terminalScreen.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  }

  function updateServerPowerUI() {
    if (!statusIndicator || !statusText || !powerBtn) return;
    statusIndicator.className = `sim-status-circle ${simState.serverStatus}`;
    if (simState.serverStatus === 'running') {
      statusText.textContent = 'RUNNING';
      statusText.style.color = '#34d399';
      powerBtn.innerHTML = '🛑 Stop Server';
      powerBtn.className = 'btn btn-sm btn-secondary';
    } else if (simState.serverStatus === 'starting') {
      statusText.textContent = 'STARTING...';
      statusText.style.color = '#fbbf24';
      powerBtn.innerHTML = '⏳ Starting...';
      powerBtn.className = 'btn btn-sm btn-secondary';
    } else {
      statusText.textContent = 'STOPPED';
      statusText.style.color = '#ef4444';
      powerBtn.innerHTML = '▶️ Start Server';
      powerBtn.className = 'btn btn-sm btn-primary';
    }
  }

  if (powerBtn) {
    powerBtn.addEventListener('click', () => {
      soundClick();
      if (simState.serverStatus === 'running') {
        simState.serverStatus = 'stopped';
        logTerminal('Sending "stop" command to Bedrock Dedicated Server stdin...', 'warn');
        logTerminal('Player disconnected: All players saved cleanly.', 'info');
        logTerminal('Server stopped successfully. Port 19132 released.', 'error');
        simState.tps = 0.0;
        simState.cpuPercent = 0.0;
        simState.ramMb = 0;
        updateServerPowerUI();
        renderPlayerList();
        showToast('Server Stopped', 'info');
      } else if (simState.serverStatus === 'stopped') {
        simState.serverStatus = 'starting';
        updateServerPowerUI();
        logTerminal('Spawning native process: bedrock_server.exe', 'cmd');
        logTerminal('Loaded properties from server.properties (level-name: "Bedrock level")', 'info');
        logTerminal('IPv4 supported: 0.0.0.0:19132', 'info');
        setTimeout(() => {
          simState.serverStatus = 'running';
          simState.tps = 20.0;
          simState.cpuPercent = 3.8;
          simState.ramMb = 870;
          updateServerPowerUI();
          logTerminal('Server started. Bedrock Dedicated Server v1.21.30 online!', 'success');
          renderPlayerList();
          showToast('Bedrock Server Online!', 'success');
        }, 1200);
      }
    });
  }

  // Render Simulator Players Table
  function renderPlayerList() {
    if (!playerListBody) return;
    playerListBody.innerHTML = '';

    const activePlayers = simState.players.filter(p => !p.isBanned);

    if (simState.serverStatus !== 'running') {
      playerListBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2.5rem; color: #64748b;">
        🎮 Server is offline. Click <strong>"Start Server"</strong> above to simulate connected Bedrock players.
      </td></tr>`;
      return;
    }

    if (activePlayers.length === 0) {
      playerListBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #94a3b8;">
        All players disconnected or banned.
      </td></tr>`;
      return;
    }

    activePlayers.forEach((player) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="sim-player-cell">
            <div class="sim-avatar">${player.name.charAt(0)}</div>
            <div>
              <div style="font-weight: 700; color: #fff;">${player.name}</div>
              <div style="font-size: 0.7rem; color: #10b981;">● Online (${player.ping})</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; ${player.isOp ? 'background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);' : 'background: rgba(255,255,255,0.05); color: #94a3b8;'}">
            ${player.isOp ? '👑 Operator' : '🛡️ Member'}
          </span>
        </td>
        <td>
          <span style="color: #34d399; font-weight: 700; font-size: 0.8rem;">✓ Allowed</span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.4rem; flex-wrap: wrap; justify-content: flex-end;">
            <button class="btn-chip btn-chip-heal" data-action="heal" data-player="${player.name}" title="Instant Health">💖 Heal</button>
            <button class="btn-chip btn-chip-feed" data-action="feed" data-player="${player.name}" title="Instant Food & Saturation">🍖 Feed</button>
            <button class="btn-chip btn-chip-kick" data-action="kick" data-player="${player.name}" title="Kick from server">👢 Kick</button>
            <button class="btn-chip btn-chip-ban" data-action="ban" data-player="${player.name}" title="Ban and block reconnection">🚫 Ban</button>
          </div>
        </td>
      `;
      playerListBody.appendChild(tr);
    });

    // Attach Action Listeners
    playerListBody.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        const pName = e.currentTarget.getAttribute('data-player');

        if (action === 'heal') {
          soundHeal();
          logTerminal(`effect "${pName}" heal 1 255 true`, 'cmd');
          logTerminal(`💖 Instantly healed ${pName} to maximum health!`, 'heal');
          showToast(`Healed ${pName} to full 20 HP!`, 'heal');
        } else if (action === 'feed') {
          soundFeed();
          logTerminal(`effect "${pName}" saturation 1 255 true`, 'cmd');
          logTerminal(`🍖 Instantly restored food & saturation for ${pName}!`, 'feed');
          showToast(`Full hunger & saturation for ${pName}!`, 'feed');
        } else if (action === 'kick') {
          soundClick();
          logTerminal(`kick "${pName}" "Kicked by administrator"`, 'cmd');
          logTerminal(`👢 Player ${pName} was kicked from the server.`, 'warn');
          simState.players = simState.players.filter(p => p.name !== pName);
          renderPlayerList();
          showToast(`Kicked ${pName} from server`, 'kick');
        } else if (action === 'ban') {
          soundBan();
          logTerminal(`kick "${pName}" "Banned: Unfair Advantage"`, 'cmd');
          logTerminal(`🚫 Player "${pName}" banned. Added to banned-players.json and blocked from reconnecting.`, 'error');
          simState.players = simState.players.filter(p => p.name !== pName);
          simState.banned.push({ name: pName, reason: 'Banned by admin', date: 'Just now' });
          renderPlayerList();
          showToast(`Banned ${pName} and blocked reconnection!`, 'ban');
        }
      });
    });
  }

  // Simulator Tab Switcher
  const tabButtons = document.querySelectorAll('.sim-tab-btn');
  const simViews = {
    overview: document.getElementById('view-overview'),
    console: document.getElementById('view-console'),
    worldgen: document.getElementById('view-worldgen'),
    players: document.getElementById('view-players'),
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      soundClick();
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetView = btn.getAttribute('data-view');
      Object.keys(simViews).forEach(key => {
        if (simViews[key]) {
          simViews[key].style.display = key === targetView ? 'block' : 'none';
        }
      });
      simState.activeTab = targetView;
    });
  });

  // Simulator Random Seed Generator
  const randomSeedBtn = document.getElementById('sim-random-seed-btn');
  const seedInput = document.getElementById('sim-seed-input');
  if (randomSeedBtn && seedInput) {
    randomSeedBtn.addEventListener('click', () => {
      soundClick();
      const newSeed = Math.floor(Math.random() * 8999999999 + 1000000000).toString();
      seedInput.value = newSeed;
      simState.worldSeed = newSeed;
      showToast(`🎲 Generated World Seed: ${newSeed}`, 'info');
      logTerminal(`Generated new world seed parameter: ${newSeed}`, 'info');
    });
  }

  // Simulator Command Input
  function handleCommandSend() {
    if (!cmdInput) return;
    const val = cmdInput.value.trim();
    if (!val) return;
    soundClick();
    logTerminal(val.startsWith('/') ? val.substring(1) : val, 'cmd');
    cmdInput.value = '';

    const lower = val.toLowerCase();
    if (lower.includes('heal')) {
      soundHeal();
      logTerminal('Applied instant health amplifier 255.', 'heal');
    } else if (lower.includes('saturation') || lower.includes('feed')) {
      soundFeed();
      logTerminal('Applied saturation amplifier 255.', 'feed');
    } else if (lower.includes('help')) {
      logTerminal('Commands: /op, /deop, /kick, /ban, /effect, /time set, /weather, /whitelist, /list', 'info');
    } else if (lower.includes('list')) {
      logTerminal(`Online players (${simState.players.length}): ${simState.players.map(p => p.name).join(', ')}`, 'info');
    } else {
      logTerminal('Command executed successfully.', 'success');
    }
  }

  if (cmdSubmit) cmdSubmit.addEventListener('click', handleCommandSend);
  if (cmdInput) {
    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCommandSend();
    });
  }

  // Initial Simulator Setup
  updateServerPowerUI();
  renderPlayerList();
  logTerminal('FatGoats Bedrock Server Manager+ v1.2.3 initialized.', 'info');
  logTerminal('Ready for commands and player telemetry.', 'success');

  // ==========================================================================
  // 5. Live Telemetry Mini Waveforms
  // ==========================================================================
  function animateTelemetry() {
    ['tps-canvas', 'cpu-canvas', 'ram-canvas'].forEach((canvasId) => {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx2 = c.getContext('2d');
      const w = (c.width = c.clientWidth);
      const h = (c.height = c.clientHeight);

      ctx2.clearRect(0, 0, w, h);
      ctx2.beginPath();

      const isRunning = simState.serverStatus === 'running';
      const time = Date.now() * 0.003;

      for (let x = 0; x < w; x++) {
        let y = h / 2;
        if (isRunning) {
          if (canvasId === 'tps-canvas') {
            y = h / 2 + Math.sin(x * 0.08 + time) * 3;
          } else if (canvasId === 'cpu-canvas') {
            y = h / 2 + Math.sin(x * 0.15 + time * 1.5) * 8 + Math.cos(x * 0.05 + time) * 6;
          } else {
            y = h / 2 + Math.sin(x * 0.04 + time * 0.5) * 4;
          }
        }
        if (x === 0) ctx2.moveTo(x, y);
        else ctx2.lineTo(x, y);
      }

      ctx2.strokeStyle = canvasId === 'tps-canvas' ? '#10b981' : canvasId === 'cpu-canvas' ? '#06b6d4' : '#8b5cf6';
      ctx2.lineWidth = 2;
      ctx2.stroke();
    });

    if (simState.serverStatus === 'running') {
      if (teleTps) teleTps.textContent = (20.0 + (Math.sin(Date.now() * 0.001) * 0.05)).toFixed(1);
      if (teleCpu) teleCpu.textContent = `${Math.max(1.8, (simState.cpuPercent + Math.sin(Date.now() * 0.002) * 1.2)).toFixed(1)}%`;
      if (teleRam) teleRam.textContent = `${Math.round(simState.ramMb + Math.sin(Date.now() * 0.0005) * 20)} MB`;
    }

    requestAnimationFrame(animateTelemetry);
  }
  requestAnimationFrame(animateTelemetry);

  // ==========================================================================
  // 6. Bento Card 3D Tilt Physics & Glare Spotlight
  // ==========================================================================
  document.querySelectorAll('.bento-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // ==========================================================================
  // 7. Interactive FAQ Accordion
  // ==========================================================================
  document.querySelectorAll('.faq-card').forEach((card) => {
    const header = card.querySelector('.faq-header');
    if (header) {
      header.addEventListener('click', () => {
        soundClick();
        const isOpen = card.classList.contains('open');
        document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('open'));
        if (!isOpen) {
          card.classList.add('open');
        }
      });
    }
  });

  // ==========================================================================
  // 8. One-Click Copy Buttons
  // ==========================================================================
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      soundClick();
      const code = btn.getAttribute('data-copy');
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          showToast('Copied to Clipboard!', 'success');
        });
      }
    });
  });

})();
