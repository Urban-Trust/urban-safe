document.addEventListener('DOMContentLoaded', () => {
    const listaPendientes = document.querySelector('.lista-pendientes');
    const todasLasTarjetas = document.querySelectorAll('.incidente-pendiente-card');


    const detalleContenido = document.querySelector('.panel-detalle');
    const detalleAvatar = detalleContenido.querySelector('.detalle-header .reporter-avatar');
    const detalleTitulo = detalleContenido.querySelector('.detalle-header .reporter-titulo');
    const detalleDescripcion = detalleContenido.querySelector('.descripcion-completa');
    const detalleImagen = detalleContenido.querySelector('.imagen-principal-incidente');
    const botonVotoPositivo = detalleContenido.querySelector('.boton-voto.positivo');
    const botonVotoNegativo = detalleContenido.querySelector('.boton-voto.negativo');
    const textoVotoPositivo = botonVotoPositivo.querySelector('.texto-voto');
    const textoVotoNegativo = botonVotoNegativo.querySelector('.texto-voto');


    const datosIncidentes = {
        'incidente-1': {
            reporterNombre: 'Juan Pérez',
            reporterIniciales: 'JP',
            reporterAvatarColor: '#4682B4',
            titulo: 'Robo a mano armada en Av. Principal',
            descripcion: 'Dos sujetos interceptaron a un transeúnte cerca del parque. Se recomienda tener precaución en la zona, especialmente durante la noche. Los delincuentes se dieron a la fuga en una motocicleta negra.',
            imagenSrc: 'assets/images/adjuntar-imagen-1.jpg',
            votosPositivosBase: 8,
            votosNegativosBase: 2,
        },
        'incidente-2': {
            reporterNombre: 'Maria Garcia',
            reporterIniciales: 'MG',
            reporterAvatarColor: '#DAA520',
            titulo: 'Daños a la propiedad pública',
            descripcion: 'Se reportaron grafitis y daños en las bancas del parque central. Las autoridades ya han sido notificadas para que tomen las medidas correspondientes y se realice la limpieza.',
            imagenSrc: 'assets/images/adjuntar-imagen-2.jpg',
            votosPositivosBase: 12,
            votosNegativosBase: 1,
        },
        'incidente-4': {
            reporterNombre: 'Carlos Sanchez',
            reporterIniciales: 'CS',
            reporterAvatarColor: '#3A8E7A',
            titulo: 'Actividad Sospechosa',
            descripcion: 'Un vehículo sin placas ha estado rondando el vecindario durante las últimas horas. Se solicita a los vecinos estar alertas e informar cualquier novedad.',
            imagenSrc: 'assets/images/adjuntar-imagen-4.jpg',
            votosPositivosBase: 5,
            votosNegativosBase: 0,
        },
        'incidente-5': {
            reporterNombre: 'Ana Torres',
            reporterIniciales: 'AT',
            reporterAvatarColor: '#C04040',
            titulo: 'Mascota perdida',
            descripcion: 'Se ha perdido un perro de raza pequeña, color caramelo, que responde al nombre de "Toby". Fue visto por última vez cerca de la tienda local. Se ofrece recompensa.',
            imagenSrc: 'assets/images/adjuntar-imagen-5.jpg',
            votosPositivosBase: 25,
            votosNegativosBase: 0,
        },
    };

    let estadoActual = {
        idSeleccionado: null,
        votoUsuario: null,
    };


    function mostrarDetallesIncidente(id) {
        const datos = datosIncidentes[id];
        if (!datos) return;

        estadoActual.idSeleccionado = id;
        estadoActual.votoUsuario = null; 

        detalleAvatar.style.backgroundColor = datos.reporterAvatarColor;
        detalleAvatar.textContent = datos.reporterIniciales;
        detalleAvatar.title = datos.reporterNombre;
        
        detalleTitulo.textContent = `${datos.reporterNombre} - ${datos.titulo}`;
        detalleDescripcion.textContent = datos.descripcion;
        detalleImagen.src = datos.imagenSrc;
        detalleImagen.alt = `Evidencia de ${datos.titulo}`;
        
        actualizarVotos();
    }


    function actualizarVotos() {
        if (!estadoActual.idSeleccionado) return;

        const datos = datosIncidentes[estadoActual.idSeleccionado];
        let votosPositivos = datos.votosPositivosBase;
        let votosNegativos = datos.votosNegativosBase;


        botonVotoPositivo.classList.remove('activo');
        botonVotoNegativo.classList.remove('activo');


        if (estadoActual.votoUsuario === 'positivo') {
            votosPositivos++;
            botonVotoPositivo.classList.add('activo');
        } else if (estadoActual.votoUsuario === 'negativo') {
            votosNegativos++;
            botonVotoNegativo.classList.add('activo');
        }

        
        textoVotoPositivo.textContent = `Votos Positivos (${votosPositivos})`;
        textoVotoNegativo.textContent = `Votos Negativos (${votosNegativos})`;
    }


    listaPendientes.addEventListener('click', (e) => {
        const tarjetaClickeada = e.target.closest('.incidente-pendiente-card');
        if (!tarjetaClickeada) return; 

        
        todasLasTarjetas.forEach(tarjeta => tarjeta.classList.remove('active'));

        tarjetaClickeada.classList.add('active');

        
        const idTarjeta = `incidente-${Array.from(todasLasTarjetas).indexOf(tarjetaClickeada) + 1}`;
        if(idTarjeta === "incidente-3") return; 
        
        
        mostrarDetallesIncidente(idTarjeta);
    });


    botonVotoPositivo.addEventListener('click', () => {
        if (estadoActual.votoUsuario === 'positivo') {
            estadoActual.votoUsuario = null;
        } else {
            estadoActual.votoUsuario = 'positivo';
        }
        actualizarVotos();
    });


    botonVotoNegativo.addEventListener('click', () => {
        if (estadoActual.votoUsuario === 'negativo') {
            estadoActual.votoUsuario = null;
        } else {
            
            estadoActual.votoUsuario = 'negativo';
        }
        actualizarVotos();
    });


    if (todasLasTarjetas.length > 0) {
        todasLasTarjetas[0].click();
    }

});