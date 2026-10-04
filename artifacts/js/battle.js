(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const waveEl = document.getElementById('wave');
  const hpEl = document.getElementById('hp');
  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreEl = document.getElementById('finalScore');
  const w1 = document.getElementById('w1');
  const w2 = document.getElementById('w2');
  const w3 = document.getElementById('w3');

  function resize() {
    const maxW = Math.min(900, window.innerWidth - 20);
    const scale = maxW / 900;
    canvas.style.width = maxW + 'px';
    canvas.style.height = (500 * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  const charImg = new Image();
  charImg.src = 'img/character.png';

  let running = false;
  let score = 0;
  let wave = 1;
  let hp = 100;
  let weapon = 1; // 1 sword, 2 gun, 3 drones
  let keys = {};
  let mouse = { x: 450, y: 250, down: false };
  let frame = 0;

  const player = {
    x: 450, y: 250, r: 28, angle: 0, speed: 3.2, invuln: 0
  };

  let bullets = [];
  let enemies = [];
  let drones = []; // player drones
  let particles = [];
  let powerups = [];
  let spawnTimer = 0;

  function reset() {
    score = 0;
    wave = 1;
    hp = 100;
    weapon = 1;
    frame = 0;
    player.x = 450;
    player.y = 250;
    player.invuln = 0;
    bullets = [];
    enemies = [];
    drones = [];
    particles = [];
    powerups = [];
    spawnTimer = 0;
    updateWeaponUI();
    updateHUD();
  }

  function updateHUD() {
    scoreEl.textContent = score;
    waveEl.textContent = wave;
    hpEl.textContent = Math.max(0, Math.floor(hp));
  }

  function updateWeaponUI() {
    [w1, w2, w3].forEach((el, i) => {
      el.classList.toggle('active', weapon === i + 1);
    });
  }

  // Input
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Digit1') { weapon = 1; updateWeaponUI(); }
    if (e.code === 'Digit2') { weapon = 2; updateWeaponUI(); }
    if (e.code === 'Digit3') { weapon = 3; updateWeaponUI(); }
    if (e.code === 'Space') { e.preventDefault(); shoot(); }
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
  });
  canvas.addEventListener('pointerdown', () => { mouse.down = true; shoot(); });
  canvas.addEventListener('pointerup', () => { mouse.down = false; });

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

  function shoot() {
    if (!running) return;
    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    const len = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx);

    if (weapon === 1) {
      // sword slash - short range
      bullets.push({
        x: player.x + Math.cos(ang) * 30,
        y: player.y + Math.sin(ang) * 30,
        vx: Math.cos(ang) * 8,
        vy: Math.sin(ang) * 8,
        life: 12,
        r: 22,
        dmg: 35,
        type: 'slash',
        color: '#ffcc00'
      });
    } else if (weapon === 2) {
      // gun
      bullets.push({
        x: player.x + Math.cos(ang) * 25,
        y: player.y + Math.sin(ang) * 25,
        vx: Math.cos(ang) * 11,
        vy: Math.sin(ang) * 11,
        life: 60,
        r: 5,
        dmg: 18,
        type: 'bullet',
        color: '#00e5c0'
      });
    } else if (weapon === 3) {
      // launch drone
      if (drones.length < 4) {
        drones.push({
          x: player.x,
          y: player.y,
          target: null,
          life: 300,
          angle: Math.random() * Math.PI * 2,
          cooldown: 0
        });
      }
    }
  }

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = -30; y = Math.random() * 500; }
    else if (side === 1) { x = 930; y = Math.random() * 500; }
    else if (side === 2) { x = Math.random() * 900; y = -30; }
    else { x = Math.random() * 900; y = 530; }

    const types = ['tank', 'drone', 'soldier'];
    const type = types[Math.floor(Math.random() * (wave > 3 ? 3 : 2))];
    let hpE, speed, r, color, scoreV;
    if (type === 'tank') {
      hpE = 80 + wave * 15; speed = 0.7 + wave * 0.05; r = 28; color = '#636e72'; scoreV = 80;
    } else if (type === 'drone') {
      hpE = 25 + wave * 5; speed = 2.2; r = 14; color = '#e17055'; scoreV = 40;
    } else {
      hpE = 40 + wave * 8; speed = 1.4; r = 18; color = '#d63031'; scoreV = 50;
    }
    enemies.push({ x, y, hp: hpE, maxHp: hpE, speed, r, type, color, score: scoreV, angle: 0 });
  }

  function spawnParticles(x, y, color, n = 8) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7,
        life: 20 + Math.random() * 25,
        color
      });
    }
  }

  function damagePlayer(amount) {
    if (player.invuln > 0) return;
    hp -= amount;
    player.invuln = 40;
    spawnParticles(player.x, player.y, '#ff4466', 12);
    updateHUD();
    if (hp <= 0) {
      running = false;
      finalScoreEl.textContent = `Очки: ${score} · Волна: ${wave}`;
      gameOverOverlay.classList.remove('hidden');
    }
  }

  function update() {
    if (!running) return;
    frame++;

    // movement
    let mx = 0, my = 0;
    if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my);
      player.x += (mx / len) * player.speed;
      player.y += (my / len) * player.speed;
    }
    player.x = Math.max(player.r, Math.min(900 - player.r, player.x));
    player.y = Math.max(player.r, Math.min(500 - player.r, player.y));
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    if (player.invuln > 0) player.invuln--;

    // auto fire for gun if held
    if (mouse.down && weapon === 2 && frame % 8 === 0) shoot();

    // bullets
    bullets = bullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      return b.life > 0 && b.x > -20 && b.x < 920 && b.y > -20 && b.y < 520;
    });

    // enemies AI
    for (const e of enemies) {
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      e.angle = Math.atan2(dy, dx);
      e.x += (dx / dist) * e.speed;
      e.y += (dy / dist) * e.speed;

      // collide player
      if (dist < e.r + player.r - 5) {
        damagePlayer(e.type === 'tank' ? 12 : 6);
      }
    }

    // bullet vs enemy
    for (const b of bullets) {
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const d = Math.hypot(b.x - e.x, b.y - e.y);
        if (d < b.r + e.r) {
          e.hp -= b.dmg;
          b.life = 0;
          spawnParticles(e.x, e.y, e.color, 4);
          if (e.hp <= 0) {
            score += e.score;
            spawnParticles(e.x, e.y, '#ffcc00', 15);
            // chance powerup
            if (Math.random() < 0.15) {
              powerups.push({ x: e.x, y: e.y, type: Math.random() < 0.5 ? 'heal' : 'score', life: 300 });
            }
            enemies.splice(i, 1);
          }
        }
      }
    }

    // drones AI
    for (const d of drones) {
      d.life--;
      // find nearest enemy
      let nearest = null, nd = 9999;
      for (const e of enemies) {
        const dist = Math.hypot(e.x - d.x, e.y - d.y);
        if (dist < nd) { nd = dist; nearest = e; }
      }
      if (nearest) {
        const ang = Math.atan2(nearest.y - d.y, nearest.x - d.x);
        d.x += Math.cos(ang) * 3.5;
        d.y += Math.sin(ang) * 3.5;
        d.cooldown--;
        if (d.cooldown <= 0 && nd < 120) {
          bullets.push({
            x: d.x, y: d.y,
            vx: Math.cos(ang) * 9,
            vy: Math.sin(ang) * 9,
            life: 40, r: 4, dmg: 12, type: 'drone', color: '#74b9ff'
          });
          d.cooldown = 25;
        }
      } else {
        // orbit player
        d.angle += 0.04;
        d.x = player.x + Math.cos(d.angle) * 60;
        d.y = player.y + Math.sin(d.angle) * 60;
      }
    }
    drones = drones.filter(d => d.life > 0);

    // powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.life--;
      if (Math.hypot(p.x - player.x, p.y - player.y) < 30) {
        if (p.type === 'heal') hp = Math.min(100, hp + 25);
        else score += 100;
        spawnParticles(p.x, p.y, '#00e5c0');
        powerups.splice(i, 1);
        updateHUD();
      } else if (p.life <= 0) powerups.splice(i, 1);
    }

    // spawn
    spawnTimer--;
    const maxEnemies = 4 + wave * 2;
    if (spawnTimer <= 0 && enemies.length < maxEnemies) {
      spawnEnemy();
      spawnTimer = Math.max(25, 80 - wave * 5);
    }
    // wave progress
    if (score > wave * 400) {
      wave++;
      updateHUD();
    }

    particles = particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.life--;
      return p.life > 0;
    });

    updateHUD();
  }

  function draw() {
    // background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, 900, 500);

    // grid
    ctx.strokeStyle = '#1a2332';
    ctx.lineWidth = 1;
    for (let x = 0; x < 900; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 500); ctx.stroke();
    }
    for (let y = 0; y < 500; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke();
    }

    // powerups
    for (const p of powerups) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'heal' ? '#00e5c0' : '#ffcc00';
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(p.type === 'heal' ? '+' : '$', p.x - 4, p.y + 4);
    }

    // enemies
    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);
      if (e.type === 'tank') {
        ctx.fillStyle = e.color;
        ctx.fillRect(-e.r, -e.r * 0.7, e.r * 2, e.r * 1.4);
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(0, -6, e.r + 10, 12);
        ctx.fillStyle = '#636e72';
        ctx.beginPath();
        ctx.arc(0, 0, e.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'drone') {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.moveTo(e.r, 0);
        ctx.lineTo(-e.r * 0.7, -e.r);
        ctx.lineTo(-e.r * 0.3, 0);
        ctx.lineTo(-e.r * 0.7, e.r);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, 0, e.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(4, -5, 8, 4);
      }
      ctx.restore();
      // hp bar
      if (e.hp < e.maxHp) {
        ctx.fillStyle = '#000';
        ctx.fillRect(e.x - 20, e.y - e.r - 12, 40, 5);
        ctx.fillStyle = '#00e5c0';
        ctx.fillRect(e.x - 20, e.y - e.r - 12, 40 * (e.hp / e.maxHp), 5);
      }
    }

    // drones
    for (const d of drones) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#74b9ff';
      ctx.fill();
      ctx.strokeStyle = '#0984e3';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // bullets
    for (const b of bullets) {
      ctx.beginPath();
      if (b.type === 'slash') {
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,204,0,0.5)';
        ctx.fill();
      } else {
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      }
    }

    // player
    ctx.save();
    if (player.invuln > 0 && Math.floor(player.invuln / 3) % 2 === 0) ctx.globalAlpha = 0.4;
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle + Math.PI / 2);
    if (charImg.complete && charImg.naturalWidth) {
      ctx.drawImage(charImg, -28, -36, 56, 72);
    } else {
      ctx.fillStyle = '#0984e3';
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // aim line
    ctx.strokeStyle = 'rgba(0,229,192,0.25)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // particles
    for (const p of particles) {
      ctx.globalAlpha = p.life / 40;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    update();
    draw();
    if (running) requestAnimationFrame(loop);
  }

  reset();
  draw();
})();
