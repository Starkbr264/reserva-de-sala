/* ============================================================
   js/turmas.js — CRUD completo de Turmas
   Depende de: storage.js
   Chamado em: dashboard.html (seção #section-turmas)
   ============================================================ */

let _turmaEditId = null;

/* ---- Inicialização da seção ---- */
function initTurmas() {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('turmaInicio').min = hoje;

  // Quando início muda, atualiza o mínimo do fim
  document.getElementById('turmaInicio').addEventListener('change', function() {
    document.getElementById('turmaFim').min = this.value;
  });

  document.getElementById('formTurma').addEventListener('submit', function(e) {
    e.preventDefault();
    salvarTurma();
  });

  renderTabelaTurmas();
}

/* ---- Coleta dados do formulário ---- */
function _getDadosTurma() {
  const nome      = document.getElementById('turmaNome').value.trim();
  const curso     = document.getElementById('turmaCurso').value.trim();
  const turno     = document.getElementById('turmaTurno').value;
  const dataInicio= document.getElementById('turmaInicio').value;
  const dataFim   = document.getElementById('turmaFim').value;

  let erros = [];
  if (!nome)       erros.push('Informe o nome da turma.');
  if (!curso)      erros.push('Informe o curso.');
  if (!dataInicio) erros.push('Informe a data de início.');
  if (!dataFim)    erros.push('Informe a data de fim.');
  if (dataInicio && dataFim && dataFim <= dataInicio)
                   erros.push('Data fim deve ser posterior ao início.');

  return { dados: { nome, curso, turno, dataInicio, dataFim }, erros };
}

/* ---- Salvar (criar ou editar) ---- */
function salvarTurma() {
  const msg = document.getElementById('msgTurma');
  const { dados, erros } = _getDadosTurma();

  if (erros.length > 0) {
    showMsg(msg, 'error', '❌ ' + erros.join(' '));
    return;
  }

  if (_turmaEditId) {
    updateTurma(_turmaEditId, dados);
    showToast('Turma atualizada com sucesso!', 'success');
    cancelarEdicaoTurma();
  } else {
    addTurma(dados);
    showToast('Turma cadastrada com sucesso!', 'success');
  }

  document.getElementById('formTurma').reset();
  msg.style.display = 'none';
  renderTabelaTurmas();
}

/* ---- Editar ---- */
function editarTurma(id) {
  const turma = getTurmas().find(t => t.id === id);
  if (!turma) return;

  _turmaEditId = id;

  document.getElementById('turmaNome').value    = turma.nome;
  document.getElementById('turmaCurso').value   = turma.curso;
  document.getElementById('turmaTurno').value   = turma.turno;
  document.getElementById('turmaInicio').value  = turma.dataInicio;
  document.getElementById('turmaFim').value     = turma.dataFim;

  document.getElementById('btnSalvarTurma').textContent = '💾 Atualizar Turma';
  document.getElementById('btnCancelarTurma').style.display = 'inline-flex';
  document.getElementById('turmaNome').focus();
  document.getElementById('section-turmas').scrollIntoView({ behavior: 'smooth' });
}

/* ---- Cancelar edição ---- */
function cancelarEdicaoTurma() {
  _turmaEditId = null;
  document.getElementById('formTurma').reset();
  document.getElementById('btnSalvarTurma').textContent = '+ Cadastrar Turma';
  document.getElementById('btnCancelarTurma').style.display = 'none';
  document.getElementById('msgTurma').style.display = 'none';
}

/* ---- Excluir ---- */
function excluirTurma(id) {
  const reservasVinculadas = getReservas().filter(r => r.turmaId === id && r.status === 'ATIVA');
  if (reservasVinculadas.length > 0) {
    showToast(`Não é possível excluir: turma tem ${reservasVinculadas.length} reserva(s) ativa(s).`, 'error');
    return;
  }
  if (!confirm('Excluir esta turma? Esta ação não pode ser desfeita.')) return;
  deleteTurma(id);
  showToast('Turma excluída.', 'warning');
  renderTabelaTurmas();
}

