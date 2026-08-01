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
      msg: "¡Hola! Soy Lisar IA 🤖. Estoy aquí para ayudarte a cotizar. ¿Qué servicio te gustaría cotizar hoy?",
      options: [
        { label: "Animación 3D", next: "anim_duration", val: 0 },
        { label: "Modelo 3D", next: "model_type", val: 0 },
        { label: "Sitio Web", next: "web_type", val: 0 }
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

  window.triggerPromoChatbot = function() {
    container.classList.add('show');
    toggler.style.display = 'none';
    
    // Clear any previous chat
    body.innerHTML = '';
    footer.innerHTML = '';
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        addBotMsg("🎉 ¡Felicidades por conseguir las 100 Lisar Coins! ¿Qué esperas para utilizar ese 30% de descuento en tu primer servicio? 🤩");
        
        const btnSi = document.createElement('button');
        btnSi.className = 'chat-option-btn';
        btnSi.innerText = '¡Quiero cotizar ahora! 🚀';
        btnSi.onclick = () => {
            addUserMsg('¡Quiero cotizar ahora! 🚀');
            loadState('start');
        };
        
        const btnNo = document.createElement('button');
        btnNo.className = 'chat-option-btn';
        btnNo.innerText = 'Luego, gracias.';
        btnNo.onclick = () => {
            addUserMsg('Luego, gracias.');
            footer.innerHTML = '';
            showTyping();
            setTimeout(() => {
                hideTyping();
                addBotMsg("¡No hay problema! Cuando estés listo, aquí estaré. Recuerda guardar tu captura de pantalla. 😉");
            }, 800);
        };
        
        footer.innerHTML = '';
        footer.appendChild(btnSi);
        footer.appendChild(btnNo);
    }, 1000);
  };
});
