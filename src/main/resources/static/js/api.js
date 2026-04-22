// ================================================================
// api.js — Camada de integração com a API + cache local em memória
// ================================================================

const API_BASE = (() => {
  if (window.location && /^https?:/i.test(window.location.protocol)) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:8080/api';
})();

const CACHE = {
  usuarios: [],
  unidades: [],
  salas: [],
  turmas: [],
  reservas: [],
  chaves: [],
  notificacoes: [],
  solicitacoes: [],
  loaded: false,
  loadingPromise: null
};


function apiRequestSync(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const xhr = new XMLHttpRequest();
  xhr.open(options.method || "GET", url, false);
  xhr.setRequestHeader("Content-Type", "application/json");
  const extraHeaders = options.headers || {};
  Object.keys(extraHeaders).forEach(k => xhr.setRequestHeader(k, extraHeaders[k]));
  xhr.send(options.body ?? null);

  if (xhr.status < 200 || xhr.status >= 300) {
    throw new Error(`Erro ${xhr.status}: ${xhr.responseText || 'Falha na requisição'}`);
  }

  if (!xhr.responseText) return null;
  try { return JSON.parse(xhr.responseText); } catch (_) { return null; }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorText = '';
    try { errorText = await response.text(); } catch (_) {}
    throw new Error(`Erro ${response.status}: ${errorText || 'Falha na requisição'}`);
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json();
}

function lowerPerfil(v) {
  return String(v || '').toLowerCase();
}

function normalizeUsuario(u) {
  if (!u) return null;
  return {
    id: u.id,
    nome: u.nome || '',
    email: u.email || '',
    senha: u.senha || '',
    perfil: lowerPerfil(u.perfil),
    unidadeId: u.unidadeId ?? u.unidade?.id ?? null,
    unidade: u.unidade ? { id: u.unidade.id, nome: u.unidade.nome || '' } : null
  };
}

function normalizeUnidade(u) {
  if (!u) return null;
  return {
    id: u.id,
    nome: u.nome || '',
    endereco: u.endereco || '',
    cep: u.cep || '',
    cidade: u.cidade || ''
  };
}

function normalizeSala(s) {
  if (!s) return null;
  const turnos = Array.isArray(s.turnosDisponiveis) ? s.turnosDisponiveis : (Array.isArray(s.turnos) ? s.turnos : []);
  return {
    id: s.id,
    nome: s.nome || '',
    capacidade: s.capacidade ?? 0,
    tipo: s.tipo || '',
    andar: s.andar || '',
    bloco: s.bloco || '',
    turnosDisponiveis: turnos,
    turnos,
    unidadeId: s.unidadeId ?? s.unidade?.id ?? null,
    statusManual: s.statusManual || null,
    motivoManual: s.motivoManual || '',
    manualPor: s.manualPor || '',
    manualCriadaEm: s.manualCriadaEm || null
  };
}

function normalizeTurma(t) {
  if (!t) return null;
  const nome = t.nome || t.codigo || t.curso || '';
  return {
    id: t.id,
    nome,
    codigo: t.codigo || nome,
    curso: t.curso || '',
    turno: t.turno || '',
    dataInicio: t.dataInicio || '',
    dataFim: t.dataFim || '',
    instrutorId: t.instrutorId ?? t.instrutor?.id ?? null,
    unidadeId: t.unidadeId ?? t.unidade?.id ?? null
  };
}

function normalizeReserva(r) {
  if (!r) return null;
  return {
    id: r.id,
    salaId: r.salaId ?? r.sala?.id ?? null,
    turmaId: r.turmaId ?? r.turma?.id ?? null,
    unidadeId: r.unidadeId ?? r.sala?.unidade?.id ?? r.turma?.unidade?.id ?? null,
    instrutorId: r.instrutorId ?? r.turma?.instrutor?.id ?? null,
    turno: r.turno || '',
    diasSemana: Array.isArray(r.diasSemana) ? r.diasSemana : [],
    dataInicio: r.dataInicio || '',
    dataFim: r.dataFim || '',
    status: (r.status || 'ATIVA').toUpperCase(),
    avulsa: !!r.avulsa,
    solicId: r.solicId ?? null,
    reservadoPorId: r.reservadoPorId ?? null
  };
}

