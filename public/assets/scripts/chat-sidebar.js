document.addEventListener('DOMContentLoaded', () => {
  const chatList = document.getElementById('chatList');
  const searchInput = document.getElementById('searchChat');
  const chatTitle = document.getElementById('chatTitle');
  const chatArea = document.getElementById('chatArea');
  const sidebar = document.querySelector('.chat-sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');

  let chats = Array.from(chatList.children);

  // Filtrado en tiempo real
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    chats.forEach(chat => {
      chat.style.display = chat.dataset.name.toLowerCase().includes(query) ? 'block' : 'none';
    });
  });

  // Abrir nueva conversación al hacer click
  chats.forEach(chat => {
    chat.addEventListener('click', () => {
      // Quitar active de todos
      chats.forEach(c => c.classList.remove('active'));
      chat.classList.add('active');

      // Cambiar título del chat
      chatTitle.textContent = chat.dataset.name;

      // Limpiar área de mensajes
      chatArea.innerHTML = '';
    });
  });

  // Minimizar / restaurar sidebar
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('minimized');
  });
});
