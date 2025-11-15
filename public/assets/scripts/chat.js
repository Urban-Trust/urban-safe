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

  // --- NUEVO: Lógica de borrado de mensajes ---
  const deleteModal = document.getElementById('deleteConfirmationModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  let messageElementToDelete = null;

  const showDeleteModal = (messageEl) => {
    messageElementToDelete = messageEl;
    deleteModal.classList.remove('hidden');
    deleteModal.setAttribute('aria-hidden', 'false');
  };

  const hideDeleteModal = () => {
    messageElementToDelete = null;
    deleteModal.classList.add('hidden');
    deleteModal.setAttribute('aria-hidden', 'true');
  };

  confirmDeleteBtn.addEventListener('click', () => {
    if (messageElementToDelete) {
      messageElementToDelete.remove();
      hideDeleteModal();
    }
  });

  cancelDeleteBtn.addEventListener('click', hideDeleteModal);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      hideDeleteModal();
    }
  });
  // --- FIN NUEVO ---

  // --- NUEVO: Datos de ejemplo y renderizado de mensajes ---
  const currentUserId = 'user1'; // Asumimos que este es el usuario actual

  const users = {
    'user1': { id: 'user1', name: 'Tú', avatarInitial: 'T' },
    'user2': { id: 'user2', name: 'Lorena', avatarInitial: 'L' },
    'user3': { id: 'user3', name: 'Carlos', avatarInitial: 'C' },
  };

  const initialMessages = [
    { id: 'msg1', text: 'Hola a todos, recuerden la reunión de seguridad de mañana a las 8pm en la plaza.', userId: 'user2', timestamp: '9:40 AM' },
    { id: 'msg2', text: '¡Claro! Ahí estaré. Gracias por el aviso.', userId: 'user3', timestamp: '9:41 AM' },
    { id: 'msg3', text: 'Confirmado, gracias por el recordatorio, Lorena.', userId: 'user1', timestamp: '9:42 AM' },
  ];

  function createMessageElement(message) {
    const user = users[message.userId];
    const isSelf = user.id === currentUserId;

    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isSelf ? 'msg-self' : 'msg-other'}`;
    msgDiv.dataset.messageId = message.id;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'msg-avatar';
    avatarDiv.textContent = user.avatarInitial;

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'msg-body';

    const textDiv = document.createElement('div');
    textDiv.className = 'msg-text';
    textDiv.textContent = message.text;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'msg-meta';
    metaDiv.textContent = `${isSelf ? '' : user.name + ' - '}${message.timestamp}`;
    
    bodyDiv.appendChild(textDiv);
    bodyDiv.appendChild(metaDiv);

    // --- NUEVO: Crear y añadir el botón de borrar ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-msg-btn';
    deleteBtn.setAttribute('aria-label', 'Eliminar mensaje');
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path>
      </svg>
    `;
    deleteBtn.addEventListener('click', () => {
      showDeleteModal(msgDiv);
    });
    msgDiv.appendChild(deleteBtn);
    // --- FIN NUEVO ---

    if (isSelf) {
      msgDiv.appendChild(bodyDiv);
      msgDiv.appendChild(avatarDiv);
    } else {
      msgDiv.appendChild(avatarDiv);
      msgDiv.appendChild(bodyDiv);
    }

    return msgDiv;
  }

  function addMessageToDOM(message) {
    const msgEl = createMessageElement(message);
    chatArea.appendChild(msgEl);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  initialMessages.forEach(addMessageToDOM);
  // --- FIN NUEVO ---


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

    // --- NUEVO: Crear y renderizar el mensaje localmente ---
    const newMessage = {
      id: `msg_${Date.now()}`,
      text: text,
      userId: currentUserId,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric' })
    };
    addMessageToDOM(newMessage);
    // --- FIN NUEVO ---

    const chatId = window.chatAPI && window.chatAPI.getCurrentChatId ? window.chatAPI.getCurrentChatId() : null;
    if (chatId) {
      // use central API to send message (simulado)
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
      // reset to two inputs
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