function normalizeChave(c) {
  if (!c) return null;
  return {
    id: c.id,
    codigo: c.codigo || '',
    salaId: c.salaId ?? c.sala?.id ?? null,
    unidadeId: c.unidadeId ?? c.sala?.unidade?.id ?? null,
    andar: c.andar || '',
    status: c.status || 'disponivel',
    instrutorId: c.instrutorId ?? c.instrutor?.id ?? null,
    pegaEm: c.pegaEm || null
  };
}

function normalizeNotificacao(n) {
  if (!n) return null;
  return {
    id: n.id,
    mensagem: n.mensagem || '',
    paraPerfil: lowerPerfil(n.paraPerfil),
    paraId: n.paraId ?? n.paraUsuarioId ?? null,
    unidadeId: n.unidadeId ?? null,
    lida: !!n.lida,
    criadaEm: n.criadaEm || null
  };
}

function normalizeSolicitacao(s) {
  if (!s) return null;
  const sala = s.sala || null;
  const instrutor = s.instrutor || null;
  return {
    id: s.id,
    instrutorId: s.instrutorId ?? instrutor?.id ?? null,
    salaId: s.salaId ?? sala?.id ?? null,
    unidadeId: s.unidadeId ?? instrutor?.unidade?.id ?? sala?.unidade?.id ?? null,
    data: s.data || '',
    turno: s.turno || '',
    motivo: s.motivo || '',
    status: lowerPerfil(s.status || 'pendente'),
    coordenadorRespostaId: s.coordenadorRespostaId ?? s.coordenadorResposta?.id ?? null
  };
}

function sortById(list) {
  return [...list].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
}

function upsert(cacheKey, item) {
  const list = CACHE[cacheKey];
  const idx = list.findIndex(x => String(x.id) === String(item.id));
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  CACHE[cacheKey] = sortById(list);
  return item;
}

function removeById(cacheKey, id) {
  CACHE[cacheKey] = CACHE[cacheKey].filter(x => String(x.id) !== String(id));
}

async function loadAllData(force = false) {
  if (CACHE.loaded && !force) return CACHE;
  if (CACHE.loadingPromise && !force) return CACHE.loadingPromise;

  CACHE.loadingPromise = Promise.all([
    apiRequest('/usuarios').then(r => { CACHE.usuarios = sortById((r || []).map(normalizeUsuario)); }).catch(() => { CACHE.usuarios = []; }),
    apiRequest('/unidades').then(r => { CACHE.unidades = sortById((r || []).map(normalizeUnidade)); }).catch(() => { CACHE.unidades = []; }),
    apiRequest('/salas').then(r => { CACHE.salas = sortById((r || []).map(normalizeSala)); }).catch(() => { CACHE.salas = []; }),
    apiRequest('/turmas').then(r => { CACHE.turmas = sortById((r || []).map(normalizeTurma)); }).catch(() => { CACHE.turmas = []; }),
    apiRequest('/reservas').then(r => { CACHE.reservas = sortById((r || []).map(normalizeReserva)); }).catch(() => { CACHE.reservas = []; }),
    apiRequest('/chaves').then(r => { CACHE.chaves = sortById((r || []).map(normalizeChave)); }).catch(() => { CACHE.chaves = []; }),
    apiRequest('/notificacoes').then(r => { CACHE.notificacoes = sortById((r || []).map(normalizeNotificacao)); }).catch(() => { CACHE.notificacoes = []; }),
    apiRequest('/solicitacoes').then(r => { CACHE.solicitacoes = sortById((r || []).map(normalizeSolicitacao)); }).catch(() => { CACHE.solicitacoes = []; })
  ]).then(() => {
    CACHE.loaded = true;
    CACHE.loadingPromise = null;
    return CACHE;
  }).catch((err) => {
    CACHE.loadingPromise = null;
    throw err;
  });

  return CACHE.loadingPromise;
}

async function initDados(force = false) {
  await loadAllData(force);
  console.log('%c✅ Dados carregados da API e cache local sincronizado', 'color:#10b981;font-weight:bold');
  return CACHE;
}

function getUsuarios() { return [...CACHE.usuarios]; }
function getUsuarioById(id) { return CACHE.usuarios.find(u => String(u.id) === String(id)) || null; }
function getUserById(id) { return getUsuarioById(id); }
function getUsersByPerfil(perfil) { return CACHE.usuarios.filter(u => u.perfil === lowerPerfil(perfil)); }
function getUsuariosByPerfil(perfil) { return getUsersByPerfil(perfil); }

