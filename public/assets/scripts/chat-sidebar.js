document.addEventListener('DOMContentLoaded', () => {
  const chatList = document.getElementById('chatList');
  const searchInput = document.getElementById('searchChat');
  const chatTitle = document.getElementById('chatTitle');
  const chatArea = document.getElementById('chatArea');
  const sidebar = document.querySelector('.chat-sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');

  // Helper: scroll an element into view inside the chatArea, accounting for the chat container
  function scrollElementIntoViewInChat(el, center) {
    try {
      if (!el) return;
      const chatArea = document.getElementById('chatArea');
      if (!chatArea) { el.scrollIntoView({behavior:'smooth'}); return; }
      const chatRect = chatArea.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // current top of element relative to chatArea's content top
      const top = (elRect.top - chatRect.top) + chatArea.scrollTop;
      let desired;
      if (center) {
        desired = Math.max(0, top - (chatArea.clientHeight / 2) + (elRect.height / 2));
      } else {
        // small offset so the sticky banner doesn't hide under any padding
        desired = Math.max(0, top - 8);
      }
      chatArea.scrollTo({ top: desired, behavior: 'smooth' });
    } catch (err) {
      // fallback
      try { el.scrollIntoView({behavior:'smooth'}); } catch (e) { /* ignore */ }
    }
  }

  // Map chats and state
  let chats = [];
  const chatMap = {}; // id -> element
  const perChatMessages = {}; // id -> array of message objects
  const chatMeta = {}; // id -> {id,name,src,members}
  const unreadCounts = {}; // id -> number
  let currentChatId = null;
  const currentUser = 'Tú'; // display name used for votes (can be replaced by real user)

  // Predefined members for existing groups
  const allNeighbors = [
    { id: 'n1', name: 'Carlos López', avatar: 'C' },
    { id: 'n2', name: 'María García', avatar: 'M' },
    { id: 'n3', name: 'Juan Rodríguez', avatar: 'J' },
    { id: 'n4', name: 'Ana Martínez', avatar: 'A' },
    { id: 'n5', name: 'Pedro Sánchez', avatar: 'P' },
    { id: 'n6', name: 'Laura Fernández', avatar: 'L' }
  ];

  // Persistence helpers (save/load to localStorage)
  function saveState() {
    try {
      const payload = {
        perChatMessages,
        chatMeta,
        unreadCounts,
        currentChatId
      };
      localStorage.setItem('urban_chat_state_v1', JSON.stringify(payload));
    } catch (e) { console.warn('No se pudo guardar estado del chat', e); }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem('urban_chat_state_v1');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  // register a chat element (attach listeners and internal maps)
  function registerChatElement(chatEl) {
    const id = chatEl.dataset.id || chatEl.dataset.name || Math.random().toString(36).slice(2,8);
    chatEl.dataset.id = id;
    chats.push(chatEl);
    chatMap[id] = chatEl;
    perChatMessages[id] = perChatMessages[id] || [];
    unreadCounts[id] = unreadCounts[id] || 0;

    // click selects chat
    chatEl.addEventListener('click', () => {
      // avoid selecting the 'Nuevo +' wrapper
      if (chatEl.classList && chatEl.classList.contains('chat-nuevo-btn-wrapper')) return;
      chats.forEach(c => c.classList.remove('active'));
      chatEl.classList.add('active');
      setChatHeader(chatEl);
      const id = chatEl.dataset.id;
      currentChatId = id;
      renderMessagesForChat(id);
      clearUnread(id);
      // On small screens, hide the sidebar after selecting a chat to focus the chat view
      if (window.innerWidth <= 820 && sidebar) {
        sidebar.classList.add('minimized');
        const maximizeBtnLocal = document.querySelector('.sidebar-maximize');
        if (maximizeBtnLocal) maximizeBtnLocal.classList.remove('hidden');
      }
      saveState();
    });
    // click on image: open inline manager only for 'alamos', otherwise navigate to full gestion page
    const img = chatEl.querySelector('.chat-item-img');
    if (img) {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        // ONLY 'alamos' opens inline panel. All other groups (predefined or newly created) go to gestion_chat.html
        if (id === 'alamos') {
          const meta = chatMeta[id] || { id, name: chatEl.dataset.name || '', src: img.getAttribute('src') };
          openGroupManager(meta);
        } else {
          // All other chats (including newly created groups) navigate to full management page
          window.location.href = 'gestion_chat.html?chat=' + encodeURIComponent(id);
        }
      });
    }
  }

  // load persisted state (if any)
  const persisted = loadState();
  if (persisted && persisted.chatMeta) {
    // rebuild chat DOM from meta if needed
    Object.keys(persisted.chatMeta).forEach(id => {
      const meta = persisted.chatMeta[id];
      chatMeta[id] = meta;
      // try find existing DOM element with same id/name
      let el = document.querySelector(`.chat-item[data-id="${id}"]`);
      if (!el) {
        // create element
        el = document.createElement('div');
        el.className = 'chat-item';
        el.dataset.id = id;
        el.dataset.name = meta.name || '';
        el.innerHTML = `\n          <img src="${meta.src || 'assets/images/img_group.png'}" alt="${meta.name || ''}" class="chat-item-img" />\n          <div class="chat-item-info">\n            <span class="chat-item-name">${meta.name || ''}</span>\n            <span class="chat-item-time">Ahora</span>\n          </div>\n          <span class="chat-unread hidden">0</span>\n        `;
        // insert before Nuevo+ wrapper
        const wrapper = document.querySelector('.chat-nuevo-btn-wrapper');
        const chatListEl = document.getElementById('chatList');
        chatListEl.insertBefore(el, wrapper);
      }
      registerChatElement(el);
    });
    // restore messages and unread
    Object.keys(persisted.perChatMessages || {}).forEach(id => { perChatMessages[id] = persisted.perChatMessages[id] || []; });
    Object.keys(persisted.unreadCounts || {}).forEach(id => { unreadCounts[id] = persisted.unreadCounts[id] || 0; const el = chatMap[id]; if (el) updateBadge(el, unreadCounts[id]); });
    // set active chat
    if (persisted.currentChatId && chatMap[persisted.currentChatId]) {
      currentChatId = persisted.currentChatId;
      chatMap[currentChatId].classList.add('active');
      setChatHeader(chatMap[currentChatId]);
      renderMessagesForChat(currentChatId);
    }
  } else {
    // no persisted state - register existing DOM chats in the order they appear
    const initialDOMChats = Array.from(chatList.children).filter(c => !c.classList.contains('chat-nuevo-btn-wrapper'));
    initialDOMChats.forEach(chat => {
      registerChatElement(chat);
      const id = chat.dataset.id || chat.dataset.name || Math.random().toString(36).slice(2,8);
      const name = chat.dataset.name || '';
      const src = (chat.querySelector('.chat-item-img') || {}).src || 'assets/images/img_group.png';
      // Assign members to existing groups
      let members = [];
      if (id === 'alamos' || name.includes('Álamos')) {
        members = allNeighbors.slice(0, 4); // First 4 members for Álamos
      } else if (id === 'seguridad' || name.includes('Seguridad')) {
        members = allNeighbors.slice(2, 6); // Members 2-5 for Seguridad
      }
      chatMeta[id] = { id, name, src, members };
    });
    // set default active chat (first)
    if (chats.length > 0) {
      const first = chats[0];
      first.classList.add('active');
      currentChatId = first.dataset.id;
      setChatHeader(first);
      perChatMessages[currentChatId] = perChatMessages[currentChatId] || [];
      // presentation message (visible primero)
      perChatMessages[currentChatId].push({ from: 'Lucía', avatar: '👩‍🦰', presentation: true, text: 'Bienvenidos al chat oficial de Vecinos Los Álamos. Aquí compartimos avisos y noticias del barrio.', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
      perChatMessages[currentChatId].push({ from: 'Sistema', text: `@${currentUser} Bienvenido al chat. Esta es una prueba de mención.`, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
      renderMessagesForChat(currentChatId);
      saveState();
    }
  }

  // Filtrado en tiempo real
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    chats.forEach(chat => {
      chat.style.display = chat.dataset.name.toLowerCase().includes(query) ? 'block' : 'none';
    });
  });

  // Abrir nueva conversación al hacer click
  chats.forEach(chat => {
    chat.addEventListener('click', () => {
      // Quitar active de todos
      chats.forEach(c => c.classList.remove('active'));
      chat.classList.add('active');

  // Cambiar título del chat (imagen + nombre, centrado)
  setChatHeader(chat);

      // Mostrar mensajes guardados para este chat
      const id = chat.dataset.id;
      currentChatId = id;
      renderMessagesForChat(id);

      // Limpiar contador de no leídos
      clearUnread(id);
    });
  });

  // Minimizar / restaurar sidebar
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.add('minimized');
    const maximizeBtn = document.querySelector('.sidebar-maximize');
    if (maximizeBtn) {
      maximizeBtn.classList.remove('hidden');
    }
  });

  // Botón para maximizar sidebar
  const maximizeBtn = document.querySelector('.sidebar-maximize');
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      sidebar.classList.remove('minimized');
      maximizeBtn.classList.add('hidden');
    });
  }

  // Adjust the initial state based on window size and react to resize events
  function adjustSidebarForViewport() {
    const isMobile = window.innerWidth <= 820;
    if (isMobile) {
      sidebar.classList.add('minimized');
      const mBtn = document.querySelector('.sidebar-maximize');
      if (mBtn) mBtn.classList.remove('hidden');
    } else {
      sidebar.classList.remove('minimized');
      const mBtn = document.querySelector('.sidebar-maximize');
      if (mBtn) mBtn.classList.add('hidden');
    }
  }
  adjustSidebarForViewport();
  window.addEventListener('resize', adjustSidebarForViewport);

  // --------- helper functions for unread badges & messages ---------
  function updateBadge(chatEl, count) {
    let badge = chatEl.querySelector('.chat-unread');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'chat-unread';
      chatEl.appendChild(badge);
    }
    if (!count || count <= 0) {
      badge.classList.add('hidden');
      badge.textContent = '0';
    } else {
      badge.classList.remove('hidden');
      badge.textContent = String(count);
    }
  }

  function clearUnread(id) {
    unreadCounts[id] = 0;
    const el = chatMap[id];
    if (el) updateBadge(el, 0);
  }

  function incrementUnread(id, n = 1) {
    unreadCounts[id] = (unreadCounts[id] || 0) + n;
    const el = chatMap[id];
    if (el) updateBadge(el, unreadCounts[id]);
  }

  function renderMessagesForChat(id) {
    chatArea.innerHTML = '';
    const msgs = perChatMessages[id] || [];
    msgs.forEach(m => {
      const node = formatMessageNode(m);
      chatArea.appendChild(node);
    });
    // render pinned banner if any
    const pinned = msgs.find(x=>x.pinned);
    if (pinned) renderPinnedBanner(pinned); else {
      const pinnedArea = document.getElementById('pinnedArea'); if (pinnedArea) pinnedArea.innerHTML = '';
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    // persist after render
    saveState();
  }

  function formatMessageNode(m) {
    // ensure stable id for message
    if (!m._id) m._id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    const msg = document.createElement('div');
    msg.className = 'msg ' + (m.from === 'Tú' || m.self ? 'msg-self' : 'msg-other');
    msg.dataset.msgId = m._id;
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = m.avatar || (m.self ? '🧍‍♂️' : '👤');
    const body = document.createElement('div');
    body.className = 'msg-body';
    // container for actions
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'msg-actions';
    msg.appendChild(actionsWrap);
    if (m.type === 'poll') {
      const pollWrap = document.createElement('div');
      pollWrap.className = 'chat-poll';
      pollWrap.innerHTML = `<strong>${escapeHtml(m.question)}</strong>`;
      
      // Calculate total votes
      const totalVotes = m.options.reduce((sum, opt) => sum + opt.voters.length, 0);
      
      m.options.forEach((opt, idx) => {
        const optNode = document.createElement('div');
        optNode.className = 'poll-option';
        optNode.dataset.pollId = m.pollId;
        optNode.dataset.optIndex = idx;
        
        // Calculate percentage for this option
        const percentage = totalVotes > 0 ? (opt.voters.length / totalVotes) * 100 : 0;
        
        // Left: checkbox + label
        const left = document.createElement('div');
        left.className = 'poll-option-left';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'poll-checkbox';
        checkbox.dataset.pollId = m.pollId;
        checkbox.dataset.optIndex = idx;
        // Check if current user has voted for this option
        const hasVoted = opt.voters.includes(currentUser);
        checkbox.checked = hasVoted;
        checkbox.addEventListener('change', (ev) => {
          window.voteOnPoll(m.pollId, idx, ev.currentTarget);
        });
        
        const label = document.createElement('label');
        label.className = 'poll-option-label';
        label.textContent = opt.text;
        
        left.appendChild(checkbox);
        left.appendChild(label);
        
        // Right: vote count
        const right = document.createElement('div');
        right.className = 'poll-option-right';
        
        const countBtn = document.createElement('button');
        countBtn.className = 'vote-count-btn';
        countBtn.textContent = `${opt.voters.length}`;
        countBtn.dataset.pollId = m.pollId;
        countBtn.dataset.optIndex = idx;
        countBtn.addEventListener('click', (ev) => { showVotersModal(m.pollId, idx); });
        
        right.appendChild(countBtn);
        
        // Progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'poll-progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'poll-progress-bar';
        progressBar.style.width = percentage + '%';
        
        progressContainer.appendChild(progressBar);
        
        optNode.appendChild(left);
        optNode.appendChild(right);
        optNode.appendChild(progressContainer);
        pollWrap.appendChild(optNode);
      });
      body.appendChild(pollWrap);
    } else if (m.type === 'event') {
      const card = document.createElement('div');
      card.className = 'chat-event-card';

      const media = document.createElement('div');
      media.className = 'chat-event-media';
      if (m.image) {
        const img = document.createElement('img');
        img.src = m.image;
        img.alt = m.title || 'Evento';
        media.appendChild(img);
      } else {
        media.innerHTML = '<span style="font-size:42px;opacity:0.4;">📅</span>';
      }

      const details = document.createElement('div');
      const title = document.createElement('h4');
      title.className = 'chat-event-title';
      title.textContent = m.title || 'Evento';
      details.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'chat-event-meta';
      meta.innerHTML = `
        <div>
          <strong>Fecha</strong>
          <span>${escapeHtml(m.date || '-')}</span>
        </div>
        <div>
          <strong>Hora</strong>
          <span>${escapeHtml(m.timeText || m.time || '-')}</span>
        </div>
        <div>
          <strong>Lugar</strong>
          <span>${escapeHtml(m.location || 'Por confirmar')}</span>
        </div>
        <div>
          <strong>Recordatorio</strong>
          <span>${m.reminderEnabled === false ? 'Desactivado' : 'Activo'}</span>
        </div>
      `;
      details.appendChild(meta);

      if (m.description) {
        const desc = document.createElement('div');
        desc.className = 'chat-event-description';
        desc.textContent = m.description;
        details.appendChild(desc);
      }

      const actions = document.createElement('div');
      actions.className = 'chat-event-actions';
      const reminder = document.createElement('div');
      reminder.className = 'chat-event-reminder';
      reminder.innerHTML = `<span>🔔</span> ${m.reminderEnabled === false ? 'Recordatorio apagado' : 'Recordatorio activo'}`;
      actions.appendChild(reminder);

      const yesPill = document.createElement('div');
      yesPill.className = 'chat-event-pill';
      yesPill.textContent = `Sí puedo ${m.attendingYes ?? 12}`;
      const noPill = document.createElement('div');
      noPill.className = 'chat-event-pill';
      noPill.textContent = `No puedo ${m.attendingNo ?? 3}`;
      actions.appendChild(yesPill);
      actions.appendChild(noPill);

      details.appendChild(actions);

      card.appendChild(media);
      card.appendChild(details);
      body.appendChild(card);
    } else if (m.type === 'image') {
      const text = document.createElement('div');
      text.className = 'msg-text';
      text.innerHTML = `<img src="${m.src}" alt="Imagen" style="max-width:200px;border-radius:8px;" />`;
      body.appendChild(text);
    } else {
      const text = document.createElement('div');
      text.className = 'msg-text';
      // Safely escape HTML and then highlight the current user's mention (e.g. @Tú) in bold
      const raw = m.text || '';
      const escaped = escapeHtml(raw);
      const mentionPlain = '@' + currentUser;
      // escape the mention text for RegExp safety
      const escMention = escapeHtml(mentionPlain).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const withBold = escaped.replace(new RegExp(escMention, 'g'), `<strong>${escapeHtml(mentionPlain)}</strong>`);
      text.innerHTML = withBold;
      body.appendChild(text);
    }
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.textContent = `${m.from} · ${m.time || ''}`;
    body.appendChild(meta);
    msg.appendChild(avatar);
    msg.appendChild(body);

    // reactions area node
    const reactionsNode = document.createElement('div');
    reactionsNode.className = 'reactions';
    msg.appendChild(reactionsNode);

    // apply pinned style
    if (m.pinned) {
      msg.classList.add('pinned-msg');
    }

    // presentation special visual (used for the initial welcome message)
    if (m.presentation) {
      msg.classList.add('presentation');
    }

    // If this message is pinned, show a pin icon next to the message itself
    if (m.pinned) {
      try {
        const msgPin = document.createElement('img');
        msgPin.src = 'assets/images/Anclar_li.png';
        msgPin.alt = 'Anclado';
        msgPin.className = 'pinned-pin-icon-msg';
        // ensure it doesn't intercept clicks on the message body
        msgPin.setAttribute('aria-hidden', 'true');
        msg.appendChild(msgPin);
      } catch (e) { /* if asset missing, ignore */ }
    }

    // highlight for mentions (@currentUser)
    if (m.text && m.text.includes('@' + currentUser)) {
      msg.classList.add('mention-highlight');
    }

    // Truncate long text messages visually and add title with full text
    try {
      if (m.text && m.text.length > 240) {
        const textEl = body.querySelector('.msg-text');
        if (textEl) {
          textEl.classList.add('truncate');
          textEl.setAttribute('title', m.text);
        }
      }
    } catch (e) { /* ignore */ }

    // add click handler on the message BODY only (not the whole vertical msg container)
  body.addEventListener('click', (ev) => {
      ev.stopPropagation();
      // remove existing dropdowns
      document.querySelectorAll('.msg-dropdown').forEach(d=>d.remove());
      const dropdown = document.createElement('div');
      dropdown.className = 'msg-dropdown';
      // pin button
      const pinBtn = document.createElement('button');
  const pinImg = document.createElement('img'); pinImg.src = 'assets/images/Anclarrrr.png'; pinImg.alt='Anclar'; pinBtn.appendChild(pinImg);
      pinBtn.addEventListener('click', (e)=>{ e.stopPropagation(); pinMessage(m); dropdown.remove();
        // after pinning, ensure banner is visible (scroll inside chat area with an offset so it's not hidden)
        setTimeout(()=>{
          const banner = document.querySelector('.pinned-banner'); if (banner) scrollElementIntoViewInChat(banner, false);
        }, 80);
      });
      // like button
      const likeBtn = document.createElement('button');
  const likeImg = document.createElement('img'); likeImg.src = 'assets/images/Like_N.png'; likeImg.alt='Like'; likeBtn.appendChild(likeImg);
      likeBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleLike(m, reactionsNode); dropdown.remove(); });
      // emoji button
      const emojiBtn = document.createElement('button');
  const emojiImg = document.createElement('img'); emojiImg.src = 'assets/images/Emoji_N.png'; emojiImg.alt='Emoji'; emojiBtn.appendChild(emojiImg);
      emojiBtn.addEventListener('click', (e)=>{ e.stopPropagation(); openEmojiPicker(m, reactionsNode); dropdown.remove(); });
      dropdown.appendChild(pinBtn);
      dropdown.appendChild(likeBtn);
      dropdown.appendChild(emojiBtn);
      actionsWrap.appendChild(dropdown);

      // After appended, compute positioning and keep dropdown inside chatArea
      const chatRect = chatArea.getBoundingClientRect();
      const msgRect = msg.getBoundingClientRect();
      const ddRect = dropdown.getBoundingClientRect();
      // align dropdown so it doesn't overflow right edge
      if (ddRect.right > chatRect.right - 8) {
        dropdown.style.left = 'auto';
        dropdown.style.right = '0px';
      } else {
        // default align to left of the msg body
        dropdown.style.left = '0px';
        dropdown.style.right = 'auto';
      }
      // if still overflows left, nudge it
      if (ddRect.left < chatRect.left + 8) {
        dropdown.style.left = '8px';
        dropdown.style.right = 'auto';
      }
    });

    // click outside removes dropdowns
    document.addEventListener('click', ()=>{ document.querySelectorAll('.msg-dropdown').forEach(d=>d.remove()); });
    return msg;
  }

  // pin message: mark as pinned and move to pinnedArea
  function pinMessage(m) {
    const msgs = perChatMessages[currentChatId] || [];
    if (m.pinned) {
      // if already pinned, unpin it
      m.pinned = false;
      renderMessagesForChat(currentChatId);
      const pinnedArea = document.getElementById('pinnedArea'); if (pinnedArea) pinnedArea.innerHTML = '';
      return;
    }
    // Unpin others and pin this one
    msgs.forEach(mm => { if (mm !== m) mm.pinned = false; });
    m.pinned = true;
    renderMessagesForChat(currentChatId);
    renderPinnedBanner(m);
    // ensure banner is visible (give browser a tick to render) - scroll inside chat container
    setTimeout(()=>{ const banner = document.querySelector('.pinned-banner'); if (banner) scrollElementIntoViewInChat(banner, false); }, 80);
  }

  function groupMetaForId(id) { return chatMeta[id]; }

  // inline group manager panel
  function openGroupManager(meta) {
    if (!meta) return;
    // create or show panel on the right side near header
    let panel = document.getElementById('groupManagePanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'groupManagePanel';
      panel.style.position = 'absolute';
      panel.style.right = '20px';
      panel.style.top = '80px';
      panel.style.zIndex = '2000';
      panel.style.background = '#fff';
      panel.style.borderRadius = '10px';
      panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
      panel.style.padding = '12px';
      panel.style.width = '320px';
  panel.innerHTML = `\n+        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">\n+          <div style=\"display:flex;align-items:center;gap:8px;\">\n+            <img src=\"${meta.src || meta.image || 'assets/images/img_group.png'}\" style=\"width:52px;height:52px;border-radius:50%;object-fit:cover;\" />\n+            <div>\n+              <div style=\"font-weight:700;\">${escapeHtml(meta.name || '')}</div>\n+              <div style=\"font-size:12px;color:#666;\">Gestionar grupo</div>\n+            </div>\n+          </div>\n+          <button id=\"closeGroupManage\" style=\"background:transparent;border:none;font-size:18px;cursor:pointer;\">✕</button>\n+        </div>\n+        <div id=\"groupManageBody\">\n+          <button id=\"goToFullManage\" style=\"width:100%;padding:10px;border-radius:8px;border:none;background:#1C2542;color:#fff;cursor:pointer;\">Abrir panel completo</button>\n+          <div id=\"groupManageMembers\" style=\"margin-top:10px;font-size:13px;color:#333;\"></div>\n+        </div>\n+      `;
      document.body.appendChild(panel);
      document.getElementById('closeGroupManage').addEventListener('click', () => panel.remove());
      document.getElementById('goToFullManage').addEventListener('click', () => { window.location.href = 'gestion_chat.html?group=' + encodeURIComponent(meta.id || meta.name); });
    } else {
      // update content
      panel.querySelector('img').src = meta.src || meta.image || 'assets/images/img_group.png';
      panel.querySelector('div[style*="font-weight:700"]').textContent = meta.name || '';
      panel.style.display = 'block';
    }
    // populate members if available
    const membersEl = panel.querySelector('#groupManageMembers');
    if (membersEl) {
      const members = (meta && meta.members) || (chatMeta[meta.id] && chatMeta[meta.id].members) || [];
      if (members && members.length > 0) {
        membersEl.innerHTML = '';
        members.forEach(m => {
          const node = document.createElement('div');
          node.style.display = 'flex'; node.style.alignItems = 'center'; node.style.gap='8px'; node.style.marginBottom='6px';
          const av = document.createElement('div'); av.textContent = m.avatar || (m.name?m.name[0]:'?'); av.style.width='32px'; av.style.height='32px'; av.style.display='flex'; av.style.alignItems='center'; av.style.justifyContent='center'; av.style.borderRadius='50%'; av.style.background='#f0f2f5';
          const nm = document.createElement('div'); nm.textContent = m.name || m.id;
          node.appendChild(av); node.appendChild(nm);
          membersEl.appendChild(node);
        });
      } else {
        membersEl.innerHTML = '<div style="color:#666;">Sin miembros visibles</div>';
      }
    }
  }

  function renderPinnedBanner(m) {
    const pinnedArea = document.getElementById('pinnedArea');
    pinnedArea.innerHTML = '';
    const banner = document.createElement('div');
    banner.className = 'pinned-banner';
    const avatar = document.createElement('div'); avatar.className='pinned-avatar'; avatar.textContent = m.avatar || (m.self ? '🧍‍♂️' : '👤');
    const preview = document.createElement('div'); preview.className='pinned-preview';
    // show small preview: name and truncated text
    const who = document.createElement('div'); who.style.fontWeight = '600'; who.style.marginRight='8px'; who.textContent = m.from;
    const txt = document.createElement('div'); txt.style.opacity = '0.95'; txt.textContent = m.type === 'poll' ? '[Encuesta] ' + m.question : (m.text || (m.type==='image'?'[Imagen]':''));
    preview.appendChild(who);
    preview.appendChild(txt);
    banner.appendChild(avatar);
    banner.appendChild(preview);
    // click banner scrolls to message (scroll inside chat area so fixed header / surrounding layout doesn't hide it)
    banner.addEventListener('click', () => {
      const target = document.querySelector(`[data-msg-id="${m._id}"]`);
      if (target) scrollElementIntoViewInChat(target, true);
    });
    pinnedArea.appendChild(banner);
  }

  // toggle like for currentUser
  function toggleLike(m, reactionsNode) {
    m.likes = m.likes || [];
    const idx = m.likes.indexOf(currentUser);
    if (idx === -1) m.likes.push(currentUser); else m.likes.splice(idx,1);
    renderReactions(m, reactionsNode);
    saveState();
  }

  function renderReactions(m, reactionsNode) {
    reactionsNode.innerHTML = '';
    if (m.likes && m.likes.length > 0) {
      const r = document.createElement('div'); r.className='reaction'; r.innerHTML = `👍 <span class="count">${m.likes.length}</span>`; reactionsNode.appendChild(r);
    }
    if (m.reactions) {
      Object.keys(m.reactions).forEach(emoji => {
        const cnt = m.reactions[emoji].length;
        const r = document.createElement('div'); r.className='reaction'; r.textContent = emoji + ' ' + cnt; reactionsNode.appendChild(r);
      });
    }
  }

  // open emoji picker and bind selection to message
  function openEmojiPicker(m, reactionsNode) {
    const modal = document.getElementById('emojiPickerModal');
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = '';
    const emojis = ['👍','❤️','😂','😮','😢','👏','🎉','🤔','😆','😅','🙌','😎','🔥','👀','😄','🙏'];
    emojis.forEach(emj => {
      const btn = document.createElement('button'); btn.textContent = emj;
      btn.addEventListener('click', ()=>{
        m.reactions = m.reactions || {};
        m.reactions[emj] = m.reactions[emj] || [];
        if (!m.reactions[emj].includes(currentUser)) m.reactions[emj].push(currentUser);
        renderReactions(m, reactionsNode);
        modal.classList.add('hidden');
        saveState();
      });
      grid.appendChild(btn);
    });
    modal.classList.remove('hidden');
  }

  function escapeHtml(s) { return String(s).replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); }

  // expose API to global for other scripts
  window.chatAPI = {
    addChat: window.chatAPI?.addChat || function(group) {
      if (!group || !group.id) return;
      // avoid duplicate
      if (chatMap[group.id]) return;
      const chatListEl = document.getElementById('chatList');
      const groupItem = document.createElement('div');
      groupItem.className = 'chat-item';
      groupItem.dataset.id = group.id;
      groupItem.dataset.name = group.name;
      groupItem.innerHTML = `\n      <img src="${group.image || group.src || 'assets/images/img_group.png'}" alt="${group.name}" class="chat-item-img group-image" data-group-id="${group.id}" />\n      <div class="chat-item-info">\n        <span class="chat-item-name">${group.name}</span>\n        <span class="chat-item-time">Ahora</span>\n      </div>\n      <span class="chat-unread hidden">0</span>\n    `;
      // insert before Nuevo+ wrapper
      const wrapper = document.querySelector('.chat-nuevo-btn-wrapper');
      chatListEl.insertBefore(groupItem, wrapper);
      // store meta with members if available
      chatMeta[group.id] = { id: group.id, name: group.name, src: group.image || group.src || 'assets/images/img_group.png', members: group.members || [] };
      registerChatElement(groupItem);
      // click on image: open inline manager only for 'alamos', otherwise navigate to full gestion page
      const img = groupItem.querySelector('.group-image');
      if (img) img.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = group.id;
        // ONLY 'alamos' opens inline panel. All newly created groups go to gestion_chat.html
        if (id === 'alamos') {
          const meta = groupMetaForId(id) || group;
          openGroupManager(meta);
        } else {
          // All other groups (including newly created) navigate to full management page
          window.location.href = 'gestion_chat.html?chat=' + encodeURIComponent(id);
        }
      });
      saveState();
      return groupItem;
    },
    
    getGroupMembers: function(groupIdOrName) {
      // Search by id or name in chatMeta
      let meta = null;
      if (chatMeta[groupIdOrName]) {
        meta = chatMeta[groupIdOrName];
      } else {
        // Search by name
        meta = Object.values(chatMeta).find(m => m && (m.id === groupIdOrName || m.name === groupIdOrName));
      }
      return (meta && meta.members) || [];
    },

    sendMessageToChat: function(chatId, text) {
      const m = {from: 'Tú', text, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), self:true, type:'text'};
      perChatMessages[chatId] = perChatMessages[chatId] || [];
      perChatMessages[chatId].push(m);
      if (currentChatId === chatId) {
        chatArea.appendChild(formatMessageNode(m));
        chatArea.scrollTop = chatArea.scrollHeight;
      } else {
        incrementUnread(chatId, 1);
      }
      
      // persist
      saveState();

      // simulated reply after short delay
      setTimeout(() => {
        window.chatAPI.receiveIncoming(chatId, {from: 'Sistema', text: 'Gracias por el aviso — lo revisamos.', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), type:'text'});
      }, 900);
    },

    receiveIncoming: function(chatId, msg) {
      const m = {from: msg.from || 'Anon', text: msg.text || '', time: msg.time || new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), type: msg.type || 'text'};
      perChatMessages[chatId] = perChatMessages[chatId] || [];
      perChatMessages[chatId].push(m);
      if (currentChatId === chatId) {
        chatArea.appendChild(formatMessageNode(m));
        chatArea.scrollTop = chatArea.scrollHeight;
      } else {
        incrementUnread(chatId, 1);
      }
      saveState();
    },

    createPollInChat: function(chatId, pollObj) {
      // pollObj: {pollId, question, options: [{text, voters:[]}]}
      const m = {from: pollObj.author || 'Tú', type:'poll', question: pollObj.question, options: pollObj.options, pollId: pollObj.pollId, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})};
      perChatMessages[chatId] = perChatMessages[chatId] || [];
      perChatMessages[chatId].push(m);
      if (currentChatId === chatId) {
        chatArea.appendChild(formatMessageNode(m));
        chatArea.scrollTop = chatArea.scrollHeight;
      } else {
        incrementUnread(chatId, 1);
      }
      saveState();
    },

    sendImageInChat: function(chatId, src) {
      const m = {from: 'Tú', type: 'image', src: src, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), self:true};
      perChatMessages[chatId] = perChatMessages[chatId] || [];
      perChatMessages[chatId].push(m);
      if (currentChatId === chatId) {
        chatArea.appendChild(formatMessageNode(m));
        chatArea.scrollTop = chatArea.scrollHeight;
      } else {
        incrementUnread(chatId, 1);
      }
      saveState();
    },

    createEventInChat: function(chatId, payload) {
      const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      const m = {
        from: 'Tǧ',
        type: 'event',
        title: payload.title,
        date: payload.date,
        time: payload.time,
        timeText: payload.time,
        location: payload.location,
        description: payload.description,
        image: payload.image || null,
        attachmentName: payload.attachmentName || null,
        reminderEnabled: payload.reminderEnabled !== undefined ? payload.reminderEnabled : true,
        attendingYes: payload.attendingYes ?? 12,
        attendingNo: payload.attendingNo ?? 3,
        self: true,
        createdAt: payload.createdAt || new Date().toISOString()
      };
      m.time = now;
      perChatMessages[chatId] = perChatMessages[chatId] || [];
      perChatMessages[chatId].push(m);
      if (currentChatId === chatId) {
        chatArea.appendChild(formatMessageNode(m));
        chatArea.scrollTop = chatArea.scrollHeight;
      } else {
        incrementUnread(chatId, 1);
      }
      saveState();
    },

    pinMessageInChat: function(chatId, messageIndex) {
      const msgs = perChatMessages[chatId] || [];
      const m = msgs[messageIndex];
      if (!m) return;
      if (m.pinned) {
        m.pinned = false;
        renderMessagesForChat(chatId);
        const pinnedArea = document.getElementById('pinnedArea'); if (pinnedArea) pinnedArea.innerHTML = '';
        return;
      }
      msgs.forEach(mm => { if (mm !== m) mm.pinned = false; });
      m.pinned = true;
      renderMessagesForChat(chatId);
      renderPinnedBanner(m);
      saveState();
    },

    clearUnread: clearUnread,
    incrementUnread: incrementUnread,
    getCurrentChatId: function(){ return currentChatId; }
  };

  // Voting helper (simple implementation)
  window.voteOnPoll = function(pollId, optionIndex, btnEl) {
    // find poll in perChatMessages for currentChatId
    const msgs = perChatMessages[currentChatId] || [];
    const p = msgs.slice().reverse().find(m => m.type === 'poll' && m.pollId === pollId);
    if (!p) return;
    // For demo, username is 'Tú'
    const user = 'Tú';
    // remove user from other options
    p.options.forEach(opt => {
      const i = opt.voters.indexOf(user);
      if (i !== -1) opt.voters.splice(i,1);
    });
    const opt = p.options[optionIndex];
    if (!opt.voters.includes(user)) opt.voters.push(user);
    // re-render messages for current chat
    renderMessagesForChat(currentChatId);
  saveState();
    // update pinned banner if needed
    const pinnedArea = document.getElementById('pinnedArea');
    if (pinnedArea) {
      const msgsAll = perChatMessages[currentChatId] || [];
      const pm = msgsAll.find(x=>x.pinned);
      if (pm) renderPinnedBanner(pm); else pinnedArea.innerHTML = '';
    }
  };

  // doble click en contador para ver votantes
  document.addEventListener('dblclick', (e) => {
    const el = e.target;
    // allow dblclick either on the vote button or on the whole poll-option
    let target = el;
    if (target.classList && target.classList.contains('vote-btn')) {
      // clicked directly on button
    } else {
      // check if inside poll-option
      const opt = el.closest && el.closest('.poll-option');
      if (opt) target = opt.querySelector('.vote-btn') || opt;
    }
    if (!target || !target.dataset) return;
    const pollId = target.dataset.pollId;
    const optIndex = Number(target.dataset.optIndex);
    const msgs = perChatMessages[currentChatId] || [];
    const p = msgs.slice().reverse().find(m => m.type === 'poll' && m.pollId === pollId);
    if (!p) return;
    const voters = (p.options[optIndex] && p.options[optIndex].voters) || [];
    // show voters modal instead of alert
    showVotersModal(pollId, optIndex);
  });

  // Voters modal functions
  function showVotersModal(pollId, optIndex) {
    const modal = document.getElementById('votersModal');
    const listEl = document.getElementById('votersList');
    const title = document.getElementById('votersModalTitle');
    listEl.innerHTML = '';
    const msgs = perChatMessages[currentChatId] || [];
    const p = msgs.slice().reverse().find(m => m.type === 'poll' && m.pollId === pollId);
    if (!p) return;
    const opt = p.options[optIndex];
    title.textContent = `Votantes — "${opt.text}"`;
    if (!opt.voters || opt.voters.length === 0) {
      const none = document.createElement('div');
      none.textContent = 'Todavía no hay votos para esta opción.';
      listEl.appendChild(none);
    } else {
      opt.voters.forEach(v => {
        const item = document.createElement('div');
        item.className = 'voter-item' + (v === currentUser ? ' me' : '');
        // optionally show an avatar emoji for the voter
        const avatar = document.createElement('div');
        avatar.textContent = v === currentUser ? '🧍‍♂️' : '👤';
        avatar.style.width = '32px';
        avatar.style.height = '32px';
        avatar.style.display = 'flex';
        avatar.style.alignItems = 'center';
        avatar.style.justifyContent = 'center';
        avatar.style.borderRadius = '50%';
        avatar.style.background = '#f0f2f5';
        const name = document.createElement('div');
        name.textContent = v;
        item.appendChild(avatar);
        item.appendChild(name);
        listEl.appendChild(item);
      });
    }
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
  }

  function hideVotersModal() {
    const modal = document.getElementById('votersModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
  }

  // close button and outside click
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('votersModal');
    if (!modal) return;
    const closeBtn = document.getElementById('votersModalClose');
    if (e.target === closeBtn) hideVotersModal();
    // click outside inner should close
    if (e.target === modal) hideVotersModal();
  });

  // emoji picker close handlers
  document.addEventListener('click', (e) => {
    const em = document.getElementById('emojiPickerModal');
    if (!em) return;
    const closeBtn = document.getElementById('emojiPickerClose');
    if (e.target === closeBtn) em.classList.add('hidden');
    if (e.target === em) em.classList.add('hidden');
  });

  // helper: set chat header with image + name centered
  function setChatHeader(chatEl) {
    const name = chatEl.dataset.name || '';
    const imgEl = chatEl.querySelector('.chat-item-img');
    const imgSrc = imgEl ? imgEl.getAttribute('src') : 'assets/images/img_group.png';
    // build header inner HTML (image left of text, but centered overall)
    chatTitle.innerHTML = `<span style="display:inline-flex;align-items:center;gap:10px;"><img src="${imgSrc}" alt="" class="group-icon-chat" style="width:40px;height:40px;border-radius:50%;"/><span>${escapeHtml(name)}</span></span>`;
  }

  // Navigate to group management when clicking the group icon/title for group chats
  // Currently only 'alamos' is considered a multi-person group in this demo
  const chatTitleWrap = document.getElementById('chatTitle');
  if (chatTitleWrap) {
    chatTitleWrap.addEventListener('click', () => {
      if (!currentChatId) return;
      // navigate to full management page for the currently selected chat
      window.location.href = 'gestion_chat.html?chat=' + encodeURIComponent(currentChatId);
    });
  }

});
