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
      facing: 'right',
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
    this.extraDiscountBonus = 0;
    this.lisarWordBonusGranted = false;
    this.celebrationTimer = 0;
    this.luBoostCharges = 3; // Máximo 3 ayudas de Lu por partida

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
    this.coinsRequired  = 100;
    this.lastDiscountThreshold = 0;
    this.spawnTimer     = 0;
    this.isFlying       = false;
    this.loopRunning    = false;

    this.input = { up: false };

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.initReadyCSS();
    this.loadSheetSprites();
    this.setupControls();
    this.createHUD();
    setTimeout(() => {
      this.resize();
      this.showInstructions();
    }, 50);
  }

  showInstructions() {
    if (this.instructionCardEl) this.instructionCardEl.remove();

    this.instructionCardEl = document.createElement('div');
    Object.assign(this.instructionCardEl.style, {
      position: 'absolute',
      // PANEL_REFERENCE_Y: mismo eje que el panel de pausa (53% = centro del bloque verde)
      top: '53%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '88%',
      maxWidth: '440px',
      background: 'rgba(10, 12, 28, 0.97)',
      border: '2.5px solid #00f3ff',
      boxShadow: '0 0 24px rgba(0, 243, 255, 0.9), inset 0 0 15px rgba(0, 243, 255, 0.2)',
      borderRadius: '12px',
      padding: '16px 20px',
      color: '#ffffff',
      fontFamily: "'Orbitron', sans-serif",
      zIndex: '50',
      textAlign: 'center',
      pointerEvents: 'auto',
      transition: 'opacity 0.4s ease-out'
    });

    this.instructionCardEl.innerHTML = `
      <h3 style="margin:0 0 8px 0; color:#00f3ff; font-size:1.15rem; font-weight:900; text-shadow:0 0 10px #00f3ff; letter-spacing:1px;">
        🎮 LISAR JET RUSH — GUÍA DE VUELO
      </h3>
      <div style="font-size:0.75rem; color:#ffd700; margin-bottom:10px; font-weight:900; text-shadow:0 0 6px rgba(255, 215, 0, 0.4); letter-spacing:0.5px;">
        VERSIÓN 3.5 - BLOQUE VERDE EXACTO (HUD 100% LIMPIO)
      </div>
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
    // 1. Efecto de Arpegio Techno Synth de Capcom clásico de los 90s
    this.playArcadeAnnouncerChime();

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        
        // Mapear diálogos a estilo Capcom Latino Neutro enérgico
        let capcomText = text;
        if (text.includes("percent discount") || text.includes("discount unlocked")) {
          capcomText = "¡Excelente! ¡Descuento aumentado!";
        } else if (text.includes("Letter") || text.includes("collected")) {
          // Prioridad secundaria para letras
          capcomText = "¡Letra obtenida!";
        } else if (text.includes("Word Lisar Complete")) {
          capcomText = "¡Increíble! ¡Descuento de palabra completado!";
        } else if (text.includes("Emergency Energy Boost") || text.includes("Energy Restored") || text.includes("Poder de Lu")) {
          // Prioridad baja para ayudas
          capcomText = "¡Poder de Lu!";
        } else if (text.includes("VICTORY") || text.includes("MAXIMUM DISCOUNT")) {
          capcomText = "¡Victoria máxima! ¡Gracias por jugar!";
        } else if (text.includes("MISSION FAILED") || text.includes("GAME OVER")) {
          capcomText = "¡Fin del juego! ¡Gracias por jugar!";
        } else if (text === "3") { capcomText = "¡Tres!"; }
        else if (text === "2") { capcomText = "¡Dos!"; }
        else if (text === "1") { capcomText = "¡Uno!"; }
        else if (text === "Ready!") { capcomText = "¡Prepárate! ¡Vuela!"; }

        const utterance = new SpeechSynthesisUtterance(capcomText);
        utterance.lang = 'es-MX'; // Español Latino Neutro
        utterance.rate = 1.30;   // Rápido y dinámico
        utterance.pitch = 1.45;  // Agudo pero natural de anunciadora de Capcom
        utterance.volume = 1.0;

        const loadAndSpeakVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          // Intentar elegir una voz en español neutro (México, US o España) que sea femenina
          const spanishVoice = voices.find(v => 
            v.lang.startsWith('es') && (
              v.name.includes('Sabina') || v.name.includes('Helena') || v.name.includes('Paulina') || 
              v.name.includes('Google') || v.name.includes('Monica') || v.name.includes('Zira') ||
              v.name.includes('Female') || v.name.includes('femenina')
            )
          ) || voices.find(v => v.lang.startsWith('es'));
          
          if (spanishVoice) {
            utterance.voice = spanishVoice;
          }
          window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
          loadAndSpeakVoice();
        } else {
          window.speechSynthesis.onvoiceschanged = loadAndSpeakVoice;
          window.speechSynthesis.speak(utterance);
        }
      } catch(e) {
        console.error("Vocal synth error:", e);
      }
    }
  }

  playArcadeAnnouncerChime() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6 Marvel vs Capcom Arpeggio
      freqs.forEach((f, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, this.audioCtx.currentTime + idx * 0.035);
        gain.gain.setValueAtTime(0.14, this.audioCtx.currentTime + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.035 + 0.16);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.035);
        osc.stop(this.audioCtx.currentTime + idx * 0.035 + 0.16);
      });
    } catch(e) {}
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

    const slashX = px + pw - 10;
    const slashY = py - 30;
    const slashW = 140;
    const slashH = ph + 60;

    // Destellos de corte de espada neón
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: slashX + Math.random() * slashW,
        y: slashY + Math.random() * slashH,
        vx: 180 + Math.random() * 220,
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
      if (slashX < e.x + e.width && slashX + slashW > e.x && slashY < e.y + e.height && slashY + slashH > e.y) {
        this.createExplosion(e.x + e.width / 2, e.y + e.height / 2, 'enemy_explode', 1, e.width);
        this.playExplosionSound();
        this.enemies.splice(i, 1);
        this.coinsCollected += 1;
      }
    }
  }

  setupControls() {
    window.addEventListener('keydown', e => {
      // Ignore if typing inside form fields
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      // P / Escape MUST work in both playing AND paused states — check BEFORE the state guard
      if (e.code === 'Escape' || e.code === 'KeyP' || e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.state === 'playing' || this.state === 'paused') {
          this.togglePause();
          e.preventDefault();
        }
        return;
      }

      // All other keys only work while actively playing
      if (this.state !== 'playing') return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.input.up = true;
        e.preventDefault();
      }
      if (e.code === 'KeyX' || e.code === 'KeyJ' || e.code === 'KeyZ' || e.code === 'KeyK' || e.key === 'x' || e.key === 'X' || e.key === 'j' || e.key === 'J' || e.key === 'z' || e.key === 'Z' || e.key === 'k' || e.key === 'K') {
        this.performAttack();
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.input.left = true;
        e.preventDefault();
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.input.right = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      // NEVER guard keyup — must ALWAYS reset input flags regardless of state
      // Otherwise character stays flying if state changes while Space is held
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.input.up = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = false;
    });

    // Reset all inputs on window/tab blur — prevents stuck keys
    window.addEventListener('blur', () => {
      this.input.up = false;
      this.input.left = false;
      this.input.right = false;
    });

    // Mouse click = jump
    this.container.addEventListener('mousedown', e => {
      if (this.state === 'playing') this.input.up = true;
    });
    this.container.addEventListener('mouseup', () => { this.input.up = false; });

    // Auto-pause on tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.togglePause();
    });

    this.createMobileTouchControls();
  }

  createMobileTouchControls() {
    if (this.mobileControls) this.mobileControls.remove();

    this.mobileControls = document.createElement('div');
    this.mobileControls.id = 'arcade-mobile-controls';
    Object.assign(this.mobileControls.style, {
      position: 'absolute',
      bottom: '15px',
      left: '12px',
      right: '12px',
      display: 'none',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: '25',
      pointerEvents: 'auto',
      userSelect: 'none',
      webkitUserSelect: 'none',
      touchAction: 'none'
    });

    // Left D-Pad Group (Izquierda / Derecha)
    const dpadGroup = document.createElement('div');
    Object.assign(dpadGroup.style, {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    });

    const btnLeft = this.createTouchBtn('◀', 'Izquierda', () => { this.input.left = true; }, () => { this.input.left = false; }, '#00ffaa');
    const btnRight = this.createTouchBtn('▶', 'Derecha', () => { this.input.right = true; }, () => { this.input.right = false; }, '#00ffaa');
    dpadGroup.appendChild(btnLeft);
    dpadGroup.appendChild(btnRight);

    // Right Action Buttons Group (Atacar / Saltar)
    const actionGroup = document.createElement('div');
    Object.assign(actionGroup.style, {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    });

    const btnAttack = this.createTouchBtn('⚔️', 'Atacar', () => { this.performAttack(); }, null, '#ff2a6d');
    const btnJump = this.createTouchBtn('🚀', 'Saltar', () => { this.input.up = true; }, () => { this.input.up = false; }, '#ffd700');
    
    actionGroup.appendChild(btnAttack);
    actionGroup.appendChild(btnJump);

    this.mobileControls.appendChild(dpadGroup);
    this.mobileControls.appendChild(actionGroup);
    this.container.appendChild(this.mobileControls);
  }

  createTouchBtn(icon, label, onPress, onRelease, customColor = '#00ffaa') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    btn.innerHTML = `<span style="font-size:1.25rem; line-height:1; pointer-events:none;">${icon}</span>`;
    Object.assign(btn.style, {
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: 'rgba(10, 15, 30, 0.75)',
      backdropFilter: 'blur(8px)',
      webkitBackdropFilter: 'blur(8px)',
      border: `2px solid ${customColor}`,
      color: '#ffffff',
      boxShadow: `0 0 12px ${customColor}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      outline: 'none',
      transition: 'transform 0.1s ease, background 0.1s ease, box-shadow 0.1s ease'
    });

    const handlePress = (e) => {
      if (e && e.cancelable) e.preventDefault();
      btn.style.transform = 'scale(0.88)';
      btn.style.background = `${customColor}40`;
      btn.style.boxShadow = `0 0 20px ${customColor}`;
      if (onPress) onPress();
    };

    const handleRelease = (e) => {
      if (e && e.cancelable) e.preventDefault();
      btn.style.transform = 'scale(1)';
      btn.style.background = 'rgba(10, 15, 30, 0.75)';
      btn.style.boxShadow = `0 0 12px ${customColor}40`;
      if (onRelease) onRelease();
    };

    btn.addEventListener('touchstart', handlePress, { passive: false });
    btn.addEventListener('touchend', handleRelease, { passive: false });
    btn.addEventListener('touchcancel', handleRelease, { passive: false });
    btn.addEventListener('mousedown', handlePress);
    btn.addEventListener('mouseup', handleRelease);
    btn.addEventListener('mouseleave', handleRelease);

    return btn;
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
      position: 'absolute',
      // PANEL_REFERENCE_Y: mismo eje que el panel de pausa (53% = centro del bloque verde)
      top: '53%', left: '0', right: '0',
      transform: 'translateY(-50%)',
      height: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      paddingTop: '0', boxSizing: 'border-box',
      background: 'none', color: '#ffffff', zIndex: '40', pointerEvents: 'none'
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

  updateLetterBadges() {
    ['L', 'I', 'S', 'A', 'R'].forEach(l => {
      const el = document.getElementById(`letter-badge-${l}`);
      if (el && this.collectedLisarLetters && this.collectedLisarLetters[l]) {
        el.style.background = 'linear-gradient(180deg, #ff9900, #ff4400)';
        el.style.border = '1px solid #ffd700';
        el.style.color = '#ffffff';
        el.style.boxShadow = '0 0 10px #ff8800';
        el.style.textShadow = '0 0 6px #ffffff';
      }
    });
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
    if (coins) coins.innerText = this.coinsCollected + ' / ' + this.coinsRequired;

    // Actualización de la barra de progreso de descuento (Max 20% Monedas + 10% LISAR = 30% TOTAL)
    const currentTier = Math.min(4, Math.floor(this.coinsCollected / 20));
    const currentDiscountPct = currentTier * 5;
    const baseDiscount = currentDiscountPct;
    const extraBonus = (this.lisarWordBonusGranted ? 10 : 0);
    const totalDiscountPct = Math.min(30, baseDiscount + extraBonus);

    const progressPct = Math.min(100, (this.coinsCollected / 100) * 100);

    const discountPctEl = document.getElementById('arcade-discount-pct');
    if (discountPctEl) discountPctEl.innerText = `${totalDiscountPct}%`;

    const discountBarEl = document.getElementById('arcade-discount-bar');
    if (discountBarEl) discountBarEl.style.width = `${progressPct}%`;

    const discountSubEl = document.getElementById('arcade-discount-sub');
    if (discountSubEl) {
      if (this.coinsCollected >= 100) {
        discountSubEl.innerText = '¡MÁXIMO 20% MONEDAS ALCANZADO!';
        discountSubEl.style.color = '#00ffaa';
      } else {
        const currentTier = Math.floor(this.coinsCollected / 20);
        const coinsInTier = this.coinsCollected % 20;
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
      // PANEL_REFERENCE_Y: mismo eje que todos los paneles del juego (53% = centro del bloque verde)
      position: 'absolute', top: '53%', left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(5, 6, 15, 0.68)',
      backdropFilter: 'blur(6px)',
      webkitBackdropFilter: 'blur(6px)',
      border: '1.5px solid rgba(0, 243, 255, 0.6)',
      boxShadow: '0 0 12px rgba(0, 243, 255, 0.35)',
      color: '#fff',
      borderRadius: '6px',
      padding: '8px 18px',
      textAlign: 'center',
      fontFamily: "'Orbitron', sans-serif",
      zIndex: '99',
      transition: 'all 0.4s ease-out',
      pointerEvents: 'none'
    });
    alertEl.innerHTML = `
      <h4 style="margin:0 0 2px 0; color:#00f3ff; font-size:0.88rem; font-weight:bold;">${title}</h4>
      <p style="margin:0; font-size:0.75rem; opacity:0.95; font-weight:bold; color:#00ff00;">${subtitle}</p>
    `;
    this.container.appendChild(alertEl);
    setTimeout(() => {
      alertEl.style.opacity = '0';
      // mantener top en 53% durante fade-out
      setTimeout(() => alertEl.remove(), 400);
    }, seconds * 1000);
  }

  shareScore() {
    const discount = Math.min(25, Math.floor(this.coinsCollected / 20) * 5);
    const score = this.coinsCollected * 120;
    const shareText = `🚀 ¡Logré ${score} pts y un ${discount}% de descuento en Lisar Jet Rush (Lisar Studio 2026)! 🎮✨ ¿Puedes superar mi puntaje?`;
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

  showMessage(title, subtitle, buttons = [], legacyAction = null) {
    this.msgOverlay.style.display    = 'flex';
    this.msgOverlay.style.pointerEvents = 'auto';
    this.msgOverlay.innerHTML = `
      <div style="background:rgba(10,12,28,0.85); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1.5px solid rgba(0,243,255,0.7); box-shadow:0 0 16px rgba(0,243,255,0.4); border-radius:12px; padding:20px 24px; max-width:88%; width:440px; text-align:center; box-sizing:border-box;">
        <h2 style="font-size:1.45rem; color:#ffffff; margin:0 0 10px 0; text-shadow:0 0 12px #00f3ff, 0 0 24px #00f3ff; font-family:'Orbitron',sans-serif; font-weight:900; letter-spacing:1px;">${title}</h2>
        <div style="font-size:0.92rem; margin:0 0 16px 0; text-align:center; line-height:1.5; font-family:'Orbitron',sans-serif; color:#ffffff; font-weight:bold; text-shadow:0 0 8px #ffffff;">${subtitle}</div>
        <div id="msg-btn-container" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; align-items:center; margin-top:12px;"></div>
      </div>
    `;

    const btnContainer = document.getElementById('msg-btn-container');

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
      userSelect: 'none'
    });
    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.shareScore();
    });
    if (btnContainer) btnContainer.appendChild(shareBtn);

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
        userSelect: 'none'
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

  drawReadyScreen() {
    // Ensure canvas is sized (do NOT call resize here to avoid infinite loop)
    if (this.canvas.width === 0 || this.canvas.height === 0) return;
    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  startGame() {
    this.hideMessage();
    this.hideInstructionsCard();
    if (this.readyOverlayEl) this.readyOverlayEl.style.display = 'none';
    this.state = 'playing';
    this.resize();
    this.hud.style.display = 'flex';
    if (this.mobileControls) this.mobileControls.style.display = (('ontouchstart' in window) || window.innerWidth <= 900) ? 'flex' : 'none';
    if (this.mobileControls) this.mobileControls.style.display = (('ontouchstart' in window) || window.innerWidth <= 900) ? 'flex' : 'none';

    this.player.hp             = this.player.maxHp;
    this.player.x              = -250; // Animación de entrada
    this.player.y              = 200;
    this.player.vy             = 0;
    this.player.angle          = 0;
    this.introActive           = true;
    this.introTimer            = 0;
    this.introAlpha            = 0;
    this.lastCountStep         = -1;
    this.player.invulnerable   = 0;
    this.player.frame          = 0;
    this.player.wasFlying      = false;
    this.player.landTimer      = 0;
    this.player.flyAscendIndex = 0;
    this.coinsCollected        = 0;
    this.lastDiscountThreshold = 0;
    this.luBoostCharges = 3;
    this.luBoostActive  = false;
    this.luBoostCooldown = 0;
    this.lisarWordBonusGranted = false;

    this.enemies       = [];
    this.projectiles   = [];
    this.coins         = [];
    this.particles     = [];
    this.powerups      = [];
    this.billboards    = [];
    this.bgHills       = [];
    this.letterItems   = [];
    this.spawnedLetters = {};
    this.collectedLisarLetters = {};
    this.lisarWordBonusGranted = false;
    this.extraDiscountBonus    = 0;
    this.spawnTimer    = 0;
    this.hillTimer     = 0;
    this.billboardTimer = 0;
    this.stageStep     = 0;
    this.gameTimer     = 0;
    this.victoryCoin = null;
    this.victoryTriggered = false;
    this.player.facing = 'right';
    this.isFlyToInfinity = false;
    this.celebrationTimer = 0;
    this.randomBlockTimer = 0;

    this.lastChallengeIndex = -1;
    this.audio.currentTime = 0;
    
    // Fix duplicate loop speed multiplication on retry
    if (!this.loopRunning) {
      this.loopRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(t => this.loop(t));
    }

    this.audio.play().catch(() => {});
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      // Reset all inputs so character doesn't keep flying when paused
      this.input.up = false;
      this.input.left = false;
      this.input.right = false;
      this.audio.pause();
      this.showMessage(
        '⏸ PAUSA',
        '¡El juego está pausado! Presiona P o ESC para continuar.',
        [{ text: '▶ REANUDAR', primary: true, action: () => this.togglePause() }]
      );
    } else if (this.state === 'paused') {
      this.hideMessage();
      this.state = 'playing';
      this.lastTime = performance.now(); // Reset dt so first frame after unpause is clean
      this.audio.play().catch(() => {});
      // No need to restart rAF — loop is still running, it will resume on next frame
    }
  }

  endGame(victory) {
    this.state = victory ? 'victory' : 'gameover';
    this.audio.pause();
    this.hud.style.display = 'none';
    if (this.mobileControls) this.mobileControls.style.display = 'none';

    const baseDiscount = Math.min(20, Math.floor(this.coinsCollected / 20) * 5);
    const extraBonus = (this.lisarWordBonusGranted ? 10 : 0);
    const totalDiscount = Math.min(30, baseDiscount + extraBonus);
    const finalScore = (this.coinsCollected * 100) + Math.floor(this.gameTimer * 10) + (this.lisarWordBonusGranted ? 1000 : 0);
    
    localStorage.setItem('lisar_discount_game2', totalDiscount.toString());

    const shareText = `🔥 ¡Logré ${finalScore} Puntos y un ${totalDiscount}% DE DESCUENTO en Lisar Studio jugando Lisar Jet Rush! 🚀 Desafíame con tu @instagram en www.lisarstudio.cl @lisarstudio`;

    if (victory) {
      this.speak("VICTORY! ENTER YOUR INSTAGRAM TO CLAIM YOUR REWARD!");
      this.showMessage(
        '🚀 ¡VUELO AL INFINITO Y VICTORIA!',
        `<div style="font-size:0.95rem; color:#ffffff; font-weight:bold; margin-bottom:8px;">¡Lu y Peter celebran tu ascenso espacial!</div>` +
        `<div style="display:flex; justify-content:center; gap:15px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; margin:8px 0;">` +
        `<div>Puntaje: <b style="color:#00ffaa; font-size:1.1rem;">${finalScore} Pts</b></div>` +
        `<div>Monedas: <b style="color:#ffd700; font-size:1.1rem;">${this.coinsCollected} / 100</b></div>` +
        `</div>` +
        (extraBonus > 0 ? `<div style="color:#ffd700; font-weight:bold; margin:4px 0; font-size:0.9rem;">🔥 Bonus Palabra L-I-S-A-R (+10% Extra)</div>` : '') +
        `<div style="font-size:1.4rem; color:#00ffaa; font-weight:900; text-shadow:0 0 12px #00ffaa; margin:8px 0;">¡DESCUENTO TOTAL GANADO: ${totalDiscount}%!</div>` +
        
        // Formulario de Registro de Instagram Competitivo
        `<div style="background:rgba(15,23,42,0.85); border:1px solid #00ffaa; padding:12px; border-radius:10px; margin-top:10px;">` +
        `<div style="font-size:0.85rem; color:#ffd700; font-weight:bold; margin-bottom:6px;">🏆 REGISTRA TU INSTAGRAM PARA COMPETIR EN EL RANKING:</div>` +
        `<div style="display:flex; gap:8px; justify-content:center; align-items:center;">` +
        `<input id="arcade-ig-input" type="text" placeholder="@tu_instagram" style="padding:8px 12px; border-radius:6px; border:1px solid #00ffaa; background:#000; color:#fff; font-family:'Orbitron',monospace; font-size:0.9rem; width:65%; text-align:center;">` +
        `<button id="arcade-ig-save-btn" style="padding:8px 12px; background:linear-gradient(90deg,#00ffaa,#00aa66); color:#000; font-weight:bold; border:none; border-radius:6px; cursor:pointer; font-family:'Orbitron',sans-serif; font-size:0.8rem;">GUARDAR</button>` +
        `</div>` +
        `<div id="arcade-ig-status" style="font-size:0.8rem; color:#00ffaa; margin-top:6px; display:none;"></div>` +
        `</div>` +
        
        // Botón Viral de Compartir en Redes
        `<div style="margin-top:12px; display:flex; flex-direction:column; gap:8px; align-items:center;">` +
        `<button id="arcade-share-viral-btn" style="width:100%; padding:10px; background:linear-gradient(90deg,#ff00ff,#8800ff); color:#fff; font-weight:bold; border:1px solid #fff; border-radius:8px; cursor:pointer; font-family:'Orbitron',sans-serif; font-size:0.85rem; box-shadow:0 0 12px #ff00ff;">📲 COPIAR TEXTO VIRAL PARA HISTORIA INSTAGRAM (+5% EXTRA)</button>` +
        `<div style="display:flex; gap:10px; width:100%;">` +
        `<a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}" target="_blank" style="flex:1; text-align:center; padding:8px; background:#25D366; color:#fff; font-weight:bold; border-radius:6px; text-decoration:none; font-size:0.8rem; font-family:'Orbitron',sans-serif;">💬 WHATSAPP</a>` +
        `<a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}" target="_blank" style="flex:1; text-align:center; padding:8px; background:#1DA1F2; color:#fff; font-weight:bold; border-radius:6px; text-decoration:none; font-size:0.8rem; font-family:'Orbitron',sans-serif;">🐦 X (TWITTER)</a>` +
        `</div>` +
        `</div>`,
        [
          {
            text: '🤖 RECLAMAR DESCUENTO Y SALIR 🚀',
            primary: true,
            action: () => {
              this.hideMessage();
              if (window.triggerPromoChatbot) {
                window.triggerPromoChatbot(totalDiscount);
              }
              this.exitGame();
            }
          },
          {
            text: '🎮 JUGAR DE NUEVO',
            primary: false,
            action: () => this.startGame()
          },
          {
            text: '🚪 VOLVER A PORTADA',
            primary: false,
            action: () => this.exitGame()
          }
        ]
      );

      // Disparo automático de la IA a los 6 segundos de victoria para una experiencia fluida
      setTimeout(() => {
        if (this.state === 'victory') {
          this.hideMessage();
          if (window.triggerPromoChatbot) {
            window.triggerPromoChatbot(totalDiscount);
          }
          this.exitGame(); // Subtle exit when claiming discount
        }
      }, 6000);

      // Handler para guardar el Instagram en el ranking local
      setTimeout(() => {
        const igSaveBtn = document.getElementById('arcade-ig-save-btn');
        const igInput = document.getElementById('arcade-ig-input');
        const igStatus = document.getElementById('arcade-ig-status');
        const viralBtn = document.getElementById('arcade-share-viral-btn');

        if (igSaveBtn && igInput) {
          igSaveBtn.addEventListener('click', () => {
            const igTag = igInput.value.trim();
            if (!igTag) return;
            let leaderboard = JSON.parse(localStorage.getItem('lisar_arcade_leaderboard') || '[]');
            leaderboard.push({ ig: igTag.startsWith('@') ? igTag : '@' + igTag, score: finalScore, discount: totalDiscount, date: new Date().toLocaleDateString() });
            leaderboard.sort((a,b) => b.score - a.score);
            localStorage.setItem('lisar_arcade_leaderboard', JSON.stringify(leaderboard.slice(0, 10)));

            if (igStatus) {
              igStatus.style.display = 'block';
              igStatus.innerHTML = `✅ ¡Puntaje de ${igTag} guardado con éxito en el Ranking Top!`;
            }
          });
        }

        if (viralBtn) {
          viralBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(shareText).then(() => {
              alert("✅ ¡Texto de victoria copiado al portapapeles! Pégalo en tu Historia de Instagram o red social favorita para desafiar a tus amigos.");
            }).catch(() => {
              prompt("Copia tu texto de victoria para compartir:", shareText);
            });
          });
        }
      }, 200);

    } else {
      let motivo = this.player.hp <= 0
        ? 'Personaje derivado (Fuera de combate).'
        : 'Solo juntaste ' + this.coinsCollected + ' / ' + this.coinsRequired + ' monedas.';
      
      this.speak("MISSION FAILED! TRY AGAIN!");
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
            text: '🚪 VOLVER A PORTADA',
            primary: false,
            action: () => this.exitGame()
          }
        ]
      );
    }
  }

  spawnEntity(dt) {
    this.spawnTimer += dt;

    // Generador de Letras Naranjas L-I-S-A-R (Inicia a los 20s, 1 sola vez por letra, alturas aleatorias)
    if (this.gameTimer >= 20.0) {
      const letterSchedule = [
        { time: 25.0, letter: 'L' },
        { time: 55.0, letter: 'I' },
        { time: 85.0, letter: 'S' },
        { time: 115.0, letter: 'A' },
        { time: 145.0, letter: 'R' }
      ];

      letterSchedule.forEach(item => {
        if (this.gameTimer >= item.time && !this.spawnedLetters[item.letter]) {
          this.spawnedLetters[item.letter] = true;
          const playableTopY = 185 / this.scale;
          const randomY = 210 + Math.random() * 25; // Y entre 210 y 235 (franja del bloque verde)
          this.letterItems.push({
            letter: item.letter,
            x: this.logicalWidth + 80,
            y: randomY,
            width: 55, height: 55,
            vx: -this.floorSpeed
          });
        }
      });
    }

    // Generador de bloques horizontales flotantes en la altura media (para rellenar vacíos)
    this.randomBlockTimer = (this.randomBlockTimer || 0) + dt;
    if (this.randomBlockTimer >= 1.4 && this.gameTimer < 165) {
      this.randomBlockTimer = 0;
      if (Math.random() < 0.38) {
        const startX = this.logicalWidth + 30;
        const noObstaclesNear = this.enemies.every(e => e.x < startX - 160);
        const noPowerupsNear = this.powerups.every(p => p.x < startX - 120);
        
        if (noObstaclesNear && noPowerupsNear) {
          // Green box center = 53.06% of logicalHeight (measured from reference image)
          const platHeight = 35;
          const greenCenterY = this.logicalHeight * 0.5306;
          const platY = greenCenterY - (platHeight / 2); // top edge so center = greenCenterY
          const randomW = 100 + Math.random() * 150;
          
          this.enemies.push({
            type: 0,
            x: startX,
            y: platY,
            width: randomW,
            height: platHeight,
            vx: -this.floorSpeed,
            hp: 9999
          });
          
          // Recompensa de monedas ENCIMA del bloque
          if (Math.random() > 0.4) {
            const coinCount = Math.floor(randomW / 50);
            for (let i = 0; i < coinCount; i++) {
              this.coins.push({
                x: startX + 15 + i * 45,
                y: platY - 65,
                width: 60, height: 60,
                vx: -this.floorSpeed,
                frame: 0, frameTimer: 0
              });
            }
          }
        }
      }
    }

    // Spacing interval: 1.8s between challenge waves makes the level dense and dynamic!
    if (this.spawnTimer < 1.8) return;
    this.spawnTimer = 0;

    // Select a random challenge index that is not the same as the last one
    let challengeIndex;
    do {
      challengeIndex = Math.floor(Math.random() * 10);
    } while (challengeIndex === this.lastChallengeIndex);
    this.lastChallengeIndex = challengeIndex;

    const progress = Math.min(1, this.gameTimer / 180);
    const startX = this.logicalWidth + 30;
    // GREEN BOX REFERENCE: center at 53.06% of logicalHeight (measured from image)
    const greenCenterY = this.logicalHeight * 0.5306;
    const platH = 35; // platform thickness
    const platY = greenCenterY - (platH / 2); // top edge → visual center = greenCenterY
    const coinAboveY = platY - 65; // coins sit 65px above platform top edge
    // Floor spawns: bottom-relative
    const floorBlockY = this.logicalHeight - 70 - 70; // 70px block, 70px above ground line

    if (challengeIndex === 0) {
      // 0. PLATAFORMA SUELO + monedas a altura del bloque verde
      this.enemies.push({ type: 0, x: startX, y: floorBlockY, width: 320, height: 70, vx: -this.floorSpeed, hp: 9999 });
      for (let i = 0; i < 6; i++) {
        this.coins.push({ x: startX + 20 + i * 45, y: coinAboveY, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 1) {
      // 1. HAZARD VOLADOR + arco de monedas a la altura del bloque verde
      this.spawnEnemy1(progress);
      for (let i = 0; i < 5; i++) {
        const archY = greenCenterY - Math.sin((i / 4) * Math.PI) * 40;
        this.coins.push({ x: startX + i * 48, y: archY, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 2) {
      // 2. ENEMIGO RODANTE en suelo + rombo de monedas a la altura del bloque verde
      this.spawnEnemy2(progress);
      const diamondOffsets = [{ dx: 0, dy: 0 }, { dx: 36, dy: -20 }, { dx: 36, dy: 20 }, { dx: 72, dy: 0 }];
      diamondOffsets.forEach(off => {
        this.coins.push({ x: startX + 60 + off.dx, y: greenCenterY + off.dy, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      });
    } else if (challengeIndex === 3) {
      // 3. REABASTECIMIENTO: Powerup + monedas a la altura del bloque verde
      if (this.player.hp < this.player.maxHp * 0.8) {
        this.powerups.push({ x: startX + 40, y: greenCenterY, width: 50, height: 50, vx: -(this.floorSpeed + 15), isBoot: true, frameTimer: 0 });
      } else if (this.luBoostCharges < 3 && Math.random() > 0.5) {
        this.powerups.push({ x: startX + 40, y: greenCenterY, width: 50, height: 50, vx: -(this.floorSpeed + 15), isLuHelp: true, frameTimer: 0 });
      }
      for (let i = 0; i < 6; i++) {
        this.coins.push({ x: startX + i * 50, y: greenCenterY + Math.sin(i * 0.9) * 25, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 4) {
      // 4. PLATAFORMA FLOTANTE en la altura exacta del bloque verde + monedas encima
      this.enemies.push({ type: 0, x: startX, y: platY, width: 300, height: platH, vx: -this.floorSpeed, hp: 9999 });
      for (let i = 0; i < 6; i++) {
        this.coins.push({ x: startX + 20 + i * 46, y: coinAboveY, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 5) {
      // 5. DOBLE AMENAZA: Jefe volador + rodante en suelo + monedas a la altura del bloque verde
      this.spawnEnemy1(progress);
      this.spawnEnemy2(progress, 80);
      for (let i = 0; i < 6; i++) {
        const offset = i % 2 === 0 ? -25 : 25;
        this.coins.push({ x: startX + i * 42, y: greenCenterY + offset, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 6) {
      // 6. PARKOUR DE CUBOS: Dos bloques en suelo + monedas a la altura del bloque verde
      this.enemies.push({ type: 0, x: startX, y: floorBlockY, width: 120, height: 70, vx: -this.floorSpeed, hp: 9999 });
      this.enemies.push({ type: 0, x: startX + 200, y: floorBlockY, width: 120, height: 70, vx: -this.floorSpeed, hp: 9999 });
      for (let i = 0; i < 6; i++) {
        this.coins.push({ x: startX + i * 52, y: coinAboveY, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 7) {
      // 7. COIN RUSH: Doble hélice centrada en el bloque verde
      this.powerups.push({ x: startX + 120, y: greenCenterY, width: 50, height: 50, vx: -this.floorSpeed, isBoot: Math.random() > 0.5, frameTimer: 0 });
      for (let i = 0; i < 8; i++) {
        this.coins.push({ x: startX + i * 40, y: greenCenterY + Math.sin(i * 0.8) * 35, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
        this.coins.push({ x: startX + i * 40, y: greenCenterY - Math.sin(i * 0.8) * 35, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 8) {
      // 8. PASOS ESCALONADOS: Dos plataformas a la altura del bloque verde + monedas encima
      this.enemies.push({ type: 0, x: startX, y: platY, width: 140, height: platH, vx: -this.floorSpeed, hp: 9999 });
      this.enemies.push({ type: 0, x: startX + 180, y: platY, width: 140, height: platH, vx: -this.floorSpeed, hp: 9999 });
      for (let i = 0; i < 3; i++) {
        this.coins.push({ x: startX + 15 + i * 42, y: coinAboveY, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
        this.coins.push({ x: startX + 195 + i * 42, y: coinAboveY, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
    } else if (challengeIndex === 9) {
      // 9. PLATAFORMA FLOTANTE LARGA + monedas encima + rodante en suelo
      this.enemies.push({ type: 0, x: startX, y: platY, width: 240, height: platH, vx: -this.floorSpeed, hp: 9999 });
      this.spawnEnemy2(progress, 60);
      for (let i = 0; i < 5; i++) {
        this.coins.push({ x: startX + 20 + i * 42, y: coinAboveY, width: 60, height: 60, vx: -this.floorSpeed, frame: 0, frameTimer: 0 });
      }
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
      hp: 9999
    });
  }

  spawnEnemy1(progress, offsetX = 0) {
    // Jefe volador: centrado en el bloque verde (53.06% de logicalHeight), debajo del HUD
    const greenCenterY = this.logicalHeight * 0.5306;
    const enemyH = 110;
    const spawnY = greenCenterY - (enemyH / 2); // centro visual = greenCenterY
    this.enemies.push({
      type: 1,
      x: this.logicalWidth + 30 + offsetX,
      y: spawnY,
      baseY: spawnY,
      width: 110, height: enemyH,
      vx: -(this.floorSpeed + 60 + progress * 90),
      hp: 1, shootTimer: Math.random() * 1.5,
      frame: 0, frameTimer: 0,
      isShooting: 0,
      isHit: 0,
      sineOffset: Math.random() * Math.PI * 2
    });
  }

  spawnEnemy2(progress, offsetX = 0) {
    this.enemies.push({
      type: 2,
      x: this.logicalWidth + 30 + offsetX,
      y: this.logicalHeight - 70 - 70, // 310 on the floor
      width: 70, height: 70,
      vx: -(this.floorSpeed + 120 + progress * 60),
      hp: 1, shootTimer: 0,
      frame: 0, frameTimer: 0
    });
  }

  checkCollisions(dt) {
    // Tighter, accurate hitbox centered on character (pw: 80, ph: 110)
    const px = this.player.x + 80;
    const py = this.player.y + 65;
    const pw = 80;
    const ph = 110;

    const playerCenterX = this.player.x + 120;
    const playerCenterY = this.player.y + 110;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
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
        this.collectedLisarLetters[l] = true;
        this.updateLetterBadges();
        this.createExplosion(itemCenterX, itemCenterY, '#ff8800', 16);
        this.playCoinSound();
        this.showTemporaryAlert("🔥 ¡LETRA [" + l + "] RECOLECTADA!", "¡Completa L-I-S-A-R para +10% Extra!", 2.5);
        this.speak(`Letter ${l} collected!`);
        this.letterItems.splice(i, 1);

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

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (px < p.x + p.width && px + pw > p.x && py < p.y + p.height && py + ph > p.y) {
        const healAmt = p.isBoot ? 35 : 25;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
        this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#00ffaa', 14);
        this.playCoinSound();
        if (p.isBoot) {
          this.showTemporaryAlert("⚡ ¡ENERGÍA RESTAURADA!", "¡Bota de energía recuperó tu salud!", 2.5);
          this.speak("Energy Restored!");
        }
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
        const prevBottom = (this.player.prevY !== undefined ? this.player.prevY + 175 : py + ph);
        const currentBottom = py + ph;
        const physicalCubeTop = ey - 65; // Hitbox bottom stands at (ey - 65) when feet are on ey

        // Dynamic fall threshold based on vertical velocity so there is NO snapping or teleportation
        const fallDist = Math.max(6, Math.abs((this.player.vy || 0) * dt) + 4);
        const wasAboveCube = prevBottom <= physicalCubeTop + fallDist;
        const isHorizontallyOverCube = (px + pw - 10 > ex) && (px + 10 < ex + ew);

        // Land smoothly on top ONLY if player was falling down onto the cube from above
        if (wasAboveCube && isHorizontallyOverCube && this.player.vy >= 0 && currentBottom >= physicalCubeTop - 6) {
          // FLUID LANDING ON TOP OF CUBE PLATFORM
          this.player.y = ey - 240; // Align sprite's bottom (feet) exactly with the cube's top
          this.player.vy = 0;
          this.player.angle = 0;
          if (this.player.wasFlying) {
            this.player.landTimer = 0.12;
            this.player.wasFlying = false;
          }
          this.player.onCube = true;
        } else if (px < ex + ew - 6 && px + pw > ex + 6 && py < ey + eh - 4 && py + ph > ey + 4) {
          // SIDE HIT: Smooth side collision without vertical snapping
          this.player.x = Math.max(15, this.player.x - 15);
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
    if (this.state !== 'playing' && this.state !== 'celebration') return;

    // ── CELEBRATION PATH (completely isolated — no speedBoost, no gameTimer) ────
    if (this.state === 'celebration') {
      this.celebrationTimer -= dt;

      if (Math.random() > 0.20) {
        const fireworkColor = ['#00ffff', '#ff00ff', '#ffd700', '#00ffaa', '#ff2266'][Math.floor(Math.random() * 5)];
        const fx = Math.random() * this.logicalWidth;
        const fy = Math.random() * (this.logicalHeight - 120);
        for (let i = 0; i < 5; i++) {
          this.particles.push({ x: fx, y: fy, vx: (Math.random()-0.5)*360, vy: (Math.random()-0.5)*360, life: 0.7+Math.random()*0.4, maxLife: 1.1, color: fireworkColor, size: 3+Math.random()*6 });
        }
      }

      this.floorOffset -= this.floorSpeed * dt;
      if (this.floorOffset <= -this.logicalWidth) this.floorOffset += this.logicalWidth;

      if (this.celebrationTimer <= 5.5) {
        this.isFlyToInfinity = true;
        
        // Dynamic flying rocket takeoff
        const elapsedFly = 5.5 - this.celebrationTimer;
        const flySpeed = 160 + elapsedFly * 360; // Accelerates upwards like a real rocket!
        this.player.y -= flySpeed * dt;
        
        // Swaying jetpack control wave
        this.player.x = 80 + Math.sin(elapsedFly * 5) * 45;
        this.player.angle = Math.cos(elapsedFly * 5) * 0.16; // Sprite tilts dynamically
        
        // Rocket exhaust fire and plasma particles
        for (let i = 0; i < 3; i++) {
          this.particles.push({
            x: this.player.x + 120 + (Math.random() - 0.5) * 20,
            y: this.player.y + 170, // Emits below feet
            vx: (Math.random() - 0.5) * 90,
            vy: 360 + Math.random() * 240, // Jet blast downwards
            life: 0.6,
            maxLife: 0.6,
            color: ['#ff3300', '#ffaa00', '#ffff00', '#00ffff'][Math.floor(Math.random() * 4)],
            size: 4 + Math.random() * 8
          });
        }
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      if (this.celebrationTimer <= 0 || (this.isFlyToInfinity && this.player.y < -300)) {
        this.endGame(true);
      }
      return;
    }

    // ── INTRO PATH ───────────────────────────────────────────────────────────────
    if (this.introActive) {
      this.introTimer = (this.introTimer || 0) + dt;
      this.player.x += dt * 110;
      if (this.player.x >= 80) this.player.x = 80;
      this.activeAnim = this.runFrames;
      this.loopAnim = true;
      this.animSpeed = 0.11;
      this.introAlpha = Math.min(1, (this.introAlpha || 0) + dt * 1.5);
      this.player.frameTimer += dt;
      if (this.player.frameTimer > this.animSpeed && this.activeAnim && this.activeAnim.length > 0) {
        this.player.frame = (this.player.frame + 1) % this.activeAnim.length;
        this.player.frameTimer = 0;
      }
      const floorY = this.logicalHeight - this.player.height - 70;
      this.player.y = floorY;
      if (this.introTimer >= 5.0) { this.introActive = false; this.gameTimer = 0; this.introTimer = 0; }
      this.floorOffset -= this.floorSpeed * dt;
      if (this.floorOffset <= -this.logicalWidth) this.floorOffset += this.logicalWidth;
      this.updateHUD();
      return;
    }

    // ── PLAYING PATH ─────────────────────────────────────────────────────────────
    // SAFEGUARD: Eliminar cualquier bloque o jefe que esté en la zona del HUD (por encima del 20% del canvas)
    const hudSafeY = this.logicalHeight * 0.20; // HUD ocupa aprox. el 10%, damos margen al 20%
    this.enemies = this.enemies.filter(e => e.type === 0 ? e.y >= hudSafeY : (e.type === 1 ? e.y >= hudSafeY : true));
    this.coins = this.coins.filter(c => c.y >= hudSafeY);

    this.gameTimer += dt;
    const remaining = Math.max(0, 180 - this.gameTimer);
    const progress = Math.min(1, this.gameTimer / 180);
    const speedBoost = 1.0 + progress * 0.90;
    const rawDt = dt;
    dt *= 1.30 * speedBoost;

    if (this.player.x < 80) {
      this.player.x += dt * 100;
      if (this.player.x > 80) this.player.x = 80;
    } else {
      const moveSpeed = 280;
      if (this.input.left)  { this.player.x -= moveSpeed * rawDt; this.player.facing = 'left'; }
      if (this.input.right) { this.player.x += moveSpeed * rawDt; this.player.facing = 'right'; }
      if (this.player.x < 20)  this.player.x = 20;
      if (this.player.x > 450) this.player.x = 450;
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
    if (this.player.y > floorY) { this.player.y = floorY; this.player.vy = 0; }
    if (this.player.invulnerable > 0) this.player.invulnerable -= dt;

    this.checkCollisions(dt);

    this.player.frameTimer += dt;
    const onGround = this.player.y >= floorY - 2 || this.player.onCube;

    if (this.player.isAttacking) {
      this.player.attackTimer -= dt;
      if (this.player.attackTimer <= 0) this.player.isAttacking = false;
    }

    this.activeAnim = [];
    this.loopAnim   = false;

    if (this.player.isAttacking) {
      if (onGround) {
        this.activeAnim = this.attackFrames; this.loopAnim = false;
        const total = this.attackFrames.length || 8;
        this.player.frame = Math.min(total - 1, Math.floor((1 - this.player.attackTimer / 0.45) * total));
      } else {
        this.activeAnim = this.flyAttackFrames; this.loopAnim = false;
        const total = this.flyAttackFrames.length || 9;
        this.player.frame = Math.min(total - 1, Math.floor((1 - this.player.attackTimer / 0.45) * total));
      }
    } else if (onGround) {
      this.player.angle = 0;
      if (this.player.wasFlying) { this.player.landTimer = 0.15; this.player.wasFlying = false; this.player.flyAscendIndex = 0; }
      if (this.player.landTimer > 0) {
        this.player.landTimer -= dt;
        this.activeAnim = [this.flyLandImg]; this.loopAnim = false;
      } else {
        this.activeAnim = this.runFrames; this.loopAnim = true; this.animSpeed = 0.08;
        if (speedBoost > 1.3 && this.particles.length < 40 && Math.random() > 0.45) {
          this.particles.push({ x: this.player.x + this.player.width/2 - 20 + Math.random()*40, y: floorY + this.player.height - 10, vx: -this.floorSpeed - 20 - Math.random()*50, vy: -10 - Math.random()*15, life: 0.35+Math.random()*0.25, maxLife: 0.6, color: 'smoke', size: 4+Math.random()*7 });
        }
      }
    } else {
      this.player.wasFlying = true; this.player.landTimer = 0;
      if (this.player.vy > 80) {
        this.activeAnim = [this.flyFallImg]; this.loopAnim = false;
        this.player.angle = (this.player.angle || 0) + (0.12 - (this.player.angle || 0)) * dt * 6;
      } else {
        this.activeAnim = [this.flyLoopFrames[0]]; this.loopAnim = false;
        const targetAngle = this.player.vy < -100 ? -0.14 : -0.05;
        this.player.angle = (this.player.angle || 0) + (targetAngle - (this.player.angle || 0)) * dt * 6;
        if (this.input.up && Math.random() > 0.35) {
          this.particles.push({ x: this.player.x+30+Math.random()*15, y: this.player.y+this.player.height/2+35, vx: -220-Math.random()*80, vy: 60+(Math.random()-0.5)*50, life: 0.2+Math.random()*0.15, maxLife: 0.35, color: Math.random()>0.5?'#ff9900':'#00ffff', size: 3+Math.random()*6 });
        }
      }
    }

    if (!this.player.isAttacking) {
      if (this.loopAnim && this.activeAnim && this.activeAnim.length > 0) {
        if (this.player.frameTimer > this.animSpeed) { this.player.frame = (this.player.frame + 1) % this.activeAnim.length; this.player.frameTimer = 0; }
      } else { this.player.frame = 0; }
    }

    this.billboardTimer = (this.billboardTimer || 0) + dt;
    if (this.billboardTimer > 6.5) {
      this.billboardTimer = 0;
      this.billboards = this.billboards || [];
      const texts = ['LISAR 3D', 'LISAR STUDIO', 'VFX REELS', 'JET RUSH', '3D MOTION'];
      this.billboards.push({ x: this.logicalWidth+40, y: 35+Math.random()*110, text: texts[Math.floor(Math.random()*texts.length)], vx: -this.floorSpeed*0.45, hue: Math.floor(Math.random()*360) });
    }
    if (this.billboards) {
      for (let i = this.billboards.length - 1; i >= 0; i--) { const b = this.billboards[i]; b.x += b.vx * dt; if (b.x < -180) this.billboards.splice(i, 1); }
    }

    this.hillTimer = (this.hillTimer || 0) + dt;
    if (this.hillTimer > 12.0 + Math.random() * 8.0) {
      this.hillTimer = 0;
      this.bgHills = this.bgHills || [];
      const quotes = ["\u00a1VAMOS LISAR!", "\u00a1MENUDO COMBO!", "\u00a1LISAR STUDIO!", "\u00a1SUPER COMBO!", "\u00a1EXCELENTE VUELO!", "\u00a1CASI LLEGAS!", "\u00a1SIGUE AS\u00cd!", "\u00a1AMAZING!"];
      const sizeType = Math.floor(Math.random() * 3);
      const heights = [85, 130, 185]; const widths = [135, 195, 260]; const colors = ['#a200ff', '#00f3ff', '#ff00aa'];
      this.bgHills.push({ x: this.logicalWidth+80, y: this.logicalHeight-70-heights[sizeType], height: heights[sizeType], width: widths[sizeType], color: colors[sizeType], charType: Math.floor(Math.random()*3), quote: quotes[Math.floor(Math.random()*quotes.length)], vx: -this.floorSpeed*0.40, animFrame: 0, frameTimer: 0 });
    }
    if (this.bgHills) {
      for (let i = this.bgHills.length - 1; i >= 0; i--) { const h = this.bgHills[i]; h.x += h.vx*dt; h.frameTimer += dt; if (h.frameTimer > 0.09) { h.animFrame=(h.animFrame+1)%10; h.frameTimer=0; } if (h.x < -300) this.bgHills.splice(i, 1); }
    }

    if (this.player.hp <= 60 && !this.luBoostActive && (this.luBoostCooldown || 0) <= 0) {
      this.luBoostActive = true; this.luBoostCooldown = 18; this.luBoostX = -180;
      const playableTopY = 185 / this.scale;
      this.luBoostY = 210; // Y = 210 (vuela por el centro del bloque verde)
      this.luBoostFrame = 0; this.luBoostTimer = 0; this.luBoostDropped = false;
      this.speak("Emergency Energy Boost!");
      this.showTemporaryAlert("\u26a1 \u00a1LU AL RESCATE!", "Lu vuela en su nube lanz\u00e1ndote energ\u00eda", 3.5);
    }
    if (this.luBoostCooldown > 0) this.luBoostCooldown -= dt;
    if (this.luBoostActive) {
      this.luBoostX += 115 * dt; this.luBoostTimer += dt;
      if (this.luBoostTimer > 0.08) { this.luBoostFrame=(this.luBoostFrame+1)%10; this.luBoostTimer=0; }
      if (this.luBoostX >= (this.player.x + 30) && !this.luBoostDropped) {
        this.luBoostDropped = true;
        this.powerups.push({ x: this.luBoostX+20, y: this.luBoostY+40, width: 60, height: 60, vx: 0, vy: 0, isBoot: true, frameTimer: 0 });
      }
      if (this.luBoostX > this.logicalWidth + 180) this.luBoostActive = false;
    }

    this.floorOffset -= this.floorSpeed * dt;
    if (this.floorOffset <= -this.logicalWidth) this.floorOffset += this.logicalWidth;

    this.spawnEntity(dt);

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i]; c.x += c.vx*dt; c.frameTimer += dt;
      if (c.frameTimer > 0.10) { c.frame=(c.frame+1)%this.coinFrames.length; c.frameTimer=0; }
      if (c.x < -c.width*2) this.coins.splice(i, 1);
    }

    for (let i = this.letterItems.length - 1; i >= 0; i--) {
      const item = this.letterItems[i]; item.x += item.vx*dt;
      if (item.x < -item.width*2) this.letterItems.splice(i, 1);
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (p.isBoot) {
        const dx = (this.player.x+40)-(p.x+p.width/2); const dy = (this.player.y+45)-(p.y+p.height/2);
        const dist = Math.hypot(dx, dy);
        if (dist > 10) { p.x += (dx/dist)*480*dt; p.y += (dy/dist)*480*dt; }
        if (dist < 50) {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp+35);
          this.createExplosion(p.x+p.width/2, p.y+p.height/2, '#00ffaa', 16);
          this.playCoinSound();
          this.showTemporaryAlert("\u26a1 \u00a1ENERG\u00cdA RESTAURADA!", "\u00a1Bota de energ\u00eda recuper\u00f3 tu salud!", 2.5);
          this.speak("Energy Restored!"); this.powerups.splice(i, 1); continue;
        }
      } else { p.x += p.vx*dt; p.frameTimer += dt*5; p.y += Math.sin(p.frameTimer)*1.8; }
      if (p.x < -p.width*2) this.powerups.splice(i, 1);
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]; e.x += e.vx*dt;
      if (e.vy) { e.y += e.vy*dt; const minY=0; const maxY=this.logicalHeight-e.height-70; if(e.y<minY){e.y=minY;e.vy*=-1;} if(e.y>maxY){e.y=maxY;e.vy*=-1;} }
      if (e.type===1 && e.baseY) { e.y = e.baseY + Math.sin(performance.now()/400+(e.sineOffset||0))*30; }
      if (e.type !== 0) {
        e.frameTimer += dt;
        if (e.type===1) { if(e.frameTimer>0.12){e.frame=(e.frame+1)%this.enemy1FlyFrames.length;e.frameTimer=0;} if(e.isShooting>0)e.isShooting-=dt; if(e.isHit>0)e.isHit-=dt; }
        else if (e.type===2) { if(e.frameTimer>0.08){e.frame=(e.frame+1)%this.enemy2BallFrames.length;e.frameTimer=0;} }
        e.shootTimer += dt;
        const shootInterval = e.type===1 ? 2.2 : 1.8;
        if (e.shootTimer > shootInterval) {
          e.shootTimer = 0;
          if (e.type===1) { e.isShooting=0.35; this.playEnemyShootSound(); }
          this.projectiles.push({ x:e.x, y:e.y+e.height/2, width:e.type===1?65:36, height:26, vx:-380-(e.type===2?80:0), damage:e.type===1?10:15, color:e.type===1?'enemy1_shot':'#ff00ff' });
        }
      }
      if (e.x < -e.width*2) this.enemies.splice(i, 1);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) { const p=this.projectiles[i]; p.x+=p.vx*dt; if(p.x<-p.width)this.projectiles.splice(i,1); }
    for (let i = this.particles.length - 1; i >= 0; i--) { const p=this.particles[i]; p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; if(p.life<=0)this.particles.splice(i,1); }

    this.updateHUD();

    if (this.player.hp <= 0 && this.state === 'playing') {
      this.endGame(false);
    } else if (this.gameTimer >= 180 && this.state === 'playing') {
      this.state = 'celebration';
      this.celebrationTimer = 8.0;
      this.isFlyToInfinity = false;
      this.speak("VICTORY! MAXIMUM DISCOUNT UNLOCKED! FLY TO INFINITY!");
      this.showTemporaryAlert("\ud83c\udf89 \u00a1META ALCANZADA!", "\u00a1Lu y Peter te felicitan! \u00a1Volando al infinito!", 6.5);
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

  draw(dt) {
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

        if (h.charType === 0 && luImg && luImg.loaded && luImg.height > 0) {
          // Solo Lu bailando/animándose en la cumbre
          const luW = luImg.width * (charH / (luImg.height || 1));
          if (isFinite(luW) && luW > 0) this.ctx.drawImage(luImg, peakX - luW / 2, peakY - charH + 12, luW, charH);
        } else if (h.charType === 1 && peterImg && peterImg.loaded && peterImg.height > 0) {
          // Solo Peter bailando/animándose en la cumbre
          const peterW = peterImg.width * (charH / (peterImg.height || 1));
          if (isFinite(peterW) && peterW > 0) this.ctx.drawImage(peterImg, peakX - peterW / 2, peakY - charH + 12, peterW, charH);
        } else if (h.charType === 2) {
          // Lu y Peter Juntos en la cumbre
          if (luImg && luImg.loaded && luImg.height > 0) {
            const luW = luImg.width * (charH / (luImg.height || 1));
            if (isFinite(luW) && luW > 0) this.ctx.drawImage(luImg, peakX - luW - 5, peakY - charH + 12, luW, charH);
          }
          if (peterImg && peterImg.loaded && peterImg.height > 0) {
            const peterW = peterImg.width * (charH / (peterImg.height || 1));
            if (isFinite(peterW) && peterW > 0) this.ctx.drawImage(peterImg, peakX + 5, peakY - charH + 12, peterW, charH);
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

    // Monedas (Ignorar y nunca dibujar monedas en la zona del HUD)
    const _hudSafeDrawY = this.logicalHeight * 0.20;
    this.coins.forEach(c => {
      if (c.y < _hudSafeDrawY) return; // NUNCA dibujar monedas en zona del HUD
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

    // Renderizado de Letras Naranjas Brillantes L-I-S-A-R
    this.letterItems.forEach(item => {
      this.ctx.save();
      const cx = item.x + item.width / 2;
      const cy = item.y + item.height / 2;
      const floatY = cy + Math.sin(performance.now() / 140) * 4;

      this.ctx.shadowBlur = 22;
      this.ctx.shadowColor = '#ff7700';

      this.ctx.fillStyle = 'rgba(255, 110, 0, 0.94)';
      this.ctx.strokeStyle = '#ffd700';
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
        if (e.y < 190) return; // NUNCA dibujar plataformas por encima de Y = 190
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
    const showMeta = this.state === 'celebration' || this.state === 'victory';
    if (showMeta) {
      // Calculate archX based on celebration progression
      let archX = this.logicalWidth * 0.50;
      if (this.state === 'celebration') {
        const elapsed = Math.max(0, 8.0 - this.celebrationTimer);
        archX = Math.max(this.logicalWidth * 0.50, this.logicalWidth + 100 - elapsed * 240);
      }
      const floorY = this.logicalHeight - 70;

      this.ctx.save();
      
      // Pilares de la Meta neón
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#00ffff';
      this.ctx.fillStyle = '#00ffff';
      this.ctx.fillRect(archX, floorY - 170, 16, 170);
      this.ctx.fillRect(archX + 220, floorY - 170, 16, 170);

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
      const luImg = this.luFrames[animIdx];
      const peterImg = this.peterFrames[animIdx];
      const charH = 145;

      if (luImg && luImg.loaded && luImg.height > 0) {
        const luW = luImg.width * (charH / (luImg.height || 1));
        if (isFinite(luW) && luW > 0) {
          this.ctx.save();
          this.ctx.shadowBlur = 16;
          this.ctx.shadowColor = '#00ffaa';
          this.ctx.drawImage(luImg, archX + 25 - luW / 2, floorY - charH + 10, luW, charH);
          this.ctx.restore();
        }
      }

      if (peterImg && peterImg.loaded && peterImg.height > 0) {
        const peterW = peterImg.width * (charH / (peterImg.height || 1));
        if (isFinite(peterW) && peterW > 0) {
          this.ctx.save();
          this.ctx.shadowBlur = 16;
          this.ctx.shadowColor = '#ff8800';
          this.ctx.drawImage(peterImg, archX + 175 - peterW / 2, floorY - charH + 10, peterW, charH);
          this.ctx.restore();
        }
      }

      // Globo de diálogo de Lu y Peter en la Meta
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = '#00ffff';
      this.ctx.beginPath();
      const bubbleW = 330;
      const bubbleH = 34;
      const bubbleX = archX + 100 - bubbleW / 2;
      const bubbleY = floorY - charH - 42;
      if (this.ctx.roundRect) {
        this.ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 8);
      } else {
        this.ctx.rect(bubbleX, bubbleY, bubbleW, bubbleH);
      }
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = 'bold 11px "Orbitron", monospace';
      this.ctx.fillStyle = '#0a0a0c';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("¡FELICIDADES POR TERMINAR NUESTRO DEMO JUGABLE!", bubbleX + bubbleW / 2, bubbleY + 21);

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
        
        let drawX = this.player.x + (this.player.width - drawW) / 2;
        let drawY;
        if (this.isFlying) {
          drawY = this.player.y + (this.player.height - drawH) / 2;
        } else {
          drawY = this.player.y + (this.player.height - drawH);
        }

        // Si está atacando, desplazar ligeramente al frente para marcar el impacto del golpe
        if (this.player.isAttacking) {
          drawX += 28;
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
        if (this.player.facing === 'left') {
          this.ctx.scale(-1, 1);
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
      const panelW = Math.min(620, this.logicalWidth * 0.82);
      const panelH = 142;
      const panelX = (this.logicalWidth - panelW) / 2;
      // PANEL_REFERENCE_Y: mismo eje que todos los paneles (53.06% de logicalHeight = centro del bloque verde)
      const panelY = this.logicalHeight * 0.5306 - (panelH / 2);

      this.ctx.save();
      this.ctx.globalAlpha = alpha;

      // Fondo semitransparente tipo panel
      this.ctx.fillStyle = 'rgba(5, 6, 15, 0.65)';
      this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
      this.ctx.lineWidth = 1.8;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(0, 243, 255, 0.3)';
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
      this.ctx.font = 'bold 20px "Orbitron", monospace';
      this.ctx.fillStyle = '#00ffff';
      this.ctx.shadowBlur = 8; this.ctx.shadowColor = '#00ffff';
      this.ctx.fillText('LISAR JET RUSH', cx, panelY + 28);
      this.ctx.shadowBlur = 0;

      // Controles
      this.ctx.font = '12px "Orbitron", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('CONTROL: ESPACIO / TOCAR PANTALLA = VOLAR', cx, panelY + 54);

      // Objetivo
      this.ctx.font = 'bold 13px "Orbitron", monospace';
      this.ctx.fillStyle = '#ff9900';
      this.ctx.shadowBlur = 6; this.ctx.shadowColor = '#ff9900';
      this.ctx.fillText('OBJETIVO: SOBREVIVE 3 MINUTOS', cx, panelY + 78);
      this.ctx.shadowBlur = 0;

      // Sub texto
      this.ctx.font = '12px "Orbitron", monospace';
      this.ctx.fillStyle = '#ffd700';
      this.ctx.fillText('JUNTA MONEDAS = DESCUENTO ACUMULABLE', cx, panelY + 98);

      // Blink CTA
      const blink = Math.floor(performance.now() / 500) % 2 === 0;
      this.ctx.font = 'bold 13px "Orbitron", monospace';
      this.ctx.fillStyle = blink ? '#ff0055' : '#ff9900';
      this.ctx.shadowBlur = 8; this.ctx.shadowColor = this.ctx.fillStyle;
      this.ctx.fillText('\u25B6 TOCATE LA PANTALLA O ESPACIO PARA INICIAR', cx, panelY + 124);
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
    // Reset watchdog timestamp every frame
    this._lastLoopTime = now;

    // Determine if this is an active game session
    const activeState = ['playing', 'paused', 'celebration', 'victory', 'gameover'].includes(this.state);

    // If game session has ended, stop the loop and music
    if (!activeState) {
      if (this.audio && !this.audio.paused) this.audio.pause();
      this.loopRunning = false; // Mark loop as stopped
      return; // Do NOT re-queue rAF — loop is truly done
    }

    // Re-queue next frame IMMEDIATELY so it NEVER stops regardless of errors below
    requestAnimationFrame(t => this.loop(t));

    // Skip update/draw while paused — loop continues running but does nothing
    if (this.state === 'paused') return;

    // Calculate delta time, clamped to safe range
    let dt = (now - this.lastTime) / 1000;
    if (dt <= 0 || dt > 0.1) dt = 0.033;
    this.lastTime = now;

    try {
      this.update(dt);
    } catch(e) {
      console.error('[ArcadeCrash] update() threw:', e);
    }

    try {
      this.draw(dt);
    } catch(e) {
      console.error('[ArcadeCrash] draw() threw:', e);
    }
  }



  exitGame() {
    this.container.style.transition = 'opacity 0.45s ease';
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.destroy();
      // Recreate the original arcade-overlay cover inside container
      this.container.innerHTML = `
        <div id="arcade-overlay" style="position: absolute; inset: 0; background: #000; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10;">
          <button id="start-arcade-btn" class="game-cover-btn" aria-label="Jugar Lisar Jet Rush">
            <img src="assets/img/portada_juego2.png" alt="Portada de Lisar Jet Rush" style="width: 100%; height: 100%; object-fit: contain; object-position: center; display: block;" loading="lazy">
          </button>
        </div>
      `;
      // Re-bind the click and touch handlers to the start button
      const btn = document.getElementById('start-arcade-btn');
      const overlay = document.getElementById('arcade-overlay');
      if (btn && overlay) {
        const handleStart = (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          overlay.style.display = 'none';
          window.initArcadeGame();
          setTimeout(() => {
            if (window.arcadeGame) {
              window.arcadeGame.startGame();
            }
          }, 200);
        };
        btn.addEventListener('click', handleStart);
        btn.addEventListener('touchstart', handleStart, { passive: false });
      }
      this.container.style.opacity = '1';
    }, 450);
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
    if (window.arcadeGame) window.arcadeGame.destroy();
    window.arcadeGame = new LisarArcade2D('arcade-game-container');
  };

  const btn     = document.getElementById('start-arcade-btn');
  const overlay = document.getElementById('arcade-overlay');

  if (btn && overlay) {
    const handleLaunch = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      overlay.style.display = 'none';

      // Always create a fresh game instance
      window.initArcadeGame();

      // Give the constructor time to finish resize & setup, then start
      setTimeout(() => {
        if (window.arcadeGame) {
          window.arcadeGame.showInstructions();
        }
      }, 150);
    };

    btn.addEventListener('click', handleLaunch);
    btn.addEventListener('touchstart', handleLaunch, { passive: false });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLisarArcadeBootstrap);
} else {
  initLisarArcadeBootstrap();
}