/* ---- Renderizar tabela ---- */
function renderTabelaTurmas() {
  const tbody = document.querySelector('#tabelaTurmas tbody');
  const hoje  = new Date().toISOString().split('T')[0];
  const turmas = getTurmas();

  if (turmas.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhuma turma cadastrada ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = turmas.map(t => {
    const encerrada = hoje > t.dataFim;
    return `
      <tr>
        <td><strong class="code-text">${escapeHtml(t.nome)}</strong></td>
        <td>${escapeHtml(t.curso)}</td>
        <td><span class="badge badge-primary">${t.turno}</span></td>
        <td>${formatDate(t.dataInicio)}</td>
        <td>${formatDate(t.dataFim)}</td>
        <td><span class="badge ${encerrada ? 'badge-danger' : 'badge-success'}">${encerrada ? 'ENCERRADA' : 'ATIVA'}</span></td>
        <td>
          <button class="btn btn-warning-sm" onclick="editarTurma(${t.id})">✏️ Editar</button>
          <button class="btn btn-danger-sm"  onclick="excluirTurma(${t.id})">🗑️ Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

/* ── PESQUISA TURMAS (dashboard) ── */
var _cfgTurmasDash = {
  busca:{id:'buscarTurmaD', placeholder:'Pesquisar por código, curso…'},
  filtros:[
    {id:'filtTurnoTD', label:'Turno',  campo:'turno',   opcoes:[{value:'Matutino',label:'Matutino'},{value:'Vespertino',label:'Vespertino'},{value:'Noturno',label:'Noturno'}]},
    {id:'filtStatusTD',label:'Status', campo:'_status', opcoes:[{value:'ativa',label:'Ativa'},{value:'iminente',label:'Iminente'},{value:'posterior',label:'Posterior'},{value:'encerrada',label:'Encerrada'}]},
  ]
};

var _renderTabelaTurmasOrig = renderTabelaTurmas;
renderTabelaTurmas = function() {
  var cont = document.getElementById('searchTurmasDash');
  if (cont && !cont.innerHTML) {
    montarBarraPesquisaFiltros('searchTurmasDash', _cfgTurmasDash, _renderTabelaTurmasFiltrada);
  }
  _renderTabelaTurmasFiltrada();
};

function _renderTabelaTurmasFiltrada() {
  var vals = lerFiltros(_cfgTurmasDash);
  var hoje = new Date().toISOString().split('T')[0];
  var turmas = getTurmas().map(function(t){return Object.assign({},t,{_status:calcStatus(t)});});
  turmas = filtrarLista(turmas, vals._busca, ['nome','curso']);
  if (vals.turno)      turmas = turmas.filter(function(t){return t.turno===vals.turno;});
  if (vals['_status']) turmas = turmas.filter(function(t){return t._status===vals['_status'];});
  var cnt = document.getElementById('countTurmasDash'); if(cnt) cnt.textContent = turmas.length+' turma(s)';
  const tbody = document.querySelector('#tabelaTurmas tbody');
  if (turmas.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Nenhuma turma encontrada.</td></tr>';
    return;
  }
  tbody.innerHTML = turmas.map(t => {
    const encerrada = hoje > t.dataFim;
    return `
      <tr>
        <td><strong class="code-text">${escapeHtml(t.nome)}</strong></td>
        <td>${escapeHtml(t.curso)}</td>
        <td><span class="badge badge-primary">${t.turno}</span></td>
        <td>${formatDate(t.dataInicio)}</td>
        <td>${formatDate(t.dataFim)}</td>
        <td><span class="badge ${encerrada ? 'badge-danger' : 'badge-success'}">${encerrada ? 'ENCERRADA' : 'ATIVA'}</span></td>
        <td>
          <button class="btn btn-warning-sm" onclick="editarTurma(${t.id})">✏️ Editar</button>
          <button class="btn btn-danger-sm"  onclick="excluirTurma(${t.id})">🗑️ Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}
