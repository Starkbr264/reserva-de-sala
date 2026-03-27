var _sess;
var _editSalaId = null, _editTurmaId = null;
var _DIAS = [{v:'seg',l:'SEG'},{v:'ter',l:'TER'},{v:'qua',l:'QUA'},{v:'qui',l:'QUI'},{v:'sex',l:'SEX'},{v:'sab',l:'SÁB'}];
var _TURNOS = ['Matutino','Vespertino','Noturno'];

window.addEventListener('DOMContentLoaded', function() {
  initDados(); requirePerfil('coordenador'); _sess = getSessao();
  initSidebar(); initLogo();
  ir('dashboard');
  _atualizarBadges();
});

/* NAV */
function ir(aba) {
  document.querySelectorAll('.pg').forEach(function(p){ p.classList.remove('ativa'); p.style.display='none'; });
  var pg = document.getElementById('pg-'+aba); if(pg){pg.classList.add('ativa');pg.style.display='block';}
  document.querySelectorAll('.sb-btn').forEach(function(b){ b.classList.remove('ativo'); });
  var btn = document.getElementById('nav-'+aba); if(btn) btn.classList.add('ativo');
  var meta = {
    dashboard:{t:'Dashboard',s:'Visão geral da unidade'},
    salas:{t:'Salas',s:'Cadastre e gerencie as salas'},
    turmas:{t:'Turmas',s:'Cadastre e gerencie turmas'},
    reservas:{t:'Reservas',s:'Reservas recorrentes de salas'},
    instrutores:{t:'Instrutores',s:'Instrutores desta unidade'},
    mapa:{t:'Mapa de Salas',s:'Ocupação atual das salas'},
    solicitacoes:{t:'Solicitações',s:'Pedidos de sala dos instrutores'},
    notifs:{t:'Notificações',s:'Avisos recebidos'},
  };
  var m = meta[aba]||{};
  document.getElementById('tbTitle').textContent = m.t||aba;
  document.getElementById('tbSub').textContent   = m.s||'';
  if(aba==='dashboard')   rdDash();
  if(aba==='salas')       rdSalas();
  if(aba==='turmas')      rdTurmas();
  if(aba==='reservas')    rdReservas();
  if(aba==='instrutores') rdInstrutores();
  if(aba==='mapa'){_popularFiltrosMapa();rdMapa();}
  if(aba==='solicitacoes') rdSolics();
  if(aba==='notifs')      rdNotifs();
}

function _uid() { return _sess ? _sess.unidadeId : null; }

/* DASHBOARD */
function rdDash() {
  var salas = getSalasByUnidade(_uid());
  var turmas= getTurmas().filter(function(t){return t.unidadeId===_uid();});
  var res   = getReservas().filter(function(r){return r.unidadeId===_uid();});
  var solic = getSolics().filter(function(s){return s.unidadeId===_uid()&&s.status==='pendente';});
  _tx('stSalas', salas.length);
  _tx('stTurmas', turmas.filter(function(t){return calcStatus(t)==='ativa';}).length);
  _tx('stRes',    res.length);
  _tx('stSol',    solic.length);
  var tb = document.getElementById('tbDash');
  var rec = turmas.slice().sort(function(a,b){return b.id-a.id;}).slice(0,6);
  if(!rec.length){tb.innerHTML='<tr class="empty-row"><td colspan="5">Nenhuma turma cadastrada.</td></tr>';return;}
  tb.innerHTML = rec.map(function(t){
    var inst = t.instrutorId ? getUserById(t.instrutorId) : null;
    return '<tr>'+'<td class="mono"><strong>'+esc(t.nome)+'</strong></td>'
      +'<td>'+esc(t.curso)+'</td>'+'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(t.dataInicio)+' → '+fmtData(t.dataFim)+'</td></tr>';
  }).join('');
}

