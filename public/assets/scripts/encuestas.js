// Datos iniciales (puedes reemplazarlos por los tuyos)
const initial = [
  {id:'u1',name:'Maria Fernandez',role:'Rol: Vecino',avatar:null,responded:false},
  {id:'u2',name:'Maria Fernandez',role:'Rol: Vecino',avatar:null,responded:true},
  {id:'u3',name:'Theo Ramírez',role:'Rol: Vecino',avatar:null,responded:true},
  {id:'u4',name:'Zayd Rodríguez',role:'Rol: Vecino',avatar:null,responded:false},
  {id:'u5',name:'Pedro Alvarez',role:'Rol: Vecino',avatar:null,responded:false}
];

const listEl = document.getElementById('answersList');
const totalCountEl = document.getElementById('totalCount');

let items = [...initial];

function render(){
  listEl.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'item' + (item.responded ? ' responded' : '');
    li.dataset.id = item.id;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (item.avatar){
      const img = document.createElement('img'); img.src = item.avatar; avatar.appendChild(img);
    } else {
      // initials
      const initials = item.name.split(' ').map(s=>s[0]).slice(0,2).join('');
      avatar.textContent = initials;
    }

    const meta = document.createElement('div'); meta.className = 'meta';
    const name = document.createElement('div'); name.className = 'name'; name.textContent = item.name;
    const role = document.createElement('div'); role.className = 'role'; role.textContent = item.role;
    meta.appendChild(name); meta.appendChild(role);

    const actions = document.createElement('div'); actions.className = 'actions';

    const btnRemove = document.createElement('button'); btnRemove.className = 'btn-circle btn-remove'; btnRemove.title = 'Eliminar respuesta';
    btnRemove.innerHTML = '✕';
    btnRemove.addEventListener('click', (e)=>{
      e.stopPropagation();
      removeItem(item.id);
    });

    const btnCheck = document.createElement('button'); btnCheck.className = 'btn-circle btn-check'; btnCheck.title = 'Marcar como respondido';
    btnCheck.innerHTML = item.responded ? '✓' : '✔';
    btnCheck.addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleResponded(item.id);
    });

    actions.appendChild(btnRemove); actions.appendChild(btnCheck);

    li.appendChild(avatar); li.appendChild(meta); li.appendChild(actions);

    // Click en todo el item para alternar respondido
    li.addEventListener('click', ()=>{
      toggleResponded(item.id);
    });

    listEl.appendChild(li);
  });

  totalCountEl.textContent = items.length.toString();
}

function toggleResponded(id){
  items = items.map(it => it.id === id ? {...it, responded: !it.responded} : it);
  render();
  // small feedback
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) el.animate([{transform:'scale(0.99)'},{transform:'scale(1)'}],{duration:160});
}

function removeItem(id){
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el){
    el.animate([{opacity:1, transform:'translateX(0)'},{opacity:0, transform:'translateX(-20px)'}],{duration:240, easing:'ease'}).onfinish = ()=>{
      items = items.filter(it=>it.id !== id);
      render();
    };
  } else {
    items = items.filter(it=>it.id !== id);
    render();
  }
}

// inicializar
render();

// demo: añadir nuevo para ver comportamiento
// setTimeout(()=>{ items.push({id:'u6',name:'Nuevo Usuario',role:'Rol: Vecino',avatar:null,responded:false}); render(); }, 1400);