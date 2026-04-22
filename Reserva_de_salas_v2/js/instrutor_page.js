/* ── AUXILIARES DE LIBERAÇÃO DE SALA ─────────────────────── */
function _dataLiberacao(salaId, hj) {
  // Retorna texto com data de liberação da sala se ocupada hoje
  var rs = getReservas().filter(function(r){
    return r.salaId === salaId && r.dataFim >= hj;
  });
  if (!rs.length) return '';
  // Pega a reserva que termina mais tarde
  var maxFim = rs.reduce(function(acc, r) {
    return r.dataFim > acc ? r.dataFim : acc;
  }, hj);
  // Calcula data seguinte ao fim
  var parts = maxFim.split('-').map(Number);
  var dtFim = new Date(parts[0], parts[1]-1, parts[2]);
  dtFim.setDate(dtFim.getDate() + 1);
  var liberacao = dtFim.toISOString().split('T')[0];
  return ' <span style="color:var(--amber);font-weight:600">&mdash; Livre a partir de ' + fmtData(liberacao) + '</span>';
}

function _dataLiberacaoPorTurnos(salaId, data, turnos) {
  // Retorna a data de liberação mais próxima para os turnos em conflito
  var maxFim = null;
  turnos.forEach(function(turno) {
    var rs = getReservas().filter(function(r) {
      return r.salaId === salaId && r.turno === turno && r.dataFim >= data;
    });
    rs.forEach(function(r) {
      var t = r.turmaId ? getTurmaById(r.turmaId) : null;
      if (t && calcStatus(t) === 'encerrada') return;
      if (!maxFim || r.dataFim > maxFim) maxFim = r.dataFim;
    });
  });
  if (!maxFim) return null;
  // Data seguinte ao fim da última reserva
  var parts = maxFim.split('-').map(Number);
  var dtFim = new Date(parts[0], parts[1]-1, parts[2]);
  dtFim.setDate(dtFim.getDate() + 1);
  var liberacao = dtFim.toISOString().split('T')[0];
  return fmtData(liberacao);
}

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
      ?'<span style="color:var(--green);font-weight:600"><span class="ic-dot ic-livre"></span> Disponível hoje</span>'
      :'<span style="color:var(--red);font-weight:600"><span class="ic-dot ic-ocupada"></span> '+ocupacoes.join(' | ')+'</span>';
    var turnosHtml=(s.turnos||s.turnosDisponiveis||[]).map(function(t){
      return '<span class="mapa-turno">'+t[0]+'</span>';
    }).join('');
    return '<div class="sala-card-v2 '+(livre?'livre':'ocupada')+'">'
      +'<div class="sc-header"><div class="sc-nome">'+esc(s.nome)+'</div>'
      +'<div class="sc-status-dot '+(livre?'livre':'ocupada')+'"></div></div>'
      +'<div class="sc-tipo">'+esc(s.tipo)+'</div>'
      +'<div class="sc-meta">'
      +(s.andar?'<div class="sc-meta-item"><span class="sc-meta-icon"><i class="ph ph-buildings"></i></span>'+esc(s.andar)+'</div>':'')
      +(s.bloco?'<div class="sc-meta-item"><span class="sc-meta-icon"><i class="ph ph-map-pin"></i></span>'+esc(s.bloco)+'</div>':'')
      +'<div class="sc-meta-item"><span class="sc-meta-icon"><i class="ph ph-users"></i></span>'+s.capacidade+'</div>'
      +'</div>'
      +'<div class="sc-turnos">'+turnosHtml+'</div>'
      +'<div style="margin-top:6px;font-size:.78rem">'+infoHtml+'</div>'
      +(instNome?'<div style="font-size:.75rem;color:var(--text2);margin-top:3px"><i class="ph ph-user"></i> '+esc(instNome)+'</div>':'')
      +(livre
        ?'<button class="btn btn-primary btn-sm" style="margin-top:10px;width:100%" onclick="abrirSolic('+s.id+')"><i class="ph ph-clipboard-text"></i> Solicitar Sala</button>'
        :'<div style="margin-top:8px">'          +'<div style="font-size:.78rem;color:var(--red);font-weight:600;margin-bottom:4px"><i class="ph ph-lock"></i> Sala ocupada hoje'+_dataLiberacao(s.id,hj)+'</div>'          +'<button class="btn btn-ghost btn-sm" style="width:100%;margin-top:4px" onclick="abrirSolic('+s.id+')"><i class="ph ph-calendar-plus"></i> Solicitar para outra data</button>'          +'</div>')
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
  var divDisp = document.getElementById('slDisponibilidade');
  if(divDisp) divDisp.style.display='none';
  modalAbrir('modalSolic');
}

