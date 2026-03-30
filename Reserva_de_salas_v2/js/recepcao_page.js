var _sess;

window.addEventListener('DOMContentLoaded', function() {
  initDados(); requirePerfil('recepcao'); _sess = getSessao();
  initSidebar(); initLogo(); ir('mapa'); _atualizarBadge();
});

function _uid(){ return _sess?_sess.unidadeId:null; }

function ir(aba) {
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('ativa');p.style.display='none';});
  var pg=document.getElementById('pg-'+aba); if(pg){pg.classList.add('ativa');pg.style.display='block';}
  document.querySelectorAll('.sb-btn').forEach(function(b){b.classList.remove('ativo');});
  var btn=document.getElementById('nav-'+aba); if(btn)btn.classList.add('ativo');
  var meta={mapa:{t:'Mapa de Salas',s:'Visualizar ocupação e guiar instrutores'},chaves:{t:'Chaves',s:'Criar e controlar chaves das salas'},notifs:{t:'Notificações',s:'Avisos recebidos'}};
  var m=meta[aba]||{}; document.getElementById('tbTitle').textContent=m.t||aba; document.getElementById('tbSub').textContent=m.s||'';
  if(aba==='mapa')   rdMapa();
  if(aba==='chaves') rdChaves();
  if(aba==='notifs') rdNotifs();
}

function _calcSalaStatusRec(s, hj) {
  // Verificar override manual primeiro
  var ov=getOverride(s.id, s.unidadeId);
  if(ov){
    return {
      stat:ov.status, override:ov,
      periodos:ov.status!=='livre'?[{turno:'Manual',turmaNome:ov.motivo||'Status manual',instNome:ov.por||'',stat:ov.status}]:[],
      turnosOcupados:ov.status!=='livre'?['Manual']:[],
      turnoAtivo:ov.status!=='livre'?'Manual':'', turmaNome:ov.motivo||'', instNome:ov.por||''
    };
  }
  // Calcular pelo calendário
  var rs=getReservas().filter(function(r){return r.salaId===s.id&&r.dataInicio<=hj&&r.dataFim>=hj;});
  var p=hj.split('-').map(Number);
  var dia=['dom','seg','ter','qua','qui','sex','sab'][new Date(p[0],p[1]-1,p[2]).getDay()];
  var periodos=[], turnosOcupados=[];
  rs.forEach(function(r){
    if(!r.diasSemana.includes(dia)) return;
    var pStat,pTurma,pInst;
    if(r.avulsa||!r.turmaId){
      pStat='ocupada'; pTurma='Reserva avulsa';
      var iA=r.instrutorId?getUserById(r.instrutorId):null; pInst=iA?iA.nome:'—';
    } else {
      var t=getTurmaById(r.turmaId); var cst=t?calcStatus(t):'encerrada';
      if(cst==='encerrada') return;
      pStat=cst==='ativa'?'ocupada':'iminente'; pTurma=t?t.nome:'—';
      var inst=t&&t.instrutorId?getUserById(t.instrutorId):null; pInst=inst?inst.nome:'';
    }
    periodos.push({turno:r.turno,turmaNome:pTurma,instNome:pInst,stat:pStat});
    if(turnosOcupados.indexOf(r.turno)===-1) turnosOcupados.push(r.turno);
  });
  var stat='livre';
  if(periodos.some(function(p){return p.stat==='ocupada';})) stat='ocupada';
  else if(periodos.length>0) stat='iminente';
  return {
    stat:stat, periodos:periodos, turnosOcupados:turnosOcupados, override:null,
    turnoAtivo:periodos.length?periodos[0].turno:'',
    turmaNome:periodos.length?periodos[0].turmaNome:'',
    instNome:periodos.length?periodos[0].instNome:''
  };
}

