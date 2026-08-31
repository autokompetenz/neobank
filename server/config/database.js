import pg from 'pg';

const { Pool } = pg;

// max: petit nombre, adapté au mode serverless (Vercel) et aux hébergeurs cloud.
const max = Number(process.env.PG_MAX_POOL) || (process.env.NODE_ENV === 'production' ? 3 : 10);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon/Supabase exigent SSL ; en production (Vercel) on force aussi SSL.
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('supabase') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error', err);
});
