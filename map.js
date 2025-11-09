document.addEventListener("DOMContentLoaded", () => {
  const botonAlerta = document.querySelector('.boton-alerta');
  const modal = document.querySelector('.modal-alerta');
  const cerrarModal = document.querySelector('.cerrar-modal');

  botonAlerta.addEventListener('click', () => {
    modal.classList.remove('oculto');
  });

  cerrarModal.addEventListener('click', () => {
    modal.classList.add('oculto');
  });

  // Toggle estado activo en filtros generales
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach((chip) => {
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => {
      const isActive = chip.classList.toggle('active');
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  });
});

