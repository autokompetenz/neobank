import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant');
  process.exit(1);
}

const isRemote = /neon\.tech|supabase|sslmode=require/i.test(process.env.DATABASE_URL || '');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
});

const SQL = `
DO $$
BEGIN
  -- 1) Autoriser 'pending_proof' sur users.iban_status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'iban_status'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_iban_status_check;
    ALTER TABLE users ADD CONSTRAINT users_iban_status_check
      CHECK (iban_status IN ('none','requested','pending_proof','assigned','active'));
  END IF;

  -- 2) Ajouter updated_at sur iban_requests si absent
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'iban_requests'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'iban_requests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE iban_requests ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  -- 3) account_activation_requests : autoriser step 'iban_proof' et amount 0
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'account_activation_requests'
  ) THEN
    ALTER TABLE account_activation_requests DROP CONSTRAINT IF EXISTS account_activation_requests_step_check;
    ALTER TABLE account_activation_requests ADD CONSTRAINT account_activation_requests_step_check
      CHECK (step IN ('iban_request','iban_proof','transfer_proof'));
    ALTER TABLE account_activation_requests DROP CONSTRAINT IF EXISTS account_activation_requests_amount_check;
    ALTER TABLE account_activation_requests ADD CONSTRAINT account_activation_requests_amount_check
      CHECK (amount >= 0);
  END IF;
END $$;
`;

try {
  await pool.query(SQL);
  console.log('Migration IBAN appliquée : pending_proof autorisé, updated_at ajouté, step iban_proof/amount 0 autorisés.');
} catch (e) {
  console.error('Erreur lors de la migration :', e.message);
  process.exit(1);
} finally {
  await pool.end();
}
