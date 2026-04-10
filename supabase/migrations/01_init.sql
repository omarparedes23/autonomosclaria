-- Schema migrations for Claria MVP

CREATE TABLE IF NOT EXISTS cl_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  nif TEXT,
  fiscal_address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cl_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own profile" ON cl_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can only update their own profile" ON cl_users FOR UPDATE USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS cl_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cl_users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  nif TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cl_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users control their clients" ON cl_clients USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cl_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cl_users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  iva_rate INTEGER CHECK (iva_rate IN (21, 10, 4, 0)) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cl_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users control their services" ON cl_services USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cl_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cl_users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES cl_clients(id) ON DELETE RESTRICT NOT NULL,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('draft', 'pending', 'paid', 'cancelled')) DEFAULT 'draft',
  taxable_base_cents INTEGER NOT NULL DEFAULT 0,
  iva_quota_cents INTEGER NOT NULL DEFAULT 0,
  irpf_retention_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, invoice_number)
);

ALTER TABLE cl_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users control their invoices" ON cl_invoices USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cl_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES cl_invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  iva_rate INTEGER CHECK (iva_rate IN (21, 10, 4, 0)) NOT NULL,
  total_cents INTEGER NOT NULL
);

ALTER TABLE cl_invoice_items ENABLE ROW LEVEL SECURITY;
-- We secure items by joining the parent invoice via auth wrapper (or we can just skip RLS on items explicitly queried via invoice, but safer is checking parent)
CREATE POLICY "Users control their invoice items" ON cl_invoice_items USING (
  EXISTS (SELECT 1 FROM cl_invoices WHERE cl_invoices.id = cl_invoice_items.invoice_id AND cl_invoices.user_id = auth.uid())
);