/* SALAS */
function rdSalas() {
  var list = getSalasByUnidade(_uid()); var tb = document.getElementById('tbSalas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="5">Nenhuma sala cadastrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(s){
    var turnos = (s.turnos||[]).map(function(t){return '<span class="bdg bdg-primary">'+t+'</span>';}).join(' ');
    return '<tr><td><strong>'+esc(s.nome)+'</strong></td><td>'+s.capacidade+' pessoas</td>'
      +'<td>'+esc(s.tipo)+'</td><td>'+turnos+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirSala('+s.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirSala('+s.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}
function abrirSala(id) {
  _editSalaId = id||null; var s = id?getSalaById(id):null;
  _tx('mSTit', id?'Editar Sala':'Nova Sala');
  _vl('mSNome', s?s.nome:''); _vl('mSCap', s?s.capacidade:''); _vl('mSTipo', s?s.tipo:'');
  _vl('mSAndar', s?(s.andar||''):'');
  _vl('mSBloco', s?(s.bloco||''):'');
  var cont = document.getElementById('mSTurnos'); cont.innerHTML='';
  _TURNOS.forEach(function(t){
    var c=document.createElement('div'); c.className='chip'+(s&&(s.turnos||[]).includes(t)?' ativo':'');
    c.dataset.v=t; c.textContent=t;
    c.onclick=function(){this.classList.toggle('ativo');};
    cont.appendChild(c);
  });
  fmsgHide('mSMsg'); modalAbrir('modalSala');
}
function salvarSala() {
  var nome=_gv('mSNome').trim(), cap=parseInt(_gv('mSCap')), tipo=_gv('mSTipo').trim();
  var andar=_gv('mSAndar').trim(), bloco=_gv('mSBloco').trim();
  var turnos=[].slice.call(document.querySelectorAll('#mSTurnos .chip.ativo')).map(function(c){return c.dataset.v;});
  if(!nome||!cap||!tipo){fmsg('mSMsg','erro','Preencha nome, capacidade e tipo.');return;}
  var dados={nome:nome,capacidade:cap,tipo:tipo,andar:andar,bloco:bloco,turnos:turnos,turnosDisponiveis:turnos,unidadeId:_uid()};
  if(_editSalaId){updSala(_editSalaId,dados);toast('Sala atualizada!','ok');}
  else{addSala(dados);toast('Sala cadastrada!','ok');}
  modalFechar('modalSala'); rdSalas(); rdMapa();
}
function excluirSala(id){
  var s=getSalaById(id); if(!s)return;
  if(getReservas().filter(function(r){return r.salaId===id;}).length>0){toast('Sala tem reservas. Remova-as primeiro.','erro');return;}
  if(!confirm('Excluir "'+s.nome+'"?'))return;
  delSala(id); toast('Sala excluída.','aviso'); rdSalas();
}

/* TURMAS */
function rdTurmas() {
  var list=getTurmas().filter(function(t){return t.unidadeId===_uid();}); var tb=document.getElementById('tbTurmas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma turma cadastrada.</td></tr>';return;}
  tb.innerHTML=list.slice().sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);}).map(function(t){
    var inst=t.instrutorId?getUserById(t.instrutorId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td>'+fmtData(t.dataInicio)+'</td><td>'+fmtData(t.dataFim)+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirTurma('+t.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirTurma('+t.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}
function abrirTurma(id) {
  _editTurmaId=id||null; var t=id?getTurmaById(id):null;
  _tx('mTTit',id?'Editar Turma':'Nova Turma');
  _vl('mTCod',t?t.nome:''); _vl('mTCurso',t?t.curso:'');
  _vl('mTTurno',t?t.turno:'Matutino');
  _vl('mTIni',t?t.dataInicio:''); _vl('mTFim',t?t.dataFim:'');
  var sel=document.getElementById('mTInst'); sel.innerHTML='<option value="">— Sem instrutor —</option>';
  getUsersByPerfil('instrutor').filter(function(u){return u.unidadeId===_uid();}).forEach(function(u){
    var o=document.createElement('option'); o.value=u.id; o.textContent=u.nome;
    if(t&&t.instrutorId===u.id)o.selected=true; sel.appendChild(o);
  });
  fmsgHide('mTMsg'); modalAbrir('modalTurma');
}
function salvarTurma() {
  var nome=_gv('mTCod').trim(), curso=_gv('mTCurso').trim(), turno=_gv('mTTurno');
  var ini=_gv('mTIni'), fim=_gv('mTFim'), instId=parseInt(_gv('mTInst'))||null;
  if(!nome||!curso||!ini||!fim){fmsg('mTMsg','erro','Preencha todos os campos obrigatórios.');return;}
  if(fim<ini){fmsg('mTMsg','erro','Data fim deve ser posterior ao início.');return;}
  var dados={nome:nome,curso:curso,turno:turno,dataInicio:ini,dataFim:fim,instrutorId:instId,unidadeId:_uid()};
  if(_editTurmaId){updTurma(_editTurmaId,dados);toast('Turma atualizada!','ok');}
  else{addTurma(dados);toast('Turma cadastrada!','ok');}
  modalFechar('modalTurma'); rdTurmas();
}
function excluirTurma(id){
  var t=getTurmaById(id); if(!t)return;
  if(!confirm('Excluir turma "'+t.nome+'"?'))return;
  delTurma(id); getReservas().filter(function(r){return r.turmaId===id;}).forEach(function(r){delReserva(r.id);});
  toast('Turma excluída.','aviso'); rdTurmas();
}

/* RESERVAS */
function rdReservas() {
  var list=getReservas().filter(function(r){return r.unidadeId===_uid();}); var tb=document.getElementById('tbReservas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma reserva criada.</td></tr>';return;}
  tb.innerHTML=list.slice().sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);}).map(function(r){
    var sala=getSalaById(r.salaId), turma=getTurmaById(r.turmaId);
    var resPor=r.reservadoPorId?getUserById(r.reservadoPorId):null;
    var st=turma?calcStatus(turma):'encerrada';
    return '<tr><td><strong>'+esc(sala?sala.nome:'—')+'</strong></td>'
      +'<td class="mono">'+esc(turma?turma.nome:'—')+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(r.turno)+'</span></td>'
      +'<td style="font-size:.78rem">'+r.diasSemana.map(function(d){return d.toUpperCase();}).join(', ')+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+'</td>'
      +'<td>'+esc(resPor?resPor.nome:'—')+'</td>'
      +'<td><span class="st st-'+st+'">'+labelStatus(st)+'</span></td>'
      +'<td><button class="btn btn-danger btn-sm" onclick="excluirReserva('+r.id+')">Excluir</button></td></tr>';
  }).join('');
}
function abrirReserva() {
  var selS=document.getElementById('mRSala'); selS.innerHTML='<option value="">— Selecione a sala —</option>';
  getSalasByUnidade(_uid()).forEach(function(s){var o=document.createElement('option');o.value=s.id;o.textContent=s.nome+' ('+s.tipo+')';selS.appendChild(o);});
  var selT=document.getElementById('mRTurma'); selT.innerHTML='<option value="">— Selecione a turma —</option>';
  getTurmas().filter(function(t){return t.unidadeId===_uid()&&calcStatus(t)!=='encerrada';}).forEach(function(t){
    var o=document.createElement('option');o.value=t.id;o.textContent=t.nome+' — '+t.curso;
    o.dataset.ini=t.dataInicio;o.dataset.fim=t.dataFim;o.dataset.turno=t.turno;selT.appendChild(o);
  });
  selT.onchange=function(){var o=this.options[this.selectedIndex];if(o.dataset.ini){_vl('mRIni',o.dataset.ini);_vl('mRFim',o.dataset.fim);_vl('mRTurno',o.dataset.turno);}};
  var cont=document.getElementById('mRDias'); cont.innerHTML='';
  _DIAS.forEach(function(d){var c=document.createElement('div');c.className='chip';c.dataset.v=d.v;c.textContent=d.l;c.onclick=function(){this.classList.toggle('ativo');};cont.appendChild(c);});
  fmsgHide('mRMsg'); modalAbrir('modalRes');
}
function salvarReserva() {
  var salaId=parseInt(_gv('mRSala')), turmaId=parseInt(_gv('mRTurma'));
  var turno=_gv('mRTurno'), ini=_gv('mRIni'), fim=_gv('mRFim');
  var dias=[].slice.call(document.querySelectorAll('#mRDias .chip.ativo')).map(function(c){return c.dataset.v;});
  if(!salaId||!turmaId||!ini||!fim||!dias.length){fmsg('mRMsg','erro','Preencha todos os campos e selecione ao menos um dia.');return;}
  var turma=getTurmaById(turmaId);
  if(fim>turma.dataFim){fmsg('mRMsg','erro','Data fim ultrapassa o fim da turma ('+fmtData(turma.dataFim)+').');return;}
  var cf=checarConflito(salaId,turno,dias,ini,fim,null);
  if(cf){fmsg('mRMsg','erro',cf);return;}
  addReserva({salaId:salaId,turmaId:turmaId,turno:turno,diasSemana:dias,dataInicio:ini,dataFim:fim,reservadoPorId:_sess.id,unidadeId:_uid()});
  toast('Reserva criada!','ok'); modalFechar('modalRes'); rdReservas();
}
function excluirReserva(id){
  if(!confirm('Excluir esta reserva?'))return;
  delReserva(id); toast('Reserva excluída.','aviso'); rdReservas();
}

/* INSTRUTORES */
function rdInstrutores() {
  var list=getUsersByPerfil('instrutor').filter(function(u){return u.unidadeId===_uid();}); var tb=document.getElementById('tbInst');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="4">Nenhum instrutor nesta unidade.</td></tr>';return;}
  tb.innerHTML=list.map(function(u){
    var turmas=getTurmas().filter(function(t){return t.instrutorId===u.id&&t.unidadeId===_uid();});
    var tHtml=turmas.length?turmas.map(function(t){return '<span class="st st-'+calcStatus(t)+'" style="margin-right:4px">'+esc(t.nome)+'</span>';}).join(''):'<span class="txt3">Nenhuma</span>';
    return '<tr><td><strong>'+esc(u.nome)+'</strong></td><td class="mono">'+esc(u.email)+'</td>'
      +'<td>'+tHtml+'</td>'
      +'<td><button class="btn btn-ghost btn-sm" onclick="abrirAtrib('+u.id+')">Atribuir Turma</button></td></tr>';
  }).join('');
}
function abrirAtrib(instId) {
  document.getElementById('mAInstId').value=instId;
  var inst=getUserById(instId); _tx('mATit','Atribuir turma a '+(inst?inst.nome:'instrutor'));
  var sel=document.getElementById('mATurma'); sel.innerHTML='<option value="">— Selecione —</option>';
  getTurmas().filter(function(t){return t.unidadeId===_uid();}).forEach(function(t){
    var o=document.createElement('option');o.value=t.id;o.textContent=t.nome+' — '+t.curso;sel.appendChild(o);
  });
  modalAbrir('modalAtrib');
}
function salvarAtrib() {
  var instId=parseInt(document.getElementById('mAInstId').value), turmaId=parseInt(_gv('mATurma'));
  if(!turmaId){toast('Selecione uma turma.','aviso');return;}
  updTurma(turmaId,{instrutorId:instId}); toast('Turma atribuída!','ok'); modalFechar('modalAtrib'); rdInstrutores();
}

/* MAPA */
function _calcSalaStatus(s, hj) {
  var stat='livre', turnoAtivo='', instNome='', turmaNome='', reservaAtual=null;
  var rs=getReservas().filter(function(r){return r.salaId===s.id&&r.dataInicio<=hj&&r.dataFim>=hj;});
  for(var i=0;i<rs.length;i++){
    var r=rs[i]; var turma=getTurmaById(r.turmaId);
    var cst=turma?calcStatus(turma):'encerrada'; if(cst==='encerrada')continue;
    var p=hj.split('-').map(Number);
    var diaSem=['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];
    if(r.diasSemana.includes(diaSem)){
      stat=cst==='ativa'?'ocupada':'iminente';
      turnoAtivo=r.turno;
      turmaNome=turma?turma.nome:'—';
      var inst=turma&&turma.instrutorId?getUserById(turma.instrutorId):null;
      instNome=inst?inst.nome:''; reservaAtual=r; break;
    }
  }
  return {stat:stat,turnoAtivo:turnoAtivo,instNome:instNome,turmaNome:turmaNome,reserva:reservaAtual};
}

function _buildSalaCard(s, info) {
  var statusLabel = {livre:'Disponível', ocupada:'Ocupada agora', iminente:'Em breve'}[info.stat]||'Disponível';
  var statusIcon  = {livre:'🟢', ocupada:'🔴', iminente:'🟡'}[info.stat]||'🟢';
  var turnosHtml  = (s.turnos||s.turnosDisponiveis||[]).map(function(t){
    var cor = t===info.turnoAtivo ? 'mapa-turno ativo' : 'mapa-turno';
    return '<span class="'+cor+'">'+t[0]+'</span>';
  }).join('');

  return '<div class="sala-card-v2 '+info.stat+'">'
    +'<div class="sc-header">'
      +'<div class="sc-nome">'+esc(s.nome)+'</div>'
      +'<div class="sc-status-dot '+info.stat+'"></div>'
    +'</div>'
    +'<div class="sc-tipo">'+esc(s.tipo)+'</div>'
    +'<div class="sc-meta">'
      +'<div class="sc-meta-item" title="Andar"><span class="sc-meta-icon">🏢</span>'+esc(s.andar||'—')+'</div>'
      +'<div class="sc-meta-item" title="Bloco"><span class="sc-meta-icon">📍</span>'+esc(s.bloco||'—')+'</div>'
      +'<div class="sc-meta-item" title="Capacidade"><span class="sc-meta-icon">👥</span>'+s.capacidade+' pess.</div>'
    +'</div>'
    +'<div class="sc-turnos">'+turnosHtml+'</div>'
    +(info.stat!=='livre'
      ?'<div class="sc-ocupacao">'
        +'<div class="sc-turma">📚 '+esc(info.turmaNome)+'</div>'
        +(info.instNome?'<div class="sc-inst">👤 '+esc(info.instNome)+'</div>':'')
        +'<div class="sc-turno-ativo">⏰ '+esc(info.turnoAtivo)+'</div>'
        +'</div>'
      :'<div class="sc-livre-label">'+statusIcon+' '+statusLabel+'</div>'
    )
    +'</div>';
}

function rdMapa() {
  var salas=getSalasByUnidade(_uid()); var cont=document.getElementById('mapaSalas');
  if(!salas.length){cont.innerHTML='<p class="txt2">Nenhuma sala cadastrada. Vá em Salas para cadastrar.</p>';return;}
  var hj=hojeISO();

  // Filtros do mapa
  var filtTurno  = document.getElementById('mapaFiltTurno')  ? document.getElementById('mapaFiltTurno').value  : '';
  var filtBloco  = document.getElementById('mapaFiltBloco')  ? document.getElementById('mapaFiltBloco').value  : '';
  var filtAndar  = document.getElementById('mapaFiltAndar')  ? document.getElementById('mapaFiltAndar').value  : '';
  var filtStatus = document.getElementById('mapaFiltStatus') ? document.getElementById('mapaFiltStatus').value : '';
  var buscaNome  = document.getElementById('mapaBusca')      ? document.getElementById('mapaBusca').value.toLowerCase().trim() : '';

  var salasFiltradas = salas.filter(function(s){
    if(buscaNome && !s.nome.toLowerCase().includes(buscaNome) && !s.tipo.toLowerCase().includes(buscaNome)) return false;
    if(filtBloco && (s.bloco||'')!==filtBloco) return false;
    if(filtAndar && (s.andar||'')!==filtAndar) return false;
    if(filtTurno && !(s.turnos||s.turnosDisponiveis||[]).includes(filtTurno)) return false;
    return true;
  });

  var infoMap = {};
  salasFiltradas.forEach(function(s){ infoMap[s.id]=_calcSalaStatus(s,hj); });
  if(filtStatus) salasFiltradas=salasFiltradas.filter(function(s){return infoMap[s.id].stat===filtStatus;});

  // Atualiza contadores de legenda
  var total=salasFiltradas.length;
  var livres=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='livre';}).length;
  var ocupadas=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='ocupada';}).length;
  var iminentes=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='iminente';}).length;
  var legEl=document.getElementById('mapaLegenda');
  if(legEl) legEl.innerHTML='<span class="leg-item livre">🟢 Livre: '+livres+'</span>'
    +'<span class="leg-item ocupada">🔴 Ocupada: '+ocupadas+'</span>'
    +'<span class="leg-item iminente">🟡 Em breve: '+iminentes+'</span>'
    +'<span class="leg-total">Total: '+total+' sala(s)</span>';

  if(!salasFiltradas.length){
    cont.innerHTML='<p class="txt2" style="padding:24px">Nenhuma sala encontrada com esses filtros.</p>';return;
  }

  // Agrupar por bloco → andar
  var grupos = {};
  salasFiltradas.forEach(function(s){
    var bloco = s.bloco||'Sem Bloco';
    var andar = s.andar||'Sem Andar';
    if(!grupos[bloco]) grupos[bloco]={};
    if(!grupos[bloco][andar]) grupos[bloco][andar]=[];
    grupos[bloco][andar].push(s);
  });

  var html = '';
  Object.keys(grupos).sort().forEach(function(bloco){
    html += '<div class="mapa-bloco">';
    html += '<div class="mapa-bloco-titulo">📍 '+esc(bloco)+'</div>';
    Object.keys(grupos[bloco]).sort().forEach(function(andar){
      html += '<div class="mapa-andar">';
      html += '<div class="mapa-andar-titulo">🏢 '+esc(andar)+'</div>';
      html += '<div class="mapa-andar-grid">';
      grupos[bloco][andar].forEach(function(s){
        html += _buildSalaCard(s, infoMap[s.id]);
      });
      html += '</div></div>';
    });
    html += '</div>';
  });
  cont.innerHTML = html;
}

