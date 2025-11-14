document.addEventListener('DOMContentLoaded', () => {
  const STATUS_CONFIG = {
    nueva: { className: 'status-nueva' },
    proceso: { className: 'status-proceso' },
    resuelta: { className: 'status-resuelta' }
  };

  const statusClasses = Object.values(STATUS_CONFIG).map(({ className }) => className);

  const updateSelectAppearance = (select) => {
    const status = STATUS_CONFIG[select.value];
    select.classList.remove(...statusClasses);
    if (status) {
      select.classList.add(status.className);
    }
  };

  const statusSelects = document.querySelectorAll('[data-status-select]');
  statusSelects.forEach((select) => {
    updateSelectAppearance(select);
    select.addEventListener('change', () => updateSelectAppearance(select));
  });
});
