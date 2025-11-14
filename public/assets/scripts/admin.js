document.addEventListener('DOMContentLoaded', () => {
  // Vista de tendencia dentro de la pagina
  const trendView = document.querySelector('.trend-view');
  const dashboard = document.querySelector('.dashboard-grid');
  const dashHeader = document.querySelector('.dashboard-header');
  const openButtons = document.querySelectorAll('.trend-more-btn');
  const backBtn = document.querySelector('.btn-back-trend');

  function openTrend(ev) {
    if (ev) ev.preventDefault();
    if (!trendView || !dashboard) return;
    dashboard.classList.add('oculto');
    if (dashHeader) dashHeader.classList.add('oculto');
    trendView.classList.remove('oculto');
    trendView.setAttribute('aria-hidden', 'false');
  }

  openButtons.forEach((btn) => btn.addEventListener('click', openTrend));

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (!trendView || !dashboard) return;
      trendView.classList.add('oculto');
      trendView.setAttribute('aria-hidden', 'true');
      dashboard.classList.remove('oculto');
      if (dashHeader) dashHeader.classList.remove('oculto');
    });
  }

  // Crear estadisticas adicionales dentro de la seccion de tendencia
  if (trendView) {
    const accordionsContainer = trendView.querySelector('.trend-accordions');
    if (accordionsContainer) {
      const extraStats = [
        {
          tipo: 'danio',
          fecha: 'semana',
          ubicacion: 'Villa El Salvador',
          html: `
            <div class="trend-acc-header">
              <div class="acc-left">
                <span class="acc-icon" aria-hidden="true">DP</span>
                <h3>Daños a la propiedad - Ultima semana - Estadistica</h3>
              </div>
              <div class="acc-right">
                <button class="acc-action" title="Descargar PDF" aria-label="Descargar PDF">
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0)">
                      <path d="M8.33334 33.3333H31.6667V30H8.33334V33.3333ZM31.6667 15H25V5H15V15H8.33334L20 26.6667L31.6667 15Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect width="40" height="40" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.13333 11.7342H4.4V10.2676H5.13333C5.32783 10.2676 5.51435 10.3448 5.65188 10.4824C5.78941 10.6199 5.86667 10.8064 5.86667 11.0009C5.86667 11.1954 5.78941 11.3819 5.65188 11.5195C5.51435 11.657 5.32783 11.7342 5.13333 11.7342ZM10.2667 14.6676V10.2676H11C11.1945 10.2676 11.381 10.3448 11.5185 10.4824C11.6561 10.6199 11.7333 10.8064 11.7333 11.0009V13.9342C11.7333 14.1287 11.6561 14.3153 11.5185 14.4528C11.381 14.5903 11.1945 14.6676 11 14.6676H10.2667Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.46667 2.2C1.46667 1.61652 1.69845 1.05695 2.11103 0.644365C2.52361 0.231785 3.08319 0 3.66667 0L15.7036 0L20.5333 4.82973V19.8C20.5333 20.3835 20.3015 20.9431 19.889 21.3556C19.4764 21.7682 18.9168 22 18.3333 22H3.66667C3.08319 22 2.52361 21.7682 2.11103 21.3556C1.69845 20.9431 1.46667 20.3835 1.46667 19.8V2.2ZM5.13333 8.8H2.93333V16.1333H4.4V13.2H5.13333C5.71681 13.2 6.27639 12.9682 6.68897 12.5556C7.10155 12.1431 7.33333 11.5835 7.33333 11C7.33333 10.4165 7.10155 9.85695 6.68897 9.44436C6.27639 9.03179 5.71681 8.8 5.13333 8.8ZM11 8.8H8.8V16.1333H11C11.5835 16.1333 12.1431 15.9015 12.5556 15.489C12.9682 15.0764 13.2 14.5168 13.2 13.9333V11C13.2 10.4165 12.9682 9.85695 12.5556 9.44436C12.1431 9.03179 11.5835 8.8 11 8.8ZM14.6667 16.1333V8.8H19.0667V10.2667H16.1333V11.7333H17.6V13.2H16.1333V16.1333H14.6667Z" fill="white"/>
                  </svg>
                </button>
                <button class="acc-action" title="Descargar Excel" aria-label="Descargar Excel">
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip1)">
                      <path d="M8.33334 33.3333H31.6667V30H8.33334V33.3333ZM31.6667 15H25V5H15V15H8.33334L20 26.6667L31.6667 15Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip1">
                        <rect width="40" height="40" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="22">
                      <path d="M3.66667 6.87565V2.75065C3.66667 2.50754 3.76324 2.27438 3.93515 2.10247C4.10706 1.93056 4.34022 1.83398 4.58333 1.83398H17.4167C17.6598 1.83398 17.8929 1.93056 18.0648 2.10247C18.2368 2.27438 18.3333 2.50754 18.3333 2.75065V19.2507C18.3333 19.4938 18.2368 19.7269 18.0648 19.8988C17.8929 20.0707 17.6598 20.1673 17.4167 20.1673H4.58333C4.34022 20.1673 4.10706 20.0707 3.93515 19.8988C3.76324 19.7269 3.66667 19.4938 3.66667 19.2507V15.1257" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14.2083 6.875H15.5833M12.8333 10.5417H15.5833M12.8333 14.2083H15.5833" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      <path d="M1.83333 6.875H10.0833V15.125H1.83333V6.875Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4.58333 9.625L7.33333 12.375M7.33333 9.625L4.58333 12.375" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </mask>
                    <g mask="url(#mask0)">
                      <path d="M0 0H22V22H0V0Z" fill="white"/>
                    </g>
                  </svg>
                </button>
                <button class="acc-chevron-btn" aria-expanded="false" aria-label="Desplegar" type="button">
                  <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.3495 0.707567C14.8027 0.254513 15.4172 0 16.0581 0C16.6989 0 17.3134 0.254513 17.7666 0.707567L31.4377 14.3786C31.6685 14.6016 31.8526 14.8682 31.9793 15.1631C32.106 15.4579 32.1726 15.775 32.1754 16.0959C32.1782 16.4168 32.117 16.735 31.9955 17.032C31.874 17.329 31.6946 17.5989 31.4677 17.8258C31.2408 18.0527 30.9709 18.2321 30.6739 18.3536C30.3769 18.4751 30.0587 18.5363 29.7378 18.5335C29.4169 18.5307 29.0998 18.464 28.805 18.3374C28.5101 18.2107 28.2435 18.0266 28.0206 17.7958L16.0581 5.83332L4.09555 17.7958C3.63976 18.236 3.02931 18.4796 2.39567 18.4741C1.76203 18.4686 1.1559 18.2144 0.707827 17.7664C0.259756 17.3183 0.00559616 16.7122 9.15527e-05 16.0785C-0.00541687 15.4449 0.238171 14.8344 0.678387 14.3786L14.3495 0.707567Z" fill="white"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="trend-acc-body">
              <h4 class="trend-section-title">Incidentes de daño a la propiedad por dia (ultimos 7 dias)</h4>
              <div class="trend-chart">
                <div class="trend-bars">
                  <div class="trend-col"><span class="trend-value">5</span><div class="trend-bar" style="height:25%"></div><p class="trend-year">Lun</p></div>
                  <div class="trend-col"><span class="trend-value">7</span><div class="trend-bar" style="height:35%"></div><p class="trend-year">Mar</p></div>
                  <div class="trend-col"><span class="trend-value">6</span><div class="trend-bar" style="height:30%"></div><p class="trend-year">Mie</p></div>
                  <div class="trend-col"><span class="trend-value">9</span><div class="trend-bar" style="height:45%"></div><p class="trend-year">Jue</p></div>
                  <div class="trend-col"><span class="trend-value">11</span><div class="trend-bar" style="height:55%"></div><p class="trend-year">Vie</p></div>
                  <div class="trend-col"><span class="trend-value">14</span><div class="trend-bar" style="height:70%"></div><p class="trend-year">Sab</p></div>
                  <div class="trend-col"><span class="trend-value">8</span><div class="trend-bar" style="height:40%"></div><p class="trend-year">Dom</p></div>
                </div>
              </div>

              <div class="trend-ring-and-more">
                <div class="trend-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="#e5e7eb" stroke-width="8"></circle>
                    <!-- 45% de los daños a la propiedad son vandalismo en fachadas -->
                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="#39716C" stroke-width="8" stroke-linecap="round" stroke-dasharray="263.9" stroke-dashoffset="145" transform="rotate(-90 50 50)"></circle>
                  </svg>
                </div>
                <div class="trend-more-block">
                  <p class="muted small">Ver detalle de tipos de daño a la propiedad reportados en la ultima semana</p>
                  <button type="button" class="btn-simple btn-ver-mas">Ver mas</button>
                </div>
              </div>

              <div class="trend-more-content oculto">
                <p><b>Vandalismo en fachadas:</b><br/>Incluye rayado de paredes, rotura de vidrios y pintas no autorizadas en viviendas y comercios del barrio.</p>
                <p><b>Portones forzados:</b><br/>Corresponden a intentos de ingreso no autorizado a cocheras y pasajes vecinales en horario nocturno.</p>
                <p><b>Daño a vehiculos estacionados:</b><br/>Abolladuras, espejos rotos y robo de autopartes, principalmente en calles con baja iluminacion.</p>
              </div>
            </div>
          `,
        },
        {
          tipo: 'incendio',
          fecha: 'hoy',
          ubicacion: 'Comas, Lima Norte',
          html: `
            <div class="trend-acc-header">
              <div class="acc-left">
                <span class="acc-icon" aria-hidden="true">IN</span>
                <h3>Incendios domiciliarios - Hoy - Estadistica</h3>
              </div>
              <div class="acc-right">
                <button class="acc-action" title="Descargar PDF" aria-label="Descargar PDF">
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0)">
                      <path d="M8.33334 33.3333H31.6667V30H8.33334V33.3333ZM31.6667 15H25V5H15V15H8.33334L20 26.6667L31.6667 15Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect width="40" height="40" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.13333 11.7342H4.4V10.2676H5.13333C5.32783 10.2676 5.51435 10.3448 5.65188 10.4824C5.78941 10.6199 5.86667 10.8064 5.86667 11.0009C5.86667 11.1954 5.78941 11.3819 5.65188 11.5195C5.51435 11.657 5.32783 11.7342 5.13333 11.7342ZM10.2667 14.6676V10.2676H11C11.1945 10.2676 11.381 10.3448 11.5185 10.4824C11.6561 10.6199 11.7333 10.8064 11.7333 11.0009V13.9342C11.7333 14.1287 11.6561 14.3153 11.5185 14.4528C11.381 14.5903 11.1945 14.6676 11 14.6676H10.2667Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.46667 2.2C1.46667 1.61652 1.69845 1.05695 2.11103 0.644365C2.52361 0.231785 3.08319 0 3.66667 0L15.7036 0L20.5333 4.82973V19.8C20.5333 20.3835 20.3015 20.9431 19.889 21.3556C19.4764 21.7682 18.9168 22 18.3333 22H3.66667C3.08319 22 2.52361 21.7682 2.11103 21.3556C1.69845 20.9431 1.46667 20.3835 1.46667 19.8V2.2ZM5.13333 8.8H2.93333V16.1333H4.4V13.2H5.13333C5.71681 13.2 6.27639 12.9682 6.68897 12.5556C7.10155 12.1431 7.33333 11.5835 7.33333 11C7.33333 10.4165 7.10155 9.85695 6.68897 9.44436C6.27639 9.03179 5.71681 8.8 5.13333 8.8ZM11 8.8H8.8V16.1333H11C11.5835 16.1333 12.1431 15.9015 12.5556 15.489C12.9682 15.0764 13.2 14.5168 13.2 13.9333V11C13.2 10.4165 12.9682 9.85695 12.5556 9.44436C12.1431 9.03179 11.5835 8.8 11 8.8ZM14.6667 16.1333V8.8H19.0667V10.2667H16.1333V11.7333H17.6V13.2H16.1333V16.1333H14.6667Z" fill="white"/>
                  </svg>
                </button>
                <button class="acc-action" title="Descargar Excel" aria-label="Descargar Excel">
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip1)">
                      <path d="M8.33334 33.3333H31.6667V30H8.33334V33.3333ZM31.6667 15H25V5H15V15H8.33334L20 26.6667L31.6667 15Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip1">
                        <rect width="40" height="40" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="22">
                      <path d="M3.66667 6.87565V2.75065C3.66667 2.50754 3.76324 2.27438 3.93515 2.10247C4.10706 1.93056 4.34022 1.83398 4.58333 1.83398H17.4167C17.6598 1.83398 17.8929 1.93056 18.0648 2.10247C18.2368 2.27438 18.3333 2.50754 18.3333 2.75065V19.2507C18.3333 19.4938 18.2368 19.7269 18.0648 19.8988C17.8929 20.0707 17.6598 20.1673 17.4167 20.1673H4.58333C4.34022 20.1673 4.10706 20.0707 3.93515 19.8988C3.76324 19.7269 3.66667 19.4938 3.66667 19.2507V15.1257" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14.2083 6.875H15.5833M12.8333 10.5417H15.5833M12.8333 14.2083H15.5833" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      <path d="M1.83333 6.875H10.0833V15.125H1.83333V6.875Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4.58333 9.625L7.33333 12.375M7.33333 9.625L4.58333 12.375" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </mask>
                    <g mask="url(#mask0)">
                      <path d="M0 0H22V22H0V0Z" fill="white"/>
                    </g>
                  </svg>
                </button>
                <button class="acc-chevron-btn" aria-expanded="false" aria-label="Desplegar" type="button">
                  <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.3495 0.707567C14.8027 0.254513 15.4172 0 16.0581 0C16.6989 0 17.3134 0.254513 17.7666 0.707567L31.4377 14.3786C31.6685 14.6016 31.8526 14.8682 31.9793 15.1631C32.106 15.4579 32.1726 15.775 32.1754 16.0959C32.1782 16.4168 32.117 16.735 31.9955 17.032C31.874 17.329 31.6946 17.5989 31.4677 17.8258C31.2408 18.0527 30.9709 18.2321 30.6739 18.3536C30.3769 18.4751 30.0587 18.5363 29.7378 18.5335C29.4169 18.5307 29.0998 18.464 28.805 18.3374C28.5101 18.2107 28.2435 18.0266 28.0206 17.7958L16.0581 5.83332L4.09555 17.7958C3.63976 18.236 3.02931 18.4796 2.39567 18.4741C1.76203 18.4686 1.1559 18.2144 0.707827 17.7664C0.259756 17.3183 0.00559616 16.7122 9.15527e-05 16.0785C-0.00541687 15.4449 0.238171 14.8344 0.678387 14.3786L14.3495 0.707567Z" fill="white"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="trend-acc-body">
              <h4 class="trend-section-title">Incendios en viviendas reportados hoy</h4>
              <div class="trend-chart">
                <div class="trend-bars">
                  <div class="trend-col"><span class="trend-value">2</span><div class="trend-bar" style="height:30%"></div><p class="trend-year">Mañana</p></div>
                  <div class="trend-col"><span class="trend-value">3</span><div class="trend-bar" style="height:45%"></div><p class="trend-year">Tarde</p></div>
                  <div class="trend-col"><span class="trend-value">4</span><div class="trend-bar" style="height:60%"></div><p class="trend-year">Noche</p></div>
                </div>
              </div>

              <div class="trend-ring-and-more">
                <div class="trend-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="#e5e7eb" stroke-width="8"></circle>
                    <!-- 70% de los incendios domiciliarios se originan por sobrecarga electrica -->
                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="#EA580C" stroke-width="8" stroke-linecap="round" stroke-dasharray="263.9" stroke-dashoffset="80" transform="rotate(-90 50 50)"></circle>
                  </svg>
                </div>
                <div class="trend-more-block">
                  <p class="muted small">Ver detalle de causas y tiempos de respuesta de los incendios reportados hoy</p>
                  <button type="button" class="btn-simple btn-ver-mas">Ver mas</button>
                </div>
              </div>

              <div class="trend-more-content oculto">
                <p><b>Origen electrico:</b><br/>La mayoria de incendios se relaciona con sobrecarga de enchufes, extensiones en mal estado y uso de artefactos antiguos.</p>
                <p><b>Cocina sin supervision:</b><br/>Se registran casos por ollas olvidadas al fuego y fugas de gas domestico no atendidas a tiempo.</p>
                <p><b>Respuesta vecinal:</b><br/>En promedio, los vecinos logran activar la alarma y coordinar con bomberos en menos de 6 minutos desde el primer reporte.</p>
              </div>
            </div>
          `,
        },
      ];

      extraStats.forEach((stat) => {
        const acc = document.createElement('div');
        acc.className = 'trend-accordion';
        acc.dataset.tipo = stat.tipo;
        acc.dataset.fecha = stat.fecha;
        acc.dataset.ubicacion = stat.ubicacion;
        acc.innerHTML = stat.html;
        accordionsContainer.appendChild(acc);
      });
    }
  }

  // Filtros de tendencia (buscador, tipo, fecha, ubicacion)
  const filterSearch = trendView ? trendView.querySelector('.trend-search input') : null;
  const filterSearchBtn = trendView ? trendView.querySelector('.trend-search-btn') : null;
  const typeCheckboxes = trendView
    ? trendView.querySelectorAll('.trend-filter-group:nth-of-type(1) input[type="checkbox"]')
    : [];
  const fechaCheckboxes = trendView
    ? trendView.querySelectorAll('.trend-filter-group:nth-of-type(2) input[type="checkbox"]')
    : [];
  const ubicacionInput = trendView
    ? trendView.querySelector('.trend-filter-group:nth-of-type(3) input[type="text"]')
    : null;

  function getAllAccordions() {
    if (!trendView) return [];
    return Array.from(trendView.querySelectorAll('.trend-accordions .trend-accordion'));
  }

  function applyTrendFilters() {
    const accordions = getAllAccordions();
    if (!accordions.length) return;

    const term = filterSearch ? filterSearch.value.trim().toLowerCase() : '';

    const typeMap = ['robo', 'danio', 'incendio'];
    const activeTypes = [];
    typeCheckboxes.forEach((cb, index) => {
      if (cb.checked) {
        const mapped = typeMap[index];
        if (mapped) activeTypes.push(mapped);
      }
    });

    const fechaMap = ['hoy', 'semana', 'mes'];
    const activeFechas = [];
    fechaCheckboxes.forEach((cb, index) => {
      if (cb.checked) {
        const mapped = (cb.value || fechaMap[index] || '').toLowerCase();
        if (mapped) activeFechas.push(mapped);
      }
    });

    const ubic = ubicacionInput ? ubicacionInput.value.trim().toLowerCase() : '';

    accordions.forEach((acc) => {
      let visible = true;
      const tipo = (acc.dataset.tipo || '').toLowerCase();
      const fecha = (acc.dataset.fecha || '').toLowerCase();
      const accUbic = (acc.dataset.ubicacion || '').toLowerCase();

      if (term) {
        const title = acc.querySelector('.trend-acc-header h3');
        const body = acc.querySelector('.trend-acc-body');
        const text = ((title ? title.textContent : '') + ' ' + (body ? body.textContent : '')).toLowerCase();
        if (!text.includes(term)) visible = false;
      }

      if (visible && activeTypes.length && !activeTypes.includes(tipo)) {
        visible = false;
      }

      if (visible && activeFechas.length && fecha && !activeFechas.includes(fecha)) {
        visible = false;
      }

      if (visible && ubic && accUbic && !accUbic.includes(ubic)) {
        visible = false;
      }

      acc.style.display = visible ? '' : 'none';
    });
  }

  if (filterSearch) {
    filterSearch.addEventListener('input', applyTrendFilters);
  }
  if (filterSearchBtn) {
    filterSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyTrendFilters();
    });
  }
  typeCheckboxes.forEach((cb) => cb.addEventListener('change', applyTrendFilters));
  fechaCheckboxes.forEach((cb) => cb.addEventListener('change', applyTrendFilters));
  if (ubicacionInput) {
    ubicacionInput.addEventListener('input', applyTrendFilters);
  }

  // Delegacion de eventos: flecha del acordeon y boton "Ver mas"
  document.addEventListener('click', (e) => {
    // Toggle del acordeon solo con la flecha
    const chevronBtn = e.target.closest('.acc-chevron-btn');
    if (chevronBtn) {
      const accordion = chevronBtn.closest('.trend-accordion');
      if (!accordion) return;
      const body = accordion.querySelector('.trend-acc-body');
      if (!body) return;

      const isOpen = accordion.classList.contains('open');
      chevronBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');

      if (!isOpen) {
        accordion.classList.add('open');
        requestAnimationFrame(() => {
          body.style.maxHeight = body.scrollHeight + 'px';
        });
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(() => {
          body.style.maxHeight = '0px';
        });
        accordion.classList.remove('open');
      }
      return;
    }

    // Boton "Ver mas"
    const btnVerMas = e.target.closest('.btn-ver-mas');
    if (!btnVerMas) return;

    const body = btnVerMas.closest('.trend-acc-body');
    if (!body) return;

    const extra = body.querySelector('.trend-more-content');
    if (!extra) return;

    const isHidden = extra.classList.contains('oculto');
    if (isHidden) {
      extra.classList.remove('oculto');
      btnVerMas.textContent = 'Ver menos';
    } else {
      extra.classList.add('oculto');
      btnVerMas.textContent = 'Ver mas';
    }

    // Ajustar altura para que el contenido adicional sea visible
    body.style.maxHeight = body.scrollHeight + 'px';
  });

  // Aplicar filtros una vez al cargar
  applyTrendFilters();
});
