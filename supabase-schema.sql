-- Valhalla Studio — Oficina Virtual
-- Ejecutar en el SQL Editor de tu proyecto Supabase

CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  protonpass_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'cotizacion',
  start_date DATE,
  deadline DATE,
  quoted_price NUMERIC(12,2),
  paid_amount NUMERIC(12,2) DEFAULT 0,
  project_url TEXT,
  notes TEXT,
  protonpass_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  depends_on TEXT NOT NULL DEFAULT 'me',
  priority TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'pendiente',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on projects
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grants para service_role (el proyecto usa solo este rol desde el servidor)
GRANT ALL ON clients, projects, tasks TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
