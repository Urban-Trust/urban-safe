document.addEventListener('DOMContentLoaded', () => {
  // --- REFERENCIAS A ELEMENTOS DEL DOM ---
  const botonAlerta = document.querySelector('.boton-alerta');
  const modal = document.querySelector('.modal-alerta');
  const cerrarModal = document.querySelector('.cerrar-modal');
  const botonSeleccionarMapa = document.querySelector('.boton-seleccionar-mapa');
  const mapaSection = document.querySelector('.mapa');
  const mapaSeleccionDireccion = document.querySelector('.mapa-seleccion-direccion');
  const inputDireccionIncidente = document.querySelector('#direccion-incidente');
  const mapaBg = document.querySelector('.mapa-bg');
  const modalImagenes = document.querySelector('.modal-imagenes');
  const imagenOpciones = document.querySelectorAll('.imagen-opcion');
  const contenedorAdjunta = document.querySelector('.contenedor-imagen-adjunta');
  const formulario = document.querySelector('.formulario-registro');
  const reporteEnMapa = document.querySelector('.reporte-en-mapa');
  const reporteTitulo = document.querySelector('.reporte-titulo');
  const reporteImagen = document.querySelector('.reporte-imagen');
  const inputTituloIncidente = document.querySelector('#titulo-incidente');
  const modalExito = document.querySelector('.modal-exito');
  
  // Referencias a los párrafos de error del HTML (ahora funcionarán)
  const tituloError = document.querySelector('#titulo-error');
  const direccionError = document.querySelector('#direccion-error');

  let inputHidden = document.querySelector('#imagen-seleccionada-hidden');
  if (!inputHidden) {
    inputHidden = document.createElement('input');
    inputHidden.type = 'hidden';
    inputHidden.id = 'imagen-seleccionada-hidden';
    inputHidden.name = 'imagen-seleccionada';
    formulario.appendChild(inputHidden);
  }

  function crearBotonClip() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'boton-clip';
    btn.innerHTML = `
      <svg width="43" height="44" viewBox="0 0 43 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.75 14.5017V29.3333C10.75 32.2507 11.8826 35.0486 13.8986 37.1115C15.9146 39.1744 18.6489 40.3333 21.5 40.3333C24.3511 40.3333 27.0854 39.1744 29.1014 37.1115C31.1174 35.0486 32.25 32.2507 32.25 29.3333V11C32.25 9.05508 31.4949 7.18982 30.1509 5.81455C28.8069 4.43928 26.9841 3.66667 25.0833 3.66667C23.1826 3.66667 21.3597 4.43928 20.0157 5.81455C18.6717 7.18982 17.9167 9.05508 17.9167 11V27.8337C17.9167 28.3152 18.0094 28.792 18.1894 29.2368C18.3695 29.6817 18.6335 30.0859 18.9662 30.4264C19.2989 30.7669 19.694 31.037 20.1287 31.2212C20.5635 31.4055 21.0294 31.5003 21.5 31.5003C22.4504 31.5003 23.3618 31.114 24.0338 30.4264C24.7058 29.7388 25.0833 28.8061 25.0833 27.8337V14.6667" stroke="#EAE9E7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      modalImagenes.classList.remove('oculto');
      modalImagenes.setAttribute('aria-hidden', 'false');
    });
    return btn;
  }

  modal.classList.add('oculto');
  modalImagenes.classList.add('oculto');
  mapaSeleccionDireccion.classList.add('oculto');
  modalExito.classList.add('oculto');

  botonAlerta.addEventListener('click', () => {
    modal.classList.remove('oculto');
    contenedorAdjunta.innerHTML = '';
    contenedorAdjunta.appendChild(crearBotonClip());
  });

  cerrarModal.addEventListener('click', () => {
    modal.classList.add('oculto');
    modalImagenes.classList.add('oculto');
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

  modalImagenes.addEventListener('click', (ev) => {
    if (ev.target === modalImagenes) {
      modalImagenes.classList.add('oculto');
    }
  });
  
  imagenOpciones.forEach(img => {
    img.addEventListener('click', (ev) => {
      ev.stopPropagation();
      modalImagenes.classList.add('oculto');
      const wrapper = document.createElement('div');
      wrapper.className = 'imagen-seleccionada';
      const preview = document.createElement('img');
      preview.src = img.src;
      preview.alt = 'Imagen seleccionada';
      const btnQuitar = document.createElement('button');
      btnQuitar.type = 'button';
      btnQuitar.className = 'boton-quitar-imagen';
      btnQuitar.innerText = '✖';
      btnQuitar.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.remove();
        contenedorAdjunta.innerHTML = '';
        contenedorAdjunta.appendChild(crearBotonClip());
        inputHidden.value = '';
      });
      wrapper.appendChild(preview);
      wrapper.appendChild(btnQuitar);
      contenedorAdjunta.innerHTML = '';
      contenedorAdjunta.appendChild(wrapper);
      inputHidden.value = img.getAttribute('src') || '';
    });
  });

  botonSeleccionarMapa.addEventListener('click', () => {
    mapaSection.classList.add('mapa-ocultar');
    mapaSeleccionDireccion.classList.remove('oculto');
    modal.classList.add('oculto');
  });
  
  mapaBg.addEventListener('click', () => {
    if (!mapaSeleccionDireccion.classList.contains('oculto')) {
      inputDireccionIncidente.value = "Las Palmeras, Asoc. Juan Carlos 234 Mz F";
      mapaSection.classList.remove('mapa-ocultar');
      mapaSeleccionDireccion.classList.add('oculto');
      modal.classList.remove('oculto'); 
    }
  });

  // --- LÓGICA DE VALIDACIÓN Y ENVÍO DEL FORMULARIO ---
  formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    const esTituloValido = inputTituloIncidente.value.trim() !== '';
    const esDireccionValida = inputDireccionIncidente.value.trim() !== '';
    let formularioEsValido = true;

    if (esTituloValido) {
      inputTituloIncidente.classList.remove('error');
      tituloError.classList.remove('visible');
    } else {
      inputTituloIncidente.classList.add('error');
      tituloError.classList.add('visible');
      formularioEsValido = false;
    }
    
    if (esDireccionValida) {
      inputDireccionIncidente.classList.remove('error');
      direccionError.classList.remove('visible');
    } else {
      inputDireccionIncidente.classList.add('error');
      direccionError.classList.add('visible');
      formularioEsValido = false;
    }

    if (!formularioEsValido) {
      return; 
    }

    // --- SI LA VALIDACIÓN ES EXITOSA, CONTINUAMOS ---
    const iconoAlertaSvg = "data:image/svg+xml,%3Csvg width='67' height='67' viewBox='0 0 67 67' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M33.3333 66.6667C14.9233 66.6667 0 51.7433 0 33.3333C0 14.9233 14.9233 0 33.3333 0C51.7433 0 66.6667 14.9233 66.6667 33.3333C66.6667 51.7433 51.7433 66.6667 33.3333 66.6667ZM33.3333 60C40.4058 60 47.1885 57.1905 52.1895 52.1895C57.1905 47.1885 60 40.4058 60 33.3333C60 26.2609 57.1905 19.4781 52.1895 14.4772C47.1885 9.47618 40.4058 6.66667 33.3333 6.66667C26.2609 6.66667 19.4781 9.47618 14.4772 14.4772C9.47618 19.4781 6.66667 26.2609 6.66667 33.3333C6.66667 40.4058 9.47618 47.1885 14.4772 52.1895C19.4781 57.1905 26.2609 60 33.3333 60ZM33.3333 16.6667C34.2174 16.6667 35.0652 17.0179 35.6904 17.643C36.3155 18.2681 36.6667 19.1159 36.6667 20V36.6667C36.6667 37.5507 36.3155 38.3986 35.6904 39.0237C35.0652 39.6488 34.2174 40 33.3333 40C32.4493 40 31.6014 39.6488 30.9763 39.0237C30.3512 38.3986 30 37.5507 30 36.6667V20C30 19.1159 30.3512 18.2681 30.9763 17.643C31.6014 17.0179 32.4493 16.6667 33.3333 16.6667ZM33.3333 50C32.4493 50 31.6014 49.6488 30.9763 49.0237C30.3512 48.3986 30 47.5507 30 46.6667C30 45.7826 30.3512 44.9348 30.9763 44.3096C31.6014 43.6845 32.4493 43.3333 33.3333 43.3333C34.2174 43.3333 35.0652 43.6845 35.6904 44.3096C36.3155 44.9348 36.6667 45.7826 36.6667 46.6667C36.6667 47.5507 36.3155 48.3986 35.6904 49.0237C35.0652 49.6488 34.2174 50 33.3333 50Z' fill='%23EAE9E7'/%3E%3C/svg%3E";
    const titulo = inputTituloIncidente.value;
    const imagenSrc = inputHidden.value;
    
    modal.classList.add('oculto');
    modalExito.classList.remove('oculto');

    reporteTitulo.textContent = titulo;
    if (imagenSrc) {
      reporteImagen.src = imagenSrc;
    } else {
      reporteImagen.src = iconoAlertaSvg;
    }

    formulario.reset();
    inputHidden.value = '';
    contenedorAdjunta.innerHTML = '';
    contenedorAdjunta.appendChild(crearBotonClip());

    modalExito.addEventListener('click', () => {
      modalExito.classList.add('oculto');
      reporteEnMapa.classList.remove('oculto');
    }, { once: true });
  });

  // --- OCULTAR ERRORES AL ESCRIBIR ---
  inputTituloIncidente.addEventListener('input', () => {
    if (inputTituloIncidente.value.trim() !== '') {
      inputTituloIncidente.classList.remove('error');
      tituloError.classList.remove('visible');
    }
  });

  inputDireccionIncidente.addEventListener('input', () => {
    if (inputDireccionIncidente.value.trim() !== '') {
      inputDireccionIncidente.classList.remove('error');
      direccionError.classList.remove('visible');
    }
  });

});

// --- Autocompletado en la barra de búsqueda ---
const inputBusqueda = document.getElementById('input-busqueda');
const suggestionsList = document.getElementById('suggestions');
const sugerencias = Array.from(suggestionsList.getElementsByTagName('li'));

inputBusqueda.addEventListener('input', () => {
  const texto = inputBusqueda.value.toLowerCase();
  let hayCoincidencias = false;

  sugerencias.forEach(item => {
    const textoItem = item.textContent.toLowerCase();
    if (textoItem.includes(texto) && texto !== "") {
      item.style.display = "block";
      hayCoincidencias = true;
    } else {
      item.style.display = "none";
    }
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
  if (!e.target.closest('.busqueda')) {
    suggestionsList.classList.add('oculto');
  }
});


