document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const menuToggle = document.querySelector('#menu-toggle');
  const menuList = document.querySelector('.menu');

  const syncMobileClass = () => {
    const isMobile = window.innerWidth <= 768;
    document.documentElement.classList.toggle('is-mobile', isMobile);
  };

  syncMobileClass();
  window.addEventListener('resize', syncMobileClass);
  window.addEventListener('orientationchange', syncMobileClass);

  if (hamburgerBtn && menuToggle) {
    hamburgerBtn.setAttribute('aria-expanded', menuToggle.checked ? 'true' : 'false');
    hamburgerBtn.addEventListener('click', () => {
      const willOpen = !menuToggle.checked;
      menuToggle.checked = willOpen;
      hamburgerBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  } else if (hamburgerBtn && menuList) {
    hamburgerBtn.setAttribute('aria-expanded', menuList.classList.contains('menu-open') ? 'true' : 'false');
    hamburgerBtn.addEventListener('click', () => {
      const willOpen = !menuList.classList.contains('menu-open');
      menuList.classList.toggle('menu-open', willOpen);
      hamburgerBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }
});
