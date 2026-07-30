/**
 * LISAR STUDIO 2026 - INTERACTIVE APPLICATION LOGIC
 * Tema Claro / Oscuro, alternancia dinámica de logotipo,
 * visor 3D GLB con <model-viewer> de Google, filtros de portafolio y modales.
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
  // 2. PORTFOLIO DATA — Array de proyectos 3D reales de Lisar Studio
  //    Campo glbFile: ruta relativa al .glb dentro de assets/models/
  //    Si glbFile está vacío (''), se muestra un placeholder elegante.
  //    Cuando subas tus archivos GLB, rellena glbFile con el nombre del archivo.
  // ============================================================
  const portfolioData = [
    {
      id: 1,
      title: "Boss — Personaje 3D Publicitario",
      category: "Publicidad 3D",
      views: "890.5K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/Boss.glb",
      placeholderIcon: "bi-person-bounding-box",
      description: "Personaje 3D hiperrealista con texturizado PBR avanzado y rigging completo. Ideal para campañas publicitarias de alto impacto.",
      tools: ["Blender 3D", "Substance Painter", "Octane Render"],
    },
    {
      id: 2,
      title: "Crab — Criatura 3D Animada",
      category: "Animación 3D",
      views: "620.8K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/crab.glb",
      placeholderIcon: "bi-camera-reels",
      description: "Modelado orgánico de criatura marina con simulación de movimiento natural, ideal para reels virales y contenido animado.",
      tools: ["ZBrush", "Cinema 4D", "Redshift"],
    },
    {
      id: 3,
      title: "Flutter — Animación 3D Dinámica",
      category: "Motion Graphics",
      views: "780.1K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/Flutter.glb",
      placeholderIcon: "bi-layers",
      description: "Animación fluida con sistema de partículas y simulación de movimiento orgánico. Breakdowns completos de producción CGI.",
      tools: ["Houdini FX", "After Effects", "DaVinci Resolve"],
    },
    {
      id: 4,
      title: "Helmet 1 — Diseño Industrial 3D",
      category: "Publicidad 3D",
      views: "540.3K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/helmet1.glb",
      placeholderIcon: "bi-box-seam",
      description: "Renderizado de producto industrial con materiales PBR metálicos, reflejos realistas y estudio de iluminación fotográfica.",
      tools: ["Blender 3D", "Substance Painter", "V-Ray"],
    },
    {
      id: 5,
      title: "Helmet 2 — Variante de Diseño 3D",
      category: "Publicidad 3D",
      views: "415.2K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/Helmet2.glb",
      placeholderIcon: "bi-shield-fill",
      description: "Segunda variante de renderizado con acabados cromados y mapeado UV de alta resolución para presentaciones comerciales.",
      tools: ["3ds Max", "Corona Renderer", "Photoshop"],
    },
    {
      id: 6,
      title: "Helmet 3 — Edición Premium",
      category: "Publicidad 3D",
      views: "310.9K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/helmet3.glb",
      placeholderIcon: "bi-shield-fill-check",
      description: "Versión premium con detalles de lujo, materiales de carbono y pintura metálica especializada. Proyecto de alta gama.",
      tools: ["Blender 3D", "Cycles X", "Substance 3D"],
    },
    {
      id: 7,
      title: "Tron — Concept Art 3D Futurista",
      category: "Motion Graphics",
      views: "950.2K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "assets/models/tron.glb",
      placeholderIcon: "bi-cpu",
      description: "Concept art 3D inspirado en estética cyberpunk, con iluminación neón emisiva y materiales translúcidos de ciencia ficción.",
      tools: ["Blender 3D", "Unreal Engine 5", "After Effects"],
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
  // 4. RENDER PORTFOLIO — con <model-viewer> o placeholder elegante
  // ============================================================
  function renderPortfolio() {
    if (!portfolioContainer) return;

    const filtered = portfolioData.filter(item => {
      return activeCategory === 'Todos' || item.category === activeCategory;
    });

    portfolioContainer.innerHTML = filtered.map(item => {
      // Visor 3D si hay GLB disponible, placeholder si no
      const viewerHTML = item.glbFile
        ? `<model-viewer
              src="${item.glbFile}"
              alt="${item.title}"
              auto-rotate
              auto-rotate-delay="0"
              rotation-per-second="30deg"
              camera-controls
              shadow-intensity="1.5"
              shadow-softness="1"
              environment-image="neutral"
              exposure="1"
              style="width:100%;height:100%;">
           </model-viewer>`
        : `<div class="model-placeholder-card">
             <i class="bi ${item.placeholderIcon} placeholder-icon"></i>
             <strong style="font-size:0.85rem;opacity:0.7;">Modelo 3D próximamente</strong>
             <p>Sube tu archivo .glb a<br><code style="font-size:0.7rem;">assets/models/</code></p>
           </div>`;

      return `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="glass-card portfolio-card h-100">
            <div class="model-viewer-wrapper">
              <span class="model-viewer-badge">
                <i class="bi bi-badge-3d-fill"></i> Visor 3D
              </span>
              ${viewerHTML}
            </div>

            <span class="model-3d-label">
              <i class="bi bi-instagram text-danger"></i> @lisarstudiooficial &nbsp;·&nbsp;
              <i class="bi bi-eye-fill"></i> ${item.views} views
            </span>

            <h3 class="h5 font-weight-bold text-main mb-2">${item.title}</h3>
            <p class="text-muted font-size-0-9rem mb-3">${item.description}</p>

            <div class="d-flex align-items-center justify-content-between pt-3 border-top border-secondary mt-auto">
              <span class="text-muted font-size-0-8rem font-weight-600">${item.category}</span>
              <a href="${item.instagramUrl}" target="_blank" class="btn btn-sm btn-gold-outline">
                <i class="bi bi-instagram mr-1 text-danger"></i> Ver en Instagram
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================================
  // 5. FILTROS DE CATEGORÍAS
  // ============================================================
  portfolioPills.forEach(pill => {
    pill.addEventListener('click', () => {
      portfolioPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category');
      renderPortfolio();
    });
  });

  // ============================================================
  // 6. STICKY HEADER
  // ============================================================
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Render inicial
  renderPortfolio();
});
