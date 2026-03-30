var _sess;

window.addEventListener('DOMContentLoaded', function() {
  initDados(); requirePerfil('instrutor'); _sess = getSessao();
  initSidebar(); initLogo(); ir('turmas'); _atualizarBadge();
});

function _uid(){ return _sess?_sess.unidadeId:null; }

function ir(aba) {
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('ativa');p.style.display='none';});
  var pg=document.getElementById('pg-'+aba); if(pg){pg.classList.add('ativa');pg.style.display='block';}
  document.querySelectorAll('.sb-btn').forEach(function(b){b.classList.remove('ativo');});
  var btn=document.getElementById('nav-'+aba); if(btn)btn.classList.add('ativo');
  var meta={turmas:{t:'Minhas Turmas',s:'Turmas atribuídas a você'},salas:{t:'Solicitar Sala',s:'Solicite uma sala disponível'},chaves:{t:'Chaves',s:'Sinalizar retirada e devolução de chaves'},notifs:{t:'Notificações',s:'Avisos e respostas'}};
  var m=meta[aba]||{}; document.getElementById('tbTitle').textContent=m.t||aba; document.getElementById('tbSub').textContent=m.s||'';
  if(aba==='turmas') rdTurmas();
  if(aba==='salas')  rdSalas();
  if(aba==='chaves') rdChaves();
  if(aba==='notifs') rdNotifs();
}

