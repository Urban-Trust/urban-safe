document.addEventListener('DOMContentLoaded', () => {
  const chatArea = document.getElementById('chatArea');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('msgInput');
  const attachBtn = document.getElementById('attachBtn');
  const attachMenuDropdown = document.getElementById('attachMenuDropdown');
  const attachImageBtn = document.getElementById('attachImageBtn');
  const attachPollBtn = document.getElementById('attachPollBtn');
  const attachEventBtn = document.getElementById('attachEventBtn');
  const chatImageInput = document.getElementById('chatImageInput');
  const eventModal = document.getElementById('eventModal');
  const eventModalClose = document.getElementById('eventModalClose');
  const eventForm = document.getElementById('eventForm');
  const eventChooseImageBtn = document.getElementById('eventChooseImageBtn');
  const eventAttachmentName = document.getElementById('eventAttachmentName');
  const eventAttachmentHidden = document.getElementById('eventAttachmentImage');
  const eventMapBtn = document.getElementById('eventMapBtn');
  const imagePickerModal = document.getElementById('imagePickerModal');
  const imagePickerGrid = document.getElementById('imagePickerGrid');
  const imagePickerClose = document.getElementById('imagePickerClose');
  const eventSuccessOverlay = document.getElementById('eventSuccessOverlay');
  let menuOpen = false;
  let lastFocusedElement = null;
  let successTimer = null;
  let pendingImageChatId = null;
  let speechRecognition = null;
  let isRecordingVoice = false;
  let isListeningMessages = false;
  const playedMessages = new Set();
  let speechQueue = [];
  let mediaRecorder = null;
  let mediaStream = null;
  let audioChunks = [];
  let lastAudioBlob = null;

  // --- Datos de ejemplo y renderizado de mensajes ---
  const currentUserId = 'user1'; // Asumimos que este es el usuario actual
  const blockedUsers = new Set(); // Para almacenar usuarios bloqueados
  const blockedThanksMessages = new Set(); // Para rastrear mensajes específicos bloqueados

  const users = {
    'user1': { id: 'user1', name: 'Tú', avatarInitial: 'T' },
    'user2': { id: 'user2', name: 'Lorena', avatarInitial: 'L' },
    'user3': { id: 'user3', name: 'Carlos', avatarInitial: 'C' },
    'user4': { id: 'user4', name: 'Ana', avatarInitial: 'A' },
    'user5': { id: 'user5', name: 'Pedro', avatarInitial: 'P' },
  };

  // Agregamos más mensajes de ejemplo con el texto específico
  const initialMessages = [
    { id: 'msg1', text: 'Hola a todos, recuerden la reunión de seguridad de mañana a las 8pm en la plaza.', userId: 'user2', timestamp: '9:40 AM' },
    { id: 'msg2', text: '¡Claro! Ahí estaré. Gracias por el aviso.', userId: 'user3', timestamp: '9:41 AM' },
    { id: 'msg3', text: 'Confirmado, gracias por el recordatorio, Lorena.', userId: 'user1', timestamp: '9:42 AM' },
    { id: 'msg4', text: 'Gracias por el aviso — lo revisamos.', userId: 'user4', timestamp: '9:43 AM' },
    { id: 'msg5', text: 'Excelente noticia, estaré pendiente.', userId: 'user5', timestamp: '9:44 AM' },
    { id: 'msg6', text: 'Gracias por el aviso — lo revisamos.', userId: 'user3', timestamp: '9:45 AM' },
    { id: 'msg7', text: 'Yo también revisaré la información, gracias.', userId: 'user2', timestamp: '9:46 AM' },
    { id: 'msg8', text: 'Gracias por el aviso — lo revisamos.', userId: 'user4', timestamp: '9:47 AM' },
  ];

  // Función especial para manejar el texto específico
  function isSpecialThanksMessage(text) {
    return text === 'Gracias por el aviso — lo revisamos.';
  }

  // Función para crear el círculo y menú contextual
  function addMessageOptions(msgDiv, isSelf, senderId, messageId) {
    // Crear contenedor para posicionamiento relativo
    const msgContainer = document.createElement('div');
    msgContainer.className = 'msg-container';
    msgContainer.style.position = 'relative';
    msgContainer.style.display = 'inline-block';
    msgContainer.style.width = '100%';

    // Mover el contenido del mensaje al contenedor
    const bodyDiv = msgDiv.querySelector('.msg-body');
    if (bodyDiv) {
      msgContainer.appendChild(bodyDiv);
    }

    // Solo agregar opciones si no es mensaje propio
    if (!isSelf) {
      // Crear el círculo/botón de opciones
      const optionsBtn = document.createElement('button');
      optionsBtn.className = 'msg-options-btn';
      optionsBtn.setAttribute('aria-label', 'Opciones del mensaje');
      optionsBtn.innerHTML = '⋯'; // Tres puntos verticales
      optionsBtn.dataset.senderId = String(senderId).trim();
      optionsBtn.dataset.messageId = messageId;
      
      // Crear el menú contextual
      const contextMenu = document.createElement('div');
      contextMenu.className = 'msg-context-menu';
      contextMenu.innerHTML = `
        <div class="context-menu-item delete" data-action="delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"/>
          </svg>
          Eliminar mensaje
        </div>
        <div class="context-menu-item block" data-action="block">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
          </svg>
          Bloquear usuario
        </div>
      `;

      // Agregar eventos
      optionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Cerrar otros menús abiertos
        document.querySelectorAll('.msg-context-menu').forEach(menu => {
          if (menu !== contextMenu) menu.classList.remove('show');
        });
        
        // Mostrar este menú
        contextMenu.classList.toggle('show');
      });

      // Cerrar menú al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target) && !optionsBtn.contains(e.target)) {
          contextMenu.classList.remove('show');
        }
      });

      // Manejar acciones del menú
      contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = item.dataset.action;
          
          if (action === 'delete') {
            // Eliminar mensaje
            const textDiv = msgDiv.querySelector('.msg-text');
            if (textDiv) {
              textDiv.textContent = 'este mensaje ha sido eliminado';
              msgDiv.classList.add('msg-deleted');
            }
            contextMenu.classList.remove('show');
          } else if (action === 'block') {
            // Bloquear usuario - con la funcionalidad especial
            const senderId = optionsBtn.dataset.senderId;
            blockUserMessages(senderId);
            contextMenu.classList.remove('show');
          }
        });
      });

      // Agregar elementos al contenedor
      msgContainer.appendChild(optionsBtn);
      msgContainer.appendChild(contextMenu);
    } else {
      // Para mensajes propios, mantener el botón de eliminar original
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-msg-btn';
      deleteBtn.setAttribute('aria-label', 'Eliminar mensaje');
      deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteModal(msgDiv);
      });
      
      msgContainer.appendChild(deleteBtn);
    }

    // Reemplazar el contenido del mensaje con el contenedor
    const avatarDiv = msgDiv.querySelector('.msg-avatar');
    if (isSelf) {
      msgDiv.innerHTML = '';
      msgDiv.appendChild(msgContainer);
      msgDiv.appendChild(avatarDiv);
    } else {
      msgDiv.innerHTML = '';
      msgDiv.appendChild(avatarDiv);
      msgDiv.appendChild(msgContainer);
    }
  }

  // Función para bloquear todos los mensajes de un usuario CON LA FUNCIONALIDAD ESPECIAL
  // Función para bloquear todos los mensajes de un usuario CON LA FUNCIONALIDAD ESPECIAL
    function blockUserMessages(senderId) {
      if (!senderId && senderId !== 0) return;

      const normalizedTarget = String(senderId).trim().toLowerCase();
      blockedUsers.add(normalizedTarget);

      const allMsgs = Array.from(document.querySelectorAll('.msg'));

      allMsgs.forEach(msg => {
        const ds = (msg.dataset.senderId || '').trim().toLowerCase();
        if (ds !== normalizedTarget) return;

        // Buscar .msg-text en cualquier lugar del mensaje
        const textDiv = msg.querySelector('.msg-text');
        if (!textDiv) return;

        // Tomar texto original si existe
        const originalText = textDiv.getAttribute('data-original-text') || textDiv.textContent || '';

        // Caso especial (Tu lógica personalizada)
        if (originalText === 'Gracias por el aviso — lo revisamos.') {
          textDiv.textContent = 'Usuario bloqueado';
        } else {
          textDiv.textContent = 'Mensaje bloqueado';
        }

        msg.classList.add('msg-blocked');

        // Ocultar opciones del menú contextual
        const btn = msg.querySelector('.msg-options-btn');
        if (btn) btn.style.display = 'none';
      });
    }






  // Función para mostrar notificación especial
  function showSpecialBlockNotification() {
    const notification = document.createElement('div');
    notification.className = 'special-block-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
      ">
        <strong>¡Bloqueo especial activado!</strong><br>
        <small>Los mensajes de "Gracias por el aviso" ahora dicen "Usuario bloqueado" 😄</small>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function createMessageElement(message) {
    const user = users[message.userId];
    const isSelf = user.id === currentUserId;


    
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isSelf ? 'msg-self' : 'msg-other'}`;
    msgDiv.dataset.messageId = message.id;
    msgDiv.dataset.senderId = String(message.userId).trim();

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'msg-avatar';
    avatarDiv.textContent = user.avatarInitial;

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'msg-body';

    const textDiv = document.createElement('div');
    textDiv.classList.add('msg-text');

    textDiv.setAttribute('data-original-text', message.text); // ← ***CLAVE***
    textDiv.textContent = message.text;

    // GUARDA EL TEXTO ORIGINAL EN UN ATRIBUTO
    textDiv.setAttribute('data-original-text', message.text);
    
    
    // Verificar si es el texto específico para darle estilo especial
    if (isSpecialThanksMessage(message.text) && !blockedThanksMessages.has(message.id)) {
      textDiv.textContent = message.text;
      textDiv.classList.add('thanks-text');
    } else if (blockedThanksMessages.has(message.id)) {
      textDiv.textContent = 'Usuario bloqueado';
      textDiv.classList.add('blocked');
    } else {
      textDiv.textContent = message.text;
    }

    const metaDiv = document.createElement('div');
    metaDiv.className = 'msg-meta';
    metaDiv.textContent = `${isSelf ? '' : user.name + ' - '}${message.timestamp}`;
    
    bodyDiv.appendChild(textDiv);
    if (message.audioUrl) {
      const audioEl = document.createElement('audio');
      audioEl.controls = true;
      audioEl.src = message.audioUrl;
      audioEl.className = 'chat-audio';
      bodyDiv.appendChild(audioEl);
    }
    bodyDiv.appendChild(metaDiv);

    // Verificar si el usuario está bloqueado
    if (blockedUsers.has(message.userId) && !isSelf) {
      const originalText = message.text;

      if (originalText === 'Gracias por el aviso — lo revisamos.') {
        textDiv.textContent = 'Usuario bloqueado';
      } else {
        textDiv.textContent = 'Mensaje bloqueado';
      }

      msgDiv.classList.add('msg-blocked');
    }


    if (isSelf) {
      msgDiv.appendChild(bodyDiv);
      msgDiv.appendChild(avatarDiv);
    } else {
      msgDiv.appendChild(avatarDiv);
      msgDiv.appendChild(bodyDiv);
    }

    // Agregar opciones de mensaje
    addMessageOptions(msgDiv, isSelf, message.userId, message.id);

    return msgDiv;
  }

  function addMessageToDOM(message) {
    const msgEl = createMessageElement(message);
    chatArea.appendChild(msgEl);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // Procesar mensajes iniciales
  initialMessages.forEach(addMessageToDOM);

  // También agregar opciones a los mensajes que ya están en el DOM por defecto
  function addOptionsToExistingMessages() {
    const existingMessages = chatArea.querySelectorAll('.msg');
    existingMessages.forEach(msg => {
      const isSelf = msg.classList.contains('msg-self');
      const senderId = msg.dataset.senderId;
      const messageId = msg.dataset.messageId;
      
      if (!msg.querySelector('.msg-options-btn') && !isSelf) {
        addMessageOptions(msg, isSelf, senderId, messageId);
      }
    });
  }

  // Ejecutar después de un pequeño delay para asegurar que el DOM esté listo
  setTimeout(addOptionsToExistingMessages, 100);

  // --- FIN: Funcionalidad de círculo y menú contextual ---

  const projectImages = [
    { src: 'assets/images/adjuntar-imagen-4.jpg', label: 'Patrullaje - Plaza' },
    { src: 'assets/images/adjuntar-imagen-6.jpg', label: 'Control del parque' },
    { src: 'assets/images/adjuntar-imagen-1.jpg', label: 'Ingreso principal' }
  ];
  let imagePickerAction = null;

  const resetEventForm = () => {
    if (!eventForm) return;
    eventForm.reset();
    if (eventAttachmentName) {
      eventAttachmentName.textContent = 'Ninguna imagen seleccionada';
    }
    if (eventAttachmentHidden) {
      eventAttachmentHidden.value = '';
      delete eventAttachmentHidden.dataset.label;
    }
  };

  const openEventModal = () => {
    if (!eventModal) return;
    lastFocusedElement = document.activeElement;
    eventModal.classList.remove('hidden');
    eventModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (eventForm) {
      setTimeout(() => {
        const titleInput = eventForm.querySelector('#eventTitle');
        titleInput && titleInput.focus();
      }, 0);
    }
  };

  const closeEventModal = () => {
    if (!eventModal) return;
      eventModal.classList.add('hidden');
      eventModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      resetEventForm();
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    };

    const renderImagePicker = () => {
      if (!imagePickerGrid) return;
      imagePickerGrid.innerHTML = '';
      projectImages.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'asset-picker-card';
        btn.innerHTML = `
          <img src="${item.src}" alt="${item.label}">
          <span>${item.label}</span>
        `;
        btn.addEventListener('click', () => {
          if (typeof imagePickerAction === 'function') {
            imagePickerAction(item);
          }
          closeImagePicker();
        });
        imagePickerGrid.appendChild(btn);
      });
    };

    const openImagePicker = (action) => {
      if (!imagePickerModal) return;
      imagePickerAction = action;
      renderImagePicker();
      imagePickerModal.classList.remove('hidden');
      imagePickerModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeImagePicker = () => {
      if (!imagePickerModal) return;
      imagePickerModal.classList.add('hidden');
      imagePickerModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const showEventSuccess = () => {
      if (!eventSuccessOverlay) return;
      eventSuccessOverlay.classList.remove('hidden');
      eventSuccessOverlay.setAttribute('aria-hidden', 'false');
      clearTimeout(successTimer);
      successTimer = setTimeout(() => hideEventSuccess(), 2200);
    };

    const hideEventSuccess = () => {
      if (!eventSuccessOverlay) return;
      eventSuccessOverlay.classList.add('hidden');
      eventSuccessOverlay.setAttribute('aria-hidden', 'true');
    };

    eventSuccessOverlay && eventSuccessOverlay.addEventListener('click', hideEventSuccess);

    // Toggle attach menu on button click
    attachBtn.addEventListener('click', (e) => {
      e.preventDefault();
      menuOpen = !menuOpen;
      if (menuOpen) {
        attachMenuDropdown.classList.remove('hidden');
      } else {
        attachMenuDropdown.classList.add('hidden');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (menuOpen && !form.contains(e.target)) {
        menuOpen = false;
        attachMenuDropdown.classList.add('hidden');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const newMessage = {
        id: `msg_${Date.now()}`,
        text: text,
        userId: currentUserId,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric' })
      };
      addMessageToDOM(newMessage);

      const chatId = window.chatAPI && window.chatAPI.getCurrentChatId ? window.chatAPI.getCurrentChatId() : null;
      if (chatId) {
        window.chatAPI.sendMessageToChat(chatId, text);
      }
      
      input.value = '';
      input.focus();
    });

    // Adjuntar imagen cargando un archivo local
    attachImageBtn.addEventListener('click', () => {
      menuOpen = false;
      attachMenuDropdown.classList.add('hidden');
      const chatId = window.chatAPI?.getCurrentChatId?.();
      if (!chatId) {
        alert('Selecciona una conversacion antes de adjuntar imagenes.');
        return;
      }
      if (!chatImageInput) {
        alert('No se encontro el selector de archivos.');
        return;
      }
      pendingImageChatId = chatId;
      chatImageInput.value = '';
      chatImageInput.click();
    });

    chatImageInput && chatImageInput.addEventListener('change', (event) => {
      const inputEl = event.target;
      const file = inputEl.files && inputEl.files[0];
      if (!file) {
        pendingImageChatId = null;
        return;
      }
      if (!file.type || !file.type.startsWith('image/')) {
        alert('Selecciona un archivo de imagen valido.');
        inputEl.value = '';
        pendingImageChatId = null;
        return;
      }
      if (!pendingImageChatId) {
        alert('Selecciona una conversacion antes de adjuntar imagenes.');
        inputEl.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (dataUrl) {
          if (window.chatAPI?.sendImageInChat) {
            window.chatAPI.sendImageInChat(pendingImageChatId, dataUrl);
          } else {
            console.info('Imagen lista para enviar al chat');
          }
        } else {
          alert('No se pudo leer la imagen seleccionada.');
        }
        pendingImageChatId = null;
        inputEl.value = '';
      };
      reader.onerror = () => {
        alert('Ocurrio un problema al leer la imagen. Intentalo nuevamente.');
        pendingImageChatId = null;
        inputEl.value = '';
      };
      reader.readAsDataURL(file);
    });

    imagePickerClose && imagePickerClose.addEventListener('click', closeImagePicker);
    imagePickerModal && imagePickerModal.addEventListener('click', (evt) => {
      if (evt.target === imagePickerModal) closeImagePicker();
    });

    // auto-scroll al cargar para ver últimos mensajes
    chatArea.scrollTop = chatArea.scrollHeight;

    // --- Handler para abrir modal de dictado por voz ---
    const voiceModal = document.getElementById('voiceModal');
    const attachVoiceBtn = document.getElementById('attachVoiceBtn');
    const closeVoiceModal = document.getElementById('closeVoiceModal');
    const startVoiceBtn = document.getElementById('startVoiceBtn');
    const stopVoiceBtn = document.getElementById('stopVoiceBtn');
    const sendVoiceBtn = document.getElementById('sendVoiceBtn');
    const cancelVoiceBtn = document.getElementById('cancelVoiceBtn');
    const voiceTranscript = document.getElementById('voiceTranscript');
    const voiceStatus = document.getElementById('voiceStatus');

    function openVoiceModal() {
      lastFocusedElement = document.activeElement;
      if (voiceModal) {
        voiceModal.classList.remove('hidden');
        voiceModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (voiceTranscript) { voiceTranscript.value = ''; }
        if (voiceStatus) { voiceStatus.textContent = 'Listo para dictar'; }
        isRecordingVoice = false;
        sendVoiceBtn && (sendVoiceBtn.disabled = true);
      }
    }

    function closeVoiceModalFn() {
      if (!voiceModal) return;
      stopRecognition();
      voiceModal.classList.add('hidden');
      voiceModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
    }

    function ensureSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
      if (!SpeechRecognition) {
        return null;
      }
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'es-PE';
      return recog;
    }

    function startRecognition() {
      if (isRecordingVoice) return;
      speechRecognition = ensureSpeechRecognition();
      lastAudioBlob = null;
      if (speechRecognition) {
        // Browser supports Web Speech API
        voiceStatus.textContent = 'Grabando...';
        isRecordingVoice = true;
      } else {
        // Fallback to MediaRecorder (audio) when SpeechRecognition not available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Tu navegador no soporta reconocimiento de voz en tiempo real ni grabación de audio. Considera usar Chrome o Edge.');
          return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          mediaStream = stream;
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];
          mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunks.push(e.data); };
          mediaRecorder.onstop = () => {
            lastAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            if (voiceTranscript) voiceTranscript.value = '[Grabación de audio lista]';
            sendVoiceBtn && (sendVoiceBtn.disabled = false);
            voiceStatus.textContent = 'Grabación finalizada';
            // Stop the tracks so the mic is released
            try { mediaStream && mediaStream.getTracks().forEach(t => t.stop()); } catch (e) { }
          };
          mediaRecorder.start();
          voiceStatus.textContent = 'Grabando audio...';
          isRecordingVoice = true;
          startVoiceBtn && (startVoiceBtn.classList.add('hidden'));
          stopVoiceBtn && (stopVoiceBtn.classList.remove('hidden'));
        }).catch((err) => { console.error('getUserMedia error', err); alert('No se pudo iniciar la grabación. Revisa permisos.'); });
      }
      let interimText = '';
      let finalText = '';
      speechRecognition.onresult = (event) => {
        interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interimText += result[0].transcript;
          }
        }
        if (voiceTranscript) {
          voiceTranscript.value = (finalText + interimText).trim();
          sendVoiceBtn && (sendVoiceBtn.disabled = voiceTranscript.value.trim().length === 0);
        }
      };
      speechRecognition.onerror = (e) => {
        console.error('SpeechRecognition error', e);
        voiceStatus.textContent = 'Error de reconocimiento';
        isRecordingVoice = false;
        stopVoiceBtn && (stopVoiceBtn.classList.add('hidden'));
        startVoiceBtn && (startVoiceBtn.classList.remove('hidden'));
      };
      speechRecognition.onend = () => {
        isRecordingVoice = false;
        voiceStatus.textContent = 'Detenido';
        stopVoiceBtn && (stopVoiceBtn.classList.add('hidden'));
        startVoiceBtn && (startVoiceBtn.classList.remove('hidden'));
      };
      speechRecognition.start();
      startVoiceBtn && (startVoiceBtn.classList.add('hidden'));
      stopVoiceBtn && (stopVoiceBtn.classList.remove('hidden'));
    }

    function stopRecognition() {
      if (speechRecognition && typeof speechRecognition.stop === 'function') {
        try { speechRecognition.stop(); } catch (e) { /* ignore */ }
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        try { mediaRecorder.stop(); } catch (e) { /* ignore */ }
      }
      if (mediaStream) {
        try { mediaStream.getTracks().forEach(t => t.stop()); } catch (e) { }
        mediaStream = null;
      }
      isRecordingVoice = false;
      stopVoiceBtn && (stopVoiceBtn.classList.add('hidden'));
      startVoiceBtn && (startVoiceBtn.classList.remove('hidden'));
      voiceStatus && (voiceStatus.textContent = 'Listo para dictar');
    }

    if (attachVoiceBtn) {
      attachVoiceBtn.addEventListener('click', () => {
        menuOpen = false;
        attachMenuDropdown.classList.add('hidden');
        openVoiceModal();
      });
    }

    if (closeVoiceModal) closeVoiceModal.addEventListener('click', closeVoiceModalFn);
    if (cancelVoiceBtn) cancelVoiceBtn.addEventListener('click', () => { stopRecognition(); closeVoiceModalFn(); });
    if (startVoiceBtn) startVoiceBtn.addEventListener('click', startRecognition);
    if (stopVoiceBtn) stopVoiceBtn.addEventListener('click', stopRecognition);

    // Send the transcribed voice as message
    if (sendVoiceBtn) sendVoiceBtn.addEventListener('click', () => {
      const text = voiceTranscript && voiceTranscript.value.trim();
      const hasAudio = !!lastAudioBlob;
      if (!text && !hasAudio) return;
      const newMessage = {
        id: `msg_${Date.now()}`,
        text: text,
        audioUrl: hasAudio ? URL.createObjectURL(lastAudioBlob) : null,
        userId: currentUserId,
        viaVoice: true,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric' })
      };
      addMessageToDOM(newMessage);
      const chatId = window.chatAPI && window.chatAPI.getCurrentChatId ? window.chatAPI.getCurrentChatId() : null;
      if (chatId) {
        if (hasAudio && window.chatAPI?.sendAudioInChat) {
          window.chatAPI.sendAudioInChat(chatId, lastAudioBlob);
        } else {
          window.chatAPI.sendMessageToChat(chatId, text);
        }
      }
      // free the audio blob (it is represented as URL locally in the message)
      lastAudioBlob = null;
      audioChunks = [];
      stopRecognition();
      closeVoiceModalFn();
    });

    // Update send button disabled state when transcript changes
    if (voiceTranscript) {
      voiceTranscript.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        sendVoiceBtn && (sendVoiceBtn.disabled = val.length === 0);
      });
    }

    // --- TTS (Escuchar mensajes) ---
    const attachVolumeBtn = document.getElementById('attachVolumeBtn');
    const volumeIconContainer = document.getElementById('volumeIconContainer');

    function readMessageEl(messageEl) {
      if (!messageEl || !window.speechSynthesis) return Promise.resolve();
      const id = messageEl.dataset.messageId;
      if (!id || playedMessages.has(id)) return Promise.resolve();
      const textEl = messageEl.querySelector('.msg-text');
      if (!textEl) return Promise.resolve();
      const text = textEl.textContent.trim();
      if (!text) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => {
          playedMessages.add(id);
          resolve();
        };
        utterance.onerror = (e) => { console.error('TTS error', e); resolve(); };
        window.speechSynthesis.speak(utterance);
      });
    }

    async function processSpeechQueue() {
      while (isListeningMessages && speechQueue.length > 0) {
        const el = speechQueue.shift();
        await readMessageEl(el);
        if (!isListeningMessages) break;
      }
    }

    function queueAllUnplayedMessages() {
      const all = Array.from(chatArea.querySelectorAll('.msg'));
      const unplayed = all.filter(m => m.dataset.messageId && !playedMessages.has(m.dataset.messageId));
      speechQueue.push(...unplayed);
      processSpeechQueue();
    }

    function startListening() {
      if (!window.speechSynthesis) { alert('Tu navegador no soporta síntesis de voz'); return; }
      isListeningMessages = true;
      queueAllUnplayedMessages();
      if (volumeIconContainer) volumeIconContainer.classList.remove('hidden');
      if (attachVolumeBtn) { attachVolumeBtn.classList.add('active'); attachVolumeBtn.setAttribute('aria-pressed','true'); }
    }

    function stopListening() {
      isListeningMessages = false;
      speechQueue = [];
      window.speechSynthesis.cancel();
      if (volumeIconContainer) volumeIconContainer.classList.add('hidden');
      if (attachVolumeBtn) { attachVolumeBtn.classList.remove('active'); attachVolumeBtn.setAttribute('aria-pressed','false'); }
    }

    // Attach dropdown volume button toggles listening as well
    if (attachVolumeBtn) {
      attachVolumeBtn.addEventListener('click', () => {
        menuOpen = false;
        attachMenuDropdown.classList.add('hidden');
        if (isListeningMessages) {
          stopListening();
        } else {
          startListening();
        }
      });
    }

    // Ensure newly added messages are queued for reading when listening is active
    const originalAddMessageToDOM = addMessageToDOM;
    addMessageToDOM = (message) => {
      originalAddMessageToDOM(message);
      const el = chatArea.querySelector(`[data-message-id="${message.id}"]`);
      if (isListeningMessages && el) {
        if (!playedMessages.has(message.id)) {
          speechQueue.push(el);
          processSpeechQueue();
        }
      }
    };
    
    // --- Poll creation UI handlers ---
    const pollModal = document.getElementById('pollModal');
    const pollQuestion = document.getElementById('pollQuestion');
    const pollOptionsContainer = document.getElementById('pollOptions');
    const addPollOption = document.getElementById('addPollOption');
    const createPollConfirm = document.getElementById('createPollConfirm');
    const createPollCancel = document.getElementById('createPollCancel');

    function openPollModal() {
      pollModal.classList.remove('hidden');
      pollModal.setAttribute('aria-hidden','false');
      pollQuestion.value = '';
      pollOptionsContainer.innerHTML = `
        <label>Opción 1 <input type="text" class="poll-option" placeholder="Texto opción 1" /></label>
        <label>Opción 2 <input type="text" class="poll-option" placeholder="Texto opción 2" /></label>
      `;
    }

    function closePollModal() {
      pollModal.classList.add('hidden');
      pollModal.setAttribute('aria-hidden','true');
    }

    attachPollBtn && attachPollBtn.addEventListener('click', () => {
      menuOpen = false;
      attachMenuDropdown.classList.add('hidden');
      openPollModal();
    });
    
    addPollOption && addPollOption.addEventListener('click', () => {
      const idx = pollOptionsContainer.querySelectorAll('.poll-option').length + 1;
      const lbl = document.createElement('label');
      lbl.innerHTML = `Opción ${idx} <input type="text" class="poll-option" placeholder="Texto opción ${idx}" />`;
      pollOptionsContainer.appendChild(lbl);
    });

    createPollCancel && createPollCancel.addEventListener('click', closePollModal);

    createPollConfirm && createPollConfirm.addEventListener('click', () => {
      const q = pollQuestion.value.trim();
      if (!q) { alert('Escribe una pregunta para la encuesta'); return; }
      const opts = Array.from(pollOptionsContainer.querySelectorAll('.poll-option')).map(i => i.value.trim()).filter(Boolean);
      if (opts.length < 2) { alert('Agrega al menos 2 opciones'); return; }
      const pollId = 'poll_' + Date.now();
      const pollObj = {
        pollId,
        question: q,
        options: opts.map(t => ({text: t, voters: []})),
        author: 'Tú'
      };
      const chatId = window.chatAPI && window.chatAPI.getCurrentChatId ? window.chatAPI.getCurrentChatId() : null;
      if (!chatId) { alert('No se encontró conversación activa'); closePollModal(); return; }
      window.chatAPI.createPollInChat(chatId, pollObj);
      closePollModal();
    });

    // Event button modal handling
    attachEventBtn && attachEventBtn.addEventListener('click', () => {
      menuOpen = false;
      attachMenuDropdown.classList.add('hidden');
      openEventModal();
    });

    eventModalClose && eventModalClose.addEventListener('click', closeEventModal);

    eventModal && eventModal.addEventListener('click', (evt) => {
      if (evt.target === eventModal) {
        closeEventModal();
      }
    });

    eventChooseImageBtn && eventChooseImageBtn.addEventListener('click', () => {
      openImagePicker((item) => {
        if (eventAttachmentName) {
          eventAttachmentName.textContent = item.label;
        }
        if (eventAttachmentHidden) {
          eventAttachmentHidden.value = item.src;
          eventAttachmentHidden.dataset.label = item.label;
        }
      });
    });

    eventMapBtn && eventMapBtn.addEventListener('click', () => {
      alert('Pronto podrás seleccionar la ubicación directamente desde el mapa.');
    });

    const shareEventInChat = (chatId, payload) => {
      if (!chatId) return;
      if (window.chatAPI?.createEventInChat) {
        window.chatAPI.createEventInChat(chatId, payload);
      } else if (window.chatAPI?.sendMessageToChat) {
        const summary = [
          `📅 ${payload.title}`,
          `Fecha: ${payload.date} - ${payload.time}`,
          `Lugar: ${payload.location}`,
          payload.description ? `Descripción: ${payload.description}` : null
        ].filter(Boolean).join('\n');
        window.chatAPI.sendMessageToChat(chatId, summary);
      } else {
        console.info('Evento creado (simulado):', payload);
      }
    };

    eventForm && eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('eventTitle')?.value.trim();
      const date = document.getElementById('eventDate')?.value.trim();
      const time = document.getElementById('eventTime')?.value.trim();
      const location = document.getElementById('eventLocation')?.value.trim();
      const description = document.getElementById('eventDescription')?.value.trim();
      const attachmentImage = eventAttachmentHidden?.value || '';
      const attachmentLabel = eventAttachmentHidden?.dataset?.label || null;

      if (!title || !date || !time || !location) {
        alert('Completa los campos obligatorios para crear el evento.');
        return;
      }

      const chatId = window.chatAPI?.getCurrentChatId?.() || null;
      if (!chatId) {
        alert('Selecciona una conversación antes de crear un evento.');
        return;
      }
      const basePayload = {
        title,
        date,
        time,
        location,
        description,
        attachmentName: attachmentLabel,
        createdAt: new Date().toISOString()
      };

      const finalize = (attachmentData) => {
        if (attachmentData) {
          basePayload.image = attachmentData;
        }
        shareEventInChat(chatId, basePayload);
        showEventSuccess();
        closeEventModal();
      };

      if (attachmentImage) {
        finalize(attachmentImage);
      } else {
        finalize(null);
      }
    });

});