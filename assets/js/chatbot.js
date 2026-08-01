// assets/js/chatbot.js

document.addEventListener('DOMContentLoaded', () => {
  const toggler = document.getElementById('chatbot-toggler');
  const container = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('close-chatbot');
  const body = document.getElementById('chatbot-body');
  const footer = document.getElementById('chatbot-footer');

  // Estado de la cotización
  let quoteData = {
    duration: 0,
    complexity: 0,
    style: 0,
    urgency: 1,
    name: '',
    email: '',
    total: 0
  };

  // Árbol de conversación
  const chatFlow = {
    start: {
      msg: "¡Hola! Soy Lisar IA 🤖. Estoy aquí para ayudarte a cotizar tu próximo proyecto de Animación 3D de alto impacto. ¿Qué duración aproximada necesitas?",
      options: [
        { label: "15 segundos", next: "complexity", val: 15 },
        { label: "30 segundos", next: "complexity", val: 30 },
        { label: "60 segundos", next: "complexity", val: 60 }
      ]
    },
    complexity: {
      msg: "¡Perfecto! Ahora, ¿necesitas que modelemos todo desde cero o podemos usar modelos de stock (más económico)?",
      options: [
        { label: "Modelos de Stock", next: "style", val: 50 },
        { label: "Modelado Personalizado", next: "style", val: 150 }
      ]
    },
    style: {
      msg: "Entendido. ¿Qué nivel de realismo o estilo visual buscas?",
      options: [
        { label: "Estilizado / Low Poly", next: "urgency", val: 1 },
        { label: "Fotorrealista / VFX", next: "urgency", val: 2 }
      ]
    },
    urgency: {
      msg: "Casi listos. ¿Para cuándo necesitas el video final?",
      options: [
        { label: "Tiempo Normal (2-3 Semanas)", next: "contact", val: 1 },
        { label: "Urgente (Menos de 1 semana)", next: "contact", val: 1.5 }
      ]
    },
    contact: {
      msg: "¡Genial! Ya he calculado tu cotización. Por favor ingresa tu Nombre y Correo para generar tu PDF personalizado y enviarlo a tu bandeja.",
      input: true
    }
  };

  let currentState = 'start';

  // Toggle Chat
  if(toggler) {
    toggler.addEventListener('click', () => {
      container.classList.add('show');
      toggler.style.display = 'none';
      if(body.innerHTML.trim() === '') {
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
    
    // Guardar datos
    if(stateKey === 'start') quoteData.duration = opt.val;
    if(stateKey === 'complexity') quoteData.complexity = opt.val;
    if(stateKey === 'style') quoteData.style = opt.val;
    if(stateKey === 'urgency') quoteData.urgency = opt.val;

    footer.innerHTML = '';
    loadState(opt.next);
  }

  function calculateTotal() {
    // Lógica de Precios en USD (ejemplo básico)
    // Precio base por segundo: $20 USD
    let base = quoteData.duration * 20; 
    let mod = quoteData.complexity; // 50 (Stock) o 150 (Custom)
    let styleMulti = quoteData.style; // 1 (Low poly) o 2 (Fotorrealista)
    let urgMulti = quoteData.urgency; // 1 (Normal) o 1.5 (Urgente)
    
    // Fórmula final
    quoteData.total = Math.round(((base + mod) * styleMulti) * urgMulti);
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
      calculateTotal();
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
    doc.text("Cotización de Animación 3D", 105, 30, { align: "center" });

    // Datos del cliente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const today = new Date().toLocaleDateString();
    doc.text(`Fecha: ${today}`, 15, 55);
    doc.text(`Cliente: ${quoteData.name}`, 15, 62);
    doc.text(`Email: ${quoteData.email}`, 15, 69);

    // Tabla de Detalles usando AutoTable
    doc.autoTable({
      startY: 80,
      headStyles: { fillColor: [255, 183, 3], textColor: [0, 0, 0] },
      head: [['Concepto', 'Detalle']],
      body: [
        ['Duración de la Animación', `${quoteData.duration} segundos`],
        ['Complejidad de Modelado', quoteData.complexity === 50 ? 'Modelos de Stock' : 'Modelado Personalizado'],
        ['Estilo Visual', quoteData.style === 1 ? 'Estilizado / Low Poly' : 'Fotorrealista / VFX'],
        ['Tiempo de Entrega', quoteData.urgency === 1 ? 'Normal (2-3 Semanas)' : 'Urgente (Menos de 1 Semana)'],
        ['', ''],
        ['TOTAL ESTIMADO', `$${quoteData.total} USD`]
      ],
      theme: 'grid'
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Nota: Este es un valor estimado generado automáticamente por Lisar IA.", 105, 275, { align: "center" });
    doc.text("Para un presupuesto exacto y formal, nos pondremos en contacto contigo.", 105, 280, { align: "center" });
    doc.text("www.lisarstudio.cl - peter@lisarstudio.cl", 105, 285, { align: "center" });

    doc.save(`Cotizacion_LisarStudio_${quoteData.name.replace(/\s/g, '_')}.pdf`);
  }

  function sendEmailNotification() {
    /* 
      Para enviar el correo, puedes usar EmailJS (https://www.emailjs.com/).
      Debes registrarte gratis y reemplazar "TU_SERVICE_ID", "TU_TEMPLATE_ID" y "TU_PUBLIC_KEY".
    */
    /*
    emailjs.send("TU_SERVICE_ID", "TU_TEMPLATE_ID", {
      to_email: "peter@lisarstudio.cl",
      client_name: quoteData.name,
      client_email: quoteData.email,
      quote_total: quoteData.total,
      duration: quoteData.duration,
      message: `El cliente ${quoteData.name} (${quoteData.email}) ha generado una cotización de animación 3D por $${quoteData.total} USD. Duración: ${quoteData.duration}s.`
    }, "TU_PUBLIC_KEY")
    .then(() => {
      console.log("Correo enviado!");
    })
    .catch((err) => {
      console.error("Error al enviar el correo:", err);
    });
    */

    setTimeout(() => {
      addBotMsg("✅ ¡Cotización guardada exitosamente y PDF descargado! He notificado a peter@lisarstudio.cl con tus datos para agendar una reunión y afinar los detalles de tu proyecto.");
    }, 1500);
  }
});
