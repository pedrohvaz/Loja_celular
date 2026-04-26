/* ============================================================
   PLANETA CELULAR — fin-db.js
   Banco de dados financeiro via localStorage
   Usa _storage (definido em db.js) para acesso seguro
============================================================ */

/* helper local caso db.js não esteja carregado */
const _fin_store = typeof _storage !== 'undefined' ? _storage : {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem(k,v); return true; } catch { return false; } },
  remove: k => { try { localStorage.removeItem(k); } catch {} },
  getJSON: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  setJSON: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};

const FinDB = {
  KEYS: {
    tx:      'pc_fin_tx',
    cats:    'pc_fin_cats',
    caixa:   'pc_fin_caixa',
    counter: 'pc_fin_counter',
  },

  /* ══════════════════════════════════════
     CATEGORIAS
  ══════════════════════════════════════ */
  DEFAULT_CATS: [
    { id: 'cat_r1',  nome: 'Serviços de manutenção', tipo: 'receita', icone: 'fa-wrench'               },
    { id: 'cat_r2',  nome: 'Venda de produtos',       tipo: 'receita', icone: 'fa-box'                  },
    { id: 'cat_r3',  nome: 'Venda de acessórios',     tipo: 'receita', icone: 'fa-headphones'           },
    { id: 'cat_r4',  nome: 'Outros (receita)',         tipo: 'receita', icone: 'fa-circle-plus'         },
    { id: 'cat_d1',  nome: 'Compra de peças',          tipo: 'despesa', icone: 'fa-microchip'            },
    { id: 'cat_d2',  nome: 'Compra de estoque',        tipo: 'despesa', icone: 'fa-boxes-stacking'       },
    { id: 'cat_d3',  nome: 'Aluguel',                  tipo: 'despesa', icone: 'fa-building'             },
    { id: 'cat_d4',  nome: 'Energia elétrica',         tipo: 'despesa', icone: 'fa-bolt'                 },
    { id: 'cat_d5',  nome: 'Internet e telefone',      tipo: 'despesa', icone: 'fa-wifi'                 },
    { id: 'cat_d6',  nome: 'Salários',                 tipo: 'despesa', icone: 'fa-users'                },
    { id: 'cat_d7',  nome: 'Marketing',                tipo: 'despesa', icone: 'fa-bullhorn'             },
    { id: 'cat_d8',  nome: 'Frete',                    tipo: 'despesa', icone: 'fa-truck'                },
    { id: 'cat_d9',  nome: 'Impostos',                 tipo: 'despesa', icone: 'fa-file-invoice-dollar'  },
    { id: 'cat_d10', nome: 'Outros (despesa)',          tipo: 'despesa', icone: 'fa-circle-minus'        },
  ],

  seedCategories() {
    if (!localStorage.getItem(this.KEYS.cats)) {
      localStorage.setItem(this.KEYS.cats, JSON.stringify(this.DEFAULT_CATS));
    }
  },

  getCategories(tipo = null) {
    this.seedCategories();
    const all = JSON.parse(localStorage.getItem(this.KEYS.cats)) || [];
    return tipo ? all.filter(c => c.tipo === tipo) : all;
  },

  getCatById(id) {
    return this.getCategories().find(c => c.id === id) || null;
  },

  addCategory(data) {
    const cats = this.getCategories();
    const cat = { id: 'cat_' + Date.now(), ...data };
    cats.push(cat);
    localStorage.setItem(this.KEYS.cats, JSON.stringify(cats));
    return cat;
  },

  /* ══════════════════════════════════════
     TRANSAÇÕES
  ══════════════════════════════════════ */
  _nextId() {
    const n = (parseInt(localStorage.getItem(this.KEYS.counter)) || 0) + 1;
    localStorage.setItem(this.KEYS.counter, n);
    return 'tx_' + String(n).padStart(6, '0');
  },

  getAll() {
    return JSON.parse(localStorage.getItem(this.KEYS.tx)) || [];
  },

  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  },

  add(data) {
    const list = this.getAll();
    const tx = {
      id:              this._nextId(),
      tipo:            data.tipo            || 'receita',
      categoria_id:    data.categoria_id    || '',
      descricao:       data.descricao       || '',
      valor:           parseFloat(data.valor) || 0,
      data_transacao:  data.data_transacao  || new Date().toISOString().slice(0, 10),
      data_vencimento: data.data_vencimento || null,
      status:          data.status          || 'pendente',
      forma_pagamento: data.forma_pagamento || '',
      origem:          data.origem          || 'manual',
      origem_id:       data.origem_id       || null,
      observacao:      data.observacao      || '',
      created_at:      new Date().toISOString(),
      updated_at:      new Date().toISOString(),
      historico:       [{ acao: 'criado', data: new Date().toISOString() }],
    };
    list.push(tx);
    localStorage.setItem(this.KEYS.tx, JSON.stringify(list));
    return tx;
  },

  update(id, data) {
    let updated = null;
    const list = this.getAll().map(t => {
      if (t.id !== id) return t;
      const hist = [...(t.historico || []), { acao: 'editado', data: new Date().toISOString() }];
      updated = { ...t, ...data, updated_at: new Date().toISOString(), historico: hist };
      return updated;
    });
    localStorage.setItem(this.KEYS.tx, JSON.stringify(list));
    return updated;
  },

  delete(id) {
    const list = this.getAll().filter(t => t.id !== id);
    localStorage.setItem(this.KEYS.tx, JSON.stringify(list));
  },

  registrarPagamento(id, formaPagamento, valorPago = null) {
    const tx = this.getById(id);
    if (!tx) return null;
    return this.update(id, {
      status:          'pago',
      forma_pagamento: formaPagamento,
      data_transacao:  new Date().toISOString().slice(0, 10),
      ...(valorPago !== null ? { valor: parseFloat(valorPago) } : {}),
    });
  },

  /* ── Criação automática via OS ── */
  criarDeOs(os) {
    const existing = this.getAll().find(t => t.origem === 'os' && t.origem_id === os.id);
    if (existing) {
      // Atualiza valor se mudou
      if (existing.valor !== (os.valor_total || 0)) {
        this.update(existing.id, { valor: os.valor_total || 0 });
      }
      return existing;
    }
    return this.add({
      tipo:            'receita',
      categoria_id:    'cat_r1',
      descricao:       `OS ${os.numero_os} — ${os.aparelho_marca || ''} ${os.aparelho_modelo || ''}`.trim(),
      valor:           os.valor_total || os.valor_estimado || 0,
      data_transacao:  new Date().toISOString().slice(0, 10),
      data_vencimento: os.previsao_entrega ? os.previsao_entrega.slice(0, 10) : null,
      status:          os.status_pagamento === 'pago' ? 'pago' : 'pendente',
      forma_pagamento: os.forma_pagamento || '',
      origem:          'os',
      origem_id:       os.id,
      observacao:      `Cliente: ${os.cliente_nome || ''}`,
    });
  },

  /* ── Sincroniza pagamento OS → transação ── */
  sincronizarPagamentoOs(osId, statusPagamento, formaPagamento) {
    const tx = this.getAll().find(t => t.origem === 'os' && t.origem_id === osId);
    if (!tx) return;
    if (statusPagamento === 'pago' && tx.status !== 'pago') {
      this.update(tx.id, { status: 'pago', forma_pagamento: formaPagamento, data_transacao: new Date().toISOString().slice(0, 10) });
    } else if (statusPagamento === 'pendente') {
      this.update(tx.id, { status: 'pendente' });
    }
  },

  /* ── Criação automática via venda de produto ── */
  criarDeVenda(order) {
    const existing = this.getAll().find(t => t.origem === 'venda_produto' && t.origem_id === order.id);
    if (existing) return existing;
    const payMap = { pix: 'pix', card: 'cartao_credito', whatsapp: '' };
    const forma  = order.forma_pagamento || payMap[order.payment] || '';
    return this.add({
      tipo:            'receita',
      categoria_id:    'cat_r2',
      descricao:       `Venda #${order.id.slice(-8)} — ${order.items?.length || 0} produto(s)`,
      valor:           order.total || 0,
      data_transacao:  new Date().toISOString().slice(0, 10),
      status:          'pago',
      forma_pagamento: forma,
      origem:          'venda_produto',
      origem_id:       order.id,
      observacao:      `Cliente: ${order.customer?.nome || '—'}`,
    });
  },

  /* ══════════════════════════════════════
     QUERIES E FILTROS
  ══════════════════════════════════════ */
  _filter(f = {}) {
    let list = this.getAll();
    if (f.tipo)            list = list.filter(t => t.tipo === f.tipo);
    if (f.categoria_id)    list = list.filter(t => t.categoria_id === f.categoria_id);
    if (f.status)          list = list.filter(t => t.status === f.status);
    if (f.forma_pagamento) list = list.filter(t => t.forma_pagamento === f.forma_pagamento);
    if (f.origem)          list = list.filter(t => t.origem === f.origem);
    if (f.start)           list = list.filter(t => t.data_transacao >= f.start);
    if (f.end)             list = list.filter(t => t.data_transacao <= f.end);
    if (f.search) {
      const q = f.search.toLowerCase();
      list = list.filter(t =>
        t.descricao?.toLowerCase().includes(q) ||
        t.observacao?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.data_transacao.localeCompare(a.data_transacao) || b.created_at.localeCompare(a.created_at));
  },

  getReceitas(f = {}) { return this._filter({ ...f, tipo: 'receita' }); },
  getDespesas(f = {}) { return this._filter({ ...f, tipo: 'despesa' }); },

  getPendentes(tipo = null) {
    return this._filter({ ...(tipo ? { tipo } : {}), status: 'pendente' });
  },

  getVencidos(tipo = null) {
    const today = new Date().toISOString().slice(0, 10);
    return this.getAll().filter(t =>
      t.status === 'pendente' &&
      t.data_vencimento &&
      t.data_vencimento < today &&
      (!tipo || t.tipo === tipo)
    );
  },

  getProximosVencimentos(days = 7) {
    const now     = new Date().toISOString().slice(0, 10);
    const futureD = new Date();
    futureD.setDate(futureD.getDate() + days);
    const future  = futureD.toISOString().slice(0, 10);
    return this.getAll().filter(t =>
      t.status === 'pendente' &&
      t.data_vencimento &&
      t.data_vencimento >= now &&
      t.data_vencimento <= future
    ).sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));
  },

  /* ══════════════════════════════════════
     ESTATÍSTICAS
  ══════════════════════════════════════ */
  getStats(ano, mes) {
    const pad    = n => String(n).padStart(2, '0');
    const prefix = `${ano}-${pad(mes)}`;
    const all    = this.getAll().filter(t => t.data_transacao.startsWith(prefix) && t.status !== 'cancelado');
    const rec    = all.filter(t => t.tipo === 'receita');
    const dep    = all.filter(t => t.tipo === 'despesa');
    const recPag = rec.filter(t => t.status === 'pago').reduce((s, t) => s + t.valor, 0);
    const depPag = dep.filter(t => t.status === 'pago').reduce((s, t) => s + t.valor, 0);
    const recPen = rec.filter(t => t.status === 'pendente').reduce((s, t) => s + t.valor, 0);
    const depPen = dep.filter(t => t.status === 'pendente').reduce((s, t) => s + t.valor, 0);
    return {
      receitas_pagas:   recPag,
      despesas_pagas:   depPag,
      lucro:            recPag - depPag,
      a_receber:        recPen,
      a_pagar:          depPen,
      saldo:            recPag - depPag,
    };
  },

  getLast6MonthsStats() {
    const now    = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const stats = this.getStats(d.getFullYear(), d.getMonth() + 1);
      result.push({
        label:    d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receitas: stats.receitas_pagas,
        despesas: stats.despesas_pagas,
        lucro:    stats.lucro,
      });
    }
    return result;
  },

  getDailyRevenueCurrentMonth() {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;
    const pad   = n => String(n).padStart(2, '0');
    const prefix = `${year}-${pad(month)}`;
    const days  = new Date(year, month, 0).getDate();
    const txs   = this.getAll().filter(t =>
      t.data_transacao.startsWith(prefix) && t.tipo === 'receita' && t.status === 'pago'
    );
    return Array.from({ length: days }, (_, i) => {
      const day = pad(i + 1);
      const val = txs.filter(t => t.data_transacao === `${prefix}-${day}`).reduce((s, t) => s + t.valor, 0);
      return { day: i + 1, valor: val };
    });
  },

  getDistribuicaoPorCategoria(tipo, ano, mes) {
    const pad    = n => String(n).padStart(2, '0');
    const prefix = ano && mes ? `${ano}-${pad(mes)}` : null;
    let list     = this._filter({ tipo });
    if (prefix)  list = list.filter(t => t.data_transacao.startsWith(prefix));
    list = list.filter(t => t.status !== 'cancelado');
    const map = {};
    list.forEach(t => {
      const cat   = this.getCatById(t.categoria_id);
      const label = cat?.nome || 'Sem categoria';
      map[label]  = (map[label] || 0) + t.valor;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  },

  /* ══════════════════════════════════════
     CAIXA
  ══════════════════════════════════════ */
  getCaixas() {
    return JSON.parse(localStorage.getItem(this.KEYS.caixa)) || [];
  },

  _saveCaixas(list) {
    localStorage.setItem(this.KEYS.caixa, JSON.stringify(list));
  },

  getCaixaAberto() {
    return this.getCaixas().find(c => c.status === 'aberto') || null;
  },

  abrirCaixa(valorAbertura, obs = '') {
    const caixas = this.getCaixas();
    const agora  = new Date().toISOString();
    const c = {
      id:             'cx_' + Date.now(),
      data:           agora.slice(0, 10),
      abertura_em:    agora,
      saldo_abertura: parseFloat(valorAbertura) || 0,
      fechamento_em:  null,
      saldo_contado:  null,
      saldo_esperado: null,
      entradas:       0,
      saidas:         0,
      diferenca:      null,
      observacao:     obs,
      status:         'aberto',
    };
    caixas.push(c);
    this._saveCaixas(caixas);
    return c;
  },

  fecharCaixa(caixaId, valorFechamento, obs = '') {
    const caixas = this.getCaixas();
    let fechado  = null;
    const updated = caixas.map(c => {
      if (c.id !== caixaId) return c;
      const dataAb  = (c.abertura_em || c.data).slice(0, 10);
      const today   = new Date().toISOString().slice(0, 10);
      const txsDin  = this.getAll().filter(t =>
        t.forma_pagamento === 'dinheiro' && t.status === 'pago' &&
        t.data_transacao >= dataAb && t.data_transacao <= today
      );
      const entradas = txsDin.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
      const saidas   = txsDin.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
      const esperado = (c.saldo_abertura || 0) + entradas - saidas;
      const diff     = parseFloat(valorFechamento) - esperado;
      fechado = {
        ...c,
        fechamento_em:  new Date().toISOString(),
        saldo_contado:  parseFloat(valorFechamento),
        saldo_esperado: esperado,
        entradas,
        saidas,
        diferenca:      diff,
        observacao:     obs || c.observacao,
        status:         'fechado',
      };
      return fechado;
    });
    this._saveCaixas(updated);
    return fechado;
  },

  getHistoricoCaixa() {
    return this.getCaixas().sort((a, b) => b.data_abertura.localeCompare(a.data_abertura));
  },

  /* ══════════════════════════════════════
     EXPORT CSV
  ══════════════════════════════════════ */
  exportCSV(list) {
    const header = ['ID','Tipo','Categoria','Descrição','Valor','Data','Vencimento','Status','Pagamento','Origem','Observação'];
    const cats   = this.getCategories();
    const rows   = list.map(t => {
      const cat = cats.find(c => c.id === t.categoria_id);
      return [
        t.id, t.tipo,
        cat?.nome || '',
        `"${(t.descricao || '').replace(/"/g, '""')}"`,
        t.valor.toFixed(2).replace('.', ','),
        t.data_transacao,
        t.data_vencimento || '',
        t.status, t.forma_pagamento, t.origem,
        `"${(t.observacao || '').replace(/"/g, '""')}"`,
      ].join(';');
    });
    const csv  = '﻿' + [header.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `financeiro_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

/* ══════════════════════════════════════
   HELPERS GLOBAIS
══════════════════════════════════════ */
function finTipoLabel(tipo) {
  return { receita: 'Receita', despesa: 'Despesa' }[tipo] || tipo;
}

function finStatusLabel(status) {
  return { pago: 'Pago', pendente: 'Pendente', cancelado: 'Cancelado' }[status] || status;
}

function finPgtoLabel(pgto) {
  return {
    dinheiro:       'Dinheiro',
    pix:            'PIX',
    cartao_credito: 'Cartão Crédito',
    cartao_debito:  'Cartão Débito',
    transferencia:  'Transferência',
  }[pgto] || pgto || '—';
}

function finStatusBadge(status) {
  const map = {
    pago:      { cls: 'fin-badge--green',  lbl: 'Pago'      },
    pendente:  { cls: 'fin-badge--yellow', lbl: 'Pendente'  },
    cancelado: { cls: 'fin-badge--gray',   lbl: 'Cancelado' },
  };
  const s = map[status] || { cls: 'fin-badge--gray', lbl: status };
  return `<span class="fin-badge ${s.cls}">${s.lbl}</span>`;
}

function finTipoBadge(tipo) {
  const cls = tipo === 'receita' ? 'fin-badge--green' : 'fin-badge--red';
  const lbl = tipo === 'receita' ? '▲ Receita' : '▼ Despesa';
  return `<span class="fin-badge ${cls}">${lbl}</span>`;
}

function diasEmAberto(vencimento) {
  if (!vencimento) return 0;
  const diff = new Date().getTime() - new Date(vencimento + 'T00:00:00').getTime();
  return Math.floor(diff / 86400000);
}

function vencAlertCls(vencimento) {
  if (!vencimento) return '';
  const today = new Date().toISOString().slice(0, 10);
  if (vencimento < today)       return 'venc--red';
  const dias = Math.ceil((new Date(vencimento) - new Date()) / 86400000);
  if (dias <= 0)                return 'venc--yellow';
  if (dias <= 3)                return 'venc--orange';
  return '';
}

/* Obtém o primeiro/último dia de um mês */
function primeiroDia(ano, mes) {
  return `${ano}-${String(mes).padStart(2,'0')}-01`;
}
function ultimoDia(ano, mes) {
  return new Date(ano, mes, 0).toISOString().slice(0, 10);
}
