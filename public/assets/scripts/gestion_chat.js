document.addEventListener('DOMContentLoaded', () => {
  // Sample dataset of registered neighbors (could come from server)
  const allNeighbors = [
    'Lucía', 'Carlos', 'Mariana', 'Jorge', 'Ana', 'Pedro', 'Sofía', 'Luis', 'Miguel', 'Rosa'
  ];

  // initial group members (subset)
  let groupMembers = ['Lucía', 'Carlos', 'Mariana', 'Jorge', 'Ana', 'Pedro', 'Sofía', 'Luis'];

  const membersList = document.getElementById('membersList');
  const showAddNeighborsBtn = document.getElementById('showAddNeighborsBtn');
  const availableNeighborsDropdown = document.getElementById('availableNeighborsDropdown');
  const addMsg = document.getElementById('addMsg');

  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteInput = document.getElementById('confirmDeleteInput');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  const addNeighborsModal = document.getElementById('addNeighborsModal');
  const closeAddNeighborsBtn = document.getElementById('closeAddNeighborsBtn');

  let pendingToDelete = null; // name pending deletion

  function renderMembers() {
    membersList.innerHTML = '';
    if (groupMembers.length === 0) {
      membersList.textContent = 'No hay miembros en el grupo.';
      return;
    }
    groupMembers.forEach(name => {
      const row = document.createElement('div');
      row.className = 'neighbor-row';

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '12px';
      const avatar = document.createElement('div');
      avatar.className = 'neighbor-avatar';
      avatar.textContent = name.charAt(0).toUpperCase();
      const info = document.createElement('div');
      info.innerHTML = `<div style="font-weight:600; color:#fff;">${name}</div><div style="font-size:12px;color:#aaa;">Usuario: ${name.toLowerCase()}</div>`;
      left.appendChild(avatar);
      left.appendChild(info);

      const actions = document.createElement('div');
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✕';
      removeBtn.style.fontSize = '28px';
      removeBtn.style.color = '#fff';
      removeBtn.style.background = 'transparent';
      removeBtn.style.border = 'none';
      removeBtn.style.padding = '0';
      removeBtn.style.marginLeft = 'auto';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.lineHeight = '1';
      removeBtn.addEventListener('click', () => {
        pendingToDelete = name;
        confirmDeleteInput.value = '';
        deleteModal.style.display = 'flex';
      });
      actions.appendChild(removeBtn);

      row.appendChild(left);
      row.appendChild(actions);
      membersList.appendChild(row);
    });
  }

  // Show/hide modal of available neighbors to add
  showAddNeighborsBtn.addEventListener('click', () => {
    // populate with neighbors that are not yet in group
    availableNeighborsDropdown.innerHTML = '';
    const candidates = allNeighbors.filter(n => !groupMembers.includes(n));
    if (candidates.length === 0) {
      availableNeighborsDropdown.textContent = 'No hay vecinos disponibles para agregar.';
      addNeighborsModal.style.display = 'flex';
      return;
    }
    candidates.forEach(n => {
      const item = document.createElement('div');
      item.className = 'available-item';
      const av = document.createElement('div'); av.className = 'neighbor-avatar'; av.textContent = n.charAt(0).toUpperCase();
      const nm = document.createElement('div'); nm.textContent = n;
      const btn = document.createElement('button'); btn.textContent = 'Agregar'; btn.style.marginLeft = 'auto'; btn.style.background = '#2E3859'; btn.style.color = '#fff'; btn.style.border = 'none'; btn.style.padding = '8px 10px'; btn.style.borderRadius = '8px';
      btn.addEventListener('click', () => { addNeighborDirect(n); });
      item.appendChild(av); item.appendChild(nm); item.appendChild(btn);
      availableNeighborsDropdown.appendChild(item);
    });
    addNeighborsModal.style.display = 'flex';
  });

  // Close add neighbors modal
  closeAddNeighborsBtn.addEventListener('click', () => {
    addNeighborsModal.style.display = 'none';
  });

  function addNeighborDirect(name) {
    if (!name) return;
    if (groupMembers.includes(name)) { addMsg.textContent = 'El vecino ya forma parte del grupo.'; return; }
    groupMembers.push(name);
    renderMembers();
    addMsg.style.color = 'green'; addMsg.textContent = `Vecino ${name} agregado.`;
    setTimeout(()=>{ addMsg.textContent = ''; addMsg.style.color=''; }, 2400);
    addNeighborsModal.style.display = 'none';
  }

  cancelDeleteBtn.addEventListener('click', () => {
    pendingToDelete = null;
    deleteModal.style.display = 'none';
  });

  confirmDeleteBtn.addEventListener('click', () => {
    const typed = (confirmDeleteInput.value || '').trim();
    if (!pendingToDelete) { deleteModal.style.display = 'none'; return; }
    if (typed.toLowerCase() !== pendingToDelete.toLowerCase()) {
      alert('El nombre no coincide exactamente. Escribe el nombre tal como aparece para confirmar.');
      return;
    }
    // remove
    groupMembers = groupMembers.filter(x => x.toLowerCase() !== pendingToDelete.toLowerCase());
    pendingToDelete = null;
    deleteModal.style.display = 'none';
    renderMembers();
  });

  // initial render
  renderMembers();

});
