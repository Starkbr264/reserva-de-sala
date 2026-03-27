/* ================================================================
   js/search.js — Pesquisa e filtros globais
   Expõe: filtrarLista(lista, termo, campos)
          gerarBarraPesquisa(configId, onUpdate)
          gerarFiltros(filtrosConfig, onUpdate)
   ================================================================ */

/**
 * Filtra um array de objetos com base em termo de busca e campos especificados.
 * @param {Array}  lista   - array de objetos
 * @param {string} termo   - texto digitado pelo usuário
 * @param {Array}  campos  - campos a checar (strings ou funções(item)=>string)
 */
function filtrarLista(lista, termo, campos) {
  if (!termo || !termo.trim()) return lista;
  var t = termo.trim().toLowerCase();
  return lista.filter(function(item) {
    return campos.some(function(c) {
      var val = typeof c === 'function' ? c(item) : (item[c] || '');
      return String(val).toLowerCase().includes(t);
    });
  });
}

/**
 * Aplica filtros de seleção (ex: por unidade, perfil, turno…)
 * @param {Array}  lista   - array de objetos
 * @param {Object} filtros - { campo: valor } — ignora valores vazios/null
 */
function aplicarFiltros(lista, filtros) {
  return lista.filter(function(item) {
    return Object.keys(filtros).every(function(k) {
      var v = filtros[k];
      if (!v && v !== 0) return true; // ignora filtro vazio
      return String(item[k]) === String(v);
    });
  });
}

/* ── Gerador de barra de pesquisa HTML ─────────────────────── */
/**
 * Retorna HTML de uma barra de pesquisa padronizada.
 * @param {string} placeholder
 * @param {string} inputId  - id do <input>
 */
function htmlBarraBusca(placeholder, inputId) {
  return '<div class="search-bar"><span class="search-icon">🔍</span>'
    + '<input type="text" id="' + inputId + '" class="search-input" placeholder="' + esc(placeholder) + '" autocomplete="off">'
    + '<button class="search-clear" onclick="document.getElementById(\'' + inputId + '\').value=\'\';document.getElementById(\'' + inputId + '\').dispatchEvent(new Event(\'input\'));" title="Limpar">✕</button>'
    + '</div>';
}

/**
 * Retorna HTML de um select de filtro.
 * @param {string} id
 * @param {string} label
 * @param {Array}  opcoes  - [{value, label}]
 */
function htmlFiltroSelect(id, label, opcoes) {
  var opts = '<option value="">Todos</option>'
    + opcoes.map(function(o){return '<option value="'+esc(String(o.value))+'">'+esc(o.label)+'</option>';}).join('');
  return '<div class="filter-item">'
    + '<label class="filter-label">'+esc(label)+'</label>'
    + '<select id="'+id+'" class="filter-select">'+opts+'</select>'
    + '</div>';
}

/**
 * Monta uma barra de pesquisa + filtros dentro de um container.
 * @param {string}   containerId  - id do div onde inserir
 * @param {Object}   config       - { busca:{id,placeholder}, filtros:[{id,label,opcoes}] }
 * @param {Function} onUpdate     - callback chamado ao mudar qualquer campo
 */
function montarBarraPesquisaFiltros(containerId, config, onUpdate) {
  var cont = document.getElementById(containerId);
  if (!cont) return;

  var html = '<div class="search-filter-bar">';

  if (config.busca) {
    html += htmlBarraBusca(config.busca.placeholder || 'Pesquisar…', config.busca.id);
  }

  if (config.filtros && config.filtros.length) {
    html += '<div class="filters-row">';
    config.filtros.forEach(function(f) {
      html += htmlFiltroSelect(f.id, f.label, f.opcoes);
    });
    if (config.mostrarBotaoLimpar !== false) {
      html += '<button class="btn btn-ghost btn-sm" style="align-self:flex-end" onclick="limparFiltros(\'' + containerId + '\',\'' + (config.busca ? config.busca.id : '') + '\')">Limpar filtros</button>';
    }
    html += '</div>';
  }

  html += '</div>';
  cont.innerHTML = html;

  // Eventos
  function dispararUpdate() { if (typeof onUpdate === 'function') onUpdate(); }

  if (config.busca) {
    var inp = document.getElementById(config.busca.id);
    if (inp) inp.addEventListener('input', dispararUpdate);
  }
  if (config.filtros) {
    config.filtros.forEach(function(f) {
      var sel = document.getElementById(f.id);
      if (sel) sel.addEventListener('change', dispararUpdate);
    });
  }
}

/**
 * Limpa todos os filtros de uma barra.
 */
function limparFiltros(containerId, buscaId) {
  var cont = document.getElementById(containerId);
  if (!cont) return;
  cont.querySelectorAll('select').forEach(function(s){ s.value = ''; });
  if (buscaId) {
    var inp = document.getElementById(buscaId);
    if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input')); return; }
  }
  // fallback: disparar evento no primeiro input
  var inp2 = cont.querySelector('input');
  if (inp2) inp2.dispatchEvent(new Event('input'));
}

/**
 * Lê os valores atuais dos filtros de uma barra.
 * @param {Object} config - mesmo config passado para montarBarraPesquisaFiltros
 */
function lerFiltros(config) {
  var resultado = {};
  if (config.busca) {
    var inp = document.getElementById(config.busca.id);
    resultado._busca = inp ? inp.value : '';
  }
  if (config.filtros) {
    config.filtros.forEach(function(f) {
      var sel = document.getElementById(f.id);
      resultado[f.campo || f.id] = sel ? sel.value : '';
    });
  }
  return resultado;
}
