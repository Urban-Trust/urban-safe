document.addEventListener('DOMContentLoaded', () => {
  const chatArea = document.getElementById('chatArea');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('msgInput');

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

  // auto-scroll al cargar para ver últimos mensajes
  chatArea.scrollTop = chatArea.scrollHeight;
});
