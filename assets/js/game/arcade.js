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

    this.logoImg = new Image();
    this.logoImg.loaded = false;
    this.logoImg.src = 'assets/img/logo-lisar-studio.png';
    this.logoImg.onload = () => { this.logoImg.loaded = true; };

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
    this.coinsRequired  = 100;
    this.lastDiscountThreshold = 0;
    this.spawnTimer     = 0;
    this.isFlying       = false;

    this.input = { up: false };

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.initReadyCSS();
    this.loadSheetSprites();
    this.setupControls();
    this.createHUD();
    setTimeout(() => this.resize(), 0);
  }

  initReadyCSS() {
    if (!document.getElementById('ready-futuristic-css-arcade')) {
      const style = document.createElement('style');
      style.id = 'ready-futuristic-css-arcade';
      style.textContent = `
        @keyframes readyZoomIn {
          0% { transform: scale(0.2); opacity: 0; }
          80% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shoot1 { to { transform: translate(-320px, -220px) rotate(-45deg); opacity: 0; } }
        @keyframes shoot2 { to { transform: translate(-160px, 320px) rotate(20deg); opacity: 0; } }
        @keyframes shoot3 { to { transform: translate(50px, -360px) rotate(-10deg); opacity: 0; } }
        @keyframes shoot4 { to { transform: translate(160px, 280px) rotate(60deg); opacity: 0; } }
        @keyframes shoot5 { to { transform: translate(320px, -180px) rotate(-30deg); opacity: 0; } }
        @keyframes shoot6 { to { transform: translate(280px, 320px) rotate(90deg); opacity: 0; } }

        .ready-futuristic {
          font-size: clamp(35px, 7vw, 65px);
          font-weight: 900;
          color: #ffffff;
          text-shadow: 0 0 20px #ff8800, 0 0 40px #ff8800, 0 0 60px #ff9900;
          animation: readyZoomIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          letter-spacing: 6px;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .ready-futuristic span {
          display: inline-block;
          opacity: 1;
        }
        .ready-futuristic span:nth-child(1) { animation: shoot1 0.45s 1.1s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
        .ready-futuristic span:nth-child(2) { animation: shoot2 0.45s 1.1s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
        .ready-futuristic span:nth-child(3) { animation: shoot3 0.45s 1.1s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
        .ready-futuristic span:nth-child(4) { animation: shoot4 0.45s 1.1s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
        .ready-futuristic span:nth-child(5) { animation: shoot5 0.45s 1.1s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
        .ready-futuristic span:nth-child(6) { animation: shoot6 0.45s 1.1s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
      `;
      document.head.appendChild(style);
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch(e) {}
    }
  }

  loadSheetSprites() {
    const keys = Object.keys(this.sprites);
    keys.forEach(k => {
      this.sprites[k].img.onload = () => { this.sprites[k].loaded = true; };
      this.sprites[k].img.onerror = () => { this.sprites[k].loaded = false; };
      this.sprites[k].img.src = this.sprites[k].src;
    });
    setTimeout(() => {
      this.resize();
      if (this.state === 'ready') this.drawReadyScreen();
    }, 100);
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

    // Only draw ready screen from resize, never call resize from drawReadyScreen
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
        if (this.state === 'ready') this.startGame();
        this.input.up = true;
        e.preventDefault();
      }
      if (e.code === 'Escape' || e.code === 'KeyP') this.togglePause();
    });
    window.addEventListener('keyup', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') this.input.up = false;
    });
    this.container.addEventListener('touchstart', e => {
      if (this.state !== 'playing' && this.state !== 'ready') return;
      if (this.state === 'ready') this.startGame();
      this.input.up = true;
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    this.container.addEventListener('touchend',  () => { this.input.up = false; });
    this.container.addEventListener('mousedown', e => { 
      if (this.state !== 'playing' && this.state !== 'ready') return;
      if (this.state === 'ready') this.startGame();
      this.input.up = true;  
    });
    this.container.addEventListener('mouseup',   () => { this.input.up = false; });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.togglePause();
    });
  }

  createHUD() {
    // HUD top bar: coins LEFT | empty CENTER | timer RIGHT (matching user red/cyan box)
    this.hud = document.createElement('div');
    Object.assign(this.hud.style, {
      position: 'absolute', top: '12px', left: '12px', right: '12px',
      display: 'none',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none', color: '#fff',
      fontFamily: "'Orbitron', 'monospace'",
      zIndex: '15'
    });

    // LEFT: energy bars + coins
    const leftBar = document.createElement('div');
    leftBar.style.display = 'flex';
    leftBar.style.flexDirection = 'column';
    leftBar.style.alignItems = 'flex-start';
    leftBar.style.gap = '6px';
    leftBar.style.minWidth = '120px';

    this.energyContainer = document.createElement('div');
    this.energyContainer.style.display = 'flex';
    this.energyContainer.style.gap = '4px';
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

    // CENTER: Spacer
    const centerBar = document.createElement('div');

    // RIGHT: TIMER & DISCOUNT PROGRESS BAR — positioned at TOP RIGHT (in red/orange marked box)
    const rightBar = document.createElement('div');
    rightBar.style.display = 'flex';
    rightBar.style.flexDirection = 'column';
    rightBar.style.alignItems = 'flex-end';
    rightBar.style.minWidth = '160px';
    rightBar.innerHTML = `
      <div style="font-size:0.65rem; color:#00ffff; text-shadow:0 0 5px #00ffff; letter-spacing:2px; margin-bottom:2px; font-weight:bold;">TIEMPO RESTANTE</div>
      <div id="arcade-timer-text" style="font-size:2.2rem; font-weight:900; color:#ffffff; text-shadow:0 0 12px #a200ff, 0 0 24px #a200ff; line-height:1; font-family:'Orbitron',monospace;">3:00</div>

      <!-- BARRA DE PROGRESO DE DESCUENTO ACUMULABLE (Ubicación marcada en cuadrado naranja) -->
      <div style="margin-top:6px; display:flex; flex-direction:column; align-items:flex-end; width:150px;">
        <div style="display:flex; justify-content:space-between; width:100%; font-size:0.65rem; font-weight:bold; color:#ffd700; text-shadow:0 0 6px #ff8800; margin-bottom:3px;">
          <span>DESCUENTO:</span>
          <span id="arcade-discount-pct" style="color:#00ffaa; font-size:0.75rem;">0%</span>
        </div>
        <div style="width:100%; height:11px; background:rgba(0,0,0,0.8); border:1.5px solid #ff8800; border-radius:4px; overflow:hidden; box-shadow:0 0 8px #ff8800; position:relative;">
          <div id="arcade-discount-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #ff8800, #ffd700, #00f3ff); transition:width 0.25s ease-out; box-shadow:0 0 10px #00f3ff;"></div>
        </div>
        <div id="arcade-discount-sub" style="font-size:0.58rem; color:#a0a0b0; margin-top:2px; letter-spacing:0.5px;">Próximo +5%: 0/20</div>
      </div>
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
      background: 'rgba(0,0,0,0.88)', color: '#fff', zIndex: '20', pointerEvents: 'none'
    });
    this.container.appendChild(this.msgOverlay);

    this.readyOverlayEl = document.createElement('div');
    Object.assign(this.readyOverlayEl.style, {
      position: 'absolute', top: '56%', left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none', zIndex: '25',
      display: 'none'
    });
    this.container.appendChild(this.readyOverlayEl);
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

    // Actualización de la barra de progreso de descuento
    const currentTier = Math.min(5, Math.floor(this.coinsCollected / 20));
    const currentDiscountPct = currentTier * 5;
    const coinsInTier = currentTier >= 5 ? 20 : (this.coinsCollected % 20);
    const progressPct = currentTier >= 5 ? 100 : (coinsInTier / 20) * 100;

    const discountPctEl = document.getElementById('arcade-discount-pct');
    if (discountPctEl) discountPctEl.innerText = `${currentDiscountPct}%`;

    const discountBarEl = document.getElementById('arcade-discount-bar');
    if (discountBarEl) discountBarEl.style.width = `${progressPct}%`;

    const discountSubEl = document.getElementById('arcade-discount-sub');
    if (discountSubEl) {
      if (currentTier >= 5) {
        discountSubEl.innerText = '¡MÁXIMO 25% ALCANZADO!';
        discountSubEl.style.color = '#00ffaa';
      } else {
        discountSubEl.innerText = `Próximo +5%: ${coinsInTier}/20`;
        discountSubEl.style.color = '#a0a0b0';
      }
    }

    // Voz de Anunciador Arcade y Alerta Visual al completar cada +5% de descuento
    if (currentTier > this.lastDiscountThreshold && currentTier <= 5) {
      this.lastDiscountThreshold = currentTier;
      const phrases = ['AMAZING!', 'UNSTOPPABLE!', 'SUPER COMBO!', 'EXCELLENT!', 'POWER UP!'];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

      // Voz arcade entusiasta motivadora
      this.speak(`${randomPhrase}! ${currentDiscountPct} percent discount unlocked!`);

      // Alerta con destello visual
      this.showTemporaryAlert(
        `🎉 ¡${randomPhrase}!`,
        `¡Has desbloqueado un <span style="color:#00ffaa; font-weight:bold;">${currentDiscountPct}% DE DESCUENTO</span> acumulable!`,
        3.5
      );
    }

    const timerText = document.getElementById('arcade-timer-text');
    if (timerText) {
      const remaining = Math.max(0, Math.ceil(180 - this.gameTimer));
      const m = Math.floor(remaining / 60);
      const s = (remaining % 60).toString().padStart(2, '0');
      timerText.innerText = `${m}:${s}`;
      if (remaining <= 15) {
        timerText.style.color = '#ff0055';
        timerText.style.textShadow = '0 0 15px #ff0055, 0 0 30px #ff0055';
      } else {
        timerText.style.color = '#ffffff';
        timerText.style.textShadow = '0 0 12px #a200ff, 0 0 24px #a200ff';
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
      <h2 style="font-size:1.8rem;color:#ff9900;margin:0 0 8px 0;text-shadow:0 0 12px #ff0000;text-align:center;max-width:90%;font-family:'Orbitron',sans-serif;">${title}</h2>
      <p  style="font-size:0.95rem;margin:0 0 18px 0;text-align:center;max-width:90%;line-height:1.5;font-family:'Orbitron',sans-serif;">${subtitle}</p>
    `;
    if (btnText) {
      const btn = document.createElement('button');
      btn.innerText = btnText;
      Object.assign(btn.style, {
        padding: '12px 30px', fontSize: '1.1rem',
        background: 'linear-gradient(90deg,#ff9900,#ff2200)',
        color: '#fff', border: '2px solid #fff', borderRadius: '8px',
        cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 15px #ff6600',
        fontFamily: "'Orbitron', sans-serif",
        letterSpacing: '1px',
        marginTop: '10px',
        pointerEvents: 'auto',
        userSelect: 'none'
      });

      const handleBtnClick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        btnAction();
      };

      btn.addEventListener('click', handleBtnClick);
      btn.addEventListener('touchstart', handleBtnClick, { passive: false });
      this.msgOverlay.appendChild(btn);
    }
  }

  hideMessage() {
    this.msgOverlay.style.display    = 'none';
    this.msgOverlay.style.pointerEvents = 'none';
  }

  drawReadyScreen() {
    // Ensure canvas is sized (do NOT call resize here to avoid infinite loop)
    if (this.canvas.width === 0 || this.canvas.height === 0) return;
    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  startGame() {
    this.hideMessage();
    if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
    this.state = 'playing';
    this.resize();
    this.hud.style.display = 'flex';

    this.player.hp             = this.player.maxHp;
    this.player.x              = -250; // Animación de entrada
    this.player.y              = 200;
    this.player.vy             = 0;
    this.player.angle          = 0;
    this.introActive           = true;
    this.introAlpha            = 0;
    this.lastCountStep         = -1;
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
    this.billboards  = [];
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
        `Sobreviviste los 3 minutos de vuelo y recolectaste ${this.coinsCollected} monedas.<br><br>` +
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
        ? 'Personaje derivado (Fuera de combate).'
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
    // Spacing interval: 2.4s between challenge waves ensures zero screen clutter!
    if (this.spawnTimer < 2.4) return;
    this.spawnTimer = 0;

    this.stageStep = (this.stageStep || 0) + 1;
    const challengeIndex = this.stageStep % 5;
    const progress = Math.min(1, this.gameTimer / 180);
    const startX = this.logicalWidth + 30;

    if (challengeIndex === 0) {
      // DESAFÍO TIPO MEGAMAN X4 - A: Plataforma de Cubo + Monedas sobre la superficie
      const cubeY = this.logicalHeight - 200 - 70;
      this.enemies.push({
        type: 0,
        x: startX,
        y: cubeY,
        width: 140, height: 200,
        vx: -this.floorSpeed,
        hp: 9999
      });

      // 4 Monedas descansando sobre el cubo (recompensa por pisar el bloque)
      for (let i = 0; i < 4; i++) {
        this.coins.push({
          x: startX + 15 + i * 30,
          y: cubeY - 60,
          width: 60, height: 60,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      }
    } else if (challengeIndex === 1) {
      // DESAFÍO TIPO MEGAMAN X4 - B: Enemigo Volador + Arco Parabólico de Monedas por abajo
      this.spawnEnemy1(progress);

      for (let i = 0; i < 5; i++) {
        const archY = (this.logicalHeight - 160) - Math.sin((i / 4) * Math.PI) * 70;
        this.coins.push({
          x: startX + i * 48,
          y: archY,
          width: 60, height: 60,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      }
    } else if (challengeIndex === 2) {
      // DESAFÍO TIPO MEGAMAN X4 - C: Enemigo Rodante + Rombo de Monedas en el Cielo Alto
      this.spawnEnemy2(progress);

      const highY = 60;
      const diamondOffsets = [
        { dx: 0, dy: 0 }, { dx: 40, dy: -30 }, { dx: 40, dy: 30 }, { dx: 80, dy: 0 }
      ];
      diamondOffsets.forEach(off => {
        this.coins.push({
          x: startX + 60 + off.dx,
          y: highY + off.dy,
          width: 60, height: 60,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      });
    } else if (challengeIndex === 3) {
      // DESAFÍO TIPO MEGAMAN X4 - D: Pista Panorámica Libre + Rayito Powerup + Onda S de Monedas
      if (this.player.hp < this.player.maxHp * 0.8) {
        this.powerups.push({
          x: startX + 40,
          y: 110,
          width: 50, height: 50,
          vx: -(this.floorSpeed + 15),
          frameTimer: 0
        });
      }

      for (let i = 0; i < 6; i++) {
        this.coins.push({
          x: startX + i * 50,
          y: 130 + Math.sin(i * 0.9) * 55,
          width: 60, height: 60,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      }
    } else if (challengeIndex === 4) {
      // DESAFÍO TIPO MEGAMAN X4 - E: Bloque Techo + Corredor Bajo de Monedas
      this.enemies.push({
        type: 0,
        x: startX,
        y: 0,
        width: 140, height: 180,
        vx: -this.floorSpeed,
        hp: 9999
      });

      for (let i = 0; i < 5; i++) {
        this.coins.push({
          x: startX + i * 46,
          y: this.logicalHeight - 150,
          width: 60, height: 60,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      }
    }
  }

  spawnEnemy0(offsetX = 0) {
    const isTop = Math.random() > 0.5;
    this.enemies.push({
      type: 0,
      x: this.logicalWidth + 30 + offsetX,
      y: isTop ? 0 : this.logicalHeight - 200 - 40,
      width: 130, height: 200,
      vx: -this.floorSpeed,
      vy: (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 80),
      hp: 9999
    });
  }

  spawnEnemy1(progress, offsetX = 0) {
    this.enemies.push({
      type: 1,
      x: this.logicalWidth + 30 + offsetX,
      y: 20 + Math.random() * 130,
      width: 260, height: 260,
      vx: -(this.floorSpeed + 60 + progress * 90),
      hp: 1, shootTimer: Math.random() * 1.5,
      frame: 0, frameTimer: 0,
      isShooting: 0,
      isHit: 0
    });
  }

  spawnEnemy2(progress, offsetX = 0) {
    this.enemies.push({
      type: 2,
      x: this.logicalWidth + 30 + offsetX,
      y: this.logicalHeight - 120 - 40,
      width: 120, height: 120,
      vx: -(this.floorSpeed + 120 + progress * 60),
      hp: 1, shootTimer: 0,
      frame: 0, frameTimer: 0
    });
  }

  checkCollisions() {
    // Tighter, accurate hitbox centered on character (pw: 80, ph: 110)
    const px = this.player.x + 80;
    const py = this.player.y + 65;
    const pw = 80;
    const ph = 110;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (px < c.x + c.width && px + pw > c.x && py < c.y + c.height && py + ph > c.y) {
        this.coinsCollected++;
        this.createExplosion(c.x + c.width / 2, c.y + c.height / 2, 'gold', 6);
        this.coins.splice(i, 1);
        this.playCoinSound();

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

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e  = this.enemies[i];
      const ex = e.x;
      const ey = e.y;
      const ew = e.width;
      const eh = e.height;

      if (e.type === 0) {
        // CUBE PLATFORMING PHYSICS:
        const prevBottom = (this.player.prevY !== undefined ? this.player.prevY : this.player.y) + this.player.height;
        const cubeTop = ey;

        // Is player landing on top of the cube from above?
        if (prevBottom <= cubeTop + 30 && this.player.vy >= 0 && px + pw > ex + 15 && px < ex + ew - 15) {
          // LAND ON TOP SAFELY AS A SOLID PLATFORM! (NO DAMAGE)
          this.player.y = cubeTop - this.player.height;
          this.player.vy = 0;
          this.player.angle = 0;
          this.player.wasFlying = false;
          this.player.landTimer = 0;
          this.player.onCube = true;
        } else if (px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey) {
          // SIDE HIT: Push back slightly inside screen bounds (never force off-screen!)
          this.player.x = Math.max(15, this.player.x - 25);
          if (this.player.invulnerable <= 0) {
            this.player.hp -= 12;
            this.player.invulnerable = 0.6;
            this.createExplosion(px + pw, py + ph / 2, '#ff2200', 8);
          }
        }
      } else {
        if (this.player.invulnerable > 0) continue;
        if (px < ex + ew - 20 && px + pw > ex + 10 && py < ey + eh - 20 && py + ph > ey + 10) {
          this.player.hp -= 20;
          this.player.invulnerable = 1.2;
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
        this.player.invulnerable = 0.8;
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

    if (this.introActive) {
      this.player.x += dt * 110;
      this.activeAnim = this.runFrames;
      this.loopAnim = true;
      this.animSpeed = 0.11;
      
      // Fade in del mensaje
      this.introAlpha = Math.min(1, (this.introAlpha || 0) + dt * 1.5);
      
      this.player.frameTimer += dt;
      if (this.player.frameTimer > this.animSpeed && this.activeAnim && this.activeAnim.length > 0) {
        this.player.frame = (this.player.frame + 1) % this.activeAnim.length;
        this.player.frameTimer = 0;
      }
      
      const floorY = this.logicalHeight - this.player.height - 70;
      this.player.y = floorY;
      
      if (this.player.x >= 80) {
        this.player.x = 80;
        this.introActive = false;
        this.gameTimer = 0;
      }
      
      // Suelo scrolling
      this.floorOffset -= this.floorSpeed * dt;
      if (this.floorOffset <= -this.logicalWidth) this.floorOffset += this.logicalWidth;
      
      this.updateHUD();
      return; 
    }

    this.gameTimer += dt;
    const remaining = Math.max(0, 180 - this.gameTimer);
    
    // Aumento progresivo de velocidad a lo largo de los 3 minutos
    const progress = Math.min(1, this.gameTimer / 180);
    const speedBoost = 1.0 + progress * 0.90; // Hasta 90% más rápido al final
    dt *= 1.30 * speedBoost; // 30% base extra siempre

    // Físicas del jugador
    if (this.player.x < 80) {
      this.player.x += dt * 100;
      if (this.player.x > 80) this.player.x = 80;
    }

    this.player.prevY = this.player.y;
    this.player.onCube = false;

    if (this.input.up) {
      this.player.vy += this.player.jumpForce * dt * 5;
      if (this.player.vy < -340) this.player.vy = -340;
    } else {
      let fallMult = this.player.vy > 0 ? 1.6 : 1.0;
      this.player.vy += this.player.gravity * dt * fallMult;
    }
    this.player.y += this.player.vy * dt;

    const floorY = this.logicalHeight - this.player.height - 70;
    if (this.player.y < 0)        { this.player.y = 0;      this.player.vy = 0; }
    if (this.player.y > floorY)   { this.player.y = floorY; this.player.vy = 0; }

    if (this.player.invulnerable > 0) this.player.invulnerable -= dt;

    this.checkCollisions();

    // ================================================================
    // ANIMACIÓN DEL JUGADOR - VUELO ESTABLE & FLUIDO
    // ================================================================
    this.player.frameTimer += dt;
    const onGround = this.player.y >= floorY - 2 || this.player.onCube;

    this.activeAnim = [];
    this.loopAnim   = false;

    if (onGround) {
      this.player.angle = 0;
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
        this.loopAnim   = true;
        this.animSpeed  = 0.08;

        // Partículas de humo en los pies mientras corre en tierra
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
        // Caída libre / descenso
        this.activeAnim = [this.flyFallImg];
        this.loopAnim   = false;
        this.player.angle = (this.player.angle || 0) + (0.12 - (this.player.angle || 0)) * dt * 6;
      } else {
        // Postura de vuelo estable y elegante sin parpadeo (lisarfly5)
        this.activeAnim = [this.flyLoopFrames[0]];
        this.loopAnim   = false;

        // Inclinación de vuelo suave según velocidad vertical
        const targetAngle = this.player.vy < -100 ? -0.14 : -0.05;
        this.player.angle = (this.player.angle || 0) + (targetAngle - (this.player.angle || 0)) * dt * 6;

        // Partículas de propulsión de jetpack
        if (this.input.up && Math.random() > 0.35) {
          this.particles.push({
            x: this.player.x + 30 + Math.random() * 15,
            y: this.player.y + this.player.height / 2 + 35,
            vx: -220 - Math.random() * 80,
            vy: 60 + (Math.random() - 0.5) * 50,
            life: 0.2 + Math.random() * 0.15,
            maxLife: 0.35,
            color: Math.random() > 0.5 ? '#ff9900' : '#00ffff',
            size: 3 + Math.random() * 6
          });
        }
      }
    }

    if (this.loopAnim && this.activeAnim && this.activeAnim.length > 0) {
      if (this.player.frameTimer > this.animSpeed) {
        this.player.frame = (this.player.frame + 1) % this.activeAnim.length;
        this.player.frameTimer = 0;
      }
    } else {
      this.player.frame = 0;
    }

    // Generator de letreros pixel en el fondo (Lisar Studio billboards)
    this.billboardTimer = (this.billboardTimer || 0) + dt;
    if (this.billboardTimer > 6.5) {
      this.billboardTimer = 0;
      this.billboards = this.billboards || [];
      const texts = ['LISAR 3D', 'LISAR STUDIO', 'VFX REELS', 'JET RUSH', '3D MOTION'];
      const txt = texts[Math.floor(Math.random() * texts.length)];
      this.billboards.push({
        x: this.logicalWidth + 40,
        y: 35 + Math.random() * 110,
        text: txt,
        vx: -this.floorSpeed * 0.45,
        hue: Math.floor(Math.random() * 360)
      });
    }
    if (this.billboards) {
      for (let i = this.billboards.length - 1; i >= 0; i--) {
        const b = this.billboards[i];
        b.x += b.vx * dt;
        if (b.x < -180) this.billboards.splice(i, 1);
      }
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

    // Powerups (Rayitos de Energía)
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.x += p.vx * dt;
      p.frameTimer += dt * 5;
      p.y += Math.sin(p.frameTimer) * 1.8;
      if (p.x < -p.width * 2) this.powerups.splice(i, 1);
    }

    // Enemigos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.x += e.vx * dt;

      if (e.vy) {
        e.y += e.vy * dt;
        const minY = 0;
        const maxY = this.logicalHeight - e.height - 70;
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

    this.updateHUD();

    if (this.player.hp <= 0 && this.state === 'playing') {
      this.endGame(false);
    } else if (this.gameTimer >= 180 && this.state === 'playing') {
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

    // Letreros Pixel en el Fondo (Lisar Studio Billboards)
    if (this.billboards) {
      this.billboards.forEach(b => {
        this.ctx.save();
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fillStyle = 'rgba(15, 15, 30, 0.75)';
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(b.x, b.y, 140, 36);
        this.ctx.strokeRect(b.x, b.y, 140, 36);
        this.ctx.font = 'bold 12px "Orbitron", monospace';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(b.text, b.x + 70, b.y + 22);
        this.ctx.restore();
      });
    }

    // Rieles de ondas curvas de nivel estilo Gravity Dash
    const waveOffset = (performance.now() / 1000) * 1.5;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 255, 200, 0.25)';
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#00ffc8';
    this.ctx.beginPath();
    for (let x = 0; x < this.logicalWidth; x += 15) {
      const wy = 30 + Math.sin(x * 0.008 + waveOffset) * 18 + Math.cos(x * 0.015 - waveOffset * 0.5) * 10;
      if (x === 0) this.ctx.moveTo(x, wy);
      else this.ctx.lineTo(x, wy);
    }
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(255, 0, 150, 0.25)';
    this.ctx.shadowColor = '#ff0096';
    this.ctx.beginPath();
    for (let x = 0; x < this.logicalWidth; x += 15) {
      const wy = (this.logicalHeight - 95) + Math.sin(x * 0.01 + waveOffset * 1.2) * 16;
      if (x === 0) this.ctx.moveTo(x, wy);
      else this.ctx.lineTo(x, wy);
    }
    this.ctx.stroke();
    this.ctx.restore();

    // Rayos dinámicos en el mapa al ritmo de la batería según intensidad del juego
    const beatTime = performance.now() / 500; // 120 BPM drum beat
    const beatPulse = Math.pow(Math.sin(beatTime * Math.PI), 4);
    const gameIntensity = Math.min(1, this.gameTimer / 120);

    if (gameIntensity > 0.10 && beatPulse > 0.65) {
      this.ctx.save();
      // Destello púrpura cibernético en el fondo al ritmo de la batería
      this.ctx.fillStyle = `rgba(162, 0, 255, ${0.05 + beatPulse * 0.12 * gameIntensity})`;
      this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

      // Rayo neón zig-zag cayendo al mapa
      this.ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(0, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)';
      this.ctx.lineWidth = 2 + beatPulse * 3;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#00ffff';
      this.ctx.beginPath();
      let lx = (Math.random() * 0.8 + 0.1) * this.logicalWidth;
      let ly = 0;
      this.ctx.moveTo(lx, ly);
      while (ly < this.logicalHeight - 70) {
        lx += (Math.random() - 0.5) * 120;
        ly += 30 + Math.random() * 45;
        this.ctx.lineTo(lx, ly);
      }
      this.ctx.stroke();
      this.ctx.restore();
    }

    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.logicalWidth;  i += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.logicalHeight); this.ctx.stroke();
    }
    for (let i = 0; i < this.logicalHeight; i += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.logicalWidth, i); this.ctx.stroke();
    }

    // Suelo elevado a 70px con tiling prominente y línea neón en el borde superior
    if (this.sprites.floor.loaded) {
      const tiles = Math.ceil(this.logicalWidth / 800) + 2;
      for (let i = 0; i < tiles; i++) {
        this.ctx.drawImage(this.sprites.floor.img, this.floorOffset + i * 800, this.logicalHeight - 70, 800, 70);
      }
      this.ctx.save();
      this.ctx.strokeStyle = '#ff9900';
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#ff9900';
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.logicalHeight - 70);
      this.ctx.lineTo(this.logicalWidth, this.logicalHeight - 70);
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = '#ff9900';
      this.ctx.fillRect(0, this.logicalHeight - 70, this.logicalWidth, 70);
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
        this.ctx.save();
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        this.ctx.restore();
      } else {
        this.ctx.save();
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.fillStyle = 'gold';
        this.ctx.beginPath();
        this.ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });

    // Powerups (Rayitos de Energía Eléctrica)
    this.powerups.forEach(p => {
      this.ctx.save();
      const cx = p.x + p.width / 2;
      const cy = p.y + p.height / 2;
      const r = p.width / 2;
      const time = performance.now() / 150;
      
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = '#00f3ff';
      
      // Anillo pulsante
      this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r * (1 + Math.sin(time) * 0.15), 0, Math.PI * 2);
      this.ctx.stroke();

      // Icono de Rayo Eléctrico
      this.ctx.fillStyle = Math.sin(time * 3) > 0 ? '#ffffff' : '#00f3ff';
      this.ctx.beginPath();
      this.ctx.moveTo(cx + r * 0.2, cy - r * 0.85);
      this.ctx.lineTo(cx - r * 0.5, cy + r * 0.05);
      this.ctx.lineTo(cx - r * 0.05, cy + r * 0.05);
      this.ctx.lineTo(cx - r * 0.35, cy + r * 0.85);
      this.ctx.lineTo(cx + r * 0.5, cy - r * 0.05);
      this.ctx.lineTo(cx + r * 0.05, cy - r * 0.05);
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.restore();
    });

    // Enemigos con auras y transparencia limpia
    this.enemies.forEach(e => {
      if (e.type === 0) {
        // Obstáculo cyber ciberpunk con degradado translúcido y bordes neón
        this.ctx.save();
        const flash = Math.floor(performance.now() / 180) % 2 === 0;
        
        const grad = this.ctx.createLinearGradient(e.x, e.y, e.x + e.width, e.y + e.height);
        grad.addColorStop(0, flash ? 'rgba(90, 10, 110, 0.82)' : 'rgba(35, 5, 55, 0.78)');
        grad.addColorStop(1, flash ? 'rgba(160, 20, 190, 0.82)' : 'rgba(65, 10, 95, 0.78)');
        
        this.ctx.fillStyle = grad;
        this.ctx.strokeStyle = flash ? '#ff00ff' : '#00ffff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = flash ? '#ff00ff' : '#00ffff';
        
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
          this.ctx.roundRect(e.x, e.y, e.width, e.height, 8);
        } else {
          this.ctx.rect(e.x, e.y, e.width, e.height);
        }
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(e.x + 8, e.y + 8);
        this.ctx.lineTo(e.x + e.width - 8, e.y + e.height - 8);
        this.ctx.moveTo(e.x + e.width - 8, e.y + 8);
        this.ctx.lineTo(e.x + 8, e.y + e.height - 8);
        this.ctx.stroke();
        this.ctx.restore();
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
          this.ctx.save();
          this.ctx.shadowBlur = 12;
          this.ctx.shadowColor = '#00f3ff';
          this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
          this.ctx.restore();
        }
      } else if (e.type === 2) {
        let img = this.enemy2BallFrames[e.frame % this.enemy2BallFrames.length];
        if (img && img.loaded) {
          const imgRatio = img.width / img.height;
          const drawW = e.height * imgRatio;
          const drawH = e.height;
          const drawX = e.x + (e.width - drawW) / 2;
          const drawY = e.y;
          this.ctx.save();
          this.ctx.shadowBlur = 14;
          this.ctx.shadowColor = '#ff4400';
          this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
          this.ctx.restore();
        }
      }
    });

    // Proyectiles
    this.projectiles.forEach(p => {
      this.ctx.save();
      if (p.color === 'enemy1_shot' && this.shotImg.loaded) {
        const imgRatio = this.shotImg.width / this.shotImg.height;
        const drawW = p.height * imgRatio;
        const drawH = p.height;
        const drawX = p.x + (p.width - drawW) / 2;
        const drawY = p.y;
        this.ctx.shadowBlur = 10; this.ctx.shadowColor = '#00ffff';
        this.ctx.drawImage(this.shotImg, drawX, drawY, drawW, drawH);
      } else {
        this.ctx.shadowBlur = 10; this.ctx.shadowColor = p.color;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.width, p.height);
      }
      this.ctx.restore();
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
          this.ctx.filter = `drop-shadow(0 0 ${progress * 25}px #a200ff) drop-shadow(0 0 ${progress * 10}px #ff00ff)`;
        }
        
        const centerX = drawX + drawW / 2;
        const centerY = drawY + drawH / 2;
        this.ctx.translate(centerX, centerY);
        if (this.player.angle) {
          this.ctx.rotate(this.player.angle);
        }
        this.ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        this.ctx.filter = 'none';
        this.ctx.restore();
      }
      // No fallback: no more blue square

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

    // Panel de instrucciones y 3...2...1... READY! en el CENTRO DEL CANVAS (durante intro)
    if (this.introActive) {
      const alpha = this.introAlpha || 0;
      const panelW = this.logicalWidth * 0.88;
      const panelH = 190;
      const panelX = (this.logicalWidth - panelW) / 2;
      const panelY = this.logicalHeight * 0.12;

      this.ctx.save();
      this.ctx.globalAlpha = alpha;

      // Fondo semitransparente tipo panel
      this.ctx.fillStyle = 'rgba(10, 5, 20, 0.85)';
      this.ctx.strokeStyle = '#00ffff';
      this.ctx.lineWidth = 2;
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = '#00ffff';
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(panelX, panelY, panelW, panelH, 10);
      } else {
        this.ctx.rect(panelX, panelY, panelW, panelH);
      }
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      this.ctx.textAlign = 'center';
      const cx = this.logicalWidth / 2;

      // Titulo
      this.ctx.font = 'bold 26px "Orbitron", monospace';
      this.ctx.fillStyle = '#00ffff';
      this.ctx.shadowBlur = 10; this.ctx.shadowColor = '#00ffff';
      this.ctx.fillText('LISAR JET RUSH', cx, panelY + 38);
      this.ctx.shadowBlur = 0;

      // Controles
      this.ctx.font = '15px "Orbitron", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('CONTROL: ESPACIO / TOCAR PANTALLA = VOLAR', cx, panelY + 76);

      // Objetivo
      this.ctx.font = 'bold 16px "Orbitron", monospace';
      this.ctx.fillStyle = '#ff9900';
      this.ctx.shadowBlur = 8; this.ctx.shadowColor = '#ff9900';
      this.ctx.fillText('OBJETIVO: SOBREVIVE 3 MINUTOS', cx, panelY + 110);
      this.ctx.shadowBlur = 0;

      // Sub texto
      this.ctx.font = '14px "Orbitron", monospace';
      this.ctx.fillStyle = '#ffd700';
      this.ctx.fillText('JUNTA MONEDAS = DESCUENTO ACUMULABLE', cx, panelY + 138);

      // Blink CTA
      const blink = Math.floor(performance.now() / 500) % 2 === 0;
      this.ctx.font = 'bold 17px "Orbitron", monospace';
      this.ctx.fillStyle = blink ? '#ff0055' : '#ff9900';
      this.ctx.shadowBlur = 10; this.ctx.shadowColor = this.ctx.fillStyle;
      this.ctx.fillText('\u25B6 TOCATE LA PANTALLA O ESPACIO PARA INICIAR', cx, panelY + 172);
      this.ctx.shadowBlur = 0;

      // ================================================================
      // COUNTDOWN 3... 2... 1... READY! (Game 1 Style with Lisar Coin & Shooting Letters)
      // ================================================================
      const progress = (this.player.x + 250) / 330; // 0 to 1 as player enters
      const cCenterY = this.logicalHeight * 0.58;
      
      this.ctx.save();
      const currentStep = progress < 0.25 ? 3 : progress < 0.50 ? 2 : progress < 0.75 ? 1 : 0;
      
      if (this.lastCountStep !== currentStep) {
        this.lastCountStep = currentStep;
        if (currentStep > 0) {
          this.speak(currentStep.toString());
        } else if (progress >= 0.75) {
          this.speak("Ready!");
        }
      }

      if (progress < 0.25) {
        if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
        this.ctx.font = '900 75px "Orbitron", monospace';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.shadowBlur = 22; this.ctx.shadowColor = '#00ffff';
        this.ctx.fillText('3', cx, cCenterY);
      } else if (progress < 0.50) {
        if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
        this.ctx.font = '900 75px "Orbitron", monospace';
        this.ctx.fillStyle = '#ff9900';
        this.ctx.shadowBlur = 22; this.ctx.shadowColor = '#ff9900';
        this.ctx.fillText('2', cx, cCenterY);
      } else if (progress < 0.75) {
        if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
        this.ctx.font = '900 75px "Orbitron", monospace';
        this.ctx.fillStyle = '#ff0055';
        this.ctx.shadowBlur = 22; this.ctx.shadowColor = '#ff0055';
        this.ctx.fillText('1', cx, cCenterY);
      } else {
        // Moneda dorada gigante girando al centro detrás de READY!
        const coinImg = this.coinFrames[Math.floor(performance.now() / 80) % this.coinFrames.length];
        if (coinImg && coinImg.loaded) {
          const cSize = 135;
          this.ctx.shadowBlur = 35;
          this.ctx.shadowColor = '#ffd700';
          this.ctx.drawImage(coinImg, cx - cSize / 2, cCenterY - cSize / 2 - 10, cSize, cSize);
        }

        // Overlay con letras animadas que salen disparadas
        if (this.readyOverlayEl && this.readyOverlayEl.style.display !== 'block') {
          this.readyOverlayEl.style.display = 'block';
          this.readyOverlayEl.innerHTML = `
            <div class="ready-futuristic">
              <span>R</span><span>E</span><span>A</span><span>D</span><span>Y</span><span>!</span>
            </div>
          `;
        }
      }
      this.ctx.restore();

      this.ctx.restore();
    } else {
      if (this.readyOverlayEl && this.readyOverlayEl.style.display !== 'none') {
        this.readyOverlayEl.style.display = 'none';
      }
    }

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

      // Always create a fresh game instance
      window.initArcadeGame();

      // Give the constructor time to finish resize & setup, then start
      setTimeout(() => {
        if (window.arcadeGame) {
          window.arcadeGame.startGame();
        }
      }, 200);
    });
  }
});
