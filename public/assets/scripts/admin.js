document.addEventListener('DOMContentLoaded', () => {
  // Mostrar vista de tendencia dentro de la página
  const openButtons = document.querySelectorAll('.trend-more-btn');
  const trendView = document.querySelector('.trend-view');
  const dashboard = document.querySelector('.dashboard-grid');
  const backBtn = document.querySelector('.btn-back-trend');
  const dashHeader = document.querySelector('.dashboard-header');

  function openTrend(ev) {
    if (ev) ev.preventDefault();
    if (!trendView || !dashboard) return;
    dashboard.classList.add('oculto');
    if (dashHeader) dashHeader.classList.add('oculto');
    trendView.classList.remove('oculto');
    trendView.setAttribute('aria-hidden', 'false');
  }

  openButtons.forEach(btn => btn.addEventListener('click', openTrend));

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (!trendView || !dashboard) return;
      trendView.classList.add('oculto');
      trendView.setAttribute('aria-hidden', 'true');
      dashboard.classList.remove('oculto');
      if (dashHeader) dashHeader.classList.remove('oculto');
    });
  }

  // Delegación de eventos: flecha del acordeón y botón "Ver más"
  document.addEventListener('click', (e) => {
    // Toggle del acordeón solo con la flecha
    const chevronBtn = e.target.closest('.acc-chevron-btn');
    if (chevronBtn) {
      const accordion = chevronBtn.closest('.trend-accordion');
      if (!accordion) return;
      const body = accordion.querySelector('.trend-acc-body');
      const isOpen = accordion.classList.contains('open');
      chevronBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');

      if (!isOpen) {
        accordion.classList.add('open');
        requestAnimationFrame(() => {
          body.style.maxHeight = body.scrollHeight + 'px';
        });
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(() => {
          body.style.maxHeight = '0px';
        });
        accordion.classList.remove('open');
      }
      return;
    }

    // Botón "Ver más"
    const btn = e.target.closest('.btn-ver-mas');
    if (!btn) return;
    const body = btn.closest('.trend-acc-body');
    if (!body) return;
    const extra = body.querySelector('.trend-more-content');
    if (!extra) return;
    const isHidden = extra.classList.contains('oculto');
    if (isHidden) {
      extra.classList.remove('oculto');
      btn.textContent = 'Ver menos';
    } else {
      extra.classList.add('oculto');
      btn.textContent = 'Ver más';
    }
  });
});


