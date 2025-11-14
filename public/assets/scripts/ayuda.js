// (H-52) Controlador reutilizable para abrir y cerrar el overlay de ayuda
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('help-overlay');
    if (!overlay) { return; }

    const dialog = overlay.querySelector('.help-dialog');
    const closeBtn = overlay.querySelector('.help-close');
    const triggers = document.querySelectorAll('[data-help-trigger]');
    let lastFocusedTrigger = null;

    const openOverlay = (trigger) => {
      lastFocusedTrigger = trigger;
      overlay.classList.remove('oculto');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('help-overlay-open');
      if (dialog) {
        requestAnimationFrame(() => dialog.focus());
      }
    };

    const closeOverlay = () => {
      overlay.classList.add('oculto');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('help-overlay-open');
      if (lastFocusedTrigger) {
        lastFocusedTrigger.focus();
      }
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        openOverlay(trigger);
      });
    });

    closeBtn?.addEventListener('click', closeOverlay);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    document.addEventListener('keydown', (event) => {
      const isOpen = overlay.getAttribute('aria-hidden') === 'false';
      if (isOpen && event.key === 'Escape') {
        closeOverlay();
      }
    });
  });
})();
