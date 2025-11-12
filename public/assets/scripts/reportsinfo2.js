document.addEventListener('DOMContentLoaded', () => {
    const modoEdicionElements = {
        botonEditar: document.getElementById('botonEditar'),
        accionesConfirmacion: document.getElementById('accionesConfirmacionEdicion'),
        botonCancelar: document.getElementById('botonCancelarEdicion'),
        botonGuardar: document.getElementById('botonGuardarEdicion'),
        editIcons: document.querySelectorAll('.edit-icon'),
        titulo: document.getElementById('detalle-titulo'),
        ubicacion: document.getElementById('ubicacion-texto'),
        descripcion: document.getElementById('descripcion-texto'),
        botonVerMapa: document.getElementById('botonVerMapa'),
        botonCambiarImagen: document.querySelector('.boton-cambiar-imagen'),
        agregarEtiquetaBtn: document.querySelector('.agregar-etiqueta-btn')
    };


    const reportersOverlay = {
        overlay: document.getElementById('reporters-overlay'),
        openButton: document.getElementById('botonVerPersonas'),
        closeButton: document.querySelector('.overlay-back-button')
    };


    const adjuntosElements = {
        container: document.getElementById('incidentes-adjuntados-lista'),
        countSpan: document.getElementById('total-reportes')
    };

    
    const mapaElements = {
        fullscreen: document.getElementById('mapaFullscreen'),
        backButton: document.getElementById('mapaBackButton')
    };

    
    const modalImagen = {
        modal: document.getElementById('modal-imagenes'),
        opciones: document.querySelectorAll('.imagen-opcion'),
        imagenPrincipal: document.getElementById('detalle-imagen')
    };
    const modalEtiquetas = {
        modal: document.getElementById('modal-etiquetas'),
        backButton: document.querySelector('.etiqueta-back-button'),
        opciones: document.querySelectorAll('.etiqueta-opcion'),
        container: document.getElementById('etiquetas-container')
    };
    const modalExito = document.getElementById('modal-exito-edicion');
    const modalAlertaLimite = document.getElementById('modal-alerta-limite');

    
    let originalContent = {};


    function entrarModoEdicion() {
        originalContent = {
            titulo: modoEdicionElements.titulo.innerHTML,
            ubicacion: modoEdicionElements.ubicacion.innerHTML,
            descripcion: modoEdicionElements.descripcion.innerHTML,
            etiquetas: modalEtiquetas.container.innerHTML,
            imagenSrc: modalImagen.imagenPrincipal.src,
            adjuntosHTML: adjuntosElements.container.innerHTML
        };


        modoEdicionElements.botonEditar.classList.add('oculto');
        modoEdicionElements.accionesConfirmacion.classList.remove('oculto');

        
        modoEdicionElements.editIcons.forEach(icon => icon.classList.remove('oculto'));
        modoEdicionElements.botonCambiarImagen.classList.remove('oculto');
        document.querySelectorAll('.quitar-etiqueta').forEach(btn => btn.classList.remove('oculto'));
        document.querySelectorAll('.boton-eliminar-adjunto').forEach(btn => btn.classList.remove('oculto'));
        modoEdicionElements.agregarEtiquetaBtn.classList.remove('oculto');

        
        modoEdicionElements.titulo.setAttribute('contenteditable', 'true');
        modoEdicionElements.ubicacion.setAttribute('contenteditable', 'true');
        modoEdicionElements.descripcion.setAttribute('contenteditable', 'true');


        modoEdicionElements.botonVerMapa.textContent = "Seleccionar dirección en el mapa";
    }

    function salirModoEdicion(guardar) {
        if (!guardar) {
            modoEdicionElements.titulo.innerHTML = originalContent.titulo;
            modoEdicionElements.ubicacion.innerHTML = originalContent.ubicacion;
            modoEdicionElements.descripcion.innerHTML = originalContent.descripcion;
            modalEtiquetas.container.innerHTML = originalContent.etiquetas;
            modalImagen.imagenPrincipal.src = originalContent.imagenSrc;
            adjuntosElements.container.innerHTML = originalContent.adjuntosHTML;
            actualizarContadorAdjuntos(); 
        }

        
        modoEdicionElements.botonEditar.classList.remove('oculto');
        modoEdicionElements.accionesConfirmacion.classList.add('oculto');
        
        
        modoEdicionElements.editIcons.forEach(icon => icon.classList.add('oculto'));
        modoEdicionElements.botonCambiarImagen.classList.add('oculto');
        document.querySelectorAll('.quitar-etiqueta').forEach(btn => btn.classList.add('oculto'));
        document.querySelectorAll('.boton-eliminar-adjunto').forEach(btn => btn.classList.add('oculto'));
        modoEdicionElements.agregarEtiquetaBtn.classList.add('oculto');

        
        modoEdicionElements.titulo.setAttribute('contenteditable', 'false');
        modoEdicionElements.ubicacion.setAttribute('contenteditable', 'false');
        modoEdicionElements.descripcion.setAttribute('contenteditable', 'false');
        
        
        modoEdicionElements.botonVerMapa.textContent = "Ver dirección en el mapa";

        if (guardar) {
            modalExito.classList.remove('oculto');
            setTimeout(() => modalExito.classList.add('oculto'), 2000);
        }
    }

    

    function actualizarContadorAdjuntos() {
        const total = adjuntosElements.container.querySelectorAll('.incidente-adjunto-card').length;
        adjuntosElements.countSpan.textContent = total;
    }



    
    modoEdicionElements.botonEditar.addEventListener('click', entrarModoEdicion);
    modoEdicionElements.botonCancelar.addEventListener('click', () => salirModoEdicion(false));
    modoEdicionElements.botonGuardar.addEventListener('click', () => salirModoEdicion(true));

    
    reportersOverlay.openButton.addEventListener('click', () => reportersOverlay.overlay.classList.remove('oculto'));
    reportersOverlay.closeButton.addEventListener('click', () => reportersOverlay.overlay.classList.add('oculto'));

    
    modoEdicionElements.botonVerMapa.addEventListener('click', () => {
        mapaElements.fullscreen.classList.remove('oculto');
        if (modoEdicionElements.titulo.isContentEditable) { 
            mapaElements.fullscreen.onclick = () => {
                modoEdicionElements.ubicacion.textContent = "Jr. Los Santos 312, Urbanización Las Flores, SMP, Lima, Perú";
                mapaElements.fullscreen.classList.add('oculto');
                mapaElements.fullscreen.onclick = null;
            };
        }
    });
    mapaElements.backButton.addEventListener('click', (e) => {
        e.preventDefault();
        mapaElements.fullscreen.classList.add('oculto');
        mapaElements.fullscreen.onclick = null;
    });

    
    modoEdicionElements.botonCambiarImagen.addEventListener('click', () => modalImagen.modal.classList.remove('oculto'));
    modalImagen.modal.addEventListener('click', (e) => {
        if (e.target === modalImagen.modal) modalImagen.modal.classList.add('oculto');
    });
    modalImagen.opciones.forEach(opcion => {
        opcion.addEventListener('click', (e) => {
            e.stopPropagation();
            modalImagen.imagenPrincipal.src = opcion.src;
            modalImagen.modal.classList.add('oculto');
        });
    });

    
    modoEdicionElements.agregarEtiquetaBtn.addEventListener('click', () => modalEtiquetas.modal.classList.remove('oculto'));
    modalEtiquetas.modal.addEventListener('click', (e) => {
        if(e.target === modalEtiquetas.modal) modalEtiquetas.modal.classList.add('oculto');
    });
    modalEtiquetas.backButton.addEventListener('click', (e) => {
        e.preventDefault();
        modalEtiquetas.opciones.forEach(opcion => {
            if (opcion.classList.contains('seleccionada')) {
                const valor = opcion.dataset.valor;
                if (!document.querySelector(`.etiqueta[data-valor="${valor}"]`)) {
                    const nuevaEtiqueta = document.createElement('span');
                    nuevaEtiqueta.className = 'etiqueta';
                    nuevaEtiqueta.dataset.valor = valor;
                    nuevaEtiqueta.innerHTML = `${valor}<button class="quitar-etiqueta">✖</button>`;
                    modoEdicionElements.agregarEtiquetaBtn.before(nuevaEtiqueta);
                }
                opcion.classList.remove('seleccionada');
            }
        });
        modalEtiquetas.modal.classList.add('oculto');
    });
    modalEtiquetas.opciones.forEach(opcion => opcion.addEventListener('click', () => opcion.classList.toggle('seleccionada')));

    const card = document.querySelector('.incidente-detalle-card');
    card.addEventListener('click', (e) => {
        
        if (e.target.classList.contains('quitar-etiqueta')) {
            e.target.parentElement.remove();
        }
        
        if (e.target.classList.contains('boton-eliminar-adjunto')) {
            const totalActual = adjuntosElements.container.querySelectorAll('.incidente-adjunto-card').length;
            if (totalActual > 2) {
                e.target.closest('.incidente-adjunto-card').remove();
                actualizarContadorAdjuntos();
            } else {
                modalAlertaLimite.classList.remove('oculto');
            }
        }
    });


    modalAlertaLimite.addEventListener('click', () => {
        modalAlertaLimite.classList.add('oculto');
    });
});