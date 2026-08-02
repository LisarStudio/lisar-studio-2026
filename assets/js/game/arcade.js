class LisarArcade2D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.display = 'block';
    
    // Wrapper for responsive scaling and safe-areas
    this.wrapper = document.createElement('div');
    this.wrapper.style.width = '100%';
    this.wrapper.style.height = '100%';
    this.wrapper.style.display = 'flex';
    this.wrapper.style.alignItems = 'center';
    this.wrapper.style.justifyContent = 'center';
    this.wrapper.style.background = '#000';
    this.wrapper.style.position = 'relative';
    this.wrapper.style.paddingTop = 'env(safe-area-inset-top)';
    this.wrapper.style.paddingRight = 'env(safe-area-inset-right)';
    this.wrapper.style.paddingBottom = 'env(safe-area-inset-bottom)';
    this.wrapper.style.paddingLeft = 'env(safe-area-inset-left)';
    
    this.wrapper.appendChild(this.canvas);
    this.container.appendChild(this.wrapper);
    
    this.ctx = this.canvas.getContext('2d');
    
    // Audio
    this.audio = new Audio('assets/audio/Level_2.mp3');
    this.audio.preload = 'auto';
    this.coinSound = new Audio('assets/audio/coin.mp3');
    
    // Sprites reales de Github, definidos como hojas de sprites (sprite sheets)
    this.sprites = {
      lisar: { src: 'images/sprites_arcade/Sprite_lisar_2d.png', img: new Image(), loaded: false, cols: 2, rows: 3, totalFrames: 6 },
      enemigo1: { src: 'images/sprites_arcade/Sprite_enemigo1.png', img: new Image(), loaded: false, cols: 2, rows: 3, totalFrames: 6 },
      enemigo2: { src: 'images/sprites_arcade/Sprite_enemigo2.png', img: new Image(), loaded: false, cols: 2, rows: 3, totalFrames: 6 },
      coin: { src: 'images/sprites_arcade/Sprite_Lisarcoins.png', img: new Image(), loaded: false, cols: 3, rows: 2, totalFrames: 6 },
      floor: { src: 'images/sprites_arcade/tiling_floor.png', img: new Image(), loaded: false, cols: 1, rows: 1, totalFrames: 1 }
    };
    
    // Estados del juego
    this.state = 'loading'; // loading, ready, playing, paused, gameover, victory
    this.lastTime = 0;
    
    // Dimensiones lógicas base y escala
    this.logicalWidth = 800;
    this.logicalHeight = 450;
    this.scale = 1;
    
    // Propiedades del jugador
    this.player = {
      x: 100, y: 200, width: 64, height: 64,
      vy: 0, gravity: 900, jumpForce: -400,
      hp: 100, maxHp: 100, invulnerable: 0,
      frame: 0, frameTimer: 0
    };
    
    // Pools de entidades
    this.enemies = [];
    this.projectiles = [];
    this.coins = [];
    this.particles = [];
    
    // Variables de control y misiones
    this.floorOffset = 0;
    this.floorSpeed = 200;
    this.coinsCollected = 0;
    this.coinsRequired = 20; 
    this.spawnTimer = 0;
    this.missionId = 'lisar-game-2-mission';
    
    this.input = { up: false };
    
    // Resize handler
    window.addEventListener('resize', this.resizeHandler = this.resize.bind(this));
    
    this.loadSprites();
    this.setupControls();
    this.createHUD();
    
    // Force initial resize to set up logical dimensions correctly
    setTimeout(() => this.resize(), 0);
  }
  
  resize() {
    const rect = this.wrapper.getBoundingClientRect();
    const viewportWidth = rect.width || window.innerWidth;
    const viewportHeight = rect.height || window.innerHeight;
    
    const baseWidth = 800;
    const baseHeight = 450;
    
    // Escala proporcional sin deformar
    this.scale = Math.min(viewportWidth / baseWidth, viewportHeight / baseHeight);
    
    // Canvas dimensions are the actual pixels of the wrapper
    this.canvas.width = viewportWidth;
    this.canvas.height = viewportHeight;
    
    // El área lógica disponible expandida según la proporción
    this.logicalWidth = viewportWidth / this.scale;
    this.logicalHeight = viewportHeight / this.scale;
    
    // Mantener a Lisar sobre el piso si cambia la pantalla
    if (this.player.y > this.logicalHeight - this.player.height - 40) {
        this.player.y = this.logicalHeight - this.player.height - 40;
    }
    
    if(this.state === 'ready') this.drawReadyScreen();
    else if(this.state !== 'playing') this.draw();
  }
  
  loadSprites() {
    let loadedCount = 0;
    const keys = Object.keys(this.sprites);
    keys.forEach(k => {
      this.sprites[k].img.onload = () => {
        this.sprites[k].loaded = true;
        loadedCount++;
        if (loadedCount === keys.length) {
          this.state = 'ready';
          this.drawReadyScreen();
        }
      };
      this.sprites[k].img.onerror = () => {
          loadedCount++;
          if (loadedCount === keys.length) {
              this.state = 'ready';
              this.drawReadyScreen();
          }
      };
      this.sprites[k].img.src = this.sprites[k].src;
    });
  }
  
  setupControls() {
    // Eventos de Teclado
    window.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.input.up = true;
        e.preventDefault();
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        this.togglePause();
      }
    });
    window.addEventListener('keyup', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.input.up = false;
      }
    });
    
    // Eventos Táctiles y Mouse (área del juego únicamente)
    this.wrapper.addEventListener('touchstart', e => {
      this.input.up = true;
      if (e.cancelable) e.preventDefault(); // Evita scroll
    }, {passive: false});
    this.wrapper.addEventListener('touchend', e => {
      this.input.up = false;
    });
    this.wrapper.addEventListener('mousedown', e => {
      this.input.up = true;
    });
    this.wrapper.addEventListener('mouseup', e => {
      this.input.up = false;
    });
    
    // Pausar si pierde foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state === 'playing') {
            this.togglePause();
        }
    });
  }
  
  createHUD() {
    this.hud = document.createElement('div');
    this.hud.style.position = 'absolute';
    this.hud.style.top = '20px'; // Un poco más de margen para safearia
    this.hud.style.left = '20px';
    this.hud.style.right = '70px'; // Espacio para el botón cerrar
    this.hud.style.display = 'none';
    this.hud.style.justifyContent = 'space-between';
    this.hud.style.alignItems = 'flex-start';
    this.hud.style.pointerEvents = 'none';
    this.hud.style.color = '#fff';
    this.hud.style.fontFamily = 'monospace';
    this.hud.style.textShadow = '0 0 5px #000';
    
    this.hudLeft = document.createElement('div');
    this.hudLeft.innerHTML = `
      <div style="font-size: 1.2rem; font-weight: bold; color: #ff9900;">LISAR JET RUSH</div>
      <div style="display:flex; align-items:center; gap:5px; margin-top:5px;">
        <div style="width:100px; height:15px; background:rgba(255,255,255,0.2); border:1px solid #fff; border-radius:10px; overflow:hidden;">
          <div id="arcade-hp-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #ff0000, #ff9900);"></div>
        </div>
        <span id="arcade-hp-text">100%</span>
      </div>
      <div style="margin-top:5px; font-size:1.1rem;">💰 <span id="arcade-coin-text">0 / 20</span></div>
    `;
    
    this.hudRight = document.createElement('div');
    this.hudRight.style.textAlign = 'right';
    this.hudRight.innerHTML = `
      <div style="font-size: 1rem;">Progreso Nivel 2</div>
      <div style="width:100px; height:10px; background:rgba(255,255,255,0.2); border:1px solid #fff; border-radius:5px; overflow:hidden; margin-left:auto;">
        <div id="arcade-progress-bar" style="width:0%; height:100%; background:#00ffff;"></div>
      </div>
    `;
    
    this.hud.appendChild(this.hudLeft);
    this.hud.appendChild(this.hudRight);
    this.wrapper.appendChild(this.hud);
    
    // Mensajes Overlay final (Victoria/Derrota)
    this.msgOverlay = document.createElement('div');
    this.msgOverlay.style.position = 'absolute';
    this.msgOverlay.style.top = '0';
    this.msgOverlay.style.left = '0';
    this.msgOverlay.style.width = '100%';
    this.msgOverlay.style.height = '100%';
    this.msgOverlay.style.display = 'flex';
    this.msgOverlay.style.flexDirection = 'column';
    this.msgOverlay.style.alignItems = 'center';
    this.msgOverlay.style.justifyContent = 'center';
    this.msgOverlay.style.background = 'rgba(0,0,0,0.85)';
    this.msgOverlay.style.color = '#fff';
    this.msgOverlay.style.zIndex = '10';
    this.wrapper.appendChild(this.msgOverlay);
  }
  
  updateHUD() {
    const hpBar = document.getElementById('arcade-hp-bar');
    const hpText = document.getElementById('arcade-hp-text');
    const coinText = document.getElementById('arcade-coin-text');
    const progBar = document.getElementById('arcade-progress-bar');
    
    if (hpBar) hpBar.style.width = `${Math.max(0, this.player.hp)}%`;
    if (hpText) hpText.innerText = `${Math.max(0, Math.floor(this.player.hp))}%`;
    if (coinText) coinText.innerText = `${this.coinsCollected} / ${this.coinsRequired}`;
    
    if (progBar && this.audio.duration) {
      const p = (this.audio.currentTime / this.audio.duration) * 100;
      progBar.style.width = `${Math.min(100, p)}%`;
    }
  }
  
  showMessage(title, subtitle, btnText, btnAction) {
    this.msgOverlay.style.display = 'flex';
    this.msgOverlay.style.pointerEvents = 'auto'; // Re-activar clicabilidad
    this.msgOverlay.innerHTML = `
      <h2 style="font-size: 2.5rem; color: #ff9900; margin: 0 0 10px 0; text-shadow: 0 0 10px #ff0000; text-align:center; max-width: 90vw;">${title}</h2>
      <p style="font-size: 1.2rem; margin: 0 0 20px 0; text-align:center; max-width: 90vw;">${subtitle}</p>
    `;
    
    if (btnText) {
      const btn = document.createElement('button');
      btn.innerText = btnText;
      btn.style.padding = '10px 20px';
      btn.style.fontSize = '1.2rem';
      btn.style.background = 'linear-gradient(90deg, #ff9900, #ff0000)';
      btn.style.color = '#fff';
      btn.style.border = '2px solid #fff';
      btn.style.borderRadius = '5px';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = 'bold';
      btn.style.boxShadow = '0 0 10px #ff0000';
      btn.onclick = btnAction;
      this.msgOverlay.appendChild(btn);
    }
  }
  
  hideMessage() {
    this.msgOverlay.style.display = 'none';
  }
  
  drawReadyScreen() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.showMessage(
        "LISAR JET RUSH", 
        "Misión: Sobrevive toda la canción (Level 2) y recolecta 20 monedas.<br><br><b>Controles:</b><br>PC: Espacio / Flecha Arriba / Clic<br>Móvil: Mantén tocada la pantalla", 
        "INICIAR ARCADE", 
        () => this.startGame()
    );
  }
  
  startGame() {
    this.hideMessage();
    this.hud.style.display = 'flex';
    this.state = 'playing';
    
    // Reiniciar jugador y variables
    this.player.hp = this.player.maxHp;
    this.player.y = 200;
    this.player.vy = 0;
    this.player.invulnerable = 0;
    this.coinsCollected = 0;
    
    this.enemies = [];
    this.projectiles = [];
    this.coins = [];
    this.particles = [];
    this.spawnTimer = 0;
    
    // Sincronización del Reloj Maestro
    this.audio.currentTime = 0;
    this.audio.play().catch(e => console.error("Error reproduciendo audio:", e));
    
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }
  
  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.audio.pause();
      this.showMessage("PAUSA", "El juego está pausado.", "REANUDAR", () => this.togglePause());
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
    
    if (victory) {
      // Registrar misión para Chatbot IA
      localStorage.setItem('lisar_discount_game2', 'true');
      this.showMessage(
        "¡MISIÓN COMPLETADA!", 
        `Sobreviviste toda la canción y recolectaste ${this.coinsCollected} monedas.<br><br>¡Has desbloqueado tu Descuento de Lisar Jet Rush!`, 
        "Reclamar Premio Ahora", 
        () => {
          this.destroy(); // Destruye y regresa a la web
          if (window.triggerPromoChatbot) window.triggerPromoChatbot();
        }
      );
    } else {
      let motivo = (this.player.hp <= 0) ? "Tu nave fue destruida." : `No lograste recolectar las ${this.coinsRequired} Lisar Coins requeridas.`;
      this.showMessage(
        "MISIÓN FALLIDA", 
        motivo, 
        "INTENTAR DE NUEVO", 
        () => this.startGame()
      );
    }
  }
  
  spawnEntity(dt) {
    this.spawnTimer += dt;
    // Progreso de 0.0 a 1.0 según la duración de la canción
    const progress = this.audio.duration ? (this.audio.currentTime / this.audio.duration) : 0;
    
    // Aumentar la dificultad de spawneo gradualmente
    const spawnRate = Math.max(0.6, 2.0 - progress * 1.5);
    
    if (this.spawnTimer > spawnRate) {
      this.spawnTimer = 0;
      
      const r = Math.random();
      if (r < 0.45) {
        // Generar Moneda
        this.coins.push({
          x: this.logicalWidth + 50,
          y: 50 + Math.random() * (this.logicalHeight - 150),
          width: 32, height: 32,
          vx: -this.floorSpeed,
          frame: 0, frameTimer: 0
        });
      } else if (r < 0.70) {
        // Generar Enemigo 1
        this.enemies.push({
          type: 1,
          x: this.logicalWidth + 50,
          y: 50 + Math.random() * (this.logicalHeight - 150),
          width: 50, height: 50,
          vx: -(this.floorSpeed + 50 + progress*80), 
          hp: 1, shootTimer: Math.random() * 1.0,
          frame: 0, frameTimer: 0
        });
      } else if (progress > 0.25 && r < 0.85) {
        // Generar Enemigo 2
        this.enemies.push({
          type: 2,
          x: this.logicalWidth + 50,
          y: 50 + Math.random() * (this.logicalHeight - 150),
          width: 60, height: 60,
          vx: -(this.floorSpeed + 30),
          vy: (Math.random() > 0.5 ? 1 : -1) * (50 + progress*50),
          hp: 3, shootTimer: 0,
          frame: 0, frameTimer: 0
        });
      } else {
        // Generar Obstáculo
        let isTop = Math.random() > 0.5;
        this.enemies.push({
          type: 0, 
          x: this.logicalWidth + 50,
          y: isTop ? 0 : this.logicalHeight - 80 - 40, 
          width: 60, height: 80,
          vx: -this.floorSpeed,
          hp: 9999
        });
      }
    }
  }
  
  checkCollisions() {
    const pBox = {
      x: this.player.x + 10,
      y: this.player.y + 10,
      w: this.player.width - 20,
      h: this.player.height - 20
    };
    
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (pBox.x < c.x + c.width && pBox.x + pBox.w > c.x &&
          pBox.y < c.y + c.height && pBox.y + pBox.h > c.y) {
          
          this.coinsCollected++;
          this.createExplosion(c.x + c.width/2, c.y + c.height/2, 'gold', 5);
          this.coins.splice(i, 1);
          
          try {
            if (this.coinSound) {
              this.coinSound.currentTime = 0;
              this.coinSound.play().catch(()=>{});
            }
          } catch(e){}
      }
    }
    
    if (this.player.invulnerable <= 0) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        let eBox = { x: e.x+5, y: e.y+5, w: e.width-10, h: e.height-10 };
        if (e.type === 0) eBox = { x: e.x, y: e.y, w: e.width, h: e.height };
        
        if (pBox.x < eBox.x + eBox.w && pBox.x + pBox.w > eBox.x &&
            pBox.y < eBox.y + eBox.h && pBox.y + pBox.h > eBox.y) {
            
            this.player.hp -= (e.type === 0 ? 15 : 20);
            this.player.invulnerable = 1.5; 
            
            this.createExplosion(pBox.x + pBox.w/2, pBox.y + pBox.h/2, '#ff0000', 15);
            
            if (e.type !== 0) this.enemies.splice(i, 1); 
        }
      }
      
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        if (pBox.x < p.x + p.width && pBox.x + pBox.w > p.x &&
            pBox.y < p.y + p.height && pBox.y + pBox.h > p.y) {
            
            this.player.hp -= p.damage;
            this.player.invulnerable = 1.0;
            this.createExplosion(pBox.x + pBox.w/2, pBox.y + pBox.h/2, '#ff9900', 10);
            this.projectiles.splice(i, 1);
        }
      }
    }
  }
  
  createExplosion(x, y, color, count=10) {
    for(let i=0; i<count; i++){
      this.particles.push({
        x: x, y: y,
        vx: (Math.random()-0.5)*300,
        vy: (Math.random()-0.5)*300,
        life: 0.5 + Math.random()*0.5,
        color: color,
        size: 2 + Math.random()*4
      });
    }
  }
  
  update(dt) {
    if (this.state !== 'playing') return;
    
    if (this.player.hp <= 0) {
      this.endGame(false);
      return;
    }
    
    if (this.audio.duration && this.audio.currentTime >= this.audio.duration - 0.5) {
      if (this.coinsCollected >= this.coinsRequired && this.player.hp > 0) {
        this.endGame(true);
      } else {
        this.endGame(false);
      }
      return;
    }
    
    // Animar a Lisar (Sprite sheet animation)
    this.player.frameTimer += dt;
    if (this.player.frameTimer > 0.08) { // ~12 fps
      this.player.frame = (this.player.frame + 1) % this.sprites.lisar.totalFrames;
      this.player.frameTimer = 0;
    }
    
    if (this.input.up) {
      this.player.vy += this.player.jumpForce * dt * 5; 
      if (this.player.vy < -350) this.player.vy = -350;
    } else {
      this.player.vy += this.player.gravity * dt;
    }
    
    this.player.y += this.player.vy * dt;
    
    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.vy = 0;
    }
    if (this.player.y > this.logicalHeight - this.player.height - 40) { 
      this.player.y = this.logicalHeight - this.player.height - 40;
      this.player.vy = 0;
    }
    
    if (this.player.invulnerable > 0) {
      this.player.invulnerable -= dt;
    }
    
    this.floorOffset -= this.floorSpeed * dt;
    if (this.floorOffset <= -this.logicalWidth) {
      this.floorOffset += this.logicalWidth;
    }
    
    this.spawnEntity(dt);
    
    for (let i = this.coins.length - 1; i >= 0; i--) {
      let c = this.coins[i];
      c.x += c.vx * dt;
      
      c.frameTimer += dt;
      if (c.frameTimer > 0.1) {
        c.frame = (c.frame + 1) % this.sprites.coin.totalFrames;
        c.frameTimer = 0;
      }
      
      if (c.x < -c.width * 2) this.coins.splice(i, 1);
    }
    
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let e = this.enemies[i];
      e.x += e.vx * dt;
      
      if (e.vy) {
        e.y += e.vy * dt;
        if (e.y < 0 || e.y > this.logicalHeight - e.height - 40) e.vy *= -1;
      }
      
      if (e.type !== 0) {
        e.frameTimer += dt;
        let tFrames = e.type === 1 ? this.sprites.enemigo1.totalFrames : this.sprites.enemigo2.totalFrames;
        if (e.frameTimer > 0.1) {
          e.frame = (e.frame + 1) % tFrames;
          e.frameTimer = 0;
        }
        
        e.shootTimer += dt;
        if (e.shootTimer > (e.type === 1 ? 2.0 : 1.5)) {
          e.shootTimer = 0;
          this.projectiles.push({
            x: e.x, y: e.y + e.height/2,
            width: e.type===1? 16:24, height: 8,
            vx: -350 - (e.type===2? 100:0),
            damage: e.type === 1 ? 10 : 15,
            color: e.type === 1 ? '#00ffff' : '#ff00ff' 
          });
          
          if (e.type === 2) {
            this.projectiles.push({
              x: e.x, y: e.y + e.height,
              width: 16, height: 8,
              vx: -400,
              damage: 10,
              color: '#ff00ff'
            });
          }
        }
      }
      
      if (e.x < -e.width * 2) this.enemies.splice(i, 1); 
    }
    
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];
      p.x += p.vx * dt;
      if (p.x < -p.width) this.projectiles.splice(i, 1);
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if(p.life <= 0) this.particles.splice(i, 1);
    }
    
    this.checkCollisions();
    this.updateHUD();
  }
  
  // Función helper para dibujar un frame de un sprite sheet
  drawSprite(spriteInfo, frameIndex, x, y, w, h) {
      if (!spriteInfo.loaded) return;
      const fw = spriteInfo.img.width / spriteInfo.cols;
      const fh = spriteInfo.img.height / spriteInfo.rows;
      const col = frameIndex % spriteInfo.cols;
      const row = Math.floor(frameIndex / spriteInfo.cols);
      this.ctx.drawImage(spriteInfo.img, col * fw, row * fh, fw, fh, x, y, w, h);
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);
    
    // Fondo Arcade Futurista (ajustado a logicalHeight y width)
    const grad = this.ctx.createLinearGradient(0,0,0,this.logicalHeight);
    grad.addColorStop(0, '#020024');
    grad.addColorStop(0.5, '#090979');
    grad.addColorStop(1, '#00d4ff');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0,0,this.logicalWidth, this.logicalHeight);
    
    // Efecto grilla futurista de fondo
    this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.logicalWidth; i+=40) {
      this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.logicalHeight); this.ctx.stroke();
    }
    for (let i = 0; i < this.logicalHeight; i+=40) {
      this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.logicalWidth, i); this.ctx.stroke();
    }
    
    // Dibujar Piso repetible (tiling) cubriendo el logicalWidth expansivo
    if (this.sprites.floor.loaded) {
      let tiles = Math.ceil(this.logicalWidth / 800) + 1; // 800 es un ancho seguro por repetición
      for (let i=0; i<tiles; i++) {
          this.ctx.drawImage(this.sprites.floor.img, this.floorOffset + (i*800), this.logicalHeight - 40, 800, 40);
      }
    } else {
      this.ctx.fillStyle = '#ff9900';
      this.ctx.fillRect(0, this.logicalHeight - 40, this.logicalWidth, 40);
    }
    
    // Dibujar Monedas (Sprite frames individuales)
    this.coins.forEach(c => {
      if (this.sprites.coin.loaded) {
        this.drawSprite(this.sprites.coin, c.frame, c.x, c.y, c.width, c.height);
      } else {
        this.ctx.fillStyle = 'gold';
        this.ctx.beginPath();
        this.ctx.arc(c.x+c.width/2, c.y+c.height/2, c.width/2, 0, Math.PI*2);
        this.ctx.fill();
      }
    });
    
    // Dibujar Enemigos y Obstáculos
    this.enemies.forEach(e => {
      if (e.type === 0) {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
        
        this.ctx.strokeStyle = Math.floor(performance.now()/200)%2 === 0 ? '#ff9900' : '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(e.x, e.y, e.width, e.height);
        
        this.ctx.beginPath();
        this.ctx.moveTo(e.x, e.y); this.ctx.lineTo(e.x+e.width, e.y+e.height);
        this.ctx.moveTo(e.x+e.width, e.y); this.ctx.lineTo(e.x, e.y+e.height);
        this.ctx.stroke();
      } else if (e.type === 1 && this.sprites.enemigo1.loaded) {
        this.drawSprite(this.sprites.enemigo1, e.frame, e.x, e.y, e.width, e.height);
      } else if (e.type === 2 && this.sprites.enemigo2.loaded) {
        this.drawSprite(this.sprites.enemigo2, e.frame, e.x, e.y, e.width, e.height);
      } else {
        this.ctx.fillStyle = e.type===1? 'red':'purple';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
      }
    });
    
    // Dibujar Proyectiles
    this.projectiles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
      this.ctx.shadowBlur = 0;
    });
    
    // Dibujar a Lisar
    if (this.player.invulnerable <= 0 || Math.floor(this.player.invulnerable * 15) % 2 === 0) {
      if (this.sprites.lisar.loaded) {
        this.drawSprite(this.sprites.lisar, this.player.frame, this.player.x, this.player.y, this.player.width, this.player.height);
      } else {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      }
      
      if (this.input.up) {
        this.ctx.fillStyle = Math.random() > 0.5 ? '#ff9900' : '#ffff00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 10, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + 25, this.player.y + this.player.height + 15 + Math.random()*20);
        this.ctx.lineTo(this.player.x + 40, this.player.y + this.player.height);
        this.ctx.fill();
      }
    }
    
    // Dibujar Partículas
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    
    this.ctx.globalAlpha = 1.0;
    this.ctx.restore();
  }
  
  loop(now) {
    if (this.state !== 'playing' && this.state !== 'ready') return;
    
    let dt = (now - this.lastTime) / 1000;
    if (dt > 0.1) dt = 0.1; 
    this.lastTime = now;
    
    this.update(dt);
    if(this.state === 'playing') {
        this.draw();
    }
    
    requestAnimationFrame((t) => this.loop(t));
  }
  
  destroy() {
    this.state = 'destroyed';
    if(this.audio) this.audio.pause();
    this.container.innerHTML = ''; 
    window.removeEventListener('resize', this.resizeHandler);
    
    if (this.container.id === 'arcade-game-fullscreen') {
        this.container.remove();
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(()=>{});
        } else if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen().catch(()=>{});
        }
    }
  }
}