function _buildSalaCardRec(s, info) {
  var statusIcon = {livre:'🟢',ocupada:'🔴',iminente:'🟡'}[info.stat]||'🟢';
  var turnos = s.turnos||s.turnosDisponiveis||[];
  var uid = s.unidadeId||_uid();

  var turnosHtml = turnos.map(function(t){
    var per = info.periodos ? info.periodos.find(function(p){return p.turno===t;}) : null;
    var cls = 'mapa-turno';
    if (per) cls += per.stat==='ocupada' ? ' ocupado' : ' iminente-turno';
    return '<span class="'+cls+'" title="'+(per?esc(per.turmaNome):'Livre')+'">'+t[0]+'</span>';
  }).join('');

  var ocupHtml = '';
  if (info.periodos && info.periodos.length) {
    ocupHtml = '<div class="sc-ocupacao">';
    if (info.override) {
      ocupHtml += '<div class="sc-periodo sc-override">'
        +'<span class="sc-periodo-turno '+(info.stat==='ocupada'?'ocp':'imi')+'">⚙️ Manual</span>'
        +'<div class="sc-turma">'+esc(info.override.motivo||'Status manual')+'</div>'
        +'<div class="sc-inst">por '+esc(info.override.por)+'</div>'
        +'</div>';
    } else {
      info.periodos.forEach(function(per){
        var ic = per.stat==='ocupada'?'🔴':'🟡';
        ocupHtml += '<div class="sc-periodo">'
          +'<span class="sc-periodo-turno '+(per.stat==='ocupada'?'ocp':'imi')+'">'+ic+' '+esc(per.turno)+'</span>'
          +'<div class="sc-turma">📚 '+esc(per.turmaNome)+'</div>'
          +(per.instNome?'<div class="sc-inst">👤 '+esc(per.instNome)+'</div>':'')
          +'</div>';
      });
    }
    ocupHtml += '</div>';
  } else {
    ocupHtml = '<div class="sc-livre-label">'+statusIcon+' Disponível</div>';
  }

  var sid = s.id;
  var ovOcup  = info.stat==='ocupada'  ? 'ov-active' : '';
  var ovIminn = info.stat==='iminente' ? 'ov-active' : '';
  var ovLivre = (info.stat==='livre' && !info.override) ? 'ov-active' : '';
  var ovBtn = '<div class="sc-override-bar">'
    +'<button class="sc-ov-btn '+ovOcup+'"  data-sid="'+sid+'" data-uid="'+uid+'" data-st="ocupada"  onclick="ovClickRec(this)" title="Marcar Ocupada">🔴</button>'
    +'<button class="sc-ov-btn '+ovIminn+'" data-sid="'+sid+'" data-uid="'+uid+'" data-st="iminente" onclick="ovClickRec(this)" title="Marcar Em Breve">🟡</button>'
    +'<button class="sc-ov-btn '+ovLivre+'" data-sid="'+sid+'" data-uid="'+uid+'" data-st="livre"    onclick="ovClickRec(this)" title="Marcar Livre">🟢</button>'
    +(info.override?'<button class="sc-ov-btn sc-ov-auto" data-sid="'+sid+'" data-uid="'+uid+'" data-st="auto" onclick="ovClickRec(this)" title="Voltar ao automático">⟳ Auto</button>':'')
    +'</div>';

  return '<div class="sala-card-v2 '+info.stat+(info.override?' has-override':'')+'">'
    +'<div class="sc-header"><div class="sc-nome">'+esc(s.nome)+(info.override?'<span class="sc-ov-tag">⚙️</span>':'')+'</div>'
    +'<div class="sc-status-dot '+info.stat+'"></div></div>'
    +'<div class="sc-tipo">'+esc(s.tipo)+'</div>'
    +'<div class="sc-meta">'
      +'<div class="sc-meta-item"><span class="sc-meta-icon">🏢</span>'+esc(s.andar||'—')+'</div>'
      +'<div class="sc-meta-item"><span class="sc-meta-icon">📍</span>'+esc(s.bloco||'—')+'</div>'
      +'<div class="sc-meta-item"><span class="sc-meta-icon">👥</span>'+s.capacidade+'</div>'
    +'</div>'
    +'<div class="sc-turnos">'+turnosHtml+'</div>'
    +ocupHtml+ovBtn
    +'</div>';
}

function ovClickRec(btn) {
  var salaId    = parseInt(btn.getAttribute('data-sid'));
  var unidadeId = parseInt(btn.getAttribute('data-uid'));
  var status    = btn.getAttribute('data-st');
  _setOverrideRec(salaId, unidadeId, status);
}

function _setOverrideRec(salaId, unidadeId, status) {
  var motivo = '';
  if (status==='ocupada'||status==='iminente') {
    motivo = prompt(
      status==='ocupada' ? 'Motivo da ocupação:' : 'Motivo para "Em Breve":',
      status==='ocupada' ? 'Em uso' : 'Preparação'
    );
    if (motivo===null) return;
  }
  var sess = getSessao();
  setOverride(salaId, unidadeId, status==='auto' ? null : status, motivo, sess ? sess.nome : '—');
  rdMapa();
}


