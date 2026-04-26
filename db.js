/* ============================================================
   PLANETA CELULAR — db.js
   Camada de dados via localStorage: ProductDB + CartDB + OrderDB
============================================================ */

/* ── PRODUTOS padrão (seed) ── */
const DEFAULT_PRODUCTS = [
  { id:'p01', name:'iPhone 13', category:'smartphones', brand:'apple', condition:'seminovo', price:1799, oldPrice:2099, description:'128GB · Preto · iOS 17 · Bateria 92%', image:'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p02', name:'iPhone XR', category:'smartphones', brand:'apple', condition:'usado', price:1199, oldPrice:1399, description:'64GB · Branco · iOS 16 · Bom estado', image:'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p03', name:'Samsung Galaxy A54', category:'smartphones', brand:'samsung', condition:'seminovo', price:999, oldPrice:1299, description:'128GB · 8GB RAM · Excelente estado', image:'https://images.unsplash.com/photo-1610945264803-c22b62831e4d?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p04', name:'Samsung Galaxy A32', category:'smartphones', brand:'samsung', condition:'usado', price:599, oldPrice:null, description:'128GB · 4GB RAM · Ótimo custo-benefício', image:'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p05', name:'Motorola Moto G84', category:'smartphones', brand:'motorola', condition:'seminovo', price:699, oldPrice:899, description:'256GB · 12GB RAM · Ótimo estado', image:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p06', name:'Motorola Moto G52', category:'smartphones', brand:'motorola', condition:'usado', price:479, oldPrice:599, description:'128GB · 4GB RAM · Estado conservado', image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p07', name:'Xiaomi Redmi Note 13', category:'smartphones', brand:'xiaomi', condition:'seminovo', price:849, oldPrice:null, description:'128GB · 6GB RAM · Perfeito estado', image:'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p08', name:'Xiaomi Redmi 12C', category:'smartphones', brand:'xiaomi', condition:'usado', price:449, oldPrice:549, description:'128GB · 4GB RAM · Bom estado', image:'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p09', name:'Capinha Anti-Impacto', category:'capinhas', brand:'outros', condition:'novo', price:35, oldPrice:null, description:'Diversas marcas e modelos · Proteção reforçada', image:'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p10', name:'Capinha Transparente Premium', category:'capinhas', brand:'outros', condition:'novo', price:49, oldPrice:null, description:'Acrílico rígido · Anti-amarelamento · Todas as marcas', image:'https://images.unsplash.com/photo-1601593346740-925612772716?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p11', name:'Capa Carteira com Suporte', category:'capinhas', brand:'outros', condition:'novo', price:79, oldPrice:null, description:'Couro sintético · Porta-cartões · Suporte magnético', image:'https://images.unsplash.com/photo-1560343787-02832e6d9517?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p12', name:'Película 3D Vidro Temperado', category:'peliculas', brand:'outros', condition:'novo', price:39, oldPrice:null, description:'9H de dureza · Instalação incluída · Todas as marcas', image:'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p13', name:'Película 5D Cobertura Total', category:'peliculas', brand:'outros', condition:'novo', price:59, oldPrice:null, description:'Cobre bordas curvas · Anti-reflexo · Instalação incluída', image:'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p14', name:'Carregador Turbo USB-C 65W', category:'carregadores', brand:'outros', condition:'novo', price:59, oldPrice:89, description:'Carga super rápida · Compatível com Android', image:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p15', name:'Carregador iPhone Lightning 20W', category:'carregadores', brand:'apple', condition:'novo', price:89, oldPrice:119, description:'Carga rápida · MFI certificado · Cabo incluso', image:'https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p16', name:'Powerbank 10.000mAh', category:'carregadores', brand:'outros', condition:'novo', price:129, oldPrice:169, description:'Entrada USB-C · 2 saídas USB · Carrega 2x', image:'https://images.unsplash.com/photo-1618440718421-0788cde0a4e9?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p17', name:'Fone TWS Bluetooth 5.3', category:'audio', brand:'outros', condition:'novo', price:149, oldPrice:199, description:'True Wireless · ANC · Bateria 30h · Case de carga', image:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p18', name:'Headphone Over-Ear Bluetooth', category:'audio', brand:'outros', condition:'novo', price:89, oldPrice:129, description:'Dobrável · Bateria 20h · Microfone integrado', image:'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p19', name:'Caixa de Som Bluetooth', category:'audio', brand:'outros', condition:'novo', price:119, oldPrice:159, description:'À prova d\'água · 20W · Bateria 12h · USB-C', image:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p20', name:'Cabo USB-C Reforçado 2m', category:'cabos', brand:'outros', condition:'novo', price:29, oldPrice:null, description:'Nylon trançado · Carga rápida 60W · Anti-quebra', image:'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p21', name:'Cabo Lightning 1m', category:'cabos', brand:'apple', condition:'novo', price:35, oldPrice:null, description:'Compatível iPhone/iPad · Nylon trançado · Carga rápida', image:'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=340&h=260&fit=crop&q=80', inStock:true },
  { id:'p22', name:'Suporte Veicular Magnético', category:'cabos', brand:'outros', condition:'novo', price:49, oldPrice:69, description:'Universal · Fixação no painel · Rotação 360°', image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=340&h=260&fit=crop&q=80', inStock:true },
];

/* ============================================================
   _storage — wrapper seguro para localStorage
============================================================ */
const _storage = (() => {
  let available = true;
  try {
    const test = '__pc_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
  } catch (e) {
    available = false;
    console.error('[PlanetaCelular] localStorage não está disponível:', e);
    // Avisa o usuário assim que a página carregar
    document.addEventListener('DOMContentLoaded', () => {
      const warn = document.createElement('div');
      warn.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#DC2626;color:#fff;text-align:center;padding:.75rem 1rem;font-size:.9rem;font-family:sans-serif;';
      warn.innerHTML = '⚠️ <strong>Atenção:</strong> O armazenamento local está bloqueado neste navegador. Os dados <strong>não serão salvos</strong>. Use o Chrome/Edge sem modo privado ou ative cookies.';
      document.body.prepend(warn);
    });
  }

  return {
    get(key) {
      if (!available) return null;
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      if (!available) return false;
      try { localStorage.setItem(key, value); return true; } catch (e) {
        console.error('[PlanetaCelular] Erro ao salvar:', key, e);
        return false;
      }
    },
    remove(key) {
      if (!available) return;
      try { localStorage.removeItem(key); } catch {}
    },
    getJSON(key) {
      try { return JSON.parse(this.get(key)); } catch { return null; }
    },
    setJSON(key, value) {
      return this.set(key, JSON.stringify(value));
    },
  };
})();

/* ============================================================
   ProductDB — CRUD de produtos no localStorage
============================================================ */
const ProductDB = {
  KEY: 'pc_products',

  seed() {
    if (!_storage.get(this.KEY)) {
      _storage.setJSON(this.KEY, DEFAULT_PRODUCTS);
    }
  },

  getAll() {
    this.seed();
    return _storage.getJSON(this.KEY) || [];
  },

  getById(id) {
    return this.getAll().find(p => p.id === id) || null;
  },

  add(product) {
    const list = this.getAll();
    const newProduct = { ...product, id: 'p' + Date.now(), inStock: product.inStock !== false };
    list.push(newProduct);
    _storage.setJSON(this.KEY, list);
    return newProduct;
  },

  update(id, data) {
    const list = this.getAll().map(p => p.id === id ? { ...p, ...data } : p);
    _storage.setJSON(this.KEY, list);
  },

  delete(id) {
    const list = this.getAll().filter(p => p.id !== id);
    _storage.setJSON(this.KEY, list);
  },

  getCategories() {
    const cats = [...new Set(this.getAll().map(p => p.category))];
    return cats;
  },

  getStats() {
    const products = this.getAll();
    return {
      total:    products.length,
      inStock:  products.filter(p => p.inStock).length,
      outStock: products.filter(p => !p.inStock).length,
      categories: [...new Set(products.map(p => p.category))].length,
    };
  },
};

/* ============================================================
   CartDB — Carrinho no localStorage
============================================================ */
const CartDB = {
  KEY: 'pc_cart',
  /* usa _storage internamente */

  getItems() {
    return _storage.getJSON(this.KEY) || [];
  },

  addItem(product, qty = 1) {
    const items = this.getItems();
    const existing = items.find(i => i.id === product.id);
    if (existing) existing.qty += qty;
    else items.push({ ...product, qty });
    _storage.setJSON(this.KEY, items);
    this._dispatch();
  },

  removeItem(id) {
    _storage.setJSON(this.KEY, this.getItems().filter(i => i.id !== id));
    this._dispatch();
  },

  updateQty(id, qty) {
    if (qty < 1) { this.removeItem(id); return; }
    _storage.setJSON(this.KEY, this.getItems().map(i => i.id === id ? { ...i, qty } : i));
    this._dispatch();
  },

  clear() {
    _storage.remove(this.KEY);
    this._dispatch();
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  getSubtotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  // Dispara evento customizado para atualizar badges
  _dispatch() {
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: this.getCount() } }));
  },
};