function _popularFiltrosMapa() {
  var salas = getSalasByUnidade(_uid());
  var blocos = [...new Set(salas.map(function(s){return s.bloco||'';}).filter(Boolean))].sort();
  var andares = [...new Set(salas.map(function(s){return s.andar||'';}).filter(Boolean))].sort();
  var selB = document.getElementById('mapaFiltBloco');
  var selA = document.getElementById('mapaFiltAndar');
  if(selB){ selB.innerHTML='<option value="">Todos os blocos</option>'+blocos.map(function(b){return'<option>'+esc(b)+'</option>';}).join(''); }
  if(selA){ selA.innerHTML='<option value="">Todos os andares</option>'+andares.map(function(a){return'<option>'+esc(a)+'</option>';}).join(''); }
}

/* SOLICITAÇÕES */
function rdSolics() {
  var list=getSolics().filter(function(s){return s.unidadeId===_uid();}); var cont=document.getElementById('listaSolics');
  if(!list.length){cont.innerHTML='<p class="txt2">Nenhuma solicitação.</p>';return;}
  cont.innerHTML=list.map(function(s){
    var sala=getSalaById(s.salaId), inst=getUserById(s.instrutorId);
    return '<div class="notif-item tipo-solicit">'
      +'<div class="ni-title">Solicitação — '+esc(inst?inst.nome:'Instrutor')+'</div>'
      +'<div class="ni-msg">Sala: <strong>'+esc(sala?sala.nome:'—')+'</strong> · '+fmtData(s.data)+' · '+esc(s.turno)+'</div>'
      +(s.motivo?'<div class="ni-msg">Motivo: '+esc(s.motivo)+'</div>':'')
      +'<div class="ni-time">'+fmtDateTime(s.criadaEm)+'</div>'
      +(s.status==='pendente'
        ?'<div style="display:flex;gap:8px;margin-top:10px">'
          +'<button class="btn btn-success btn-sm" onclick="responderSolic('+s.id+',\'aprovada\')">Aprovar</button>'
          +'<button class="btn btn-danger  btn-sm" onclick="responderSolic('+s.id+',\'recusada\')">Recusar</button>'
          +'</div>'
        :'<div class="mt8"><span class="bdg '+(s.status==='aprovada'?'bdg-green':'bdg-red')+'">'+s.status.toUpperCase()+'</span></div>')
      +'</div>';
  }).join('');
}
function responderSolic(id, status) {
  updSolic(id,{status:status});
  var s=getSolics().find(function(x){return x.id===id;}); var inst=s?getUserById(s.instrutorId):null;
  addNotif({para:'instrutor',paraId:s?s.instrutorId:null,tipo:'info',titulo:'Solicitação '+status,msg:'Sua solicitação foi '+status+'.'});
  toast('Solicitação '+status+'!','ok'); rdSolics(); _atualizarBadges();
}

