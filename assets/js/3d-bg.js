/**
 * LISAR STUDIO 2026 - FUTURISTIC 3D STUDIO BACKGROUND ANIMATION
 * Escenario 3D interactivo en Three.js con icosaedros metálicos dorados,
 * anillos de luz orbitales y polvo de luz cyber.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas-3d');
  if (!canvas) return;

  let scene, camera, renderer;
  let studioGroup, particles;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function initThree() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js no detectado. Cargando fallback Canvas 2D.');
      initFallbackCanvas();
      return;
    }

    // 1. Escena 3D
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090a, 0.0016);

    // 2. Cámara
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 380;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 4. Grupo Principal de Estudio 3D (Icosaedros & Anillos)
    studioGroup = new THREE.Group();

    // Material Metálico Dorado & Ámbar
    const goldEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xffb703, linewidth: 2 });
    const goldFillMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0x3d2500,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.55
    });

    // Geometría 3D de estudio (Icosaedro & Toros)
    const icoGeo = new THREE.IcosahedronGeometry(20, 0);

    const numObjects = 24;
    for (let i = 0; i < numObjects; i++) {
      const mesh = new THREE.Mesh(icoGeo, goldFillMaterial);

      const edges = new THREE.EdgesGeometry(icoGeo);
      const line = new THREE.LineSegments(edges, goldEdgeMaterial);
      mesh.add(line);

      // Posicionamiento en el espacio 3D
      mesh.position.x = (Math.random() - 0.5) * 580;
      mesh.position.y = (Math.random() - 0.5) * 480;
      mesh.position.z = (Math.random() - 0.5) * 380;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      const scale = 0.7 + Math.random() * 1.3;
      mesh.scale.set(scale, scale, scale);

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.014,
        rotSpeedY: (Math.random() - 0.5) * 0.014,
        initialY: mesh.position.y
      };

      studioGroup.add(mesh);
    }

    // Anillo de luz orbital 3D
    const ringGeo = new THREE.TorusGeometry(120, 1.5, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfb8500, wireframe: true, transparent: true, opacity: 0.4 });
    const studioRing = new THREE.Mesh(ringGeo, ringMat);
    studioRing.rotation.x = Math.PI / 3;
    studioGroup.add(studioRing);

    scene.add(studioGroup);

    // 5. Partículas de Polvo Dorado
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 900;
      positions[i + 1] = (Math.random() - 0.5) * 800;
      positions[i + 2] = (Math.random() - 0.5) * 800;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffb703,
      size: 3.5,
      transparent: true,
      opacity: 0.65
    });

    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Luces de Escenario 3D
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xffb703, 3, 600);
    goldPointLight.position.set(120, 180, 180);
    scene.add(goldPointLight);

    const amberPointLight = new THREE.PointLight(0xfb8500, 2.5, 700);
    amberPointLight.position.set(-180, -120, 120);
    scene.add(amberPointLight);

    // Listeners
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    animate();
  }

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.2;
    mouseY = (event.clientY - windowHalfY) * 0.2;
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x = targetX;
    camera.position.y = -targetY;
    camera.lookAt(scene.position);

    if (studioGroup) {
      studioGroup.rotation.y += 0.0025;

      studioGroup.children.forEach((mesh, index) => {
        if (mesh.userData.rotSpeedX) {
          mesh.rotation.x += mesh.userData.rotSpeedX;
          mesh.rotation.y += mesh.userData.rotSpeedY;
          mesh.position.y = mesh.userData.initialY + Math.sin(Date.now() * 0.0015 + index) * 16;
        }
      });
    }

    if (particles) {
      particles.rotation.y -= 0.001;
    }

    renderer.render(scene, camera);
  }

  function initFallbackCanvas() {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodes = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 3 + Math.random() * 8,
      speedY: 0.2 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.4
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((n) => {
        n.y -= n.speedY;
        if (n.y < -20) n.y = height + 20;

        ctx.fillStyle = `rgba(255, 183, 3, ${n.opacity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
})();
