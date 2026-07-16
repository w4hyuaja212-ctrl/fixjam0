import { Pool } from 'pg';

let pool: Pool | null = null;

export const getPool = async () => {
  if (pool) return pool;

  const connectionString = process.env.POSTGRES_URL;
  console.log('DEBUG: connectionString', connectionString);
  pool = new Pool({
    connectionString: connectionString?.replace('sslmode=require', 'sslmode=disable'),
    ssl: {
      rejectUnauthorized: false,
    },
  });
  return pool;
};