/* NOTIFS */
function rdNotifs() {
  var list=getNotifsPara('coordenador',_uid()); var cont=document.getElementById('listaNotifs');
  if(!list.length){cont.innerHTML='<p class="txt2">Sem notificações.</p>';return;}
  cont.innerHTML=list.map(function(n){
    return '<div class="notif-item tipo-'+(n.tipo||'info')+(n.lida?'':' nao-lida')+'">'
      +'<div class="ni-title">'+esc(n.titulo||'Notificação')+'</div>'
      +'<div class="ni-msg">'+esc(n.msg)+'</div>'
      +'<div class="ni-time">'+fmtDateTime(n.criadaEm)+'</div>'
      +'</div>';
  }).join('');
  marcarTodasLidas('coordenador',_uid()); _atualizarBadges();
}

function _atualizarBadges() {
  var nc=countNaoLidas('coordenador',_uid()); var bn=document.getElementById('badgeNotif');
  if(bn){bn.textContent=nc;bn.style.display=nc?'':'none';}
  var sp=getSolics().filter(function(s){return s.unidadeId===_uid()&&s.status==='pendente';}).length;
  var bs=document.getElementById('badgeSolic'); if(bs){bs.textContent=sp;bs.style.display=sp?'':'none';}
}

function labelStatus(st){return{ativa:'Ativa',iminente:'Iminente',posterior:'Posterior',encerrada:'Encerrada'}[st]||st;}
function _tx(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function _vl(id,v){var e=document.getElementById(id);if(e)e.value=v;}
function _gv(id){var e=document.getElementById(id);return e?e.value:'';}

/* ================================================================
   PESQUISA E FILTROS — adicionados à coordenador_page.js (v2)
   ================================================================ */

/* ── Config de busca por seção ── */
var _cfgSalasCoord = {
  busca:{id:'buscarSalaCoord', placeholder:'Pesquisar sala por nome ou tipo…'},
  filtros:[
    {id:'filtTipoSalaC',label:'Tipo',campo:'tipo',opcoes:[
      {value:'Laboratório de Informática',label:'Lab. Informática'},
      {value:'Laboratório de Gastronomia',label:'Lab. Gastronomia'},
      {value:'Laboratório de Enfermagem', label:'Lab. Enfermagem'},
      {value:'Laboratório de Estética',   label:'Lab. Estética'},
      {value:'Laboratório de Ciências',   label:'Lab. Ciências'},
      {value:'Sala de Aula comum',        label:'Sala Comum'},
      {value:'Auditório',                 label:'Auditório'},
      {value:'Sala de Reunião',           label:'Sala Reunião'},
      {value:'Sala de Videoconferência',  label:'Videoconf.'},
    ]},
  ]
};

var _cfgTurmasCoord = {
  busca:{id:'buscarTurmaCoord', placeholder:'Pesquisar por código, curso ou instrutor…'},
  filtros:[
    {id:'filtTurnoTC', label:'Turno',  campo:'turno',   opcoes:[{value:'Matutino',label:'Matutino'},{value:'Vespertino',label:'Vespertino'},{value:'Noturno',label:'Noturno'}]},
    {id:'filtStatusTC',label:'Status', campo:'_status', opcoes:[{value:'ativa',label:'Ativa'},{value:'iminente',label:'Iminente'},{value:'posterior',label:'Posterior'},{value:'encerrada',label:'Encerrada'}]},
  ]
};

var _cfgResCoord = {
  busca:{id:'buscarResCoord', placeholder:'Pesquisar por sala, turma…'},
  filtros:[
    {id:'filtTurnoRC', label:'Turno', campo:'turno', opcoes:[{value:'Matutino',label:'Matutino'},{value:'Vespertino',label:'Vespertino'},{value:'Noturno',label:'Noturno'}]},
  ]
};

var _cfgInstCoord = {
  busca:{id:'buscarInstCoord', placeholder:'Pesquisar instrutor por nome ou e-mail…'},
  filtros:[]
};

/* Wraps das funções originais para adicionar busca */
var _rdSalasOrig = rdSalas;
rdSalas = function() {
  var cont = document.getElementById('searchSalasCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchSalasCoord', _cfgSalasCoord, _renderSalasCoord);
  _renderSalasCoord();
};

function _renderSalasCoord() {
  var vals = lerFiltros(_cfgSalasCoord);
  var list = getSalasByUnidade(_uid());
  list = filtrarLista(list, vals._busca, ['nome','tipo','andar','bloco']);
  if (vals.tipo) list = list.filter(function(s){ return s.tipo === vals.tipo; });
  var tb = document.getElementById('tbSalas');
  var cnt = document.getElementById('countSalasCoord');
  if (cnt) cnt.textContent = list.length + ' sala(s)';
  if (!list.length) { tb.innerHTML='<tr class="empty-row"><td colspan="7">Nenhuma sala encontrada.</td></tr>'; return; }
  tb.innerHTML = list.map(function(s){
    var turnos = (s.turnos||s.turnosDisponiveis||[]).map(function(t){return '<span class="bdg bdg-primary">'+t+'</span>';}).join(' ');
    return '<tr>'
      +'<td><strong>'+esc(s.nome)+'</strong></td>'
      +'<td>'+esc(s.andar||'—')+'</td>'
      +'<td>'+esc(s.bloco||'—')+'</td>'
      +'<td>'+s.capacidade+' pess.</td>'
      +'<td>'+esc(s.tipo)+'</td>'
      +'<td>'+turnos+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirSala('+s.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirSala('+s.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}

var _rdTurmasOrig = rdTurmas;
rdTurmas = function() {
  var cont = document.getElementById('searchTurmasCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchTurmasCoord', _cfgTurmasCoord, _renderTurmasCoord);
  _renderTurmasCoord();
};

function _renderTurmasCoord() {
  var vals = lerFiltros(_cfgTurmasCoord);
  var list = getTurmas().filter(function(t){return t.unidadeId===_uid();})
    .map(function(t){return Object.assign({},t,{_status:calcStatus(t)});});
  list = filtrarLista(list, vals._busca, ['nome','curso', function(t){var i=getUserById(t.instrutorId);return i?i.nome:'';}]);
  if (vals.turno)     list = list.filter(function(t){return t.turno===vals.turno;});
  if (vals['_status'])list = list.filter(function(t){return t._status===vals['_status'];});
  list.sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);});
  var cnt = document.getElementById('countTurmasCoord');
  if (cnt) cnt.textContent = list.length + ' turma(s)';
  var tb = document.getElementById('tbTurmas');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma turma encontrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(t){
    var inst=t.instrutorId?getUserById(t.instrutorId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td>'+fmtData(t.dataInicio)+'</td><td>'+fmtData(t.dataFim)+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td><div class="td-actions">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirTurma('+t.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirTurma('+t.id+')">Excluir</button>'
      +'</div></td></tr>';
  }).join('');
}

var _rdReservasOrig = rdReservas;
rdReservas = function() {
  var cont = document.getElementById('searchResCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchResCoord', _cfgResCoord, _renderResCoord);
  _renderResCoord();
};

function _renderResCoord() {
  var vals = lerFiltros(_cfgResCoord);
  var list = getReservas().filter(function(r){return r.unidadeId===_uid();});
  list = filtrarLista(list, vals._busca, [
    function(r){var s=getSalaById(r.salaId);return s?s.nome:'';},
    function(r){var t=getTurmaById(r.turmaId);return t?t.nome:'';},
    'turno'
  ]);
  if (vals.turno) list = list.filter(function(r){return r.turno===vals.turno;});
  list.sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);});
  var cnt = document.getElementById('countResCoord');
  if (cnt) cnt.textContent = list.length + ' reserva(s)';
  var tb = document.getElementById('tbReservas');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="8">Nenhuma reserva encontrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(r){
    var sala=getSalaById(r.salaId), turma=getTurmaById(r.turmaId);
    var st=turma?calcStatus(turma):'encerrada';
    return '<tr><td><strong>'+esc(sala?sala.nome:'—')+'</strong></td>'
      +'<td class="mono">'+esc(turma?turma.nome:'—')+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(r.turno)+'</span></td>'
      +'<td style="font-size:.78rem">'+r.diasSemana.map(function(d){return d.toUpperCase();}).join(', ')+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+'</td>'
      +'<td><span class="st st-'+st+'">'+labelStatus(st)+'</span></td>'
      +'<td><button class="btn btn-danger btn-sm" onclick="excluirReserva('+r.id+')">Excluir</button></td></tr>';
  }).join('');
}

