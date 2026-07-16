import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST || '27.112.78.60',
  user: process.env.DB_USER || 'smam1plg-ismuba',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'smam1plg-ismuba',
  database: process.env.DB_NAME || 'smam1plg-ismuba',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectTimeout: 10000,
};

let pool: mysql.Pool | null = null;

export const getPool = async () => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};