function _popularFiltrosMapaRec() {
  var salas=getSalasByUnidade(_uid());
  var blocos=[...new Set(salas.map(function(s){return s.bloco||'';}).filter(Boolean))].sort();
  var andares=[...new Set(salas.map(function(s){return s.andar||'';}).filter(Boolean))].sort();
  var selB=document.getElementById('mapaRecFiltBloco');
  var selA=document.getElementById('mapaRecFiltAndar');
  if(selB){
    var curB=selB.value;
    selB.innerHTML='<option value="">Todos os blocos</option>'+blocos.map(function(b){return'<option'+(b===curB?' selected':'')+'>'+esc(b)+'</option>';}).join('');
  }
  if(selA){
    var curA=selA.value;
    selA.innerHTML='<option value="">Todos os andares</option>'+andares.map(function(a){return'<option'+(a===curA?' selected':'')+'>'+esc(a)+'</option>';}).join('');
  }
}

function rdMapa() {
  _popularFiltrosMapaRec();
  var salas=getSalasByUnidade(_uid()); var cont=document.getElementById('mapaRec'); var hj=hojeISO();
  if(!salas.length){cont.innerHTML='<p class="txt2">Nenhuma sala cadastrada na unidade.</p>';return;}

  var filtTurno  = document.getElementById('mapaRecFiltTurno')  ? document.getElementById('mapaRecFiltTurno').value  : '';
  var filtBloco  = document.getElementById('mapaRecFiltBloco')  ? document.getElementById('mapaRecFiltBloco').value  : '';
  var filtAndar  = document.getElementById('mapaRecFiltAndar')  ? document.getElementById('mapaRecFiltAndar').value  : '';
  var filtStatus = document.getElementById('mapaRecFiltStatus') ? document.getElementById('mapaRecFiltStatus').value : '';
  var buscaNome  = document.getElementById('mapaRecBusca')      ? document.getElementById('mapaRecBusca').value.toLowerCase().trim() : '';

  var salasFiltradas = salas.filter(function(s){
    if(buscaNome && !s.nome.toLowerCase().includes(buscaNome) && !s.tipo.toLowerCase().includes(buscaNome)) return false;
    if(filtBloco && (s.bloco||'')!==filtBloco) return false;
    if(filtAndar && (s.andar||'')!==filtAndar) return false;
    if(filtTurno && !(s.turnos||s.turnosDisponiveis||[]).includes(filtTurno)) return false;
    return true;
  });

  var infoMap={};
  salasFiltradas.forEach(function(s){ infoMap[s.id]=_calcSalaStatusRec(s,hj); });
  if(filtStatus) salasFiltradas=salasFiltradas.filter(function(s){return infoMap[s.id].stat===filtStatus;});

  var livres=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='livre';}).length;
  var ocupadas=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='ocupada';}).length;
  var iminentes=salasFiltradas.filter(function(s){return infoMap[s.id].stat==='iminente';}).length;
  var legEl=document.getElementById('mapaRecLegenda');
  if(legEl) legEl.innerHTML='<span class="leg-item livre">🟢 Livre: '+livres+'</span>'
    +'<span class="leg-item ocupada">🔴 Ocupada: '+ocupadas+'</span>'
    +'<span class="leg-item iminente">🟡 Em breve: '+iminentes+'</span>'
    +'<span class="leg-total">Total: '+salasFiltradas.length+'</span>';

  if(!salasFiltradas.length){cont.innerHTML='<p class="txt2" style="padding:24px">Nenhuma sala com esses filtros.</p>';return;}

  var grupos={};
  salasFiltradas.forEach(function(s){
    var bloco=s.bloco||'Sem Bloco'; var andar=s.andar||'Sem Andar';
    if(!grupos[bloco]) grupos[bloco]={};
    if(!grupos[bloco][andar]) grupos[bloco][andar]=[];
    grupos[bloco][andar].push(s);
  });

  var html='';
  Object.keys(grupos).sort().forEach(function(bloco){
    html+='<div class="mapa-bloco"><div class="mapa-bloco-titulo">📍 '+esc(bloco)+'</div>';
    Object.keys(grupos[bloco]).sort().forEach(function(andar){
      html+='<div class="mapa-andar"><div class="mapa-andar-titulo">🏢 '+esc(andar)+'</div>';
      html+='<div class="mapa-andar-grid">';
      grupos[bloco][andar].forEach(function(s){ html+=_buildSalaCardRec(s,infoMap[s.id]); });
      html+='</div></div>';
    });
    html+='</div>';
  });
  cont.innerHTML=html;

  // Tabela futuras
  var tb=document.getElementById('tbFuturas'); var hoje14=new Date(); hoje14.setDate(hoje14.getDate()+14);
  var fim14=hoje14.toISOString().split('T')[0];
  var fut=getReservas().filter(function(r){return r.unidadeId===_uid()&&r.dataFim>=hj&&r.dataInicio<=fim14;}).sort(function(a,b){return a.dataInicio.localeCompare(b.dataInicio);}).slice(0,20);
  if(!fut.length){tb.innerHTML='<tr class="empty-row"><td colspan="5">Sem reservas futuras nos próximos 14 dias.</td></tr>';return;}
  tb.innerHTML=fut.map(function(r){
    var sala=getSalaById(r.salaId); var t=getTurmaById(r.turmaId); var inst=t&&t.instrutorId?getUserById(t.instrutorId):null;
    return '<tr><td><strong>'+esc(sala?sala.nome:'—')+'</strong>'
      +(sala&&sala.bloco?'<div style="font-size:.75rem;color:var(--text3)">'+esc(sala.bloco)+' · '+esc(sala.andar||'')+'</div>':'')
      +'</td><td class="mono">'+esc(t?t.nome:'—')+'</td>'
      +'<td>'+esc(inst?inst.nome:'—')+'</td>'
      +'<td style="font-size:.82rem">'+fmtData(r.dataInicio)+' → '+fmtData(r.dataFim)+'</td>'
      +'<td style="font-size:.82rem">'+r.diasSemana.map(function(d){return d.toUpperCase();}).join(', ')+' · '+esc(r.turno)+'</td></tr>';
  }).join('');
}

