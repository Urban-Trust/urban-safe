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
});

