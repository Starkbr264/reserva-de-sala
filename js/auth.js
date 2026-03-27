/* ================================================================
   js/auth.js — Guards de rota
   Depende de: storage.js
   ================================================================ */

var _ROTAS = {
  admin:'admin.html', coordenador:'coordenador.html',
  instrutor:'instrutor.html', recepcao:'recepcao.html'
};

function requirePerfil(perfil) {
  var s = getSessao();
  if (!s || s.perfil !== perfil) { window.location.replace('login.html'); }
}

function seJaLogado() {
  var s = getSessao(); if (!s) return;
  if (_ROTAS[s.perfil]) window.location.replace(_ROTAS[s.perfil]);
}

function sair() { clearSessao(); window.location.replace('login.html'); }

/* Preenche sidebar com dados da sessão */
function initSidebar() {
  var s = getSessao(); if (!s) return;
  var el = function(id){ return document.getElementById(id); };
  if (el('sbNome'))     el('sbNome').textContent     = s.nome;
  if (el('sbIniciais')) el('sbIniciais').textContent = iniciais(s.nome);
  if (el('sbUnidade') && s.unidadeId) {
    var u = getUnidadeById(s.unidadeId);
    if (u && el('sbUnidade')) el('sbUnidade').textContent = u.nome;
  }
  initTema();
}

/* Logo: mostra img se src preenchido, senão mostra texto */
function initLogo() {
  var img  = document.getElementById('logoImg');
  var wrap = document.getElementById('logoWrap');
  var txt  = document.getElementById('logoTxt');
  if (!img) return;
  if (img.getAttribute('src')) {
    if (txt) txt.style.display = 'none';
  } else {
    if (wrap) wrap.style.display = 'none';
  }
}
