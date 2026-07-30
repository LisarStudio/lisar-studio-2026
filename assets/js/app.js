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
      title: "Modelado 3D & Renderizado de Envase Luxury",
      category: "Publicidad 3D",
      views: "890.5K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "", // ← Coloca aquí: 'assets/models/envase-luxury.glb'
      placeholderIcon: "bi-box-seam",
      description: "Iluminación fotográfica 3D de alto nivel, cáusticas y texturizado PBR para producto de lujo. CGI puro que vende.",
      tools: ["Blender 3D", "Octane Render", "Substance Painter"],
    },
    {
      id: 2,
      title: "Animación 3D Publicitaria de Calzado Deportivo",
      category: "Animación 3D",
      views: "620.8K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "", // ← Coloca aquí: 'assets/models/calzado-deportivo.glb'
      placeholderIcon: "bi-camera-reels",
      description: "Spot publicitario animado en 3D con simulación de telas, suela dinámica y despiece explotado de componentes.",
      tools: ["Cinema 4D", "After Effects", "Redshift"],
    },
    {
      id: 3,
      title: "Visualización Arquitectónica Residencial",
      category: "Arquitectura",
      views: "415.2K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "", // ← Coloca aquí: 'assets/models/residencial-3d.glb'
      placeholderIcon: "bi-buildings",
      description: "Recorrido hiperrealista 8K por departamento de lujo en Santiago con iluminación solar diurna y nocturna.",
      tools: ["3ds Max", "V-Ray 6", "Photoshop"],
    },
    {
      id: 4,
      title: "Simulación de Fluidos & Hielo Flotante",
      category: "Publicidad 3D",
      views: "540.3K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "", // ← Coloca aquí: 'assets/models/fluidos-hielo.glb'
      placeholderIcon: "bi-droplet-half",
      description: "Física real de líquidos, gotas de condensación sobre envases helados y movimiento dinámico de partículas.",
      tools: ["Houdini FX", "Unreal Engine 5"],
    },
    {
      id: 5,
      title: "Breakdown CGI: Wireframe a Render Final",
      category: "Motion Graphics",
      views: "780.1K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "", // ← Coloca aquí: 'assets/models/breakdown-cgi.glb'
      placeholderIcon: "bi-layers",
      description: "Transición paso a paso desde el modelo 3D poligonal hasta la composición cinematográfica final con postproducción.",
      tools: ["ZBrush", "Nuke", "DaVinci Resolve"],
    },
    {
      id: 6,
      title: "Plataforma Web E-Commerce 3D Interactiva",
      category: "Diseño Web",
      views: "310.9K",
      instagramUrl: "https://www.instagram.com/lisarstudiooficial/",
      glbFile: "", // ← Coloca aquí: 'assets/models/ecommerce-3d.glb'
      placeholderIcon: "bi-laptop",
      description: "Desarrollo web vanguardista con integración 3D interactiva en vivo, catálogo de productos y diseño adaptativo futurista.",
      tools: ["Bootstrap 4", "Three.js", "JavaScript ES6"],
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
