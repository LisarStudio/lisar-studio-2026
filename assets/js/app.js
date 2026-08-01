/**
 * LISAR STUDIO 2026 - INTERACTIVE APPLICATION LOGIC
 * Tema Claro / Oscuro, visor 3D GLB con Three.js nativo,
 * filtros de portafolio y sticky header.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ============================================================
  // 1. THEME SWITCHER (CLARO / OSCURO) & DYNAMIC LOGO
  // ============================================================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const headerLogoImg  = document.getElementById('headerLogoImg');
  const footerLogoImg  = document.getElementById('footerLogoImg');

  const LOGO_WHITE = 'assets/img/lisar-studio-logo-white.webp';
  const LOGO_BLACK = 'assets/img/lisar-studio-logo-scaled.webp';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lisar_theme', theme);
    if (theme === 'light') {
      if (headerLogoImg) headerLogoImg.src = LOGO_BLACK;
      if (footerLogoImg) footerLogoImg.src = LOGO_BLACK;
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
        themeToggleBtn.setAttribute('title', 'Cambiar a Modo Oscuro');
      }
    } else {
      if (headerLogoImg) headerLogoImg.src = LOGO_WHITE;
      if (footerLogoImg) footerLogoImg.src = LOGO_WHITE;
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
        themeToggleBtn.setAttribute('title', 'Cambiar a Modo Claro');
      }
    }
  }

  const savedTheme = localStorage.getItem('lisar_theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ============================================================
  // 2. PORTFOLIO DATA — Proyectos 3D reales con archivos GLB
  // ============================================================
  const portfolioData = [
    // --- 7 MODELOS 3D ---
    {
      id: 1,
      title: "Boss - Personaje",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "https://lisarstudio.github.io/lisar-studio-2026/assets/models/Boss.glb",
      description: "Personaje 3D hiperrealista optimizado para motores de videojuegos con texturizado PBR y rigging completo.",
      tools: ["Blender", "Substance Painter", "Unreal Engine"],
    },
    {
      id: 2,
      title: "Crab - Criatura",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "https://lisarstudio.github.io/lisar-studio-2026/assets/models/crab.glb",
      description: "Modelo orgánico de criatura listo para realidad virtual, con bajo conteo de polígonos y texturas estilizadas.",
      tools: ["Blender", "Maya", "Unity"],
    },
    {
      id: 3,
      title: "Flutter Ship",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "https://lisarstudio.github.io/lisar-studio-2026/assets/models/Flutter.glb",
      description: "Nave voladora para entorno de realidad virtual con mapeo UV de alta fidelidad.",
      tools: ["ZBrush", "Blender 3D"],
    },
    {
      id: 4,
      title: "Casco Elysium",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "https://lisarstudio.github.io/lisar-studio-2026/assets/models/helmet1.glb",
      description: "Prop de ciencia ficción diseñado para integración en juegos FPS y simuladores de realidad virtual.",
      tools: ["Blender 3D", "Marmoset Toolbag"],
    },
    {
      id: 5,
      title: "Casco Yamato",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "https://lisarstudio.github.io/lisar-studio-2026/assets/models/Helmet2.glb",
      description: "Variante con acabados cromados y visor modificado para juegos de acción en primera persona.",
      tools: ["3ds Max", "Substance Painter"],
    },
    {
      id: 6,
      title: "Casco Trigger",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "https://lisarstudio.github.io/lisar-studio-2026/assets/models/helmet3.glb",
      description: "Edición premium con detalles de lujo y pintura metálica especializada, ideal para asset de rareza Legendaria.",
      tools: ["Blender 3D", "Substance 3D"],
    },
    {
      id: 7,
      title: "Tron Bot",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "https://lisarstudio.github.io/lisar-studio-2026/assets/models/tron.glb",
      description: "Diseño de Bot que sirve de asistente.",
      tools: ["3ds Max", "Unreal Engine 5", "Photoshop"],
    },

    // --- 7 VIDEOS / ANIMACIONES ---
    {
      id: 8,
      title: "VFX & CGI Reel",
      category: "VFX y Motion Graphics",
      instagramUrl: "https://www.instagram.com/p/DaVr7Z4qhgi/",
      type: "video",
      videoFile: "assets/video/vfx_ig.mp4",
      description: "Desglose visual y VFX con identidad visual única de LisarStudio.",
      tools: ["Cinema 4D", "After Effects", "Redshift"],
    },
    {
      id: 9,
      title: "Animación 3D 1",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DaLveFxqqGb/",
      type: "video",
      videoFile: "assets/video/anim_1.mp4",
      description: "Desarrollo de animación 3D de alta calidad.",
      tools: ["Blender", "Cinema 4D"],
    },
    {
      id: 10,
      title: "Animación 3D 2",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DZz2EL9qoJ5/",
      type: "video",
      videoFile: "assets/video/anim_2.mp4",
      description: "Secuencia animada y renderizado fotorrealista.",
      tools: ["Maya", "Arnold Render"],
    },
    {
      id: 11,
      title: "Animación 3D 3",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DZtiUuyibjB/",
      type: "video",
      videoFile: "assets/video/anim_3.mp4",
      description: "Cinemática y diseño de personajes dinámicos.",
      tools: ["Unreal Engine 5", "Sequencer"],
    },
    {
      id: 13,
      title: "Animación 3D 4",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/Da65rYBqNu7/",
      type: "video",
      videoFile: "assets/video/anim_4.mp4",
      description: "Animación dinámica y simulaciones orgánicas.",
      tools: ["Houdini", "Redshift"],
    },
    {
      id: 14,
      title: "Animación 3D 5",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DY7ZhFsKGZG/",
      type: "video",
      videoFile: "assets/video/anim_5.mp4",
      description: "Modelado y animación de escenarios inmersivos.",
      tools: ["Cinema 4D", "Octane"],
    },
    {
      id: 15,
      title: "Animación 3D 6",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DURjZrekRcn/",
      type: "video",
      videoFile: "assets/video/anim_6.mp4",
      description: "Trabajo de texturizado e iluminación cinemática.",
      tools: ["Substance Painter", "Blender"],
    },
    {
      id: 16,
      title: "Animación 3D 7",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DP8Jlu6jOX7/",
      type: "video",
      videoFile: "assets/video/anim_7.mp4",
      description: "Animación comercial y presentación de producto.",
      tools: ["After Effects", "Cinema 4D"],
    },
    {
      id: 17,
      title: "Animación 3D 8",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DWUuR2vFjgd/?img_index=1",
      type: "video",
      videoFile: "assets/video/anim_8.mp4",
      description: "Reel de animación 3D corporativa e institucional.",
      tools: ["Blender", "DaVinci Resolve"],
    },
    {
      id: 12,
      title: "Motion Graphics & Identidad",
      category: "VFX y Motion Graphics",
      instagramUrl: "https://www.instagram.com/p/DSz1I0NkqnR/",
      type: "video",
      videoFile: "assets/video/vfx_ig_2.mp4",
      description: "Desarrollo de piezas de motion graphics y animación publicitaria con alto impacto visual.",
      tools: ["After Effects", "Cinema 4D", "Illustrator"],
    }
  ];

  // ============================================================
  // 3. DOM ELEMENTS
  // ============================================================
  const portfolioContainer = document.getElementById('portfolio-grid-container');
  const portfolioPills     = document.querySelectorAll('.portfolio-pill');
  const header             = document.querySelector('.site-header');
  let activeCategory = 'Todos';

  // ============================================================
  // 4. RENDER PORTFOLIO — Tarjetas con visor 3D integrado
  // ============================================================
  function renderPortfolio() {
    if (!portfolioContainer) return;

    const filtered = portfolioData.filter(item =>
      activeCategory === 'Todos' || item.category === activeCategory
    );

    portfolioContainer.innerHTML = filtered.map(item => `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="glass-card portfolio-card h-100">
          <div class="model-viewer-wrapper" id="wrapper-${item.id}">
            <span class="model-viewer-badge">
              <i class="bi bi-badge-3d-fill"></i> ${item.type === 'video' ? 'Video · ' : 'Visor 3D · '}${item.title}
            </span>
            ${item.type === 'video' 
              ? `<video class="w-100 h-100" style="object-fit:cover;border-radius:10px;" autoplay muted loop playsinline preload="metadata">
                   <source src="${item.videoFile}" type="video/mp4">
                 </video>`
              : item.type === 'iframe'
                ? `<iframe src="${item.iframeUrl}" class="w-100 h-100" style="border-radius:10px;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`
                : `<canvas class="glb-canvas" id="canvas-${item.id}" style="width:100%;height:100%;display:block;border-radius:10px;cursor:grab;"></canvas>
                   <div class="model-loading-bar" id="loading-${item.id}">
                     <div class="loading-bar-fill"></div>
                     <span>Cargando modelo 3D...</span>
                   </div>`
            }
          </div>

          <h3 class="h5 font-weight-bold text-main mb-1 mt-2">${item.title}</h3>
          <span class="badge badge-sm" style="background:rgba(255,183,3,0.15);color:var(--lisar-gold);border:1px solid rgba(255,183,3,0.3);font-size:0.7rem;padding:3px 8px;border-radius:20px;margin-bottom:8px;display:inline-block;">${item.category}</span>
          <p class="text-muted font-size-0-9rem mb-3">${item.description}</p>

          <div class="d-flex flex-wrap gap-1 mb-3">
            ${item.tools.map(t => `<span style="font-size:0.7rem;background:rgba(255,183,3,0.08);border:1px solid rgba(255,183,3,0.2);color:var(--lisar-gold);padding:2px 8px;border-radius:20px;">${t}</span>`).join('')}
          </div>

          <div class="d-flex align-items-center pt-3 border-top border-secondary mt-auto">
            <span class="text-muted" style="font-size:0.75rem;"><i class="bi bi-instagram text-danger mr-1"></i>@lisarstudiooficial</span>
          </div>
        </div>
      </div>
    `).join('');

    // Inicializar visor 3D Three.js para cada tarjeta que no sea video ni iframe
    filtered.forEach(item => {
      if (item.type !== 'video' && item.type !== 'iframe') {
        initGLBViewer(`canvas-${item.id}`, `loading-${item.id}`, item.glbFile);
      }
    });
  }

  // ============================================================
  // 5. VISOR 3D GLB CON THREE.JS + GLTFLoader
  // ============================================================
  function initGLBViewer(canvasId, loadingId, glbPath) {
    const canvas  = document.getElementById(canvasId);
    const loadBar = document.getElementById(loadingId);
    if (!canvas || !window.THREE) return;

    const THREE = window.THREE;
    const wrapper = canvas.parentElement;
    const W = wrapper.clientWidth  || 320;
    const H = wrapper.clientHeight || 320;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping    = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;

    // Scene
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);
    camera.position.set(0, 0, 3);

    // Lighting — cálida dorada para concordar con la paleta
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffd166, 1.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xfb8500, 0.5);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffb703, 0.8, 20);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Estado de órbita (drag para rotar)
    let isDragging = false, prevX = 0, prevY = 0;
    let rotX = 0, rotY = 0;
    let autoRotate = true;

    canvas.addEventListener('mousedown',  e => { isDragging = true;  autoRotate = false; prevX = e.clientX; prevY = e.clientY; canvas.style.cursor = 'grabbing'; });
    canvas.addEventListener('mousemove',  e => { if (!isDragging) return; rotY += (e.clientX - prevX) * 0.008; rotX += (e.clientY - prevY) * 0.005; prevX = e.clientX; prevY = e.clientY; });
    canvas.addEventListener('mouseup',    () => { isDragging = false; canvas.style.cursor = 'grab'; setTimeout(() => { autoRotate = true; }, 2000); });
    canvas.addEventListener('mouseleave', () => { isDragging = false; canvas.style.cursor = 'grab'; setTimeout(() => { autoRotate = true; }, 2000); });

    // Touch
    canvas.addEventListener('touchstart', e => { isDragging = true; autoRotate = false; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; });
    canvas.addEventListener('touchmove',  e => { if (!isDragging) return; rotY += (e.touches[0].clientX - prevX) * 0.008; rotX += (e.touches[0].clientY - prevY) * 0.005; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend',   () => { isDragging = false; setTimeout(() => { autoRotate = true; }, 2000); });

    // Cargar GLB con GLTFLoader
    if (!THREE.GLTFLoader) {
      // Fallback: mostrar placeholder dorado si no hay loader
      showGoldenPlaceholder(scene, camera, renderer, canvas, autoRotate, rotX, rotY);
      if (loadBar) loadBar.style.display = 'none';
      return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
      glbPath,
      (gltf) => {
        if (loadBar) loadBar.style.display = 'none';

        const model = gltf.scene;

        const pivot = new THREE.Group();
        scene.add(pivot);

        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale  = 2.0 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        // Activar sombras y arreglar texturas metálicas en meshes
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
               // Evitar que se vea negro en celulares si no hay mapa de entorno
               child.material.envMapIntensity = 0;
               if (child.material.metalness > 0.5) {
                   child.material.metalness = 0.5; // Reducir un poco el metalness para que refleje luz difusa
               }
               child.material.needsUpdate = true;
            }
          }
        });

        pivot.add(model);

        // Ajustar cámara según tamaño real
        camera.position.z = 2.5;

        // Reproducir animaciones si el GLB las trae
        let mixer = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(clip => mixer.clipAction(clip).play());
        }

        const clock = new THREE.Clock();

        function animate() {
          requestAnimationFrame(animate);
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta);
          if (autoRotate) rotY += 0.005;
          pivot.rotation.y = rotY;
          pivot.rotation.x = rotX * 0.3;
          renderer.render(scene, camera);
        }
        animate();
      },
      (progress) => {
        if (loadBar && progress.total) {
          const pct = (progress.loaded / progress.total * 100).toFixed(0);
          const fill = loadBar.querySelector('.loading-bar-fill');
          if (fill) fill.style.width = pct + '%';
          const span = loadBar.querySelector('span');
          if (span) span.textContent = `Cargando ${pct}%...`;
        }
      },
      (error) => {
        console.error('Error cargando GLB:', glbPath, error);
        if (loadBar) loadBar.style.display = 'none';
        showGoldenPlaceholder(scene, camera, renderer, canvas);
      }
    );
  }

  // Placeholder dorado si falla la carga
  function showGoldenPlaceholder(scene, camera, renderer, canvas) {
    const THREE = window.THREE;
    const geo  = new THREE.IcosahedronGeometry(0.8, 0);
    const mat  = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.9, roughness: 0.2, wireframe: false });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    // Scroll to top button functionality
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
          scrollTopBtn.classList.add('show');
        } else {
          scrollTopBtn.classList.remove('show');
        }
      });
    }
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.01;
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.003;
      renderer.render(scene, camera);
    }
    animate();
  }

  // ============================================================
  // 6. FILTROS DE CATEGORÍAS
  // ============================================================
  portfolioPills.forEach(pill => {
    pill.addEventListener('click', () => {
      portfolioPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category');
      renderPortfolio();
    });
  });

  // Global function for hero buttons
  window.filterPortfolio = function(category) {
    const targetPill = Array.from(portfolioPills).find(pill => pill.getAttribute('data-category') === category);
    if(targetPill) {
      targetPill.click();
    }
  };

  // ============================================================
  // 7. STICKY HEADER
  // ============================================================
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ============================================================
  // 8. ASISTENTE DE IA
  // ============================================================
  const aiBubble = document.getElementById('ai-bubble');
  if(aiBubble) {
    // Show first message after 3 seconds
    setTimeout(() => {
      aiBubble.classList.add('show');
      
      // Change to second message after 3 more seconds
      setTimeout(() => {
        aiBubble.style.opacity = '0'; // Fade out
        setTimeout(() => {
          aiBubble.textContent = "¡Te ayudo a cotizar!";
          aiBubble.style.opacity = '1'; // Fade back in
          
          // Disappear completely after 4 seconds
          setTimeout(() => {
            aiBubble.classList.remove('show');
          }, 4000);
        }, 500);
      }, 3000);
    }, 3000);
  }

  // Render inicial
  renderPortfolio();

  // ============================================================
  // 9. PROACTIVE AI PERSUASION (SCROLL SPY)
  // ============================================================
  const persuasionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let context = 'general';
        if (entry.target.id === 'servicios') {
            context = '3d';
        } else if (entry.target.id === 'planes-web') {
            context = 'web';
        }
        
        // Wait 5 seconds before triggering persuasion
        entry.target.persuasionTimeout = setTimeout(() => {
          if (window.triggerAIPersuasion && typeof window.triggerAIPersuasion === 'function') {
              window.triggerAIPersuasion(context);
          }
        }, 5000);
      } else {
        // Cancel timeout if user scrolls away before 5 seconds
        if(entry.target.persuasionTimeout) {
            clearTimeout(entry.target.persuasionTimeout);
        }
      }
    });
  }, { threshold: 0.6 }); // 60% visibility required

  const sectionsToSpy = [document.getElementById('servicios'), document.getElementById('planes-web')];
  sectionsToSpy.forEach(sec => {
      if(sec) persuasionObserver.observe(sec);
  });
});
