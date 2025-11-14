document.addEventListener('DOMContentLoaded', () => {
  // ========== Estado global ==========
  const state = {
    selectedNeighbors: [],
    selectedGroup: null,
    excludedUsers: [],
    groupData: {},
    notificationData: {}
  };

  // ========== Referencias del DOM ==========
  const chatNuevoBtn = document.getElementById('chatNuevoBtn');
  const chatNuevoDropdown = document.getElementById('chatNuevoDropdown');
  const chatNuevoGrupoBtn = document.getElementById('chatNuevoGrupoBtn');
  const chatNotificacionBtn = document.getElementById('chatNotificacionBtn');

  // Modales
  const selectNeighborsModal = document.getElementById('selectNeighborsModal');
  const createGroupModal = document.getElementById('createGroupModal');
  const groupCreatedModal = document.getElementById('groupCreatedModal');
  const selectGroupForNotifModal = document.getElementById('selectGroupForNotifModal');
  const composeNotificationModal = document.getElementById('composeNotificationModal');
  const selectExcludedUsersModal = document.getElementById('selectExcludedUsersModal');
  const filterByLocationModal = document.getElementById('filterByLocationModal');
  const confirmSendModal = document.getElementById('confirmSendModal');
  const notificationSentModal = document.getElementById('notificationSentModal');

  // Vecinos simulados (reemplazar con datos reales)
  const allNeighbors = [
    { id: 'n1', name: 'Carlos López', avatar: 'C' },
    { id: 'n2', name: 'María García', avatar: 'M' },
    { id: 'n3', name: 'Juan Rodríguez', avatar: 'J' },
    { id: 'n4', name: 'Ana Martínez', avatar: 'A' },
    { id: 'n5', name: 'Pedro Sánchez', avatar: 'P' },
    { id: 'n6', name: 'Laura Fernández', avatar: 'L' }
  ];

  // Grupos simulados
  let allGroups = [
    { id: 'g1', name: 'Vecinos Los Álamos', image: 'assets/images/Logo_Alamos.png' },
    { id: 'g2', name: 'Seguridad', image: 'assets/images/seguridad.png' }
  ];

  // ========== Funciones auxiliares ==========
  function openModal(modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function showToast(duration = 2000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  // ========== BOTÓN "Nuevo +" ==========
  chatNuevoBtn.addEventListener('click', () => {
    chatNuevoDropdown.classList.toggle('hidden');
  });

  // Cerrar dropdown si hago clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.chat-nuevo-btn-wrapper')) {
      chatNuevoDropdown.classList.add('hidden');
    }
  });

  // ========== FLUJO: NUEVO GRUPO ==========
  chatNuevoGrupoBtn.addEventListener('click', () => {
    state.selectedNeighbors = [];
    chatNuevoDropdown.classList.add('hidden');
    renderNeighborsList();
    openModal(selectNeighborsModal);
  });

  function renderNeighborsList() {
    const list = document.getElementById('neighborsList');
    list.innerHTML = '';
    allNeighbors.forEach(neighbor => {
      const item = document.createElement('div');
      item.className = 'neighbor-item';
      item.innerHTML = `
        <input type="checkbox" value="${neighbor.id}" />
        <span>${neighbor.name}</span>
      `;
      item.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!state.selectedNeighbors.find(n => n.id === neighbor.id)) {
            state.selectedNeighbors.push(neighbor);
          }
        } else {
          state.selectedNeighbors = state.selectedNeighbors.filter(n => n.id !== neighbor.id);
        }
        updateSelectedNeighborsDisplay();
      });
      list.appendChild(item);
    });
  }

  function updateSelectedNeighborsDisplay() {
    const display = document.getElementById('selectedNeighborsDisplay');
    display.innerHTML = '';
    state.selectedNeighbors.forEach(neighbor => {
      const badge = document.createElement('div');
      badge.className = 'avatar-badge';
      badge.innerHTML = `
        ${neighbor.avatar}
        <button class="remove-btn" data-id="${neighbor.id}">✕</button>
      `;
      badge.querySelector('.remove-btn').addEventListener('click', () => {
        state.selectedNeighbors = state.selectedNeighbors.filter(n => n.id !== neighbor.id);
        updateSelectedNeighborsDisplay();
        // actualizar checkbox
        document.querySelector(`input[value="${neighbor.id}"]`).checked = false;
      });
      display.appendChild(badge);
    });
  }

  // Búsqueda de vecinos
  const neighborsSearchInput = document.getElementById('neighborsSearchInput');
  neighborsSearchInput.addEventListener('input', () => {
    const query = neighborsSearchInput.value.toLowerCase();
    const items = document.querySelectorAll('.neighbor-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? 'flex' : 'none';
    });
  });

  // Botón "Siguiente" (Enviar_Mensaje.png)
  const nextToGroupDetailsBtn = document.getElementById('nextToGroupDetailsBtn');
  nextToGroupDetailsBtn.addEventListener('click', () => {
    if (state.selectedNeighbors.length < 2) {
      alert('Selecciona al menos 2 vecinos');
      return;
    }
    closeModal(selectNeighborsModal);
    renderGroupDetailsModal();
    openModal(createGroupModal);
  });

  function renderGroupDetailsModal() {
    const preview = document.getElementById('groupMembersPreview');
    preview.innerHTML = '';
    state.selectedNeighbors.forEach(neighbor => {
      const badge = document.createElement('div');
      badge.className = 'avatar-badge';
      badge.textContent = neighbor.avatar;
      preview.appendChild(badge);
    });
  }

  // Imagen del grupo
  const groupImageInput = document.getElementById('groupImageInput');
  const groupImagePreview = document.getElementById('groupImagePreview');
  groupImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        groupImagePreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  // Make the preview clickable to open the file picker (UX requested)
  if (groupImagePreview) {
    groupImagePreview.style.cursor = 'pointer';
    groupImagePreview.addEventListener('click', () => {
      groupImageInput.click();
    });
  }

  // Crear grupo
  const createGroupConfirmBtn = document.getElementById('createGroupConfirmBtn');
  createGroupConfirmBtn.addEventListener('click', async () => {
    const name = document.getElementById('groupNameInput').value.trim();
    const description = document.getElementById('groupDescriptionInput').value.trim();
    const image = groupImagePreview.src;

    if (!name) {
      alert('Escribe el nombre del grupo');
      return;
    }

    state.groupData = {
      id: 'g' + Date.now(),
      name,
      description,
      image,
      members: state.selectedNeighbors
    };

    // Agregar a allGroups
    allGroups.push({
      id: state.groupData.id,
      name: state.groupData.name,
      image: state.groupData.image
    });

    closeModal(createGroupModal);
    openModal(groupCreatedModal);
    await showToast(2000);
    closeModal(groupCreatedModal);

    // Agregar grupo al chat (simular)
    addGroupToChat(state.groupData);
    state.selectedNeighbors = [];
  });

  function addGroupToChat(group) {
    // Use the public chat API to add the chat so the sidebar registers it and persists state
    if (window.chatAPI && typeof window.chatAPI.addChat === 'function') {
      const el = window.chatAPI.addChat({ 
        id: group.id, 
        name: group.name, 
        image: group.image,
        members: group.members || state.selectedNeighbors  // Pass members to the API
      });
      // Select the new chat after a brief delay to ensure DOM is updated
      if (el) {
        setTimeout(() => {
          el.click();
        }, 100);
      }
      return el;
    } else {
      // fallback: try to insert directly and register manually
      const chatList = document.getElementById('chatList');
      const wrapper = document.querySelector('.chat-nuevo-btn-wrapper');
      if (!chatList || !wrapper) return null;
      
      const groupItem = document.createElement('div');
      groupItem.className = 'chat-item';
      groupItem.dataset.id = group.id;
      groupItem.dataset.name = group.name;
      groupItem.innerHTML = `
        <img src="${group.image}" alt="${group.name}" class="chat-item-img group-image" data-group-id="${group.id}" />
        <div class="chat-item-info">
          <span class="chat-item-name">${group.name}</span>
          <span class="chat-item-time">Ahora</span>
        </div>
        <span class="chat-unread hidden">0</span>
      `;
      chatList.insertBefore(groupItem, wrapper);
      
      // register click handler so it behaves like other chat items
      groupItem.addEventListener('click', () => {
        // activate
        Array.from(document.querySelectorAll('.chat-item')).forEach(c=>c.classList.remove('active'));
        groupItem.classList.add('active');
        // set header
        const chatTitle = document.getElementById('chatTitle');
        if (chatTitle) chatTitle.innerHTML = `<span style="display:inline-flex;align-items:center;gap:10px;"><img src="${group.image}" style="width:40px;height:40px;border-radius:50%;" /><span>${group.name}</span></span>`;
      });
      
      // Select the new chat after a brief delay
      setTimeout(() => {
        groupItem.click();
      }, 100);
      
      return groupItem;
    }
  }

  // ========== FLUJO: NOTIFICACIÓN MASIVA ==========
  chatNotificacionBtn.addEventListener('click', () => {
    chatNuevoDropdown.classList.add('hidden');
    renderGroupsForNotification();
    openModal(selectGroupForNotifModal);
  });

  function renderGroupsForNotification() {
    const list = document.getElementById('groupsForNotifList');
    list.innerHTML = '';
    allGroups.forEach(group => {
      const btn = document.createElement('button');
      btn.className = 'group-item';
      btn.innerHTML = `
        <img src="${group.image}" alt="${group.name}" style="width:40px;height:40px;border-radius:50%;" />
        <span>${group.name}</span>
      `;
      btn.addEventListener('click', () => {
        state.selectedGroup = group;
        closeModal(selectGroupForNotifModal);
        openModal(composeNotificationModal);
      });
      list.appendChild(btn);
    });
  }

  // Botón "Seleccionar usuarios"
  const selectExcludedUsersBtn = document.getElementById('selectExcludedUsersBtn');
  selectExcludedUsersBtn.addEventListener('click', () => {
    renderUsersForExclusion();
    openModal(selectExcludedUsersModal);
  });

  function renderUsersForExclusion() {
    const list = document.getElementById('usersForExclusionList');
    list.innerHTML = '';
    // Try to get members from chatMeta via window API, or fall back to selected group members or all neighbors
    let members = [];
    if (state.selectedGroup) {
      // First try to get from chatMeta via the exposed API
      if (window.chatAPI && typeof window.chatAPI.getGroupMembers === 'function') {
        members = window.chatAPI.getGroupMembers(state.selectedGroup.id || state.selectedGroup.name) || [];
      }
      // Fall back to group members if available
      if (members.length === 0 && state.selectedGroup.members) {
        members = state.selectedGroup.members;
      }
      // Fall back to selected neighbors
      if (members.length === 0) {
        members = state.selectedNeighbors || [];
      }
    }
    // Final fallback to all neighbors
    if (members.length === 0) {
      members = allNeighbors;
    }
    
    members.forEach(user => {
      const item = document.createElement('div');
      item.className = 'user-item';
      item.innerHTML = `
        <input type="checkbox" value="${user.id}" />
        <span>${user.name}</span>
      `;
      item.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!state.excludedUsers.find(u => u.id === user.id)) {
            state.excludedUsers.push(user);
          }
        } else {
          state.excludedUsers = state.excludedUsers.filter(u => u.id !== user.id);
        }
        updateExcludedCount();
      });
      list.appendChild(item);
    });
  }

  function updateExcludedCount() {
    document.getElementById('excludedCount').textContent = state.excludedUsers.length;
  }

  // Botón "Seleccionar todos" (en modal de exclusión)
  const selectAllInModalBtn = document.getElementById('selectAllInModalBtn');
  selectAllInModalBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#usersForExclusionList input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => {
      cb.checked = !allChecked;
      cb.dispatchEvent(new Event('change'));
    });
  });

  // Botón "Aceptar" (en modal de exclusión)
  const acceptExclusionBtn = document.getElementById('acceptExclusionBtn');
  acceptExclusionBtn.addEventListener('click', () => {
    closeModal(selectExcludedUsersModal);
  });

  // Botón "Filtrar por ubicación"
  const selectByLocationBtn = document.getElementById('selectByLocationBtn');
  selectByLocationBtn.addEventListener('click', () => {
    openModal(filterByLocationModal);
  });

  // Simulación: filtro por ubicación excluye 3 personas
  const acceptLocationFilterBtn = document.getElementById('acceptLocationFilterBtn');
  acceptLocationFilterBtn.addEventListener('click', () => {
    // Get available members list
    let members = [];
    if (state.selectedGroup) {
      if (window.chatAPI && typeof window.chatAPI.getGroupMembers === 'function') {
        members = window.chatAPI.getGroupMembers(state.selectedGroup.id || state.selectedGroup.name) || [];
      }
      if (members.length === 0 && state.selectedGroup.members) {
        members = state.selectedGroup.members;
      }
      if (members.length === 0) {
        members = state.selectedNeighbors || [];
      }
    }
    if (members.length === 0) {
      members = allNeighbors;
    }
    
    // Auto-exclude first 3 members by location (simulation)
    state.excludedUsers = members.slice(0, Math.min(3, members.length));
    updateExcludedCount();
    document.getElementById('locationExcludedInfo').textContent = `Se excluyeron ${state.excludedUsers.length} personas por ubicación`;
    closeModal(filterByLocationModal);
  });

  // Botón "Seleccionar todos" (en modal de composición)
  const selectAllUsersBtn = document.getElementById('selectAllUsersBtn');
  selectAllUsersBtn.addEventListener('click', () => {
    state.excludedUsers = [];
    updateExcludedCount();
  });

  // Botón "Enviar"
  const sendNotificationBtn = document.getElementById('sendNotificationBtn');
  sendNotificationBtn.addEventListener('click', () => {
    const title = document.getElementById('notifTitleInput').value.trim();
    const description = document.getElementById('notifDescriptionInput').value.trim();

    if (!title || !description) {
      alert('Completa título y descripción');
      return;
    }

    state.notificationData = {
      title,
      description,
      group: state.selectedGroup,
      excluded: state.excludedUsers
    };

    document.getElementById('confirmGroupName').textContent = state.selectedGroup.name;
    closeModal(composeNotificationModal);
    openModal(confirmSendModal);
  });

  // Modal de confirmación
  const confirmSendCancelBtn = document.getElementById('confirmSendCancelBtn');
  const confirmSendAcceptBtn = document.getElementById('confirmSendAcceptBtn');

  confirmSendCancelBtn.addEventListener('click', () => {
    closeModal(confirmSendModal);
  });

  confirmSendAcceptBtn.addEventListener('click', async () => {
    closeModal(confirmSendModal);
    openModal(notificationSentModal);
    await showToast(2000);
    closeModal(notificationSentModal);

    // Agregar mensaje masivo al grupo (simular)
    addMassNotificationToGroup(state.notificationData);
    state.excludedUsers = [];
    state.notificationData = {};
  });

  function addMassNotificationToGroup(notif) {
    // Simular: agregar mensaje masivo al chat del grupo
    console.log('Mensaje masivo enviado:', notif);
    // En una aplicación real, aquí se enviarían los datos a un backend
  }

  // ========== Cerrar modales ==========
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.target;
      if (target) {
        const modal = document.querySelector(target);
        if (modal) closeModal(modal);
      }
    });
  });

  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.target;
      if (target) {
        const modal = document.querySelector(target);
        if (modal) closeModal(modal);
      }
    });
  });

  // Cerrar modales al hacer clic fuera
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });
});
