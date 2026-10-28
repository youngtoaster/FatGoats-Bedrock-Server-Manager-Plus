/* ==========================================================================
   FatGoats Bedrock Server Manager+ — Showcase Visual Engine
   3D Canvas Voxels, Bento Tilt Physics, Copy Helpers, Interactive Accordion
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Interactive Toast System
  // ==========================================================================
  const toastEl = document.getElementById('showcase-toast');
  let toastTimer = null;

  window.showToast = function (message, type = 'success') {
    if (!toastEl) return;
    const icons = {
      success: '✓',
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
  // 2. Canvas 3D Floating Voxel & Starfield Particle Engine
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

    // Background floating particles
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

    // Floating Minecraft Voxel Cubes (Emerald, Diamond, Redstone, Bedrock)
    const cubes = [
      { x: width * 0.12, y: height * 0.22, size: 28, rot: 0.2, rotSpeed: 0.006, colorTop: '#34d399', colorLeft: '#10b981', colorRight: '#059669', type: 'emerald' },
      { x: width * 0.88, y: height * 0.28, size: 34, rot: 1.2, rotSpeed: -0.005, colorTop: '#38bdf8', colorLeft: '#0284c7', colorRight: '#0369a1', type: 'diamond' },
      { x: width * 0.85, y: height * 0.78, size: 26, rot: 2.1, rotSpeed: 0.007, colorTop: '#f87171', colorLeft: '#ef4444', colorRight: '#b91c1c', type: 'redstone' },
      { x: width * 0.15, y: height * 0.72, size: 32, rot: 0.8, rotSpeed: -0.006, colorTop: '#475569', colorLeft: '#334155', colorRight: '#1e293b', type: 'bedrock' },
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
  // 3. Bento Card 3D Tilt Physics & Glare Spotlight
  // ==========================================================================
  document.querySelectorAll('.bento-card, .deck-card, .download-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // ==========================================================================
  // 4. Interactive FAQ Accordion
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
  // 5. One-Click Copy Buttons
  // ==========================================================================
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-copy');
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          showToast('Copied to Clipboard!', 'success');
        });
      }
    });
  });

})();
