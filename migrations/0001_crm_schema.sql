-- My CRM Schema
-- Idempotent migration: safe to run multiple times

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  company text,
  title text,
  notes text,
  status text DEFAULT 'active'
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  stage text NOT NULL DEFAULT 'lead',
  value numeric(12,2),
  currency text DEFAULT 'USD',
  expected_close_date date,
  notes text
);

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  type text NOT NULL,
  subject text,
  body text NOT NULL,
  direction text DEFAULT 'outbound'
);

-- Indexes
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS deals_user_id_idx ON deals(user_id);
CREATE INDEX IF NOT EXISTS deals_contact_id_idx ON deals(contact_id);
CREATE INDEX IF NOT EXISTS communications_user_id_idx ON communications(user_id);
CREATE INDEX IF NOT EXISTS communications_contact_id_idx ON communications(contact_id);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_select') THEN
    CREATE POLICY contacts_select ON contacts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_insert') THEN
    CREATE POLICY contacts_insert ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_update') THEN
    CREATE POLICY contacts_update ON contacts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_delete') THEN
    CREATE POLICY contacts_delete ON contacts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for deals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'deals_select') THEN
    CREATE POLICY deals_select ON deals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'deals_insert') THEN
    CREATE POLICY deals_insert ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'deals_update') THEN
    CREATE POLICY deals_update ON deals FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'deals_delete') THEN
    CREATE POLICY deals_delete ON deals FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for communications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'communications_select') THEN
    CREATE POLICY communications_select ON communications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'communications_insert') THEN
    CREATE POLICY communications_insert ON communications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'communications_update') THEN
    CREATE POLICY communications_update ON communications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'communications_delete') THEN
    CREATE POLICY communications_delete ON communications FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
