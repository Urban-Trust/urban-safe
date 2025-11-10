// Datos de ejemplo (base "fija")
const USERS = [
  { nombre: 'Juan', apellido: 'Perez', email: 'juan@example.com', password: '123456' },
  { nombre: 'Maria', apellido: 'Gomez', email: 'maria@example.com', password: 'abc123' },
  { nombre: 'Luis', apellido: 'Lopez', email: 'luis@example.com', password: 'passw0rd' }
];

document.addEventListener('DOMContentLoaded', function () {
  var forgotLink = document.getElementById('open-forgot');
  var overlay = document.getElementById('modal-overlay');
  var forgotModal = document.getElementById('forgot-modal');
  var successModal = document.getElementById('success-modal');
  var backBtn = document.getElementById('btn-back-forgot');
  var confirmBtn = document.getElementById('btn-confirm-email');
  var acceptBtn = document.getElementById('btn-success-accept');
  var emailInput = document.getElementById('forgot-email');
  var errorDiv = document.getElementById('forgot-error');

  var loginSection = document.getElementById('login');
  var signupSection = document.getElementById('signup');
  var resetSection = document.getElementById('reset-section');
  var resetSaveBtn = document.getElementById('btn-reset-save');
  var resetSuccessModal = document.getElementById('reset-success-modal');
  var resetAcceptBtn = document.getElementById('btn-reset-accept');
  var loginForm = document.getElementById('login-form');
  var signupForm = document.querySelector('.signup-form');

  function openOverlay(modalEl) {
    if (!overlay || !modalEl) return;
    overlay.classList.add('show');
    forgotModal && forgotModal.classList.remove('show');
    successModal && successModal.classList.remove('show');
    modalEl.classList.add('show');
  }

  function closeOverlay() {
    overlay && overlay.classList.remove('show');
    forgotModal && forgotModal.classList.remove('show');
    successModal && successModal.classList.remove('show');
  }

  if (forgotLink) {
    forgotLink.addEventListener('click', function (e) {
      e.preventDefault();
      if (errorDiv) errorDiv.style.display = 'none';
      if (emailInput) emailInput.value = '';
      openOverlay(forgotModal);
      if (emailInput) emailInput.focus();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      closeOverlay();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      var value = (emailInput && emailInput.value || '').trim();
      if (!value) {
        if (errorDiv) errorDiv.style.display = 'block';
        return;
      }
      // Verificar si el correo existe en la "base de datos"
      var existe = USERS.some(function(u){ return (u.email || '').toLowerCase() === value.toLowerCase(); });
      if (!existe) {
        if (errorDiv) {
          errorDiv.textContent = 'No se encontró el correo';
          errorDiv.style.display = 'block';
        }
        return;
      }

      if (errorDiv) errorDiv.style.display = 'none';
      // restaurar texto del error por si luego queda vacio
      if (errorDiv) errorDiv.textContent = 'Rellenar este campo para el mensaje a su correo';
      openOverlay(successModal);
    });
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      closeOverlay();
      if (loginSection) loginSection.style.display = 'none';
      if (signupSection) signupSection.style.display = 'none';
      if (resetSection) resetSection.style.display = 'block';
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
    });
  }

  if (resetSaveBtn) {
    resetSaveBtn.addEventListener('click', function () {
      openOverlay(resetSuccessModal);
    });
  }

  if (resetAcceptBtn) {
    resetAcceptBtn.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeOverlay();
      }
    });
  }

  // Validar inicio de sesion y mostrar alertas
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var userInput = loginForm.querySelector('input[type="text"]');
      var passInput = loginForm.querySelector('input[type="password"]');
      var user = (userInput && userInput.value || '').trim();
      var pass = (passInput && passInput.value || '').trim();

      if (!user || !pass) {
        window.location.hash = 'login-required';
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
        return;
      }

      var lower = user.toLowerCase();
      var found = USERS.find(function (u) {
        var nameMatch = ((u.nombre || '') + ' ' + (u.apellido || '')).toLowerCase() === lower;
        var emailMatch = (u.email || '').toLowerCase() === lower;
        return nameMatch || emailMatch;
      });

      if (!found || found.password !== pass) {
        window.location.hash = 'login-error';
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
        return;
      }

      // Inicio de sesion correcto
      window.location.href = 'index.html';
    });
  }

  // Validar registro minimo (todos los campos requeridos)
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = Array.prototype.slice.call(signupForm.querySelectorAll('input'));
      var allFilled = required.every(function (el) { return !!(el.value || '').trim(); });
      if (!allFilled) {
        window.location.hash = 'signup-required';
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
        return;
      }
      // Registro correcto (no persistimos en USERS). Volver a login.
      window.location.hash = 'login';
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
    });
  }
});
