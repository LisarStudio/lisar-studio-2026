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

  // Reset theme to 'dark' to prevent broken light mode styling and enforce cyberpunk branding
  if (localStorage.getItem('lisar_theme') === 'light') {
    localStorage.setItem('lisar_theme', 'dark');
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
      glbFile: "assets/models/Boss.glb",
      description: "Personaje 3D hiperrealista optimizado para motores de videojuegos con texturizado PBR y rigging completo.",
      tools: ["Blender", "Substance Painter", "Unreal Engine"],
    },
    {
      id: 2,
      title: "Crab - Criatura",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/crab.glb",
      description: "Modelo orgánico de criatura listo para realidad virtual, con bajo conteo de polígonos y texturas estilizadas.",
      tools: ["Blender", "Maya", "Unity"],
    },
    {
      id: 3,
      title: "Flutter Ship",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/Flutter.glb",
      description: "Nave voladora para entorno de realidad virtual con mapeo UV de alta fidelidad.",
      tools: ["ZBrush", "Blender 3D"],
    },
    {
      id: 4,
      title: "Casco Elysium",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/helmet1.glb",
      description: "Prop de ciencia ficción diseñado para integración en juegos FPS y simuladores de realidad virtual.",
      tools: ["Blender 3D", "Marmoset Toolbag"],
    },
    {
      id: 5,
      title: "Casco Yamato",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/Helmet2.glb",
      description: "Variante con acabados cromados y visor modificado para juegos de acción en primera persona.",
      tools: ["3ds Max", "Substance Painter"],
    },
    {
      id: 6,
      title: "Casco Trigger",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/helmet3.glb",
      description: "Edición premium con detalles de lujo y pintura metálica especializada, ideal para asset de rareza Legendaria.",
      tools: ["Blender 3D", "Substance 3D"],
    },
    {
      id: 7,
      title: "Tron Bot",
      category: "Modelos 3D para juegos y VR",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/tron.glb",
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
      videoFile: "assets/videos/instagram/instagram-video-01.mp4",
      description: "Desglose visual y VFX con identidad visual única de LisarStudio.",
      tools: ["Cinema 4D", "After Effects", "Redshift"],
    },
    {
      id: 9,
      title: "Animación 3D 1",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DaLveFxqqGb/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-02.mp4",
      description: "Desarrollo de animación 3D de alta calidad.",
      tools: ["Blender", "Cinema 4D"],
    },
    {
      id: 10,
      title: "Animación 3D 2",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DZz2EL9qoJ5/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-03.mp4",
      description: "Secuencia animada y renderizado fotorrealista.",
      tools: ["Maya", "Arnold Render"],
    },
    {
      id: 11,
      title: "Animación 3D 3",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DZtiUuyibjB/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-04.mp4",
      description: "Cinemática y diseño de personajes dinámicos.",
      tools: ["Unreal Engine 5", "Sequencer"],
    },
    {
      id: 13,
      title: "Animación 3D 4",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/Da65rYBqNu7/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-05.mp4",
      description: "Animación dinámica y simulaciones orgánicas.",
      tools: ["Houdini", "Redshift"],
    },
    {
      id: 14,
      title: "Animación 3D 5",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DY7ZhFsKGZG/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-06.mp4",
      description: "Modelado y animación de escenarios inmersivos.",
      tools: ["Cinema 4D", "Octane"],
    },
    {
      id: 15,
      title: "Animación 3D 6",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DURjZrekRcn/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-07.mp4",
      description: "Trabajo de texturizado e iluminación cinemática.",
      tools: ["Substance Painter", "Blender"],
    },
    {
      id: 16,
      title: "Animación 3D 7",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DP8Jlu6jOX7/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-08.mp4",
      description: "Animación comercial y presentación de producto.",
      tools: ["After Effects", "Cinema 4D"],
    },
    {
      id: 17,
      title: "Animación 3D 8",
      category: "Animación 3D",
      instagramUrl: "https://www.instagram.com/p/DWUuR2vFjgd/?img_index=1",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-09.mp4",
      description: "Reel de animación 3D corporativa e institucional.",
      tools: ["Blender", "DaVinci Resolve"],
    },
    {
      id: 12,
      title: "Motion Graphics & Identidad",
      category: "VFX y Motion Graphics",
      instagramUrl: "https://www.instagram.com/p/DSz1I0NkqnR/",
      type: "video",
      videoFile: "assets/videos/instagram/instagram-video-10.mp4",
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
  // 4. RENDER PORTFOLIO — Tarjetas con visor 3D integrado (Google model-viewer)
  // ============================================================
  function renderPortfolio() {
    if (!portfolioContainer) return;

    const filtered = portfolioData.filter(item =>
      activeCategory === 'Todos' || item.category === activeCategory
    );

    portfolioContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filtered.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 mb-4';

      let mediaHTML = '';
      if (item.type === 'video') {
        mediaHTML = `
          <video
            class="video-social"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
          >
            <source src="${item.videoFile}" type="video/mp4">
          </video>`;
      } else if (item.type === 'iframe') {
        mediaHTML = `<iframe src="${item.iframeUrl}" class="w-100 h-100" style="border-radius:10px;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;
      }

      col.innerHTML = `
        <div class="glass-card portfolio-card h-100">
          <div class="model-viewer-wrapper" id="wrapper-${item.id}">
            <span class="model-viewer-badge">
              <i class="bi bi-badge-3d-fill"></i> ${item.type === 'video' ? 'Video' : 'Visor 3D'} &middot; ${item.title}
            </span>
            ${mediaHTML}
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
      `;

      if (!item.type || item.type === '3d') {
        const wrapper = col.querySelector(`#wrapper-${item.id}`);
        const mv = document.createElement('model-viewer');
        mv.setAttribute('src', item.glbFile);
        mv.setAttribute('alt', item.title);
        mv.setAttribute('loading', 'lazy');
        mv.setAttribute('autoplay', '');
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('auto-rotate-delay', '0');
        mv.setAttribute('rotation-per-second', '25deg');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('shadow-intensity', '1');
        mv.setAttribute('exposure', '1.2');
        mv.setAttribute('tone-mapping', 'commerce');
        mv.setAttribute('environment-image', 'neutral');
        mv.style.cssText = 'width:100%;height:100%;border-radius:10px;background:transparent;--poster-color:transparent;';

        // Loading indicator inside the wrapper
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'mv-loading-indicator';
        loadingDiv.innerHTML = '<span class="mv-spinner"></span>';
        wrapper.appendChild(loadingDiv);

        mv.addEventListener('load', () => {
          loadingDiv.remove();
        });
        mv.addEventListener('error', (e) => {
          console.error(`[model-viewer] Error cargando ${item.glbFile}:`, e);
          loadingDiv.remove();
        });

        wrapper.appendChild(mv);
      }

      fragment.appendChild(col);
    });

    portfolioContainer.appendChild(fragment);
  }

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

  // ============================================================
  // 6. FILTROS DE CATEGORÍAS
  // ============================================================
  portfolioPills.forEach(pill => {
    pill.addEventListener('click', () => {
      portfolioPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category');
      renderPortfolio();
      // Re-attach video observer after DOM is repopulated
      setTimeout(setupVideoObserver, 50);
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
  // VIDEO AUTOPLAY — IntersectionObserver
  // Reproduce el video más visible (≥60%), pausa los demás.
  // Se reconfigura al cambiar el filtro de categorías.
  // ============================================================
  let _videoObserver = null;

  function setupVideoObserver() {
    // Desconectar observer previo si existe (evitar duplicados al filtrar)
    if (_videoObserver) {
      _videoObserver.disconnect();
      _videoObserver = null;
    }

    const videos = document.querySelectorAll('.video-social');
    if (!videos.length) return;

    _videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          // Pausar todos los demás videos primero
          document.querySelectorAll('.video-social').forEach((other) => {
            if (other !== video && !other.paused) {
              other.pause();
            }
          });

          // Garantizar muted antes de play() (requisito de autoplay)
          video.muted = true;

          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('[VideoObserver] Autoplay bloqueado por el navegador:', err.message);
            });
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, {
      threshold: [0, 0.3, 0.6, 1.0]
    });

    videos.forEach((video) => {
      // Reiniciar al principio si está detenido
      video.currentTime = 0;
      _videoObserver.observe(video);
    });
  }

  // Llamar setup tras el primer render
  setupVideoObserver();

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
