-- ============================================================
-- PLANETA CELULAR — Supabase Schema
-- Cole este SQL no editor do Supabase (SQL Editor → New query)
-- ============================================================

-- ── Habilita extensão uuid (caso queira usar no futuro) ──
-- create extension if not exists "uuid-ossp";

-- ── Produtos ──────────────────────────────────────────────
create table if not exists produtos (
  id          text primary key,
  nome        text not null,
  categoria   text,
  marca       text,
  condicao    text,
  preco       numeric(10,2) default 0,
  preco_antigo numeric(10,2),
  descricao   text,
  imagem      text,
  em_estoque  boolean default true,
  created_at  timestamptz default now()
);

-- ── Clientes ──────────────────────────────────────────────
create table if not exists clientes (
  id          text primary key,
  nome        text not null,
  telefone    text,
  email       text,
  cpf         text,
  nascimento  date,
  endereco    text,
  cidade      text,
  estado      text,
  observacoes text,
  created_at  timestamptz default now()
);

-- ── Pedidos (e-commerce) ───────────────────────────────────
create table if not exists pedidos (
  id       text primary key,
  customer jsonb,
  items    jsonb,
  total    numeric(10,2) default 0,
  payment  text,
  shipping jsonb,
  status   text default 'pending',
  date     timestamptz default now()
);

-- ── Ordens de Serviço ─────────────────────────────────────
create table if not exists ordens_servico (
  id                   text primary key,
  numero_os            text unique,
  status               text default 'aguardando_diagnostico',
  status_pagamento     text default 'pendente',
  data_entrada         timestamptz,
  previsao_entrega     timestamptz,
  data_conclusao       timestamptz,
  data_entrega         timestamptz,
  prioridade           text default 'normal',
  cliente_nome         text,
  cliente_cpf          text,
  cliente_telefone     text,
  cliente_email        text,
  cliente_endereco     text,
  aparelho_marca       text,
  aparelho_modelo      text,
  aparelho_imei        text,
  aparelho_cor         text,
  aparelho_senha       text,
  acessorios           jsonb default '[]',
  condicoes_visuais    text,
  tecnico              text,
  problema_relatado    text,
  laudo_tecnico        text,
  servicos_realizados  jsonb default '[]',
  pecas_utilizadas     jsonb default '[]',
  valor_servico        numeric(10,2) default 0,
  valor_pecas          numeric(10,2) default 0,
  valor_total          numeric(10,2) default 0,
  desconto             numeric(10,2) default 0,
  valor_estimado       numeric(10,2) default 0,
  forma_pagamento      text,
  observacoes_internas text,
  historico_status     jsonb default '[]',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ── Transações Financeiras ────────────────────────────────
create table if not exists transacoes_financeiras (
  id              text primary key,
  tipo            text,
  categoria_id    text,
  descricao       text,
  valor           numeric(10,2) default 0,
  data_transacao  date,
  data_vencimento date,
  status          text default 'pendente',
  forma_pagamento text,
  origem          text default 'manual',
  origem_id       text,
  observacao      text,
  historico       jsonb default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Categorias Financeiras ────────────────────────────────
create table if not exists categorias_financeiras (
  id    text primary key,
  nome  text,
  tipo  text,
  icone text
);

-- ── Caixa ─────────────────────────────────────────────────
create table if not exists caixas (
  id             text primary key,
  data           date,
  abertura_em    timestamptz,
  saldo_abertura numeric(10,2) default 0,
  fechamento_em  timestamptz,
  saldo_contado  numeric(10,2),
  saldo_esperado numeric(10,2),
  entradas       numeric(10,2) default 0,
  saidas         numeric(10,2) default 0,
  diferenca      numeric(10,2),
  observacao     text,
  status         text default 'aberto'
);

-- ── Campanhas ─────────────────────────────────────────────
create table if not exists campanhas (
  id         text primary key,
  nome       text,
  tipo       text,
  status     text default 'planejada',
  inicio     date,
  fim        date,
  publico    text,
  mensagem   text,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security) — Permissivo para chave anônima
-- O app usa autenticação própria (AuthDB), não Supabase Auth
-- ============================================================

alter table produtos               enable row level security;
alter table clientes               enable row level security;
alter table pedidos                enable row level security;
alter table ordens_servico         enable row level security;
alter table transacoes_financeiras enable row level security;
alter table categorias_financeiras enable row level security;
alter table caixas                 enable row level security;
alter table campanhas              enable row level security;

-- Políticas: permite tudo para a role anon (chave pública do app)
create policy "anon_all_produtos"               on produtos               for all to anon using (true) with check (true);
create policy "anon_all_clientes"               on clientes               for all to anon using (true) with check (true);
create policy "anon_all_pedidos"                on pedidos                for all to anon using (true) with check (true);
create policy "anon_all_ordens_servico"         on ordens_servico         for all to anon using (true) with check (true);
create policy "anon_all_transacoes_financeiras" on transacoes_financeiras for all to anon using (true) with check (true);
create policy "anon_all_categorias_financeiras" on categorias_financeiras for all to anon using (true) with check (true);
create policy "anon_all_caixas"                 on caixas                 for all to anon using (true) with check (true);
create policy "anon_all_campanhas"              on campanhas              for all to anon using (true) with check (true);
