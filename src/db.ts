import { Pool } from 'pg';

export const getPool = async () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  return pool;
};
