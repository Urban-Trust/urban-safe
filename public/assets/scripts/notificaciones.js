document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.querySelector('.notif-back');
  const toggleInputs = document.querySelectorAll('[data-pref]');

  const keyFor = (pref) => `notif-${pref}`;

  const persistToggle = (input) => {
    const pref = input.dataset.pref || '';
    if (!pref) return;
    try {
      localStorage.setItem(keyFor(pref), input.checked ? 'true' : 'false');
    } catch (e) { /* ignore */ }
  };

  toggleInputs.forEach((input) => {
    const pref = input.dataset.pref || '';
    if (pref) {
      try {
        const saved = localStorage.getItem(keyFor(pref));
        if (saved !== null) input.checked = saved === 'true';
      } catch (e) { /* ignore */ }
    }

    input.addEventListener('change', () => {
      persistToggle(input);
    });
  });

  backButton?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'configuracion.html';
    }
  });
});
