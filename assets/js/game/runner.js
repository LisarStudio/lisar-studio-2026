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
    
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 3, 7);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
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
    
    // Player
    this.player = null;
    // Load Logo Texture
    this.textureLoader = new THREE.TextureLoader();
    this.logoTexture = this.textureLoader.load('assets/img/lisar-studio-logo-white.webp');
    
    this.initPlayer();
    
    // Floor
    this.initFloor();
    
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
    this.scoreEl = document.createElement('div');
    this.scoreEl.style.position = 'absolute';
    this.scoreEl.style.top = '10px';
    this.scoreEl.style.left = '10px';
    this.scoreEl.style.color = '#ffb703';
    this.scoreEl.style.fontFamily = 'monospace';
    this.scoreEl.style.fontSize = '20px';
    this.scoreEl.style.fontWeight = 'bold';
    this.scoreEl.style.zIndex = '100';
    this.scoreEl.innerText = 'SCORE: 0';
    this.scoreEl.style.display = 'none';
    this.container.appendChild(this.scoreEl);
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
        this.model.scale.set(0.7, 0.7, 0.7); // Escala para GLB
        this.model.rotation.y = Math.PI; // Face forward
        
        // Ensure materials display correctly (fix Blender default metalness)
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if(child.material) {
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
    }
  }
  
  initFloor() {
    const geo = new THREE.PlaneGeometry(20, 100, 10, 50);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x111111, 
      wireframe: true 
    });
    this.floor = new THREE.Mesh(geo, mat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.z = -30;
    this.scene.add(this.floor);
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
    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const obs = new THREE.Mesh(geo, mat);
    const lane = Math.floor(Math.random() * 3);
    obs.position.set(this.lanes[lane], 0.75, -40);
    this.scene.add(obs);
    this.obstacles.push(obs);
  }
  
  spawnCoin() {
    // Moneda con Logo Lisar 3D
    const geo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
    
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xffb703, emissiveIntensity: 0.3 });
    const faceMat = new THREE.MeshStandardMaterial({ 
      map: this.logoTexture,
      emissive: 0xffffff,
      emissiveMap: this.logoTexture,
      emissiveIntensity: 0.5,
      transparent: true
    });
    
    // El orden de materiales en CylinderGeometry es [lateral, arriba, abajo]
    const coinMesh = new THREE.Mesh(geo, [edgeMat, faceMat, faceMat]);
    coinMesh.rotation.x = Math.PI / 2; // Hacer que mire hacia la camara
    
    const coinGroup = new THREE.Group();
    coinGroup.add(coinMesh);
    
    const lane = Math.floor(Math.random() * 3);
    coinGroup.position.set(this.lanes[lane], 1, -40);
    this.scene.add(coinGroup);
    this.coins.push(coinGroup);
  }
  
  startGame() {
    const overlay = document.getElementById('game-overlay');
    if(overlay) overlay.style.display = 'none';
    
    this.scoreEl.style.display = 'block';
    
    // Clear old
    this.obstacles.forEach(o => this.scene.remove(o));
    this.coins.forEach(c => this.scene.remove(c));
    this.obstacles = [];
    this.coins = [];
    
    this.score = 0;
    this.speed = 0.12; // Velocidad reducida
    this.currentLane = 1;
    this.isPlaying = true;
    
    // Play music
    this.bgMusic.currentTime = 0;
    this.bgMusic.play().catch(e => console.log("Music play blocked by browser:", e));
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
      
      // Spawn logic
      if(Math.random() < 0.02) this.spawnObstacle();
      if(Math.random() < 0.03) this.spawnCoin();
      
      // Update obstacles
      for(let i = this.obstacles.length - 1; i >= 0; i--) {
        let obs = this.obstacles[i];
        obs.position.z += this.speed;
        
        // Collision (simple AABB distance check)
        if(this.player && Math.abs(obs.position.z - this.player.position.z) < 1.5 && Math.abs(obs.position.x - this.player.position.x) < 1.0) {
          if (this.player.position.y < 1.5) {
            this.gameOver();
          }
        }
        
        if(obs.position.z > 10) {
          this.scene.remove(obs);
          this.obstacles.splice(i, 1);
          this.score += 10; // points for dodging
          this.scoreEl.innerText = 'SCORE: ' + this.score;
        }
      }
      
      // Update coins
      for(let i = this.coins.length - 1; i >= 0; i--) {
        let coin = this.coins[i];
        coin.position.z += this.speed;
        coin.rotation.y += 0.05;
        
        if(this.player && Math.abs(coin.position.z - this.player.position.z) < 1.5 && Math.abs(coin.position.x - this.player.position.x) < 1.0) {
          this.scene.remove(coin);
          this.coins.splice(i, 1);
          this.score += 50; // points for coin
          this.scoreEl.innerText = 'SCORE: ' + this.score;
        } else if(coin.position.z > 10) {
          this.scene.remove(coin);
          this.coins.splice(i, 1);
        }
      }
      
      // Increase speed slightly
      this.speed += 0.0001;
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
