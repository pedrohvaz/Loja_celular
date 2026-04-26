/* ============================================================
   PLANETA CELULAR — supabase-client.js
   Camada de sincronização com Supabase.

   CONFIGURAÇÃO: substitua os valores abaixo com os dados
   do seu projeto em https://supabase.com/dashboard
   Project Settings → API → URL e anon/public key
============================================================ */

const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_ANONIMA_PUBLICA';

/* ── Inicializa cliente ── */
let _supa = null;
try {
  if (typeof supabase !== 'undefined') {
    _supa = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.warn('[SDB] Supabase CDN não carregado. Dados ficam locais.');
  }
} catch (e) {
  console.warn('[SDB] Erro ao inicializar Supabase:', e.message);
}

/* ============================================================
   SDB — Sync layer
============================================================ */
const SDB = {

  /* ── Mapeadores: localStorage → Supabase ── */
  _toDB: {
    produto: p => ({
      id:          p.id,
      nome:        p.name        ?? '',
      categoria:   p.category    ?? '',
      marca:       p.brand       ?? '',
      condicao:    p.condition   ?? '',
      preco:       p.price       ?? 0,
      preco_antigo: p.oldPrice   ?? null,
      descricao:   p.description ?? '',
      imagem:      p.image       ?? '',
      em_estoque:  p.inStock     ?? true,
    }),
    pedido: o => ({
      id:       o.id,
      customer: o.customer ?? null,
      items:    o.items    ?? [],
      total:    o.total    ?? 0,
      payment:  o.payment  ?? '',
      shipping: o.shipping ?? null,
      status:   o.status   ?? 'pending',
      date:     o.date     ?? new Date().toISOString(),
    }),
    cliente: c => ({
      id:          c.id,
      nome:        c.nome        ?? '',
      telefone:    c.telefone    ?? null,
      email:       c.email       ?? null,
      cpf:         c.cpf         ?? null,
      nascimento:  c.nascimento  ?? null,
      endereco:    c.endereco    ?? null,
      cidade:      c.cidade      ?? null,
      estado:      c.estado      ?? null,
      observacoes: c.observacoes ?? null,
      created_at:  c.createdAt   ?? new Date().toISOString(),
    }),
    campanha: c => ({
      id:        c.id,
      nome:      c.nome      ?? '',
      tipo:      c.tipo      ?? null,
      status:    c.status    ?? 'planejada',
      inicio:    c.inicio    ?? null,
      fim:       c.fim       ?? null,
      publico:   c.publico   ?? null,
      mensagem:  c.mensagem  ?? null,
      created_at: c.createdAt ?? new Date().toISOString(),
    }),
    os: o => ({
      id:                   o.id,
      numero_os:            o.numero_os            ?? null,
      status:               o.status               ?? 'aguardando_diagnostico',
      status_pagamento:     o.status_pagamento     ?? 'pendente',
      data_entrada:         o.data_entrada         ?? null,
      previsao_entrega:     o.previsao_entrega     ?? null,
      data_conclusao:       o.data_conclusao       ?? null,
      data_entrega:         o.data_entrega         ?? null,
      prioridade:           o.prioridade           ?? 'normal',
      cliente_nome:         o.cliente_nome         ?? '',
      cliente_cpf:          o.cliente_cpf          ?? null,
      cliente_telefone:     o.cliente_telefone     ?? null,
      cliente_email:        o.cliente_email        ?? null,
      cliente_endereco:     o.cliente_endereco     ?? null,
      aparelho_marca:       o.aparelho_marca       ?? '',
      aparelho_modelo:      o.aparelho_modelo      ?? '',
      aparelho_imei:        o.aparelho_imei        ?? null,
      aparelho_cor:         o.aparelho_cor         ?? null,
      aparelho_senha:       o.aparelho_senha       ?? null,
      acessorios:           o.acessorios           ?? [],
      condicoes_visuais:    o.condicoes_visuais    ?? null,
      tecnico:              o.tecnico              ?? null,
      problema_relatado:    o.problema_relatado    ?? '',
      laudo_tecnico:        o.laudo_tecnico        ?? null,
      servicos_realizados:  o.servicos_realizados  ?? [],
      pecas_utilizadas:     o.pecas_utilizadas     ?? [],
      valor_servico:        o.valor_servico        ?? 0,
      valor_pecas:          o.valor_pecas          ?? 0,
      valor_total:          o.valor_total          ?? 0,
      desconto:             o.desconto             ?? 0,
      valor_estimado:       o.valor_estimado       ?? 0,
      forma_pagamento:      o.forma_pagamento      ?? null,
      observacoes_internas: o.observacoes_internas ?? null,
      historico_status:     o.historico_status     ?? [],
      created_at:           o.created_at           ?? new Date().toISOString(),
      updated_at:           o.updated_at           ?? new Date().toISOString(),
    }),
    transacao: t => ({ ...t }),
    categoria: c => ({ ...c }),
    caixa:     c => ({ ...c }),
  },

  /* ── Mapeadores: Supabase → localStorage ── */
  _fromDB: {
    produto: r => ({
      id:          r.id,
      name:        r.nome,
      category:    r.categoria,
      brand:       r.marca,
      condition:   r.condicao,
      price:       Number(r.preco),
      oldPrice:    r.preco_antigo != null ? Number(r.preco_antigo) : null,
      description: r.descricao,
      image:       r.imagem,
      inStock:     r.em_estoque,
    }),
    cliente: r => ({
      id:          r.id,
      nome:        r.nome,
      telefone:    r.telefone,
      email:       r.email,
      cpf:         r.cpf,
      nascimento:  r.nascimento,
      endereco:    r.endereco,
      cidade:      r.cidade,
      estado:      r.estado,
      observacoes: r.observacoes,
      createdAt:   r.created_at,
    }),
    campanha: r => ({
      id:        r.id,
      nome:      r.nome,
      tipo:      r.tipo,
      status:    r.status,
      inicio:    r.inicio,
      fim:       r.fim,
      publico:   r.publico,
      mensagem:  r.mensagem,
      createdAt: r.created_at,
    }),
    // os, pedido, transacao, categoria, caixa: mapeamento idêntico
    identity: r => r,
  },

  /* ── Push (upsert) para o Supabase ── */
  async _push(table, record) {
    if (!_supa) return;
    const { error } = await _supa.from(table).upsert(record, { onConflict: 'id' });
    if (error) console.warn(`[SDB] push ${table}:`, error.message);
  },

  /* ── Delete do Supabase ── */
  async _delete(table, id) {
    if (!_supa) return;
    const { error } = await _supa.from(table).delete().eq('id', id);
    if (error) console.warn(`[SDB] delete ${table}:`, error.message);
  },

  /* ── Migração inicial: local → Supabase ── */
  async _migrate(table, records) {
    if (!_supa || !records?.length) return;
    const { error } = await _supa.from(table).upsert(records, { onConflict: 'id' });
    if (error) console.warn(`[SDB] migrate ${table}:`, error.message);
    else console.info(`[SDB] migrated ${records.length} records → ${table}`);
  },

  /* ── Pull: Supabase → localStorage ── */
  async _loadFromSupabase() {
    if (!_supa) return;

    const configs = [
      {
        table:   'produtos',
        getKey:  () => typeof ProductDB  !== 'undefined' ? ProductDB.KEY  : null,
        fromDB:  r => this._fromDB.produto(r),
        toDB:    r => this._toDB.produto(r),
        seed:    () => { if (typeof ProductDB !== 'undefined') ProductDB.seed(); },
      },
      {
        table:   'pedidos',
        getKey:  () => typeof OrderDB    !== 'undefined' ? OrderDB.KEY    : null,
        fromDB:  r => this._fromDB.identity(r),
        toDB:    r => this._toDB.pedido(r),
        seed:    null,
      },
      {
        table:   'clientes',
        getKey:  () => typeof CustomerDB !== 'undefined' ? CustomerDB.KEY : null,
        fromDB:  r => this._fromDB.cliente(r),
        toDB:    r => this._toDB.cliente(r),
        seed:    null,
      },
      {
        table:   'campanhas',
        getKey:  () => typeof CampaignDB !== 'undefined' ? CampaignDB.KEY : null,
        fromDB:  r => this._fromDB.campanha(r),
        toDB:    r => this._toDB.campanha(r),
        seed:    null,
      },
      {
        table:   'ordens_servico',
        getKey:  () => typeof OSDB       !== 'undefined' ? OSDB.KEY       : null,
        fromDB:  r => this._fromDB.identity(r),
        toDB:    r => this._toDB.os(r),
        seed:    null,
        afterPull: async () => {
          // Sincroniza counter local com o maior número de OS no Supabase
          if (typeof OSDB === 'undefined') return;
          const { data } = await _supa
            .from('ordens_servico')
            .select('numero_os')
            .order('created_at', { ascending: false })
            .limit(1);
          if (data?.[0]?.numero_os) {
            const n = parseInt(data[0].numero_os.split('-')[2]) || 0;
            const local = parseInt(localStorage.getItem(OSDB.COUNTER_KEY)) || 0;
            if (n > local) localStorage.setItem(OSDB.COUNTER_KEY, n);
          }
        },
      },
      {
        table:   'transacoes_financeiras',
        getKey:  () => typeof FinDB !== 'undefined' ? FinDB.KEYS.tx    : null,
        fromDB:  r => this._fromDB.identity(r),
        toDB:    r => this._toDB.transacao(r),
        seed:    null,
      },
      {
        table:   'categorias_financeiras',
        getKey:  () => typeof FinDB !== 'undefined' ? FinDB.KEYS.cats  : null,
        fromDB:  r => this._fromDB.identity(r),
        toDB:    r => this._toDB.categoria(r),
        seed:    () => { if (typeof FinDB !== 'undefined') FinDB.seedCategories(); },
      },
      {
        table:   'caixas',
        getKey:  () => typeof FinDB !== 'undefined' ? FinDB.KEYS.caixa : null,
        fromDB:  r => this._fromDB.identity(r),
        toDB:    r => this._toDB.caixa(r),
        seed:    null,
      },
    ];

    await Promise.allSettled(configs.map(async cfg => {
      const key = cfg.getKey();
      if (!key) return;

      try {
        const { data, error } = await _supa.from(cfg.table).select('*');
        if (error) { console.warn(`[SDB] pull ${cfg.table}:`, error.message); return; }

        if (data && data.length > 0) {
          /* Supabase tem dados → sobrescreve localStorage */
          localStorage.setItem(key, JSON.stringify(data.map(cfg.fromDB)));
        } else {
          /* Supabase vazio → verifica localStorage */
          let local;
          try { local = JSON.parse(localStorage.getItem(key)); } catch { local = null; }

          if (!local?.length && cfg.seed) {
            cfg.seed();
            try { local = JSON.parse(localStorage.getItem(key)); } catch { local = null; }
          }

          /* Migração inicial: local → Supabase */
          if (local?.length) {
            await this._migrate(cfg.table, local.map(cfg.toDB));
          }
        }

        if (cfg.afterPull) await cfg.afterPull();
      } catch (e) {
        console.warn(`[SDB] erro em ${cfg.table}:`, e.message);
      }
    }));
  },

  /* ── Patcha todos os métodos de escrita dos DBs ── */
  _patchAll() {
    /* ─ ProductDB ─ */
    if (typeof ProductDB !== 'undefined') {
      const _add = ProductDB.add.bind(ProductDB);
      ProductDB.add = data => {
        const r = _add(data);
        this._push('produtos', this._toDB.produto(r)).catch(console.warn);
        return r;
      };
      const _upd = ProductDB.update.bind(ProductDB);
      ProductDB.update = (id, data) => {
        _upd(id, data);
        const r = ProductDB.getById(id);
        if (r) this._push('produtos', this._toDB.produto(r)).catch(console.warn);
      };
      const _del = ProductDB.delete.bind(ProductDB);
      ProductDB.delete = id => { _del(id); this._delete('produtos', id).catch(console.warn); };
    }

    /* ─ OrderDB ─ */
    if (typeof OrderDB !== 'undefined') {
      const _add = OrderDB.add.bind(OrderDB);
      OrderDB.add = data => {
        const r = _add(data);
        this._push('pedidos', this._toDB.pedido(r)).catch(console.warn);
        return r;
      };
      const _upd = OrderDB.updateStatus.bind(OrderDB);
      OrderDB.updateStatus = (id, status) => {
        _upd(id, status);
        const r = OrderDB.getAll().find(o => o.id === id);
        if (r) this._push('pedidos', this._toDB.pedido(r)).catch(console.warn);
      };
      const _del = OrderDB.delete.bind(OrderDB);
      OrderDB.delete = id => { _del(id); this._delete('pedidos', id).catch(console.warn); };
    }

    /* ─ CustomerDB ─ */
    if (typeof CustomerDB !== 'undefined') {
      const _add = CustomerDB.add.bind(CustomerDB);
      CustomerDB.add = data => {
        const r = _add(data);
        this._push('clientes', this._toDB.cliente(r)).catch(console.warn);
        return r;
      };
      const _upd = CustomerDB.update.bind(CustomerDB);
      CustomerDB.update = (id, data) => {
        _upd(id, data);
        const r = CustomerDB.getById(id);
        if (r) this._push('clientes', this._toDB.cliente(r)).catch(console.warn);
      };
      const _del = CustomerDB.delete.bind(CustomerDB);
      CustomerDB.delete = id => { _del(id); this._delete('clientes', id).catch(console.warn); };
    }

    /* ─ CampaignDB ─ */
    if (typeof CampaignDB !== 'undefined') {
      const _add = CampaignDB.add.bind(CampaignDB);
      CampaignDB.add = data => {
        const r = _add(data);
        this._push('campanhas', this._toDB.campanha(r)).catch(console.warn);
        return r;
      };
      const _upd = CampaignDB.update.bind(CampaignDB);
      CampaignDB.update = (id, data) => {
        _upd(id, data);
        const r = CampaignDB.getById(id);
        if (r) this._push('campanhas', this._toDB.campanha(r)).catch(console.warn);
      };
      const _del = CampaignDB.delete.bind(CampaignDB);
      CampaignDB.delete = id => { _del(id); this._delete('campanhas', id).catch(console.warn); };
    }

    /* ─ OSDB ─ */
    if (typeof OSDB !== 'undefined') {
      const _add = OSDB.add.bind(OSDB);
      OSDB.add = data => {
        const r = _add(data);
        this._push('ordens_servico', this._toDB.os(r)).catch(console.warn);
        return r;
      };
      const _upd = OSDB.update.bind(OSDB);
      OSDB.update = (id, data) => {
        const r = _upd(id, data);
        if (r) this._push('ordens_servico', this._toDB.os(r)).catch(console.warn);
        return r;
      };
      const _del = OSDB.delete.bind(OSDB);
      OSDB.delete = id => { _del(id); this._delete('ordens_servico', id).catch(console.warn); };
    }

    /* ─ FinDB ─ */
    if (typeof FinDB !== 'undefined') {
      /* transações */
      const _addTx = FinDB.add.bind(FinDB);
      FinDB.add = data => {
        const r = _addTx(data);
        this._push('transacoes_financeiras', this._toDB.transacao(r)).catch(console.warn);
        return r;
      };
      const _updTx = FinDB.update.bind(FinDB);
      FinDB.update = (id, data) => {
        const r = _updTx(id, data);
        if (r) this._push('transacoes_financeiras', this._toDB.transacao(r)).catch(console.warn);
        return r;
      };
      const _delTx = FinDB.delete.bind(FinDB);
      FinDB.delete = id => { _delTx(id); this._delete('transacoes_financeiras', id).catch(console.warn); };

      /* categorias */
      const _addCat = FinDB.addCategory.bind(FinDB);
      FinDB.addCategory = data => {
        const r = _addCat(data);
        this._push('categorias_financeiras', this._toDB.categoria(r)).catch(console.warn);
        return r;
      };

      /* caixa */
      const _abrir = FinDB.abrirCaixa.bind(FinDB);
      FinDB.abrirCaixa = (...args) => {
        const r = _abrir(...args);
        this._push('caixas', this._toDB.caixa(r)).catch(console.warn);
        return r;
      };
      const _fechar = FinDB.fecharCaixa.bind(FinDB);
      FinDB.fecharCaixa = (...args) => {
        const r = _fechar(...args);
        if (r) this._push('caixas', this._toDB.caixa(r)).catch(console.warn);
        return r;
      };
    }
  },
};

/* ============================================================
   Auto-intercept de DOMContentLoaded

   Este bloco sobrescreve document.addEventListener para que
   qualquer handler de DOMContentLoaded registrado DEPOIS deste
   script seja envolvido automaticamente em:
     1. SDB._patchAll()          — patcha os métodos de escrita
     2. SDB._loadFromSupabase()  — puxa dados do Supabase
     3. handler original
============================================================ */
;(function () {
  let _synced = false;
  const _orig = document.addEventListener.bind(document);

  document.addEventListener = function (type, handler, options) {
    if (type !== 'DOMContentLoaded') return _orig(type, handler, options);

    const wrapped = async function (...args) {
      if (!_synced) {
        _synced = true;
        try {
          SDB._patchAll();
          await SDB._loadFromSupabase();
        } catch (e) {
          console.warn('[SDB] offline — usando dados locais:', e.message);
        }
      }
      return handler.apply(this, args);
    };

    return _orig(type, wrapped, options);
  };
})();
