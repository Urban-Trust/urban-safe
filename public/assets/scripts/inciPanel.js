document.addEventListener('DOMContentLoaded', () => {
  const incidentItems = Array.from(document.querySelectorAll('.incident-item'));
  const detailTemplate = document.getElementById('incidentDetailTemplate');
  const searchInput = document.getElementById('incidentSearch');
  const noResultsMsg = document.getElementById('incidentNoResults');
  const suggestionBox = document.getElementById('incidentSuggestions');
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const filterPanel = document.getElementById('filterPanel');
  const filterType = document.getElementById('filterType');
  const filterDate = document.getElementById('filterDate');
  const filterLocation = document.getElementById('filterLocation');
  const filterApply = document.getElementById('filterApply');
  const filterReset = document.getElementById('filterReset');
  const chartPanel = document.getElementById('chartPanel');
  const chartFilterType = document.getElementById('chartFilterType');
  const chartFilterDate = document.getElementById('chartFilterDate');
  const chartFilterLocation = document.getElementById('chartFilterLocation');
  const chartTitle = document.getElementById('chartTitle');
  const chartSubtitle = document.getElementById('chartSubtitle');
  const chartDateLabel = document.getElementById('chartDateLabel');
  const reportModal = document.getElementById('reportModal');
  const reportAuthoritiesBtn = document.getElementById('reportAuthoritiesBtn');
  const reportModalClose = document.getElementById('reportModalClose');
  const reportConfirm = document.getElementById('reportConfirm');
  const reportConfirmMessage = document.getElementById('reportConfirmMessage');
  const reportConfirmClose = document.getElementById('reportConfirmClose');

  if (!incidentItems.length) return;

  const statusSlug = (value = '') =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  let currentSuggestions = [];
  let highlightedSuggestion = -1;
  let openItem = null;

  const incidentMeta = incidentItems.map(item => {
    const title = item.dataset.title || item.querySelector('.incident-title')?.textContent || '';
    const location = item.dataset.location || item.querySelector('.incident-location')?.textContent || '';
    const time = item.dataset.datetime || item.querySelector('.incident-time')?.textContent || '';
    const searchText = `${title} ${location} ${time}`.toLowerCase();
    item.dataset.searchText = searchText;
    return { element: item, title, location, time, searchText };
  });

  const buildDetailIcon = (wrapper, item) => {
    if (!wrapper) return;
    wrapper.innerHTML = '';
    const type = item.dataset.iconType || 'material';
    if (type === 'image') {
      const img = document.createElement('img');
      img.src = item.dataset.icon || 'assets/images/armafuego.png';
      img.alt = 'Icono del incidente';
      wrapper.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.className = 'material-icons';
      span.textContent = item.dataset.icon || 'report';
      wrapper.appendChild(span);
    }
  };

  const buildDetail = (item) => {
    if (!detailTemplate?.content) return null;
    const fragment = detailTemplate.content.cloneNode(true);
    const detail = fragment.querySelector('.incident-detail-inline');
    if (!detail) return null;

    const title = item.dataset.title || item.querySelector('.incident-title')?.textContent?.trim() || '';
    const incidentId = item.dataset.incidentId || 'N/A';
    const statusText = item.dataset.status || 'Sin estado';
    const datetime = item.dataset.datetime || item.querySelector('.incident-time')?.textContent?.trim() || '';
    const location = item.dataset.location || item.querySelector('.incident-location')?.textContent?.trim() || '';
    const reporter = item.dataset.reporter || 'N/A';
    const contact = item.dataset.contact || 'N/A';
    const description = item.dataset.description || 'Sin descripcion adicional.';
    const mapSrc = item.dataset.map || 'assets/images/mapabg.png';
    const slug = item.dataset.statusKey || statusSlug(statusText);

    buildDetailIcon(detail.querySelector('.detail-icon'), item);

    const titleEl = detail.querySelector('.detail-title');
    if (titleEl) titleEl.textContent = title;

    const idEl = detail.querySelector('.detail-id');
    if (idEl) idEl.textContent = `ID del incidente: ${incidentId}`;

    const statusLabel = detail.querySelector('.detail-status-label');
    if (statusLabel) statusLabel.textContent = statusText;

    const datetimeEl = detail.querySelector('.detail-datetime');
    if (datetimeEl) datetimeEl.textContent = datetime;

    const locationEl = detail.querySelector('.detail-location');
    if (locationEl) locationEl.textContent = location;

    const reporterEl = detail.querySelector('.detail-reporter');
    if (reporterEl) reporterEl.textContent = reporter;

    const contactEl = detail.querySelector('.detail-contact');
    if (contactEl) contactEl.textContent = contact;

    const descriptionEl = detail.querySelector('.detail-description');
    if (descriptionEl) descriptionEl.textContent = description;

    const mapImage = detail.querySelector('.detail-map-image');
    if (mapImage) {
      mapImage.src = mapSrc;
      mapImage.alt = `Mapa del incidente ${title}`;
    }

    const statusDot = detail.querySelector('.status-dot');
    if (statusDot) {
      statusDot.className = 'status-dot';
      if (slug) statusDot.classList.add(`status-${slug}`);
    }

    detail.addEventListener('click', (event) => event.stopPropagation());

    detail.querySelectorAll('.detail-close-btn, .detail-close-secondary').forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        closeDetail(item);
      });
    });

    const reportBtn = detail.querySelector('.detail-report-btn');
    reportBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      reportAuthoritiesBtn?.click();
    });

    return detail;
  };

  const closeDetail = (item = openItem) => {
    if (!item) return;
    const detail = item.querySelector('.incident-detail-inline');
    if (detail) detail.remove();
    item.classList.remove('active', 'has-detail');
    item.removeAttribute('aria-expanded');
    if (openItem === item) openItem = null;
  };

  const openDetail = (item) => {
    if (!item || item.style.display === 'none') return;
    if (openItem === item) {
      closeDetail(item);
      return;
    }
    closeDetail();
    const detail = buildDetail(item);
    if (!detail) return;
    item.appendChild(detail);
    item.classList.add('active', 'has-detail');
    item.setAttribute('aria-expanded', 'true');
    openItem = item;
  };

  const hideSuggestions = () => {
    if (!suggestionBox) return;
    suggestionBox.classList.add('hidden');
    suggestionBox.innerHTML = '';
    currentSuggestions = [];
    highlightedSuggestion = -1;
  };

  const highlightSuggestion = (index) => {
    if (!suggestionBox) return;
    const items = suggestionBox.querySelectorAll('.search-suggestion-item');
    items.forEach((el, idx) => {
      if (idx === index) el.classList.add('active');
      else el.classList.remove('active');
    });
    highlightedSuggestion = index;
  };

  const selectSuggestion = (meta) => {
    if (!meta || !searchInput) return;
    searchInput.value = meta.title;
    hideSuggestions();
    applyFilters();
    openDetail(meta.element);
  };

  const updateSuggestions = (termRaw) => {
    if (!suggestionBox || !searchInput) return;
    const term = termRaw.trim().toLowerCase();
    hideSuggestions();
    if (!term || term.length < 2) return;

    const matches = incidentMeta
      .filter(meta => meta.searchText.includes(term))
      .slice(0, 5);

    if (!matches.length) return;

    matches.forEach((meta, idx) => {
      const option = document.createElement('div');
      option.className = 'search-suggestion-item';
      option.setAttribute('role', 'option');
      option.dataset.index = idx;
      option.innerHTML = `<strong>${meta.title}</strong><span>${meta.location || meta.time || ''}</span>`;
      option.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectSuggestion(meta);
      });
      suggestionBox.appendChild(option);
    });

    currentSuggestions = matches;
    suggestionBox.classList.remove('hidden');
  };

  const applyFilters = () => {
    const term = searchInput?.value.trim().toLowerCase() || '';
    const selectedType = filterType?.value || '';
    const selectedDate = filterDate?.value || '';
    const locationTerm = filterLocation?.value.trim().toLowerCase() || '';
    let visibleCount = 0;

    incidentItems.forEach(item => {
      const dataText = item.dataset.searchText || '';
      const match =
        (!term || dataText.includes(term)) &&
        (!selectedType || (item.dataset.type || '').includes(selectedType)) &&
        (!selectedDate || (item.dataset.date || '').startsWith(selectedDate)) &&
        (!locationTerm || (item.dataset.location || '').toLowerCase().includes(locationTerm));

      item.style.display = match ? '' : 'none';

      if (match) {
        visibleCount += 1;
      } else if (item === openItem) {
        closeDetail(item);
      }
    });

    if (visibleCount === 0) {
      noResultsMsg?.classList.remove('hidden');
    } else {
      noResultsMsg?.classList.add('hidden');
    }
  };

  incidentItems.forEach((item) => {
    item.addEventListener('click', () => openDetail(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetail(item);
      }
    });
  });

  searchInput?.addEventListener('input', () => {
    applyFilters();
    updateSuggestions(searchInput?.value || '');
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (!suggestionBox || suggestionBox.classList.contains('hidden') || !currentSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (highlightedSuggestion + 1) % currentSuggestions.length;
      highlightSuggestion(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = highlightedSuggestion <= 0 ? currentSuggestions.length - 1 : highlightedSuggestion - 1;
      highlightSuggestion(next);
    } else if (e.key === 'Enter') {
      if (highlightedSuggestion >= 0) {
        e.preventDefault();
        selectSuggestion(currentSuggestions[highlightedSuggestion]);
      }
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  document.addEventListener('click', (e) => {
    if (!suggestionBox || suggestionBox.classList.contains('hidden')) return;
    if (e.target === searchInput || suggestionBox.contains(e.target)) return;
    hideSuggestions();
  });

  document.addEventListener('click', (e) => {
    if (!filterPanel || !filterToggleBtn) return;
    if (filterPanel.contains(e.target) || e.target === filterToggleBtn || filterToggleBtn.contains(e.target)) return;
    filterPanel.classList.add('hidden');
    filterPanel.setAttribute('aria-hidden', 'true');
    filterToggleBtn.setAttribute('aria-expanded', 'false');
  });

  reportAuthoritiesBtn?.addEventListener('click', () => {
    if (!reportModal) return;
    reportModal.classList.remove('hidden');
    reportModal.setAttribute('aria-hidden', 'false');
  });

  const closeReportModal = () => {
    if (!reportModal) return;
    reportModal.classList.add('hidden');
    reportModal.setAttribute('aria-hidden', 'true');
  };

  reportModalClose?.addEventListener('click', closeReportModal);
  reportModal?.addEventListener('click', (e) => {
    if (e.target === reportModal) closeReportModal();
  });

  document.querySelectorAll('.authority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.authority || 'Autoridad local';
      closeReportModal();
      if (reportConfirmMessage) reportConfirmMessage.textContent = `Reporte enviado a ${name}`;
      reportConfirm?.classList.remove('hidden');
    });
  });

  const closeConfirm = () => reportConfirm?.classList.add('hidden');
  reportConfirmClose?.addEventListener('click', closeConfirm);
  reportConfirm?.addEventListener('click', (e) => {
    if (e.target === reportConfirm) closeConfirm();
  });

  filterToggleBtn?.addEventListener('click', () => {
    if (!filterPanel) return;
    const isHidden = filterPanel.classList.contains('hidden');
    filterPanel.classList.toggle('hidden', !isHidden);
    filterPanel.setAttribute('aria-hidden', String(!isHidden));
    filterToggleBtn.setAttribute('aria-expanded', String(isHidden));
  });

  const updateChartSummary = () => {
    if (!chartPanel) return;
    const typeValue = filterType?.value || '';
    const dateValue = filterDate?.value || '';
    const locationValue = filterLocation?.value.trim() || '';
    const typeText = typeValue ? typeValue.charAt(0).toUpperCase() + typeValue.slice(1) : 'Todos';
    const dateText = dateValue ? new Date(dateValue).toLocaleDateString('es-PE') : 'Todas';
    const locationText = locationValue || 'Todos';

    chartFilterType && (chartFilterType.textContent = `Tipo: ${typeText}`);
    chartFilterDate && (chartFilterDate.textContent = `Fecha: ${dateText}`);
    chartFilterLocation && (chartFilterLocation.textContent = `Lugar: ${locationText}`);

    const messageMap = {
      incendio: '60% de los reportes son alertas de incendio',
      sospechoso: 'La mitad de reportes son actividades sospechosas',
      vehiculo: 'Los vehículos mal estacionados lideran los reportes',
      robo: '40% de los reportes son robos leves',
    };

    chartTitle && (chartTitle.textContent = messageMap[typeValue] || 'Nivel estable de incidentes registrados');
    chartSubtitle && (chartSubtitle.textContent = typeValue ? `Incidente más reportado: ${typeText}` : 'Promedio semanal de incidentes');
    chartDateLabel && (chartDateLabel.textContent = dateText);
    chartPanel.classList.remove('hidden');
  };

  filterApply?.addEventListener('click', () => {
    applyFilters();
    updateChartSummary();
  });

  filterReset?.addEventListener('click', () => {
    if (filterType) filterType.value = '';
    if (filterDate) filterDate.value = '';
    if (filterLocation) filterLocation.value = '';
    applyFilters();
    chartPanel?.classList.add('hidden');
  });
});