/* Verifica disponibilidade em tempo real ao selecionar data/turno */
function verificarDisponibilidadeSolic() {
  var salaId  = parseInt(document.getElementById('slSalaId').value);
  var data    = document.getElementById('slData').value;
  var divDisp = document.getElementById('slDisponibilidade');
  var erEl    = document.getElementById('slTurnoErro');
  if(!divDisp) return;
  if(!data || !salaId) { divDisp.style.display='none'; return; }

  var turnos = [].slice.call(document.querySelectorAll('#slTurnosChips .chip.ativo'))
    .map(function(c){ return c.dataset.v; });

  var p = data.split('-').map(Number);
  var diaSem = ['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];

  // Verificar cada turno selecionado (ou todos se nenhum selecionado)
  var turnosVerif = turnos.length ? turnos : ['Matutino','Vespertino','Noturno'];
  var conflitos = [];
  var livres    = [];

  turnosVerif.forEach(function(turno) {
    var rs = getReservas().filter(function(r) {
      return r.salaId === salaId && r.turno === turno
          && r.dataInicio <= data && r.dataFim >= data
          && r.diasSemana.includes(diaSem);
    });
    var ocupado = rs.some(function(r) {
      var t = r.turmaId ? getTurmaById(r.turmaId) : null;
      return r.avulsa || (t && calcStatus(t) !== 'encerrada');
    });
    if (ocupado) {
      // Busca quando vai liberar
      var maxFim = null;
      getReservas().filter(function(r){
        return r.salaId === salaId && r.turno === turno && r.dataFim >= data;
      }).forEach(function(r){
        var t = r.turmaId ? getTurmaById(r.turmaId) : null;
        if(t && calcStatus(t)==='encerrada') return;
        if(!maxFim || r.dataFim > maxFim) maxFim = r.dataFim;
      });
      var liberacaoStr = '';
      if(maxFim) {
        var dtFim = new Date(maxFim.split('-').map(Number).reduce(function(acc,v,i){
          return i===0?new Date(v,0,1):acc; // placeholder
        }, null));
        var pp = maxFim.split('-').map(Number);
        dtFim = new Date(pp[0], pp[1]-1, pp[2]);
        dtFim.setDate(dtFim.getDate()+1);
        liberacaoStr = ' &mdash; livre a partir de <strong>' + fmtData(dtFim.toISOString().split('T')[0]) + '</strong>';
      }
      conflitos.push({ turno: turno, liberacao: liberacaoStr });
    } else {
      livres.push(turno);
    }
  });

  if (!conflitos.length && !livres.length) { divDisp.style.display='none'; return; }

  var html = '';
  if (conflitos.length) {
    html += '<div style="color:var(--red);font-weight:600;margin-bottom:4px"><i class="ph ph-warning-circle"></i> Turno(s) ocupado(s) nesta data:</div>';
    conflitos.forEach(function(c){
      html += '<div style="margin-left:8px;color:var(--text2)"><i class="ph ph-lock"></i> <strong>'+c.turno+'</strong>'+c.liberacao+'</div>';
    });
  }
  if (livres.length && turnos.length) {
    html += '<div style="color:var(--green);font-weight:600;margin-top:'+(conflitos.length?'8px':'0')+'"><i class="ph ph-check-circle"></i> Disponível:</div>';
    livres.forEach(function(t){
      html += '<div style="margin-left:8px;color:var(--text2)"><i class="ph ph-check"></i> <strong>'+t+'</strong></div>';
    });
  }
  if (conflitos.length) {
    divDisp.style.cssText = 'display:block;padding:10px 14px;border-radius:8px;font-size:.83rem;line-height:1.7;background:var(--red-l);border:1px solid rgba(220,38,38,.25)';
  } else {
    divDisp.style.cssText = 'display:block;padding:10px 14px;border-radius:8px;font-size:.83rem;line-height:1.7;background:var(--green-l);border:1px solid rgba(5,150,105,.25)';
  }
  divDisp.innerHTML = html;
  if(erEl) erEl.style.display='none';
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
      var liberacao = _dataLiberacaoPorTurnos(salaId, data, conflitos);
      var msgConflito = 'Sala já reservada no(s) turno(s): '+conflitos.join(', ')+'.';
      if(liberacao) msgConflito += ' Será liberada em: '+liberacao+'.';
      else msgConflito += ' Escolha outro turno ou data.';
      erEl.innerHTML = '<i class="ph ph-warning"></i> '+msgConflito;
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
      +'<div class="ch-icon">'+(pega?'<i class="ph ph-key"></i>':'<i class="ph ph-key"></i>️')+'</div>'
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
