class LisarArcade2D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.background = '#000';

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.audio = new Audio('assets/audio/Level_2.mp3');
    this.audio.preload = 'auto';

    this.audioCtx = null;

    // Estrellas sutiles del fondo (Juego 1)
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * 800,
        y: Math.random() * 450,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.6,
        twinkle: Math.random() > 0.5
      });
    }

    // ================================================================
    // CARGAR SPRITES DE CORRER (spritelisar1.png ... spritelisar10.png)
    // ================================================================
    this.runFrames = [];
    for (let i = 1; i <= 10; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = 'assets/img/spritelisar' + i + '.png';
      img.onload = function() { this.loaded = true; };
      this.runFrames.push(img);
    }

    // ================================================================
    // CARGAR SPRITES DE VUELO (lisarfly2.png ... lisarfly8.png)
    // ================================================================
    this.flyAscendFrames = [];
    for (let i = 2; i <= 4; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = 'assets/img/lisarfly' + i + '.png';
      img.onload = function() { this.loaded = true; };
      this.flyAscendFrames.push(img);
    }

    this.flyLoopFrames = [];
    for (let i = 5; i <= 6; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = 'assets/img/lisarfly' + i + '.png';
      img.onload = function() { this.loaded = true; };
      this.flyLoopFrames.push(img);
    }

    this.flyFallImg = new Image();
    this.flyFallImg.loaded = false;
    this.flyFallImg.src = 'assets/img/lisarfly7.png';
    this.flyFallImg.onload = function() { this.loaded = true; };

    this.flyLandImg = new Image();
    this.flyLandImg.loaded = false;
    this.flyLandImg.src = 'assets/img/lisarfly8.png';
    this.flyLandImg.onload = function() { this.loaded = true; };

    this.attackFrames = [];
    const attackSrcs = [
      'assets/img/spritelisaratack.png',
      'assets/img/spritelisaratack2.png',
      'assets/img/spritelisaratack3.png',
      'assets/img/spritelisaratack4.png',
      'assets/img/spritelisaratack5.png'
    ];
    for (let s of attackSrcs) {
      const img = new Image();
      img.loaded = false;
      img.src = s;
      img.onload = function() { this.loaded = true; };
      this.attackFrames.push(img);
    }

    this.coinFrames = [];
    for (let i = 1; i <= 8; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = 'assets/img/coin_' + i + '.png';
      img.onload = function() { this.loaded = true; };
      this.coinFrames.push(img);
    }

    this.enemy1FlyFrames = [];
    for (let i = 1; i <= 3; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = 'assets/img/enemy' + i + '.png';
      img.onload = function() { this.loaded = true; };
      this.enemy1FlyFrames.push(img);
    }

    this.enemy1FireImg = new Image();
    this.enemy1FireImg.loaded = false;
    this.enemy1FireImg.src = 'assets/img/enemyfire.png';
    this.enemy1FireImg.onload = function() { this.loaded = true; };

    this.enemy1DamageImg = new Image();
    this.enemy1DamageImg.loaded = false;
    this.enemy1DamageImg.src = 'assets/img/Enemydamage.png';
    this.enemy1DamageImg.onload = function() { this.loaded = true; };

    this.enemy1ExplodeImg = new Image();
    this.enemy1ExplodeImg.loaded = false;
    this.enemy1ExplodeImg.src = 'assets/img/EnemyExplodes.png';
    this.enemy1ExplodeImg.onload = function() { this.loaded = true; };

    this.shotImg = new Image();
    this.shotImg.loaded = false;
    this.shotImg.src = 'assets/img/shot.png';
    this.shotImg.onload = function() { this.loaded = true; };

    this.enemy2BallFrames = [];
    for (let i = 1; i <= 8; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = 'assets/img/ball' + i + '.png';
      img.onload = function() { this.loaded = true; };
      this.enemy2BallFrames.push(img);
    }

    this.sprites = {
      floor:    { src: 'images/sprites_arcade/tiling_floor.png',    img: new Image(), loaded: false, cols: 1, rows: 1, totalFrames: 1 }
    };

    this.state = 'ready';
    this.lastTime = 0;

    this.logicalWidth  = 800;
    this.logicalHeight = 450;
    this.scale = 1;

    this.player = {
      x: 80, y: 170,
      width: 240, height: 240,
      vy: 0,
      gravity: 850,
      jumpForce: -380,
      hp: 100, maxHp: 100,
      invulnerable: 0,
      frame: 0,
      frameTimer: 0,
      
      wasFlying: false,
      landTimer: 0,
      flyAscendIndex: 0
    };

    this.enemies     = [];
    this.projectiles = [];
    this.coins       = [];
    this.particles   = [];
    this.powerups    = [];

    this.floorOffset    = 0;
    this.floorSpeed     = 200;
    this.coinsCollected = 0;
    this.coinsRequired  = 100; // Meta aumentada a 100
    this.lastDiscountThreshold = 0; // Control de mensajes de descuento
    this.spawnTimer     = 0;
    this.isFlying       = false;

    this.input = { up: false };

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.loadSheetSprites();
    this.setupControls();
    this.createHUD();
    setTimeout(() => this.resize(), 0);
  }

  loadSheetSprites() {
    const keys = Object.keys(this.sprites);
    let loaded = 0;
    keys.forEach(k => {
      this.sprites[k].img.onload = () => {
        this.sprites[k].loaded = true;
        loaded++;
        if (loaded === keys.length) {
          this.drawReadyScreen();
        }
      };
      this.sprites[k].img.onerror = () => {
        loaded++;
        if (loaded === keys.length) this.drawReadyScreen();
      };
      this.sprites[k].img.src = this.sprites[k].src;
    });
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    this.canvas.width  = w;
    this.canvas.height = h;

    this.scale = Math.min(w / 800, h / 450);
    this.logicalWidth  = w / this.scale;
    this.logicalHeight = h / this.scale;

    const floor = this.logicalHeight - this.player.height - 40;
    if (this.player.y > floor) this.player.y = floor;

    if (this.state === 'ready') this.drawReadyScreen();
  }

  playCoinSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc  = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch(e) {}
  }

  playEnemyShootSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc  = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.18);
    } catch(e) {}
  }

  playExplosionSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const bufferSize = this.audioCtx.sampleRate * 0.45;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.45);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noise.start();
      noise.stop(this.audioCtx.currentTime + 0.45);
    } catch(e) {}
  }

  setupControls() {
    window.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.input.up = true;
        e.preventDefault();
      }
      if (e.code === 'Escape' || e.code === 'KeyP') this.togglePause();
    });
    window.addEventListener('keyup', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') this.input.up = false;
    });
    this.container.addEventListener('touchstart', e => {
      this.input.up = true;
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    this.container.addEventListener('touchend',  () => { this.input.up = false; });
    this.container.addEventListener('mousedown', () => { this.input.up = true;  });
    this.container.addEventListener('mouseup',   () => { this.input.up = false; });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.togglePause();
    });
  }

  createHUD() {
    this.hud = document.createElement('div');
    Object.assign(this.hud.style, {
      position: 'absolute', top: '16px', left: '16px', right: '16px',
      display: 'none', justifyContent: 'space-between', alignItems: 'flex-start',
      pointerEvents: 'none', color: '#fff',
      fontFamily: "'Orbitron', 'monospace'",
      zIndex: '5'
    });

    const leftBar = document.createElement('div');
    leftBar.style.display = 'flex';
    leftBar.style.flexDirection = 'column';
    leftBar.style.alignItems = 'flex-start';
    leftBar.style.gap = '8px';

    this.energyContainer = document.createElement('div');
    this.energyContainer.style.display = 'flex';
    this.energyContainer.style.gap = '5px';
    this.energyContainer.style.alignItems = 'center';

    const coinRow = document.createElement('div');
    coinRow.style.display = 'flex';
    coinRow.style.alignItems = 'center';
    coinRow.style.gap = '6px';
    coinRow.style.fontFamily = "'Orbitron', monospace";
    coinRow.style.fontSize = '0.85rem';
    coinRow.style.textShadow = '0 0 8px #ffb703';
    coinRow.innerHTML = `
      <div style="width:20px;height:20px;border-radius:50%;background:#ff8800;border:2px solid #ffd700;box-shadow:0 0 6px #ff8800;background-image:url('assets/img/logo-lisar-studio.png');background-size:cover;"></div>
      <span id="arcade-coin-text" style="color:#ffd700;font-weight:bold;">0 / 100</span>
    `;

    leftBar.appendChild(this.energyContainer);
    leftBar.appendChild(coinRow);

    const centerBar = document.createElement('div');
    centerBar.style.position = 'absolute';
    centerBar.style.left = '50%';
    centerBar.style.transform = 'translateX(-50%)';
    centerBar.style.display = 'flex';
    centerBar.style.flexDirection = 'column';
    centerBar.style.alignItems = 'center';
    centerBar.innerHTML = `
      <div style="font-size:0.7rem; color:#00ffff; text-shadow:0 0 5px #00ffff; letter-spacing:2px; margin-bottom:2px;">TIME LEFT</div>
      <div id="arcade-timer-text" style="font-size:1.8rem; font-weight:bold; color:#fff; text-shadow:0 0 10px #a200ff, 0 0 20px #a200ff;">1:00</div>
    `;

    const rightBar = document.createElement('div');
    rightBar.style.display = 'flex';
    rightBar.style.flexDirection = 'column';
    rightBar.style.alignItems = 'flex-end';
    rightBar.style.gap = '6px';
    rightBar.innerHTML = `
      <div style="font-size:0.75rem;opacity:0.8;text-shadow:0 0 6px #00ffff;">LEVEL 2</div>
    `;

    this.hud.appendChild(leftBar);
    this.hud.appendChild(centerBar);
    this.hud.appendChild(rightBar);
    this.container.appendChild(this.hud);

    this.updateEnergyBars();

    this.msgOverlay = document.createElement('div');
    Object.assign(this.msgOverlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.88)', color: '#fff', zIndex: '10', pointerEvents: 'none'
    });
    this.container.appendChild(this.msgOverlay);
  }

  updateEnergyBars() {
    if (!this.energyContainer) return;
    this.energyContainer.innerHTML = '';
    const totalBars = 5;
    const activeBars = Math.ceil(Math.max(0, this.player.hp) / 100 * totalBars);
    for (let i = 0; i < totalBars; i++) {
      const bar = document.createElement('div');
      Object.assign(bar.style, {
        width: '28px', height: '12px',
        transform: 'skewX(-20deg)',
        borderRadius: '2px',
        transition: 'all 0.3s',
        background: i < activeBars ? '#ff8800' : 'rgba(255,136,0,0.15)',
        border: i < activeBars ? '1px solid #ff0055' : '1px solid rgba(255,136,0,0.3)',
        boxShadow: i < activeBars ? '0 0 6px #ff8800' : 'none'
      });
      this.energyContainer.appendChild(bar);
    }
  }

  updateHUD() {
    this.updateEnergyBars();
    const coins = document.getElementById('arcade-coin-text');
    if (coins) coins.innerText = this.coinsCollected + ' / ' + this.coinsRequired;
    const timerText = document.getElementById('arcade-timer-text');
    if (timerText) {
      const remaining = Math.max(0, Math.ceil(60 - this.gameTimer));
      const m = Math.floor(remaining / 60);
      const s = (remaining % 60).toString().padStart(2, '0');
      timerText.innerText = `${m}:${s}`;
      if (remaining <= 10) {
        timerText.style.color = '#ff0055';
        timerText.style.textShadow = '0 0 15px #ff0055, 0 0 30px #ff0055';
      }
    }
  }

  showTemporaryAlert(title, subtitle, seconds) {
    const alertEl = document.createElement('div');
    Object.assign(alertEl.style, {
      position: 'absolute', top: '70px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.92)',
      border: '2.5px solid #00f3ff',
      boxShadow: '0 0 15px #00f3ff',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 24px',
      textAlign: 'center',
      fontFamily: "'Orbitron', sans-serif",
      zIndex: '99',
      transition: 'all 0.4s ease-out',
      pointerEvents: 'none'
    });
    alertEl.innerHTML = `
      <h4 style="margin:0 0 4px 0; color:#00f3ff; font-size:1rem; font-weight:bold;">${title}</h4>
      <p style="margin:0; font-size:0.85rem; opacity:0.9; font-weight:bold; color:#00ff00;">${subtitle}</p>
    `;
    this.container.appendChild(alertEl);
    setTimeout(() => {
      alertEl.style.opacity = '0';
      alertEl.style.top = '50px';
      setTimeout(() => alertEl.remove(), 400);
    }, seconds * 1000);
  }

  showMessage(title, subtitle, btnText, btnAction) {
    this.msgOverlay.style.display    = 'flex';
    this.msgOverlay.style.pointerEvents = 'auto';
    this.msgOverlay.innerHTML = `
      <h2 style="font-size:1.8rem;color:#ff9900;margin:0 0 8px 0;text-shadow:0 0 12px #ff0000;text-align:center;max-width:90%;">${title}</h2>
      <p  style="font-size:0.95rem;margin:0 0 18px 0;text-align:center;max-width:90%;line-height:1.5;">${subtitle}</p>
    `;
    if (btnText) {
      const btn = document.createElement('button');
      btn.innerText = btnText;
      Object.assign(btn.style, {
        padding: '10px 24px', fontSize: '1.05rem',
        background: 'linear-gradient(90deg,#ff9900,#ff2200)',
        color: '#fff', border: '2px solid #fff', borderRadius: '6px',
        cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 12px #ff6600'
      });
      btn.onclick = btnAction;
      this.msgOverlay.appendChild(btn);
    }
  }

  hideMessage() {
    this.msgOverlay.style.display    = 'none';
    this.msgOverlay.style.pointerEvents = 'none';
  }

  drawReadyScreen() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  startGame() {
    this.hideMessage();
    this.hud.style.display = 'flex';
    this.state = 'playing';

    this.player.hp             = this.player.maxHp;
    this.player.y              = 200;
    this.player.vy             = 0;
    this.player.invulnerable   = 0;
    this.player.frame          = 0;
    this.player.wasFlying      = false;
    this.player.landTimer      = 0;
    this.player.flyAscendIndex = 0;
    this.coinsCollected        = 0;
    this.lastDiscountThreshold = 0;

    this.enemies     = [];
    this.projectiles = [];
    this.coins       = [];
    this.particles   = [];
    this.powerups    = [];
    this.spawnTimer  = 0;
    this.gameTimer   = 0;

    this.audio.currentTime = 0;
    this.audio.play().catch(() => {});

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.audio.pause();
      this.showMessage('PAUSA', 'El juego está pausado.', 'REANUDAR', () => this.togglePause());
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.audio.play();
      this.hideMessage();
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  endGame(victory) {
    this.state = victory ? 'victory' : 'gameover';
    this.audio.pause();
    this.hud.style.display = 'none';

    // Descuento final basado en monedas recogidas (5% cada 20, max 25%)
    const discount = Math.min(25, Math.floor(this.coinsCollected / 20) * 5);
    localStorage.setItem('lisar_discount_game2', discount.toString());

    if (victory) {
      this.showMessage(
        '¡MISIÓN COMPLETADA!',
        `Sobreviviste el tiempo límite y recolectaste ${this.coinsCollected} monedas.<br><br>` +
        `<div style="font-size:1.35rem; color:#00ff00; font-weight:bold; text-shadow:0 0 10px #00ff00;">¡DESCUENTO TOTAL ACUMULADO: ${discount}%!</div><br>` +
        `Puntaje Final: ${this.coinsCollected * 120} pts`,
        'Reclamar Premio',
        () => {
          this.destroy();
          const ov = document.getElementById('arcade-overlay');
          if (ov) ov.style.display = 'flex';
          if (window.triggerPromoChatbot) window.triggerPromoChatbot(discount);
        }
      );
    } else {
      let motivo = this.player.hp <= 0
        ? 'Nave destruida.'
        : 'Solo juntaste ' + this.coinsCollected + ' / ' + this.coinsRequired + ' monedas.';
      
      this.showMessage(
        'MISIÓN FALLIDA',
        `${motivo}<br><br>` +
        `<div style="font-size:1.15rem; color:#ffd700; font-weight:bold;">Igual acumulaste un ${discount}% de descuento para servicios.</div>`,
        'REINTENTAR',
        () => this.startGame()
      );
    }
  }

  spawnEntity(dt) {
    this.spawnTimer += dt;
    const progress  = Math.min(1, this.gameTimer / 60);
    
    // Tasa de generación acelerada para más protagonismo
    const spawnRate = Math.max(0.65, 1.8 - progress * 1.3);

    if (this.spawnTimer < spawnRate) return;
    this.spawnTimer = 0;

    const r = Math.random();

    if (r < 0.38) {
      this.coins.push({
        x: this.logicalWidth + 30,
        y: 60 + Math.random() * (this.logicalHeight - 160),
        width: 110, height: 110,
        vx: -this.floorSpeed,
        frame: 0, frameTimer: 0
      });

    } else if (r < 0.65) {
      this.enemies.push({
        type: 1,
        x: this.logicalWidth + 30,
        y: 20 + Math.random() * 130, // Limitado para no traspasar el suelo (450-40-260=150 max)
        width: 260, height: 260,
        vx: -(this.floorSpeed + 60 + progress * 90),
        hp: 1, shootTimer: Math.random() * 1.5,
        frame: 0, frameTimer: 0,
        isShooting: 0,
        isHit: 0
      });

    } else if (r < 0.85) {
      if (Math.random() > 0.5) {
        // Items de energia
        this.powerups.push({
          x: this.logicalWidth + 30,
          y: 60 + Math.random() * (this.logicalHeight - 200),
          width: 50, height: 50,
          vx: -(this.floorSpeed + 25),
          frameTimer: 0
        });
      } else {
        // Enemy 2 (Bola pegada al piso)
        this.enemies.push({
          type: 2,
          x: this.logicalWidth + 30,
          y: this.logicalHeight - 120 - 40,
          width: 120, height: 120,
          vx: -(this.floorSpeed + 120 + progress * 60),
          hp: 1, shootTimer: 0,
          frame: 0, frameTimer: 0
        });
      }

    } else {
      // Obstáculos tipo cubo magenta - se mueven verticalmente más rápido
      const isTop = Math.random() > 0.5;
      this.enemies.push({
        type: 0,
        x: this.logicalWidth + 30,
        y: isTop ? 0 : this.logicalHeight - 200 - 40,
        width: 130, height: 200,
        vx: -this.floorSpeed,
        vy: (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 80),
        hp: 9999
      });
    }
  }

  checkCollisions() {
    const px = this.player.x + 15;
    const py = this.player.y + 15;
    const pw = this.player.width  - 30;
    const ph = this.player.height - 30;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (px < c.x + c.width && px + pw > c.x && py < c.y + c.height && py + ph > c.y) {
        this.coinsCollected++;
        this.createExplosion(c.x + c.width / 2, c.y + c.height / 2, 'gold', 6);
        this.coins.splice(i, 1);
        this.playCoinSound();

        // Control de alertas de descuento acumulables (cada 20 monedas, hasta 25% descuento)
        const currentThreshold = Math.floor(this.coinsCollected / 20);
        if (currentThreshold > this.lastDiscountThreshold && currentThreshold <= 5) {
          this.lastDiscountThreshold = currentThreshold;
          const currentPct = currentThreshold * 5;
          this.showTemporaryAlert("🎁 ¡DESCUENTO ACUMULADO!", `¡Has ganado un ${currentPct}% de descuento acumulable!`, 3.5);
        }
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (px < p.x + p.width && px + pw > p.x && py < p.y + p.height && py + ph > p.y) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
        this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#00ffaa', 10);
        this.playCoinSound();
        this.powerups.splice(i, 1);
      }
    }

    if (this.player.invulnerable > 0) return;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e  = this.enemies[i];
      const ex = e.type === 0 ? e.x     : e.x + 8;
      const ey = e.type === 0 ? e.y     : e.y + 8;
      const ew = e.type === 0 ? e.width : e.width  - 16;
      const eh = e.type === 0 ? e.height: e.height - 16;
      if (px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey) {
        if (e.type === 0) {
          // Obstáculos tipo 0 (cubos) empujan al jugador y hacen un poco de daño constante si está aplastado
          this.player.x = ex - this.player.width + 15;
          if (this.player.invulnerable <= 0) {
            this.player.hp -= 2;
            this.player.invulnerable = 0.2;
            this.createExplosion(px + pw, py + ph / 2, '#ff2200', 3);
          }
        } else {
          this.player.hp -= 20;
          this.player.invulnerable = 1.5;
          if (e.type === 1) {
            this.createExplosion(ex + ew / 2, ey + eh / 2, 'enemy_explode', 1, ew);
            this.playExplosionSound();
          } else {
            this.createExplosion(px + pw / 2, py + ph / 2, '#ff2200', 14);
          }
          this.enemies.splice(i, 1);
        }
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (px < p.x + p.width && px + pw > p.x && py < p.y + p.height && py + ph > p.y) {
        this.player.hp -= p.damage;
        this.player.invulnerable = 1.0;
        this.createExplosion(px + pw / 2, py + ph / 2, '#ff9900', 10);
        this.projectiles.splice(i, 1);
      }
    }
  }

  createExplosion(x, y, color, count, size = 0) {
    if (color === 'enemy_explode') {
      this.particles.push({
        x: x, y: y,
        vx: 0, vy: 0,
        life: 0.45,
        maxLife: 0.45,
        color: 'enemy_explode',
        size: size || 120
      });
      return;
    }
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 320,
        vy: (Math.random() - 0.5) * 320,
        life: 0.4 + Math.random() * 0.4,
        color,
        size: 2 + Math.random() * 5
      });
    }
  }

  update(dt) {
    if (this.state !== 'playing') return;

    this.gameTimer += dt;
    const remaining = Math.max(0, 60 - this.gameTimer);
    
    // Aumento progresivo de velocidad mucho más notable
    const progress = Math.min(1, this.gameTimer / 60);
    const speedBoost = 1.0 + progress * 0.90; // Hasta 90% más rápido al final
    dt *= 1.30 * speedBoost; // 30% base extra siempre

    // Físicas del jugador
    if (this.player.x < 80) {
      this.player.x += dt * 100; // Fuerza para regresar a la posición original
      if (this.player.x > 80) this.player.x = 80;
    }

    if (this.input.up) {
      this.player.vy += this.player.jumpForce * dt * 5;
      if (this.player.vy < -340) this.player.vy = -340;
    } else {
      // Caída progresiva más rápida (a medida que cae, aumenta la gravedad)
      let fallMult = this.player.vy > 0 ? 1.6 : 1.0;
      this.player.vy += this.player.gravity * dt * fallMult;
    }
    this.player.y += this.player.vy * dt;

    const floorY = this.logicalHeight - this.player.height - 40;
    if (this.player.y < 0)        { this.player.y = 0;      this.player.vy = 0; }
    if (this.player.y > floorY)   { this.player.y = floorY; this.player.vy = 0; }

    if (this.player.invulnerable > 0) this.player.invulnerable -= dt;

    // ================================================================
    // ANIMACIÓN DEL JUGADOR - MÁQUINA DE ESTADOS
    // ================================================================
    this.player.frameTimer += dt;
    const onGround = this.player.y >= floorY - 2;

    this.activeAnim = [];
    this.loopAnim   = true;
    this.animSpeed  = 0.08;

    if (onGround) {
      if (this.player.wasFlying) {
        this.player.landTimer = 0.15;
        this.player.wasFlying = false;
        this.player.flyAscendIndex = 0;
      }

      if (this.player.landTimer > 0) {
        this.player.landTimer -= dt;
        this.activeAnim = [this.flyLandImg];
        this.loopAnim   = false;
      } else {
        this.activeAnim = this.runFrames;

        // Partículas de humo en los pies mientras corre en tierra (limitadas y solo a altas velocidades)
        if (speedBoost > 1.3 && this.particles.length < 40 && Math.random() > 0.45) {
          this.particles.push({
            x: this.player.x + this.player.width / 2 - 20 + Math.random() * 40,
            y: floorY + this.player.height - 10,
            vx: -this.floorSpeed - 20 - Math.random() * 50,
            vy: -10 - Math.random() * 15,
            life: 0.35 + Math.random() * 0.25,
            maxLife: 0.6,
            color: 'smoke',
            size: 4 + Math.random() * 7
          });
        }
      }
    } else {
      this.player.wasFlying = true;
      this.player.landTimer = 0;

      if (this.player.vy > 80) {
        this.activeAnim = [this.flyFallImg];
        this.loopAnim   = false;
        this.player.flyAscendIndex = 0;
      } else {
        if (this.player.flyAscendIndex < this.flyAscendFrames.length) {
          this.activeAnim = [this.flyAscendFrames[this.player.flyAscendIndex]];
          this.loopAnim   = false;
          this.animSpeed  = 0.07;
          if (this.player.frameTimer > this.animSpeed) {
            this.player.flyAscendIndex++;
            this.player.frameTimer = 0;
          }
        } else {
          this.activeAnim = this.flyLoopFrames;
          this.animSpeed  = 0.08;
        }
      }
    }

    if (this.loopAnim && this.activeAnim.length > 0) {
      if (this.player.frameTimer > this.animSpeed) {
        this.player.frame = (this.player.frame + 1) % this.activeAnim.length;
        this.player.frameTimer = 0;
      }
    } else {
      this.player.frame = 0;
    }

    // Suelo scrolling
    this.floorOffset -= this.floorSpeed * dt;
    if (this.floorOffset <= -this.logicalWidth) this.floorOffset += this.logicalWidth;

    this.spawnEntity(dt);

    // Monedas
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.x += c.vx * dt;
      c.frameTimer += dt;
      if (c.frameTimer > 0.10) {
        c.frame = (c.frame + 1) % this.coinFrames.length;
        c.frameTimer = 0;
      }
      if (c.x < -c.width * 2) this.coins.splice(i, 1);
    }

    // Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.x += p.vx * dt;
      p.frameTimer += dt * 5;
      p.y += Math.sin(p.frameTimer) * 1.5; // Flotación suave
      if (p.x < -p.width * 2) this.powerups.splice(i, 1);
    }

    // Enemigos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.x += e.vx * dt;

      if (e.vy) {
        e.y += e.vy * dt;
        const minY = 0;
        const maxY = this.logicalHeight - e.height - 40;
        if (e.y < minY) { e.y = minY; e.vy *= -1; }
        if (e.y > maxY) { e.y = maxY; e.vy *= -1; }
      }

      if (e.type !== 0) {
        e.frameTimer += dt;

        if (e.type === 1) {
          if (e.frameTimer > 0.12) {
            e.frame = (e.frame + 1) % this.enemy1FlyFrames.length;
            e.frameTimer = 0;
          }
          if (e.isShooting > 0) e.isShooting -= dt;
          if (e.isHit > 0) e.isHit -= dt;
        } else if (e.type === 2) {
          if (e.frameTimer > 0.08) {
            e.frame = (e.frame + 1) % this.enemy2BallFrames.length;
            e.frameTimer = 0;
          }
        }

        e.shootTimer += dt;
        const shootInterval = e.type === 1 ? 2.2 : 1.8;
        if (e.shootTimer > shootInterval) {
          e.shootTimer = 0;
          if (e.type === 1) {
            e.isShooting = 0.35;
            this.playEnemyShootSound();
          }
          this.projectiles.push({
            x: e.x, y: e.y + e.height / 2,
            width: e.type === 1 ? 65 : 36, height: 26,
            vx: -380 - (e.type === 2 ? 80 : 0),
            damage: e.type === 1 ? 10 : 15,
            color: e.type === 1 ? 'enemy1_shot' : '#ff00ff'
          });
        }
      }

      if (e.x < -e.width * 2) this.enemies.splice(i, 1);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      if (p.x < -p.width) this.projectiles.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.checkCollisions();
    this.updateHUD();

    if (this.player.x + this.player.width < 0 && this.state === 'playing') {
      this.player.hp = 0;
      this.endGame(false); // Arrastrado por un cubo
    } else if (this.player.hp <= 0 && this.state === 'playing') {
      this.endGame(false);
    } else if (this.gameTimer >= 60 && this.state === 'playing') {
      this.endGame(true);
    }
  }

  drawSheet(spriteInfo, frameIndex, x, y, w, h) {
    if (!spriteInfo.loaded) return;
    const fw = spriteInfo.img.width  / spriteInfo.cols;
    const fh = spriteInfo.img.height / spriteInfo.rows;
    const col = frameIndex % spriteInfo.cols;
    const row = Math.floor(frameIndex / spriteInfo.cols);
    this.ctx.drawImage(spriteInfo.img, col * fw, row * fh, fw, fh, x, y, w, h);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);

    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    this.ctx.fillStyle = '#ffffff';
    this.stars.forEach(s => {
      let a = s.alpha;
      if (s.twinkle && Math.random() > 0.96) {
        a = 0.1 + Math.random() * 0.75;
      }
      this.ctx.fillStyle = 'rgba(255, 255, 255, ' + a + ')';
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    const remaining = Math.max(0, 60 - this.gameTimer);
    if (remaining < 30) {
      const intensity = 1 - (remaining / 30); // 0 to 1
      if (Math.random() < 0.02 * intensity) {
        this.ctx.fillStyle = `rgba(162, 0, 255, ${0.1 + Math.random() * 0.2 * intensity})`;
        this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
        // Rayo
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
        this.ctx.lineWidth = 2 + Math.random() * 4;
        this.ctx.beginPath();
        let lx = Math.random() * this.logicalWidth;
        let ly = 0;
        this.ctx.moveTo(lx, ly);
        while (ly < this.logicalHeight) {
          lx += (Math.random() - 0.5) * 150;
          ly += 40 + Math.random() * 60;
          this.ctx.lineTo(lx, ly);
        }
        this.ctx.stroke();
      }
    }

    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.logicalWidth;  i += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.logicalHeight); this.ctx.stroke();
    }
    for (let i = 0; i < this.logicalHeight; i += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.logicalWidth, i); this.ctx.stroke();
    }

    if (this.sprites.floor.loaded) {
      const tiles = Math.ceil(this.logicalWidth / 800) + 2;
      for (let i = 0; i < tiles; i++) {
        this.ctx.drawImage(this.sprites.floor.img, this.floorOffset + i * 800, this.logicalHeight - 40, 800, 40);
      }
    } else {
      this.ctx.fillStyle = '#ff9900';
      this.ctx.fillRect(0, this.logicalHeight - 40, this.logicalWidth, 40);
    }

    // Monedas
    this.coins.forEach(c => {
      const img = this.coinFrames[c.frame % this.coinFrames.length];
      if (img && img.loaded) {
        const imgRatio = img.width / img.height;
        const drawW = c.height * imgRatio;
        const drawH = c.height;
        const drawX = c.x + (c.width - drawW) / 2;
        const drawY = c.y;
        this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        this.ctx.fillStyle = 'gold';
        this.ctx.beginPath();
        this.ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Powerups
    this.powerups.forEach(p => {
      this.ctx.fillStyle = '#00ffaa';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#00ffaa';
      this.ctx.beginPath();
      this.ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 24px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText('+', p.x + p.width/2, p.y + p.height/2);
    });

    // Enemigos
    this.enemies.forEach(e => {
      if (e.type === 0) {
        const flash = Math.floor(performance.now() / 180) % 2 === 0;
        this.ctx.fillStyle = flash ? '#33003a' : '#1a001f';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
        this.ctx.strokeStyle = flash ? '#ff00ff' : '#cc00cc';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 10; this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeRect(e.x, e.y, e.width, e.height);
        this.ctx.beginPath();
        this.ctx.moveTo(e.x + 5, e.y + 5);         this.ctx.lineTo(e.x + e.width - 5, e.y + e.height - 5);
        this.ctx.moveTo(e.x + e.width - 5, e.y + 5); this.ctx.lineTo(e.x + 5, e.y + e.height - 5);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      } else if (e.type === 1) {
        let img = this.enemy1FlyFrames[e.frame % this.enemy1FlyFrames.length];
        if (e.isShooting && e.isShooting > 0) {
          img = this.enemy1FireImg;
        } else if (e.isHit && e.isHit > 0) {
          img = this.enemy1DamageImg;
        }
        if (img && img.loaded) {
          const imgRatio = img.width / img.height;
          const drawW = e.height * imgRatio;
          const drawH = e.height;
          const drawX = e.x + (e.width - drawW) / 2;
          const drawY = e.y;
          this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } else {
          this.ctx.fillStyle = '#ff3366';
          this.ctx.fillRect(e.x, e.y, e.width, e.height);
        }
      } else if (e.type === 2) {
        let img = this.enemy2BallFrames[e.frame % this.enemy2BallFrames.length];
        if (img && img.loaded) {
          const imgRatio = img.width / img.height;
          const drawW = e.height * imgRatio;
          const drawH = e.height;
          const drawX = e.x + (e.width - drawW) / 2;
          const drawY = e.y;
          this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } else {
          this.ctx.fillStyle = '#ff00aa';
          this.ctx.beginPath();
          this.ctx.arc(e.x + e.width/2, e.y + e.height/2, e.width/2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else {
        this.ctx.fillStyle = e.type === 1 ? '#ff4444' : '#aa00ff';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
      }
    });

    // Proyectiles
    this.projectiles.forEach(p => {
      if (p.color === 'enemy1_shot' && this.shotImg.loaded) {
        const imgRatio = this.shotImg.width / this.shotImg.height;
        const drawW = p.height * imgRatio;
        const drawH = p.height;
        const drawX = p.x + (p.width - drawW) / 2;
        const drawY = p.y;
        this.ctx.drawImage(this.shotImg, drawX, drawY, drawW, drawH);
      } else {
        this.ctx.shadowBlur = 10; this.ctx.shadowColor = p.color;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.width, p.height);
        this.ctx.shadowBlur = 0;
      }
    });

    // Jugador (Lisar)
    const blink = this.player.invulnerable <= 0 || Math.floor(this.player.invulnerable * 14) % 2 === 0;
    if (blink && this.activeAnim && this.activeAnim.length > 0) {
      const img = this.activeAnim[this.player.frame % this.activeAnim.length];
      if (img && img.loaded) {
        const baseHeightRef = 200; 
        const drawW = img.width * (this.player.height / baseHeightRef);
        const drawH = img.height * (this.player.height / baseHeightRef);
        
        const drawX = this.player.x + (this.player.width - drawW) / 2;
        let drawY;
        if (this.isFlying) {
          drawY = this.player.y + (this.player.height - drawH) / 2;
        } else {
          drawY = this.player.y + (this.player.height - drawH);
        }
        
        this.ctx.save();
        const progress = Math.min(1, this.gameTimer / 60);
        const onGround = this.player.y >= (this.logicalHeight - this.player.height - 42);
        if (progress > 0.15 && onGround) {
          // Purple aura effect depending on speed
          this.ctx.filter = `drop-shadow(0 0 ${progress * 25}px #a200ff) drop-shadow(0 0 ${progress * 10}px #ff00ff)`;
        }
        this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        this.ctx.filter = 'none';
        this.ctx.restore();
      } else {
        this.ctx.fillStyle = '#4488ff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      }

      if (this.input.up) {
        this.ctx.fillStyle = Math.random() > 0.5 ? '#ff9900' : '#ffff00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 20, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + 40, this.player.y + this.player.height + 20 + Math.random() * 20);
        this.ctx.lineTo(this.player.x + 60, this.player.y + this.player.height);
        this.ctx.fill();
      }
    }

    // Partículas
    this.particles.forEach(p => {
      if (p.color === 'enemy_explode' && this.enemy1ExplodeImg.loaded) {
        this.ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        const currentSize = p.size * (1.5 - p.life / p.maxLife);
        this.ctx.drawImage(
          this.enemy1ExplodeImg,
          p.x - currentSize / 2,
          p.y - currentSize / 2,
          currentSize,
          currentSize
        );
      } else if (p.color === 'smoke') {
        this.ctx.globalAlpha = Math.max(0, (p.life / p.maxLife) * 0.45);
        this.ctx.fillStyle = 'rgba(180, 180, 185, 0.65)';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * (2 - p.life / p.maxLife), 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.globalAlpha = Math.max(0, p.life);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    this.ctx.globalAlpha = 1;

    this.ctx.restore();
  }

  loop(now) {
    if (this.state !== 'playing') return;
    let dt = (now - this.lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    this.lastTime = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame(t => this.loop(t));
  }

  destroy() {
    this.state = 'destroyed';
    if (this.audio) this.audio.pause();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.container.innerHTML = '';
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  window.initArcadeGame = function() {
    if (window.arcadeGame) window.arcadeGame.destroy();
    window.arcadeGame = new LisarArcade2D('arcade-game-container');
  };

  const btn     = document.getElementById('start-arcade-btn');
  const overlay = document.getElementById('arcade-overlay');

  if (btn && overlay) {
    btn.addEventListener('click', () => {
      overlay.style.display = 'none';
      if (!window.arcadeGame || window.arcadeGame.state === 'destroyed') {
        window.initArcadeGame();
      }
      setTimeout(() => {
        if (window.arcadeGame && window.arcadeGame.state === 'ready') {
          window.arcadeGame.startGame();
        }
      }, 100);
    });
  }
});
