document.addEventListener('DOMContentLoaded', () => {

  // --- Selección de Elementos del DOM ---
  const botonAgrupar = document.getElementById('boton-agrupar');
  const accionesConfirmacion = document.getElementById('acciones-confirmacion');
  const botonCancelar = document.getElementById('boton-cancelar');
  const botonConfirmar = document.getElementById('boton-confirmar');
  const listaIncidentesContenedor = document.querySelector('.lista-incidentes');
  
  // Modal de Agrupación
  const modalAgrupacion = document.getElementById('modal-agrupacion');
  const formAgrupacion = document.getElementById('formulario-agrupacion');
  const cerrarModalAgrupacion = modalAgrupacion.querySelector('.cerrar-modal');
  const listaResumen = document.getElementById('incidentes-para-agrupar-lista');

  // Nuevo Modal de Alerta Personalizado
  const modalAlertaCustom = document.getElementById('modal-alerta-custom');
  const textoAlerta = document.getElementById('alerta-mensaje-texto');

  let incidentesSeleccionadosParaAgrupar = []; // Guardaremos las tarjetas seleccionadas aquí

  // Función para obtener las tarjetas de incidente que NO son agrupadas
  const tarjetasIncidentes = () => document.querySelectorAll('.incidente-card:not(.agrupado)');

  // --- Funciones para manejar el modo de agrupación ---

  function activarModoAgrupar() {
    botonAgrupar.classList.add('oculto');
    accionesConfirmacion.classList.remove('oculto');

    tarjetasIncidentes().forEach(tarjeta => {
      tarjeta.querySelector('.incidente-boton')?.classList.add('oculto');
      tarjeta.querySelector('.checkbox-agrupar')?.classList.remove('oculto');
    });
  }

  function desactivarModoAgrupar() {
    botonAgrupar.classList.remove('oculto');
    accionesConfirmacion.classList.add('oculto');

    tarjetasIncidentes().forEach(tarjeta => {
      tarjeta.querySelector('.incidente-boton')?.classList.remove('oculto');
      const checkbox = tarjeta.querySelector('.checkbox-agrupar');
      if (checkbox) {
        checkbox.classList.add('oculto');
        checkbox.classList.remove('marcado');
      }
    });
  }
  
  // --- Lógica del Modal de Agrupación ---

  function abrirModalAgrupacion(tarjetasSeleccionadas) {
    listaResumen.innerHTML = ''; // Limpiar la lista de resumen anterior

    // Llenar la lista con los incidentes seleccionados
    tarjetasSeleccionadas.forEach(tarjeta => {
      const titulo = tarjeta.querySelector('.incidente-titulo').textContent;
      const imgSrc = tarjeta.querySelector('.incidente-imagen').src;
      const itemHTML = `
        <div class="resumen-item">
          <img src="${imgSrc}" alt="Icono de ${titulo}">
          <span>${titulo}</span>
        </div>
      `;
      listaResumen.innerHTML += itemHTML;
    });

    modalAgrupacion.classList.remove('oculto'); // Mostrar el modal
  }
  
  // --- Función para crear la nueva tarjeta agrupada ---

  function crearNuevaTarjetaAgrupada(formData) {
    const titulo = formData.get('titulo-agrupado');
    const descripcion = formData.get('descripcion-agrupada');
    
    // Usamos la imagen del primer incidente seleccionado como representativa
    const imagenRepresentativaSrc = incidentesSeleccionadosParaAgrupar[0].querySelector('.incidente-imagen').src;

    const nuevaTarjeta = document.createElement('div');
    nuevaTarjeta.className = 'incidente-card agrupado';
    nuevaTarjeta.innerHTML = `
      <div class="imagen-contenedor">
        <div class="etiqueta-agrupado">Incidente Agrupado</div>
        <img src="${imagenRepresentativaSrc}" alt="Imagen de ${titulo}" class="incidente-imagen">
        <span class="incidente-fecha">Ahora</span>
      </div>
      <div class="incidente-contenido">
        <div class="contenido-principal">
          <h3 class="incidente-titulo">${titulo}</h3>
          <p class="incidente-descripcion">${descripcion}</p>
        </div>
        <div class="contenido-footer">
          <div class="reporter-info">
            <span class="reporter-subtitulo">Agrupado por:</span>
            <div class="reporter-identidad">
                <div class="reporter-avatar" title="Tú">TÚ</div>
                <span class="reporter-name">Tú</span>
            </div>
          </div>
          <a href="#" class="incidente-boton">Ver más</a>
        </div>
      </div>
    `;

    // Ocultar las tarjetas originales que se agruparon
    incidentesSeleccionadosParaAgrupar.forEach(tarjeta => {
      tarjeta.style.display = 'none';
    });

    // Añadir la nueva tarjeta al inicio de la lista
    listaIncidentesContenedor.prepend(nuevaTarjeta);

    // Resetear la interfaz
    modalAgrupacion.classList.add('oculto');
    desactivarModoAgrupar();
  }


  // --- Asignación de Eventos ---

  botonAgrupar.addEventListener('click', activarModoAgrupar);
  botonCancelar.addEventListener('click', desactivarModoAgrupar);

  // Evento para el botón "Confirmar" (MODIFICADO)
  botonConfirmar.addEventListener('click', () => {
    const checkboxesMarcados = document.querySelectorAll('.checkbox-agrupar.marcado');

    if (checkboxesMarcados.length > 1) {
      // Si hay 2 o más, abrir el modal de agrupación (comportamiento normal)
      incidentesSeleccionadosParaAgrupar = Array.from(checkboxesMarcados).map(cb => cb.closest('.incidente-card'));
      abrirModalAgrupacion(incidentesSeleccionadosParaAgrupar);
    } else {
      // Si hay menos de 2, mostrar la alerta personalizada
      textoAlerta.textContent = "Por favor, selecciona al menos 2 incidentes para agrupar.";
      modalAlertaCustom.classList.remove('oculto');
    }
  });

  // Evento para marcar/desmarcar las casillas
  listaIncidentesContenedor.addEventListener('click', (event) => {
    if (event.target.classList.contains('checkbox-agrupar')) {
      event.target.classList.toggle('marcado');
    }
  });

  // Eventos del modal de agrupación
  cerrarModalAgrupacion.addEventListener('click', () => {
    modalAgrupacion.classList.add('oculto');
  });

  formAgrupacion.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formAgrupacion);
    crearNuevaTarjetaAgrupada(formData);
    formAgrupacion.reset();
  });

  // Evento para cerrar el modal de alerta personalizado al hacer clic en él
  modalAlertaCustom.addEventListener('click', () => {
    modalAlertaCustom.classList.add('oculto');
  });

});