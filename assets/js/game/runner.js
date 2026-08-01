/**
 * Lisar Runner 3D - Minijuego Endless Runner
 */
class LisarRunner {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    
    this.clock = new THREE.Clock();
    this.playerTime = 0;
    this.mixer = null;
    
    // Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0b0c10, 10, 50);
    this.scene.background = new THREE.Color(0x0b0c10);
    
    // Aumentamos el FOV (de 60 a 75) para hacer un efecto de "zoom out"
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 2.5, 3.5); // Cámara más cerca en Z y un poco alta
    this.camera.lookAt(0, 1.5, -10); // Mirar a lo lejos para que el personaje baje al borde de la pantalla
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    
    const dirLight = new THREE.DirectionalLight(0xffb703, 1.2);
    dirLight.position.set(5, 10, 5);
    this.scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x9b59b6, 0.8);
    dirLight2.position.set(-5, 5, -5);
    this.scene.add(dirLight2);
    
    // Game State
    this.isPlaying = false;
    this.score = 0;
    this.speed = 0.12; // Velocidad reducida
    this.lanes = [-2, 0, 2];
    this.currentLane = 1; // Middle lane
    
    // Jump State
    this.isJumping = false;
    this.velocityY = 0;
    this.gravity = -0.015;
    this.jumpForce = 0.25;
    
    this.obstacles = [];
    this.coins = [];
    
    // Game/Audio State
    this.lives = 3;
    this.totalCoins = 0;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.lastBeatTime = 0;
    this.audioInitialized = false;
    this.coinModel = null;
    
    // Player
    this.player = null;
    // Load Logo Texture
    this.textureLoader = new THREE.TextureLoader();
    this.logoTexture = this.textureLoader.load('assets/img/lisar-studio-logo-white.webp');
    
    this.initPlayer();
    
    // Floor & Environment
    this.initFloor();
    this.initStars();
    
    // Audio
    this.bgMusic = new Audio('assets/audio/level1.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.5;
    
    // UI
    this.initUI();
    
    // Events
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Controls
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Touch Controls
    let touchStartX = 0;
    let touchStartY = 0;
    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});
    
    this.container.addEventListener('touchend', (e) => {
      if(!this.isPlaying) return;
      let touchEndX = e.changedTouches[0].screenX;
      let touchEndY = e.changedTouches[0].screenY;
      
      // Si desliza hacia arriba (Salto)
      if (touchStartY - touchEndY > 40) {
        this.jump();
      } 
      // Si fue un tap (sin mucho movimiento), mover a los lados basado en mitad de pantalla
      else if (Math.abs(touchEndX - touchStartX) < 20 && Math.abs(touchEndY - touchStartY) < 20) {
        if (touchEndX < this.width / 2) this.moveLeft();
        else this.moveRight();
      }
      // O deslizar a los lados
      else {
        if (touchEndX < touchStartX - 30) this.moveLeft();
        if (touchEndX > touchStartX + 30) this.moveRight();
      }
    }, {passive: true});

    this.animate();
  }
  
  initUI() {
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.top = '10px';
    this.uiContainer.style.left = '10px';
    this.uiContainer.style.right = '10px';
    this.uiContainer.style.display = 'none';
    this.uiContainer.style.justifyContent = 'space-between';
    this.uiContainer.style.zIndex = '100';
    this.uiContainer.style.pointerEvents = 'none';
    
    this.scoreEl = document.createElement('div');
    this.scoreEl.style.color = '#ffb703';
    this.scoreEl.style.fontFamily = 'monospace';
    this.scoreEl.style.fontSize = '20px';
    this.scoreEl.style.fontWeight = 'bold';
    this.scoreEl.innerText = 'SCORE: 0';
    
    this.livesEl = document.createElement('div');
    this.livesEl.style.color = '#ff0055';
    this.livesEl.style.fontFamily = 'monospace';
    this.livesEl.style.fontSize = '20px';
    this.livesEl.style.fontWeight = 'bold';
    this.updateLivesDisplay();

    this.uiContainer.appendChild(this.scoreEl);
    this.uiContainer.appendChild(this.livesEl);
    this.container.appendChild(this.uiContainer);

    this.msgEl = document.createElement('div');
    this.msgEl.style.position = 'absolute';
    this.msgEl.style.top = '50%';
    this.msgEl.style.left = '50%';
    this.msgEl.style.transform = 'translate(-50%, -50%)';
    this.msgEl.style.color = '#ff8800'; // Neon orange
    this.msgEl.style.textShadow = '0 0 15px #ff8800';
    this.msgEl.style.fontFamily = 'monospace';
    this.msgEl.style.fontSize = '40px';
    this.msgEl.style.fontWeight = 'bold';
    this.msgEl.style.display = 'none';
    this.msgEl.style.zIndex = '100';
    this.msgEl.style.pointerEvents = 'none';
    this.container.appendChild(this.msgEl);
    
    this.jumpWarningEl = document.createElement('div');
    this.jumpWarningEl.style.position = 'absolute';
    this.jumpWarningEl.style.top = '60%';
    this.jumpWarningEl.style.left = '50%';
    this.jumpWarningEl.style.transform = 'translate(-50%, -50%)';
    this.jumpWarningEl.style.color = '#ff0000';
    this.jumpWarningEl.style.textShadow = '0 0 15px #ff0000';
    this.jumpWarningEl.style.fontFamily = 'monospace';
    this.jumpWarningEl.style.fontSize = '50px';
    this.jumpWarningEl.style.fontWeight = 'bold';
    this.jumpWarningEl.style.display = 'none';
    this.jumpWarningEl.style.zIndex = '100';
    this.jumpWarningEl.style.pointerEvents = 'none';
    this.jumpWarningEl.innerText = '¡SALTA!';
    this.container.appendChild(this.jumpWarningEl);
  }

  updateLivesDisplay() {
    if(this.livesEl) {
      let text = '';
      for(let i=0; i<this.lives; i++) text += '❤️ ';
      this.livesEl.innerHTML = text;
    }
  }
  
  showMessage(text, duration = 2000) {
    if(!this.msgEl) return;
    this.msgEl.innerText = text;
    this.msgEl.style.display = 'block';
    setTimeout(() => {
      this.msgEl.style.display = 'none';
    }, duration);
  }

  initPlayer() {
    // Simple glowing box as placeholder for Tron Bot
    const geo = new THREE.BoxGeometry(1, 1, 2);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0x9b59b6,
      emissive: 0x6c3483,
      emissiveIntensity: 0.5
    });
    this.player = new THREE.Mesh(geo, mat);
    this.player.position.set(this.lanes[this.currentLane], 0.5, 0);
    this.scene.add(this.player);
    
    // Try to load GLB (wukonglisar.glb)
    if(window.THREE && window.THREE.GLTFLoader) {
      const loader = new THREE.GLTFLoader();
      loader.load('assets/models/wukonglisar.glb', (gltf) => {
        this.scene.remove(this.player);
        
        this.model = gltf.scene;
        this.model.scale.set(1.32, 1.32, 1.32); // 10% más grande
        this.model.rotation.y = Math.PI; // Face forward
        
        // Fix para materiales metálicos en entornos oscuros:
        // Si el modelo tiene alto "metalness" en Blender, en Three.js con fondo negro reflejará negro/café.
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              // Forzamos a que no sea un espejo perfecto para que las texturas sean visibles
              child.material.metalness = 0.1;
              child.material.roughness = 0.8;
              child.material.needsUpdate = true;
            }
          }
        });

        // Wrapper group to separate procedural movement from GLTF animation
        this.player = new THREE.Group();
        this.player.position.set(this.lanes[this.currentLane], 0, 0); // Ajuste vertical
        this.player.add(this.model);
        
        // Handle Animations
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          let runClip = gltf.animations.find(a => a.name.toLowerCase().includes('run'));
          if(!runClip) runClip = gltf.animations[0];
          const action = this.mixer.clipAction(runClip);
          action.play();
        }
        
        this.scene.add(this.player);
      }, undefined, (err) => {
        console.warn("Could not load wukonglisar.glb for minigame, using placeholder", err);
      });
      
      loader.load('assets/models/lisar 2.0 coin.glb', (gltf) => {
        this.coinModel = gltf.scene;
        this.coinModel.scale.set(0.5, 0.5, 0.5);
        this.coinModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      });
      
      // Load Rocket
      loader.load('assets/models/Rocket.glb', (gltf) => {
        this.rocketModel = gltf.scene;
        // Escalar y posicionar el cohete en el cielo (lejos a la izquierda)
        this.rocketModel.scale.set(2.0, 2.0, 2.0); 
        this.rocketModel.position.set(-40, 12, -20);
        this.rocketModel.rotation.y = -Math.PI / 2; // Apuntar hacia la derecha (espejo en X)
        this.rocketModel.rotation.z = -0.15; // Inclinación ligera hacia arriba
        
        this.rocketModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.metalness = 0.2;
              child.material.roughness = 0.6;
            }
          }
        });
        
        if (gltf.animations && gltf.animations.length > 0) {
          this.rocketMixer = new THREE.AnimationMixer(this.rocketModel);
          this.rocketMixer.clipAction(gltf.animations[0]).play();
        }
        
        this.scene.add(this.rocketModel);
      });
    }
  }
  
  initStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starArray = new Float32Array(starCount * 3);
    for(let i=0; i < starCount * 3; i++) {
      starArray[i] = (Math.random() - 0.5) * 100;
      // Empujar las estrellas hacia el fondo y hacia arriba
      if (i % 3 === 1) starArray[i] = Math.random() * 50; // Y (altura)
      if (i % 3 === 2) starArray[i] = -20 - Math.random() * 50; // Z (profundidad)
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starArray, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.8
    });
    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }
  
  initFloor() {
    const geo = new THREE.PlaneGeometry(20, 100, 10, 50);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.floor = new THREE.Mesh(geo, mat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.z = -30;
    this.scene.add(this.floor);
    
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 10, 50);
  }
  
  moveLeft() {
    if(this.currentLane > 0) {
      this.currentLane--;
    }
  }
  
  moveRight() {
    if(this.currentLane < 2) {
      this.currentLane++;
    }
  }
  
  handleKeyDown(e) {
    if(!this.isPlaying) return;
    if(e.key === 'ArrowLeft' || e.key === 'a') this.moveLeft();
    if(e.key === 'ArrowRight' || e.key === 'd') this.moveRight();
    if(e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.jump();
  }
  
  jump() {
    if(!this.isJumping) {
      this.isJumping = true;
      this.velocityY = this.jumpForce;
    }
  }
  
  spawnObstacle() {
    const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0xff00ff, 
      emissive: 0xff00ff, 
      emissiveIntensity: 0.8,
      wireframe: true
    });
    const obs = new THREE.Mesh(geo, mat);
    const lane = Math.floor(Math.random() * 3);
    obs.position.set(this.lanes[lane], 0.75, -40);
    this.scene.add(obs);
    this.obstacles.push(obs);
  }
  
  spawnCoin() {
    let coinObj;
    if(this.coinModel) {
      coinObj = this.coinModel.clone();
      coinObj.position.set(0, 0, 0);
    } else {
      // Fallback
      const geo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xffb703, emissiveIntensity: 0.3 });
      const faceMat = new THREE.MeshStandardMaterial({ 
        map: this.logoTexture, emissive: 0xffffff, emissiveMap: this.logoTexture, emissiveIntensity: 0.5, transparent: true
      });
      coinObj = new THREE.Mesh(geo, [edgeMat, faceMat, faceMat]);
      coinObj.rotation.x = Math.PI / 2;
    }
    
    const coinGroup = new THREE.Group();
    coinGroup.add(coinObj);
    
    const lane = Math.floor(Math.random() * 3);
    coinGroup.position.set(this.lanes[lane], 1, -40);
    this.scene.add(coinGroup);
    this.coins.push(coinGroup);
  }
  
  initAudio() {
    if (!this.audioInitialized) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaElementSource(this.bgMusic);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.audioInitialized = true;
        this.bgMusic.loop = false; // Solo una vuelta, luego se gana el nivel
        this.bgMusic.onended = () => this.levelComplete();
      } catch (e) {
        console.error("Audio API no soportada", e);
      }
    }
  }

  startGame() {
    const overlay = document.getElementById('game-overlay');
    if(overlay) overlay.style.display = 'none';
    
    this.initAudio();
    if(this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.uiContainer.style.display = 'flex';
    this.scoreEl.innerText = 'SCORE: 0';
    this.lives = 3;
    this.totalCoins = 0;
    this.updateLivesDisplay();
    
    // Clear old
    this.obstacles.forEach(o => this.scene.remove(o));
    this.coins.forEach(c => this.scene.remove(c));
    this.obstacles = [];
    this.coins = [];
    
    this.score = 0;
    this.speed = 0.12;
    this.currentLane = 1;
    this.isPlaying = false; // No mover nada aún
    
    if(this.player) this.player.position.set(this.lanes[this.currentLane], 0, 0);
    
    // 3, 2, 1 Countdown
    let count = 3;
    this.msgEl.style.fontSize = '80px';
    this.showMessage(count.toString(), 900);
    this.speak(count.toString());
    
    this.readyCoin = null;
    
    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.showMessage(count.toString(), 900);
        this.speak(count.toString());
      } else {
        clearInterval(countInterval);
        
        // Mostrar "READY!"
        this.msgEl.style.fontSize = '60px';
        this.msgEl.innerText = "READY!";
        this.msgEl.style.display = 'block';
        this.speak("Ready!");
        
        // Agregar moneda 3D enfrente de la cámara
        if (this.coinModel) {
            this.readyCoin = this.coinModel.clone();
            this.readyCoin.scale.set(1.5, 1.5, 1.5);
            this.readyCoin.position.set(1.5, 1.5, -2); // Posicionar a la derecha del texto, frente a la cámara
            this.camera.add(this.readyCoin);
            this.scene.add(this.camera); // Asegurar que la cámara está en la escena para ver sus hijos
        }
        
        setTimeout(() => {
           this.msgEl.style.display = 'none';
           if(this.readyCoin) this.camera.remove(this.readyCoin);
           this.beginGame();
        }, 1500);
      }
    }, 1000);
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Inglés para "Ready" / "Go" / "3, 2, 1"
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }

  beginGame() {
    this.isPlaying = true;
    this.msgEl.style.fontSize = '40px'; // reset font size
    
    // Play music
    this.bgMusic.currentTime = 0;
    this.bgMusic.play().catch(e => console.log("Music play blocked by browser:", e));
  }

  levelComplete() {
    this.isPlaying = false;
    this.bgMusic.pause();
    const overlay = document.getElementById('game-overlay');
    if(overlay) {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <h3 class="text-success mb-2" style="text-shadow: 0 0 10px #00ff00;">¡NIVEL COMPLETADO!</h3>
        <p class="text-white mb-3">Puntuación Final: ${this.score}</p>
        <button id="restart-game-btn" class="btn btn-gold-primary mt-2"><i class="bi bi-arrow-clockwise"></i> Volver a Jugar</button>
      `;
      document.getElementById('restart-game-btn').addEventListener('click', () => {
        overlay.innerHTML = `
          <h3 class="text-white mb-2 font-weight-bold">Lisar Runner 3D</h3>
          <button id="start-game-btn" class="btn btn-gold-primary mt-3"><i class="bi bi-play-fill"></i> Jugar Ahora</button>
        `;
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        this.startGame();
      });
    }
  }
  
  gameOver() {
    this.isPlaying = false;
    this.bgMusic.pause();
    const overlay = document.getElementById('game-overlay');
    if(overlay) {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <h3 class="text-danger mb-2">¡Juego Terminado!</h3>
        <p class="text-white mb-3">Puntuación: ${this.score}</p>
        <button id="restart-game-btn" class="btn btn-gold-primary mt-2"><i class="bi bi-arrow-clockwise"></i> Volver a Jugar</button>
      `;
      document.getElementById('restart-game-btn').addEventListener('click', () => this.startGame());
    }
  }
  
  onWindowResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    if(this.isPlaying) {
      const dt = this.clock.getDelta();
      if(this.mixer) this.mixer.update(dt);
      if(this.rocketMixer) this.rocketMixer.update(dt);
      
      this.playerTime += 0.1;
      
      // Jump warning logic
      let needJump = false;
      if(this.player) {
        for(let i = 0; i < this.obstacles.length; i++) {
          let obs = this.obstacles[i];
          if(!obs.hit && Math.abs(obs.position.x - this.player.position.x) < 1.0) {
             if(obs.position.z > -20 && obs.position.z < -5) {
               needJump = true;
               break;
             }
          }
        }
      }
      if(this.jumpWarningEl) {
         this.jumpWarningEl.style.display = needJump ? 'block' : 'none';
      }

      // Move player smoothly to lane and add running/bobbing animation
      if(this.player) {
        const targetX = this.lanes[this.currentLane];
        this.player.position.x += (targetX - this.player.position.x) * 0.2;
        
        // Procedural bobbing (running effect) ONLY when not jumping
        let baseY = this.player.geometry ? 0.5 : 0;
        
        if (this.isJumping) {
          this.velocityY += this.gravity;
          this.player.position.y += this.velocityY;
          
          // Rotate while jumping
          if(this.model) this.model.rotation.x = -0.2;
          
          if (this.player.position.y <= baseY) {
            this.player.position.y = baseY;
            this.isJumping = false;
            this.velocityY = 0;
            if(this.model) this.model.rotation.x = 0;
          }
        } else {
          this.player.position.y = baseY + Math.abs(Math.sin(this.playerTime * 1.5)) * 0.25;
          // Fake running wobble since GLB has no animations
          if(this.model) {
            this.model.rotation.z = Math.sin(this.playerTime * 1.5) * 0.1;
            this.model.rotation.x = Math.sin(this.playerTime * 3) * 0.05;
          }
        }
        
        // Tilt when moving lanes
        this.player.rotation.z = (this.player.position.x - targetX) * 0.1;
      }
      
      // Move floor texture (illusion of speed)
      this.floor.position.z += this.speed;
      if(this.floor.position.z > 10) this.floor.position.z = -30;
      
      // Spawn logic with Audio Beat Detection
      let obstacleSpawned = false;
      if(this.analyser && this.isPlaying) {
        this.analyser.getByteFrequencyData(this.dataArray);
        // Analizar SOLO frecuencias sub-bass y graves (bins 0 a 3) para aislar los verdaderos golpes de percusión
        let sum = 0;
        const lowFreqCount = 4;
        for(let j = 0; j < lowFreqCount; j++){
           sum += this.dataArray[j];
        }
        const avg = sum / lowFreqCount;
        
        const now = performance.now();
        // Umbral alto (180) para que sólo detecte los bombos fuertes, y mínimo 450ms entre obstáculos
        if(avg > 180 && (now - this.lastBeatTime > 450)) {
           this.lastBeatTime = now;
           this.spawnObstacle();
           obstacleSpawned = true;
        }
      }
      
      // Fallback mínimo para que nunca haya silencios totales
      if(!obstacleSpawned && Math.random() < 0.005) {
        this.spawnObstacle();
      }
      
      // Spawn coins aleatoriamente
      if(Math.random() < 0.03) this.spawnCoin();
      
      // Update obstacles
      for(let i = this.obstacles.length - 1; i >= 0; i--) {
        let obs = this.obstacles[i];
        obs.position.z += this.speed;
        
        // Collision (simple AABB distance check)
        if(this.player && !obs.hit && Math.abs(obs.position.z - this.player.position.z) < 1.5 && Math.abs(obs.position.x - this.player.position.x) < 1.0) {
          if (this.player.position.y < 1.5) {
            obs.hit = true; // prevent multiple hits from same obstacle
            this.lives--;
            this.updateLivesDisplay();
            
            // Visual feedback for hit
            obs.material.color.setHex(0xff0000);
            
            if (this.lives <= 0) {
              this.gameOver();
            }
          }
        }
        
        if(obs.position.z > 10) {
          this.scene.remove(obs);
          this.obstacles.splice(i, 1);
          if(!obs.hit) {
            this.score += 10; // points for dodging
            this.scoreEl.innerText = 'SCORE: ' + this.score;
          }
        }
      }
      
      // Update coins
      for(let i = this.coins.length - 1; i >= 0; i--) {
        let coin = this.coins[i];
        coin.position.z += this.speed;
        coin.children[0].rotation.y += 0.05;
        // Make coin float slightly
        coin.position.y = 1 + Math.sin(this.playerTime * 2 + i) * 0.2;
        
        if(this.player && Math.abs(coin.position.z - this.player.position.z) < 1.5 && Math.abs(coin.position.x - this.player.position.x) < 1.0) {
          this.scene.remove(coin);
          this.coins.splice(i, 1);
          this.score += 50; 
          this.totalCoins++;
          this.scoreEl.innerText = 'SCORE: ' + this.score;
          
          // Recompensas
          if (this.totalCoins % 1000 === 0) {
            this.showMessage("¡Increíble! " + this.totalCoins + " Monedas");
          } else if (this.totalCoins % 100 === 0) {
            this.lives++;
            this.updateLivesDisplay();
            this.showMessage("¡Vida Extra! 💚");
          }

        } else if(coin.position.z > 10) {
          this.scene.remove(coin);
          this.coins.splice(i, 1);
        }
      }
      
      // Animate Sky Rocket
      if(this.rocketModel) {
        this.rocketModel.position.x += 0.03; // Volar lentamente hacia la derecha
        this.rocketModel.position.y += Math.sin(this.playerTime * 0.5) * 0.01; // Ligero bamboleo
        
        // Si sale de la pantalla, reiniciar a la izquierda
        if (this.rocketModel.position.x > 40) {
           this.rocketModel.position.x = -60;
           this.rocketModel.position.y = 12 + (Math.random() * 4 - 2); // Variar altura al reaparecer
        }
      }
      
      // Increase speed slightly
      this.speed += 0.00005;
    } else {
      // Girar la moneda de READY cuando el juego no ha empezado aún
      if(this.readyCoin) {
         this.readyCoin.children[0].rotation.y += 0.05;
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  const runner = new LisarRunner('runner-game-container');
  const btn = document.getElementById('start-game-btn');
  if(btn) {
    btn.addEventListener('click', () => runner.startGame());
  }
});
