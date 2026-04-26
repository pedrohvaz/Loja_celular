/* ============================================================
   PLANETA CELULAR — configuracoes.js
============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  AuthDB.requireAuth();

  /* ── Sidebar ── */
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle').addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !document.getElementById('sidebarToggle').contains(e.target))
      sidebar.classList.remove('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    AuthDB.logout();
    window.location.href = 'admin.html';
  });

  /* ── Papel / nome ── */
  const isAdmin = AuthDB.isAdmin();
  document.getElementById('topbarUserName').textContent = AuthDB.getNome();

  /* ── Status rápido do banco na lista ── */
  const dbSub = document.getElementById('dbStatusSub');
  if (dbSub) {
    try {
      const t = '__pc_test__'; localStorage.setItem(t, '1'); localStorage.removeItem(t);
      const total = ProductDB.getAll().length + (typeof OSDB !== 'undefined' ? OSDB.getAll().length : 0);
      dbSub.textContent = `✔ OK — ${total} registro(s) encontrado(s)`;
      dbSub.style.color = '#15803D';
    } catch {
      dbSub.textContent = '✘ Storage bloqueado — dados não serão salvos';
      dbSub.style.color = '#DC2626';
    }
  }
  if (!isAdmin) {
    const finNav = document.getElementById('financeiroNav');
    if (finNav) finNav.style.display = 'none';
    document.getElementById('cfgUsuariosItem').style.display = 'none';
  }

  /* ── Toast ── */
  const toastEl = document.getElementById('toast');
  function showToast(msg, type = 'success') {
    toastEl.textContent = msg;
    toastEl.className = `toast toast--${type}`;
    toastEl.hidden = false;
    setTimeout(() => { toastEl.hidden = true; }, 3000);
  }

  /* ══════════════════════════════════════
     DARK MODE
  ══════════════════════════════════════ */
  const darkToggle = document.getElementById('darkToggle');
  darkToggle.checked = localStorage.getItem('pc_dark_mode') === '1';

  darkToggle.addEventListener('change', () => {
    if (darkToggle.checked) {
      document.body.classList.add('dark');
      localStorage.setItem('pc_dark_mode', '1');
    } else {
      document.body.classList.remove('dark');
      localStorage.removeItem('pc_dark_mode');
    }
  });

  /* ══════════════════════════════════════
     SUB-PAINEL
  ══════════════════════════════════════ */
  const overlay   = document.getElementById('cfgOverlay');
  const panelBody = document.getElementById('cfgPanelBody');
  const panelFoot = document.getElementById('cfgPanelFooter');
  const panelTitle = document.getElementById('cfgPanelTitle');
  const panelSave  = document.getElementById('cfgPanelSave');

  function openPanel(title, html, onSave = null) {
    panelTitle.textContent = title;
    panelBody.innerHTML    = html;
    if (onSave) {
      panelFoot.style.display = '';
      panelSave.onclick = onSave;
    } else {
      panelFoot.style.display = 'none';
    }
    overlay.classList.add('open');
  }

  function closePanel() { overlay.classList.remove('open'); }

  document.getElementById('cfgPanelBack').addEventListener('click', closePanel);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });

  /* ══════════════════════════════════════
     CLIQUES NOS ITENS
  ══════════════════════════════════════ */
  document.querySelectorAll('.cfg-item[data-cfg]').forEach(item => {
    item.addEventListener('click', () => {
      const cfg = item.dataset.cfg;
      if (cfg === 'breve') { showToast('Em desenvolvimento', 'info'); return; }
      PANELS[cfg]?.();
    });
  });

  /* ── Empresa ── */
  const EMP_KEY = 'pc_empresa';

  function getEmpresa() {
    try { return JSON.parse(localStorage.getItem(EMP_KEY)) || {}; } catch { return {}; }
  }

  function saveEmpresa(data) {
    localStorage.setItem(EMP_KEY, JSON.stringify(data));
  }

  /* ── Formas de pagamento ── */
  const PGTO_KEY = 'pc_pgto_config';
  const PGTO_DEFAULT = {
    dinheiro: true, pix: true, cartao_credito: true,
    cartao_debito: true, transferencia: true,
  };

  function getPgtoConfig() {
    try { return { ...PGTO_DEFAULT, ...JSON.parse(localStorage.getItem(PGTO_KEY)) }; }
    catch { return { ...PGTO_DEFAULT }; }
  }

  function savePgtoConfig(data) {
    localStorage.setItem(PGTO_KEY, JSON.stringify(data));
  }

  /* ══════════════════════════════════════
     DEFINIÇÕES DOS PAINÉIS
  ══════════════════════════════════════ */
  const PANELS = {

    /* ── Dados da empresa ── */
    empresa() {
      const e = getEmpresa();
      openPanel('Dados da empresa', `
        <div class="cfg-form-group">
          <label>Nome da empresa</label>
          <input id="empNome" value="${e.nome || 'Planeta Celular'}" placeholder="Nome da empresa" />
        </div>
        <div class="cfg-form-group">
          <label>CNPJ / CPF</label>
          <input id="empCnpj" value="${e.cnpj || ''}" placeholder="00.000.000/0000-00" />
        </div>
        <div class="cfg-form-group">
          <label>Telefone / WhatsApp</label>
          <input id="empTelefone" value="${e.telefone || ''}" placeholder="(00) 00000-0000" />
        </div>
        <div class="cfg-form-group">
          <label>E-mail</label>
          <input id="empEmail" type="email" value="${e.email || ''}" placeholder="contato@empresa.com.br" />
        </div>
        <div class="cfg-form-group">
          <label>Endereço</label>
          <input id="empEndereco" value="${e.endereco || ''}" placeholder="Rua, número, bairro" />
        </div>
        <div class="cfg-form-group">
          <label>Cidade / Estado</label>
          <input id="empCidade" value="${e.cidade || ''}" placeholder="Cidade — UF" />
        </div>
        <div class="cfg-form-group">
          <label>URL do logo (opcional)</label>
          <input id="empLogo" value="${e.logo || ''}" placeholder="https://..." />
        </div>
      `, () => {
        saveEmpresa({
          nome:     document.getElementById('empNome').value.trim(),
          cnpj:     document.getElementById('empCnpj').value.trim(),
          telefone: document.getElementById('empTelefone').value.trim(),
          email:    document.getElementById('empEmail').value.trim(),
          endereco: document.getElementById('empEndereco').value.trim(),
          cidade:   document.getElementById('empCidade').value.trim(),
          logo:     document.getElementById('empLogo').value.trim(),
        });
        showToast('Dados da empresa salvos!');
        closePanel();
      });
    },

    /* ── Usuários (apenas admin) ── */
    usuarios() {
      if (!isAdmin) return;
      const users = [
        { nome: 'Administrador', email: 'admin@planetacelular.com.br', role: 'admin' },
        { nome: 'Funcionário',   email: 'funcionario@planetacelular.com.br', role: 'funcionario' },
      ];
      openPanel('Usuários', `
        <p style="font-size:.8rem;color:var(--gray-400);margin-bottom:1rem;">
          <i class="fa-solid fa-info-circle"></i>
          Para alterar senhas, edite o arquivo <strong>db.js</strong> diretamente.
        </p>
        ${users.map(u => `
          <div class="cfg-user-row">
            <div class="cfg-user-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="cfg-user-info">
              <div class="cfg-user-name">${u.nome}</div>
              <div class="cfg-user-role">${u.email}</div>
            </div>
            <span class="cfg-badge-role ${u.role === 'funcionario' ? 'func' : ''}">
              ${u.role === 'admin' ? 'Admin' : 'Funcionário'}
            </span>
          </div>
        `).join('')}
      `);
    },

    /* ── Formas de pagamento ── */
    formas_pgto() {
      const cfg = getPgtoConfig();
      const methods = [
        { key: 'dinheiro',      label: 'Dinheiro',          icon: 'fa-money-bill-wave' },
        { key: 'pix',           label: 'PIX',               icon: 'fa-pix' },
        { key: 'cartao_credito',label: 'Cartão de Crédito', icon: 'fa-credit-card' },
        { key: 'cartao_debito', label: 'Cartão de Débito',  icon: 'fa-credit-card' },
        { key: 'transferencia', label: 'Transferência',      icon: 'fa-arrow-right-arrow-left' },
      ];
      openPanel('Formas de pagamento', `
        <p style="font-size:.8rem;color:var(--gray-400);margin-bottom:1rem;">
          Ative ou desative os métodos que aparecem no caixa de vendas.
        </p>
        ${methods.map(m => `
          <div class="cfg-panel-toggle-row">
            <span><i class="fa-solid ${m.icon}" style="margin-right:.5rem;color:var(--gray-400);"></i>${m.label}</span>
            <label class="cfg-toggle">
              <input type="checkbox" data-pgto="${m.key}" ${cfg[m.key] ? 'checked' : ''} />
              <span class="cfg-toggle-track"></span>
            </label>
          </div>
        `).join('')}
      `, () => {
        const newCfg = {};
        panelBody.querySelectorAll('input[data-pgto]').forEach(inp => {
          newCfg[inp.dataset.pgto] = inp.checked;
        });
        savePgtoConfig(newCfg);
        showToast('Formas de pagamento salvas!');
        closePanel();
      });
    },

    /* ── Recibo / Devolução ── */
    recibo() {
      const KEY = 'pc_recibo_cfg';
      let rc = {};
      try { rc = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
      openPanel('Recibo / Devolução', `
        <p style="font-size:.8rem;color:var(--gray-400);margin-bottom:1rem;">
          Escolha o que aparece no comprovante de venda.
        </p>
        ${[
          { key: 'show_cnpj',     label: 'Mostrar CNPJ/CPF da empresa' },
          { key: 'show_endereco', label: 'Mostrar endereço da empresa' },
          { key: 'show_cliente',  label: 'Mostrar nome do cliente' },
          { key: 'show_pgto',     label: 'Mostrar forma de pagamento' },
          { key: 'show_obs',      label: 'Mostrar campo de observação' },
        ].map(o => `
          <div class="cfg-panel-toggle-row">
            <span>${o.label}</span>
            <label class="cfg-toggle">
              <input type="checkbox" data-rc="${o.key}" ${rc[o.key] !== false ? 'checked' : ''} />
              <span class="cfg-toggle-track"></span>
            </label>
          </div>
        `).join('')}
      `, () => {
        const newRc = {};
        panelBody.querySelectorAll('input[data-rc]').forEach(inp => {
          newRc[inp.dataset.rc] = inp.checked;
        });
        localStorage.setItem(KEY, JSON.stringify(newRc));
        showToast('Configurações de recibo salvas!');
        closePanel();
      });
    },

    /* ── Dados do usuário atual ── */
    meu_usuario() {
      const session = AuthDB._session() || {};
      openPanel('Dados do usuário', `
        <div class="cfg-form-group">
          <label>Nome de exibição</label>
          <input id="userNomeInput" value="${session.nome || ''}" placeholder="Seu nome" />
        </div>
        <div class="cfg-form-group">
          <label>Perfil</label>
          <input value="${session.role === 'admin' ? 'Administrador' : 'Funcionário'}" readonly
            style="background:var(--gray-100);color:var(--gray-400);cursor:not-allowed;" />
        </div>
        <p style="font-size:.78rem;color:var(--gray-400);margin-top:.5rem;">
          <i class="fa-solid fa-lock"></i> Senha e e-mail são gerenciados pelo administrador.
        </p>
      `, () => {
        const novoNome = document.getElementById('userNomeInput').value.trim();
        if (!novoNome) { showToast('Informe um nome', 'error'); return; }
        const updated = { ...session, nome: novoNome };
        sessionStorage.setItem(AuthDB.KEY, JSON.stringify(updated));
        document.getElementById('topbarUserName').textContent = novoNome;
        showToast('Nome atualizado!');
        closePanel();
      });
    },

    /* ── Diagnóstico do banco ── */
    diagnostico() {
      const dbs = [
        { nome: 'Produtos',      key: 'pc_products',  db: () => (typeof ProductDB !== 'undefined' ? ProductDB.getAll().length : '—') },
        { nome: 'Pedidos',       key: 'pc_orders',     db: () => (typeof OrderDB   !== 'undefined' ? OrderDB.getAll().length   : '—') },
        { nome: 'Ordens de Serviço', key: 'pc_os',    db: () => (typeof OSDB      !== 'undefined' ? OSDB.getAll().length      : '—') },
        { nome: 'Financeiro',    key: 'pc_fin_tx',     db: () => (typeof FinDB     !== 'undefined' ? FinDB.getAll().length     : '—') },
        { nome: 'Caixa',         key: 'pc_fin_caixa',  db: () => (typeof FinDB     !== 'undefined' ? (FinDB.getCaixas?.()?.length ?? '—') : '—') },
        { nome: 'Empresa',       key: 'pc_empresa',    db: () => { const e = localStorage.getItem('pc_empresa'); return e ? '✔ configurado' : 'não configurado'; } },
      ];

      let storageOk = true;
      try { const t='__t'; localStorage.setItem(t,'1'); localStorage.removeItem(t); } catch { storageOk = false; }

      const storageTotal = (() => {
        try {
          let size = 0;
          for (const k in localStorage) size += ((localStorage[k]?.length || 0) + k.length) * 2;
          return (size / 1024).toFixed(1) + ' KB';
        } catch { return '—'; }
      })();

      openPanel('Diagnóstico do banco', `
        <div style="margin-bottom:.75rem;padding:.65rem .85rem;border-radius:8px;background:${storageOk ? '#F0FFF4' : '#FFF5F5'};border:1px solid ${storageOk ? '#BBF7D0' : '#FECACA'};">
          <strong style="color:${storageOk ? '#15803D' : '#DC2626'};">
            ${storageOk ? '✔ localStorage disponível' : '✘ localStorage BLOQUEADO'}
          </strong>
          <div style="font-size:.75rem;color:var(--gray-500);margin-top:.2rem;">Espaço usado: ${storageTotal} / ~5 MB</div>
        </div>
        <div class="cfg-list">
          ${dbs.map(d => {
            let count = '—';
            try { count = d.db(); } catch {}
            return `
              <div class="cfg-item" style="cursor:default;">
                <div class="cfg-item__icon" style="background:#F8FAFC;"><i class="fa-solid fa-table"></i></div>
                <div class="cfg-item__body">
                  <div class="cfg-item__label">${d.nome}</div>
                  <div class="cfg-item__sub">${d.key}</div>
                </div>
                <div class="cfg-item__right">
                  <span style="font-size:.78rem;font-weight:700;color:var(--gray-600);">${count} registro${count === 1 ? '' : 's'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <button id="btnLimparStorage" style="margin-top:1rem;width:100%;padding:.55rem;border:1.5px solid #EF4444;background:none;color:#EF4444;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;">
          <i class="fa-solid fa-trash"></i> Limpar TODOS os dados (irreversível)
        </button>
      `);

      document.getElementById('btnLimparStorage')?.addEventListener('click', () => {
        if (!confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema (produtos, OS, financeiro, pedidos). Tem certeza?')) return;
        if (!confirm('Esta ação é IRREVERSÍVEL. Confirma?')) return;
        localStorage.clear();
        showToast('Todos os dados foram apagados. Recarregando...', 'error');
        setTimeout(() => location.reload(), 1500);
      });
    },

    /* ── Instalar App ── */
    instalar() {
      openPanel('Instalar App', `
        <div style="text-align:center;padding:1.5rem 0;">
          <i class="fa-solid fa-mobile-screen-button" style="font-size:3rem;color:var(--primary);display:block;margin-bottom:1rem;"></i>
          <p style="font-size:.88rem;color:var(--gray-700);margin-bottom:1.25rem;line-height:1.6;">
            Para instalar o Planeta Celular como aplicativo no seu dispositivo:
          </p>
        </div>
        <div class="cfg-list">
          <div class="cfg-item" style="cursor:default;">
            <div class="cfg-item__icon" style="background:#E8F0FF;color:#0066FF;"><i class="fa-brands fa-chrome"></i></div>
            <div class="cfg-item__body">
              <div class="cfg-item__label">Chrome / Edge</div>
              <div class="cfg-item__sub">Menu (⋮) → "Instalar aplicativo"</div>
            </div>
          </div>
          <div class="cfg-item" style="cursor:default;">
            <div class="cfg-item__icon" style="background:#FFF0F0;color:#E24329;"><i class="fa-brands fa-safari"></i></div>
            <div class="cfg-item__body">
              <div class="cfg-item__label">Safari (iOS)</div>
              <div class="cfg-item__sub">Compartilhar → "Adicionar à Tela de Início"</div>
            </div>
          </div>
          <div class="cfg-item" style="cursor:default;">
            <div class="cfg-item__icon" style="background:#F0FFF4;color:#16A34A;"><i class="fa-brands fa-android"></i></div>
            <div class="cfg-item__body">
              <div class="cfg-item__label">Android</div>
              <div class="cfg-item__sub">Menu (⋮) → "Adicionar à tela inicial"</div>
            </div>
          </div>
        </div>
      `);
    },
  };

});
