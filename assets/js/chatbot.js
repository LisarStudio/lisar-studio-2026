// assets/js/chatbot.js

document.addEventListener('DOMContentLoaded', () => {
  const toggler = document.getElementById('chatbot-toggler');
  const container = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('close-chatbot');
  const body = document.getElementById('chatbot-body');
  const footer = document.getElementById('chatbot-footer');

  // Estado de la cotización
  let quoteData = {
    service: '',
    details: [],
    urgencyText: '',
    name: '',
    email: '',
    total: 0
  };

  // Árbol de conversación
  const chatFlow = {
    start: {
      msg: "¡Hola! Soy Lisar IA 🤖. Estoy aquí para ayudarte a cotizar o resolver tus dudas. ¿Qué te interesa?",
      options: [
        { label: "Cotizar Animación 3D", next: "anim_duration", val: 0 },
        { label: "Cotizar Modelo 3D", next: "model_type", val: 0 },
        { label: "Cotizar Desarrollo Web", next: "web_type", val: 0 },
        { label: "Cotizar Videojuegos", next: "game_type", val: 0 },
        { label: "¿Dudas sobre nuestros servicios?", next: "service_faq", val: 0 }
      ]
    },
    
    // ---------------- FAQ / CONOCIMIENTO DE PIPELINES ----------------
    service_faq: {
      msg: "¡Claro! En Lisar Studio nos destacamos por nuestros flujos de trabajo claros y comunicación constante. ¿Sobre qué servicio tienes dudas del proceso o plazos?",
      options: [
        { label: "Pipeline de Desarrollo Web", next: "faq_web", val: 0 },
        { label: "Pipeline de Videojuegos / Advergames", next: "faq_games", val: 0 },
        { label: "Pipeline de Diseño 3D / Reels", next: "faq_3d", val: 0 }
      ]
    },
    faq_web: {
      msg: "<b>Desarrollo Web (Plazo: 2 a 3 semanas):</b><br>1. <b>Briefing:</b> Definimos tus metas y referencias.<br>2. <b>Diseño UI/UX:</b> Aprobamos maquetas visuales.<br>3. <b>Desarrollo:</b> Programamos tu sitio con tecnología moderna.<br>4. <b>Testeo y Entrega:</b> Tu web lista y optimizada.<br><br>¿Te animas a cotizar uno?",
      options: [
        { label: "Sí, Cotizar Web", next: "web_type", val: 0 },
        { label: "Volver al inicio", next: "start", val: 0 }
      ]
    },
    faq_games: {
      msg: "<b>Videojuegos Corporativos (Plazo: 2 a 4 semanas):</b><br>1. <b>Concepto y Guion:</b> Definimos la mecánica (ej. Runner 3D).<br>2. <b>Arte 3D y Sonido:</b> Creamos tu marca en el juego.<br>3. <b>Programación:</b> Lógica y recompensas.<br>4. <b>QA y Lanzamiento:</b> ¡Listo para enganchar a tu audiencia!<br><br>¿Hacemos uno para tu marca?",
      options: [
        { label: "Sí, Cotizar Videojuego", next: "game_type", val: 0 },
        { label: "Volver al inicio", next: "start", val: 0 }
      ]
    },
    faq_3d: {
      msg: "<b>Diseño 3D y Animación (Plazo: 1 a 3 semanas):</b><br>1. <b>Storyboard y Concepto:</b> Visualizamos la idea.<br>2. <b>Modelado y Texturizado:</b> Esculpimos tus activos.<br>3. <b>Animación y Render:</b> Le damos vida e iluminamos.<br>4. <b>Postproducción:</b> Edición final de alto impacto.<br><br>¿Cotizamos tu Reel o render 3D?",
      options: [
        { label: "Sí, Cotizar Animación", next: "anim_duration", val: 0 },
        { label: "Volver al inicio", next: "start", val: 0 }
      ]
    },

    // ---------------- VIDEOJUEGOS (NUEVO) ----------------
    game_type: {
      msg: "¡Excelente! Los videojuegos disparan la interacción de tus clientes. ¿Qué formato prefieres?",
      options: [
        { label: "Minijuego Web (Ej. Runner 3D)", next: "game_art", val: 950 },
        { label: "Simulador Educativo / Corporativo", next: "game_art", val: 1500 },
        { label: "Experiencia AR / Realidad Aumentada", next: "game_art", val: 1800 }
      ]
    },
    game_art: {
      msg: "¿El arte del juego será en 2D o 3D?",
      options: [
        { label: "2D Ilustrado", next: "urgency", val: 0 },
        { label: "3D de Alta Calidad", next: "urgency", val: 400 }
      ]
    },

    // ---------------- ANIMACIÓN 3D ----------------
    anim_duration: {
      msg: "¡Excelente! Para animación 3D, ¿qué duración aproximada necesitas?",
      options: [
        { label: "15 segundos", next: "anim_complexity", val: 300 }, // Base $300
        { label: "30 segundos", next: "anim_complexity", val: 600 },
        { label: "60 segundos", next: "anim_complexity", val: 1200 }
      ]
    },
    anim_complexity: {
      msg: "¿Necesitas que modelemos todo desde cero o podemos usar modelos de stock (más económico)?",
      options: [
        { label: "Modelos de Stock", next: "anim_style", val: 100 },
        { label: "Modelado Personalizado", next: "anim_style", val: 400 }
      ]
    },
    anim_style: {
      msg: "¿Qué nivel de realismo o estilo visual buscas?",
      options: [
        { label: "Estilizado / Low Poly", next: "urgency", val: 1 },
        { label: "Fotorrealista / VFX", next: "urgency", val: 1.5 } // Multiplicador
      ]
    },

    // ---------------- MODELO 3D ----------------
    model_type: {
      msg: "¡Genial! Para modelado 3D, ¿qué tipo de elemento necesitas modelar?",
      options: [
        { label: "Personaje / Avatar", next: "model_rig", val: 400 },
        { label: "Producto / Envase", next: "model_rig", val: 200 },
        { label: "Arquitectura / Escenario", next: "model_rig", val: 350 }
      ]
    },
    model_rig: {
      msg: "¿Necesitas que el modelo incluya Rigging (esqueleto listo para animar)?",
      options: [
        { label: "Sí, con Rigging", next: "urgency", val: 150 },
        { label: "No, solo el modelo", next: "urgency", val: 0 }
      ]
    },

    // ---------------- SITIO WEB ----------------
    web_type: {
      msg: "¡Perfecto! Para diseño web, ¿qué tipo de proyecto tienes en mente?",
      options: [
        { label: "Landing Page", next: "web_design", val: 250 },
        { label: "Web Corporativa", next: "web_design", val: 450 },
        { label: "Tienda Online (E-Commerce)", next: "web_design", val: 850 }
      ]
    },
    web_design: {
      msg: "¿Ya tienes la identidad gráfica (logo, colores) y los textos listos?",
      options: [
        { label: "Sí, tengo todo listo", next: "urgency", val: 0 },
        { label: "No, necesito ayuda con eso", next: "urgency", val: 150 }
      ]
    },

    // ---------------- FINAL COMÚN ----------------
    urgency: {
      msg: "Casi listos. ¿Para cuándo necesitas el proyecto terminado?",
      options: [
        { label: "Tiempo Normal (2-4 Semanas)", next: "contact", val: 1 },
        { label: "Urgente (Prioridad Alta)", next: "contact", val: 1.3 } // Multiplicador
      ]
    },
    contact: {
      msg: "¡Genial! Ya he calculado tu cotización estimada. Por favor ingresa tu Nombre y Correo para generar tu PDF personalizado y enviarlo a tu bandeja.",
      input: true
    }
  };

  let currentState = 'start';

  // Toggle Chat
  if(toggler) {
    toggler.addEventListener('click', () => {
      console.log("Chatbot button clicked");
      container.classList.add('show');
      toggler.style.display = 'none';
      
      const msgCount = body.querySelectorAll('.chat-msg').length;
      console.log("Current message count:", msgCount);
      
      if(msgCount === 0) {
        console.log("Initializing chat flow...");
        loadState('start');
      }
    });
  }

  if(closeBtn) {
    closeBtn.addEventListener('click', () => {
      container.classList.remove('show');
      setTimeout(() => { toggler.style.display = 'flex'; }, 300);
    });
  }

  function addBotMsg(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function addUserMsg(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typing';
    div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('typing');
    if(t) t.remove();
  }

  function loadState(stateKey) {
    currentState = stateKey;
    const state = chatFlow[stateKey];
    footer.innerHTML = '';
    showTyping();

    setTimeout(() => {
      hideTyping();
      addBotMsg(state.msg);

      if(state.options) {
        state.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'chat-option-btn';
          btn.innerText = opt.label;
          btn.onclick = () => handleOption(opt, stateKey);
          footer.appendChild(btn);
        });
      } else if (state.input) {
        footer.innerHTML = `
          <input type="text" id="chat-name" class="chat-input" placeholder="Tu Nombre" required>
          <input type="email" id="chat-email" class="chat-input" placeholder="Tu Correo Electrónico" required>
          <button class="btn btn-gold-primary w-100 mt-2" id="chat-submit">Generar Cotización PDF</button>
        `;
        document.getElementById('chat-submit').addEventListener('click', handleContactSubmit);
      }
    }, 800);
  }

  function handleOption(opt, stateKey) {
    addUserMsg(opt.label);
    
    // Acumular lógica de precios y detalles
    if(stateKey === 'start') {
      quoteData.service = opt.label;
      quoteData.total = 0; // reset
      quoteData.details = [];
    } else if (stateKey === 'anim_duration' || stateKey === 'anim_complexity' || stateKey === 'model_type' || stateKey === 'model_rig' || stateKey === 'web_type' || stateKey === 'web_design') {
      quoteData.details.push(opt.label);
      quoteData.total += opt.val;
    } else if (stateKey === 'anim_style') {
      quoteData.details.push(opt.label);
      quoteData.total = quoteData.total * opt.val;
    } else if (stateKey === 'urgency') {
      quoteData.urgencyText = opt.label;
      quoteData.total = Math.round(quoteData.total * opt.val);
    }

    footer.innerHTML = '';
    loadState(opt.next);
  }

  function handleContactSubmit() {
    const name = document.getElementById('chat-name').value;
    const email = document.getElementById('chat-email').value;

    if(!name || !email) {
      alert("Por favor ingresa tu nombre y correo.");
      return;
    }

    quoteData.name = name;
    quoteData.email = email;
    addUserMsg(`Nombre: ${name}<br>Email: ${email}`);
    footer.innerHTML = '';
    
    showTyping();
    setTimeout(() => {
      hideTyping();
      addBotMsg(`¡Gracias ${name}! El costo estimado de tu proyecto es de <b>$${quoteData.total} USD</b>. Estoy generando tu documento PDF y enviándolo a nuestro equipo...`);
      
      generatePDF();
      sendEmailNotification();
    }, 1000);
  }

  function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Diseño del PDF
    doc.setFillColor(11, 12, 16); // Fondo oscuro #0b0c10
    doc.rect(0, 0, 210, 40, 'F'); 
    
    doc.setTextColor(255, 183, 3); // Dorado #ffb703
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Lisar Studio", 105, 20, { align: "center" });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Cotizacion: ${quoteData.service}`, 105, 30, { align: "center" });

    // Datos del cliente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const today = new Date().toLocaleDateString();
    doc.text(`Fecha: ${today}`, 15, 55);
    doc.text(`Cliente: ${quoteData.name}`, 15, 62);
    doc.text(`Email: ${quoteData.email}`, 15, 69);

    // Tabla de Detalles usando AutoTable
    const bodyData = quoteData.details.map(item => ['+', item]);
    bodyData.push(['Tiempo de Entrega', quoteData.urgencyText]);
    bodyData.push(['', '']);
    bodyData.push(['TOTAL ESTIMADO', `$${quoteData.total} USD`]);

    doc.autoTable({
      startY: 80,
      headStyles: { fillColor: [255, 183, 3], textColor: [0, 0, 0] },
      head: [['Concepto', 'Detalle']],
      body: bodyData,
      theme: 'grid'
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Nota: Este es un valor estimado generado automaticamente por Lisar IA.", 105, 275, { align: "center" });
    doc.text("Para un presupuesto exacto y formal, nos pondremos en contacto contigo.", 105, 280, { align: "center" });
    doc.text("www.lisarstudio.cl - peter@lisarstudio.cl", 105, 285, { align: "center" });

    doc.save(`Cotizacion_LisarStudio_${quoteData.name.replace(/\s/g, '_')}.pdf`);
  }

  function sendEmailNotification() {
    fetch('https://formspree.io/f/mpqvgwjv', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: quoteData.email,
        name: quoteData.name,
        message: `Nueva cotizacion de ${quoteData.service}: $${quoteData.total} USD. Detalles: ${quoteData.details.join(', ')}. Urgencia: ${quoteData.urgencyText}.`
      })
    })
    .then(response => {
      if (response.ok) {
        addBotMsg("✅ ¡Cotización guardada exitosamente y PDF descargado! He notificado a peter@lisarstudio.cl con tus datos para agendar una reunión y afinar los detalles de tu proyecto.");
      } else {
        addBotMsg("✅ ¡PDF descargado! Hubo un detalle al enviar el correo automático, pero puedes contactarnos directamente al WhatsApp o al correo peter@lisarstudio.cl.");
      }
    })
    .catch(error => {
      console.error('Error enviando a formspree:', error);
      addBotMsg("✅ ¡PDF descargado! Hubo un detalle de red al enviar el correo automático, pero puedes contactarnos directamente al WhatsApp o al correo peter@lisarstudio.cl.");
    });
  }

  window.triggerPromoChatbot = function(discount = 30) {
    if (localStorage.getItem('lisar_discount_game2_claimed') === 'true') {
      container.classList.add('show');
      toggler.style.display = 'none';
      body.innerHTML = '';
      footer.innerHTML = '';
      addBotMsg("🤖 ¡Hola! Ya has reclamado el cupón de descuento correspondiente a esta partida. Para obtener un nuevo beneficio debes jugar una partida nueva. 🚀");
      
      const btnReplay = document.createElement('button');
      btnReplay.className = 'chat-option-btn';
      btnReplay.innerText = '🎮 Jugar una nueva partida';
      btnReplay.onclick = () => {
        container.classList.remove('show');
        toggler.style.display = 'flex';
        const gameSec = document.getElementById('advergames');
        if (gameSec) gameSec.scrollIntoView({ behavior: 'smooth' });
      };
      footer.appendChild(btnReplay);
      return;
    }

    // Registrar reclamado para impedir acumulaciones múltiples en una misma partida
    localStorage.setItem('lisar_discount_game2_claimed', 'true');

    container.classList.add('show');
    toggler.style.display = 'none';
    
    body.innerHTML = '';
    footer.innerHTML = '';
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        
        let msg = `¡Felicidades! Has acumulado un ${discount}% de descuento para tu servicio en Lisar Studio. Este beneficio es válido por 1 sola partida jugada. ¿Deseas aplicarlo en tu cotización ahora? 🚀`;
        
        addBotMsg("🤖 " + msg);
        
        const btnSi = document.createElement('button');
        btnSi.className = 'chat-option-btn';
        btnSi.innerText = '¡Quiero cotizar con mi descuento! 💬';
        btnSi.onclick = () => {
            addUserMsg('¡Quiero cotizar con mi descuento! 💬');
            loadState('start');
        };
        
        const btnNo = document.createElement('button');
        btnNo.className = 'chat-option-btn';
        btnNo.innerText = 'No, gracias';
        btnNo.onclick = () => {
            addUserMsg('No, gracias');
            addBotMsg('🤖 ¡Entendido! Tu beneficio de esta partida ha sido registrado. Juega otra partida si deseas superar tu récord. 😉');
        };
        
        footer.appendChild(btnSi);
        footer.appendChild(btnNo);
    }, 1000);
  };

  let persuasionTriggered = false;
  window.triggerAIPersuasion = function(context) {
    if (persuasionTriggered) return;
    persuasionTriggered = true;
    
    container.classList.add('show');
    toggler.style.display = 'none';
    
    body.innerHTML = '';
    footer.innerHTML = '';
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        let customMsg = "¡Hola! Veo que te interesan nuestros servicios. ¿Tienes alguna duda sobre nuestro proceso de trabajo o plazos de entrega?";
        if (context === 'advergames') {
            customMsg = "¡Hola! Veo que te interesan los Advergames y Videojuegos Corporativos. ¿Sabías que los juegos disparan la interacción y conversión de tu marca? 🤩 ¿Tienes dudas sobre cómo es el proceso para crear uno?";
        } else if (context === 'web') {
            customMsg = "¡Hola! Veo que estás explorando nuestros Planes Web. Una web rápida y optimizada para ventas es vital hoy en día. ¿Te gustaría saber cómo es nuestro proceso de desarrollo (pipeline)?";
        } else if (context === '3d') {
            customMsg = "¡Hola! Veo que te interesa el Diseño 3D o los Reels Virales. Nuestros renders logran hasta 300% más alcance en Instagram. ¿Quieres saber sobre los plazos y proceso de animación?";
        }
        
        addBotMsg(customMsg);
        
        const btnFAQ = document.createElement('button');
        btnFAQ.className = 'chat-option-btn';
        btnFAQ.innerText = 'Sí, cuéntame el proceso 🤔';
        btnFAQ.onclick = () => {
            addUserMsg('Sí, cuéntame el proceso 🤔');
            if (context === 'advergames') loadState('faq_games');
            else if (context === 'web') loadState('faq_web');
            else if (context === '3d') loadState('faq_3d');
            else loadState('service_faq');
        };
        
        const btnNo = document.createElement('button');
        btnNo.className = 'chat-option-btn';
        btnNo.innerText = 'Solo quiero cotizar 🚀';
        btnNo.onclick = () => {
            addUserMsg('Solo quiero cotizar 🚀');
            if (context === 'advergames') loadState('game_type');
            else if (context === 'web') loadState('web_type');
            else if (context === '3d') loadState('anim_duration');
            else loadState('start');
        };
        
        footer.innerHTML = '';
        footer.appendChild(btnFAQ);
        footer.appendChild(btnNo);
    }, 1500);
  };
});
