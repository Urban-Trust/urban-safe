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

  const backButton = document.querySelector('.back-button');

  backButton?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'admin.html';
    }
  });
});