var _rdInstOrig = rdInstrutores;
rdInstrutores = function() {
  var cont = document.getElementById('searchInstCoord');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchInstCoord', _cfgInstCoord, _renderInstCoord);
  _renderInstCoord();
};

function _renderInstCoord() {
  var vals = lerFiltros(_cfgInstCoord);
  var list = getUsersByPerfil('instrutor').filter(function(u){return u.unidadeId===_uid();});
  list = filtrarLista(list, vals._busca, ['nome','email']);
  var cnt = document.getElementById('countInstCoord');
  if (cnt) cnt.textContent = list.length + ' instrutor(es)';
  var tb = document.getElementById('tbInst');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="4">Nenhum instrutor encontrado.</td></tr>';return;}
  tb.innerHTML = list.map(function(u){
    var turmas=getTurmas().filter(function(t){return t.instrutorId===u.id&&t.unidadeId===_uid();});
    var tHtml=turmas.length?turmas.map(function(t){return '<span class="st st-'+calcStatus(t)+'" style="margin-right:4px">'+esc(t.nome)+'</span>';}).join(''):'<span class="txt3">Nenhuma</span>';
    return '<tr><td><strong>'+esc(u.nome)+'</strong></td><td class="mono">'+esc(u.email)+'</td>'
      +'<td>'+tHtml+'</td>'
      +'<td><button class="btn btn-ghost btn-sm" onclick="abrirAtrib('+u.id+')">Atribuir Turma</button></td></tr>';
  }).join('');
}