function getUnidades() { return [...CACHE.unidades]; }
function getUnidadeById(id) { return CACHE.unidades.find(u => String(u.id) === String(id)) || null; }

function getSalas() { return [...CACHE.salas]; }
function getSalaById(id) { return CACHE.salas.find(s => String(s.id) === String(id)) || null; }
function getSalasByUnidade(uid) { return CACHE.salas.filter(s => String(s.unidadeId) === String(uid)); }

function getTurmas() { return [...CACHE.turmas]; }
function getTurmaById(id) { return CACHE.turmas.find(t => String(t.id) === String(id)) || null; }

function getReservas() { return [...CACHE.reservas]; }
function getReservaById(id) { return CACHE.reservas.find(r => String(r.id) === String(id)) || null; }

function getChaves() { return [...CACHE.chaves]; }
function getChaveById(id) { return CACHE.chaves.find(c => String(c.id) === String(id)) || null; }

function getNotifs() { return [...CACHE.notificacoes]; }
function getNotifsPara(perfil, unidadeId) {
  const sess = getSessao();
  const perfilNorm = lowerPerfil(perfil);
  return CACHE.notificacoes.filter(n => {
    if (n.paraId && sess && String(n.paraId) === String(sess.id)) return true;
    if (n.paraPerfil && n.paraPerfil === perfilNorm) {
      return !n.unidadeId || !unidadeId || String(n.unidadeId) === String(unidadeId);
    }
    if (!n.paraId && !n.paraPerfil) return true;
    return false;
  });
}

function getSolics() { return [...CACHE.solicitacoes]; }

async function loginUser(email, senha) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha })
  });
  const user = normalizeUsuario(data);
  if (user) upsert('usuarios', user);
  return user;
}

async function addUser(usuario) {
  const payload = {
    nome: usuario.nome,
    email: usuario.email,
    senha: usuario.senha || '123456',
    perfil: String(usuario.perfil || '').toUpperCase(),
    unidade: usuario.unidadeId ? { id: Number(usuario.unidadeId) } : null
  };
  const created = normalizeUsuario(apiRequestSync('/usuarios', { method: 'POST', body: JSON.stringify(payload) }));
  return upsert('usuarios', created);
}
async function addUsuario(usuario) { return addUser(usuario); }

