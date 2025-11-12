document.addEventListener('DOMContentLoaded', () => {
  const chatArea = document.getElementById('chatArea');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('msgInput');
  const attachBtn = document.getElementById('attachBtn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Crear mensaje propio
    const msg = document.createElement('div');
    msg.className = 'msg msg-self';
    msg.innerHTML = `
      <div class="msg-avatar">🧍‍♂️</div>
      <div class="msg-body">
        <div class="msg-text"></div>
        <div class="msg-meta">Tú · ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
      </div>
    `;
    msg.querySelector('.msg-text').textContent = text;
    chatArea.appendChild(msg);

    input.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;

    // Respuesta automática simulada
    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'msg msg-other';
      reply.innerHTML = `
        <div class="msg-avatar">🧑‍⚕️</div>
        <div class="msg-body">
          <div class="msg-text">Gracias por el aviso — lo revisamos.</div>
          <div class="msg-meta">Sistema · ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
        </div>
      `;
      chatArea.appendChild(reply);
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 900);
  });

  // Adjuntar imagen
  attachBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgMsg = document.createElement('div');
        imgMsg.className = 'msg msg-self';
        imgMsg.innerHTML = `
          <div class="msg-avatar">🧍‍♂️</div>
          <div class="msg-body">
            <div class="msg-text"><img src="${e.target.result}" alt="Imagen adjunta" style="max-width: 200px; border-radius: 8px;" /></div>
            <div class="msg-meta">Tú · ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
          </div>
        `;
        chatArea.appendChild(imgMsg);
        chatArea.scrollTop = chatArea.scrollHeight;
      };
      reader.readAsDataURL(file);
    };
  });

  // auto-scroll al cargar para ver últimos mensajes
  chatArea.scrollTop = chatArea.scrollHeight;
});
