window.addEventListener('DOMContentLoaded', function() {
  initTema();

  function atualizarIconeTema() {
    var t = getTema();
    document.getElementById('btnTema').textContent = t === 'dark' ? '☀️' : '🌙';
  }

  var _origToggle = toggleTema;
  toggleTema = function() { _origToggle(); atualizarIconeTema(); };
  atualizarIconeTema();
});
