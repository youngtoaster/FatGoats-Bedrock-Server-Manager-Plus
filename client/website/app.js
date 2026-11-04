/* ==========================================================================
   FatGoats Bedrock Server Manager+ — Master Showcase Visual & Motion Engine
   Libraries & Patterns: UsePlanes, React Bits, Godly, & Modern Web Guidance
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Toast Notification System
  // ==========================================================================
  const toastEl = document.getElementById('showcase-toast');
  let toastTimer = null;

  window.showToast = function (message, type = 'success') {
    if (!toastEl) return;
    const msgEl = toastEl.querySelector('.toast-message');
    if (msgEl) msgEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  };

  // ==========================================================================
  // 2. 3D Canvas Voxel Engine & Constellation Particles
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

    // Particle nodes
    const particles = [];
    const particleCount = Math.min(50, Math.floor(width / 26));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        color: ['rgba(16, 185, 129, 0.4)', 'rgba(56, 189, 248, 0.35)', 'rgba(168, 85, 247, 0.25)'][Math.floor(Math.random() * 3)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      });
    }

    // Floating Minecraft Voxel Cubes
    const cubes = [
      { x: width * 0.12, y: height * 0.24, size: 26, rot: 0.2, rotSpeed: 0.005, colorTop: '#34d399', colorLeft: '#10b981', colorRight: '#059669' },
      { x: width * 0.88, y: height * 0.32, size: 30, rot: 1.2, rotSpeed: -0.004, colorTop: '#38bdf8', colorLeft: '#0284c7', colorRight: '#0369a1' },
      { x: width * 0.84, y: height * 0.76, size: 24, rot: 2.1, rotSpeed: 0.006, colorTop: '#f87171', colorLeft: '#ef4444', colorRight: '#b91c1c' },
      { x: width * 0.14, y: height * 0.74, size: 28, rot: 0.8, rotSpeed: -0.005, colorTop: '#475569', colorLeft: '#334155', colorRight: '#1e293b' },
    ];

    function drawIsometricCube(cx, cy, size, angle, cTop, cLeft, cRight) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.12);

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

      // Lerp mouse easing
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

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw voxels
      for (const cube of cubes) {
        cube.rot += cube.rotSpeed;
        const offsetX = (mouseX - width / 2) * 0.02;
        const offsetY = (mouseY - height / 2) * 0.02;
        const bob = Math.sin(Date.now() * 0.0014 + cube.size) * 10;

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
  // 3. Spotlight Cards Cursor Tracking (React Bits)
  // ==========================================================================
  document.querySelectorAll('.spotlight-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ==========================================================================
  // 4. Decrypted Text Effect (React Bits)
  // ==========================================================================
  const chars = '0123456789ABCDEF!#%&*<>_';
  function scrambleText(element) {
    const original = element.getAttribute('data-original') || element.textContent;
    let iteration = 0;
    const interval = setInterval(() => {
      element.textContent = original
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration) return original[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= original.length) {
        clearInterval(interval);
      }
      iteration += 1.5;
    }, 28);
  }

  document.querySelectorAll('.decrypted-text').forEach((el) => {
    scrambleText(el);
    el.addEventListener('mouseenter', () => scrambleText(el));
  });

  // ==========================================================================
  // 5. Magnetic Buttons Physics (UsePlanes)
  // ==========================================================================
  document.querySelectorAll('.magnetic-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
      btn.style.transform = `translate(${x}px, ${y}px) translateY(-1px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px) translateY(0px)';
    });
  });

  // ==========================================================================
  // 6. Floating Island Navbar Gliding Magnetic Pill Tracker (Navbar Gallery)
  // ==========================================================================
  const tracker = document.getElementById('nav-pill-tracker');
  const navItems = document.querySelectorAll('.nav-links .nav-item');

  function moveTracker(target) {
    if (!tracker || !target) return;
    const rect = target.getBoundingClientRect();
    const parentRect = target.parentElement.parentElement.getBoundingClientRect();
    const offsetLeft = rect.left - parentRect.left;
    tracker.style.width = `${rect.width}px`;
    tracker.style.transform = `translateX(${offsetLeft}px)`;
    tracker.style.opacity = '1';
  }

  navItems.forEach((item) => {
    item.addEventListener('mouseenter', () => moveTracker(item));
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      moveTracker(item);
    });
  });

  const activeItem = document.querySelector('.nav-links .nav-item.active');
  if (activeItem) {
    setTimeout(() => moveTracker(activeItem), 100);
  }

  // ==========================================================================
  // 7. Interactive Real-Time BDS Server Simulator Deck
  // ==========================================================================
  const simTerminal = document.getElementById('sim-terminal');
  const simCpu = document.getElementById('sim-cpu');
  const simCpuBar = document.getElementById('sim-cpu-bar');
  const simRam = document.getElementById('sim-ram');
  const simRamBar = document.getElementById('sim-ram-bar');
  const simForm = document.getElementById('sim-terminal-form');
  const simInput = document.getElementById('sim-input');

  function appendTerminal(tag, message, level = 'info') {
    if (!simTerminal) return;
    const d = new Date();
    const time = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
    const line = document.createElement('div');
    line.className = `terminal-line ${level}`;
    line.innerHTML = `<span class="t-time">${time}</span> <span class="t-tag">[${tag.toUpperCase()}]</span> <span>${message}</span>`;
    simTerminal.appendChild(line);
    simTerminal.scrollTop = simTerminal.scrollHeight;
  }

  // Live telemetry pulse
  setInterval(() => {
    if (simCpu && simCpuBar) {
      const cpuVal = (3.2 + Math.random() * 2.8).toFixed(1);
      simCpu.textContent = `${cpuVal}%`;
      simCpuBar.style.width = `${Math.min(100, parseFloat(cpuVal) * 5)}%`;
    }
    if (simRam && simRamBar) {
      const ramMb = Math.floor(460 + Math.random() * 45);
      simRam.textContent = `${ramMb} MB / 8 GB`;
      simRamBar.style.width = `${((ramMb / 8192) * 100 * 4).toFixed(1)}%`;
    }
  }, 2600);

  // Moderation Chips Click
  document.querySelectorAll('.sim-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const player = btn.getAttribute('data-player');

      if (action === 'heal') {
        appendTerminal('SUPERVISOR', `execute at ${player} run effect give @s instant_health 1 255 true`, 'success');
        appendTerminal('SERVER', `Applied 20 HP full health restoration to ${player} (< 15ms)`, 'info');
        showToast(`Instant Heal applied to ${player} (20 HP)!`, 'success');
      } else if (action === 'feed') {
        appendTerminal('SUPERVISOR', `execute at ${player} run effect give @s saturation 1 255 true`, 'success');
        appendTerminal('SERVER', `Applied maximum food saturation to ${player}`, 'info');
        showToast(`Food & saturation fully restored for ${player}!`, 'success');
      } else if (action === 'kick') {
        appendTerminal('SECURITY', `kick ${player} "Kicked by administrator via FatGoats BSM+"`, 'warn');
        appendTerminal('SERVER', `Player ${player} disconnected cleanly from session`, 'info');
        showToast(`Player ${player} kicked from server`, 'info');
      } else if (action === 'ban') {
        appendTerminal('BANLIST', `Blacklisted ${player} in SQLite database (manager.db)`, 'danger');
        appendTerminal('SUPERVISOR', `Persistent rejection rule established. Reconnections blocked.`, 'warn');
        showToast(`Player ${player} permanently banned in SQLite!`, 'error');
      }
    });
  });

  // Simulated Terminal Input
  if (simForm && simInput) {
    simForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = simInput.value.trim();
      if (!val) return;
      simInput.value = '';

      appendTerminal('INPUT', val, 'success');

      setTimeout(() => {
        if (val.startsWith('/time')) {
          appendTerminal('SERVER', `Set the time to ${val.split(' ')[2] || 'day'}`, 'info');
        } else if (val.startsWith('/weather')) {
          appendTerminal('SERVER', `Changing to clear weather`, 'info');
        } else if (val.startsWith('/heal')) {
          const p = val.split(' ')[1] || 'Player';
          appendTerminal('SUPERVISOR', `Gave Instant Health to ${p}`, 'success');
        } else if (val.startsWith('/op')) {
          const p = val.split(' ')[1] || 'Player';
          appendTerminal('SECURITY', `Granted operator permissions to ${p}`, 'warn');
        } else {
          appendTerminal('SERVER', `Command executed via BDS IPC pipe: "${val}"`, 'info');
        }
      }, 160);
    });
  }

  // ==========================================================================
  // 8. Interactive Addon Auto-Installer Simulator
  // ==========================================================================
  const addonDropzone = document.getElementById('sim-addon-dropzone');
  const pipelineStatus = document.getElementById('pipeline-status');
  const pipelineProgress = document.getElementById('pipeline-progress-fill');
  const pipelineBanner = document.getElementById('pipeline-success-banner');

  let isInstalling = false;

  if (addonDropzone) {
    addonDropzone.addEventListener('click', () => {
      if (isInstalling) return;
      isInstalling = true;

      // Reset states
      if (pipelineBanner) pipelineBanner.style.display = 'none';
      if (pipelineProgress) pipelineProgress.style.width = '0%';
      document.querySelectorAll('.pipe-step').forEach(step => {
        step.classList.remove('active', 'done');
        const state = step.querySelector('.pipe-step-state');
        if (state) state.textContent = 'Waiting';
      });

      if (pipelineStatus) pipelineStatus.textContent = 'Processing...';

      // Step 1: Decompress
      const s1 = document.getElementById('step-1');
      if (s1) {
        s1.classList.add('active');
        s1.querySelector('.pipe-step-state').textContent = 'Extracting...';
      }
      if (pipelineProgress) pipelineProgress.style.width = '25%';

      setTimeout(() => {
        if (s1) {
          s1.classList.remove('active');
          s1.classList.add('done');
          s1.querySelector('.pipe-step-state').textContent = 'Extracted (140ms)';
        }

        // Step 2: Manifest Inspection
        const s2 = document.getElementById('step-2');
        if (s2) {
          s2.classList.add('active');
          s2.querySelector('.pipe-step-state').textContent = 'Parsing...';
        }
        if (pipelineProgress) pipelineProgress.style.width = '50%';

        setTimeout(() => {
          if (s2) {
            s2.classList.remove('active');
            s2.classList.add('done');
            s2.querySelector('.pipe-step-state').textContent = 'Parsed (85ms)';
          }

          // Step 3: Split BP & RP
          const s3 = document.getElementById('step-3');
          if (s3) {
            s3.classList.add('active');
            s3.querySelector('.pipe-step-state').textContent = 'Splitting...';
          }
          if (pipelineProgress) pipelineProgress.style.width = '75%';

          setTimeout(() => {
            if (s3) {
              s3.classList.remove('active');
              s3.classList.add('done');
              s3.querySelector('.pipe-step-state').textContent = 'Split OK (110ms)';
            }

            // Step 4: Inject World Config
            const s4 = document.getElementById('step-4');
            if (s4) {
              s4.classList.add('active');
              s4.querySelector('.pipe-step-state').textContent = 'Injecting...';
            }
            if (pipelineProgress) pipelineProgress.style.width = '100%';

            setTimeout(() => {
              if (s4) {
                s4.classList.remove('active');
                s4.classList.add('done');
                s4.querySelector('.pipe-step-state').textContent = 'Registered (95ms)';
              }
              if (pipelineStatus) pipelineStatus.textContent = 'Complete (0.84s)';
              if (pipelineBanner) pipelineBanner.style.display = 'flex';
              showToast('TrueWeapons_v4.2 addon installed and injected in 0.84s!', 'success');
              isInstalling = false;
            }, 240);
          }, 240);
        }, 220);
      }, 200);
    });
  }

  // ==========================================================================
  // 9. Interactive FAQ Accordion
  // ==========================================================================
  document.querySelectorAll('.faq-card').forEach((card) => {
    const header = card.querySelector('.faq-header');
    if (header) {
      header.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('open'));
        if (!isOpen) {
          card.classList.add('open');
        }
      });
    }
  });

  // ==========================================================================
  // 10. Copyable Code Blocks
  // ==========================================================================
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied to clipboard!', 'success');
        });
      }
    });
  });

})();
