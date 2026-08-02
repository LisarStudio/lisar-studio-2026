class LisarArcade2D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 450;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.display = 'block';
    this.canvas.style.objectFit = 'contain';
    
    // Wrapper for responsive scaling
    this.wrapper = document.createElement('div');
    this.wrapper.style.width = '100%';
    this.wrapper.style.height = '100%';
    this.wrapper.style.display = 'flex';
    this.wrapper.style.alignItems = 'center';
    this.wrapper.style.justifyContent = 'center';
    this.wrapper.style.background = '#000';
    this.wrapper.style.position = 'relative';
    
    this.wrapper.appendChild(this.canvas);
    this.container.appendChild(this.wrapper);
    
    this.ctx = this.canvas.getContext('2d');
    
    // Audio
    this.audio = new Audio('assets/audio/Level_2.mp3');
    this.audio.preload = 'auto';
    this.coinSound = new Audio('assets/audio/coin.mp3'); // Fallback si no hay
    
    // Sprites reales de Github
    this.sprites = {
      lisar: { src: 'images/sprites_arcade/Sprite_lisar_2d.png', img: new Image(), loaded: false, frameCount: 1 },
      enemigo1: { src: 'images/sprites_arcade/Sprite_enemigo1.png', img: new Image(), loaded: false, frameCount: 1 },
      enemigo2: { src: 'images/sprites_arcade/Sprite_enemigo2.png', img: new Image(), loaded: false, frameCount: 1 },
      coin: { src: 'images/sprites_arcade/Sprite_Lisarcoins.png', img: new Image(), loaded: false, frameCount: 6 },
      floor: { src: 'images/sprites_arcade/tiling_floor.png', img: new Image(), loaded: false, frameCount: 1 },
      obstaculo: { src: 'images/sprites_arcade/Sprite_enemigo1.png', img: new Image(), loaded: false, frameCount: 1 } // Fallback si no está el obstáculo, usaré el Sprite_enemigo1 dibujado distinto
    };
    
    // Estados del juego
    this.state = 'loading'; // loading, ready, playing, paused, gameover, victory
    this.lastTime = 0;
    
    // Propiedades del jugador
    this.player = {
      x: 100, y: 200, width: 64, height: 64,
      vy: 0, gravity: 900, jumpForce: -400,
      hp: 100, maxHp: 100, invulnerable: 0,
      frameX: 0, frameY: 0, timer: 0
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
    this.coinsRequired = 20; // Requisito de la misión
    this.spawnTimer = 0;
    this.missionId = 'lisar-game-2-mission';
    
    // Inputs (escritorio y móvil)
    this.input = { up: false };
    
    this.loadSprites();
    this.setupControls();
    this.createHUD();
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
          // Si una imagen falla (como obstaculos), igual contar para no trabar el loader
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
      e.preventDefault(); // Evita scroll
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
    this.hud.style.top = '10px';
    this.hud.style.left = '10px';
    this.hud.style.right = '10px';
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
      <h2 style="font-size: 2.5rem; color: #ff9900; margin: 0 0 10px 0; text-shadow: 0 0 10px #ff0000; text-align:center;">${title}</h2>
      <p style="font-size: 1.2rem; margin: 0 0 20px 0; text-align:center;">${subtitle}</p>
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
          this.hideMessage();
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
        // Generar Moneda (Asegurar que se puedan conseguir las monedas)
        this.coins.push({
          x: this.canvas.width + 50,
          y: 50 + Math.random() * (this.canvas.height - 150),
          width: 32, height: 32,
          vx: -this.floorSpeed,
          frame: 0, timer: 0
        });
      } else if (r < 0.70) {
        // Generar Enemigo 1 (Clásico que dispara ocasionalmente)
        this.enemies.push({
          type: 1,
          x: this.canvas.width + 50,
          y: 50 + Math.random() * (this.canvas.height - 150),
          width: 50, height: 50,
          vx: -(this.floorSpeed + 50 + progress*80), // Más rápido al final
          hp: 1, shootTimer: Math.random() * 1.0 // Desfase disparo
        });
      } else if (progress > 0.25 && r < 0.85) {
        // Generar Enemigo 2 (Más peligroso, dispara doble y se mueve vertical, aparece pasado el 25%)
        this.enemies.push({
          type: 2,
          x: this.canvas.width + 50,
          y: 50 + Math.random() * (this.canvas.height - 150),
          width: 60, height: 60,
          vx: -(this.floorSpeed + 30),
          vy: (Math.random() > 0.5 ? 1 : -1) * (50 + progress*50),
          hp: 3, shootTimer: 0
        });
      } else {
        // Generar Obstáculo en el piso o techo
        let isTop = Math.random() > 0.5;
        this.enemies.push({
          type: 0, // Obstáculo invencible
          x: this.canvas.width + 50,
          y: isTop ? 0 : this.canvas.height - 80 - 40, // 40 es la altura del piso
          width: 60, height: 80,
          vx: -this.floorSpeed,
          hp: 9999
        });
      }
    }
  }
  
  checkCollisions() {
    // Hitbox precisa para Lisar (un poco menor que la imagen)
    const pBox = {
      x: this.player.x + 10,
      y: this.player.y + 10,
      w: this.player.width - 20,
      h: this.player.height - 20
    };
    
    // Colisiones con Monedas
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (pBox.x < c.x + c.width && pBox.x + pBox.w > c.x &&
          pBox.y < c.y + c.height && pBox.y + pBox.h > c.y) {
          
          this.coinsCollected++;
          
          // Partículas doradas
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
      // Colisiones con Enemigos y Obstáculos
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        let eBox = { x: e.x+5, y: e.y+5, w: e.width-10, h: e.height-10 };
        if (e.type === 0) eBox = { x: e.x, y: e.y, w: e.width, h: e.height }; // Obstáculos tienen hitbox completa
        
        if (pBox.x < eBox.x + eBox.w && pBox.x + pBox.w > eBox.x &&
            pBox.y < eBox.y + eBox.h && pBox.y + pBox.h > eBox.y) {
            
            // Daño ajustado
            this.player.hp -= (e.type === 0 ? 15 : 20);
            this.player.invulnerable = 1.5; // Segundos de invulnerabilidad post-daño
            
            this.createExplosion(pBox.x + pBox.w/2, pBox.y + pBox.h/2, '#ff0000', 15);
            
            if (e.type !== 0) this.enemies.splice(i, 1); // Destruir enemigo tras chocar
        }
      }
      
      // Colisiones con Proyectiles
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
    
    // VICTORIA / DERROTA BASADOS EN EL AUDIO (Reloj Maestro)
    if (this.player.hp <= 0) {
      this.endGame(false);
      return;
    }
    
    // Tolerancia de 0.5 segundos al final de la canción
    if (this.audio.duration && this.audio.currentTime >= this.audio.duration - 0.5) {
      // Detener spawn al finalizar la canción
      if (this.coinsCollected >= this.coinsRequired && this.player.hp > 0) {
        this.endGame(true);
      } else {
        this.endGame(false);
      }
      return;
    }
    
    // Movimiento fluido del jugador (Aceleración y Gravedad)
    if (this.input.up) {
      this.player.vy += this.player.jumpForce * dt * 5; 
      // Límite de velocidad de ascenso
      if (this.player.vy < -350) this.player.vy = -350;
    } else {
      this.player.vy += this.player.gravity * dt;
    }
    
    this.player.y += this.player.vy * dt;
    
    // Límites de pantalla para Lisar
    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.vy = 0;
    }
    if (this.player.y > this.canvas.height - this.player.height - 40) { // 40 es la altura del piso
      this.player.y = this.canvas.height - this.player.height - 40;
      this.player.vy = 0;
    }
    
    if (this.player.invulnerable > 0) {
      this.player.invulnerable -= dt;
    }
    
    // Desplazamiento del Piso (Floor)
    this.floorOffset -= this.floorSpeed * dt;
    if (this.floorOffset <= -this.canvas.width) {
      this.floorOffset = 0;
    }
    
    this.spawnEntity(dt);
    
    // Actualizar Monedas (Pooling y Movimiento)
    for (let i = this.coins.length - 1; i >= 0; i--) {
      let c = this.coins[i];
      c.x += c.vx * dt;
      c.timer += dt;
      if (c.timer > 0.1) {
        c.frame = (c.frame + 1) % 6; // Animación de moneda (6 frames)
        c.timer = 0;
      }
      if (c.x < -c.width * 2) this.coins.splice(i, 1);
    }
    
    // Actualizar Enemigos y Obstáculos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let e = this.enemies[i];
      e.x += e.vx * dt;
      
      // Movimiento vertical de Enemigo 2
      if (e.vy) {
        e.y += e.vy * dt;
        if (e.y < 0 || e.y > this.canvas.height - e.height - 40) e.vy *= -1;
      }
      
      // Disparo de Enemigos
      if (e.type !== 0) {
        e.shootTimer += dt;
        // Enemigo 1 dispara cada 2s, Enemigo 2 cada 1.5s
        if (e.shootTimer > (e.type === 1 ? 2.0 : 1.5)) {
          e.shootTimer = 0;
          this.projectiles.push({
            x: e.x, y: e.y + e.height/2,
            width: e.type===1? 16:24, height: 8,
            vx: -350 - (e.type===2? 100:0),
            damage: e.type === 1 ? 10 : 15,
            color: e.type === 1 ? '#00ffff' : '#ff00ff' // Cían vs Magenta
          });
          
          // Disparo doble para el Enemigo 2
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
      
      if (e.x < -e.width * 2) this.enemies.splice(i, 1); // Liberar fuera de pantalla
    }
    
    // Actualizar Proyectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];
      p.x += p.vx * dt;
      if (p.x < -p.width) this.projectiles.splice(i, 1);
    }
    
    // Actualizar Partículas
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
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Fondo Arcade Futurista 
    const grad = this.ctx.createLinearGradient(0,0,0,this.canvas.height);
    grad.addColorStop(0, '#020024');
    grad.addColorStop(0.5, '#090979');
    grad.addColorStop(1, '#00d4ff');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
    
    // Efecto grilla futurista de fondo
    this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.width; i+=40) {
      this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.canvas.height); this.ctx.stroke();
    }
    for (let i = 0; i < this.canvas.height; i+=40) {
      this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.canvas.width, i); this.ctx.stroke();
    }
    
    // Dibujar Piso repetible (tiling) sin parpadeos
    if (this.sprites.floor.loaded) {
      this.ctx.drawImage(this.sprites.floor.img, this.floorOffset, this.canvas.height - 40, this.canvas.width, 40);
      this.ctx.drawImage(this.sprites.floor.img, this.floorOffset + this.canvas.width, this.canvas.height - 40, this.canvas.width, 40);
      this.ctx.drawImage(this.sprites.floor.img, this.floorOffset + this.canvas.width*2, this.canvas.height - 40, this.canvas.width, 40);
    } else {
      this.ctx.fillStyle = '#ff9900';
      this.ctx.fillRect(0, this.canvas.height - 40, this.canvas.width, 40);
    }
    
    // Dibujar Monedas
    this.coins.forEach(c => {
      if (this.sprites.coin.loaded) {
        // Asume un sprite sheet horizontal de 6 frames proporcionales
        const sW = this.sprites.coin.img.width / 6;
        this.ctx.drawImage(this.sprites.coin.img, c.frame*sW, 0, sW, this.sprites.coin.img.height, c.x, c.y, c.width, c.height);
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
        // Obstáculo visual estilo barrera tecnológica
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
        
        // Bordes de neón intermitente
        this.ctx.strokeStyle = Math.floor(performance.now()/200)%2 === 0 ? '#ff9900' : '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(e.x, e.y, e.width, e.height);
        
        // Interior (X diagonal)
        this.ctx.beginPath();
        this.ctx.moveTo(e.x, e.y); this.ctx.lineTo(e.x+e.width, e.y+e.height);
        this.ctx.moveTo(e.x+e.width, e.y); this.ctx.lineTo(e.x, e.y+e.height);
        this.ctx.stroke();
      } else if (e.type === 1 && this.sprites.enemigo1.loaded) {
        this.ctx.drawImage(this.sprites.enemigo1.img, e.x, e.y, e.width, e.height);
      } else if (e.type === 2 && this.sprites.enemigo2.loaded) {
        this.ctx.drawImage(this.sprites.enemigo2.img, e.x, e.y, e.width, e.height);
      } else {
        this.ctx.fillStyle = e.type===1? 'red':'purple';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
      }
    });
    
    // Dibujar Proyectiles
    this.projectiles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
      // Glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
      this.ctx.shadowBlur = 0;
    });
    
    // Dibujar a Lisar
    // Si es invulnerable, parpadea
    if (this.player.invulnerable <= 0 || Math.floor(this.player.invulnerable * 15) % 2 === 0) {
      if (this.sprites.lisar.loaded) {
        this.ctx.drawImage(this.sprites.lisar.img, this.player.x, this.player.y, this.player.width, this.player.height);
      } else {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      }
      
      // Partículas propulsoras al volar
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
  }
  
  loop(now) {
    if (this.state !== 'playing') return;
    
    let dt = (now - this.lastTime) / 1000;
    if (dt > 0.1) dt = 0.1; // Límite de delta para evitar bugs por tabs inactivos
    this.lastTime = now;
    
    this.update(dt);
    this.draw();
    
    requestAnimationFrame((t) => this.loop(t));
  }
  
  destroy() {
    this.state = 'destroyed';
    if(this.audio) this.audio.pause();
    this.container.innerHTML = ''; // Limpiar el DOM encapsulado
  }
}

// Inicialización global segura y aislada
document.addEventListener('DOMContentLoaded', () => {
    window.initArcadeGame = function() {
        if (window.arcadeGame) {
            window.arcadeGame.destroy();
        }
        window.arcadeGame = new LisarArcade2D('arcade-game-container');
    };
    
    const btn = document.getElementById('start-arcade-btn');
    const overlay = document.getElementById('arcade-overlay');
    
    if (btn && overlay) {
        btn.addEventListener('click', () => {
            overlay.style.display = 'none';
            if (!window.arcadeGame) window.initArcadeGame();
            
            if(window.arcadeGame.state === 'ready') {
               window.arcadeGame.startGame();
            }
        });
    }
});
