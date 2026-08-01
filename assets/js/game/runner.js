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
    this.camera.position.set(0, 4.5, 7.0); // Cámara más atrás y más alta
    this.camera.lookAt(0, 2.0, -10); // Mirar más hacia arriba para empujar al personaje al borde inferior
    
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
    this.gravity = -0.010; // Gravedad más flotante
    this.jumpForce = 0.22; // Salto agradable y duradero
    
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
    this.isPaused = false;
    
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
      if(!this.isPlaying || this.isPaused) return;
      let touchEndX = e.changedTouches[0].screenX;
      let touchEndY = e.changedTouches[0].screenY;
      
      let dx = touchEndX - touchStartX;
      let dy = touchStartY - touchEndY; // positivo = arriba
      
      // Deslizar arriba para saltar
      if (dy > 30) {
        this.jump();
      } 
      // Tap en los lados para mover
      else if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        if (touchEndX < this.width / 2) this.moveLeft();
        else this.moveRight();
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
    this.scoreEl.style.fontFamily = "'Orbitron', sans-serif";
    this.scoreEl.style.fontSize = '22px';
    this.scoreEl.style.fontWeight = 'bold';
    this.scoreEl.innerText = 'MONEDAS: 0';
    
    this.livesEl = document.createElement('div');
    this.livesEl.style.color = '#ff0055';
    this.livesEl.style.fontFamily = "'Orbitron', sans-serif";
    this.livesEl.style.fontSize = '20px';
    this.livesEl.style.fontWeight = 'bold';
    this.updateLivesDisplay();
    
    this.pauseBtn = document.createElement('div');
    this.pauseBtn.innerText = '⏸️';
    this.pauseBtn.style.fontSize = '24px';
    this.pauseBtn.style.cursor = 'pointer';
    this.pauseBtn.style.pointerEvents = 'auto';
    this.pauseBtn.style.marginLeft = '20px';
    this.pauseBtn.addEventListener('click', () => this.togglePause());

    const rightBar = document.createElement('div');
    rightBar.style.display = 'flex';
    rightBar.style.alignItems = 'center';
    rightBar.appendChild(this.livesEl);
    rightBar.appendChild(this.pauseBtn);

    this.uiContainer.appendChild(this.scoreEl);
    this.uiContainer.appendChild(rightBar);
    this.container.appendChild(this.uiContainer);

    this.msgEl = document.createElement('div');
    this.msgEl.style.position = 'absolute';
    this.msgEl.style.top = '40%';
    this.msgEl.style.left = '50%';
    this.msgEl.style.transform = 'translate(-50%, -50%)';
    this.msgEl.style.color = '#00ffff';
    this.msgEl.style.fontFamily = "'Orbitron', sans-serif";
    this.msgEl.style.fontSize = '60px';
    this.msgEl.style.fontWeight = '900';
    this.msgEl.style.textShadow = '0 0 20px #00ffff, 0 0 40px #00ffff';
    this.msgEl.style.display = 'none';
    this.msgEl.style.zIndex = '100';
    this.container.appendChild(this.msgEl);
    
    this.controlsBubbleEl = document.createElement('div');
    this.controlsBubbleEl.style.position = 'absolute';
    this.controlsBubbleEl.style.top = '25%';
    this.controlsBubbleEl.style.left = '50%';
    this.controlsBubbleEl.style.transform = 'translate(-50%, -50%)';
    this.controlsBubbleEl.style.background = 'rgba(0, 0, 0, 0.7)';
    this.controlsBubbleEl.style.color = '#fff';
    this.controlsBubbleEl.style.padding = '15px 30px';
    this.controlsBubbleEl.style.borderRadius = '20px';
    this.controlsBubbleEl.style.border = '2px solid #00ffff';
    this.controlsBubbleEl.style.boxShadow = '0 0 15px #00ffff';
    this.controlsBubbleEl.style.fontFamily = "'Orbitron', sans-serif";
    this.controlsBubbleEl.style.fontSize = '16px';
    this.controlsBubbleEl.style.textAlign = 'justify';
    this.controlsBubbleEl.style.display = 'none';
    this.controlsBubbleEl.style.zIndex = '100';
    this.controlsBubbleEl.style.pointerEvents = 'none';
    this.controlsBubbleEl.style.opacity = '0';
    this.controlsBubbleEl.style.transition = 'opacity 0.5s ease-in-out';
    this.container.appendChild(this.controlsBubbleEl);
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
        // Eliminamos la inclinación Z para que vuele totalmente horizontal
        
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
    if(e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
       this.togglePause();
       return;
    }
    if(this.isPaused) return;
    
    if(e.key === 'ArrowLeft' || e.key === 'a') this.moveLeft();
    if(e.key === 'ArrowRight' || e.key === 'd') this.moveRight();
    if(e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.jump();
  }
  
  togglePause() {
    if (!this.isPlaying) return;
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
       this.bgMusic.pause();
       this.pauseBtn.innerText = '▶️';
       this.msgEl.style.fontSize = '40px';
       this.msgEl.innerHTML = "PAUSA";
       this.msgEl.style.display = 'block';
    } else {
       this.bgMusic.play();
       this.pauseBtn.innerText = '⏸️';
       this.msgEl.style.display = 'none';
    }
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
    this.scoreEl.innerText = 'MONEDAS: 0';
    this.lives = 3;
    this.totalCoins = 0;
    this.updateLivesDisplay();
    
    // Clear old
    this.obstacles.forEach(o => this.scene.remove(o));
    this.coins.forEach(c => this.scene.remove(c));
    this.obstacles = [];
    this.coins = [];
    
    this.speed = 0.12;
    this.currentLane = 1;
    this.isPlaying = false; // No mover nada aún
    this.isIntro = false; // Empezará luego de las instrucciones
    this.introProgress = 0;
    this.isShowingInstructions = true;
    
    if(this.player) this.player.position.set(this.lanes[this.currentLane], 0, 20); // Empieza lejos para venir corriendo
    
    // Posición inicial de cámara para Intro
    this.camera.position.set(0, 1.0, -5);
    this.camera.lookAt(0, 1.0, 0);
    
    // Primero mostrar las instrucciones
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    this.controlsBubbleEl.innerHTML = isMobile 
       ? '👆 Toca los lados para moverte<br><br>👆 Desliza arriba para saltar'
       : '⌨️ Flechas / A-D moverte<br><br>⌨️ Espacio saltar<br><br>⌨️ P para pausar';
    this.controlsBubbleEl.style.display = 'block';
    setTimeout(() => { this.controlsBubbleEl.style.opacity = '1'; }, 10);
    
    // Las instrucciones duran 3 segundos en pantalla
    setTimeout(() => {
       this.controlsBubbleEl.style.opacity = '0';
       setTimeout(() => {
          this.controlsBubbleEl.style.display = 'none';
          this.startCountdownAndIntro();
       }, 500);
    }, 3000);
  }
  
  startCountdownAndIntro() {
    this.isShowingInstructions = false;
    if(this.player) this.player.position.z = 0; // Lock en posición base
    
    // Activa la animación de la cámara simultánea al contador
    this.isIntro = true; 
    this.introProgress = 0;
    
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
        
        // Mostrar "READY!" con isotipo (estilo Megaman X6) centrado
        this.msgEl.style.fontSize = '60px';
        this.msgEl.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; animation: pulse 1s infinite alternate;">
                                  <img src="assets/img/lisar-studio-logo-white.webp" style="height: 60px; margin-right: 15px; object-fit: contain; filter: drop-shadow(0 0 10px #ff8800);">
                                  <span style="line-height: 1;">READY!</span>
                                </div>`;
        this.msgEl.style.display = 'block';
        this.speak("Ready!");
        
        setTimeout(() => {
           this.msgEl.style.display = 'none';
           this.msgEl.innerHTML = ''; // reset
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
    this.isIntro = false;
    this.isPlaying = true;
    this.msgEl.style.fontSize = '50px'; // reset font size
    
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
    
    const dt = this.clock.getDelta();
    
    if (!this.isPaused) {
      if(this.mixer) this.mixer.update(dt);
      if(this.rocketMixer) this.rocketMixer.update(dt);
    }
    
    if (this.isIntro && !this.isPaused) {
      this.introProgress += dt / 3.0; // 3 seconds intro
      let p = Math.min(this.introProgress, 1.0);
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      
      const startPos = new THREE.Vector3(0, 1.0, -5);
      const endPos = new THREE.Vector3(0, 4.5, 7.0);
      const startLook = new THREE.Vector3(0, 1.0, 0);
      const endLook = new THREE.Vector3(0, 2.0, -10);
      
      this.camera.position.lerpVectors(startPos, endPos, ease);
      const currentLook = new THREE.Vector3().lerpVectors(startLook, endLook, ease);
      this.camera.lookAt(currentLook);
    }
    
    if (this.isShowingInstructions && !this.isPaused && this.player) {
       // El personaje viene llegando desde atrás hacia su posición
       this.player.position.z += (0 - this.player.position.z) * 0.05;
    }
    
    if(this.isPlaying && !this.isPaused) {
      this.playerTime += 0.1;
      
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
        
        // Collision (simple AABB distance check - más permisivo)
        if(this.player && !obs.hit && Math.abs(obs.position.z - this.player.position.z) < 1.2 && Math.abs(obs.position.x - this.player.position.x) < 0.8) {
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
          this.totalCoins++;
          this.scoreEl.innerText = 'MONEDAS: ' + this.totalCoins;
          
          // Recompensas
          if (this.totalCoins % 50 === 0 && this.totalCoins > 0) {
            if(this.lives < 3) this.lives++;
            this.updateLivesDisplay();
            this.showMessage("¡Vida Recuperada! 💚");
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
