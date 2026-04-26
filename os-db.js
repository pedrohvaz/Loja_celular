/* ============================================================
   PLANETA CELULAR — os-db.js
   Banco de dados de Ordens de Serviço via localStorage
   Usa _storage (definido em db.js) para acesso seguro
============================================================ */

/* helper local caso db.js não esteja carregado */
const _os_store = typeof _storage !== 'undefined' ? _storage : {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem(k,v); return true; } catch { return false; } },
  remove: k => { try { localStorage.removeItem(k); } catch {} },
  getJSON: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  setJSON: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};

const OSDB = {
  KEY:         'pc_os',
  COUNTER_KEY: 'pc_os_counter',

  /* ── Gera número único: OS-2026-0001 ── */
  _nextNumber() {
    const n = (parseInt(localStorage.getItem(this.COUNTER_KEY)) || 0) + 1;
    localStorage.setItem(this.COUNTER_KEY, n);
    return `OS-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
  },

  getAll() {
    return JSON.parse(localStorage.getItem(this.KEY)) || [];
  },

  getById(id) {
    return this.getAll().find(o => o.id === id) || null;
  },

  getByNumero(numero) {
    return this.getAll().find(o => o.numero_os === numero) || null;
  },

  add(data) {
    const list = this.getAll();
    const os = {
      // meta
      id:                  'os_' + Date.now(),
      numero_os:           this._nextNumber(),
      data_entrada:        data.data_entrada || new Date().toISOString(),
      previsao_entrega:    data.previsao_entrega || null,
      status:              'aguardando_diagnostico',
      status_pagamento:    'pendente',
      created_at:          new Date().toISOString(),
      updated_at:          new Date().toISOString(),
      historico_status:    [{ status: 'aguardando_diagnostico', data: new Date().toISOString(), obs: 'OS aberta' }],
      // cliente
      cliente_nome:        data.cliente_nome        || '',
      cliente_cpf:         data.cliente_cpf         || '',
      cliente_telefone:    data.cliente_telefone    || '',
      cliente_email:       data.cliente_email       || '',
      cliente_endereco:    data.cliente_endereco    || '',
      // aparelho
      aparelho_marca:      data.aparelho_marca      || '',
      aparelho_modelo:     data.aparelho_modelo     || '',
      aparelho_imei:       data.aparelho_imei       || '',
      aparelho_cor:        data.aparelho_cor        || '',
      aparelho_senha:      data.aparelho_senha      || '',
      acessorios:          data.acessorios          || [],
      condicoes_visuais:   data.condicoes_visuais   || '',
      // técnico / serviço
      tecnico:             data.tecnico             || '',
      problema_relatado:   data.problema_relatado   || '',
      laudo_tecnico:       data.laudo_tecnico       || '',
      servicos_realizados: data.servicos_realizados || [],
      pecas_utilizadas:    data.pecas_utilizadas    || [],
      // financeiro
      valor_servico:       parseFloat(data.valor_servico)  || 0,
      valor_pecas:         parseFloat(data.valor_pecas)    || 0,
      valor_total:         parseFloat(data.valor_total)    || 0,
      desconto:            parseFloat(data.desconto)       || 0,
      forma_pagamento:     data.forma_pagamento     || '',
      // datas de conclusão
      data_conclusao:      data.data_conclusao      || null,
      data_entrega:        data.data_entrega        || null,
      // extras
      observacoes_internas: data.observacoes_internas || '',
      valor_estimado:      parseFloat(data.valor_estimado) || 0,
      prioridade:          data.prioridade          || 'normal',
    };
    list.push(os);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return os;
  },

  update(id, data) {
    const list = this.getAll().map(o => {
      if (o.id !== id) return o;
      return { ...o, ...data, updated_at: new Date().toISOString() };
    });
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return list.find(o => o.id === id);
  },

  setStatus(id, novoStatus, obs = '') {
    const os = this.getById(id);
    if (!os) return null;
    const historico = os.historico_status || [];
    historico.push({ status: novoStatus, data: new Date().toISOString(), obs });
    const extra = {};
    if (novoStatus === 'concluido')  extra.data_conclusao = new Date().toISOString();
    if (novoStatus === 'entregue')   extra.data_entrega   = new Date().toISOString();
    return this.update(id, { status: novoStatus, historico_status: historico, ...extra });
  },

  delete(id) {
    const list = this.getAll().filter(o => o.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  searchByImei(imei) {
    if (!imei) return [];
    return this.getAll().filter(o => o.aparelho_imei?.includes(imei.trim()));
  },

  getByCliente(cpf) {
    return this.getAll().filter(o => o.cliente_cpf === cpf);
  },

  getStats() {
    const all = this.getAll();
    const now  = new Date();
    const today = now.toDateString();
    const mesAtual = `${now.getFullYear()}-${now.getMonth()}`;
    return {
      total:             all.length,
      abertas:           all.filter(o => !['entregue','cancelado'].includes(o.status)).length,
      em_reparo:         all.filter(o => o.status === 'em_reparo').length,
      aguardando_peca:   all.filter(o => o.status === 'aguardando_peca').length,
      aguardando_aprov:  all.filter(o => o.status === 'aguardando_aprovacao').length,
      prontas:           all.filter(o => o.status === 'concluido').length,
      entregues:         all.filter(o => o.status === 'entregue').length,
      canceladas:        all.filter(o => o.status === 'cancelado').length,
      abertas_hoje:      all.filter(o => new Date(o.data_entrada).toDateString() === today).length,
      vencidas:          all.filter(o => {
        if (!o.previsao_entrega || ['entregue','cancelado'].includes(o.status)) return false;
        return new Date(o.previsao_entrega) < now;
      }).length,
      faturamento_mes:   all.filter(o => {
        if (!o.data_conclusao) return false;
        const d = new Date(o.data_conclusao);
        return `${d.getFullYear()}-${d.getMonth()}` === mesAtual && o.status_pagamento === 'pago';
      }).reduce((s, o) => s + (o.valor_total || 0), 0),
    };
  },

  getRankingServicos() {
    const map = {};
    this.getAll().forEach(os => {
      (os.servicos_realizados || []).forEach(s => {
        map[s.descricao] = (map[s.descricao] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  },

  getRankingMarcas() {
    const map = {};
    this.getAll().forEach(os => {
      const marca = os.aparelho_marca;
      if (marca) map[marca] = (map[marca] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  },

  /* Vincula peça ao ProductDB e desconta estoque */
  consumirPeca(produtoId, quantidade = 1) {
    const p = ProductDB.getById(produtoId);
    if (!p) return;
    ProductDB.update(produtoId, { inStock: p.inStock && quantidade <= 1 ? true : false });
  },
};

/* ── Labels e helpers de OS ── */
const OS_STATUS = {
  aguardando_diagnostico: { label: 'Aguardando Diagnóstico', color: '#F59E0B',  bg: '#FEF3C7', cls: 'os-status--yellow'  },
  em_reparo:              { label: 'Em Reparo',              color: '#3B82F6',  bg: '#DBEAFE', cls: 'os-status--blue'    },
  aguardando_peca:        { label: 'Aguardando Peça',        color: '#8B5CF6',  bg: '#EDE9FE', cls: 'os-status--purple'  },
  aguardando_aprovacao:   { label: 'Aguardando Aprovação',   color: '#F97316',  bg: '#FFEDD5', cls: 'os-status--orange'  },
  concluido:              { label: 'Concluído',              color: '#22C55E',  bg: '#DCFCE7', cls: 'os-status--green'   },
  entregue:               { label: 'Entregue',               color: '#16A34A',  bg: '#BBF7D0', cls: 'os-status--teal'   },
  cancelado:              { label: 'Cancelado',              color: '#EF4444',  bg: '#FEE2E2', cls: 'os-status--red'    },
};

function osStatusBadge(status) {
  const s = OS_STATUS[status] || { label: status, color: '#64748B', bg: '#F1F5F9', cls: '' };
  return `<span class="os-badge ${s.cls}" style="color:${s.color};background:${s.bg}">${s.label}</span>`;
}

function osStatusLabel(status) {
  return OS_STATUS[status]?.label || status;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatDatetime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function isVencida(os) {
  if (!os.previsao_entrega || ['entregue','cancelado'].includes(os.status)) return false;
  return new Date(os.previsao_entrega) < new Date();
}