function rdChaves() {
  var list=getChaves().filter(function(c){return c.unidadeId===_uid();}); var cont=document.getElementById('listaChaves');
  if(!list.length){cont.innerHTML='<p class="txt2">Nenhuma chave cadastrada. Clique em "+ Nova Chave" para criar.</p>';return;}
  cont.innerHTML=list.map(function(c){
    var sala=getSalaById(c.salaId); var pega=c.status==='pega'; var quem=pega&&c.instrutorId?getUserById(c.instrutorId):null;
    return '<div class="chave-card '+(pega?'pega':'disponivel')+'">'
      +'<div class="ch-icon">'+(pega?'🔑':'🗝️')+'</div>'
      +'<div class="ch-info"><div class="ch-nome">'+esc(sala?sala.nome:'—')+' — '+esc(c.codigo||'Chave')+'</div>'
      +'<div class="ch-det">Andar: '+esc(c.andar||'—')+' · <strong>'+(pega?'Retirada':'Disponível')+'</strong></div>'
      +(quem?'<div class="ch-det">Retirada por: '+esc(quem.nome)+(c.pegaEm?' em '+fmtDateTime(c.pegaEm):'')+'</div>':'')
      +'</div>'
      +'<div style="display:flex;gap:6px">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirChave('+c.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirChave('+c.id+')">Excluir</button>'
      +'</div></div>';
  }).join('');
}
function abrirChave(id) {
  var c=id?getChaveById(id):null;
  document.getElementById('mCId').value=id||''; _tx('mCTit',id?'Editar Chave':'Nova Chave');
  var sel=document.getElementById('mCSala'); sel.innerHTML='<option value="">— Selecione a sala —</option>';
  getSalasByUnidade(_uid()).forEach(function(s){var o=document.createElement('option');o.value=s.id;o.textContent=s.nome+' ('+s.tipo+')';if(c&&c.salaId===s.id)o.selected=true;sel.appendChild(o);});
  document.getElementById('mCCod').value=c?c.codigo||'':''; document.getElementById('mCAndar').value=c?c.andar||'':'';
  modalAbrir('modalChave');
}
function salvarChave() {
  var id=parseInt(document.getElementById('mCId').value)||null;
  var salaId=parseInt(document.getElementById('mCSala').value)||null;
  var cod=document.getElementById('mCCod').value.trim(), andar=document.getElementById('mCAndar').value.trim();
  if(!salaId||!cod){toast('Preencha sala e código.','aviso');return;}
  var dados={salaId:salaId,codigo:cod,andar:andar,unidadeId:_uid()};
  if(id){updChave(id,dados);toast('Chave atualizada!','ok');}else{addChave(dados);toast('Chave criada!','ok');}
  modalFechar('modalChave'); rdChaves();
}
function excluirChave(id){
  if(!confirm('Excluir esta chave?'))return; delChave(id); toast('Chave excluída.','aviso'); rdChaves();
}

