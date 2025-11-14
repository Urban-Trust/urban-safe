// Mueve la lógica del toggle del Botón de pánico desde confi.html
document.addEventListener('DOMContentLoaded', () => {
  const key = 'panicEnabled';
  const chk = document.getElementById('panic-toggle');
  if (chk) {
    try {
      const stored = localStorage.getItem(key);
      chk.checked = stored === 'true' || chk.checked === true;
    } catch (e) { /* ignore */ }

    chk.addEventListener('change', () => {
      try {
        localStorage.setItem(key, chk.checked ? 'true' : 'false');
      } catch (e) { /* ignore */ }
    });
  }

  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsModal = document.getElementById('notificationsModal');
  const notifClose = document.getElementById('notifModalClose');
  const backButton = document.querySelector('.back-button');

  const openModal = () => {
    if (!notificationsModal) return;
    notificationsModal.classList.remove('hidden');
    notificationsModal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    if (!notificationsModal) return;
    notificationsModal.classList.add('hidden');
    notificationsModal.setAttribute('aria-hidden', 'true');
  };

  notificationsBtn?.addEventListener('click', openModal);
  notifClose?.addEventListener('click', closeModal);
  notificationsModal?.addEventListener('click', (e) => {
    if (e.target === notificationsModal) closeModal();
  });

  backButton?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'admin.html';
    }
  });
});