/* ============================================================
   OrderDB — Pedidos no localStorage
============================================================ */
const OrderDB = {
  KEY: 'pc_orders',

  getAll() {
    return _storage.getJSON(this.KEY) || [];
  },

  add(order) {
    const orders = this.getAll();
    const newOrder = { ...order, id: 'PED' + Date.now(), date: new Date().toISOString(), status: 'pending' };
    orders.unshift(newOrder);
    _storage.setJSON(this.KEY, orders);
    return newOrder;
  },

  updateStatus(id, status) {
    _storage.setJSON(this.KEY, this.getAll().map(o => o.id === id ? { ...o, status } : o));
  },

  delete(id) {
    _storage.setJSON(this.KEY, this.getAll().filter(o => o.id !== id));
  },
};

/* ============================================================
   AuthDB — Autenticação com roles (admin / funcionario)
============================================================ */
const AuthDB = {
  USERS: [
    { email: 'admin@planetacelular.com.br',       password: 'admin123', role: 'admin',       nome: 'Administrador' },
    { email: 'funcionario@planetacelular.com.br',  password: 'func123',  role: 'funcionario', nome: 'Funcionário'   },
  ],
  KEY: 'pc_admin_auth',

  login(email, password) {
    const user = this.USERS.find(u => u.email === email.trim() && u.password === password);
    if (user) {
      sessionStorage.setItem(this.KEY, JSON.stringify({ role: user.role, nome: user.nome }));
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem(this.KEY);
  },

  _session() {
    try { return JSON.parse(sessionStorage.getItem(this.KEY)) || null; } catch { return null; }
  },

  isLoggedIn() {
    return !!this._session();
  },

  getRole() {
    return this._session()?.role || null;
  },

  getNome() {
    return this._session()?.nome || 'Admin';
  },

  isAdmin() {
    return this.getRole() === 'admin';
  },

  requireAuth() {
    if (!this.isLoggedIn()) window.location.href = 'admin.html';
  },

  requireAdmin() {
    if (!this.isLoggedIn()) { window.location.href = 'admin.html'; return; }
    if (!this.isAdmin())    { window.location.href = 'painel.html'; }
  },
};

/* ============================================================
   CustomerDB — Clientes no localStorage
============================================================ */
const CustomerDB = {
  KEY: 'pc_customers',

  getAll() {
    return _storage.getJSON(this.KEY) || [];
  },

  getById(id) {
    return this.getAll().find(c => c.id === id) || null;
  },

  add(customer) {
    const list = this.getAll();
    const novo = { ...customer, id: 'cli' + Date.now(), createdAt: new Date().toISOString() };
    list.push(novo);
    _storage.setJSON(this.KEY, list);
    return novo;
  },

  update(id, data) {
    _storage.setJSON(this.KEY, this.getAll().map(c => c.id === id ? { ...c, ...data } : c));
  },

  delete(id) {
    _storage.setJSON(this.KEY, this.getAll().filter(c => c.id !== id));
  },

  importFromOrders() {
    const orders = OrderDB.getAll();
    const existing = this.getAll();
    const existingPhones = new Set(existing.map(c => (c.telefone || '').replace(/\D/g, '')));
    let imported = 0;
    orders.forEach(o => {
      if (!o.customer) return;
      const phone = (o.customer.tel || '').replace(/\D/g, '');
      if (phone && !existingPhones.has(phone)) {
        this.add({
          nome: o.customer.nome || '',
          telefone: o.customer.tel || '',
          email: o.customer.email || '',
          endereco: o.customer.endereco || '',
          cidade: o.customer.cidade || '',
          observacoes: `Importado do pedido ${o.id.slice(-8)}`,
        });
        existingPhones.add(phone);
        imported++;
      }
    });
    return imported;
  },

  getStats() {
    const list = this.getAll();
    const now = new Date();
    const mesAtual = list.filter(c => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total: list.length, novosMes: mesAtual };
  },
};

/* ============================================================
   CampaignDB — Campanhas no localStorage
============================================================ */
const CampaignDB = {
  KEY: 'pc_campaigns',

  getAll() {
    return _storage.getJSON(this.KEY) || [];
  },

  getById(id) {
    return this.getAll().find(c => c.id === id) || null;
  },

  add(campaign) {
    const list = this.getAll();
    const novo = { ...campaign, id: 'camp' + Date.now(), createdAt: new Date().toISOString() };
    list.push(novo);
    _storage.setJSON(this.KEY, list);
    return novo;
  },

  update(id, data) {
    _storage.setJSON(this.KEY, this.getAll().map(c => c.id === id ? { ...c, ...data } : c));
  },

  delete(id) {
    _storage.setJSON(this.KEY, this.getAll().filter(c => c.id !== id));
  },
};

/* ── Dark mode: aplica na carga de qualquer página ── */
try {
  if (localStorage.getItem('pc_dark_mode') === '1') document.body.classList.add('dark');
} catch (e) { /* storage bloqueado */ }

/* ── Helpers globais ── */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function categoryLabel(key) {
  const map = {
    smartphones: 'Smartphone', capinhas: 'Capinha', peliculas: 'Película',
    carregadores: 'Carregador', audio: 'Áudio', cabos: 'Cabo/Acessório',
  };
  return map[key] || key;
}

function conditionLabel(key) {
  const map = { novo: 'Novo', seminovo: 'Seminovo', usado: 'Usado' };
  return map[key] || key;
}