function rdTurmas() {
  var list=getTurmas().filter(function(t){return t.instrutorId===_sess.id;});
  var tb=document.getElementById('tbTurmas');
  if(!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="6">Nenhuma turma atribuída a você.</td></tr>';return;}
  tb.innerHTML=list.map(function(t){
    var res=getReservas().filter(function(r){return r.turmaId===t.id;}); var sala=res.length?getSalaById(res[0].salaId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(sala?sala.nome:'Sem sala reservada')+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(t.dataInicio)+' → '+fmtData(t.dataFim)+'</td></tr>';
  }).join('');
}

function rdSalas() {
  var salas=getSalasByUnidade(_uid()); var cont=document.getElementById('listaSalas'); var hj=hojeISO();
  if(!salas.length){cont.innerHTML='<p class="txt2">Nenhuma sala cadastrada na unidade.</p>';return;}
  var pp=hj.split('-').map(Number);
  var dia=['dom','seg','ter','qua','qui','sex','sab'][new Date(pp[0],pp[1]-1,pp[2]).getDay()];
  cont.innerHTML=salas.map(function(s){
    var livre=true; var ocupacoes=[]; var instNome='';
    var rs=getReservas().filter(function(r){return r.salaId===s.id&&r.dataInicio<=hj&&r.dataFim>=hj;});
    for(var i=0;i<rs.length;i++){
      var r=rs[i];
      if(!r.diasSemana.includes(dia)) continue;
      if(r.avulsa||!r.turmaId){livre=false;ocupacoes.push('Reservada ('+r.turno+')');break;}
      var t=getTurmaById(r.turmaId); if(!t||calcStatus(t)==='encerrada')continue;
      livre=false;
      var inst=t&&t.instrutorId?getUserById(t.instrutorId):null; instNome=inst?inst.nome:'';
      ocupacoes.push(r.turno+': '+t.nome);
    }
    var infoHtml=livre
      ?'<span style="color:var(--green);font-weight:600">🟢 Disponível hoje</span>'
      :'<span style="color:var(--red);font-weight:600">🔴 '+ocupacoes.join(' | ')+'</span>';
    var turnosHtml=(s.turnos||s.turnosDisponiveis||[]).map(function(t){
      return '<span class="mapa-turno">'+t[0]+'</span>';
    }).join('');
    return '<div class="sala-card-v2 '+(livre?'livre':'ocupada')+'">'
      +'<div class="sc-header"><div class="sc-nome">'+esc(s.nome)+'</div>'
      +'<div class="sc-status-dot '+(livre?'livre':'ocupada')+'"></div></div>'
      +'<div class="sc-tipo">'+esc(s.tipo)+'</div>'
      +'<div class="sc-meta">'
      +(s.andar?'<div class="sc-meta-item"><span class="sc-meta-icon">🏢</span>'+esc(s.andar)+'</div>':'')
      +(s.bloco?'<div class="sc-meta-item"><span class="sc-meta-icon">📍</span>'+esc(s.bloco)+'</div>':'')
      +'<div class="sc-meta-item"><span class="sc-meta-icon">👥</span>'+s.capacidade+'</div>'
      +'</div>'
      +'<div class="sc-turnos">'+turnosHtml+'</div>'
      +'<div style="margin-top:6px;font-size:.78rem">'+infoHtml+'</div>'
      +(instNome?'<div style="font-size:.75rem;color:var(--text2);margin-top:3px">👤 '+esc(instNome)+'</div>':'')
      +(livre?'<button class="btn btn-primary btn-sm" style="margin-top:10px;width:100%" onclick="abrirSolic('+s.id+')">📋 Solicitar Sala</button>'
      :'<div style="margin-top:8px;font-size:.75rem;color:var(--text3)">🔒 Sala ocupada hoje</div>')
      +'</div>';
  }).join('');
}

function abrirSolic(salaId) {
  document.getElementById('slSalaId').value=salaId;
  var s=getSalaById(salaId);
  document.getElementById('slNome').textContent=s?s.nome:'';
  document.getElementById('slData').value='';
  document.getElementById('slMotivo').value='';
  // Pré-seleciona os turnos disponíveis da sala
  var turnsSala = s ? (s.turnos||s.turnosDisponiveis||[]) : [];
  document.querySelectorAll('#slTurnosChips .chip').forEach(function(c){
    c.classList.remove('ativo');
    // se a sala tem turnos definidos, pré-marca os disponíveis
    if(turnsSala.length && turnsSala.includes(c.dataset.v)) c.classList.add('ativo');
  });
  var erEl=document.getElementById('slTurnoErro');
  if(erEl) erEl.style.display='none';
  modalAbrir('modalSolic');
}
function _getTurnosSolic() {
  return [].slice.call(document.querySelectorAll('#slTurnosChips .chip.ativo'))
    .map(function(c){return c.dataset.v;});
}
function enviarSolic() {
  var salaId=parseInt(document.getElementById('slSalaId').value);
  var data=document.getElementById('slData').value;
  var turnos=_getTurnosSolic();
  var motivo=document.getElementById('slMotivo').value.trim();
  var erEl=document.getElementById('slTurnoErro');
  if(!data){toast('Selecione uma data.','aviso');return;}
  if(!turnos.length){
    if(erEl){erEl.textContent='Selecione ao menos um turno.';erEl.style.display='block';}
    return;
  }
  if(erEl) erEl.style.display='none';

  // Verificar se algum turno já está reservado nessa data
  var p=data.split('-').map(Number);
  var diaSem=['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];
  var conflitos=[];
  turnos.forEach(function(turno){
    var rs=getReservas().filter(function(r){
      return r.salaId===salaId && r.turno===turno && r.dataInicio<=data && r.dataFim>=data && r.diasSemana.includes(diaSem);
    });
    rs.forEach(function(r){
      var t=r.turmaId?getTurmaById(r.turmaId):null;
      var ativo=r.avulsa||(t&&calcStatus(t)!=='encerrada');
      if(ativo) conflitos.push(turno);
    });
  });

  if(conflitos.length){
    if(erEl){
      erEl.textContent='Sala já reservada no(s) turno(s): '+conflitos.join(', ')+'. Escolha outro turno ou data.';
      erEl.style.display='block';
    }
    return;
  }

  addSolic({salaId:salaId,instrutorId:_sess.id,data:data,turnos:turnos,turno:turnos[0],motivo:motivo,unidadeId:_uid()});
  var sala=getSalaById(salaId);
  var turnosStr=turnos.join(', ');
  addNotif({para:'coordenador',paraId:_uid(),tipo:'solicit',titulo:'Nova solicitação de sala',
    msg:_sess.nome+' solicitou '+(sala?sala.nome:'sala')+' em '+fmtData(data)+' ('+turnosStr+').'});
  toast('Solicitação enviada ao coordenador!','ok'); modalFechar('modalSolic'); rdSalas();
}

function rdChaves() {
  var list=getChaves().filter(function(c){return c.unidadeId===_uid();}); var cont=document.getElementById('listaChaves');
  if(!list.length){cont.innerHTML='<p class="txt2">Nenhuma chave cadastrada na unidade.</p>';return;}
  cont.innerHTML=list.map(function(c){
    var sala=getSalaById(c.salaId); var pega=c.status==='pega'; var minha=c.instrutorId===_sess.id;
    var quem=pega&&c.instrutorId?getUserById(c.instrutorId):null;
    return '<div class="chave-card '+(c.status||'disponivel')+'">'
      +'<div class="ch-icon">'+(pega?'🔑':'🗝️')+'</div>'
      +'<div class="ch-info"><div class="ch-nome">'+esc(sala?sala.nome:'—')+' — '+esc(c.codigo||'Chave')+'</div>'
      +'<div class="ch-det">Andar: '+esc(c.andar||'—')+' · '+(pega?'Retirada':'Disponível')+'</div>'
      +(quem?'<div class="ch-det">Retirada por: '+esc(quem.nome)+(c.pegaEm?' em '+fmtDateTime(c.pegaEm):'')+'</div>':'')
      +'</div>'
      +(!pega?'<button class="btn btn-warning btn-sm" onclick="pegarChave('+c.id+')">Retirar</button>':
         minha?'<button class="btn btn-success btn-sm" onclick="devolverChave('+c.id+')">Devolver</button>':'')
      +'</div>';
  }).join('');
}
function pegarChave(id) {
  updChave(id,{status:'pega',instrutorId:_sess.id,pegaEm:new Date().toISOString()});
  var c=getChaveById(id); var sala=getSalaById(c?c.salaId:null);
  addNotif({para:'recepcao',paraId:_uid(),tipo:'chave',titulo:'Chave retirada',msg:_sess.nome+' retirou a chave de "'+(sala?sala.nome:'sala')+'"'+(c?' ('+c.codigo+')':'')+'.'});
  toast('Chave retirada. Recepção notificada.','ok'); rdChaves();
}
function devolverChave(id) {
  updChave(id,{status:'disponivel',instrutorId:null,pegaEm:null});
  var c=getChaveById(id); var sala=getSalaById(c?c.salaId:null);
  addNotif({para:'recepcao',paraId:_uid(),tipo:'chave',titulo:'Chave devolvida',msg:_sess.nome+' devolveu a chave de "'+(sala?sala.nome:'sala')+'".'});
  toast('Chave devolvida!','ok'); rdChaves();
}

function rdNotifs() {
  var list=getNotifsPara('instrutor',_uid()).filter(function(n){return !n.paraId||n.paraId===_sess.id||n.paraId===_uid();});
  var cont=document.getElementById('listaNotifs');
  if(!list.length){cont.innerHTML='<p class="txt2">Sem notificações.</p>';return;}
  cont.innerHTML=list.map(function(n){
    return '<div class="notif-item tipo-'+(n.tipo||'info')+(n.lida?'':' nao-lida')+'">'
      +'<div class="ni-title">'+esc(n.titulo||'Notificação')+'</div>'
      +'<div class="ni-msg">'+esc(n.msg)+'</div>'
      +'<div class="ni-time">'+fmtDateTime(n.criadaEm)+'</div>'+'</div>';
  }).join('');
  marcarTodasLidas('instrutor',_uid()); _atualizarBadge();
}

function _atualizarBadge(){var n=countNaoLidas('instrutor',_uid());var b=document.getElementById('badgeNotif');if(b){b.textContent=n;b.style.display=n?'':'none';}}
function labelStatus(st){return{ativa:'Ativa',iminente:'Iminente',posterior:'Posterior',encerrada:'Encerrada'}[st]||st;}

/* ── PESQUISA TURMAS INSTRUTOR ── */
var _cfgTurmasInst = {
  busca:{id:'buscarTurmaInst', placeholder:'Pesquisar por código ou curso…'},
  filtros:[
    {id:'filtStatusTI', label:'Status', campo:'_status', opcoes:[{value:'ativa',label:'Ativa'},{value:'iminente',label:'Iminente'},{value:'posterior',label:'Posterior'},{value:'encerrada',label:'Encerrada'}]},
  ]
};

var _rdTurmasInstOrig = rdTurmas;
rdTurmas = function() {
  var cont = document.getElementById('searchTurmasInst');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchTurmasInst', _cfgTurmasInst, _renderTurmasInst);
  _renderTurmasInst();
};

function _renderTurmasInst() {
  var vals = lerFiltros(_cfgTurmasInst);
  var list = getTurmas().filter(function(t){return t.instrutorId===_sess.id;})
    .map(function(t){return Object.assign({},t,{_status:calcStatus(t)});});
  list = filtrarLista(list, vals._busca, ['nome','curso']);
  if (vals['_status']) list = list.filter(function(t){return t._status===vals['_status'];});
  var cnt = document.getElementById('countTurmasInst'); if (cnt) cnt.textContent = list.length+' turma(s)';
  var tb = document.getElementById('tbTurmas');
  if (!list.length){tb.innerHTML='<tr class="empty-row"><td colspan="6">Nenhuma turma encontrada.</td></tr>';return;}
  tb.innerHTML = list.map(function(t){
    var res=getReservas().filter(function(r){return r.turmaId===t.id;}); var sala=res.length?getSalaById(res[0].salaId):null;
    return '<tr><td class="mono"><strong>'+esc(t.nome)+'</strong></td><td>'+esc(t.curso)+'</td>'
      +'<td><span class="bdg bdg-primary">'+esc(t.turno)+'</span></td>'
      +'<td>'+esc(sala?sala.nome:'Sem sala reservada')+'</td>'
      +'<td>'+htmlStatus(t)+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(t.dataInicio)+' → '+fmtData(t.dataFim)+'</td></tr>';
  }).join('');
}
