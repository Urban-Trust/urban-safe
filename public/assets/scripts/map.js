document.addEventListener('DOMContentLoaded', () => {
  // --- REFERENCIAS A ELEMENTOS DEL DOM ---
  const botonAlerta = document.querySelector('.boton-alerta');
  const modal = document.querySelector('.modal-alerta'); // El formulario principal
  const cerrarModal = document.querySelector('.cerrar-modal');
  const botonSeleccionarMapa = document.querySelector('.boton-seleccionar-mapa');
  const mapaSection = document.querySelector('.mapa');
  const mapaSeleccionDireccion = document.querySelector('.mapa-seleccion-direccion');
  const inputDireccionIncidente = document.querySelector('#direccion-incidente');
  const mapaBg = document.querySelector('.mapa-bg');
  
  // Referencias de imagen
  const modalImagenes = document.querySelector('.modal-imagenes');
  const imagenOpciones = document.querySelectorAll('.imagen-opcion');
  const contenedorAdjunta = document.querySelector('.contenedor-imagen-adjunta');
  const inputImagenHidden = document.getElementById('imagen-seleccionada-hidden'); // Referencia al input oculto
  
  // Referencias del formulario
  const formulario = document.querySelector('.formulario-registro');
  const inputTituloIncidente = document.querySelector('#titulo-incidente');
  const tituloError = document.querySelector('#titulo-error');
  const direccionError = document.querySelector('#direccion-error');
  
  // Referencias de reporte en mapa y éxito
  const reporteEnMapa = document.querySelector('.reporte-en-mapa');
  const reporteTitulo = document.querySelector('.reporte-titulo');
  const reporteImagen = document.querySelector('.reporte-imagen');
  const modalExito = document.querySelector('.modal-exito');
  const menuToggle = document.querySelector('#menu-toggle');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  
  // Referencias de menú y paneles
  const menuToggle = document.querySelector('#menu-toggle');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const propiedadInfo = document.querySelector('.propiedad-info');
  const propBackBtn = document.querySelector('.prop-back');
  const markerLaura = document.querySelector('.marker-laura');
  const btnVerHistorial = document.getElementById("btn-ver-historial");
  const sidebarHistorial = document.getElementById("sidebar-historial");
  
  // REFERENCIAS PARA EL MODAL DE REPORTE POR VOZ
  const botonReporteVoz = document.getElementById('boton-reporte-voz');
  const modalVoz = document.getElementById('modal-voz');
  const cerrarModalVoz = modalVoz ? modalVoz.querySelector('.cerrar-modal') : null;
  const vozPasosContainer = document.getElementById('voz-pasos');
  const botonVozConfirmar = document.getElementById('voz-confirmar');
  const botonVozCancelar = document.getElementById('voz-cancelar');

  // --- FUNCIONES AUXILIARES ---

  function crearBotonClip() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'boton-clip';
    btn.innerHTML = `<svg width="43" height="44" viewBox="0 0 43 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.75 14.5017V29.3333C10.75 32.2507 11.8826 35.0486 13.8986 37.1115C15.9146 39.1744 18.6489 40.3333 21.5 40.3333C24.3511 40.3333 27.0854 39.1744 29.1014 37.1115C31.1174 35.0486 32.25 32.2507 32.25 29.3333V11C32.25 9.05508 31.4949 7.18982 30.1509 5.81455C28.8069 4.43928 26.9841 3.66667 25.0833 3.66667C23.1826 3.66667 21.3597 4.43928 20.0157 5.81455C18.6717 7.18982 17.9167 9.05508 17.9167 11V27.8337C17.9167 28.3152 18.0094 28.792 18.1894 29.2368C18.3695 29.6817 18.6335 30.0859 18.9662 30.4264C19.2989 30.7669 19.694 31.037 20.1287 31.2212C20.5635 31.4055 21.0294 31.5003 21.5 31.5003C22.4504 31.5003 23.3618 31.114 24.0338 30.4264C24.7058 29.7388 25.0833 28.8061 25.0833 27.8337V14.6667" stroke="#EAE9E7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      modalImagenes.classList.remove('oculto');
    });
    return btn;
  }

  // --- LÓGICA DE VOZ ---
  function resetearModalVoz() {
    const todosLosPasos = vozPasosContainer.querySelectorAll('.paso-voz');
    todosLosPasos.forEach((paso, index) => {
      paso.classList.toggle('oculto', index !== 0);
    });
  }
  
  function iniciarSecuenciaVoz() {
    const pasos = ['paso-inicial', 'paso-pregunta-tipo', 'paso-respuesta-tipo', 'paso-pregunta-descripcion', 'paso-respuesta-descripcion', 'paso-resumen'];
    let pasoActual = 0;
    function mostrarSiguientePaso() {
      // Si el modal se cerró, detener la secuencia
      if (modalVoz.classList.contains('oculto')) return;

      if (pasoActual < pasos.length) {
        // Ocultar todos los pasos primero
        const todos = vozPasosContainer.querySelectorAll('.paso-voz');
        todos.forEach(el => el.classList.add('oculto'));
        
        // Mostrar el actual
        const pasoEl = document.getElementById(pasos[pasoActual]);
        if(pasoEl) pasoEl.classList.remove('oculto');
        
        pasoActual++;
        if (pasoActual < pasos.length) {
          // Tiempos simulados de conversación
          let tiempoEspera = 2000;
          if (pasos[pasoActual-1].includes('pregunta')) tiempoEspera = 2500;
          setTimeout(mostrarSiguientePaso, tiempoEspera);
        }
      }
    }
    setTimeout(mostrarSiguientePaso, 500);
  }

  function cerrarElModalVoz() {
    modalVoz.classList.add('oculto');
    modalVoz.setAttribute('aria-hidden', 'true');
  }

  // --- INICIALIZACIÓN DE ESTADOS ---
  // Aseguramos que todo empiece oculto excepto el mapa
  modal.classList.add('oculto');
  modalImagenes.classList.add('oculto');
  mapaSeleccionDireccion.classList.add('oculto');
  modalExito.classList.add('oculto');
  modalVoz.classList.add('oculto');

  // --- EVENT LISTENERS ---

  // 1. Lógica del Botón de Alerta (Abre el formulario)
  botonAlerta.addEventListener('click', () => {
    modal.classList.remove('oculto');
    // Reiniciar adjuntar imagen
    contenedorAdjunta.innerHTML = '';
    contenedorAdjunta.appendChild(crearBotonClip());
    if(inputImagenHidden) inputImagenHidden.value = '';
  });

  // Cerrar modal de formulario
  cerrarModal.addEventListener('click', () => {
    modal.classList.add('oculto');
    modalImagenes.classList.add('oculto');
  });

  // 2. Lógica del Botón de Voz (Abre el asistente)
  if (botonReporteVoz) {
    botonReporteVoz.addEventListener('click', (e) => {
      e.preventDefault(); // Evitar submit si está dentro del form
      resetearModalVoz();
      modalVoz.classList.remove('oculto');
      modalVoz.setAttribute('aria-hidden', 'false');
      iniciarSecuenciaVoz();
    });
  }

  // Botones dentro del modal de voz
  if (cerrarModalVoz) cerrarModalVoz.addEventListener('click', cerrarElModalVoz);
  if (botonVozCancelar) botonVozCancelar.addEventListener('click', cerrarElModalVoz);
  
  if (botonVozConfirmar) {
    botonVozConfirmar.addEventListener('click', () => {
      // AQUÍ ESTÁ EL ARREGLO DEL FLUJO:
      cerrarElModalVoz();                // 1. Cerrar pantalla de voz
      modal.classList.add('oculto');     // 2. Cerrar formulario de fondo (IMPORTANTE)
      
      // 3. Preparar datos del reporte simulado
      reporteTitulo.textContent = "Robo a mano armada";
      reporteImagen.src = "assets/images/robo-icon.png";
      
      // 4. Mostrar éxito
      modalExito.classList.remove('oculto');
      
      // 5. Al hacer clic en éxito, ir al mapa
      modalExito.addEventListener('click', () => {
        modalExito.classList.add('oculto');
        reporteEnMapa.classList.remove('oculto');
      }, { once: true });
    });
  }

  // 3. Lógica de Selección de Imágenes
  // Cerrar modal si click fuera
  modalImagenes.addEventListener('click', (ev) => { 
    if (ev.target === modalImagenes) modalImagenes.classList.add('oculto'); 
  });

  imagenOpciones.forEach(img => {
    img.addEventListener('click', () => {
      modalImagenes.classList.add('oculto');
      
      // Crear vista previa
      const wrapper = document.createElement('div');
      wrapper.className = 'imagen-seleccionada';
      wrapper.innerHTML = `
        <img src="${img.src}" alt="Imagen seleccionada">
        <button type="button" class="boton-quitar-imagen">✖</button>
      `;
      
      // Lógica quitar imagen
      wrapper.querySelector('.boton-quitar-imagen').addEventListener('click', e => {
        e.stopPropagation();
        contenedorAdjunta.innerHTML = '';
        contenedorAdjunta.appendChild(crearBotonClip());
        if(inputImagenHidden) inputImagenHidden.value = '';
      });
      
      contenedorAdjunta.innerHTML = '';
      contenedorAdjunta.appendChild(wrapper);
      
      // GUARDAR EN INPUT HIDDEN (Corrección aplicada)
      if(inputImagenHidden) inputImagenHidden.value = img.src;
    });
  });

  // 4. Lógica de Selección de Dirección en Mapa
  botonSeleccionarMapa.addEventListener('click', () => {
    mapaSection.classList.add('mapa-ocultar');
    mapaSeleccionDireccion.classList.remove('oculto');
    modal.classList.add('oculto');
  });

  mapaBg.addEventListener('click', () => {
    if (mapaSeleccionDireccion.classList.contains('oculto')) return;
    // Simular dirección capturada
    inputDireccionIncidente.value = "Las Palmeras, Asoc. Juan Carlos 234 Mz F";
    mapaSection.classList.remove('mapa-ocultar');
    mapaSeleccionDireccion.classList.add('oculto');
    modal.classList.remove('oculto');
  });

  // 5. Envío del Formulario Manual
  formulario.addEventListener('submit', (event) => {
    event.preventDefault();
    let esValido = true;
    
    if (inputTituloIncidente.value.trim() === '') {
      inputTituloIncidente.classList.add('error');
      tituloError.classList.add('visible');
      esValido = false;
    }
    if (inputDireccionIncidente.value.trim() === '') {
      inputDireccionIncidente.classList.add('error');
      direccionError.classList.add('visible');
      esValido = false;
    }
    
    if (!esValido) return;

    // Flujo de éxito manual
    modal.classList.add('oculto');
    modalExito.classList.remove('oculto');
    
    reporteTitulo.textContent = inputTituloIncidente.value;
    // Usar la imagen seleccionada o un icono por defecto
    const imgSeleccionada = inputImagenHidden ? inputImagenHidden.value : '';
    reporteImagen.src = imgSeleccionada || 'assets/images/alerta-icon.png';
    
    formulario.reset();
    contenedorAdjunta.innerHTML = '';
    contenedorAdjunta.appendChild(crearBotonClip());
    if(inputImagenHidden) inputImagenHidden.value = '';

    modalExito.addEventListener('click', () => {
      modalExito.classList.add('oculto');
      reporteEnMapa.classList.remove('oculto');
    }, { once: true });
  });

  // Limpiar errores al escribir
  inputTituloIncidente.addEventListener('input', () => {
    inputTituloIncidente.classList.remove('error');
    tituloError.classList.remove('visible');
  });
  inputDireccionIncidente.addEventListener('input', () => {
    inputDireccionIncidente.classList.remove('error');
    direccionError.classList.remove('visible');
  });

  // 6. Lógica de Autocompletado (Buscador)
  const inputBusqueda = document.getElementById('input-busqueda');
  const suggestionsList = document.getElementById('suggestions');
  if (inputBusqueda && suggestionsList) {
    const sugerencias = Array.from(suggestionsList.getElementsByTagName('li'));
    
    inputBusqueda.addEventListener('input', () => {
      const texto = inputBusqueda.value.toLowerCase();
      let hayCoincidencias = false;
      sugerencias.forEach(item => {
        const esVisible = texto && item.textContent.toLowerCase().includes(texto);
        item.style.display = esVisible ? "block" : "none";
        if (esVisible) hayCoincidencias = true;
      });
      suggestionsList.classList.toggle('oculto', !hayCoincidencias);
    });
    
    sugerencias.forEach(item => {
      item.addEventListener('click', () => {
        inputBusqueda.value = item.textContent;
        suggestionsList.classList.add('oculto');
      });
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.busqueda')) suggestionsList.classList.add('oculto');
    });
  }
  
  // 7. Otros (Menús, Filtros, Pánico, Historial)
  
  // Filtros
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.addEventListener('click', () => chip.classList.toggle('active')));
  
  const heatChip = document.querySelector('.filter-chip[data-layer="heat"]');
  const iconsChip = document.querySelector('.filter-chip[data-layer="icons"]');
  const heatLayer = document.querySelector('.map-layer-heat');
  const iconsLayer = document.querySelector('.map-layer-icons');
  
  if (heatChip && heatLayer) heatChip.addEventListener('click', () => heatLayer.classList.toggle('visible', heatChip.classList.contains('active')));
  if (iconsChip && iconsLayer) iconsChip.addEventListener('click', () => iconsLayer.classList.toggle('visible', iconsChip.classList.contains('active')));
  
  const btnClear = document.querySelector('.btn-clear');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      chips.forEach(chip => chip.classList.remove('active'));
      if (heatLayer) heatLayer.classList.remove('visible');
      if (iconsLayer) iconsLayer.classList.remove('visible');
      const toggle = document.querySelector('#filters-toggle');
      if(toggle) toggle.checked = false;
    });
  }

  // Menú lateral y Propiedad
  if (propBackBtn && propiedadInfo) propBackBtn.addEventListener('click', () => propiedadInfo.classList.add('oculto'));
  if (markerLaura && propiedadInfo) markerLaura.addEventListener('click', () => propiedadInfo.classList.remove('oculto'));
  if (propiedadInfo) propiedadInfo.addEventListener('click', (e) => { if (e.target === propiedadInfo) propiedadInfo.classList.add('oculto'); });
  if (hamburgerBtn && menuToggle) hamburgerBtn.addEventListener('click', () => menuToggle.checked = !menuToggle.checked);

  // Crear Reporte Ejemplo
  function crearReporteEjemplo() {
    const mapaContainer = document.querySelector('.mapa-container');
    if (!mapaContainer) return;
    const setPosicionEjemplo = (el) => {
      const isMobile = window.innerWidth <= 768;
      // Añadir clase al body para CSS
      document.body.classList.toggle('is-mobile', isMobile);
      
      el.style.top = isMobile ? '160px' : '24px';
      el.style.right = isMobile ? '12px' : '24px';
      el.style.left = 'auto';
      el.style.transform = 'none';
    };
    const ejemplo = document.createElement('div');
    ejemplo.className = 'reporte-en-mapa reporte-ejemplo';
    ejemplo.innerHTML = `<div class="reporte-contenido"><img src="assets/images/Acci_1.png" alt="Imagen de ejemplo" class="reporte-imagen"><h4 class="reporte-titulo">Daño auto</h4><div class="reporte-meta">Hace 5 minutos</div></div>`;
    setPosicionEjemplo(ejemplo);
    mapaContainer.appendChild(ejemplo);
    window.addEventListener('resize', () => setPosicionEjemplo(ejemplo));
    // Trigger inicial
    setPosicionEjemplo(ejemplo);
  }
  crearReporteEjemplo();

  // Historial
  if (btnVerHistorial && sidebarHistorial) {
    btnVerHistorial.addEventListener("click", (e) => {
      e.stopPropagation();
      if (propiedadInfo) propiedadInfo.classList.add("oculto");
      sidebarHistorial.classList.remove("oculto");
    });
    document.addEventListener("click", (e) => {
      if (!sidebarHistorial.contains(e.target) && !btnVerHistorial.contains(e.target)) {
        sidebarHistorial.classList.add("oculto");
      }
    });
  }

  // Botón de Pánico
  try {
    const panicBtn = document.getElementById('panic-navbar-button');
    const modalPanic = document.getElementById('modal-panic');
    const modalPanicClose = document.getElementById('modal-panic-close');
    const enabled = localStorage.getItem('panicEnabled') === 'true';
    if (panicBtn) {
      panicBtn.classList.toggle('oculto', !enabled);
      panicBtn.addEventListener('click', () => {
        if (modalPanic) modalPanic.classList.remove('oculto');
        setTimeout(() => { if (modalPanic) modalPanic.classList.add('oculto'); }, 2200);
      });
    }
    if (modalPanicClose) modalPanicClose.addEventListener('click', () => { if (modalPanic) modalPanic.classList.add('oculto'); });
    window.addEventListener('storage', (e) => {
      if (e.key === 'panicEnabled' && panicBtn) panicBtn.classList.toggle('oculto', e.newValue !== 'true');
    });
  } catch (e) { console.error('Error pánico:', e); }
  
});
