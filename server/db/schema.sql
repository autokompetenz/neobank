-- NeoBank — PostgreSQL schema (UUID, contraintes)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','blocked')),
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending','submitted','approved','rejected')),
  iban TEXT,
  bic TEXT,
  iban_proof TEXT,
  iban_status TEXT NOT NULL DEFAULT 'none' CHECK (iban_status IN ('none','requested','pending_proof','assigned','active')),
  card_status TEXT NOT NULL DEFAULT 'none' CHECK (card_status IN ('none','requested','active','blocked')),
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','admin')),
  account_verified BOOLEAN NOT NULL DEFAULT false,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','transfer')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  label TEXT,
  bank_name TEXT,
  counterparty_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  external_iban TEXT,
  external_bic TEXT,
  external_account_holder TEXT,
  fees NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_number TEXT NOT NULL,
  last_four TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  expiry_month TEXT NOT NULL,
  expiry_year TEXT NOT NULL,
  cvv_encrypted TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selfie_url TEXT,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reject_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_kyc_user ON kyc_submissions(user_id);

CREATE TABLE iban_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_iban_req_user ON iban_requests(user_id);

CREATE TABLE card_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

CREATE TABLE account_activation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  proof_url TEXT, -- Augmenté pour supporter les images base64
  step TEXT NOT NULL DEFAULT 'iban_request' CHECK (step IN ('iban_request', 'iban_proof', 'transfer_proof')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reject_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_activation_req_user ON account_activation_requests(user_id);

CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  external_account_holder TEXT NOT NULL,
  external_iban TEXT NOT NULL,
  external_bic TEXT NOT NULL,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','code_generated','step_completed','completed','rejected')),
  reject_reason TEXT,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  withdrawal_code TEXT,
  code_expires_at TIMESTAMPTZ,
  current_percentage NUMERIC(5,2) DEFAULT 0,
  target_percentage NUMERIC(5,2),
  next_condition TEXT,
  final_condition TEXT,
  total_withdrawn NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawal_requests_user ON withdrawal_requests(user_id, created_at DESC);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status, created_at DESC);

CREATE TABLE withdrawal_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_request_id UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  condition TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  amount NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawal_steps_request ON withdrawal_steps(withdrawal_request_id, step_order);

CREATE TABLE withdrawal_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  withdrawal_request_id UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawal_codes_code ON withdrawal_codes(code);
CREATE INDEX idx_withdrawal_codes_expires ON withdrawal_codes(expires_at);

CREATE TABLE withdrawal_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_request_id UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  proof_data TEXT, -- Base64 image data
  proof_url TEXT, -- External URL
  filename TEXT,
  mimetype TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_withdrawal_proofs_request ON withdrawal_proofs(withdrawal_request_id, step_order);

CREATE TABLE modal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT false,
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all','pending','active','suspended','specific')),
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modal_user ON modal_messages(target_user_id);

-- Migration: Add mimetype column to withdrawal_proofs if it doesn't exist
-- This ensures backward compatibility with existing databases
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='withdrawal_proofs' 
        AND column_name='mimetype'
    ) THEN
        ALTER TABLE withdrawal_proofs ADD COLUMN mimetype TEXT;
        COMMENT ON COLUMN withdrawal_proofs.mimetype IS 'MIME type of the uploaded proof file (e.g., image/jpeg, image/png)';
    END IF;
END $$;

-- ============================================================================
-- FEATURES DE FONDATION (modification.txt)
-- ============================================================================

-- 1) Étendre les statuts de transaction pour le flux de virements à statuts
DO $$
BEGIN
    ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Autoriser les types du flux de virements
