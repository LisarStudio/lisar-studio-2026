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
    this.audio.volume = 0.68;
    this.audio.playbackRate = 1;

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

    // Sprites de Ataque Oficiales (Atack1.png a atack8.png para Tierra | flyatack1.png a flyatack9.png para Aire)
    this.attackFrames = [];
    for (let i = 1; i <= 8; i++) {
      const img = new Image();
      img.loaded = false;
      const fileName = i <= 4 ? `Atack${i}.png` : `atack${i}.png`;
      img.src = `assets/img/${fileName}`;
      img.onload = function() { this.loaded = true; };
      this.attackFrames.push(img);
    }

    this.flyAttackFrames = [];
    for (let i = 1; i <= 9; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = `assets/img/flyatack${i}.png`;
      img.onload = function() { this.loaded = true; };
      this.flyAttackFrames.push(img);
    }

    // Sprites Oficiales de Lu (lu1.png a lu10.png) y Peter (peter1.png a peter10.png)
    this.luFrames = [];
    for (let i = 1; i <= 10; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = `assets/img/lu${i}.png`;
      img.onload = function() { this.loaded = true; };
      this.luFrames.push(img);
    }

    this.peterFrames = [];
    for (let i = 1; i <= 10; i++) {
      const img = new Image();
      img.loaded = false;
      img.src = `assets/img/peter${i}.png`;
      img.onload = function() { this.loaded = true; };
      this.peterFrames.push(img);
    }

    // Sprites Oficiales de Lu Lanzando Boost de Energía (boost1.png a Boost10.png)
    this.boostFrames = [];
    for (let i = 1; i <= 10; i++) {
      const img = new Image();
      img.loaded = false;
      const fileName = (i >= 7) ? `Boost${i}.png` : `boost${i}.png`;
      img.src = `assets/img/${fileName}`;
      img.onload = function() { this.loaded = true; };
      this.boostFrames.push(img);
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
      isAttacking: false,
      attackTimer: 0,
      attackFrame: 0,
      flightEnergy: 100,
      maxFlightEnergy: 100,
      flightDrainRate: 22,
      flightRechargeRate: 38,
      blockedByCube: false,
      horizontalVelocity: 0,
      facing: 1,
      facingFrom: 1,
      facingTarget: 1,
      turnTimer: 0,
      turnDuration: 0.12,
      
      wasFlying: false,
      landTimer: 0,
      flyAscendIndex: 0
    };

    this.enemies     = [];
    this.projectiles = [];
    this.coins       = [];
    this.particles   = [];
    this.powerups    = [];
    this.letterItems = [];
    this.collectedLisarLetters = { L: false, I: false, S: false, A: false, R: false };
    this.spawnedLetters = { L: false, I: false, S: false, A: false, R: false };
    this.letterRetryAt = {};
    this.unlockedLetters = { L: true, I: false, S: true, A: false, R: false };
    this.encounterQuietUntil = 0;
    this.extraDiscountBonus = 0;
    this.lisarWordBonusGranted = false;
    this.celebrationTimer = 0;
    this.luBoostCharges = 3; // Máximo 3 ayudas de Lu por partida
    this.luDropProgress = 0;
    this.lastLuDropAt = -Infinity;
    this.goalApproachStarted = false;
    this.goalMilestonesSpawned = {};
    this.coinLogoSpawned = false;
    this.victoryTriggered = false;
    this.victoryCoin = null;
    this.goalSceneActive = false;
    this.goalFlightActive = false;
    this.goalFlightElapsed = 0;
    this.goalFlightScale = 1;

    // Partículas de Lluvia Diagonal
    this.rainDrops = [];
    for (let i = 0; i < 60; i++) {
      this.rainDrops.push({
        x: Math.random() * (this.logicalWidth + 200),
        y: Math.random() * this.logicalHeight,
        length: 12 + Math.random() * 16,
        speed: 400 + Math.random() * 300
      });
    }

    this.floorOffset    = 0;
    this.floorSpeed     = 200;
    this.coinsCollected = 0;
    this.lastDiscountThreshold = 0;
    this.spawnTimer     = 0;
    this.isFlying       = false;

    this.input = {
      up: false,
      left: false,
      right: false,
      upJustPressed: false,
      upHeldFor: 0,
      flightHoldThreshold: 0.18
    };

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.initReadyCSS();
    this.loadSheetSprites();
    this.setupControls();
    this.createHUD();
    setTimeout(() => {
      this.resize();
    }, 50);
  }

  showInstructions() {
    if (this.instructionCardEl) this.instructionCardEl.remove();

    this.instructionCardEl = document.createElement('div');
    Object.assign(this.instructionCardEl.style, {
      position: 'absolute',
      top: '185px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '88%',
      maxWidth: '440px',
      background: 'rgba(10, 12, 28, 0.97)',
      border: '2.5px solid #00f3ff',
      boxShadow: '0 0 24px rgba(0, 243, 255, 0.9), inset 0 0 15px rgba(0, 243, 255, 0.2)',
      borderRadius: '12px',
      padding: '16px 20px',
      color: '#ffffff',
      fontFamily: "'Orbitron', sans-serif",
      zIndex: '10',
      textAlign: 'center',
      pointerEvents: 'auto',
      transition: 'opacity 0.4s ease-out'
    });

    this.instructionCardEl.innerHTML = `
      <h3 style="margin:0 0 8px 0; color:#00f3ff; font-size:1.15rem; font-weight:900; text-shadow:0 0 10px #00f3ff; letter-spacing:1px;">
        🎮 LISAR JET RUSH — GUÍA DE VUELO
      </h3>
      <div style="background:rgba(255,255,255,0.06); border:1.5px solid rgba(0,243,255,0.4); border-radius:8px; padding:10px 14px; margin-bottom:12px; text-align:left;">
        <p style="margin:5px 0; font-size:0.95rem; color:#ffffff; font-weight:bold;"><span style="color:#ffd700;">🚀 VUELO / JETPACK:</span> <b style="color:#ffffff;">Espacio</b> / <b style="color:#ffffff;">Flecha Arriba</b> / <b style="color:#ffffff;">Touch</b></p>
        <p style="margin:5px 0; font-size:0.95rem; color:#ffffff; font-weight:bold;"><span style="color:#ff00ff;">⚔️ ATAQUE CON BÁCULO:</span> Tecla <b style="color:#ffffff;">X</b> / <b style="color:#ffffff;">J</b> / <b style="color:#ffffff;">Z</b> / <b style="color:#ffffff;">Botón</b></p>
        <p style="margin:5px 0; font-size:0.95rem; color:#ffffff; font-weight:bold;"><span style="color:#00ffaa;">⏸️ PAUSA:</span> Tecla <b style="color:#ffffff;">ESC</b> / <b style="color:#ffffff;">P</b></p>
      </div>
      <p style="margin:0 0 12px 0; font-size:0.85rem; color:#ffffff; font-weight:bold; line-height:1.35;">
        ¡Sobrevive los <span style="color:#00ffff;">3:00 minutos</span>, destruye enemigos con tu báculo y acumula hasta <span style="color:#00ffaa;">25% de descuento</span>!
      </p>
      <button id="start-instructions-btn" style="padding:10px 26px; font-size:1.05rem; background:linear-gradient(90deg, #ff9900, #ff0055); color:#fff; border:2px solid #fff; border-radius:8px; cursor:pointer; font-weight:bold; boxShadow:0 0 16px #ff8800; fontFamily:'Orbitron', sans-serif;">
        ¡INICIAR JUEGO!
      </button>
    `;

    this.container.appendChild(this.instructionCardEl);

    const startBtn = document.getElementById('start-instructions-btn');
    if (startBtn) {
      const handleStart = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        this.hideInstructionsCard();
        this.startGame();
      };
      startBtn.addEventListener('click', handleStart);
      startBtn.addEventListener('touchstart', handleStart, { passive: false });
    }
  }

  hideInstructionsCard() {
    if (this.instructionCardEl) {
      this.instructionCardEl.style.opacity = '0';
      setTimeout(() => {
        if (this.instructionCardEl) this.instructionCardEl.remove();
        this.instructionCardEl = null;
      }, 400);
    }
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
          font-size: 38px;
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
        utterance.rate = 0.9;
        utterance.pitch = 2.0;
        utterance.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length) {
          const female = voices.find(v => /Samantha|Alloy|Serena|Zira|Victoria|Fiona|Google UK English Female|Google US English/i.test(v.name));
          const bright = voices.find(v => /Google|Microsoft|Alloy|Serena|Samantha|Zira/i.test(v.name));
          if (female) utterance.voice = female;
          else if (bright) utterance.voice = bright;
        }
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

  playAttackSound() {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch(e) {}
  }

  performAttack() {
    if (this.state !== 'playing' || this.introActive) return;
    if (this.player.isAttacking) return;
    
    this.player.isAttacking = true;
    this.player.attackTimer = 0.45;
    this.player.attackFrame = 0;
    this.playAttackSound();

    const px = this.player.x + 80;
    const py = this.player.y + 65;
    const pw = 80;
    const ph = 110;

    const attackFacing = this.player.facingTarget || 1;
    const slashX = attackFacing > 0 ? px + pw - 10 : px - 130;
    const slashY = py - 30;
    const slashW = 140;
    const slashH = ph + 60;

    // Destellos de corte de espada neón
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: slashX + Math.random() * slashW,
        y: slashY + Math.random() * slashH,
        vx: attackFacing * (180 + Math.random() * 220),
        vy: (Math.random() - 0.5) * 160,
        life: 0.22,
        maxLife: 0.22,
        color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
        size: 4 + Math.random() * 6
      });
    }

    // Destrucción instantánea de enemigos al ser atacados con espada
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.type === 0) continue; // Cubes are solid scenery, never enemy drops.
      if (slashX < e.x + e.width && slashX + slashW > e.x && slashY < e.y + e.height && slashY + slashH > e.y) {
        this.createExplosion(e.x + e.width / 2, e.y + e.height / 2, 'enemy_explode', 1, e.width);
        this.playExplosionSound();
        this.enemies.splice(i, 1);
        this.coinsCollected += 1;
        // Controlled rewards: after using Lu, every third defeated enemy
        // guarantees one replacement charge. Never flood the route with them.
        if (this.luBoostCharges < 3) this.luDropProgress += 1;
        const hasPendingLuCharge = this.powerups.some(p => p.isLuHelp);
        const shouldDropLuCharge =
          this.luBoostCharges < 3 &&
          this.luDropProgress >= 3 &&
          this.gameTimer - this.lastLuDropAt >= 10 &&
          !hasPendingLuCharge;

        if (shouldDropLuCharge) {
          this.powerups.push({
            x: e.x, y: e.y, width: 46, height: 46,
            vx: -this.floorSpeed * 0.55,
            isLuHelp: true,
            frameTimer: 0
          });
          this.luDropProgress = 0;
          this.lastLuDropAt = this.gameTimer;
        } else {
          // Flight and health remain occasional secondary rewards.
          const r = Math.random();
          if (r < 0.16) {
          this.powerups.push({ x: e.x, y: e.y, width: 44, height: 44, vx: -this.floorSpeed * 0.6, isFlight: true, frameTimer: 0 });
          } else if (r < 0.32) {
            this.powerups.push({ x: e.x, y: e.y, width: 44, height: 44, vx: -this.floorSpeed * 0.6, isEnergy: true, frameTimer: 0 });
          }
        }
      }
    }
  }

  setupControls() {
    const beginUp = () => {
      if (this.input.up || this.introActive) return;
      this.input.up = true;
      this.input.upJustPressed = true;
      this.input.upHeldFor = 0;
    };
    const endUp = () => {
      this.input.up = false;
      this.input.upHeldFor = 0;
    };

    window.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (this.state === 'ready' && !this.instructionCardEl) this.startGame();
        beginUp();
        e.preventDefault();
      }
      if (e.code === 'KeyX' || e.code === 'KeyJ' || e.code === 'KeyZ') {
        if (this.state === 'ready' && !this.instructionCardEl) this.startGame();
        this.performAttack();
        e.preventDefault();
      }
      if ((e.code === 'KeyA' || e.code === 'ArrowLeft') && this.state === 'playing' && !this.introActive) {
        this.input.left = true;
        e.preventDefault();
      }
      if ((e.code === 'KeyD' || e.code === 'ArrowRight') && this.state === 'playing' && !this.introActive) {
        this.input.right = true;
        e.preventDefault();
      }
      if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat) this.togglePause();
    });
    window.addEventListener('keyup', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') endUp();
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
    });
    this.container.addEventListener('touchstart', e => {
      if (this.state !== 'playing' && this.state !== 'ready') return;
      if (this.instructionCardEl) return;
      if (this.state === 'ready') this.startGame();
      beginUp();
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    this.container.addEventListener('touchend', endUp);
    this.container.addEventListener('touchcancel', endUp);
    this.container.addEventListener('mousedown', e => { 
      if (this.state !== 'playing' && this.state !== 'ready') return;
      if (this.instructionCardEl) return;
      if (this.state === 'ready') this.startGame();
      beginUp();
    });
    window.addEventListener('mouseup', endUp);
    document.addEventListener('visibilitychange', () => {
      endUp();
      this.input.left = false;
      this.input.right = false;
      if (this.state !== 'playing') return;
      if (document.hidden) {
        this.audio.pause();
      } else {
        this.audio.play().catch(() => {});
        this.lastTime = performance.now();
      }
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
      zIndex: '50'
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

    // TRACKER DE LETRAS LISAR EN EL HUD (Naranja Brillante)
    const lisarRow = document.createElement('div');
    lisarRow.id = 'arcade-lisar-row';
    lisarRow.style.display = 'flex';
    lisarRow.style.alignItems = 'center';
    lisarRow.style.gap = '3px';
    lisarRow.style.marginTop = '4px';
    lisarRow.innerHTML = `
      <div style="font-size:0.58rem; color:#ff9900; font-weight:bold; margin-right:1px; text-shadow:0 0 5px #ff8800;">BONUS:</div>
      <span id="letter-badge-L" style="padding:1px 4px; border-radius:3px; background:rgba(30,20,0,0.8); border:1px solid #554400; color:#554400; font-weight:bold; font-size:0.7rem; font-family:'Orbitron',sans-serif;">L</span>
      <span id="letter-badge-I" style="padding:1px 4px; border-radius:3px; background:rgba(30,20,0,0.8); border:1px solid #554400; color:#554400; font-weight:bold; font-size:0.7rem; font-family:'Orbitron',sans-serif;">I</span>
      <span id="letter-badge-S" style="padding:1px 4px; border-radius:3px; background:rgba(30,20,0,0.8); border:1px solid #554400; color:#554400; font-weight:bold; font-size:0.7rem; font-family:'Orbitron',sans-serif;">S</span>
      <span id="letter-badge-A" style="padding:1px 4px; border-radius:3px; background:rgba(30,20,0,0.8); border:1px solid #554400; color:#554400; font-weight:bold; font-size:0.7rem; font-family:'Orbitron',sans-serif;">A</span>
      <span id="letter-badge-R" style="padding:1px 4px; border-radius:3px; background:rgba(30,20,0,0.8); border:1px solid #554400; color:#554400; font-weight:bold; font-size:0.7rem; font-family:'Orbitron',sans-serif;">R</span>
    `;

    // INDICADOR DE AYUDAS DE LU (Max 3 por partida)
    const luChargeRow = document.createElement('div');
    luChargeRow.id = 'arcade-lu-charge-row';
    luChargeRow.style.display = 'flex';
    luChargeRow.style.alignItems = 'center';
    luChargeRow.style.gap = '3px';
    luChargeRow.style.marginTop = '4px';
    luChargeRow.innerHTML = `
      <div style="font-size:0.58rem; color:#00ffaa; font-weight:bold; margin-right:2px; text-shadow:0 0 5px #00ffaa;">AYUDAS LU:</div>
      <span id="lu-charge-icons" style="color:#ffd700; font-size:0.75rem; letter-spacing:2px; font-weight:bold;">⚡⚡⚡</span>
    `;

    leftBar.appendChild(this.energyContainer);
    leftBar.appendChild(coinRow);
    leftBar.appendChild(lisarRow);
    leftBar.appendChild(luChargeRow);

    // Compact notification rail, directly below AYUDAS LU.
    this.hudAlertSlot = document.createElement('div');
    this.hudAlertSlot.setAttribute('aria-live', 'polite');
    this.hudAlertSlot.setAttribute('aria-atomic', 'true');
    Object.assign(this.hudAlertSlot.style, {
      width: 'clamp(118px, 38vw, 155px)',
      minHeight: '0',
      marginTop: '2px',
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      overflow: 'visible',
      pointerEvents: 'none'
    });
    leftBar.appendChild(this.hudAlertSlot);

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
        <div id="arcade-flight-widget" aria-label="Energía de vuelo" style="width:120px; height:20px; margin-top:5px; display:flex; align-items:center; gap:5px; padding:2px 5px; box-sizing:border-box; background:rgba(5,12,20,0.56); border:1px solid rgba(0,243,255,0.32); border-radius:5px; opacity:0; transform:translateY(-2px); transition:opacity 0.35s ease, transform 0.35s ease;">
          <svg id="arcade-flight-wings" width="15" height="11" viewBox="0 0 44 28" aria-hidden="true" style="flex:0 0 auto; filter:drop-shadow(0 0 3px #00f3ff);">
            <path d="M20 23C12 22 5 17 2 7c7 1 13 4 18 10M24 23c8-1 15-6 18-16-7 1-13 4-18 10" fill="none" stroke="#7afcff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 18l2 6 2-6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <div style="flex:1; height:5px; overflow:hidden; background:rgba(17,25,37,0.8); border-radius:4px;">
            <div id="arcade-flight-bar" style="width:100%; height:100%; background:#24d9ee; box-shadow:0 0 7px #00f3ff; transition:width 0.14s linear, background-color 0.2s ease;"></div>
          </div>
          <span id="arcade-flight-percent" style="min-width:25px; color:#7afcff; font-size:0.48rem; line-height:1; font-weight:900; text-align:right;">100%</span>
        </div>
      </div>
    `;

    this.hudLeftBar = leftBar;
    this.hudRightBar = rightBar;

    this.hud.appendChild(leftBar);
    this.hud.appendChild(centerBar);
    this.hud.appendChild(rightBar);
    this.container.appendChild(this.hud);

    this.updateEnergyBars();

    this.msgOverlay = document.createElement('div');
    Object.assign(this.msgOverlay.style, {
      position: 'absolute', right: '16px',
      width: 'min(42vw, 360px)',
      top: '185px',
      minHeight: '96px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 10px', boxSizing: 'border-box',
      pointerEvents: 'none', zIndex: '5'
    });
    this.container.appendChild(this.msgOverlay);

    this.readyOverlayEl = document.createElement('div');
    Object.assign(this.readyOverlayEl.style, {
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'calc(100% - 48px)', maxWidth: '360px',
      boxSizing: 'border-box', textAlign: 'center',
      pointerEvents: 'none', zIndex: '5',
      display: 'none'
    });
    this.container.appendChild(this.readyOverlayEl);

    this.introOverlayEl = document.createElement('div');
    Object.assign(this.introOverlayEl.style, {
      position: 'absolute', left: '50%', top: '14%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: '360px',
      padding: '13px 14px',
      display: 'none',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      textAlign: 'center',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      background: 'rgba(5, 11, 18, 0.9)',
      border: '1px solid rgba(122,252,255,0.42)',
      borderRadius: '14px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.42), 0 0 18px rgba(0,243,255,0.12)',
      zIndex: '12'
    });
    this.introOverlayEl.innerHTML = `
      <div style="font-family:'Orbitron',sans-serif; font-size:0.58rem; color:#7afcff; font-weight:800; letter-spacing:2.4px;">MISIÓN ARCADE</div>
      <div style="display:flex; width:100%; min-width:0; align-items:center; justify-content:center; gap:7px;">
        <span style="display:grid; flex:0 0 auto; place-items:center; width:26px; height:26px; border:1px solid rgba(122,252,255,0.45); border-radius:50%; background:#0a1722; color:#7afcff; font-size:0.78rem;">✦</span>
        <div style="min-width:0; font-family:'Orbitron',sans-serif; font-weight:900; font-size:clamp(0.95rem,4vw,1.25rem); color:#ffffff; letter-spacing:1px; line-height:1.2; overflow-wrap:anywhere;">LISAR JET RUSH</div>
      </div>
      <div style="width:42px; height:2px; background:#24d9ee; box-shadow:0 0 8px rgba(0,243,255,0.65);"></div>
      <div style="display:flex; width:100%; flex-wrap:wrap; justify-content:center; gap:6px; font-family:'Orbitron',sans-serif; font-size:0.58rem; line-height:1.3;">
        <span style="max-width:100%; box-sizing:border-box; padding:5px 7px; border-radius:6px; background:#101b27; color:#dffcff; border:1px solid rgba(255,255,255,0.1); overflow-wrap:anywhere;">↑ ESPACIO / TOQUE · VOLAR</span>
        <span style="max-width:100%; box-sizing:border-box; padding:5px 7px; border-radius:6px; background:#101b27; color:#dffcff; border:1px solid rgba(255,255,255,0.1); overflow-wrap:anywhere;">A / D · MOVER</span>
        <span style="max-width:100%; box-sizing:border-box; padding:5px 7px; border-radius:6px; background:#101b27; color:#dffcff; border:1px solid rgba(255,255,255,0.1); overflow-wrap:anywhere;">X / J / Z · ATACAR</span>
      </div>
      <div style="width:100%; max-width:100%; font-family:'Orbitron',sans-serif; font-size:0.58rem; color:#b8cbd6; line-height:1.5; overflow-wrap:anywhere;">SOBREVIVE 3 MINUTOS · RECOGE MONEDAS · DESBLOQUEA TU DESCUENTO</div>
    `;
    this.container.appendChild(this.introOverlayEl);
  }

  prepareHUDEntrance() {
    this._hudRevealed = false;
    this.hud.style.display = 'flex';

    [this.hudLeftBar, this.hudRightBar].forEach(bar => {
      if (!bar) return;
      bar.style.opacity = '0';
      bar.style.willChange = 'transform, opacity';
      bar.style.transition = 'transform 0.58s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease';
    });

    if (this.hudLeftBar) this.hudLeftBar.style.transform = 'translateX(-125%)';
    if (this.hudRightBar) this.hudRightBar.style.transform = 'translateX(125%)';
  }

  revealHUD() {
    if (this._hudRevealed) return;
    this._hudRevealed = true;

    const reduceMotion = typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealBar = bar => {
      if (!bar) return;
      bar.style.opacity = '1';
      bar.style.transform = 'translateX(0)';
    };

    if (reduceMotion) {
      revealBar(this.hudLeftBar);
      revealBar(this.hudRightBar);
      return;
    }

    requestAnimationFrame(() => {
      revealBar(this.hudLeftBar);
      setTimeout(() => revealBar(this.hudRightBar), 110);
    });
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

  updateLetterBadges() {
    ['L', 'I', 'S', 'A', 'R'].forEach(l => {
      const el = document.getElementById(`letter-badge-${l}`);
      if (el && this.collectedLisarLetters && this.collectedLisarLetters[l]) {
        el.style.background = 'linear-gradient(180deg, #ff9900, #ff4400)';
        el.style.border = '1px solid #ffd700';
        el.style.color = '#ffffff';
        el.style.boxShadow = '0 0 10px #ff8800';
        el.style.textShadow = '0 0 6px #ffffff';
      } else if (el) {
        el.style.background = 'rgba(30,20,0,0.8)';
        el.style.border = '1px solid #554400';
        el.style.color = '#554400';
        el.style.boxShadow = 'none';
        el.style.textShadow = 'none';
      }
    });
  }

  getDiscountBreakdown() {
    const rawCoinTier = Math.floor(this.coinsCollected / 20);
    const coinTier = Math.min(5, rawCoinTier);
    const baseDiscount = coinTier * 5;
    const letterBonus = this.lisarWordBonusGranted ? 10 : 0;
    const totalDiscount = Math.min(35, baseDiscount + letterBonus);
    return {
      rawCoinTier,
      coinTier,
      baseDiscount,
      letterBonus,
      totalDiscount,
      coinCapReached: coinTier >= 5,
      maxReached: totalDiscount >= 35
    };
  }

  updateHUD() {
    this.updateEnergyBars();
    this.updateLetterBadges();

    const luIconsEl = document.getElementById('lu-charge-icons');
    if (luIconsEl) {
      const remaining = Math.max(0, this.luBoostCharges !== undefined ? this.luBoostCharges : 3);
      luIconsEl.innerText = remaining > 0 ? '⚡'.repeat(remaining) : '❌ AGOTADAS';
    }

    const coins = document.getElementById('arcade-coin-text');
    if (coins) coins.innerText = this.coinsCollected;

    // Cumulative discount: 25% from coins + 10% from LISAR = 35% maximum.
    const discount = this.getDiscountBreakdown();
    const currentDiscountPct = discount.baseDiscount;
    const totalDiscountPct = discount.totalDiscount;
    const coinsInTier = this.coinsCollected % 20;
    const progressPct = Math.min(100, (totalDiscountPct / 35) * 100);

    const discountPctEl = document.getElementById('arcade-discount-pct');
    if (discountPctEl) discountPctEl.innerText = `${totalDiscountPct}%`;

    const discountBarEl = document.getElementById('arcade-discount-bar');
    if (discountBarEl) discountBarEl.style.width = `${progressPct}%`;

    const discountSubEl = document.getElementById('arcade-discount-sub');
    if (discountSubEl) {
      if (discount.maxReached) {
        discountSubEl.innerText = 'MÁXIMO 35% ALCANZADO';
        discountSubEl.style.color = '#00ffaa';
      } else if (discount.coinCapReached) {
        discountSubEl.innerText = 'Completa LISAR para llegar al 35%';
        discountSubEl.style.color = '#ffd700';
      } else {
        discountSubEl.innerText = `Próximo +5%: ${coinsInTier}/20`;
        discountSubEl.style.color = '#a0a0b0';
      }
    }

    const flightPercent = Math.round(Math.max(0, Math.min(100,
      (this.player.flightEnergy / this.player.maxFlightEnergy) * 100
    )));
    const flightWidget = document.getElementById('arcade-flight-widget');
    const flightBar = document.getElementById('arcade-flight-bar');
    const flightPercentEl = document.getElementById('arcade-flight-percent');
    const flightWings = document.getElementById('arcade-flight-wings');
    const floorY = this.logicalHeight - this.player.height - 70;
    const isGrounded = this.player.y >= floorY - 2;
    const flightIndicatorActive = !isGrounded || flightPercent < 100;

    if (flightWidget) {
      flightWidget.style.opacity = flightIndicatorActive ? '1' : '0';
      flightWidget.style.transform = flightIndicatorActive ? 'translateY(0)' : 'translateY(-2px)';
      flightWidget.setAttribute('aria-label', `Energía de vuelo: ${flightPercent}%`);
    }

    if (flightBar) {
      flightBar.style.width = `${flightPercent}%`;
      flightBar.style.backgroundColor = flightPercent <= 20 ? '#ff5b63' : flightPercent <= 50 ? '#ffb52e' : '#24d9ee';
    }
    if (flightPercentEl) {
      flightPercentEl.innerText = `${flightPercent}%`;
      flightPercentEl.style.color = flightPercent <= 20 ? '#ff7b82' : flightPercent <= 50 ? '#ffd166' : '#7afcff';
    }
    if (flightWings) {
      flightWings.style.opacity = flightPercent === 0 ? '0.35' : '1';
    }

    // Voz de Anunciador Arcade y Alerta Visual al completar cada +5% de descuento
    if (discount.coinTier > this.lastDiscountThreshold) {
      this.lastDiscountThreshold = discount.coinTier;
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
    const host = this.hudAlertSlot || this.hudLeftBar || this.container;
    if (this.activeHudAlertTimer) clearTimeout(this.activeHudAlertTimer);
    if (this.activeHudAlertRemoveTimer) clearTimeout(this.activeHudAlertRemoveTimer);
    if (this.activeHudAlert) this.activeHudAlert.remove();

    const alertEl = document.createElement('div');
    Object.assign(alertEl.style, {
      position: 'relative',
      margin: '0',
      background: 'linear-gradient(90deg, rgba(5,20,22,0.94), rgba(7,13,22,0.88))',
      border: '1px solid rgba(0,243,255,0.42)',
      borderLeft: '3px solid #00ffaa',
      boxShadow: '0 5px 14px rgba(0,0,0,0.34), 0 0 11px rgba(0,243,255,0.16)',
      color: '#f8f9fa',
      borderRadius: '6px',
      padding: '6px 7px',
      boxSizing: 'border-box',
      textAlign: 'left',
      fontFamily: "'Orbitron', sans-serif",
      zIndex: '1',
      maxWidth: '100%',
      minWidth: '0',
      width: '100%',
      transition: 'opacity 0.24s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      opacity: '0',
      transform: 'translateX(-10px)',
      pointerEvents: 'none'
    });
    alertEl.innerHTML = `
      <div style="max-width:100%; margin:0 0 2px; color:#7afcff; font-size:clamp(0.5rem,2.25vw,0.64rem); font-weight:800; letter-spacing:0.25px; line-height:1.2; text-transform:uppercase; overflow-wrap:anywhere;">${title}</div>
      <div style="max-width:100%; margin:0; font-size:clamp(0.43rem,1.9vw,0.54rem); line-height:1.3; opacity:0.9; color:#d8f8ff; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${subtitle}</div>
    `;
    host.appendChild(alertEl);
    this.activeHudAlert = alertEl;
    requestAnimationFrame(() => {
      if (!alertEl.isConnected) return;
      alertEl.style.opacity = '1';
      alertEl.style.transform = 'translateX(0)';
    });
    this.activeHudAlertTimer = setTimeout(() => {
      alertEl.style.opacity = '0';
      alertEl.style.transform = 'translateX(-8px)';
      this.activeHudAlertRemoveTimer = setTimeout(() => {
        alertEl.remove();
        if (this.activeHudAlert === alertEl) this.activeHudAlert = null;
      }, 320);
    }, seconds * 1000);
  }

  shareScore() {
    const discount = this.getDiscountBreakdown().totalDiscount;
    const score = this.coinsCollected * 120;
    const shareText = `🚀 ¡Conseguí ${this.coinsCollected} monedas, ${score} puntos y ${discount}% de descuento en Lisar Jet Rush de Lisar Studio! 🎮✨ ¿Puedes superar mi récord?`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'Lisar Jet Rush - Lisar Studio 2026',
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
          alert('📋 ¡Puntaje copiado al portapapeles! Compártelo en tus redes sociales.');
        }).catch(() => {
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        });
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      }
    }
  }

  shareToWhatsApp() {
    const discount = this.getDiscountBreakdown().totalDiscount;
    const score = this.coinsCollected * 120;
    const text = `🚀 Terminé Lisar Jet Rush con ${this.coinsCollected} monedas, ${score} puntos y ${discount}% de descuento. ¿Puedes superar mi resultado? ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  showMessage(title, subtitle, buttons = [], legacyAction = null) {
    Object.assign(this.msgOverlay.style, {
      display: 'flex',
      left: '50%',
      right: 'auto',
      top: 'clamp(132px, 24%, 170px)',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: '360px',
      minHeight: '0',
      padding: '0',
      boxSizing: 'border-box',
      zIndex: '30'
    });
    // No bloquear la jugabilidad cuando el juego está en estado 'playing'
    this.msgOverlay.style.pointerEvents = (this.state === 'playing') ? 'none' : 'auto';
    this.msgOverlay.innerHTML = `
      <div style="background:rgba(8,14,18,0.94); border:1px solid rgba(0,255,149,0.36); box-shadow:0 16px 36px rgba(0,0,0,0.48), 0 0 24px rgba(24,255,174,0.12); border-radius:16px; padding:20px 18px; width:100%; text-align:center; box-sizing:border-box; backdrop-filter:blur(8px); overflow:hidden;">
        <h2 style="font-size:1.08rem; color:#baf7ff; margin:0 0 10px; text-shadow:0 0 10px rgba(0,255,155,0.22); font-family:'Orbitron',sans-serif; font-weight:800; letter-spacing:0.7px; overflow-wrap:anywhere;">${title}</h2>
        <div style="font-size:0.78rem; margin:0 auto; max-width:290px; text-align:center; line-height:1.5; font-family:'Orbitron',sans-serif; color:rgba(227,255,255,0.88); font-weight:600; overflow-wrap:anywhere;">${subtitle}</div>
        <div id="msg-btn-container" style="display:flex; flex-direction:column; gap:9px; justify-content:center; align-items:center; width:100%; margin-top:16px;"></div>
      </div>
    `;

    const btnContainer = document.getElementById('msg-btn-container');
    const hasExplicitShareButton = Array.isArray(buttons) && buttons.some(button =>
      button && typeof button.text === 'string' && button.text.includes('COMPARTIR')
    );

    // Botón de Compartir Redes Sociales
    const shareBtn = document.createElement('button');
    shareBtn.innerHTML = '📲 COMPARTIR PUNTAJE';
    Object.assign(shareBtn.style, {
      padding: '10px 16px', fontSize: '0.88rem',
      background: 'linear-gradient(90deg, #00f3ff, #a200ff)',
      color: '#fff', border: '2px solid #00ffff', borderRadius: '8px',
      cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 14px #00f3ff',
      fontFamily: "'Orbitron', sans-serif",
      letterSpacing: '1px',
      pointerEvents: 'auto',
      userSelect: 'none',
      width: 'min(100%, 240px)',
      minHeight: '44px',
      boxSizing: 'border-box'
    });
    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.shareScore();
    });
    if (btnContainer && !hasExplicitShareButton) btnContainer.appendChild(shareBtn);

    let btnList = [];
    if (typeof buttons === 'string') {
      btnList = [{ text: buttons, action: legacyAction, primary: true }];
    } else if (Array.isArray(buttons)) {
      btnList = buttons;
    }

    btnList.forEach(b => {
      if (!b || !b.text) return;
      const btn = document.createElement('button');
      btn.innerText = b.text;
      Object.assign(btn.style, {
        padding: '10px 18px', fontSize: '0.95rem',
        background: b.primary ? 'linear-gradient(90deg,#ff9900,#ff2200)' : 'linear-gradient(90deg,#00ffaa,#00aa66)',
        color: '#fff', border: '2px solid #fff', borderRadius: '8px',
        cursor: 'pointer', fontWeight: 'bold', boxShadow: b.primary ? '0 0 15px #ff6600' : '0 0 15px #00ffaa',
        fontFamily: "'Orbitron', sans-serif",
        letterSpacing: '1px',
        pointerEvents: 'auto',
        userSelect: 'none',
        width: 'min(100%, 240px)',
        minHeight: '44px',
        boxSizing: 'border-box'
      });

      const handleBtnClick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (b.action) b.action();
      };

      btn.addEventListener('click', handleBtnClick);
      btn.addEventListener('touchstart', handleBtnClick, { passive: false });
      if (btnContainer) btnContainer.appendChild(btn);
    });
  }

  hideMessage() {
    this.msgOverlay.style.display    = 'none';
    this.msgOverlay.style.pointerEvents = 'none';
  }

  // ------------------ Preloader / Asset Decoder ------------------
  showPreloader() {
    if (this.preloaderEl) return;
    const ov = document.createElement('div');
    ov.style.position = 'absolute';
    ov.style.left = '0'; ov.style.top = '0';
    ov.style.width = '100%'; ov.style.height = '100%';
    ov.style.display = 'flex'; ov.style.alignItems = 'center'; ov.style.justifyContent = 'center';
    ov.style.background = 'rgba(0,0,0,0.85)';
    ov.style.zIndex = '60';

    const box = document.createElement('div');
    box.style.width = '420px'; box.style.maxWidth = '88%'; box.style.padding = '18px';
    box.style.background = 'linear-gradient(180deg,#0b0b0d, #121214)'; box.style.borderRadius = '12px';
    box.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6)'; box.style.textAlign = 'center';
    box.style.color = '#fff';

    const title = document.createElement('div');
    title.innerText = 'Cargando recursos...'; title.style.fontSize = '1.05rem'; title.style.marginBottom = '8px';
    box.appendChild(title);

    const progressWrap = document.createElement('div');
    progressWrap.style.height = '14px'; progressWrap.style.background = '#111'; progressWrap.style.borderRadius = '8px';
    progressWrap.style.overflow = 'hidden'; progressWrap.style.margin = '10px 0 6px';
    const bar = document.createElement('div');
    bar.style.width = '0%'; bar.style.height = '100%'; bar.style.background = 'linear-gradient(90deg,#72C936,#5EAE27)';
    progressWrap.appendChild(bar);
    box.appendChild(progressWrap);

    const pct = document.createElement('div'); pct.innerText = '0%'; pct.style.fontSize = '0.9rem'; pct.style.opacity = '0.95';
    box.appendChild(pct);

    ov.appendChild(box);
    this.container.appendChild(ov);
    this.preloaderEl = ov;
    this._preloaderBar = bar; this._preloaderPct = pct;
  }

  hidePreloader() {
    if (!this.preloaderEl) return;
    try { this.preloaderEl.remove(); } catch (e) {}
    this.preloaderEl = null; this._preloaderBar = null; this._preloaderPct = null;
  }

  _collectImageList() {
    const imgs = [];
    const pushIfImg = (v) => { if (!v) return; if (Array.isArray(v)) v.forEach(x=>x && imgs.push(x)); else imgs.push(v); };
    pushIfImg(this.runFrames);
    pushIfImg(this.flyAscendFrames);
    pushIfImg(this.flyLoopFrames);
    pushIfImg(this.flyFallImg);
    pushIfImg(this.flyLandImg);
    pushIfImg(this.attackFrames);
    pushIfImg(this.coinFrames);
    pushIfImg(this.enemy1FlyFrames);
    pushIfImg(this.enemy1FireImg);
    pushIfImg(this.enemy1DamageImg);
    pushIfImg(this.enemy1ExplodeImg);
    pushIfImg(this.shotImg);
    pushIfImg(this.enemy2BallFrames);
    pushIfImg(this.logoImg);
    pushIfImg(this.luFrames);
    pushIfImg(this.peterFrames);
    pushIfImg(this.boostFrames);
    // sprites map
    if (this.sprites) {
      Object.values(this.sprites).forEach(s => { if (s && s.img) imgs.push(s.img); });
    }
    // remove duplicates
    const seen = new Set();
    return imgs.filter(i => { if (!i) return false; if (seen.has(i.src)) return false; seen.add(i.src); return true; });
  }

  async preloadAssets(progressCb = ()=>{}) {
    const imgs = this._collectImageList();
    const total = imgs.length + 1; // +1 for audio
    let done = 0;

    const tick = () => {
      done++; const p = Math.round((done / total) * 100);
      try { if (this._preloaderBar) this._preloaderBar.style.width = p + '%'; if (this._preloaderPct) this._preloaderPct.innerText = p + '%'; } catch(e){}
      progressCb(p);
    };

    const imgPromises = imgs.map(img => new Promise(async (resolve) => {
      if (img.complete && img.naturalWidth && img.naturalWidth > 0) { try { if ('createImageBitmap' in window) await createImageBitmap(img); } catch(e){} tick(); return resolve(); }
      const onLoad = async () => { try { if (img.decode) { await img.decode(); } if ('createImageBitmap' in window) await createImageBitmap(img); } catch(e){} tick(); resolve(); };
      const onErr = () => { tick(); resolve(); };
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onErr, { once: true });
      // ensure src is set (in case some were created late)
      if (!img.src) { tick(); resolve(); }
    }));

    // Audio readiness promise
    const audioPromise = new Promise((resolve) => {
      let resolved = false;
      const onReady = () => { if (resolved) return; resolved = true; tick(); resolve(); };
      const onTimeout = () => { if (resolved) return; resolved = true; tick(); resolve(); };
      this.audio.addEventListener('canplaythrough', onReady, { once: true });
      this.audio.addEventListener('loadeddata', onReady, { once: true });
      this.audio.addEventListener('error', onReady, { once: true });
      this.audio.load();
      setTimeout(onTimeout, 5000);
    });

    await Promise.all([...imgPromises, audioPromise]);
  }

  initPreloaderAndStart() {
    // Only run once
    if (this._preloaderStarted) return; this._preloaderStarted = true;
    this.showPreloader();
    // Return the promise so callers can await completion
    // Prefer background silent preload without forcing Play to wait: keep assetsReady flag but hide preloader quickly
    return this.preloadAssets((p) => {}).then(() => {
      // smooth hide but keep short delay
      setTimeout(() => {
        this.hidePreloader();
        this.assetsReady = true;
      }, 80);
    }).catch(() => {
      this.hidePreloader(); this.assetsReady = true;
    });
  }

  drawReadyScreen() {
    // Ensure canvas is sized (do NOT call resize here to avoid infinite loop)
    if (this.canvas.width === 0 || this.canvas.height === 0) return;
    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  startGame() {
    this.hideMessage();
    this.hideInstructionsCard();
    if (this.activeHudAlertTimer) clearTimeout(this.activeHudAlertTimer);
    if (this.activeHudAlertRemoveTimer) clearTimeout(this.activeHudAlertRemoveTimer);
    if (this.activeHudAlert) this.activeHudAlert.remove();
    this.activeHudAlert = null;
    const chatbot = document.getElementById('chatbot-container');
    const chatbotToggle = document.getElementById('chatbot-toggler');
    if (chatbot) chatbot.classList.remove('show');
    if (chatbotToggle) chatbotToggle.style.display = 'flex';
    if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
    this.state = 'playing';
    this.resize();
    this.prepareHUDEntrance();

    this.player.hp             = this.player.maxHp;
    this.player.x              = -250; // Animación de entrada
    this.player.y              = 200;
    this.player.vy             = 0;
    this.player.angle          = 0;
    this.player.flyBoostTimer  = 0;
    this.player.flightEnergy   = this.player.maxFlightEnergy;
    this.introActive           = true;
    this.introAlpha            = 0;
    this.introDelayTimer       = 0;
    this.introMessageHold      = 1.4;
    this.introFadeDuration     = 0.32;
    this.introCountdownStart   = 2.05;
    this.introCountdownDuration = 2.4;
    this.introDelayDuration    = 4.55;
    this.lastCountStep         = -1;
    this.player.invulnerable   = 0;
    this.player.frame          = 0;
    this.player.wasFlying      = false;
    this.player.landTimer      = 0;
    this.player.flyAscendIndex = 0;
    this.player.blockedByCube  = false;
    this.player.horizontalVelocity = 0;
    this.player.facing = 1;
    this.player.facingFrom = 1;
    this.player.facingTarget = 1;
    this.player.turnTimer = 0;
    this.input.up = false;
    this.input.left = false;
    this.input.right = false;
    this.input.upJustPressed = false;
    this.input.upHeldFor = 0;
    this.coinsCollected        = 0;
    this.lastDiscountThreshold = 0;
    this.luBoostCharges = 3;
    this.luBoostActive  = false;
    this.luBoostCooldown = 0;
    this.luDropProgress = 0;
    this.lastLuDropAt = -Infinity;
    this.goalApproachStarted = false;
    this.goalMilestonesSpawned = {};
    this.coinLogoSpawned = false;
    this.victoryTriggered = false;
    this.victoryCoin = null;
    this.goalSceneActive = false;
    this.goalFlightActive = false;
    this.goalFlightElapsed = 0;
    this.goalFlightScale = 1;
    this.lisarWordBonusGranted = false;
    this.collectedLisarLetters = { L: false, I: false, S: false, A: false, R: false };
    this.spawnedLetters = { L: false, I: false, S: false, A: false, R: false };
    this.letterRetryAt = {};
    this.unlockedLetters = { L: true, I: false, S: true, A: false, R: false };
    this.encounterQuietUntil = 0;
    this.extraDiscountBonus = 0;

    this.enemies     = [];
    this.projectiles = [];
    this.coins       = [];
    this.particles   = [];
    this.powerups    = [];
    this.letterItems = [];
    this.billboards  = [];
    this.spawnTimer  = 0;
    this.gameTimer   = 0;

    this.audio.currentTime = 0;
    this.audio.volume = 0.68;
    this.audio.playbackRate = 1;
    localStorage.removeItem('lisar_discount_game2_claimed');
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

  startGoalSequence() {
    if (this.goalSceneActive) return;
    this.state = 'celebration';
    this.goalSceneActive = true;
    this.goalSequenceDuration = 7;
    this.celebrationTimer = this.goalSequenceDuration;
    this.goalFlightActive = true;
    this.goalFlightElapsed = 0;
    this.goalFlightScale = 1;
    this.goalFlightStartX = this.player.x;
    this.goalFlightStartY = this.player.y;

    // The goal owns the stage: nothing from gameplay can cover Lu, Peter or the arch.
    this.enemies = [];
    this.projectiles = [];
    this.coins = [];
    this.particles = [];
    this.powerups = [];
    this.letterItems = [];
    this.bgHills = [];
    this.billboards = [];
    this.luBoostActive = false;
    this.input.up = false;
    this.input.left = false;
    this.input.right = false;
    this.player.horizontalVelocity = 0;
    this.player.facing = 1;
    this.player.facingFrom = 1;
    this.player.facingTarget = 1;
    this.player.turnTimer = 0;
    this.player.frame = 0;
    this.player.frameTimer = 0;
    this.player.angle = 0;
    this.isFlying = true;
    this.activeAnim = this.flyLoopFrames;
    this.loopAnim = true;
    this.animSpeed = 0.08;
    this.hud.style.display = 'none';
    this.audio.volume = 1;
    this.speak('Meta Lisar Studio. Misión completada.');
  }

  updateGoalSequence(dt) {
    this.celebrationTimer = Math.max(0, this.celebrationTimer - dt);
    this.goalFlightElapsed += dt;

    if (this.goalFlightActive) {
      const launchDelay = 0.28;
      const launchDuration = 2.75;
      const rawLaunch = Math.max(0, Math.min(1,
        (this.goalFlightElapsed - launchDelay) / launchDuration
      ));
      const launchEase = rawLaunch * rawLaunch * (3 - 2 * rawLaunch);
      const targetX = this.logicalWidth * 0.5 - this.player.width * 0.5;
      const targetY = -this.player.height * 1.05;

      this.player.x = this.goalFlightStartX + (targetX - this.goalFlightStartX) * launchEase;
      this.player.y = this.goalFlightStartY + (targetY - this.goalFlightStartY) * launchEase;
      this.player.angle = -0.22 * launchEase;
      this.goalFlightScale = 1 - 0.82 * launchEase;

      this.player.frameTimer += dt;
      if (this.activeAnim && this.activeAnim.length && this.player.frameTimer >= this.animSpeed) {
        this.player.frameTimer = 0;
        this.player.frame = (this.player.frame + 1) % this.activeAnim.length;
      }

      if (rawLaunch > 0.04 && rawLaunch < 0.94 && Math.random() < Math.min(1, dt * 28)) {
        this.particles.push({
          x: this.player.x + this.player.width * 0.5 + (Math.random() - 0.5) * 24,
          y: this.player.y + this.player.height * 0.72,
          vx: (Math.random() - 0.5) * 45,
          vy: 80 + Math.random() * 90,
          life: 0.55,
          maxLife: 0.55,
          color: Math.random() > 0.45 ? '#00f3ff' : '#ffb000',
          size: 3 + Math.random() * 5
        });
      }

      if (rawLaunch >= 1) this.goalFlightActive = false;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      if (particle.life <= 0) this.particles.splice(i, 1);
    }

    // A steady cadence keeps the finale festive without flooding slower devices.
    if (Math.random() < Math.min(1, dt * 13)) {
      this.particles.push({
        x: Math.random() * this.logicalWidth,
        y: Math.random() * (this.logicalHeight - 90),
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.5) * 220,
        life: 0.8,
        maxLife: 0.8,
        color: ['#00ffff', '#ff00ff', '#ffd700', '#00ffaa'][Math.floor(Math.random() * 4)],
        size: 4 + Math.random() * 6
      });
    }

    if (this.celebrationTimer <= 0) this.endGame(true);
  }

  showVictoryMenu(totalDiscount, extraBonus) {
    this.showMessage(
      '✦ MISIÓN COMPLETADA ✦',
      `<div style="font-size:0.92rem; color:#fff; font-weight:900; margin-bottom:8px;">META LISAR STUDIO</div>` +
      `<div style="color:#baf7ff;">Récord: <b style="color:#ffd700;">${this.coinsCollected} monedas</b> · <b>${this.coinsCollected * 120} puntos</b></div>` +
      (extraBonus > 0 ? `<div style="color:#ffd700; font-weight:800; margin-top:6px;">Bonus LISAR +10% incluido</div>` : '') +
      `<div style="font-size:1.3rem; color:#00ffaa; font-weight:900; text-shadow:0 0 14px rgba(0,255,170,.8); margin-top:9px;">DESCUENTO: ${totalDiscount}%</div>` +
      `<div style="font-size:0.65rem; color:#91a9ba; margin-top:7px;">Canjea tu premio o publica el resultado en tus redes.</div>`,
      [
        {
          text: '🎁 CANJEAR DESCUENTO',
          primary: true,
          action: () => {
            if (window.triggerPromoChatbot) window.triggerPromoChatbot(totalDiscount);
          }
        },
        {
          text: '📲 COMPARTIR EN REDES',
          primary: false,
          action: () => this.shareScore()
        },
        {
          text: '🎮 JUGAR DE NUEVO',
          primary: false,
          action: () => this.startGame()
        }
      ]
    );

    const card = this.msgOverlay.firstElementChild;
    if (card) {
      Object.assign(card.style, {
        position: 'relative',
        background: 'radial-gradient(circle at 50% 0%, rgba(20,55,78,.96), rgba(5,10,18,.98) 58%)',
        border: '1px solid rgba(71,241,255,.72)',
        borderRadius: '18px',
        boxShadow: '0 22px 55px rgba(0,0,0,.7), 0 0 28px rgba(0,243,255,.26), inset 0 0 24px rgba(162,0,255,.10)',
        backdropFilter: 'blur(12px)'
      });
      const accent = document.createElement('div');
      Object.assign(accent.style, {
        position: 'absolute', top: '0', left: '18%', right: '18%', height: '2px',
        background: 'linear-gradient(90deg, transparent, #00f3ff, #a200ff, transparent)',
        boxShadow: '0 0 14px #00f3ff'
      });
      card.prepend(accent);
    }

    const buttons = [...this.msgOverlay.querySelectorAll('button')];
    buttons.forEach(button => {
      if (button.textContent.includes('CANJEAR')) {
        button.style.background = 'linear-gradient(90deg,#ffb000,#ff5a00)';
        button.style.boxShadow = '0 0 18px rgba(255,145,0,.55)';
      } else if (button.textContent.includes('COMPARTIR')) {
        button.style.background = 'linear-gradient(90deg,#00b8d9,#7b2cff)';
        button.style.boxShadow = '0 0 18px rgba(0,220,255,.45)';
      } else {
        button.style.background = 'rgba(15,31,43,.92)';
        button.style.borderColor = 'rgba(122,252,255,.55)';
        button.style.boxShadow = 'none';
      }
    });

    const reduceMotion = typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    Object.assign(this.msgOverlay.style, {
      top: '50%',
      opacity: reduceMotion ? '1' : '0',
      filter: reduceMotion ? 'none' : 'blur(7px)',
      transform: reduceMotion
        ? 'translate(-50%, -50%) scale(1)'
        : 'translate(-50%, -39%) scale(.9)',
      transition: reduceMotion
        ? 'none'
        : 'opacity .48s ease, filter .55s ease, transform .68s cubic-bezier(.16,1,.3,1)'
    });
    if (!reduceMotion) requestAnimationFrame(() => requestAnimationFrame(() => {
      this.msgOverlay.style.opacity = '1';
      this.msgOverlay.style.filter = 'none';
      this.msgOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
    }));
  }

  endGame(victory) {
    this.state = victory ? 'victory' : 'gameover';
    this.audio.pause();
    this.hud.style.display = 'none';

    // 25% por monedas + 10% por la palabra L-I-S-A-R = 35% máximo.
    const discountBreakdown = this.getDiscountBreakdown();
    const extraBonus = discountBreakdown.letterBonus;
    const totalDiscount = discountBreakdown.totalDiscount;
    this.finalDiscount = totalDiscount;
    localStorage.setItem('lisar_discount_game2', totalDiscount.toString());

    if (victory) {
      this.showVictoryMenu(totalDiscount, extraBonus);
    } else {
      let motivo = this.player.hp <= 0
        ? 'Personaje derivado (Fuera de combate).'
        : 'Solo juntaste ' + this.coinsCollected + ' / ' + this.coinsRequired + ' monedas.';
      
      this.showMessage(
        'MISIÓN FALLIDA',
        `${motivo}<br><br>` +
        `<div style="font-size:1.15rem; color:#ffd700; font-weight:bold;">Lograste un ${totalDiscount}% de descuento para servicios.</div>`,
        [
          {
            text: '🎮 REINTENTAR',
            primary: true,
            action: () => this.startGame()
          },
          {
            text: '📲 COMPARTIR PUNTAJE',
            primary: false,
            action: () => this.shareScore()
          }
        ]
      );
    }
  }

  spawnLetterEncounter(letter) {
    const floorTop = this.logicalHeight - 70;
    const playableTop = 210 / this.scale;
    const groundY = floorTop - 158;
    const lowY = floorTop - 285;
    const midY = floorTop - 430;
    const highY = Math.max(playableTop + 35, floorTop - 610);
    const startX = this.logicalWidth + 40;
    const speed = -this.floorSpeed;

    const addCoin = (x, y) => this.coins.push({
      x, y, width: 52, height: 52, vx: speed, frame: 0, frameTimer: 0,
      encounterLetter: letter
    });
    const addLetter = (x, y, requiresUnlock = false, pattern = '') => this.letterItems.push({
      letter, x, y, width: 55, height: 55, vx: speed,
      requiresUnlock, pattern, lockedHintShown: false,
      floatPhase: 'LISAR'.indexOf(letter) * 1.27
    });
    const addFlightKey = (x, y) => this.powerups.push({
      x, y, width: 48, height: 48, vx: speed, frameTimer: 0,
      isFlight: true, unlocksLetter: letter, encounterItem: true
    });

    if (letter === 'L') {
      // Tutorial hop: a soft rising/falling coin trail teaches controlled lift.
      [groundY, groundY - 42, lowY, groundY - 42, groundY].forEach((y, i) => addCoin(startX + i * 58, y));
      addLetter(startX + 350, lowY + 12, false, 'soft-arch');
    } else if (letter === 'I') {
      // First explicit dependency: take the wings, then follow the ascent.
      addFlightKey(startX, groundY);
      for (let i = 0; i < 6; i++) addCoin(startX + 90 + i * 58, groundY - 35 - i * ((groundY - highY - 35) / 5));
      addLetter(startX + 465, highY, true, 'ascending-line');
    } else if (letter === 'S') {
      // Platforming beat: the letter and rewards sit cleanly on a solid cube.
      const cubeX = startX + 115;
      const cubeY = floorTop - 255;
      this.enemies.push({
        type: 0, x: cubeX, y: cubeY, baseY: cubeY,
        width: 155, height: 185, vx: speed, anchored: true, encounterCube: true, hp: 9999
      });
      [cubeX + 12, cubeX + 52, cubeX + 92].forEach(x => addCoin(x, cubeY - 54));
      addLetter(cubeX + 50, cubeY - 116, false, 'cube-crown');
    } else if (letter === 'A') {
      // Flight bridge: the trail rises, levels out, then reveals the letter.
      addFlightKey(startX, groundY);
      const bridgeY = highY + 55;
      [lowY, midY, bridgeY, bridgeY, bridgeY, midY].forEach((y, i) => addCoin(startX + 92 + i * 62, y));
      addLetter(startX + 500, bridgeY - 28, true, 'flight-bridge');
    } else if (letter === 'R') {
      // Finale: a deliberate zigzag asks the player to feather the jetpack.
      addFlightKey(startX, groundY);
      [lowY, midY, highY, midY - 35, highY + 25, midY].forEach((y, i) => addCoin(startX + 90 + i * 64, y));
      addLetter(startX + 525, highY + 28, true, 'final-zigzag');
    }

    this.spawnedLetters[letter] = true;
    this.encounterQuietUntil = this.gameTimer + 7.2;
    this.spawnTimer = 0;
  }

  playGoalCue(index = 0) {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((frequency, noteIndex) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = this.audioCtx.currentTime + noteIndex * 0.055;
        osc.type = index >= 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(frequency * (1 + index * 0.018), start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.075, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch (e) {}
  }

  getFinaleSafeArea() {
    const top = Math.max(190, this.logicalHeight * 0.30);
    const bottom = Math.min(this.logicalHeight - 90, this.logicalHeight * 0.70);
    return {
      left: this.logicalWidth * 0.08,
      right: this.logicalWidth * 0.92,
      top,
      bottom,
      width: this.logicalWidth * 0.84,
      height: Math.max(120, bottom - top)
    };
  }

  spawnCoinText(lines, index = 0, isLogo = false) {
    const glyphs = {
      A:['010','101','111','101','101'], B:['110','101','110','101','110'],
      C:['011','100','100','100','011'], D:['110','101','101','101','110'],
      E:['111','100','110','100','111'], I:['111','010','010','010','111'],
      J:['001','001','001','101','010'], K:['101','110','100','110','101'],
      L:['100','100','100','100','111'], N:['101','111','111','111','101'],
      O:['111','101','101','101','111'], R:['110','101','110','101','101'],
      S:['011','100','010','001','110'], T:['111','010','010','010','010'],
      U:['101','101','101','101','111'], 0:['111','101','101','101','111'],
      3:['110','001','010','001','110'], '%':['101','001','010','100','101'],
      5:['111','100','110','001','110'],
      '!':['010','010','010','000','010'], ' ':['000','000','000','000','000']
    };
    const safe = this.getFinaleSafeArea();
    const normalizedLines = (Array.isArray(lines) ? lines : [lines]).map(line =>
      line.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
    );
    const maxColumns = Math.max(...normalizedLines.map(line => Math.max(1, line.length * 4 - 1)));
    const totalRows = normalizedLines.length * 5 + (normalizedLines.length - 1) * 2;
    const cell = Math.max(9, Math.min(isLogo ? 28 : 24, safe.width / maxColumns, safe.height / totalRows));
    const coinSize = Math.max(8, cell * 0.82);
    const totalHeight = totalRows * cell;
    const originY = safe.top + (safe.height - totalHeight) / 2;
    let revealIndex = 0;

    // Only one readable coin message occupies the safe area at a time.
    this.coins = this.coins.filter(coin => !coin.finaleCoin);
    normalizedLines.forEach((line, lineIndex) => {
      const lineColumns = Math.max(1, line.length * 4 - 1);
      const originX = safe.left + (safe.width - lineColumns * cell) / 2;
      [...line].forEach((character, characterIndex) => {
        const glyph = glyphs[character] || glyphs[' '];
        glyph.forEach((row, rowIndex) => {
          [...row].forEach((pixel, columnIndex) => {
            if (pixel !== '1') return;
            this.coins.push({
              x: originX + (characterIndex * 4 + columnIndex) * cell,
              y: originY + (lineIndex * 7 + rowIndex) * cell,
              width: coinSize,
              height: coinSize,
              vx: 0,
              frame: 0,
              frameTimer: 0,
              finaleCoin: true,
              logoCoin: isLogo,
              revealAt: this.gameTimer + revealIndex * 0.012
            });
            revealIndex += 1;
          });
        });
      });
    });
    this.playGoalCue(index);
  }

  spawnGoalMilestone(text, index) {
    this.spawnCoinText(text, index, false);
  }

  spawnLisarCoinLogo() {
    this.spawnCoinText(['LISAR', 'STUDIO'], 5, true);
  }

  updateGoalApproach(dt) {
    if (!this.goalApproachStarted) {
      this.goalApproachStarted = true;
      // The final stretch is celebratory and readable: no leftover threats.
      this.enemies = [];
      this.projectiles = [];
      this.coins = [];
      this.powerups = [];
      this.bgHills = [];
      this.billboards = [];
      this.luBoostActive = false;
      this.spawnTimer = 0;
    }

    const finaleProgress = Math.max(0, Math.min(1, (this.gameTimer - 150) / 30));
    this.audio.volume = Math.min(1, 0.68 + finaleProgress * 0.30);
    this.audio.playbackRate = 1 + finaleProgress * 0.075;

    const milestones = [
      { time: 150, text: 'LISAR' },
      { time: 155, text: ['BUEN', 'TRABAJO!'] },
      { time: 160, text: 'CRACK' },
      { time: 165, text: '35%' },
      { time: 170, text: ['ESTÁS', 'CERCA!'] }
    ];
    milestones.forEach((milestone, index) => {
      if (this.gameTimer >= milestone.time && !this.goalMilestonesSpawned[index]) {
        this.goalMilestonesSpawned[index] = true;
        this.spawnGoalMilestone(milestone.text, index);
      }
    });

    if (this.gameTimer >= 175 && !this.coinLogoSpawned) {
      this.coinLogoSpawned = true;
      this.spawnLisarCoinLogo();
    }
  }

  spawnEntity(dt) {
    // From 2:30 onward, the authored goal approach owns the stage.
    if (this.gameTimer >= 150) return;
    this.spawnTimer += dt;

    // Finish one authored route completely before considering another one.
    if (this.gameTimer < this.encounterQuietUntil) return;

    const letterSchedule = [
      { time: 22, letter: 'L' },
      { time: 50, letter: 'I' },
      { time: 80, letter: 'S' },
      { time: 110, letter: 'A' },
      { time: 142, letter: 'R' }
    ];

    const activeAuthoredLetter = this.letterItems.some(item => item.life === undefined);
    if (!activeAuthoredLetter) {
      for (let index = 0; index < letterSchedule.length; index++) {
        const encounter = letterSchedule[index];
        if (this.collectedLisarLetters[encounter.letter]) continue;

        const previousLetter = index > 0 ? letterSchedule[index - 1].letter : null;
        const previousCollected = !previousLetter || this.collectedLisarLetters[previousLetter];
        const retryReady = this.gameTimer >= (this.letterRetryAt[encounter.letter] || 0);
        const authoredLaneClear =
          !this.enemies.some(e => !e.encounterCube && e.x > this.logicalWidth * 0.5) &&
          !this.coins.some(c => !c.encounterLetter && c.x > this.logicalWidth * 0.5) &&
          !this.powerups.some(p => !p.encounterItem && p.x > this.logicalWidth * 0.5);

        if (
          this.gameTimer >= encounter.time &&
          previousCollected &&
          !this.spawnedLetters[encounter.letter] &&
          retryReady &&
          authoredLaneClear
        ) {
          this.spawnLetterEncounter(encounter.letter);
        }
        // Strict order: never inspect I until L is resolved, and so on.
        break;
      }
    }

    // Spacing interval: 2.4s between challenge waves ensures zero screen clutter!
    if (this.spawnTimer < 2.4) return;
    this.spawnTimer = 0;

    // Dynamic challenge selection: avoid strict repetition and bias difficulty over time
    this.stageStep = (this.stageStep || 0) + 1;
    const progress = Math.min(1, this.gameTimer / 180);
    // Build weighted choices depending on progress (early game easier, late game harder)
    const weights = [1, 1 + progress * 0.6, 1.6 + progress * 1.0, 0.9 + progress * 0.9, 0.8 + progress * 1.2, 1.2 + progress * 0.4, 1.45];
    // pick index using weights but avoid repeating same index twice
    let candidate = this._lastChallengeIndex ?? -1;
    for (let attempts = 0; attempts < 7; attempts++) {
      const totalW = weights.reduce((a,b)=>a+b,0);
      let r = Math.random() * totalW;
      let idx = 0;
      for (let w of weights) { if (r < w) break; r -= w; idx++; }
      if (idx !== this._lastChallengeIndex) { candidate = idx; break; }
    }
    let challengeIndex = candidate === -1 ? (this.stageStep % 7) : candidate;
    const activeFlyers = this.enemies.some(e => e.type === 1);
    const activeUpperRunway = this.enemies.some(e => e.upperRunwayBlock);
    const activeCombatEnemy = this.enemies.some(e => e.type !== 0);
    if (challengeIndex === 1 && activeFlyers) {
      const fallback = [0, 2, 3, 4, 5, 6].filter(idx => idx !== this._lastChallengeIndex);
      challengeIndex = fallback[Math.floor(Math.random() * fallback.length)] || 0;
    }
    // No flying or ground enemy may spawn while the elevated runway is visible.
    if (activeUpperRunway && (challengeIndex === 1 || challengeIndex === 2)) {
      const safeFallback = [0, 3, 4, 5, 6].filter(idx => idx !== this._lastChallengeIndex);
      challengeIndex = safeFallback[Math.floor(Math.random() * safeFallback.length)] || 3;
    }
    // Start a runway only after the combat lane has cleared completely.
    if (challengeIndex === 6 && activeCombatEnemy) {
      const safeFallback = [0, 3, 4, 5].filter(idx => idx !== this._lastChallengeIndex);
      challengeIndex = safeFallback[Math.floor(Math.random() * safeFallback.length)] || 3;
    }
    this._lastChallengeIndex = challengeIndex;
    const startX = this.logicalWidth + 30;

    if (challengeIndex === 0) {
      // DESAFÍO TIPO MEGAMAN X4 - A: Plataforma de Cubo + Monedas sobre la superficie
      const cubeY = this.logicalHeight - 200 - 70;
      this.enemies.push({
        type: 0,
        x: startX,
        y: cubeY,
        baseY: cubeY,
        movePhase: Math.random() * Math.PI * 2,
        width: 140, height: 200,
        vx: -this.floorSpeed,
        anchored: true,
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
      // DESAFÍO TIPO MEGAMAN X4 - B: Enemigo Volador + Arco Parabólico en Altura Media (Y = 220-240px)
      this.spawnEnemy1(progress);

      const playableTopY = 185 / this.scale;
      for (let i = 0; i < 5; i++) {
        const archY = Math.max(playableTopY + 10, 240) - Math.sin((i / 4) * Math.PI) * 20;
        this.coins.push({
          x: startX + i * 48,
          y: archY,
          width: 60, height: 60,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      }
    } else if (challengeIndex === 2) {
      // DESAFÍO TIPO MEGAMAN X4 - C: Enemigo Rodante + Rombo de Monedas en Altura Media (Y = 235px)
      this.spawnEnemy2(progress);

      const playableTopY = 185 / this.scale;
      const highY = Math.max(playableTopY + 10, 235);
      const diamondOffsets = [
        { dx: 0, dy: 0 }, { dx: 36, dy: -14 }, { dx: 36, dy: 14 }, { dx: 72, dy: 0 }
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
      // DESAFÍO TIPO MEGAMAN X4 - D: Pista Panorámica Libre + Powerup + Onda en Altura Media (Y = 235px)
      const playableTopY = 185 / this.scale;
      const startY = Math.max(playableTopY + 10, 235);
      if (this.player.hp < this.player.maxHp * 0.8) {
        this.powerups.push({
          x: startX + 40,
          y: startY,
          width: 50, height: 50,
          vx: -(this.floorSpeed + 15),
          frameTimer: 0
        });
      }

      for (let i = 0; i < 6; i++) {
        this.coins.push({
          x: startX + i * 50,
          y: startY + Math.sin(i * 0.9) * 20,
          width: 60, height: 60,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      }
    } else if (challengeIndex === 4) {
      // Aerial cube with a flight recharge placed clearly on its top face.
      const playableTopY = 185 / this.scale;
      const aerialCubeY = playableTopY + 48;
      const aerialCubeHeight = 105;
      this.enemies.push({
        type: 0,
        x: startX,
        y: aerialCubeY,
        baseY: aerialCubeY,
        width: 140, height: aerialCubeHeight,
        vx: -this.floorSpeed,
        anchored: true,
        isAerial: true,
        hp: 9999
      });

      this.powerups.push({
        x: startX + 46,
        y: aerialCubeY - 52,
        width: 48, height: 48,
        vx: -this.floorSpeed,
        isFlight: true,
        onAerialCube: true,
        frameTimer: 0
      });
    } else if (challengeIndex === 5) {
      // Small Mario-style staircase: a readable route even with no flight charge.
      const floorTop = this.logicalHeight - 70;
      const levels = [0, 58, 116, 58];
      levels.forEach((rise, i) => {
        const blockX = startX + i * 112;
        const blockY = floorTop - 68 - rise;
        this.enemies.push({
          type: 0, x: blockX, y: blockY, baseY: blockY,
          width: 86, height: 68, vx: -this.floorSpeed,
          anchored: true, smallStepBlock: true, hp: 9999
        });
        this.coins.push({
          x: blockX + 17, y: blockY - 54,
          width: 52, height: 52, vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      });
    } else if (challengeIndex === 6) {
      // Elevated straight runway: fly up, land, then run across it safely.
      const floorTop = this.logicalHeight - 70;
      const runwayY = floorTop - 128;
      const blockWidth = 92;
      const blockHeight = 58;
      const blockGap = 3;
      const runwayStartX = startX + 105;

      // A clear diagonal guide and wings make the intended ascent readable.
      this.powerups.push({
        x: startX - 35,
        y: floorTop - 98,
        width: 46, height: 46,
        vx: -this.floorSpeed,
        isFlight: true,
        frameTimer: 0,
        upperRunwayItem: true
      });
      [0, 1, 2].forEach(i => {
        this.coins.push({
          x: startX + 25 + i * 36,
          y: floorTop - 112 - i * 36,
          width: 48, height: 48,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0,
          upperRunwayCoin: true
        });
      });

      for (let i = 0; i < 5; i++) {
        const blockX = runwayStartX + i * (blockWidth + blockGap);
        this.enemies.push({
          type: 0,
          x: blockX, y: runwayY, baseY: runwayY,
          width: blockWidth, height: blockHeight,
          vx: -this.floorSpeed,
          anchored: true,
          smallStepBlock: true,
          upperRunwayBlock: true,
          hp: 9999
        });

        // Leave the center free for an adaptive useful item.
        if (i !== 2) {
          this.coins.push({
            x: blockX + 20, y: runwayY - 52,
            width: 50, height: 50,
            vx: -this.floorSpeed,
            frame: 0, frameTimer: 0,
            upperRunwayCoin: true
          });
        }
      }

      const centerBlockX = runwayStartX + 2 * (blockWidth + blockGap);
      const needsHealth = this.player.hp < this.player.maxHp * 0.65;
      this.powerups.push({
        x: centerBlockX + 23,
        y: runwayY - 50,
        baseY: runwayY - 50,
        width: 46, height: 46,
        vx: -this.floorSpeed,
        isEnergy: needsHealth,
        isFlight: !needsHealth,
        frameTimer: 0,
        onUpperRunway: true,
        upperRunwayItem: true
      });
    }
  }

  spawnEnemy0(offsetX = 0) {
    // Bloques solo en el suelo (NUNCA en el techo Y=0 para evitar tapar el HUD)
    this.enemies.push({
      type: 0,
      x: this.logicalWidth + 30 + offsetX,
      y: this.logicalHeight - 200 - 40,
      width: 130, height: 200,
      vx: -this.floorSpeed,
      anchored: true,
      hp: 9999
    });
  }

  spawnEnemy1(progress, offsetX = 0) {
    // Solo un enemigo volador a la vez, con movimiento de onda variable
    const playableTopY = 185 / this.scale;
    const minY = Math.max(playableTopY + 10, 220);
    const maxY = Math.max(playableTopY + 50, 270);
    const baseY = minY + Math.random() * (maxY - minY);
    const amplitude = 18 + Math.random() * 24;
    const period = 1.2 + Math.random() * 1.0;
    const startX = this.logicalWidth + 40 + offsetX;
    const wavePhase = Math.random() * Math.PI * 2;
    const pattern = Math.floor(Math.random() * 3);

    this.enemies.push({
      type: 1,
      x: startX,
      y: baseY,
      baseY: baseY,
      width: 240, height: 240,
      vx: -(this.floorSpeed + 55 + progress * 90 + Math.random() * 28),
      hp: 1,
      shootTimer: Math.random() * 1.2,
      frame: 0,
      frameTimer: 0,
      isShooting: 0,
      isHit: 0,
      sineOffset: wavePhase,
      waveAmplitude: amplitude,
      wavePeriod: period,
      waveStyle: pattern
    });
  }

  spawnEnemy2(progress, offsetX = 0) {
    // Roll ball enemy along the ground in a straight line towards the player
    const baseY = this.logicalHeight - 140 - 40;
    this.enemies.push({
      type: 2,
      x: this.logicalWidth + 30 + offsetX,
      y: baseY,
      baseY: baseY,
      width: 120, height: 120,
      vx: -(this.floorSpeed + 120 + progress * 60 + Math.random() * 40),
      hp: 1,
      frame: 0, frameTimer: 0,
      rollPhase: Math.random() * Math.PI * 2
    });
  }

  checkCollisions() {
    // Tighter, accurate hitbox centered on character (pw: 80, ph: 110)
    const px = this.player.x + 80;
    const py = this.player.y + 65;
    const pw = 80;
    const ph = 110;

    const playerCenterX = this.player.x + 120;
    const playerCenterY = this.player.y + 110;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (c.revealAt !== undefined && this.gameTimer < c.revealAt) continue;
      const coinCenterX = c.x + c.width / 2;
      const coinCenterY = c.y + c.height / 2;
      const dist = Math.hypot(playerCenterX - coinCenterX, playerCenterY - coinCenterY);

      if (dist < 115 || (px - 50 < c.x + c.width && px + pw + 50 > c.x && py - 70 < c.y + c.height && py + ph + 70 > c.y)) {
        this.coinsCollected++;
        this.createExplosion(coinCenterX, coinCenterY, 'gold', 8);
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

    // Colisión y Recolección de Letras Naranjas L-I-S-A-R
    for (let i = this.letterItems.length - 1; i >= 0; i--) {
      const item = this.letterItems[i];
      const itemCenterX = item.x + item.width / 2;
      const itemCenterY = item.y + item.height / 2;
      const dist = Math.hypot(playerCenterX - itemCenterX, playerCenterY - itemCenterY);

      if (dist < 90) {
        const l = item.letter;
        if (item.requiresUnlock && !this.unlockedLetters[l]) {
          if (!item.lockedHintShown) {
            item.lockedHintShown = true;
            this.showTemporaryAlert(`🪽 RUTA ${l} BLOQUEADA`, 'Recoge primero las alas vinculadas a esta ruta.', 2.4);
          }
          continue;
        }
        this.collectedLisarLetters[l] = true;
        this.updateLetterBadges();
        this.createExplosion(itemCenterX, itemCenterY, '#ff8800', 16);
        this.playCoinSound();
        this.showTemporaryAlert("🔥 ¡LETRA [" + l + "] RECOLECTADA!", "¡Completa L-I-S-A-R para +10% Extra!", 2.5);
        this.speak(`Letter ${l} collected!`);
        this.letterItems.splice(i, 1);
        this.encounterQuietUntil = Math.max(this.encounterQuietUntil, this.gameTimer + 3.2);

        const allCollected = ['L', 'I', 'S', 'A', 'R'].every(letra => this.collectedLisarLetters[letra]);
        if (allCollected && !this.lisarWordBonusGranted) {
          this.lisarWordBonusGranted = true;
          this.extraDiscountBonus = (this.extraDiscountBonus || 0) + 10;
          this.speak("Word Lisar Complete! Extra 10% Discount Unlocked!");
          this.showTemporaryAlert(
            "🎁 ¡PALABRA LISAR COMPLETADA!",
            "¡HAS GANADO UN +10% DE DESCUENTO EXTRA ACUMULABLE!",
            4.5
          );
          this.updateHUD();
        }
      }
    }

    // Forgiving pickup volume for flight/health items. This runs before
    // scrolling so a fast frame can never tunnel through a useful item.
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (p.isBoot || (!p.isFlight && !p.isEnergy)) continue;
      const overlapsPickupZone =
        px - 55 < p.x + p.width && px + pw + 55 > p.x &&
        py - 75 < p.y + p.height && py + ph + 75 > p.y;
      if (!overlapsPickupZone) continue;

      if (p.isFlight) {
        this.player.flightEnergy = this.player.maxFlightEnergy;
        if (p.unlocksLetter) this.unlockedLetters[p.unlocksLetter] = true;
        this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#00ffff', 10);
        this.showTemporaryAlert(
          p.unlocksLetter ? `🪽 RUTA ${p.unlocksLetter} DESBLOQUEADA` : '🪽 ENERGÍA DE VUELO',
          p.unlocksLetter ? 'Vuelo al 100%. Sigue la ruta de monedas hasta la letra.' : 'Carga restaurada al 100%.',
          2.5
        );
      } else {
        const healAmt = 25;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
        this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#00ffaa', 12);
        this.showTemporaryAlert('⚡ ENERGÍA RECUPERADA', `Salud +${healAmt}.`, 2.2);
      }
      this.playCoinSound();
      this.powerups.splice(i, 1);
      this.updateHUD();
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e  = this.enemies[i];
      const ex = e.x;
      const ey = e.y;
      const ew = e.width;
      const eh = e.height;

      if (e.type === 0) {
        // Solid lower-body hitbox: land on top and never phase through a cube.
        const prevBottom = (this.player.prevY !== undefined ? this.player.prevY : this.player.y) + this.player.height;
        const currentBottom = this.player.y + this.player.height;
        const cubeTop = ey;
        const solidLeft = this.player.x + 65;
        const solidRight = this.player.x + 175;
        const solidTop = this.player.y + 55;
        const solidBottom = currentBottom;

        const overlapX = Math.min(solidRight, ex + ew) - Math.max(solidLeft, ex);
        const verticalOverlap = Math.min(solidBottom, ey + eh) - Math.max(solidTop, ey);

        // Is player landing on top of the cube from above?
        if (prevBottom <= cubeTop + 20 && currentBottom >= cubeTop && this.player.vy >= 0 && overlapX > Math.min(110, ew) * 0.25) {
          this.player.y = cubeTop - this.player.height;
          this.player.vy = 0;
          this.player.angle = 0;
          this.player.wasFlying = false;
          this.player.landTimer = 0;
          this.player.onCube = true;
        } else if (overlapX > 0 && verticalOverlap > 20) {
          // SIDE HIT: treat the cube as a solid blocker but prevent the player being pulled inside the block too aggressively.
          this.player.blockedByCube = true;
          const buffer = 6;
          // The world scrolls left, so the player must remain on the cube's
          // leading (left) side instead of being teleported through it.
          const targetHitboxX = ex - 110 - buffer;
          this.player.x = Math.max(15, targetHitboxX - 65);
          this.player.vy = Math.min(this.player.vy, 100);

          // Small route blocks are navigation aids only and never remove health.
          // A large obstacle can still hurt only if the screen truly crushes Lisar.
          if (!e.smallStepBlock && this.player.x <= 16 && this.player.invulnerable <= 0) {
            this.player.hp -= 10;
            this.player.invulnerable = 1.6;
            this.createExplosion(solidLeft, solidTop + 80, '#ff6600', 8);
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
    if (this.state === 'celebration') {
      this.updateGoalSequence(dt);
      return;
    }
    if (this.state !== 'playing') return;
    const frameDt = dt;

    if (this.introActive) {
      this.player.x += dt * 110;
      this.activeAnim = this.runFrames;
      this.loopAnim = true;
      this.animSpeed = 0.11;
      
      // Mission card gets its own moment, then a clean gap before countdown/READY.
      this.introDelayTimer += dt;
      const holdComplete = this.introDelayTimer >= this.introDelayDuration;
      if (this.introDelayTimer < 0.28) {
        this.introAlpha = Math.min(1, this.introDelayTimer / 0.28);
      } else if (this.introDelayTimer <= this.introMessageHold) {
        this.introAlpha = 1;
      } else if (this.introDelayTimer < this.introMessageHold + this.introFadeDuration) {
        this.introAlpha = Math.max(0, 1 - ((this.introDelayTimer - this.introMessageHold) / this.introFadeDuration));
      } else {
        this.introAlpha = 0;
      }

      this.player.frameTimer += dt;
      if (this.player.frameTimer > this.animSpeed && this.activeAnim && this.activeAnim.length > 0) {
        this.player.frame = (this.player.frame + 1) % this.activeAnim.length;
        this.player.frameTimer = 0;
      }
      
      const floorY = this.logicalHeight - this.player.height - 70;
      this.player.y = floorY;
      
      if (this.player.x >= 80) {
        this.player.x = 80;
      }
      if (holdComplete && this.introAlpha <= 0) {
        this.introActive = false;
        this.gameTimer = 0;
        this.revealHUD();
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
    const wasBlockedByCube = this.player.blockedByCube;
    this.player.blockedByCube = false;
    const horizontalAxis = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    // Left-facing is intentional only while A/Left is actively held. Releasing
    // it returns Lisar to the forward-running pose, including while airborne.
    const desiredFacing = this.input.left && !this.input.right ? -1 : 1;
    if (desiredFacing !== this.player.facingTarget) {
      const previousTurnProgress = this.player.turnTimer > 0
        ? 1 - this.player.turnTimer / this.player.turnDuration
        : 1;
      const currentVisualFacing = this.player.turnTimer > 0 && previousTurnProgress < 0.5
        ? this.player.facingFrom
        : this.player.facingTarget;
      this.player.facingFrom = currentVisualFacing;
      this.player.facingTarget = desiredFacing;
      if (currentVisualFacing === desiredFacing) {
        this.player.facing = desiredFacing;
        this.player.turnTimer = 0;
      } else {
        this.player.turnTimer = this.player.turnDuration;
      }
    }
    if (this.player.turnTimer > 0) {
      this.player.turnTimer = Math.max(0, this.player.turnTimer - frameDt);
      if (this.player.turnTimer === 0) {
        this.player.facing = this.player.facingTarget;
        this.player.facingFrom = this.player.facingTarget;
      }
    }
    const targetHorizontalSpeed = (wasBlockedByCube && horizontalAxis > 0)
      ? 0
      : horizontalAxis * 340;
    const horizontalBlend = 1 - Math.exp(-12 * frameDt);
    this.player.horizontalVelocity +=
      (targetHorizontalSpeed - this.player.horizontalVelocity) * horizontalBlend;
    this.player.x += this.player.horizontalVelocity * frameDt;

    const minPlayerX = -35;
    const maxPlayerX = Math.max(80, this.logicalWidth - this.player.width + 35);
    if (this.player.x <= minPlayerX) {
      this.player.x = minPlayerX;
      this.player.horizontalVelocity = Math.max(0, this.player.horizontalVelocity);
    } else if (this.player.x >= maxPlayerX) {
      this.player.x = maxPlayerX;
      this.player.horizontalVelocity = Math.min(0, this.player.horizontalVelocity);
    }

    this.player.prevY = this.player.y;
    const wasOnCube = this.player.onCube;
    this.player.onCube = false;

    const floorY = this.logicalHeight - this.player.height - 70;
    const isAtFloor = this.player.y >= floorY - 2;
    if (this.input.up) this.input.upHeldFor += frameDt;
    const wantsFlight = this.input.up &&
      this.input.upHeldFor >= this.input.flightHoldThreshold;

    if (this.input.upJustPressed && (isAtFloor || wasOnCube)) {
      // One quick tap is one predictable platform jump, with no flight cost.
      this.player.vy = this.player.jumpForce;
    } else if (wantsFlight && this.player.flightEnergy > 0) {
      this.player.vy += this.player.jumpForce * dt * 4;
      if (this.player.vy < -340) this.player.vy = -340;
    } else {
      let fallMult = this.player.vy > 0 ? 1.6 : 1.0;
      this.player.vy += this.player.gravity * dt * fallMult;
    }
    this.player.y += this.player.vy * dt;

    if (this.player.y < 0)        { this.player.y = 0;      this.player.vy = 0; }
    if (this.player.y > floorY)   { this.player.y = floorY; this.player.vy = 0; }

    const isGroundedNow = this.player.y >= floorY - 2;
    if (isGroundedNow) {
      this.player.flightEnergy = Math.min(
        this.player.maxFlightEnergy,
        this.player.flightEnergy + this.player.flightRechargeRate * frameDt
      );
    } else if (wantsFlight && (!wasOnCube || this.input.up)) {
      this.player.flightEnergy = Math.max(
        0,
        this.player.flightEnergy - this.player.flightDrainRate * frameDt
      );
    }

    this.input.upJustPressed = false;

    if (this.player.invulnerable > 0) this.player.invulnerable -= dt;

    this.checkCollisions();
    this.player.isFlying = wantsFlight && !isGroundedNow && !this.player.onCube;
    this.isFlying = this.player.isFlying;

    // ================================================================
    // ANIMACIÓN DEL JUGADOR - MÁQUINA DE ESTADOS (CORRE, VUELA, ATACA)
    // ================================================================
    this.player.frameTimer += dt;
    const onGround = this.player.y >= floorY - 2 || this.player.onCube;

    if (this.player.isAttacking) {
      this.player.attackTimer -= dt;
      if (this.player.attackTimer <= 0) {
        this.player.isAttacking = false;
      }
    }

    this.activeAnim = [];
    this.loopAnim   = false;

    if (this.player.isAttacking) {
      if (onGround) {
        this.activeAnim = this.attackFrames;
        this.loopAnim   = false;
        const total = this.attackFrames.length || 8;
        this.player.frame = Math.min(total - 1, Math.floor((1 - this.player.attackTimer / 0.45) * total));
      } else {
        this.activeAnim = this.flyAttackFrames;
        this.loopAnim   = false;
        const total = this.flyAttackFrames.length || 9;
        this.player.frame = Math.min(total - 1, Math.floor((1 - this.player.attackTimer / 0.45) * total));
      }
    } else if (onGround) {
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
        this.player.angle = (this.player.angle || 0) + (0.12 - (this.player.angle || 0)) * dt * 6;
      } else {
        this.activeAnim = [this.flyLoopFrames[0]];
        this.loopAnim   = false;

        const targetAngle = this.player.vy < -100 ? -0.14 : -0.05;
        this.player.angle = (this.player.angle || 0) + (targetAngle - (this.player.angle || 0)) * dt * 6;

        if (this.input.up && Math.random() > 0.35) {
          const flightFacing = this.player.facingTarget || 1;
          this.particles.push({
            x: flightFacing > 0
              ? this.player.x + 30 + Math.random() * 15
              : this.player.x + this.player.width - 45 - Math.random() * 15,
            y: this.player.y + this.player.height / 2 + 35,
            vx: -flightFacing * (220 + Math.random() * 80),
            vy: 60 + (Math.random() - 0.5) * 50,
            life: 0.2 + Math.random() * 0.15,
            maxLife: 0.35,
            color: Math.random() > 0.5 ? '#ff9900' : '#00ffff',
            size: 3 + Math.random() * 6
          });
        }
      }
    }

    if (!this.player.isAttacking) {
      if (this.loopAnim && this.activeAnim && this.activeAnim.length > 0) {
        if (this.player.frameTimer > this.animSpeed) {
          this.player.frame = (this.player.frame + 1) % this.activeAnim.length;
          this.player.frameTimer = 0;
        }
      } else {
        this.player.frame = 0;
      }
    }

    // Generator de letreros pixel en el fondo (Lisar Studio billboards)
    this.billboardTimer = (this.billboardTimer || 0) + dt;
    if (this.gameTimer < 150 && this.billboardTimer > 6.5) {
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

    // Generator de Montañitas Dinámicas con los Sprites Oficiales de Lu y Peter (lu1..lu10, peter1..peter10)
    this.hillTimer = (this.hillTimer || 0) + dt;
    if (this.gameTimer < 150 && this.hillTimer > 12.0 + Math.random() * 8.0) {
      this.hillTimer = 0;
      this.bgHills = this.bgHills || [];
      const quotes = [
        "¡VAMOS LISAR!", "¡MENUDO COMBO!", "¡LISAR STUDIO!",
        "¡SUPER COMBO!", "¡EXCELENTE VUELO!", "¡CASI LLEGAS!", "¡SIGUE ASÍ!", "¡AMAZING!"
      ];
      const txt = quotes[Math.floor(Math.random() * quotes.length)];
      
      // Tamaños de montaña: 0: Chica, 1: Mediana, 2: Grande
      const sizeType = Math.floor(Math.random() * 3);
      const heights = [85, 130, 185];
      const widths = [135, 195, 260];
      const colors = ['#a200ff', '#00f3ff', '#ff00aa'];

      // Personajes: -1: ninguno, 0: Solo Lu, 1: Solo Peter, 2: Lu y Peter juntos
      const charChance = Math.random();
      let charType = -1;
      if (charChance < 0.28) charType = 0;
      else if (charChance < 0.50) charType = 1;
      else if (charChance < 0.62) charType = 2;

      this.bgHills.push({
        x: this.logicalWidth + 80,
        y: this.logicalHeight - 70 - heights[sizeType],
        height: heights[sizeType],
        width: widths[sizeType],
        color: colors[sizeType],
        charType: charType,
        quote: txt,
        vx: -this.floorSpeed * 0.40,
        animFrame: 0,
        frameTimer: 0
      });
    }

    if (this.bgHills) {
      for (let i = this.bgHills.length - 1; i >= 0; i--) {
        const h = this.bgHills[i];
        h.x += h.vx * dt;
        h.frameTimer += dt;
        if (h.frameTimer > 0.09) {
          h.animFrame = (h.animFrame + 1) % 10;
          h.frameTimer = 0;
        }
        if (h.x < -300) this.bgHills.splice(i, 1);
      }
    }

    // ASISTENCIA DE ENERGÍA DE EMERGENCIA CON LU EN SU NUBE
    // Each available bolt is one independent rescue; a rescue never empties the set.
    if (this.player.hp <= 60 && !this.luBoostActive && (this.luBoostCooldown || 0) <= 0 && this.luBoostCharges > 0) {
      this.luBoostActive = true;
      this.luBoostCooldown = 18;
      this.luBoostCharges = Math.max(0, this.luBoostCharges - 1);
      this.luBoostX = -180; // Inicia fuera de pantalla a la IZQUIERDA
      const playableTopY = 185 / this.scale;
      this.luBoostY = Math.max(playableTopY + 10, 225);  // Altura cómoda de vuelo medio (Y = 225px)
      this.luBoostFrame = 0;
      this.luBoostTimer = 0;
      this.luBoostDropped = false;
      this.speak("Emergency Energy Boost!");
      this.showTemporaryAlert(
        "⚡ ¡LU AL RESCATE!",
        "Lu vuela en su nube de izquierda a derecha lanzándote energía",
        3.5
      );
    }

    if (this.luBoostCooldown > 0) this.luBoostCooldown -= dt;

    if (this.luBoostActive) {
      this.luBoostX += 115 * dt; // Vuelo LENTO y fluido de izquierda a derecha
      this.luBoostTimer += dt;
      if (this.luBoostTimer > 0.08) {
        this.luBoostFrame = (this.luBoostFrame + 1) % 10;
        this.luBoostTimer = 0;
      }

      // Al aproximarse sobre el jugador, Lu le lanza la Bota de Energía hacia abajo
      if (this.luBoostX >= (this.player.x + 30) && !this.luBoostDropped) {
        this.luBoostDropped = true;
        this.powerups.push({
          x: this.luBoostX + 20,
          y: this.luBoostY + 40,
          width: 60, height: 60,
          vx: 0,
          vy: 0,
          isBoot: true,
          frameTimer: 0
        });
      }

      if (this.luBoostX > this.logicalWidth + 180) {
        this.luBoostActive = false;
      }
    }

    // Suelo scrolling
    this.floorOffset -= this.floorSpeed * dt;
    if (this.floorOffset <= -this.logicalWidth) this.floorOffset += this.logicalWidth;

    if (this.gameTimer >= 150) this.updateGoalApproach(dt);
    this.spawnEntity(dt);

    // Monedas
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.x += c.vx * dt;

      // A cube may never cover a coin. Any crossing coin is lifted onto
      // the cube's top face while their horizontal paths overlap.
      const coveringCube = this.enemies.find(e =>
        e.type === 0 &&
        c.x < e.x + e.width && c.x + c.width > e.x &&
        c.y < e.y + e.height && c.y + c.height > e.y
      );
      if (coveringCube) c.y = coveringCube.y - c.height - 6;

      c.frameTimer += dt;
      if (c.frameTimer > 0.10) {
        c.frame = (c.frame + 1) % this.coinFrames.length;
        c.frameTimer = 0;
      }
      if (c.x < -c.width * 2) this.coins.splice(i, 1);
    }

    // Movimiento de Letras Naranjas L-I-S-A-R
    for (let i = this.letterItems.length - 1; i >= 0; i--) {
      const item = this.letterItems[i];
      item.x += (item.vx || 0) * dt;
      if (item.vy !== undefined) {
        // flying letters (meta celebration) have vertical motion + gravity
        item.y += item.vy * dt;
        item.vy += 420 * dt;
      }
      if (item.x < -item.width * 2 || item.y > this.logicalHeight + 200 || (item.life !== undefined && item.life <= 0)) {
        if (item.letter && !this.collectedLisarLetters[item.letter]) {
          this.spawnedLetters[item.letter] = false;
          this.letterRetryAt[item.letter] = this.gameTimer + 4.5;
          this.encounterQuietUntil = Math.max(this.encounterQuietUntil, this.gameTimer + 2.5);
        }
        this.letterItems.splice(i, 1);
      }
    }

    // Powerups (Bota de Energía Magnética Homing / Rayitos)
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (p.isBoot) {
        // HOMING MAGNÉTICO DIRECTO AL JUGADOR (Va directo al personaje automáticamente)
        const targetX = this.player.x + this.player.width / 2;
        const targetY = this.player.y + this.player.height / 2;
        const dx = targetX - (p.x + p.width / 2);
        const dy = targetY - (p.y + p.height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist > 10) {
          p.x += (dx / dist) * 480 * dt;
          p.y += (dy / dist) * 480 * dt;
        } else {
          // collect
          const healAmt = 35;
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
          this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#00ffaa', 14);
          this.playCoinSound();
          this.showTemporaryAlert("⚡ ¡ENERGÍA RESTAURADA!", "¡Bota de energía recuperó tu salud!", 2.5);
          this.speak("Energy Restored!");
          this.powerups.splice(i, 1);
          this.updateHUD();
          continue;
        }
      } else {
        // non-homing powerups: move and float
        p.x += p.vx * dt;
        p.frameTimer += dt * 5;
        if (p.onAerialCube) {
          const hostCube = this.enemies.find(e =>
            e.type === 0 && e.isAerial &&
            p.x < e.x + e.width && p.x + p.width > e.x
          );
          if (hostCube) p.y = hostCube.y - p.height - 6;
        } else if (p.onUpperRunway) {
          p.y = p.baseY + Math.sin(p.frameTimer) * 2;
        } else {
          p.y += Math.sin(p.frameTimer) * 1.8;
        }
        // Check pickup overlap
        const px = p.x + p.width / 2;
        const py = p.y + p.height / 2;
        const dx = px - (this.player.x + this.player.width / 2);
        const dy = py - (this.player.y + this.player.height / 2);
        const pickupOverlap =
          p.x < this.player.x + 190 && p.x + p.width > this.player.x + 50 &&
          p.y < this.player.y + 230 && p.y + p.height > this.player.y + 35;
        if (Math.hypot(dx, dy) < 100 || pickupOverlap) {
          if (p.isLuHelp) {
            this.luBoostCharges = Math.min(3, this.luBoostCharges + 1);
            this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#ffd700', 12);
            this.playCoinSound();
            this.showTemporaryAlert("⚡ ¡CARGA DE LU RECIBIDA!", "Recuperaste 1 rescate de Lu.", 2.6);
            this.speak("Lu charges restored!");
          } else if (p.isCoinBundle) {
            const amt = p.amount || 3;
            this.coinsCollected += amt;
            this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, 'gold', 10);
            this.playCoinSound();
            this.showTemporaryAlert(`+${amt} Monedas`, `Has recogido ${amt} monedas.`, 2.0);
          } else if (p.isFlight) {
            this.player.flightEnergy = this.player.maxFlightEnergy;
            if (p.unlocksLetter) this.unlockedLetters[p.unlocksLetter] = true;
            this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#00ffff', 10);
            this.playCoinSound();
            this.showTemporaryAlert(
              p.unlocksLetter ? `🪽 RUTA ${p.unlocksLetter} DESBLOQUEADA` : '🪽 ENERGÍA DE VUELO',
              p.unlocksLetter ? 'Vuelo al 100%. Sigue la ruta de monedas hasta la letra.' : 'Carga restaurada al 100%.',
              2.5
            );
          } else {
            const healAmt = p.isBoot ? 35 : 25;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
            this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#00ffaa', 14);
            this.playCoinSound();
            if (p.isEnergy) {
              this.showTemporaryAlert('⚡ ENERGÍA RECUPERADA', `Salud +${healAmt}.`, 2.2);
              this.speak('Energy restored!');
            }
          }
          this.powerups.splice(i, 1);
          this.updateHUD();
          continue;
        }
      }
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

      // Cubes stay vertically anchored so coins/items remain cleanly on top.
      if (e.type === 0 && e.baseY !== undefined) {
        e.y = e.baseY;
      }

      if (e.type === 1) {
        if (e.baseY) {
          const time = performance.now() / 420;
          const style = e.waveStyle || 0;
          if (style === 0) {
            e.y = e.baseY + Math.sin(time + (e.sineOffset || 0)) * (e.waveAmplitude || 16) + Math.sin(time * 0.72 + (e.wavePeriod || 0)) * 10;
          } else if (style === 1) {
            e.y = e.baseY + Math.sin(time * 0.76 + (e.sineOffset || 0)) * (e.waveAmplitude || 14) + Math.cos(time * 0.9 + (e.wavePeriod || 0)) * 12;
          } else {
            e.y = e.baseY + Math.sin(time * 0.95 + (e.sineOffset || 0)) * (e.waveAmplitude || 18) + Math.sin(time * 0.5 + (e.wavePeriod || 0)) * 8;
          }
        }
      } else if (e.type === 2) {
        // Straight rolling ball on the floor, without flying or bounce behavior
        e.y = e.baseY || (this.logicalHeight - e.height - 70);
        if (e.frameTimer > 0.08) {
          e.frame = (e.frame + 1) % this.enemy2BallFrames.length;
          e.frameTimer = 0;
        }
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

          e.shootTimer += dt;
          const shootInterval = 2.2;
          if (e.shootTimer > shootInterval) {
            e.shootTimer = 0;
            e.isShooting = 0.35;
            this.playEnemyShootSound();
            this.projectiles.push({
              x: e.x, y: e.y + e.height / 2,
              width: 65, height: 26,
              vx: -380,
              damage: 10,
              color: 'enemy1_shot'
            });
          }
        } else if (e.type === 2) {
          // Ball enemies do not shoot; they just roll straight to the player.
          e.shootTimer = 0;
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
      this.startGoalSequence();
    }

    if (this.state === 'celebration') this.updateGoalSequence(frameDt);
  }

  drawSheet(spriteInfo, frameIndex, x, y, w, h) {
    if (!spriteInfo.loaded) return;
    const fw = spriteInfo.img.width  / spriteInfo.cols;
    const fh = spriteInfo.img.height / spriteInfo.rows;
    const col = frameIndex % spriteInfo.cols;
    const row = Math.floor(frameIndex / spriteInfo.cols);
    this.ctx.drawImage(spriteInfo.img, col * fw, row * fh, fw, fh, x, y, w, h);
  }

  draw(dt = 0) {
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

    // Montañitas Dinámicas en el Fondo con los Sprites Oficiales de Lu y Peter (lu1..lu10, peter1..peter10)
    if (this.bgHills) {
      this.bgHills.forEach(h => {
        this.ctx.save();
        
        const hw = h.width || 160;
        const hh = h.height || 110;
        const peakX = h.x + hw / 2;
        const peakY = h.y;

        // Montaña neón cibernética
        this.ctx.fillStyle = 'rgba(18, 15, 38, 0.90)';
        this.ctx.strokeStyle = h.color || '#a200ff';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = h.color || '#a200ff';
        this.ctx.beginPath();
        this.ctx.moveTo(h.x, this.logicalHeight - 70);
        this.ctx.lineTo(peakX, peakY);
        this.ctx.lineTo(h.x + hw, this.logicalHeight - 70);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Renderizado de Sprites Oficiales (Lu y/o Peter)
        const frameIdx = h.animFrame % 10;
        const luImg = this.luFrames[frameIdx];
        const peterImg = this.peterFrames[frameIdx];

        const charH = 145; // Personajes grandes y prominentes (10% menor al héroe principal)

        if (h.charType === 0 && luImg && luImg.loaded) {
          // Solo Lu bailando/animándose en la cumbre
          const luW = luImg.width * (charH / luImg.height);
          this.ctx.drawImage(luImg, peakX - luW / 2, peakY - charH + 12, luW, charH);
        } else if (h.charType === 1 && peterImg && peterImg.loaded) {
          // Solo Peter bailando/animándose en la cumbre
          const peterW = peterImg.width * (charH / peterImg.height);
          this.ctx.drawImage(peterImg, peakX - peterW / 2, peakY - charH + 12, peterW, charH);
        } else if (h.charType === 2) {
          // Lu y Peter Juntos en la cumbre
          if (luImg && luImg.loaded) {
            const luW = luImg.width * (charH / luImg.height);
            this.ctx.drawImage(luImg, peakX - luW - 5, peakY - charH + 12, luW, charH);
          }
          if (peterImg && peterImg.loaded) {
            const peterW = peterImg.width * (charH / peterImg.height);
            this.ctx.drawImage(peterImg, peakX + 5, peakY - charH + 12, peterW, charH);
          }
        }

        // Globo de diálogo motivador
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.beginPath();
        const bubbleW = 135;
        const bubbleH = 26;
        const bubbleX = peakX - bubbleW / 2;
        const bubbleY = peakY - charH - 22;
        if (this.ctx.roundRect) {
          this.ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 6);
        } else {
          this.ctx.rect(bubbleX, bubbleY, bubbleW, bubbleH);
        }
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.font = 'bold 9.5px "Orbitron", monospace';
        this.ctx.fillStyle = '#0a0a0c';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(h.quote, peakX, bubbleY + 16);

        this.ctx.restore();
      });
    }

    // Renderizado de Lu Volando en la Nube de Izquierda a Derecha a la altura marcada (Y = 210px)
    if (this.luBoostActive) {
      const bImg = this.boostFrames[this.luBoostFrame % 10];
      if (bImg && bImg.loaded) {
        this.ctx.save();
        const bHeight = 85;
        const bWidth = bImg.width * (bHeight / bImg.height);
        const floatY = this.luBoostY + Math.sin(performance.now() / 200) * 4;

        // NUBE MÁGICA DE NIMBO / NIMBUS BAJO LOS PIES DE LU
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2.5;

        const cloudX = this.luBoostX + bWidth / 2;
        const cloudY = floatY + bHeight - 12;

        this.ctx.beginPath();
        this.ctx.arc(cloudX - 35, cloudY, 18, 0, Math.PI * 2);
        this.ctx.arc(cloudX - 15, cloudY - 12, 24, 0, Math.PI * 2);
        this.ctx.arc(cloudX + 15, cloudY - 10, 22, 0, Math.PI * 2);
        this.ctx.arc(cloudX + 35, cloudY, 18, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Estela de destellos dorados y cyan de la nube voladora
        for (let i = 0; i < 3; i++) {
          this.particles.push({
            x: cloudX - 40 - Math.random() * 20,
            y: cloudY + (Math.random() - 0.5) * 15,
            vx: -80 - Math.random() * 40,
            vy: (Math.random() - 0.5) * 30,
            life: 0.3,
            maxLife: 0.3,
            color: Math.random() > 0.5 ? '#00ffff' : '#ffd700',
            size: 3 + Math.random() * 4
          });
        }

        // Renderizado del sprite de Lu volando sobre la nube
        this.ctx.shadowBlur = 16;
        this.ctx.shadowColor = '#00ffaa';
        this.ctx.drawImage(bImg, this.luBoostX, floatY, bWidth, bHeight);

        // Globo de diálogo flotante de Lu
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = '#00ffaa';
        this.ctx.beginPath();
        const bubbleX = this.luBoostX - 10;
        const bubbleY = floatY - 32;
        if (this.ctx.roundRect) {
          this.ctx.roundRect(bubbleX, bubbleY, 165, 26, 6);
        } else {
          this.ctx.rect(bubbleX, bubbleY, 165, 26);
        }
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.font = 'bold 9.5px "Orbitron", monospace';
        this.ctx.fillStyle = '#0a0a0c';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("⚡ ¡AQUÍ TIENES ENERGÍA!", bubbleX + 82, bubbleY + 17);

        this.ctx.restore();
      }
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

    // ================================================================
    // TIMELINE SYNC WEATHER FX (2:22 Lightnings -> 2:12 Rain -> 2:04 Psychedelic -> 3:00 Calm)
    // ================================================================
    const remainingSec = Math.max(0, Math.ceil(180 - this.gameTimer));

    // Lluvia de ladito (de 2:12 a 2:04 y durante desenlace final)
    const isRaining = (remainingSec <= 132 && remainingSec > 124) || (remainingSec <= 20 && remainingSec > 8);
    if (isRaining) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(180, 220, 255, 0.55)';
      this.ctx.lineWidth = 1.8;
      this.rainDrops.forEach(r => {
        r.x -= r.speed * 0.45 * 0.016;
        r.y += r.speed * 0.016;
        if (r.y > this.logicalHeight) { r.y = -20; r.x = Math.random() * (this.logicalWidth + 200); }
        if (r.x < -50) { r.x = this.logicalWidth + 50; }
        this.ctx.beginPath();
        this.ctx.moveTo(r.x, r.y);
        this.ctx.lineTo(r.x - r.length * 0.5, r.y + r.length);
        this.ctx.stroke();
      });
      this.ctx.restore();
    }

    // Rayos & Modo Psicodélico (2:22 inicio de rayos | 2:04 psicodélico intenso)
    const isLightningActive = (remainingSec <= 142 && remainingSec > 132) || (remainingSec <= 124 && remainingSec > 15);
    const isPsychedelic = remainingSec <= 124 && remainingSec > 15;

    const beatTime = performance.now() / 500;
    const beatPulse = Math.pow(Math.sin(beatTime * Math.PI), 4);

    if (isLightningActive && beatPulse > 0.60) {
      this.ctx.save();
      if (isPsychedelic) {
        const flashHue = Math.floor((performance.now() / 250) % 3) === 0 ? 'rgba(255, 0, 255, 0.14)' : 'rgba(0, 255, 255, 0.14)';
        this.ctx.fillStyle = flashHue;
        this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
      }

      this.ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(0, 255, 255, 0.90)' : 'rgba(255, 255, 255, 0.95)';
      this.ctx.lineWidth = 2 + beatPulse * 3;
      this.ctx.shadowBlur = 18;
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
      if (c.revealAt !== undefined && this.gameTimer < c.revealAt) return;
      const revealAlpha = c.revealAt === undefined
        ? 1
        : Math.min(1, (this.gameTimer - c.revealAt) / 0.18);
      const img = this.coinFrames[c.frame % this.coinFrames.length];
      if (img && img.loaded) {
        const imgRatio = img.width / img.height;
        const drawW = c.height * imgRatio;
        const drawH = c.height;
        const drawX = c.x + (c.width - drawW) / 2;
        const drawY = c.y;
        this.ctx.save();
        this.ctx.globalAlpha = revealAlpha;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        this.ctx.restore();
      } else {
        this.ctx.save();
        this.ctx.globalAlpha = revealAlpha;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.fillStyle = 'gold';
        this.ctx.beginPath();
        this.ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });

    // Moneda gigante pixelada en la victoria
    if (this.victoryCoin) {
      const vc = this.victoryCoin;
      vc.frameTimer += dt * 10;
      if (vc.frameTimer > 0.12) { vc.frame = (vc.frame + 1) % this.coinFrames.length; vc.frameTimer = 0; }
      const img = this.coinFrames[vc.frame % this.coinFrames.length];
      if (img && img.loaded) {
        this.ctx.save();
        // Pixel-art look
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.shadowBlur = 32; this.ctx.shadowColor = '#ffd700';
        const size = vc.size || 140;
        this.ctx.drawImage(img, vc.x - size/2, vc.y - size/2, size, size);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.restore();
      }
    }

    // Renderizado de Letras Naranjas Brillantes L-I-S-A-R
    this.letterItems.forEach(item => {
      this.ctx.save();
      const cx = item.x + item.width / 2;
      const cy = item.y + item.height / 2;
      const amplitude = item.pattern === 'cube-crown' ? 2.5 : item.pattern === 'final-zigzag' ? 6 : 4;
      const floatY = cy + Math.sin(performance.now() / 180 + (item.floatPhase || 0)) * amplitude;
      const unlocked = !item.requiresUnlock || this.unlockedLetters[item.letter];

      this.ctx.shadowBlur = 22;
      this.ctx.shadowColor = unlocked ? '#ff7700' : '#00b8d9';

      this.ctx.fillStyle = unlocked ? 'rgba(255, 110, 0, 0.94)' : 'rgba(8, 35, 48, 0.82)';
      this.ctx.strokeStyle = unlocked ? '#ffd700' : '#48dff5';
      this.ctx.lineWidth = 2.8;
      this.ctx.beginPath();
      this.ctx.arc(cx, floatY, 25, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = '900 22px "Orbitron", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.fillText(item.letter, cx, floatY + 1);

      this.ctx.restore();
    });

    // Powerups (Rayitos de Energía Eléctrica)
    this.powerups.forEach(p => {
      this.ctx.save();
      const cx = p.x + p.width / 2;
      const cy = p.y + p.height / 2;
      const r = p.width / 2;
      const time = performance.now() / 150;
      
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = p.isLuHelp ? '#ffd700' : (p.isEnergy ? '#00ffaa' : '#00f3ff');
      
      // Anillo pulsante
      this.ctx.strokeStyle = p.isLuHelp ? 'rgba(255, 215, 0, 0.85)' : 'rgba(0, 243, 255, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r * (1 + Math.sin(time) * 0.15), 0, Math.PI * 2);
      this.ctx.stroke();

      if (p.isFlight) {
        // Same wing language used by the compact flight HUD.
        this.ctx.strokeStyle = Math.sin(time * 3) > 0 ? '#ffffff' : '#7afcff';
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 2, cy + 6);
        this.ctx.bezierCurveTo(cx - 10, cy + 4, cx - 17, cy - 2, cx - 19, cy - 12);
        this.ctx.bezierCurveTo(cx - 10, cy - 10, cx - 5, cy - 5, cx - 1, cy + 1);
        this.ctx.moveTo(cx + 2, cy + 6);
        this.ctx.bezierCurveTo(cx + 10, cy + 4, cx + 17, cy - 2, cx + 19, cy - 12);
        this.ctx.bezierCurveTo(cx + 10, cy - 10, cx + 5, cy - 5, cx + 1, cy + 1);
        this.ctx.stroke();
      } else if (p.isLuHelp) {
        // Golden Lu token: clearly different from health and flight energy.
        this.ctx.fillStyle = 'rgba(22, 13, 2, 0.92)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff4a8';
        this.ctx.font = '900 10px "Orbitron", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('LU ⚡', cx, cy + 1);
      } else {
        // Health-energy bolt.
        this.ctx.fillStyle = Math.sin(time * 3) > 0 ? '#ffffff' : '#00ffaa';
        this.ctx.beginPath();
        this.ctx.moveTo(cx + r * 0.2, cy - r * 0.85);
        this.ctx.lineTo(cx - r * 0.5, cy + r * 0.05);
        this.ctx.lineTo(cx - r * 0.05, cy + r * 0.05);
        this.ctx.lineTo(cx - r * 0.35, cy + r * 0.85);
        this.ctx.lineTo(cx + r * 0.5, cy - r * 0.05);
        this.ctx.lineTo(cx + r * 0.05, cy - r * 0.05);
        this.ctx.closePath();
        this.ctx.fill();
      }
      
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

    // ================================================================
    // META LISAR STUDIO & PERSONAJES LU Y PETER BAILANDO EN LA LLEGADA
    // ================================================================
    if (this.goalSceneActive || this.state === 'celebration' || this.state === 'victory') {
      const goalReveal = this.state === 'victory'
        ? 1
        : Math.max(0, Math.min(1, ((this.goalSequenceDuration || 7) - this.celebrationTimer) / 1.15));
      const targetArchX = this.logicalWidth / 2 - 118;
      const archX = targetArchX + (1 - goalReveal) * (this.logicalWidth - targetArchX + 280);
      const floorY = Math.min(this.logicalHeight - 70, this.logicalHeight * 0.86);

      this.ctx.save();
      
      // Pilares de la Meta neón
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#00ffff';
      this.ctx.fillStyle = '#00ffff';
      this.ctx.fillRect(archX, floorY - 170, 16, 170);
      this.ctx.fillRect(archX + 220, floorY - 170, 16, 170);
      this.ctx.fillStyle = 'rgba(0, 243, 255, 0.78)';
      this.ctx.fillRect(archX - 95, floorY, 425, 6);

      // Pancarta Meta
      this.ctx.fillStyle = 'rgba(15, 15, 35, 0.92)';
      this.ctx.strokeStyle = '#ff00ff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = '#ff00ff';
      this.ctx.fillRect(archX - 10, floorY - 200, 256, 45);
      this.ctx.strokeRect(archX - 10, floorY - 200, 256, 45);

      this.ctx.font = 'bold 18px "Orbitron", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🏆 META LISAR STUDIO', archX + 118, floorY - 172);

      // Renderizado de Sprites Oficiales de Lu y Peter Bailando en la Meta
      const animIdx = Math.floor(performance.now() / 100) % 10;
      const luImg = (this.luFrames[animIdx] && this.luFrames[animIdx].loaded)
        ? this.luFrames[animIdx]
        : this.luFrames.find(frame => frame && frame.loaded);
      const peterImg = (this.peterFrames[animIdx] && this.peterFrames[animIdx].loaded)
        ? this.peterFrames[animIdx]
        : this.peterFrames.find(frame => frame && frame.loaded);
      const lisarReference = this.runFrames.find(frame => frame && frame.loaded);
      const charH = lisarReference
        ? lisarReference.height * (this.player.height / 200)
        : this.player.height * 1.18;

      if (luImg && luImg.loaded) {
        const luW = luImg.width * (charH / luImg.height);
        this.ctx.save();
        this.ctx.shadowBlur = 16;
        this.ctx.shadowColor = '#00ffaa';
        this.ctx.drawImage(luImg, archX + 70 - luW / 2, floorY - charH + 10, luW, charH);
        this.ctx.restore();
      }

      if (peterImg && peterImg.loaded) {
        const peterW = peterImg.width * (charH / peterImg.height);
        this.ctx.save();
        this.ctx.shadowBlur = 16;
        this.ctx.shadowColor = '#ff8800';
        this.ctx.drawImage(peterImg, archX + 166 - peterW / 2, floorY - charH + 10, peterW, charH);
        this.ctx.restore();
      }

      if (!this.victoryTriggered) this.victoryTriggered = true;

      this.ctx.restore();
    }

    // Jugador (Lisar)
    const blink = this.player.invulnerable <= 0 || Math.floor(this.player.invulnerable * 14) % 2 === 0;
    if (blink && this.activeAnim && this.activeAnim.length > 0) {
      const img = this.activeAnim[this.player.frame % this.activeAnim.length];
      if (img && img.loaded) {
        const baseHeightRef = 200; 
        let drawW = img.width * (this.player.height / baseHeightRef);
        let drawH = img.height * (this.player.height / baseHeightRef);
        const goalScale = this.goalSceneActive ? (this.goalFlightScale || 1) : 1;
        drawW *= goalScale;
        drawH *= goalScale;
        
        let drawX = this.player.x + (this.player.width - drawW) / 2;
        let drawY;
        if (this.isFlying) {
          drawY = this.player.y + (this.player.height - drawH) / 2;
        } else {
          drawY = this.player.y + (this.player.height - drawH);
        }

        // Si está atacando, desplazar ligeramente al frente para marcar el impacto del golpe
        if (this.player.isAttacking) {
          drawX += 28 * (this.player.facingTarget || 1);
          drawW *= 1.10;
          drawH *= 1.10;
        }
        
        this.ctx.save();
        const progress = Math.min(1, this.gameTimer / 60);
        const onGround = this.player.y >= (this.logicalHeight - this.player.height - 42);
        if (progress > 0.15 && onGround && !this.player.isAttacking) {
          this.ctx.filter = `drop-shadow(0 0 ${progress * 25}px #a200ff) drop-shadow(0 0 ${progress * 10}px #ff00ff)`;
        }
        
        const centerX = drawX + drawW / 2;
        const centerY = drawY + drawH / 2;
        this.ctx.translate(centerX, centerY);
        if (this.player.angle) {
          this.ctx.rotate(this.player.angle);
        }
        const drawFacing = (direction, alpha) => {
          if (alpha <= 0) return;
          this.ctx.save();
          this.ctx.globalAlpha *= alpha;
          this.ctx.scale(direction, 1);
          this.ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          this.ctx.restore();
        };
        if (this.player.turnTimer > 0) {
          const rawTurn = 1 - this.player.turnTimer / this.player.turnDuration;
          const smoothTurn = rawTurn * rawTurn * (3 - 2 * rawTurn);
          drawFacing(this.player.facingFrom, 1 - smoothTurn);
          drawFacing(this.player.facingTarget, smoothTurn);
        } else {
          drawFacing(this.player.facingTarget || 1, 1);
        }
        this.ctx.filter = 'none';
        this.ctx.restore();
      }
      // No fallback: no more blue square

      if (this.input.up || this.goalFlightActive) {
        const exhaustFacing = this.player.facingTarget || 1;
        const exhaustScale = this.goalSceneActive ? (this.goalFlightScale || 1) : 1;
        const exhaustBaseX = this.player.x + this.player.width * 0.5
          - exhaustFacing * this.player.width * 0.42 * exhaustScale;
        const exhaustBaseY = this.player.y + this.player.height * (0.5 + 0.5 * exhaustScale);
        this.ctx.fillStyle = Math.random() > 0.5 ? '#ff9900' : '#ffff00';
        this.ctx.beginPath();
        this.ctx.moveTo(exhaustBaseX, exhaustBaseY);
        this.ctx.lineTo(
          exhaustBaseX + 20 * exhaustFacing * exhaustScale,
          exhaustBaseY + (20 + Math.random() * 20) * exhaustScale
        );
        this.ctx.lineTo(exhaustBaseX + 40 * exhaustFacing * exhaustScale, exhaustBaseY);
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

    // Intro / countdown while the player enters, with final white info block below READY
    if (this.introActive) {
      const countdownElapsed = this.introDelayTimer - this.introCountdownStart;
      const countdownStarted = countdownElapsed >= 0;
      const progress = Math.max(0, Math.min(1, countdownElapsed / this.introCountdownDuration));
      const cCenterY = this.logicalHeight * 0.48;
      const currentStep = !countdownStarted ? -1 : progress < 0.25 ? 3 : progress < 0.50 ? 2 : progress < 0.75 ? 1 : 0;
      const introVisible = this.introAlpha > 0.01;

      if (this.introOverlayEl) {
        this.introOverlayEl.style.display = introVisible ? 'flex' : 'none';
        this.introOverlayEl.style.opacity = String(this.introAlpha);
      }

      if (this.lastCountStep !== currentStep) {
        this.lastCountStep = currentStep;
        if (currentStep > 0) {
          this.speak(currentStep.toString());
        } else if (currentStep === 0 && progress >= 0.75) {
          this.speak('READY!!!');
        }
      }

      if (!countdownStarted) {
        if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
      } else if (progress < 0.25) {
        if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
        this.ctx.font = '900 75px "Orbitron", monospace';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.shadowBlur = 22;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fillText('3', this.logicalWidth / 2, cCenterY);
      } else if (progress < 0.50) {
        if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
        this.ctx.font = '900 75px "Orbitron", monospace';
        this.ctx.fillStyle = '#ff9900';
        this.ctx.shadowBlur = 22;
        this.ctx.shadowColor = '#ff9900';
        this.ctx.fillText('2', this.logicalWidth / 2, cCenterY);
      } else if (progress < 0.75) {
        if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
        this.ctx.font = '900 75px "Orbitron", monospace';
        this.ctx.fillStyle = '#ff0055';
        this.ctx.shadowBlur = 22;
        this.ctx.shadowColor = '#ff0055';
        this.ctx.fillText('1', this.logicalWidth / 2, cCenterY);
      } else {
        const coinImg = this.coinFrames[Math.floor(performance.now() / 80) % this.coinFrames.length];
        if (coinImg && coinImg.loaded) {
          const cSize = 135;
          this.ctx.shadowBlur = 35;
          this.ctx.shadowColor = '#ffd700';
          this.ctx.drawImage(coinImg, this.logicalWidth / 2 - cSize / 2, cCenterY - cSize / 2 - 10, cSize, cSize);
        }

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
    } else {
      if (this.introOverlayEl && this.introOverlayEl.style.display !== 'none') {
        this.introOverlayEl.style.display = 'none';
      }
      if (this.readyOverlayEl && this.readyOverlayEl.style.display !== 'none') {
        this.readyOverlayEl.style.display = 'none';
      }
    }

    this.ctx.restore();
  }

  loop(now) {
    if (this.state !== 'playing' && this.state !== 'celebration') return;
    let dt = (now - this.lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    this.lastTime = now;
    this.update(dt);
    this.draw(dt);
    requestAnimationFrame(t => this.loop(t));
  }

  destroy() {
    this.state = 'destroyed';
    if (this.audio) this.audio.pause();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.container.innerHTML = '';
  }
}

function initLisarArcadeBootstrap() {
  window.initArcadeGame = function() {
    if (window.arcadeGame && window.arcadeGame.state !== 'destroyed') return window.arcadeGame;
    window.arcadeGame = new LisarArcade2D('arcade-game-container');
    return window.arcadeGame;
  };

  const btn     = document.getElementById('start-arcade-btn');
  const overlay = document.getElementById('arcade-overlay');

  if (btn && overlay) {
    let launched = false;
    const handleLaunch = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (launched) return;
      launched = true;
      overlay.style.display = 'none';

      const game = window.initArcadeGame();
      if (game) game.startGame();
    };

    btn.addEventListener('click', handleLaunch);
    btn.addEventListener('touchstart', handleLaunch, { passive: false });

    // Prepare canvas, sprites and audio behind the cover so Play feels immediate.
    window.initArcadeGame();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLisarArcadeBootstrap);
} else {
  initLisarArcadeBootstrap();
}
