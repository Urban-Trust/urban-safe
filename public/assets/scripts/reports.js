document.addEventListener('DOMContentLoaded', () => {
  const botonAgrupar = document.getElementById('boton-agrupar');
  const accionesConfirmacion = document.getElementById('acciones-confirmacion');
  const botonCancelar = document.getElementById('boton-cancelar');
  const botonConfirmar = document.getElementById('boton-confirmar');
  const listaIncidentesContenedor = document.querySelector('.lista-incidentes');
  

  const modalAgrupacion = document.getElementById('modal-agrupacion');
  const formAgrupacion = document.getElementById('formulario-agrupacion');
  const cerrarModalAgrupacion = modalAgrupacion.querySelector('.cerrar-modal');
  const listaResumen = document.getElementById('incidentes-para-agrupar-lista');


  const modalAlertaCustom = document.getElementById('modal-alerta-custom');
  const textoAlerta = document.getElementById('alerta-mensaje-texto');

  let incidentesSeleccionadosParaAgrupar = [];

  
  const tarjetasIncidentes = () => document.querySelectorAll('.incidente-card:not(.agrupado)');



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
  


  function abrirModalAgrupacion(tarjetasSeleccionadas) {
    listaResumen.innerHTML = ''; 

    
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

    modalAgrupacion.classList.remove('oculto'); 
  }
  


  function crearNuevaTarjetaAgrupada(formData) {
    const titulo = formData.get('titulo-agrupado');
    const descripcion = formData.get('descripcion-agrupada');
    
    
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
          <a href="reportsinfo2.html" class="incidente-boton">Ver más</a>
        </div>
      </div>
    `;


    incidentesSeleccionadosParaAgrupar.forEach(tarjeta => {
      tarjeta.style.display = 'none';
    });


    listaIncidentesContenedor.prepend(nuevaTarjeta);

    
    modalAgrupacion.classList.add('oculto');
    desactivarModoAgrupar();
  }


  botonAgrupar.addEventListener('click', activarModoAgrupar);
  botonCancelar.addEventListener('click', desactivarModoAgrupar);


  botonConfirmar.addEventListener('click', () => {
    const checkboxesMarcados = document.querySelectorAll('.checkbox-agrupar.marcado');

    if (checkboxesMarcados.length > 1) {
      incidentesSeleccionadosParaAgrupar = Array.from(checkboxesMarcados).map(cb => cb.closest('.incidente-card'));
      abrirModalAgrupacion(incidentesSeleccionadosParaAgrupar);
    } else {
      
      textoAlerta.textContent = "Por favor, selecciona al menos 2 incidentes para agrupar.";
      modalAlertaCustom.classList.remove('oculto');
    }
  });


  listaIncidentesContenedor.addEventListener('click', (event) => {
    if (event.target.classList.contains('checkbox-agrupar')) {
      event.target.classList.toggle('marcado');
    }
  });

  
  cerrarModalAgrupacion.addEventListener('click', () => {
    modalAgrupacion.classList.add('oculto');
  });

  formAgrupacion.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formAgrupacion);
    crearNuevaTarjetaAgrupada(formData);
    formAgrupacion.reset();
  });

  
  modalAlertaCustom.addEventListener('click', () => {
    modalAlertaCustom.classList.add('oculto');
  });

});
// BÚSQUEDA POR TÍTULO
document.addEventListener('DOMContentLoaded', () => {
  const inputBusqueda = document.getElementById('texto-busquedad'); // pq busquedad?
  const incidentes = document.querySelectorAll('.incidente-card');

  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', () => {
      const texto = inputBusqueda.value.toLowerCase();

      incidentes.forEach(incidente => {
        const titulo = incidente.querySelector('.incidente-titulo').textContent.toLowerCase();

        
        if (titulo.includes(texto)) {
          incidente.style.display = 'flex';
        } else {
          incidente.style.display = 'none';
        }
      });
    });
  }
});
