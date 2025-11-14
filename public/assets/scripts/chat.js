document.addEventListener('DOMContentLoaded', () => {
  const chatArea = document.getElementById('chatArea');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('msgInput');
  const attachBtn = document.getElementById('attachBtn');
  const attachMenuDropdown = document.getElementById('attachMenuDropdown');
  const attachImageBtn = document.getElementById('attachImageBtn');
  const attachPollBtn = document.getElementById('attachPollBtn');
  const attachEventBtn = document.getElementById('attachEventBtn');
  let menuOpen = false;

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
    const chatId = window.chatAPI && window.chatAPI.getCurrentChatId ? window.chatAPI.getCurrentChatId() : null;
    if (!chatId) return;
    // use central API to send message
    window.chatAPI.sendMessageToChat(chatId, text);
    input.value = '';
  });

  // Adjuntar imagen via menu option
  attachImageBtn.addEventListener('click', () => {
    menuOpen = false;
    attachMenuDropdown.classList.add('hidden');
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const chatId = window.chatAPI && window.chatAPI.getCurrentChatId ? window.chatAPI.getCurrentChatId() : null;
        if (!chatId) return;
        window.chatAPI.sendImageInChat(chatId, e.target.result);
      };
      reader.readAsDataURL(file);
    };
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

    // Event button (no functionality yet)
    attachEventBtn && attachEventBtn.addEventListener('click', () => {
      menuOpen = false;
      attachMenuDropdown.classList.add('hidden');
      console.log('Crear evento: Sin funcionalidad todavía');
    });

});
