// assets/scripts/alertaActi.js
document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     ALMACENAMIENTO (localStorage)
     ------------------------------------------------------------------------ */
  const STORAGE_TEMPLATES = 'rs_templates_v1';
  const STORAGE_SENT = 'rs_sent_v1';

  const readJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('Storage read error', e);
      return fallback;
    }
  };

  const writeJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const loadTemplates = () => readJSON(STORAGE_TEMPLATES, []);
  const saveTemplates = (t) => writeJSON(STORAGE_TEMPLATES, t);

  const loadSent = () => readJSON(STORAGE_SENT, []);
  const saveSent = (s) => writeJSON(STORAGE_SENT, s);

  /* ------------------------------------------------------------------------
     UTILIDADES
     ------------------------------------------------------------------------ */
  const uid = () => 'id_' + Math.random().toString(36).slice(2, 9);

  const fmtDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const nowISO = () => new Date().toISOString();

  /* ------------------------------------------------------------------------
     MODAL FACTORY (crea un modal sencillo con overlay)
     ------------------------------------------------------------------------ */
  function createModal({ title = '', width = '700px', onClose = null } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'rs-modal-overlay';
    overlay.style = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display:flex; align-items:center; justify-content:center; z-index:9999;
    `;

    const panel = document.createElement('div');
    panel.className = 'rs-modal-panel';
    panel.style = `
      width: ${width}; max-width: 95%; background: #fff; border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2); padding: 18px;
      font-family: Poppins, system-ui, -apple-system, "Segoe UI", Roboto;
    `;

    const header = document.createElement('div');
    header.style = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
    const h = document.createElement('h3');
    h.textContent = title;
    h.style = 'margin:0;font-size:18px;';
    const btnClose = document.createElement('button');
    btnClose.textContent = '✕';
    btnClose.style = 'background:transparent;border:none;font-size:18px;cursor:pointer;';
    btnClose.addEventListener('click', () => close());
    header.appendChild(h);
    header.appendChild(btnClose);

    const content = document.createElement('div');
    content.className = 'rs-modal-content';

    panel.appendChild(header);
    panel.appendChild(content);
    overlay.appendChild(panel);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    function close() {
      document.body.removeChild(overlay);
      if (typeof onClose === 'function') onClose();
    }

    return {
      overlay,
      panel,
      content,
      open: () => document.body.appendChild(overlay),
      close
    };
  }

  /* ------------------------------------------------------------------------
   UI: Crear plantilla (modal con formulario)
------------------------------------------------------------------------ */
  function openCreateTemplateModal(prefill = null) {
    const modal = createModal({ title: prefill ? 'Editar plantilla' : 'Crear plantilla' });

    const form = document.createElement('form');
    form.className = 'modal-form';

    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.placeholder = 'Título de la plantilla';
    inputTitle.required = true;
    inputTitle.value = prefill?.title ?? '';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Mensaje del recordatorio...';
    textarea.rows = 4;
    textarea.required = true;
    textarea.value = prefill?.message ?? '';

    const labelDate = document.createElement('label');
    labelDate.className = 'modal-label';
    labelDate.textContent = 'Fecha y hora (programado):';

    const datetime = document.createElement('input');
    datetime.type = 'datetime-local';
    datetime.required = true;

    if (prefill?.scheduledAt) {
      const d = new Date(prefill.scheduledAt);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      datetime.value = local;
    }

    const btns = document.createElement('div');
    btns.className = 'modal-buttons';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn-primary';
    saveBtn.textContent = prefill ? 'Guardar cambios' : 'Crear plantilla';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-secondary';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => modal.close());

    btns.append(cancelBtn, saveBtn);

    form.append(
      inputTitle,
      textarea,
      labelDate,
      datetime,
      btns
    );

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = inputTitle.value.trim();
      const message = textarea.value.trim();
      const schedVal = datetime.value;

      if (!title || !message || !schedVal) {
        alert('Completa todos los campos.');
        return;
      }

      const scheduledAt = new Date(schedVal).toISOString();
      const templates = loadTemplates();

      if (prefill) {
        const idx = templates.findIndex(t => t.id === prefill.id);
        if (idx !== -1) {
          templates[idx] = {
            ...templates[idx],
            title,
            message,
            scheduledAt,
            updatedAt: nowISO()
          };
        }
      } else {
        templates.push({
          id: uid(),
          title,
          message,
          scheduledAt,
          status: 'active',
          createdAt: nowISO(),
          updatedAt: nowISO(),
          sent: false
        });
      }

      saveTemplates(templates);
      modal.close();
      renderToast('Plantilla guardada');
      refreshModifyModalIfOpen();
    });

    modal.content.appendChild(form);
    modal.open();
  }


  /* ------------------------------------------------------------------------
     UI: Modificar plantillas (lista + acciones: editar, eliminar, pausar/reactivar, enviar ahora)
     ------------------------------------------------------------------------ */
  let modifyModalInstance = null; // guardamos referencia si está abierto

  function refreshModifyModalIfOpen() {
    if (modifyModalInstance && modifyModalInstance.renderBody) {
      modifyModalInstance.renderBody();
    }
  }

  function openModifyModal() {
    const modal = createModal({ title: 'Modificar plantillas', width: '800px', onClose: () => (modifyModalInstance = null) });
    modifyModalInstance = modal;

    function renderBody() {
      // limpia contenido
      modal.content.innerHTML = '';

      const templates = loadTemplates();

      const topActions = document.createElement('div');
      topActions.style = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;';
      const btnNew = document.createElement('button');
      btnNew.textContent = 'Crear nueva plantilla';
      btnNew.style = 'background:#1C2542;color:#fff;border:none;padding:8px 10px;border-radius:8px;cursor:pointer;';
      btnNew.addEventListener('click', () => openCreateTemplateModal());

      const stats = document.createElement('div');
      stats.style = 'font-size:13px;color:#555';
      stats.textContent = `Plantillas: ${templates.length}`;

      topActions.appendChild(btnNew);
      topActions.appendChild(stats);

      modal.content.appendChild(topActions);

      if (templates.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'No hay plantillas aún. Crea la primera.';
        empty.style = 'padding:20px;color:#666;';
        modal.content.appendChild(empty);
        return;
      }

      const list = document.createElement('div');
      list.style = 'display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow:auto;padding-right:6px;';

      templates
        .slice()
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .forEach((t) => {
          const item = document.createElement('div');
          item.style = 'display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #eee;border-radius:10px;background:#fafafa;';

          const left = document.createElement('div');
          left.style = 'flex:1;min-width:0;';

          const title = document.createElement('div');
          title.textContent = t.title;
          title.style = 'font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

          const meta = document.createElement('div');
          meta.style = 'font-size:13px;color:#666;margin-top:6px;';
          meta.innerHTML = `
            Programado: ${fmtDateTime(t.scheduledAt)} · Estado: <strong>${t.status}</strong> ${t.sent ? '· Enviado' : ''}
          `;

          const message = document.createElement('div');
          message.textContent = t.message;
          message.style = 'font-size:14px;color:#333;margin-top:8px;max-height:3.6em;overflow:hidden;text-overflow:ellipsis;';

          left.appendChild(title);
          left.appendChild(meta);
          left.appendChild(message);

          const actions = document.createElement('div');
          actions.style = 'display:flex;flex-direction:column;gap:8px;margin-left:12px;align-items:flex-end;';

          const btnEdit = document.createElement('button');
          btnEdit.textContent = 'Editar';
          btnEdit.style = 'background:#fff;border:1px solid #1C2542;color:#1C2542;padding:6px 8px;border-radius:8px;cursor:pointer;';
          btnEdit.addEventListener('click', () => openCreateTemplateModal(t));

          const btnToggle = document.createElement('button');
          btnToggle.textContent = t.status === 'active' ? 'Pausar' : 'Reactivar';
          btnToggle.style = `background:${t.status === 'active' ? '#FFB703' : '#34D399'};border:none;color:#fff;padding:6px 8px;border-radius:8px;cursor:pointer;`;
          btnToggle.addEventListener('click', () => {
            const templates = loadTemplates();
            const idx = templates.findIndex(x => x.id === t.id);
            if (idx === -1) return;
            templates[idx].status = templates[idx].status === 'active' ? 'paused' : 'active';
            templates[idx].updatedAt = nowISO();
            saveTemplates(templates);
            renderBody();
            renderToast(templates[idx].status === 'active' ? 'Recordatorio reactivado' : 'Recordatorio pausado');
          });

          const btnSendNow = document.createElement('button');
          btnSendNow.textContent = 'Enviar ahora';
          btnSendNow.style = 'background:#1C2542;color:#fff;border:none;padding:6px 8px;border-radius:8px;cursor:pointer;';
          btnSendNow.addEventListener('click', () => {
            sendTemplateNow(t.id);
            renderBody();
          });

          const btnDelete = document.createElement('button');
          btnDelete.textContent = 'Eliminar';
          btnDelete.style = 'background:#ef4444;color:#fff;border:none;padding:6px 8px;border-radius:8px;cursor:pointer;';
          btnDelete.addEventListener('click', () => {
            if (!confirm('Eliminar plantilla?')) return;
            const templates = loadTemplates().filter(x => x.id !== t.id);
            saveTemplates(templates);
            renderBody();
            renderToast('Plantilla eliminada');
          });

          actions.appendChild(btnEdit);
          actions.appendChild(btnToggle);
          actions.appendChild(btnSendNow);
          actions.appendChild(btnDelete);

          item.appendChild(left);
          item.appendChild(actions);
          list.appendChild(item);
        });

      modal.content.appendChild(list);
    }

    modal.renderBody = renderBody;
    renderBody();
    modal.open();
  }

  /* ------------------------------------------------------------------------
     ENVÍO (simulado) de plantillas
     - Cuando se "envía", registramos en historial con timestamp y plantillaId
     ------------------------------------------------------------------------ */
  function sendTemplateNow(templateId) {
    const templates = loadTemplates();
    const t = templates.find(x => x.id === templateId);
    if (!t) {
      renderToast('Plantilla no encontrada', true);
      return;
    }
    // if paused, block
    if (t.status === 'paused') {
      renderToast('No se puede enviar: plantilla pausada', true);
      return;
    }
    // mark as sent & save to history
    t.sent = true;
    t.updatedAt = nowISO();
    saveTemplates(templates);

    const sent = loadSent();
    sent.unshift({
      id: uid(),
      templateId: t.id,
      title: t.title,
      message: t.message,
      sentAt: nowISO()
    });
    saveSent(sent);
    renderToast('Recordatorio enviado (simulado)');
  }

  /* ------------------------------------------------------------------------
     Scheduler: revisa cada 5s por plantillas programadas y las "envía"
     ------------------------------------------------------------------------ */
  function schedulerTick() {
    const templates = loadTemplates();
    const now = new Date();
    let changed = false;
    templates.forEach((t) => {
      if (!t.sent && t.status === 'active') {
        const scheduled = new Date(t.scheduledAt);
        if (scheduled <= now) {
          // enviar
          t.sent = true;
          t.updatedAt = nowISO();
          const sent = loadSent();
          sent.unshift({
            id: uid(),
            templateId: t.id,
            title: t.title,
            message: t.message,
            sentAt: nowISO()
          });
          saveSent(sent);
          changed = true;
        }
      }
    });
    if (changed) saveTemplates(templates);
  }

  // arranca el scheduler
  setInterval(schedulerTick, 5000);
  // correr una vez al inicio para no esperar
  schedulerTick();

  /* ------------------------------------------------------------------------
     REPORT: Mostrar recordatorios enviados
     ------------------------------------------------------------------------ */
  function openReportModal() {
    const modal = createModal({ title: 'Reporte de recordatorios enviados', width: '800px' });

    const sent = loadSent();

    if (sent.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'Aún no se han enviado recordatorios.';
      empty.style = 'padding:20px;color:#666;';
      modal.content.appendChild(empty);
      modal.open();
      return;
    }

    const list = document.createElement('div');
    list.style = 'display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto;padding-right:6px;';

    sent.forEach((r) => {
      const row = document.createElement('div');
      row.style = 'display:flex;justify-content:space-between;align-items:flex-start;padding:10px;border-radius:8px;border:1px solid #eee;background:#fff;';

      const left = document.createElement('div');
      left.style = 'flex:1;min-width:0;';
      const title = document.createElement('div');
      title.textContent = r.title;
      title.style = 'font-weight:600';
      const msg = document.createElement('div');
      msg.textContent = r.message;
      msg.style = 'font-size:14px;color:#333;margin-top:6px;max-height:3.2em;overflow:hidden;text-overflow:ellipsis;';

      left.appendChild(title);
      left.appendChild(msg);

      const right = document.createElement('div');
      right.style = 'text-align:right;font-size:13px;color:#666';
      right.innerHTML = `${fmtDateTime(r.sentAt)}<br/><button style="margin-top:8px;padding:6px 8px;border-radius:8px;border:none;background:#1C2542;color:#fff;cursor:pointer;">Ver plantilla</button>`;

      // ver plantilla al click
      right.querySelector('button').addEventListener('click', () => {
        const templates = loadTemplates();
        const tpl = templates.find(t => t.id === r.templateId);
        if (tpl) {
          openQuickViewTemplate(tpl);
        } else {
          alert('Plantilla original no encontrada.');
        }
      });

      row.appendChild(left);
      row.appendChild(right);
      list.appendChild(row);
    });

    modal.content.appendChild(list);
    modal.open();
  }

  function openQuickViewTemplate(tpl) {
    const modal = createModal({ title: 'Plantilla (vista rápida)' });
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="font-weight:600;margin-bottom:8px;">${tpl.title}</div>
      <div style="color:#333;margin-bottom:8px;">${tpl.message}</div>
      <div style="font-size:13px;color:#666">Programado: ${fmtDateTime(tpl.scheduledAt)}</div>
      <div style="font-size:13px;color:#666">Estado: ${tpl.status} ${tpl.sent ? '· Enviado' : ''}</div>
    `;
    modal.content.appendChild(el);
    modal.open();
  }

  /* ------------------------------------------------------------------------
     Toast simple
     ------------------------------------------------------------------------ */
  function renderToast(text, isError = false) {
    const t = document.createElement('div');
    t.textContent = text;
    t.style = `
      position:fixed; right:20px; bottom:20px; background:${isError ? '#ef4444' : '#111827'};
      color:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,0.2);z-index:10000;font-family:Poppins;
    `;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      t.style.opacity = '0';
      t.style.transform = 'translateY(12px)';
    }, 1400);
    setTimeout(() => t.remove(), 1800);
  }

  /* ------------------------------------------------------------------------
     Conectar botones (los tres rectángulos)
     ------------------------------------------------------------------------ */
  const rects = document.querySelectorAll('.recordatorios-container .rectangulo');
  if (rects && rects.length >= 3) {
    // 0 -> Programar recordatorio (crear plantilla)
    rects[0].addEventListener('click', () => openCreateTemplateModal());

    // 1 -> Modificar recordatorio (abrir lista + acciones)
    rects[1].addEventListener('click', () => openModifyModal());

    // 2 -> Mostrar recordatorios enviados (reporte)
    rects[2].addEventListener('click', () => openReportModal());
  } else {
    console.warn('No se encontraron 3 rectángulos para enlazar acciones.');
  }

  /* ------------------------------------------------------------------------
     Inicialización mínima: crear arrays vacíos si no existen
     ------------------------------------------------------------------------ */
  if (!localStorage.getItem(STORAGE_TEMPLATES)) saveTemplates([]);
  if (!localStorage.getItem(STORAGE_SENT)) saveSent([]);

  /* ------------------------------------------------------------------------
     Exponer funciones en window para depuración / pruebas rápidas
     ------------------------------------------------------------------------ */
  window.__rs = {
    loadTemplates,
    loadSent,
    openCreateTemplateModal,
    openModifyModal,
    openReportModal,
    sendTemplateNow
  };
});