function rdNotifs() {
  var list=getNotifsPara('recepcao',_uid()); var cont=document.getElementById('listaNotifs');
  if(!list.length){cont.innerHTML='<p class="txt2">Sem notificações.</p>';return;}
  cont.innerHTML=list.map(function(n){
    return '<div class="notif-item tipo-'+(n.tipo||'info')+(n.lida?'':' nao-lida')+'">'
      +'<div class="ni-title">'+esc(n.titulo||'Notificação')+'</div>'
      +'<div class="ni-msg">'+esc(n.msg)+'</div>'
      +'<div class="ni-time">'+fmtDateTime(n.criadaEm)+'</div>'+'</div>';
  }).join('');
  marcarTodasLidas('recepcao',_uid()); _atualizarBadge();
}

function _atualizarBadge(){var n=countNaoLidas('recepcao',_uid());var b=document.getElementById('badgeNotif');if(b){b.textContent=n;b.style.display=n?'':'none';}}
function _tx(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}

/* ── PESQUISA CHAVES ── */
var _cfgChavRec = {
  busca:{id:'buscarChavRec', placeholder:'Pesquisar por código, sala, andar…'},
  filtros:[
    {id:'filtStatusChavRec', label:'Status', campo:'status', opcoes:[{value:'disponivel',label:'Disponível'},{value:'pega',label:'Retirada'}]},
  ]
};

var _rdChavesOrig = rdChaves;
rdChaves = function() {
  var cont = document.getElementById('searchChavRec');
  if (cont && !cont.innerHTML) montarBarraPesquisaFiltros('searchChavRec', _cfgChavRec, _renderChavRec);
  _renderChavRec();
};

function _renderChavRec() {
  var vals = lerFiltros(_cfgChavRec);
  var list = getChaves().filter(function(c){return c.unidadeId===_uid();});
  list = filtrarLista(list, vals._busca, [
    'codigo','andar',
    function(c){var s=getSalaById(c.salaId);return s?s.nome:'';},
    function(c){var u=getUserById(c.instrutorId);return u?u.nome:'';}
  ]);
  if (vals.status) list = list.filter(function(c){return c.status===vals.status;});
  var cnt = document.getElementById('countChavRec'); if (cnt) cnt.textContent = list.length+' chave(s)';
  var cont = document.getElementById('listaChaves');
  if (!list.length){cont.innerHTML='<p class="txt2">Nenhuma chave encontrada.</p>';return;}
  cont.innerHTML = list.map(function(c){
    var sala=getSalaById(c.salaId); var pega=c.status==='pega'; var quem=pega&&c.instrutorId?getUserById(c.instrutorId):null;
    return '<div class="chave-card '+(pega?'pega':'disponivel')+'">'
      +'<div class="ch-icon">'+(pega?'🔑':'🗝️')+'</div>'
      +'<div class="ch-info"><div class="ch-nome">'+esc(sala?sala.nome:'—')+' — '+esc(c.codigo||'Chave')+'</div>'
      +'<div class="ch-det">Andar: '+esc(c.andar||'—')+' · <strong>'+(pega?'Retirada':'Disponível')+'</strong></div>'
      +(quem?'<div class="ch-det">Por: '+esc(quem.nome)+(c.pegaEm?' em '+fmtDateTime(c.pegaEm):'')+'</div>':'')
      +'</div>'
      +'<div style="display:flex;gap:6px">'
      +'<button class="btn btn-ghost btn-sm" onclick="abrirChave('+c.id+')">Editar</button>'
      +'<button class="btn btn-danger btn-sm" onclick="excluirChave('+c.id+')">Excluir</button>'
      +'</div></div>';
  }).join('');
}