// Inicialización global segura y aislada
document.addEventListener('DOMContentLoaded', () => {
    
    async function enterGameFullscreen(container) {
        try {
            if (container.requestFullscreen) {
                await container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                await container.webkitRequestFullscreen();
            }
        } catch (error) {
            console.warn("No fue posible activar fullscreen nativo:", error);
        }
    }

    window.initArcadeGame = function() {
        if (window.arcadeGame) {
            window.arcadeGame.destroy();
        }
        
        let fs = document.getElementById('arcade-game-fullscreen');
        if (!fs) {
            fs = document.createElement('div');
            fs.id = 'arcade-game-fullscreen';
            fs.style.position = 'fixed';
            fs.style.inset = '0';
            fs.style.width = '100vw';
            fs.style.height = '100dvh';
            fs.style.zIndex = '9999';
            fs.style.overflow = 'hidden';
            fs.style.background = '#000';
            document.body.appendChild(fs);
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '15px';
            closeBtn.style.right = '20px';
            closeBtn.style.zIndex = '10000';
            closeBtn.style.background = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '3rem';
            closeBtn.style.lineHeight = '1';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.textShadow = '0 0 10px #000';
            closeBtn.onclick = () => {
                if(window.arcadeGame) window.arcadeGame.destroy();
                window.arcadeGame = null;
            };
            fs.appendChild(closeBtn);
        }

        window.arcadeGame = new LisarArcade2D('arcade-game-fullscreen');
    };
    
    const btn = document.getElementById('start-arcade-btn');
    
    if (btn) {
        btn.addEventListener('click', async () => {
            if (!window.arcadeGame) window.initArcadeGame();
            else if (window.arcadeGame.state === 'destroyed') window.initArcadeGame();
            
            const fs = document.getElementById('arcade-game-fullscreen');
            if (fs) {
                await enterGameFullscreen(fs);
            }
            
            if(window.arcadeGame && window.arcadeGame.state === 'ready') {
               window.arcadeGame.startGame();
            }
        });
    }
});
