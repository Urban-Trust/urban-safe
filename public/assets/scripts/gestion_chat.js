// gestion_chat.js
document.addEventListener('DOMContentLoaded', () => {
  // Datos iniciales: 5 vecinos
  const users = [
    { id: 1, name: 'Maria Fernandez', roles: ['Vecino'], avatarType: 'img', avatar: 'assets/images/Lorena.png' },
    { id: 2, name: 'Maria Fernandez2', roles: ['Vecino'], avatarType: 'img', avatar: 'assets/images/laura-sans.png' },
    { id: 3, name: 'Maria Fernandez3', roles: ['Vecino'], avatarType: 'initial', initial: 'M', color: '#FF8A65' },
    { id: 4, name: 'Maria Fernandez4', roles: ['Vecino'], avatarType: 'initial', initial: 'M', color: '#9575CD' },
    { id: 5, name: 'Maria Fernandez5', roles: ['Vecino'], avatarType: 'initial', initial: 'M', color: '#4FC3F7' }
  ];

  const ROLES = ['Fiscal','Moderador','Organizador','Seguridad','Administrador'];

  // DOM
  const membersListEl = document.getElementById('membersList');
  const rolePanel = document.getElementById('rolePanel');
  const selectedAvatar = document.getElementById('selectedAvatar');
  const selectedName = document.getElementById('selectedName');
  const selectedRolesList = document.getElementById('selectedRolesList');
  const openRoleSelectorBtn = document.getElementById('openRoleSelector');
  const roleModal = document.getElementById('roleModal');
  const roleOptionsContainer = document.getElementById('roleOptions');
  const closeRoleModalBtn = document.getElementById('closeRoleModal');
  const doneRoleModalBtn = document.getElementById('doneRoleModal');
  const removeNeighborBtn = document.getElementById('removeNeighborBtn');
  const addMsg = document.getElementById('addMsg');

  let selectedUserId = null;

  // RENDER members list
  function renderMembers() {
    membersListEl.innerHTML = '';
    users.forEach(user => {
      const item = document.createElement('div');
      item.className = 'member-item';
      item.dataset.id = String(user.id);

      // left part
      const left = document.createElement('div');
      left.className = 'member-left';

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'avatar';
      if (user.avatarType === 'img') {
        const img = document.createElement('img');
        img.src = user.avatar;
        img.alt = user.name;
        avatarWrap.appendChild(img);
      } else {
        avatarWrap.textContent = user.initial;
        avatarWrap.style.background = user.color || '#777';
      }

      const info = document.createElement('div');
      info.className = 'member-info';
      const h = document.createElement('h4');
      h.textContent = user.name;
      const p = document.createElement('p');
      p.textContent = 'Rol: ' + user.roles.join(', ');
      info.appendChild(h);
      info.appendChild(p);

      left.appendChild(avatarWrap);
      left.appendChild(info);

      // actions
      const actions = document.createElement('div');
      actions.className = 'member-actions';
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete';
      delBtn.title = 'Eliminar vecino';
      delBtn.innerHTML = '✕';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ok = confirm(`Eliminar a ${user.name}?`);
        if (!ok) return;
        removeUser(user.id);
      });

      actions.appendChild(delBtn);

      item.appendChild(left);
      item.appendChild(actions);

      item.addEventListener('click', () => selectUser(user.id));

      // mark selected visually
      if (selectedUserId === user.id) item.classList.add('selected');

      membersListEl.appendChild(item);
    });
  }

  function removeUser(id){
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return;
    users.splice(idx,1);
    if (selectedUserId === id) {
      selectedUserId = null;
      hideRolePanel();
    }
    renderMembers();
    addMsg.textContent = 'Vecino eliminado.';
    setTimeout(()=> addMsg.textContent = '', 2200);
  }

  // select user
  function selectUser(id){
    selectedUserId = id;
    renderMembers();
    const user = users.find(u => u.id === id);
    if (!user) return;
    showRolePanel(user);

    // On small screens bring the panel into view so the user can interact quickly
    if (window.innerWidth <= 820) {
      setTimeout(() => {
        rolePanel.scrollIntoView({ behavior: 'smooth' });
      }, 120);

      // Extra scroll to bottom in case it's stuck
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 300);
    }
  }

  function showRolePanel(user){
    rolePanel.classList.remove('hidden');
    rolePanel.setAttribute('aria-hidden','false');
    // avatar
    selectedAvatar.innerHTML = '';
    if (user.avatarType === 'img') {
      const img = document.createElement('img');
      img.src = user.avatar;
      img.alt = user.name;
      selectedAvatar.appendChild(img);
    } else {
      selectedAvatar.style.background = user.color;
      selectedAvatar.textContent = user.initial;
    }
    // name
    selectedName.textContent = user.name;
    // roles
    renderSelectedRoles(user);
    openRoleSelectorBtn.disabled = false;
  }

  function hideRolePanel(){
    rolePanel.classList.add('hidden');
    rolePanel.setAttribute('aria-hidden','true');
    selectedAvatar.innerHTML = '';
    selectedName.textContent = '';
    selectedRolesList.innerHTML = '';
    openRoleSelectorBtn.disabled = true;
  }

  function renderSelectedRoles(user){
    selectedRolesList.innerHTML = '';
    user.roles.forEach(role => {
      const span = document.createElement('div');
      span.className = 'role-badge';
      span.textContent = role;
      // small remove X inside badge
      const rem = document.createElement('span');
      rem.className = 'remove-role';
      rem.textContent = '✕';
      rem.title = `Quitar rol ${role}`;
      rem.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleRoleForUser(user.id, role, false);
      });
      span.appendChild(rem);
      selectedRolesList.appendChild(span);
    });
  }

  // toggle role: add or remove
  function toggleRoleForUser(userId, role, addOrRemove=null){
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const has = user.roles.includes(role);
    if (addOrRemove === null) {
      // toggle
      if (has) user.roles = user.roles.filter(r => r !== role);
      else user.roles.push(role);
    } else if (addOrRemove === true) {
      if (!has) user.roles.push(role);
    } else {
      user.roles = user.roles.filter(r => r !== role);
    }
    // refresh both views
    if (selectedUserId === userId) renderSelectedRoles(user);
    renderMembers();
  }

  // Open role selector modal and populate options
  openRoleSelectorBtn.addEventListener('click', () => {
    if (!selectedUserId) return;
    createRoleOptions();
    roleModal.classList.remove('hidden');
    roleModal.setAttribute('aria-hidden','false');
  });

  function createRoleOptions(){
    roleOptionsContainer.innerHTML = '';
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return;
    ROLES.forEach(role => {
      const btn = document.createElement('button');
      btn.className = 'role-option-btn';
      btn.dataset.role = role;
      const owned = user.roles.includes(role);
      if (owned) btn.classList.add('owned');

      btn.innerHTML = `<span>${role}</span><span class="r-icon">${owned ? '✕' : '+'}</span>`;

      btn.addEventListener('click', () => {
        // toggle
        const nowOwned = user.roles.includes(role);
        toggleRoleForUser(user.id, role, !nowOwned);
        // update button state immediately
        if (!nowOwned) {
          btn.classList.add('owned');
          btn.querySelector('.r-icon').textContent = '✕';
        } else {
          btn.classList.remove('owned');
          btn.querySelector('.r-icon').textContent = '+';
        }
      });

      roleOptionsContainer.appendChild(btn);
    });
  }

  // Close modal
  closeRoleModalBtn.addEventListener('click', () => {
    roleModal.classList.add('hidden');
    roleModal.setAttribute('aria-hidden','true');
  });
  doneRoleModalBtn.addEventListener('click', () => {
    roleModal.classList.add('hidden');
    roleModal.setAttribute('aria-hidden','true');
  });

  // remove neighbor from right panel button
  removeNeighborBtn.addEventListener('click', () => {
    if (!selectedUserId) return;
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return;
    const ok = confirm(`Eliminar a ${user.name}?`);
    if (!ok) return;
    removeUser(user.id);
  });

  // initial render
  renderMembers();
  hideRolePanel();

  // OPTIONAL: show message on addBtn click (you can hook adding logic later)
  // -----------------------------
  // AGREGAR VECINO
  // -----------------------------
  const addNeighborModal = document.getElementById("addNeighborModal");
  const newNeighborName = document.getElementById("newNeighborName");
  const newNeighborAvatarType = document.getElementById("newNeighborAvatarType");

  const avatarInitialForm = document.getElementById("avatarInitialForm");
  const avatarImageForm = document.getElementById("avatarImageForm");

  const newNeighborInitial = document.getElementById("newNeighborInitial");
  const newNeighborColor = document.getElementById("newNeighborColor");
  const newNeighborImageUrl = document.getElementById("newNeighborImageUrl");

  const cancelAddNeighborBtn = document.getElementById("cancelAddNeighborBtn");
  const confirmAddNeighborBtn = document.getElementById("confirmAddNeighborBtn");

  // Abrir modal
  document.getElementById("showAddNeighborsBtn").addEventListener("click", () => {
    addNeighborModal.classList.remove("hidden");
    addNeighborModal.setAttribute("aria-hidden", "false");
  });

  // Cambiar formulario según avatar seleccionado
  newNeighborAvatarType.addEventListener("change", () => {
    if (newNeighborAvatarType.value === "initial") {
      avatarInitialForm.classList.remove("hidden");
      avatarImageForm.classList.add("hidden");
    } else {
      avatarInitialForm.classList.add("hidden");
      avatarImageForm.classList.remove("hidden");
    }
  });

  // Cerrar modal
  cancelAddNeighborBtn.addEventListener("click", () => {
    addNeighborModal.classList.add("hidden");
    addNeighborModal.setAttribute("aria-hidden", "true");
  });

  // Confirmar agregar vecino
  confirmAddNeighborBtn.addEventListener("click", () => {
    const name = newNeighborName.value.trim();
    if (!name) {
      alert("Ingresa un nombre.");
      return;
    }

    // Crear nuevo objeto
    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name,
      roles: ["Vecino"],
    };

    if (newNeighborAvatarType.value === "initial") {
      newUser.avatarType = "initial";
      newUser.initial = newNeighborInitial.value.trim().toUpperCase() || name[0].toUpperCase();
      newUser.color = newNeighborColor.value;
    } else {
      newUser.avatarType = "img";
      newUser.avatar = newNeighborImageUrl.value || "assets/images/default.png";
    }

    // Añadir al array
    users.push(newUser);

    // Render UI
    renderMembers();

    addMsg.textContent = "Vecino agregado.";
    setTimeout(() => (addMsg.textContent = ""), 2200);

    // Cerrar modal
    addNeighborModal.classList.add("hidden");
    addNeighborModal.setAttribute("aria-hidden", "true");

    // Limpiar formulario
    newNeighborName.value = "";
    newNeighborInitial.value = "";
    newNeighborImageUrl.value = "";
  });

  // Cerrar modal clicando fuera
  addNeighborModal.addEventListener("click", (e) => {
    if (e.target === addNeighborModal) {
      addNeighborModal.classList.add("hidden");
      addNeighborModal.setAttribute("aria-hidden", "true");
    }
  });

  // Cerrar modal con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !addNeighborModal.classList.contains("hidden")) {
      addNeighborModal.classList.add("hidden");
      addNeighborModal.setAttribute("aria-hidden", "true");
    }
  });


  // Accessibility: close modal on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !roleModal.classList.contains('hidden')) {
      roleModal.classList.add('hidden');
      roleModal.setAttribute('aria-hidden','true');
    }
  });

  // Allow clicking backdrop to close
  roleModal.addEventListener('click', (e) => {
    if (e.target === roleModal) {
      roleModal.classList.add('hidden');
      roleModal.setAttribute('aria-hidden','true');
    }
  });
});
