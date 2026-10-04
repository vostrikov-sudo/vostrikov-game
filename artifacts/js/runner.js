(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const distEl = document.getElementById('distance');
  const livesEl = document.getElementById('lives');
  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreEl = document.getElementById('finalScore');

  // Resize for mobile
  function resize() {
    const maxW = Math.min(900, window.innerWidth - 20);
    const scale = maxW / 900;
    canvas.style.width = maxW + 'px';
    canvas.style.height = (500 * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  // Assets
  const charImg = new Image();
  charImg.src = 'img/character.png';

  // Game state
  let running = false;
  let score = 0;
  let distance = 0;
  let lives = 3;
  let speed = 4;
  let gravity = 0.55;
  let frame = 0;
  let cameraX = 0;

  const player = {
    x: 120,
    y: 300,
    w: 48,
    h: 72,
    vy: 0,
    onGround: false,
    invuln: 0
  };

  let platforms = [];
  let obstacles = [];
  let coins = [];
  let tasks = [];
  let particles = [];

  function reset() {
    score = 0;
    distance = 0;
    lives = 3;
    speed = 4;
    frame = 0;
    cameraX = 0;
    player.x = 120;
    player.y = 300;
    player.vy = 0;
    player.onGround = false;
    player.invuln = 0;
    platforms = [];
    obstacles = [];
    coins = [];
    tasks = [];
    particles = [];
    // initial ground
    for (let i = 0; i < 12; i++) {
      platforms.push({ x: i * 180, y: 420, w: 200, h: 80 });
    }
    updateHUD();
  }

  function updateHUD() {
    scoreEl.textContent = score;
    distEl.textContent = Math.floor(distance);
    livesEl.textContent = lives;
  }

  function spawnAhead() {
    const last = platforms[platforms.length - 1];
    const lastX = last ? last.x + last.w : 0;
    // chance of gap
    if (Math.random() < 0.25 && speed > 5) {
      // gap
      const gap = 80 + Math.random() * 100;
      platforms.push({
        x: lastX + gap,
        y: 380 + Math.random() * 60,
        w: 160 + Math.random() * 120,
        h: 80
      });
    } else {
      platforms.push({
        x: lastX - 10,
        y: 400 + (Math.random() < 0.3 ? -40 : 0),
        w: 180 + Math.random() * 80,
        h: 80
      });
    }
    const p = platforms[platforms.length - 1];

    // coins
    if (Math.random() < 0.6) {
      coins.push({
        x: p.x + 40 + Math.random() * (p.w - 80),
        y: p.y - 40 - Math.random() * 60,
        r: 12,
        collected: false
      });
    }
    // obstacle
    if (Math.random() < 0.35 && speed > 4.5) {
      obstacles.push({
        x: p.x + 30 + Math.random() * (p.w - 60),
        y: p.y - 36,
        w: 36,
        h: 36,
        type: Math.random() < 0.5 ? 'spike' : 'enemy'
      });
    }
    // task (Among Us style)
    if (Math.random() < 0.18) {
      tasks.push({
        x: p.x + 50,
        y: p.y - 70,
        w: 40,
        h: 40,
        done: false,
        progress: 0
      });
    }
  }

  function jump() {
    if (player.onGround && running) {
      player.vy = -13.5;
      player.onGround = false;
    }
  }

  // Input
  window.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      jump();
    }
  });
  canvas.addEventListener('pointerdown', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    // check task click
    let clickedTask = false;
    for (const t of tasks) {
      if (!t.done && mx > t.x - cameraX && mx < t.x - cameraX + t.w && my > t.y && my < t.y + t.h) {
        t.progress += 0.34;
        if (t.progress >= 1) {
          t.done = true;
          score += 150;
          spawnParticles(t.x + 20, t.y + 20, '#00e5c0');
        }
        clickedTask = true;
        break;
      }
    }
    if (!clickedTask) jump();
  });

  document.getElementById('startBtn').onclick = () => {
    startOverlay.classList.add('hidden');
    reset();
    running = true;
    loop();
  };
  document.getElementById('restartBtn').onclick = () => {
    gameOverOverlay.classList.add('hidden');
    reset();
    running = true;
    loop();
  };

  function spawnParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30 + Math.random() * 20,
        color
      });
    }
  }

  function hitPlayer() {
    if (player.invuln > 0) return;
    lives--;
    player.invuln = 90;
    spawnParticles(player.x + 24, player.y + 36, '#ff4466');
    updateHUD();
    if (lives <= 0) {
      running = false;
      finalScoreEl.textContent = `Очки: ${score} · Дистанция: ${Math.floor(distance)}м`;
      gameOverOverlay.classList.remove('hidden');
    }
  }

  function update() {
    if (!running) return;
    frame++;
    speed = 4 + Math.min(6, distance / 400);
    cameraX += speed;
    distance += speed * 0.08;
    player.x = cameraX + 120;

    // gravity
    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false;

    // platforms collision
    for (const p of platforms) {
      if (player.x + player.w > p.x && player.x < p.x + p.w) {
        if (player.y + player.h > p.y && player.y + player.h < p.y + 30 && player.vy >= 0) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
        }
      }
    }

    // fall death
    if (player.y > 520) {
      hitPlayer();
      player.y = 200;
      player.vy = 0;
    }

    // obstacles
    for (const o of obstacles) {
      if (player.x + player.w - 10 > o.x && player.x + 10 < o.x + o.w &&
          player.y + player.h - 10 > o.y && player.y + 10 < o.y + o.h) {
        hitPlayer();
      }
    }

    // coins
    for (const c of coins) {
      if (!c.collected) {
        const dx = (player.x + player.w / 2) - c.x;
        const dy = (player.y + player.h / 2) - c.y;
        if (dx * dx + dy * dy < 40 * 40) {
          c.collected = true;
          score += 25;
          spawnParticles(c.x, c.y, '#ffcc00');
        }
      }
    }

    // spawn new
    const last = platforms[platforms.length - 1];
    if (last && last.x < cameraX + 1100) spawnAhead();

    // cleanup
    platforms = platforms.filter(p => p.x + p.w > cameraX - 100);
    obstacles = obstacles.filter(o => o.x > cameraX - 50);
    coins = coins.filter(c => c.x > cameraX - 50);
    tasks = tasks.filter(t => t.x > cameraX - 50);

    // particles
    particles = particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    if (player.invuln > 0) player.invuln--;
    updateHUD();
  }

  function draw() {
    // sky
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(0.6, '#16213e');
    grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // parallax stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + cameraX * 0.15) % canvas.width);
      const sy = (i * 97) % 280;
      ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;

    // platforms
    for (const p of platforms) {
      const sx = p.x - cameraX;
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = '#00b894';
      ctx.fillRect(sx, p.y, p.w, 8);
      // pixel details
      ctx.fillStyle = '#1e272e';
      for (let i = 0; i < p.w; i += 20) {
        ctx.fillRect(sx + i, p.y + 12, 12, 4);
      }
    }

    // coins
    for (const c of coins) {
      if (c.collected) continue;
      const sx = c.x - cameraX;
      ctx.beginPath();
      ctx.arc(sx, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcc00';
      ctx.fill();
      ctx.strokeStyle = '#e6b800';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff8';
      ctx.beginPath();
      ctx.arc(sx - 3, c.y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // obstacles
    for (const o of obstacles) {
      const sx = o.x - cameraX;
      if (o.type === 'spike') {
        ctx.fillStyle = '#d63031';
        ctx.beginPath();
        ctx.moveTo(sx, o.y + o.h);
        ctx.lineTo(sx + o.w / 2, o.y);
        ctx.lineTo(sx + o.w, o.y + o.h);
        ctx.closePath();
        ctx.fill();
      } else {
        // enemy block
        ctx.fillStyle = '#e17055';
        ctx.fillRect(sx, o.y, o.w, o.h);
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(sx + 6, o.y + 8, 8, 8);
        ctx.fillRect(sx + 22, o.y + 8, 8, 8);
      }
    }

    // tasks (green panels)
    for (const t of tasks) {
      if (t.done) continue;
      const sx = t.x - cameraX;
      ctx.fillStyle = '#00e5c0';
      ctx.fillRect(sx, t.y, t.w, t.h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, t.y, t.w, t.h);
      // progress
      ctx.fillStyle = '#0008';
      ctx.fillRect(sx + 4, t.y + t.h - 10, t.w - 8, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx + 4, t.y + t.h - 10, (t.w - 8) * t.progress, 6);
      ctx.fillStyle = '#000';
      ctx.font = '10px sans-serif';
      ctx.fillText('TASK', sx + 6, t.y + 22);
    }

    // player
    ctx.save();
    if (player.invuln > 0 && Math.floor(player.invuln / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    const px = player.x - cameraX;
    if (charImg.complete && charImg.naturalWidth) {
      ctx.drawImage(charImg, px, player.y, player.w, player.h);
    } else {
      // fallback
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(px, player.y, player.w, player.h);
    }
    ctx.restore();

    // particles
    for (const p of particles) {
      ctx.globalAlpha = p.life / 40;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cameraX, p.y, 4, 4);
    }
    ctx.globalAlpha = 1;

    // ground fog
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 460, canvas.width, 40);
  }

  function loop() {
    update();
    draw();
    if (running) requestAnimationFrame(loop);
  }

  // initial draw
  reset();
  draw();
})();
