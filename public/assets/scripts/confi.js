// Mueve la lógica del toggle del Botón de pánico desde confi.html
(function(){
  const key = 'panicEnabled';
  document.addEventListener('DOMContentLoaded', () => {
    const chk = document.getElementById('panic-toggle');
    if (!chk) return;
    try {
      const stored = localStorage.getItem(key);
      chk.checked = stored === 'true' || chk.checked === true;
    } catch (e) { /* ignore */ }

    chk.addEventListener('change', () => {
      try {
        localStorage.setItem(key, chk.checked ? 'true' : 'false');
      } catch (e) { /* ignore */ }
    });
  });
})();
