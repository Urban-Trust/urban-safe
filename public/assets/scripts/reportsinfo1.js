document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar los elementos interactivos de la página
    const botonVerMapa = document.getElementById('botonVerMapa');
    const mapaFullscreen = document.getElementById('mapaFullscreen');
    const mapaBackButton = document.getElementById('mapaBackButton');

    // Función para mostrar la vista del mapa
    function mostrarMapa() {
        mapaFullscreen.classList.remove('oculto');
    }

    // Función para ocultar la vista del mapa
    function ocultarMapa() {
        mapaFullscreen.classList.add('oculto');
    }

    // Asignar los eventos a los botones
    if (botonVerMapa) {
        botonVerMapa.addEventListener('click', mostrarMapa);
    }

    if (mapaBackButton) {
        // Usamos un 'a' href="#" por lo que prevenimos su comportamiento por defecto
        mapaBackButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            ocultarMapa();
        });
    }
});