DO $$
BEGIN
    ALTER TABLE transactions
        ADD CONSTRAINT transactions_type_check
        CHECK (type IN ('deposit','withdrawal','transfer','external_transfer'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migrer les anciens statuts de virements vers les nouveaux états
UPDATE transactions SET status = 'completed'   WHERE type IN ('transfer','external_transfer') AND status = 'executed';
UPDATE transactions SET status = 'completed'   WHERE type IN ('transfer','external_transfer') AND status = 'authorized';
UPDATE transactions SET status = 'verifying'   WHERE type IN ('transfer','external_transfer') AND status = 'suspended';
UPDATE transactions SET status = 'refused'     WHERE type IN ('transfer','external_transfer') AND status = 'failed';
UPDATE transactions SET status = 'refused'     WHERE type IN ('transfer','external_transfer') AND status = 'refused';

ALTER TABLE transactions
    ADD CONSTRAINT transactions_status_check
    CHECK (status IN (
        'pending','pending_confirmation','verifying','transferring','completed','refused','blocked','failed'
    ));

-- Colonnes pour le flux de virements / blocage
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='reason') THEN
        ALTER TABLE transactions ADD COLUMN reason TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='action_required') THEN
        ALTER TABLE transactions ADD COLUMN action_required TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='decision_history') THEN
        ALTER TABLE transactions ADD COLUMN decision_history JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='reference') THEN
        ALTER TABLE transactions ADD COLUMN reference TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='fees') THEN
        ALTER TABLE transactions ADD COLUMN fees NUMERIC(18,2) NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 2) Bénéficiaires
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  iban TEXT NOT NULL,
  bic TEXT NOT NULL,
  bank_name TEXT DEFAULT '',
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user ON beneficiaries(user_id);

-- 3) Règles de sécurité configurables (moteur de règles)
CREATE TABLE IF NOT EXISTS transfer_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  -- paramètres JSON de la règle (ex: { threshold: 5000 })
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- action: verifying | suspended | refused
  action TEXT NOT NULL DEFAULT 'verifying' CHECK (action IN ('verifying','suspended','refused')),
  reason TEXT DEFAULT '',
  action_required TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO transfer_rules (key, name, description, enabled, params, action, reason, action_required) VALUES
  ('amount_threshold', 'Seuil de montant élevé',
   'Déclenche une vérification supplémentaire si le montant dépasse le seuil.',
   true, '{"threshold": 5000}', 'verifying',
   'Cette transaction nécessite une vérification de sécurité supplémentaire.',
   'Confirmez votre identité pour poursuivre.'),
  ('new_beneficiary', 'Nouveau bénéficiaire',
   'Met la transaction en vérification si le bénéficiaire est nouveau.',
   true, '{}', 'verifying',
   'Le bénéficiaire est nouveau. La transaction est mise en vérification.',
   'Confirmez ce bénéficiaire pour poursuivre.'),
  ('unusual_activity', 'Activité inhabituelle',
   'Suspend temporairement une transaction en cas d''activité inhabituelle.',
   true, '{}', 'suspended',
   'Une activité inhabituelle a été détectée sur votre compte.',
   'Contactez le support ou complétez la vérification.'),
  ('low_verification', 'Niveau de vérification insuffisant',
   'Demande une vérification d''identité si le niveau est insuffisant.',
   true, '{}', 'verifying',
   'Votre niveau de vérification est insuffisant pour ce montant.',
   'Complétez la vérification d''identité.'),
  ('daily_limit', 'Limite de transaction atteinte',
   'Suspend une transaction si la limite quotidienne de virements est atteinte.',
   true, '{"daily_limit": 3000}', 'suspended',
   'La limite de transaction journalière a été atteinte.',
   'La transaction reprendra automatiquement demain.')
ON CONFLICT (key) DO NOTHING;

-- 4) Journal d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  old_value JSONB,
  new_value JSONB,
  meta JSONB DEFAULT '{}'::jsonb,
  ip TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- 5) Rôles administratifs sur les utilisateurs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='admin_role') THEN
        ALTER TABLE users ADD COLUMN admin_role TEXT DEFAULT 'superadmin'
            CHECK (admin_role IN ('superadmin','compliance','finance','support'));
    END IF;
END $$;

-- 6) Flux IBAN : autoriser 'pending_proof', updated_at sur iban_requests,
--    et step 'iban_proof' + amount 0 sur account_activation_requests
DO $$
BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_iban_status_check
        , ADD CONSTRAINT users_iban_status_check
          CHECK (iban_status IN ('none','requested','pending_proof','assigned','active'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='iban_requests' AND column_name='updated_at') THEN
        ALTER TABLE iban_requests ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

DO $$
BEGIN
    ALTER TABLE account_activation_requests DROP CONSTRAINT IF EXISTS account_activation_requests_step_check
        , ADD CONSTRAINT account_activation_requests_step_check
          CHECK (step IN ('iban_request','iban_proof','transfer_proof'));
    ALTER TABLE account_activation_requests DROP CONSTRAINT IF EXISTS account_activation_requests_amount_check
        , ADD CONSTRAINT account_activation_requests_amount_check
          CHECK (amount >= 0);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
