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
    this.collectedCoins = [];
    
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
      
      // Deslizar horizontal para mover
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
         if (dx > 0) this.moveRight();
         else this.moveLeft();
      }
      // Tap para saltar
      else if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
         this.jump();
      }
    }, {passive: true});

    this.animate();
  }
  
  initUI() {
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.top = '20px';
    this.uiContainer.style.left = '20px';
    this.uiContainer.style.right = '20px';
    this.uiContainer.style.display = 'none';
    this.uiContainer.style.justifyContent = 'space-between';
    this.uiContainer.style.zIndex = '100';
    this.uiContainer.style.pointerEvents = 'none';
    
    this.scoreEl = document.createElement('div');
    this.scoreEl.style.display = 'flex';
    this.scoreEl.style.alignItems = 'center';
    this.scoreEl.style.fontFamily = "'Orbitron', sans-serif";
    this.scoreEl.style.fontSize = '22px';
    this.scoreEl.style.fontWeight = 'bold';
    this.totalCoins = this.totalCoins || 0;
    
    this.energyContainer = document.createElement('div');
    this.energyContainer.style.display = 'flex';
    this.energyContainer.style.gap = '6px';
    
    this.pauseBtn = document.createElement('div');
    this.pauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    this.pauseBtn.style.fontSize = '24px';
    this.pauseBtn.style.color = '#fff';
    this.pauseBtn.style.background = 'rgba(0, 0, 0, 0.4)';
    this.pauseBtn.style.border = '1px solid rgba(255, 136, 0, 0.5)';
    this.pauseBtn.style.backdropFilter = 'blur(10px)';
    this.pauseBtn.style.width = '45px';
    this.pauseBtn.style.height = '45px';
    this.pauseBtn.style.display = 'flex';
    this.pauseBtn.style.alignItems = 'center';
    this.pauseBtn.style.justifyContent = 'center';
    this.pauseBtn.style.borderRadius = '12px';
    this.pauseBtn.style.boxShadow = '0 0 15px rgba(255, 136, 0, 0.3)';
    this.pauseBtn.style.cursor = 'pointer';
    this.pauseBtn.style.pointerEvents = 'auto';
    this.pauseBtn.style.transition = 'all 0.3s ease';
    
    this.pauseBtn.addEventListener('mouseenter', () => {
        this.pauseBtn.style.transform = 'scale(1.1)';
        this.pauseBtn.style.background = 'rgba(255, 136, 0, 0.2)';
        this.pauseBtn.style.boxShadow = '0 0 20px rgba(255, 136, 0, 0.6)';
    });
    
    this.pauseBtn.addEventListener('mouseleave', () => {
        this.pauseBtn.style.transform = 'scale(1)';
        this.pauseBtn.style.background = 'rgba(0, 0, 0, 0.4)';
        this.pauseBtn.style.boxShadow = '0 0 15px rgba(255, 136, 0, 0.3)';
    });
    
    this.pauseBtn.addEventListener('click', () => this.togglePause());

    const rightBar = document.createElement('div');
    rightBar.style.display = 'flex';
    rightBar.style.alignItems = 'center';
    rightBar.appendChild(this.pauseBtn);

    const leftBar = document.createElement('div');
    leftBar.style.display = 'flex';
    leftBar.style.flexDirection = 'column';
    leftBar.style.alignItems = 'flex-start';
    
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.alignItems = 'center';
    topRow.style.gap = '20px';
    topRow.appendChild(this.energyContainer);
    topRow.appendChild(this.scoreEl);
    
    // Progress Bar (Song Meta)
    this.progressContainer = document.createElement('div');
    this.progressContainer.style.width = '200px';
    this.progressContainer.style.height = '12px';
    this.progressContainer.style.background = 'rgba(0,0,0,0.6)';
    this.progressContainer.style.border = '2px solid #a200ff';
    this.progressContainer.style.borderRadius = '6px';
    this.progressContainer.style.marginTop = '25px';
    this.progressContainer.style.position = 'relative';
    this.progressContainer.style.boxShadow = '0 0 8px #a200ff';
    this.progressContainer.style.pointerEvents = 'auto'; // Si el usuario quiere verla
    
    this.progressBar = document.createElement('div');
    this.progressBar.style.height = '100%';
    this.progressBar.style.width = '0%';
    this.progressBar.style.background = '#a200ff'; 
    this.progressBar.style.boxShadow = '0 0 10px #a200ff, 0 0 20px #a200ff';
    this.progressBar.style.borderRadius = '3px';
    
    this.progressIcon = document.createElement('div');
    this.progressIcon.style.position = 'absolute';
    this.progressIcon.style.top = '-12px';
    this.progressIcon.style.left = '0%';
    this.progressIcon.style.transform = 'translateX(-50%)';
    this.progressIcon.style.width = '26px';
    this.progressIcon.style.height = '26px';
    this.progressIcon.style.borderRadius = '50%';
    this.progressIcon.style.background = "url('assets/img/wukong_face.png') center/cover";
    this.progressIcon.style.border = '2px solid #ff8800';
    this.progressIcon.style.boxShadow = '0 0 10px #ff8800';
    this.progressIcon.style.transition = 'left 0.2s linear';
    
    this.progressContainer.appendChild(this.progressBar);
    this.progressContainer.appendChild(this.progressIcon);
    
    leftBar.appendChild(topRow);
    leftBar.appendChild(this.progressContainer);

    this.uiContainer.appendChild(leftBar);
    this.uiContainer.appendChild(rightBar);
    
    this.updateScoreDisplay();
    this.updateLivesDisplay();
    this.container.appendChild(this.uiContainer);

    this.watermarkEl = document.createElement('a');
    this.watermarkEl.href = 'https://www.lisarstudio.cl';
    this.watermarkEl.target = '_blank';
    this.watermarkEl.innerText = 'www.LisarStudio.cl';
    this.watermarkEl.style.position = 'absolute';
    this.watermarkEl.style.bottom = '20px';
    this.watermarkEl.style.left = '50%';
    this.watermarkEl.style.transform = 'translateX(-50%)';
    this.watermarkEl.style.color = 'rgba(255, 255, 255, 0.7)';
    this.watermarkEl.style.fontFamily = "'Orbitron', sans-serif";
    this.watermarkEl.style.fontSize = '14px';
    this.watermarkEl.style.fontWeight = 'bold';
    this.watermarkEl.style.letterSpacing = '3px';
    this.watermarkEl.style.textDecoration = 'none';
    this.watermarkEl.style.textShadow = '0 0 10px rgba(0, 243, 255, 0.8)';
    this.watermarkEl.style.opacity = '0';
    this.watermarkEl.style.transition = 'opacity 2s ease-in-out';
    this.watermarkEl.style.zIndex = '100';
    this.watermarkEl.style.pointerEvents = 'auto';
    this.container.appendChild(this.watermarkEl);

    this.msgEl = document.createElement('div');
    this.msgEl.style.position = 'absolute';
    this.msgEl.style.top = '50%';
    this.msgEl.style.left = '50%';
    this.msgEl.style.transform = 'translate(-50%, -50%)';
    this.msgEl.style.color = '#ff8800';
    this.msgEl.style.fontFamily = "'Orbitron', sans-serif";
    this.msgEl.style.fontSize = '60px';
    this.msgEl.style.fontWeight = '900';
    this.msgEl.style.textShadow = '0 0 20px #ff8800, 0 0 40px #ff8800';
    this.msgEl.style.display = 'none';
    this.msgEl.style.zIndex = '100';
    this.container.appendChild(this.msgEl);
    
    // Inject custom CSS for animations if not exists
    if (!document.getElementById('lisar-game-styles')) {
       const style = document.createElement('style');
       style.id = 'lisar-game-styles';
       style.innerHTML = `
         @keyframes rotateNeon {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
         }
         .neon-bubble {
           position: absolute;
           overflow: hidden;
           border-radius: 20px;
           background: rgba(0, 0, 0, 0.7);
           padding: 20px 30px;
           color: #fff;
           font-family: 'Orbitron', sans-serif;
           font-size: 16px;
           text-align: center;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           z-index: 100;
           pointer-events: none;
           opacity: 0;
           transition: opacity 0.5s ease-in-out;
         }
         .neon-bubble::before {
           content: "";
           position: absolute;
           top: -50%; left: -50%;
           width: 200%; height: 200%;
           background: conic-gradient(transparent, transparent, transparent, #ff8800);
           animation: rotateNeon 2s linear infinite;
           z-index: -2;
         }
         .neon-bubble::after {
           content: "";
           position: absolute;
           inset: 3px;
           background: rgba(0,0,0,0.85);
           border-radius: 17px;
           z-index: -1;
         }
         .neon-bubble-content {
           position: relative;
           z-index: 1;
         }
         .neon-box {
            position: relative;
            overflow: hidden;
            border-radius: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            font-family: 'Orbitron', sans-serif;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            margin: 0 auto;
            width: 100%;
          }
          .neon-box::before {
            content: "";
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: conic-gradient(transparent, transparent, transparent, #ff8800);
            animation: rotateNeon 2s linear infinite;
            z-index: -2;
          }
          .neon-box::after {
            content: "";
            position: absolute;
            inset: 3px;
            background: rgba(0,0,0,0.85);
            border-radius: 17px;
            z-index: -1;
          }
          .neon-box-content {
            position: relative;
            z-index: 1;
            width: 100%;
          }
         
         @keyframes readyZoomIn {
           0% { transform: scale(0.2); opacity: 0; }
           80% { transform: scale(1.1); opacity: 1; }
           100% { transform: scale(1); opacity: 1; }
         }
         
         @keyframes shoot1 { to { transform: translate(-300px, -200px) rotate(-45deg); opacity: 0; } }
         @keyframes shoot2 { to { transform: translate(-150px, 300px) rotate(20deg); opacity: 0; } }
         @keyframes shoot3 { to { transform: translate(50px, -350px) rotate(-10deg); opacity: 0; } }
         @keyframes shoot4 { to { transform: translate(150px, 250px) rotate(60deg); opacity: 0; } }
         @keyframes shoot5 { to { transform: translate(300px, -150px) rotate(-30deg); opacity: 0; } }
         @keyframes shoot6 { to { transform: translate(250px, 300px) rotate(90deg); opacity: 0; } }
         
         .ready-futuristic {
           font-size: clamp(25px, 6vw, 45px);
           font-weight: 900;
           color: #ffffff;
           text-shadow: 0 0 20px #ff8800, 0 0 40px #ff8800;
           animation: readyZoomIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
           letter-spacing: 5px;
           text-align: center;
           display: flex;
           justify-content: center;
         }
         .ready-futuristic span {
           display: inline-block;
           opacity: 1;
         }
         .ready-futuristic span:nth-child(1) { animation: shoot1 0.4s 1.0s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
         .ready-futuristic span:nth-child(2) { animation: shoot2 0.4s 1.0s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
         .ready-futuristic span:nth-child(3) { animation: shoot3 0.4s 1.0s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
         .ready-futuristic span:nth-child(4) { animation: shoot4 0.4s 1.0s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
         .ready-futuristic span:nth-child(5) { animation: shoot5 0.4s 1.0s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
         .ready-futuristic span:nth-child(6) { animation: shoot6 0.4s 1.0s forwards cubic-bezier(0.6, -0.28, 0.735, 0.045); }
       `;
       document.head.appendChild(style);
    }

    this.controlsBubbleEl = document.createElement('div');
    this.controlsBubbleEl.className = 'neon-bubble';
    this.controlsBubbleEl.style.top = '50%';
    this.controlsBubbleEl.style.left = '50%';
    this.controlsBubbleEl.style.transform = 'translate(-50%, -50%)';
    this.controlsBubbleEl.style.display = 'none';
    this.container.appendChild(this.controlsBubbleEl);
  }

  updateLivesDisplay() {
    if(this.energyContainer) {
      this.energyContainer.innerHTML = '';
      for(let i=0; i<3; i++) {
        const bar = document.createElement('div');
        bar.style.width = '30px';
        bar.style.height = '14px';
        bar.style.transform = 'skewX(-25deg)';
        bar.style.transition = 'all 0.3s';
        if (i < this.lives) {
           bar.style.background = '#ff8800';
           bar.style.boxShadow = '0 0 10px #ff8800';
           bar.style.border = '1px solid #ffaa00';
        } else {
           bar.style.background = 'transparent';
           bar.style.boxShadow = 'inset 0 0 8px #ff0055';
           bar.style.border = '1px solid #ff0055';
        }
        this.energyContainer.appendChild(bar);
      }
    }
  }

  updateScoreDisplay() {
    if(this.scoreEl) {
      this.scoreEl.innerHTML = `
        <div style="width:24px; height:24px; border-radius:50%; background:#ff8800; border:2px solid #ffd700; box-shadow:0 0 5px #ff8800; margin-right:8px; background-image:url('assets/img/logo-lisar-studio.png'); background-size:cover;"></div>
        <span style="font-size:18px; margin-right:5px; color:#fff;">✖</span> 
        <span style="color:#ffb703;">${this.totalCoins || 0}</span>
      `;
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
    this.player.visible = false;
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
        
        this.player.visible = false;
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
      color: 0xff8800, 
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
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'p', 'P', 'Escape'];
    
    // Solo bloqueamos el comportamiento por defecto si el juego está activo o en intro
    if (this.isPlaying || this.isIntro || this.isShowingInstructions) {
       if (gameKeys.includes(e.key)) {
           e.preventDefault();
       }
    }
    
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
       this.pauseBtn.innerHTML = '<i class="bi bi-play-circle-fill" style="filter: drop-shadow(0 0 5px #ff8800);"></i>';
       this.msgEl.style.fontSize = '40px';
       this.msgEl.innerHTML = "PAUSA";
       this.msgEl.style.display = 'block';
    } else {
       this.bgMusic.play();
       this.pauseBtn.innerHTML = '<i class="bi bi-pause-circle-fill" style="filter: drop-shadow(0 0 5px #ff8800);"></i>';
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
  
  createBillboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 36px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('@lisarstudiooficial', canvas.width/2, canvas.height/2);
    return new THREE.CanvasTexture(canvas);
  }
  
  spawnBillboard() {
    if(!this.billboardTexture) {
       this.billboardTexture = this.createBillboardTexture();
       this.billboardMat = new THREE.SpriteMaterial({ map: this.billboardTexture, color: 0xffffff, transparent: true, opacity: 0.25 });
    }
    const sprite = new THREE.Sprite(this.billboardMat);
    sprite.scale.set(40, 10, 1);
    const side = Math.random() > 0.5 ? 1 : -1;
    sprite.position.set(side * 22, 4, -120); 
    this.scene.add(sprite);
    if(!this.billboards) this.billboards = [];
    this.billboards.push(sprite);
  }

  spawnCoin(count = 1) {
    let lane;
    let attempts = 0;
    do {
       lane = Math.floor(Math.random() * 3);
       attempts++;
       // Avoid overlapping with obstacles near spawn point
       let conflict = this.obstacles.some(obs => 
           Math.abs(obs.position.x - this.lanes[lane]) < 0.1 &&
           obs.position.z < -20
       );
       if (!conflict) break;
    } while(attempts < 10);
    
    for(let i=0; i<count; i++) {
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
        
        coinGroup.position.set(this.lanes[lane], 1, -40 - (i * 3.5));
        this.scene.add(coinGroup);
        this.coins.push(coinGroup);
    }
  }
  
  initAudio() {
    if (!this.audioInitialized) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaElementSource(this.bgMusic);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
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

  playCoinSound() {
    if(!this.audioContext || this.audioContext.state !== 'running') return;
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Frecuencia por defecto (C6) si no hay audio analizable
    let freq = 1046.50; 
    
    // Armonización dinámica leyendo el espectro FFT en tiempo real
    if (this.analyser && this.dataArray) {
       this.analyser.getByteFrequencyData(this.dataArray);
       
       let maxVal = 0;
       let maxIndex = 10;
       
       for (let i = 10; i < this.dataArray.length; i++) {
           if (this.dataArray[i] > maxVal) {
               maxVal = this.dataArray[i];
               maxIndex = i;
           }
       }
       
       const nyquist = this.audioContext.sampleRate / 2;
       const binSize = nyquist / (this.analyser.fftSize / 2);
       let fundamentalFreq = maxIndex * binSize;
       
       if (fundamentalFreq > 0) {
           freq = fundamentalFreq;
           while(freq < 800) { freq *= 2; }
           while(freq > 2400) { freq /= 2; }
           
           // Alinear a nota musical estándar (Escala cromática basada en A4 = 440Hz)
           const semitonesFromA4 = Math.round(12 * Math.log2(freq / 440));
           freq = 440 * Math.pow(2, semitonesFromA4 / 12);
       }
    }
    
    osc.type = 'triangle'; // Un sonido tipo campana/sintetizador más suave
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime); // Volumen suave
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  startGame() {
    const overlay = document.getElementById('game-overlay');
    if(overlay) overlay.style.display = 'none';
    
    this.initAudio();
    if(this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.uiContainer.style.display = 'flex';
    if(this.watermarkEl) this.watermarkEl.style.opacity = '0';
    this.lives = 3;
    this.totalCoins = 0;
    this.updateScoreDisplay();
    this.updateLivesDisplay();
    
    // Clear old
    this.obstacles.forEach(o => this.scene.remove(o));
    this.coins.forEach(c => this.scene.remove(c));
    this.collectedCoins.forEach(c => this.scene.remove(c));
    this.obstacles = [];
    this.coins = [];
    this.collectedCoins = [];
    
    this.speed = 0.12;
    this.currentLane = 1;
    this.isPlaying = false; // No mover nada aún
    this.isIntro = false; // Empezará luego de las instrucciones
    this.introProgress = 0;
    this.isShowingInstructions = true;
    
    if(this.player) {
        this.player.visible = false; // Permanece invisible mientras se leen las instrucciones
        this.player.position.set(this.lanes[this.currentLane], 0, 50); // Empieza lejos
    }
    
    // Posición inicial de cámara para Intro (De frente, mirando al horizonte donde viene el personaje)
    this.camera.position.set(0, 1.0, -15);
    this.camera.lookAt(0, 2.0, 50);
    
    // Primero mostrar las instrucciones
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    this.controlsBubbleEl.innerHTML = `<div class="neon-bubble-content">` + 
       (isMobile 
       ? '👆 Desliza a los lados para moverte<br><br>👆 Toca la pantalla para saltar'
       : '⌨️ Flechas / A-D moverte<br><br>⌨️ Espacio saltar<br><br>⌨️ P para pausar') +
       `</div>`;
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
    
    if(this.player) {
        this.player.visible = true; // Ahora sí aparece y viene corriendo
    }
    
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
        
        // Mostrar "READY!" superpuesto con animación futurista
        this.msgEl.style.fontSize = '60px';
        this.msgEl.innerHTML = `<div class="ready-futuristic">
            <span>R</span><span>E</span><span>A</span><span>D</span><span>Y</span><span>!</span>
        </div>`;
        this.msgEl.style.display = 'block';
        this.speak("Ready!");
        
        // Agregar la moneda 3D exactamente al centro como fondo del READY
        if (this.coinModel) {
            this.readyCoin = this.coinModel.clone();
            this.readyCoin.scale.setScalar(0.9);
            this.readyCoin.position.set(0, 0, -2.5); // Exactamente al centro de la cámara
            this.camera.add(this.readyCoin);
            this.scene.add(this.camera); 
        }
        
        setTimeout(() => {
           this.msgEl.style.display = 'none';
           this.msgEl.innerHTML = ''; // reset
           
           if(this.readyCoin) {
               this.camera.remove(this.readyCoin);
               this.readyCoin = null;
           }
           
           this.beginGame();
           
           // Show Promo Message
           setTimeout(() => {
               this.msgEl.style.fontSize = '24px';
               this.msgEl.style.width = '80%';
               this.msgEl.style.textAlign = 'center';
               this.msgEl.innerHTML = `
                   <div class="neon-box" style="animation: scaleIn 0.3s ease-out; margin-top: 50px;">
                       <div class="neon-box-content" style="padding: 15px; font-size: 14px; line-height: 1.3;">
                           <span style="color: #ff8800; font-weight: bold;">Misión:</span> Consigue 100 Lisar Coins y gana un <br><span style="color: #00ff00;">30% de descuento</span> en tu primer servicio.
                           <div style="font-size: 10px; color: #ffffff; margin-top: 8px; opacity: 0.8; letter-spacing: 1px;">www.LisarStudio.cl</div>
                       </div>
                   </div>
               `;
               this.msgEl.style.display = 'block';
               
               setTimeout(() => {
                   this.msgEl.style.display = 'none';
                   this.msgEl.innerHTML = '';
                   this.isPromoActive = false;
               }, 6000);
           }, 500);
           
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
    this.isPromoActive = true;
    this.msgEl.style.fontSize = '50px'; // reset font size
    
    // Play music
    this.bgMusic.currentTime = 0;
    this.bgMusic.play().catch(e => console.log("Music play blocked by browser:", e));
  }

  levelComplete() {
    this.isPlaying = false;
    this.isLevelCompleteAnim = true;
    
    // Smooth volume fade out for music
    let fadeOut = setInterval(() => {
      if (this.bgMusic.volume > 0.05) {
        this.bgMusic.volume -= 0.05;
      } else {
        clearInterval(fadeOut);
        this.bgMusic.pause();
        this.bgMusic.volume = 0.5;
      }
    }, 100);
  }

  showLevelCompleteUI() {
    this.isLevelCompleteAnim = false;
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
  
  showDiscountModal() {
    this.isPaused = true;
    if (this.bgMusic) this.bgMusic.pause();
    const overlay = document.getElementById('game-overlay');
    if(overlay) {
      overlay.style.display = 'flex';
      if (window.triggerPromoChatbot) {
         window.triggerPromoChatbot();
      }
      overlay.innerHTML = `
        <div class="neon-box" style="width: 85%; max-width: 300px; margin-top: 50px; animation: scaleIn 0.3s ease-out;">
            <div class="neon-box-content" style="padding: 15px;">
                <h3 class="text-success mb-1" style="font-size: 20px; letter-spacing: 1px; color: #00ff00 !important; font-weight: bold;">¡Felicidades Crack!</h3>
                <p class="text-white mb-2" style="font-size: 13px; line-height: 1.3;">
                   Has conseguido 100 Lisar Coins.<br><br>
                   <span style="color: #00f3ff; font-size: 14px; font-weight: bold;">Sácale una captura a esta pantalla</span><br>
                   y muéstrala en tu primera compra para reclamar tu <strong style="color: #ff8800; font-size: 14px;">30% de Descuento</strong>.
                </p>
                <img src="assets/img/lisar-studio-logo-white.webp" alt="Lisar Studio" style="max-height: 30px; margin-bottom: 10px; filter: drop-shadow(0 0 10px #00f3ff);">
                <button id="continue-game-btn" class="btn btn-gold-primary" style="width: 100%; font-size: 14px; padding: 6px;"><i class="bi bi-play-fill"></i> Continuar Jugando</button>
                <div style="font-size: 10px; color: #ffffff; margin-top: 10px; opacity: 0.8; letter-spacing: 1px;">www.LisarStudio.cl</div>
            </div>
        </div>
      `;
      document.getElementById('continue-game-btn').addEventListener('click', () => {
        overlay.style.display = 'none';
        this.isPaused = false;
        if (this.bgMusic) this.bgMusic.play();
      });
    }
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
      // Cámara: ease-in-out para un viaje suave
      const easeCam = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      
      // Personaje: ease-out para que entre rápido y frene suavemente
      const easePlayer = 1 - Math.pow(1 - p, 3);
      
      if (this.player) {
         this.player.position.z = 50 * (1 - easePlayer);
      }
      
      const startX = 0; const startY = 1.0; const startZ = -15; // Frente al personaje
      const endX = 0; const endY = 4.5; const endZ = 7.0; // Detrás del personaje (gameplay)
      
      // La cámara hace un medio círculo (arco) hacia la derecha
      const currentX = Math.sin(easeCam * Math.PI) * 15; 
      const currentY = startY + (endY - startY) * easeCam;
      const currentZ = startZ + (endZ - startZ) * easeCam;
      
      this.camera.position.set(currentX, currentY, currentZ);
      
      if (this.player) {
          // La cámara mira al personaje, y al final mira hacia el horizonte
          const lookZ = this.player.position.z - (easeCam * 10);
          this.camera.lookAt(this.player.position.x, this.player.position.y + 2, lookZ);
      } else {
          this.camera.lookAt(0, 2, -10);
      }
    }
    
    if (this.readyCoin) {
        this.readyCoin.rotation.y += 0.15; // Girar la moneda del READY
    }
    
    if (this.isLevelCompleteAnim && !this.isPaused && this.player) {
       // El personaje corre hacia el horizonte
       this.player.position.z -= this.speed * 2.0;
       
       // Sigue simulando el rebote de carrera
       let baseY = this.player.geometry ? 0.5 : 0;
       this.playerTime += 0.1;
       this.player.position.y = baseY + Math.abs(Math.sin(this.playerTime * 1.5)) * 0.25;
       
       if (this.player.position.z < -25) {
           this.showLevelCompleteUI();
       }
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
      let coinSpawned = false;
      
      if(this.analyser && this.isPlaying && !this.isPromoActive) {
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Analizar bajos para Obstáculos (bins 0 a 4)
        let bassSum = 0;
        for(let j = 0; j < 4; j++){ bassSum += this.dataArray[j]; }
        const avgBass = bassSum / 4;
        
        // Analizar notas medias/altas para Monedas (bins 15 a 35)
        let midSum = 0;
        const midCount = 20;
        for(let j = 15; j < 15 + midCount; j++){ midSum += this.dataArray[j]; }
        const avgMid = midSum / midCount;
        
        const now = performance.now();
        
        // Generar Obstáculo si el Bajo golpea muy fuerte
        let isMobile = window.innerWidth <= 768;
        let cooldown = isMobile ? 800 : 500;
        
        if (bassSum > 850 && (now - (this.lastBeatTime || 0) > cooldown)) {
           this.lastBeatTime = now;
           this.spawnObstacle();
           obstacleSpawned = true;
        }
        
        // Generar Monedas al compás de las melodías fuertes/cajas
        if (avgMid > 110 && (now - (this.lastCoinBeatTime || 0) > 400)) {
           this.lastCoinBeatTime = now;
           this.spawnCoin(Math.floor(Math.random() * 2) + 1);
           coinSpawned = true;
        }
      }
      
      // Fallback mínimo para que nunca haya silencios totales
      if(!this.isPromoActive) {
          if(!obstacleSpawned && Math.random() < 0.002) {
            this.spawnObstacle();
          }
          if(!coinSpawned && Math.random() < 0.010) {
            this.spawnCoin(Math.floor(Math.random() * 2) + 2);
          }
      }
      
      if(this.isPlaying && !this.isLevelCompleteAnim && Math.random() < 0.001) { 
         if(!this.billboards) this.billboards = [];
         if(this.billboards.length < 2) {
             this.spawnBillboard();
         }
      }
      
      if(this.billboards) {
          for(let i = this.billboards.length - 1; i >= 0; i--) {
              let b = this.billboards[i];
              b.position.z += this.speed; 
              if(b.position.z > 20) {
                  this.scene.remove(b);
                  this.billboards.splice(i, 1);
              }
          }
      }
      
      // Song Progress, Meta, and Dynamic Intensity
      if (this.bgMusic && this.bgMusic.duration > 0 && Number.isFinite(this.bgMusic.duration)) {
         let pct = (this.bgMusic.currentTime / this.bgMusic.duration) * 100;
         if(this.progressBar) this.progressBar.style.width = `${pct}%`;
         if(this.progressIcon) this.progressIcon.style.left = `${pct}%`;
         
         // Incrementar velocidad sutilmente a medida que avanza la canción
         this.speed = 0.12 + (pct / 100) * 0.15; 
         
         // Cambiar el color de la luz principal de Naranja a Magenta Neón para dar sensación de clímax
         if(this.dirLight) {
            let r = 255;
            let g = Math.max(0, 136 - (136 * (pct / 100)));
            let b = Math.min(255, 0 + (255 * (pct / 100)));
            this.dirLight.color.setRGB(r/255, g/255, b/255);
         }
         
         // Llegada a la meta al finalizar la canción
         if (pct >= 99.5 && !this.isLevelCompleteAnim) {
             this.levelComplete();
         }
      }
      
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
          
          this.totalCoins++;
          this.updateScoreDisplay();
          this.playCoinSound();
          
          // Recompensas
          if (this.totalCoins % 50 === 0 && this.totalCoins > 0) {
            if(this.lives < 3) this.lives++;
            this.updateLivesDisplay();
            this.showMessage("¡Vida Recuperada! 💚");
          }
          
          if (this.totalCoins === 100) {
             this.showDiscountModal();
          }
          
          // Mover a arreglo de desintegración
          this.collectedCoins.push(coin);
          this.coins.splice(i, 1);

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
      
      // Animación de desintegración futurista para monedas recolectadas
      for (let i = this.collectedCoins.length - 1; i >= 0; i--) {
         let c = this.collectedCoins[i];
         c.scale.multiplyScalar(0.95); // Encogerse mucho más lento (antes 0.85)
         c.position.y += 0.05; // Subir volando mucho más lento (antes 0.2)
         c.rotation.y += 0.2; // Girar 
         c.rotation.x += 0.1;
         if (c.scale.x < 0.05) {
             this.scene.remove(c);
             this.collectedCoins.splice(i, 1);
         }
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