async function updUser(id, dados) {
  const atual = getUsuarioById(id) || {};
  const payload = {
    nome: dados.nome ?? atual.nome,
    email: dados.email ?? atual.email,
    senha: dados.senha ?? atual.senha ?? '123456',
    perfil: String(dados.perfil ?? atual.perfil ?? '').toUpperCase(),
    unidade: (dados.unidadeId ?? atual.unidadeId) ? { id: Number(dados.unidadeId ?? atual.unidadeId) } : null
  };
  const updated = normalizeUsuario(apiRequestSync(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  if (dados.senha) {
    apiRequestSync(`/usuarios/${id}/reset-senha`, { method: 'PUT', body: JSON.stringify(dados.senha) });
    updated.senha = dados.senha;
  }
  return upsert('usuarios', updated);
}
async function updUsuario(id, dados) { return updUser(id, dados); }

function delUser(id) { apiRequestSync(`/usuarios/${id}`, { method: 'DELETE' }); removeById('usuarios', id); }
async function delUsuario(id) { return delUser(id); }

function addUnidade(unidade) {
  const created = normalizeUnidade(apiRequestSync('/unidades', { method: 'POST', body: JSON.stringify(unidade) }));
  return upsert('unidades', created);
}
function updUnidade(id, dados) {
  const updated = normalizeUnidade(apiRequestSync(`/unidades/${id}`, { method: 'PUT', body: JSON.stringify(dados) }));
  return upsert('unidades', updated);
}
function delUnidade(id) { apiRequestSync(`/unidades/${id}`, { method: 'DELETE' }); removeById('unidades', id); }

function addSala(sala) {
  const payload = {
    nome: sala.nome,
    capacidade: Number(sala.capacidade || 0),
    tipo: sala.tipo || '',
    andar: sala.andar || '',
    bloco: sala.bloco || '',
    turnosDisponiveis: sala.turnosDisponiveis || sala.turnos || [],
    unidade: sala.unidadeId ? { id: Number(sala.unidadeId) } : null,
    statusManual: sala.statusManual || null,
    motivoManual: sala.motivoManual || '',
    manualPor: sala.manualPor || '',
    manualCriadaEm: sala.manualCriadaEm || null
  };
  const created = normalizeSala(apiRequestSync('/salas', { method: 'POST', body: JSON.stringify(payload) }));
  return upsert('salas', created);
}
function updSala(id, dados) {
  const atual = getSalaById(id) || {};
  const payload = {
    nome: dados.nome ?? atual.nome,
    capacidade: Number(dados.capacidade ?? atual.capacidade ?? 0),
    tipo: dados.tipo ?? atual.tipo ?? '',
    andar: dados.andar ?? atual.andar ?? '',
    bloco: dados.bloco ?? atual.bloco ?? '',
    turnosDisponiveis: dados.turnosDisponiveis || dados.turnos || atual.turnosDisponiveis || [],
    unidade: (dados.unidadeId ?? atual.unidadeId) ? { id: Number(dados.unidadeId ?? atual.unidadeId) } : null,
    statusManual: dados.statusManual ?? atual.statusManual ?? null,
    motivoManual: dados.motivoManual ?? atual.motivoManual ?? '',
    manualPor: dados.manualPor ?? atual.manualPor ?? '',
    manualCriadaEm: dados.manualCriadaEm ?? atual.manualCriadaEm ?? null
  };
  const updated = normalizeSala(apiRequestSync(`/salas/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  return upsert('salas', updated);
}
function updateSala(id, dados) { return updSala(id, dados); }
function delSala(id) { apiRequestSync(`/salas/${id}`, { method: 'DELETE' }); removeById('salas', id); }
function deleteSala(id) { return delSala(id); }

function addTurma(turma) {
  const payload = {
    codigo: turma.codigo || turma.nome,
    curso: turma.curso,
    turno: turma.turno,
    dataInicio: turma.dataInicio,
    dataFim: turma.dataFim,
    instrutor: turma.instrutorId ? { id: Number(turma.instrutorId) } : null,
    unidade: turma.unidadeId ? { id: Number(turma.unidadeId) } : null
  };
  const created = normalizeTurma(apiRequestSync('/turmas', { method: 'POST', body: JSON.stringify(payload) }));
  return upsert('turmas', created);
}
function updTurma(id, dados) {
  const atual = getTurmaById(id) || {};
  const payload = {
    codigo: dados.codigo || dados.nome || atual.codigo || atual.nome,
    curso: dados.curso ?? atual.curso,
    turno: dados.turno ?? atual.turno,
    dataInicio: dados.dataInicio ?? atual.dataInicio,
    dataFim: dados.dataFim ?? atual.dataFim,
    instrutor: (dados.instrutorId ?? atual.instrutorId) ? { id: Number(dados.instrutorId ?? atual.instrutorId) } : null,
    unidade: (dados.unidadeId ?? atual.unidadeId) ? { id: Number(dados.unidadeId ?? atual.unidadeId) } : null
  };
  const updated = normalizeTurma(apiRequestSync(`/turmas/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  return upsert('turmas', updated);
}
function updateTurma(id, dados) { return updTurma(id, dados); }
function delTurma(id) { apiRequestSync(`/turmas/${id}`, { method: 'DELETE' }); removeById('turmas', id); }
function deleteTurma(id) { return delTurma(id); }

function addReserva(reserva) {
  const payload = {
    sala: { id: Number(reserva.salaId) },
    turma: { id: Number(reserva.turmaId) },
    turno: reserva.turno,
    diasSemana: reserva.diasSemana || [],
    dataInicio: reserva.dataInicio,
    dataFim: reserva.dataFim,
    status: reserva.status || 'ATIVA'
  };
  const created = normalizeReserva(apiRequestSync('/reservas', { method: 'POST', body: JSON.stringify(payload) }));
  return upsert('reservas', created);
}
function updReserva(id, dados) {
  const atual = getReservaById(id) || {};
  const payload = {
    sala: { id: Number(dados.salaId ?? atual.salaId) },
    turma: { id: Number(dados.turmaId ?? atual.turmaId) },
    turno: dados.turno ?? atual.turno,
    diasSemana: dados.diasSemana || atual.diasSemana || [],
    dataInicio: dados.dataInicio ?? atual.dataInicio,
    dataFim: dados.dataFim ?? atual.dataFim,
    status: dados.status ?? atual.status ?? 'ATIVA'
  };
  const updated = normalizeReserva(apiRequestSync(`/reservas/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  return upsert('reservas', updated);
}
function delReserva(id) { apiRequestSync(`/reservas/${id}`, { method: 'DELETE' }); removeById('reservas', id); }
function deleteReserva(id) { return delReserva(id); }

function addChave(chave) {
  const payload = {
    codigo: chave.codigo,
    sala: { id: Number(chave.salaId) },
    andar: chave.andar || '',
    status: chave.status || 'disponivel'
  };
  const created = normalizeChave(apiRequestSync('/chaves', { method: 'POST', body: JSON.stringify(payload) }));
  return upsert('chaves', created);
}
function updChave(id, dados) {
  const atual = getChaveById(id) || {};
  const payload = {
    codigo: dados.codigo ?? atual.codigo,
    sala: { id: Number(dados.salaId ?? atual.salaId) },
    andar: dados.andar ?? atual.andar ?? '',
    status: dados.status ?? atual.status ?? 'disponivel'
  };
  const updated = normalizeChave(apiRequestSync(`/chaves/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
  return upsert('chaves', updated);
}
function delChave(id) { apiRequestSync(`/chaves/${id}`, { method: 'DELETE' }); removeById('chaves', id); }
function deleteChave(id) { return delChave(id); }
function retirarChave(id, instrutorId) {
  const updated = normalizeChave(apiRequestSync(`/chaves/${id}/retirar`, { method: 'POST', body: JSON.stringify(Number(instrutorId)) }));
  return upsert('chaves', updated);
}
function devolverChaveApi(id) {
  const updated = normalizeChave(apiRequestSync(`/chaves/${id}/devolver`, { method: 'POST' }));
  return upsert('chaves', updated);
}

function addSolic(dados) {
  const payload = {
    instrutor: { id: Number(dados.instrutorId) },
    sala: dados.salaId ? { id: Number(dados.salaId) } : null,
    data: dados.data,
    turno: dados.turno,
    motivo: dados.motivo || '',
    status: dados.status || 'pendente'
  };
  const created = normalizeSolicitacao(apiRequestSync('/solicitacoes', { method: 'POST', body: JSON.stringify(payload) }));
  return upsert('solicitacoes', created);
}
function updSolic(id, dados) {
  const acao = lowerPerfil(dados.status) === 'aprovada' ? 'aprovar' : 'recusar';
  const updated = normalizeSolicitacao(apiRequestSync(`/solicitacoes/${id}/${acao}`, { method: 'PUT' }));
  return upsert('solicitacoes', updated);
}

function addNotif(dados) {
  const paraPerfil = lowerPerfil(dados.paraPerfil || dados.para || '');
  const mensagem = dados.mensagem || dados.msg || [dados.titulo, dados.texto].filter(Boolean).join(' - ');
  const payload = {
    mensagem,
    paraPerfil,
    paraUsuarioId: paraPerfil === 'instrutor' && dados.paraId ? Number(dados.paraId) : (dados.paraUsuarioId || null),
    unidadeId: dados.unidadeId || (paraPerfil !== 'instrutor' && dados.paraId ? Number(dados.paraId) : null),
    lida: false
  };

  const created = normalizeNotificacao(apiRequestSync('/notificacoes', {
    method: 'POST',
    body: JSON.stringify(payload)
  }));
  return upsert('notificacoes', created);
}

function getSessao() {
  const sess = localStorage.getItem('sn_v6_sessao');
  return sess ? JSON.parse(sess) : null;
}
function setSessao(user) {
  localStorage.setItem('sn_v6_sessao', JSON.stringify(user));
}
function clearSessao() {
  localStorage.removeItem('sn_v6_sessao');
}

function newId() { return Date.now() + Math.floor(Math.random() * 9999); }
function hojeISO() { return new Date().toISOString().split('T')[0]; }
function fmtData(iso) {
  if (!iso) return '—';
  const p = String(iso).split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : String(iso);
}
function formatDate(iso) { return fmtData(iso); }
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escapeHtml(s) { return esc(s); }


function iniciais(nome) {
  return String(nome || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('') || 'SN';
}

function getTema() {
  return localStorage.getItem('sn_v6_tema') || 'light';
}

function initTema() {
  const tema = getTema();
  document.documentElement.setAttribute('data-theme', tema);
  return tema;
}

function toggleTema() {
  const atual = document.documentElement.getAttribute('data-theme') || getTema();
  const proximo = atual === 'dark' ? 'light' : 'dark';
  localStorage.setItem('sn_v6_tema', proximo);
  document.documentElement.setAttribute('data-theme', proximo);
  return proximo;
}

window.getUsuarios = getUsuarios;
window.getUsuarioById = getUsuarioById;
window.getUserById = getUserById;
window.getUsersByPerfil = getUsersByPerfil;
window.getUsuariosByPerfil = getUsuariosByPerfil;
window.addUser = addUser;
window.addUsuario = addUsuario;
window.updUser = updUser;
window.updUsuario = updUsuario;
window.delUser = delUser;
window.delUsuario = delUsuario;

window.getUnidades = getUnidades;
window.getUnidadeById = getUnidadeById;
window.addUnidade = addUnidade;
window.updUnidade = updUnidade;
window.delUnidade = delUnidade;

window.getSalas = getSalas;
window.getSalaById = getSalaById;
window.getSalasByUnidade = getSalasByUnidade;
window.addSala = addSala;
window.updSala = updSala;
window.updateSala = updateSala;
window.delSala = delSala;
window.deleteSala = deleteSala;

window.getTurmas = getTurmas;
window.getTurmaById = getTurmaById;
window.addTurma = addTurma;
window.updTurma = updTurma;
window.updateTurma = updateTurma;
window.delTurma = delTurma;
window.deleteTurma = deleteTurma;

window.getReservas = getReservas;
window.getReservaById = getReservaById;
window.addReserva = addReserva;
window.updReserva = updReserva;
window.delReserva = delReserva;
window.deleteReserva = deleteReserva;

window.getChaves = getChaves;
window.getChaveById = getChaveById;
window.addChave = addChave;
window.updChave = updChave;
window.delChave = delChave;
window.deleteChave = deleteChave;
window.retirarChave = retirarChave;
window.devolverChaveApi = devolverChaveApi;

window.getNotifs = getNotifs;
window.getNotifsPara = getNotifsPara;
window.addNotif = addNotif;
window.getSolics = getSolics;
window.addSolic = addSolic;
window.updSolic = updSolic;



/* ================= Compatibilidade entre telas ================= */
function ensureToastContainer() {
  let box = document.getElementById('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    document.body.appendChild(box);
  }
  return box;
}

function toast(msg, tipo) {
  tipo = tipo || 'info';
  const box = ensureToastContainer();
  const el = document.createElement('div');
  el.className = 'toast ' + tipo;
  el.textContent = String(msg || '');
  box.appendChild(el);
  setTimeout(() => { el.remove(); }, 3200);
  return el;
}
function showToast(msg, tipo) { return toast(msg, tipo === 'success' ? 'ok' : tipo); }

function fmsg(id, tipo, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const css = tipo === 'success' ? 'ok' : (tipo === 'warning' ? 'aviso' : (tipo || 'erro'));
  el.className = (el.className || '').replace(/(erro|ok|aviso|error|warning|success)/g, '').trim();
  el.classList.add('fmsg', css);
  el.textContent = String(msg || '');
  el.style.display = 'block';
}
function fmsgHide(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
  el.className = (el.className || '').replace(/(erro|ok|aviso|error|warning|success)/g, '').trim();
  if (!el.classList.contains('fmsg')) el.classList.add('fmsg');
}
function showMsg(id, tipo, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const map = { erro: 'error', ok: 'success', aviso: 'warning', warning: 'warning', success: 'success', error: 'error' };
  const css = map[tipo] || 'error';
  el.className = 'form-msg ' + css;
  el.textContent = String(msg || '');
  el.style.display = 'block';
}
function hideMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'form-msg';
  el.textContent = '';
  el.style.display = 'none';
}

function modalAbrir(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'flex';
  el.classList.add('on');
}
function modalFechar(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  el.classList.remove('on');
}

function calcStatus(turma) {
  if (!turma) return 'encerrada';
  const hoje = hojeISO();
  if (turma.dataFim && hoje > turma.dataFim) return 'encerrada';
  if (turma.dataInicio && hoje < turma.dataInicio) return 'posterior';
  if (turma.dataInicio) {
    const diff = Math.ceil((new Date(turma.dataInicio + 'T00:00:00') - new Date(hoje + 'T00:00:00')) / 86400000);
    if (diff >= 0 && diff <= 7) return 'iminente';
  }
  return 'ativa';
}
function labelStatus(st) {
  return { ativa: 'Ativa', iminente: 'Iminente', posterior: 'Posterior', encerrada: 'Encerrada', ocupada: 'Ocupada', livre: 'Livre' }[st] || String(st || '');
}
function htmlStatus(turma) {
  const st = calcStatus(turma);
  return '<span class="st st-' + esc(st) + '">' + esc(labelStatus(st)) + '</span>';
}
function fmtDateTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return dd + '/' + mm + '/' + yy + ' ' + hh + ':' + mi;
}

function getOverride(salaId, unidadeId) {
  const sala = getSalaById(salaId);
  if (!sala || !sala.statusManual) return null;
  if (unidadeId && sala.unidadeId && String(sala.unidadeId) !== String(unidadeId)) return null;
  return {
    status: sala.statusManual,
    motivo: sala.motivoManual || '',
    por: sala.manualPor || '',
    criadaEm: sala.manualCriadaEm || null
  };
}
function setOverride(salaId, unidadeId, status, motivo, por) {
  const criadaEm = status ? new Date().toISOString().slice(0, 19) : null;
  return updSala(salaId, {
    statusManual: status || null,
    motivoManual: status ? (motivo || '') : '',
    manualPor: status ? (por || '') : '',
    manualCriadaEm: criadaEm,
    unidadeId: unidadeId || undefined
  });
}

function countNaoLidas(perfil, unidadeId) {
  return getNotifsPara(perfil, unidadeId).filter(n => !n.lida).length;
}
function marcarTodasLidas(perfil, unidadeId) {
  getNotifsPara(perfil, unidadeId).forEach(n => {
    if (n.lida) return;
    try {
      apiRequestSync(`/notificacoes/${n.id}/lida`, { method: 'PUT' });
      n.lida = true;
    } catch (err) {
      console.warn('Falha ao marcar notificacao como lida', err);
    }
  });
}

function resetarTodosDados() {
  CACHE.usuarios = [];
  CACHE.unidades = [];
  CACHE.salas = [];
  CACHE.turmas = [];
  CACHE.reservas = [];
  CACHE.chaves = [];
  CACHE.notificacoes = [];
  CACHE.solicitacoes = [];
  CACHE.loaded = false;
  clearSessao();
  toast('Dados locais limpos. Recarregando…', 'aviso');
  setTimeout(() => window.location.reload(), 500);
}

window.loginUser = loginUser;
window.iniciais = iniciais;
window.getTema = getTema;
window.initTema = initTema;
window.toggleTema = toggleTema;
window.getSessao = getSessao;
window.setSessao = setSessao;
window.clearSessao = clearSessao;
window.initDados = initDados;
window.loadAllData = loadAllData;

window.newId = newId;
window.hojeISO = hojeISO;
window.fmtData = fmtData;
window.formatDate = formatDate;
window.esc = esc;
window.escapeHtml = escapeHtml;


window.toast = toast;
window.showToast = showToast;
window.fmsg = fmsg;
window.fmsgHide = fmsgHide;
window.showMsg = showMsg;
window.hideMsg = hideMsg;
window.modalAbrir = modalAbrir;
window.modalFechar = modalFechar;
window.calcStatus = calcStatus;
window.labelStatus = labelStatus;
window.htmlStatus = htmlStatus;
window.fmtDateTime = fmtDateTime;
window.getOverride = getOverride;
window.setOverride = setOverride;
window.countNaoLidas = countNaoLidas;
window.marcarTodasLidas = marcarTodasLidas;
window.resetarTodosDados = resetarTodosDados;

console.log('%c✅ api.js carregado com sucesso', 'color:#10b981;font-weight:bold');
