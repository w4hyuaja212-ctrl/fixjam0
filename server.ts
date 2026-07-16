import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Pool } from 'pg';
import { getPool } from './src/db';
import { formatDate } from './src/utils';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Database Connection Pool and Auto-Create/Verify Tables
async function initDb() {
  try {
    console.log(`Connecting to Postgres database with URL: ${process.env.POSTGRES_URL ? 'set' : 'not set'}`);
    const pool = await getPool();

    // Test connection
    const conn = await pool.connect();
    console.log('Database connection successful!');
    conn.release();

    // Create tables if they do not exist
    await createTables(pool);

    // Run dynamic migration helper to add missing columns
    await verifyAndMigrateColumns(pool);

  } catch (err: any) {
    console.error('Failed to initialize Database:', err.message);
  }
}

async function createTables(pool: Pool) {
  console.log('Verifying database tables...');

  // 1. TahunAjaran
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tahun_ajaran (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT false
    );
  `);

  // 2. Kelas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kelas (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      wali_kelas VARCHAR(255) DEFAULT '',
      gedung VARCHAR(50) DEFAULT 'A'
    );
  `);

  // 3. Siswa
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siswa (
      id VARCHAR(255) PRIMARY KEY,
      nis VARCHAR(255) DEFAULT '',
      name VARCHAR(255) NOT NULL,
      kelas_id VARCHAR(255) DEFAULT ''
    );
  `);

  // 4. Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      role VARCHAR(50) DEFAULT 'piket',
      name VARCHAR(255) DEFAULT ''
    );
  `);

  // 5. Jadwal
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jadwal (
      id VARCHAR(255) PRIMARY KEY,
      tanggal DATE,
      jam_ke_0_gedung_a VARCHAR(255) DEFAULT '',
      jam_ke_0_gedung_b VARCHAR(255) DEFAULT '',
      dzuhur_gedung_a VARCHAR(255) DEFAULT '',
      dzuhur_gedung_b VARCHAR(255) DEFAULT '',
      kultum_gedung_a VARCHAR(255) DEFAULT '',
      kultum_gedung_b VARCHAR(255) DEFAULT '',
      cadangan_kultum_gedung_a VARCHAR(255) DEFAULT '',
      cadangan_kultum_gedung_b VARCHAR(255) DEFAULT '',
      azan_gedung_a VARCHAR(255) DEFAULT '',
      azan_gedung_b VARCHAR(255) DEFAULT '',
      tadarus_gedung_a VARCHAR(255) DEFAULT '',
      tadarus_gedung_b VARCHAR(255) DEFAULT ''
    );
  `);

  console.log('Base database tables verified!');
}

async function verifyAndMigrateColumns(pool: Pool) {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'jadwal'");
    const columnNames = res.rows.map((row: any) => row.column_name.toLowerCase());

    if (!columnNames.includes('cadangan_kultum_gedung_a')) {
      console.log('Migrating: Adding column cadangan_kultum_gedung_a to table jadwal...');
      await pool.query('ALTER TABLE jadwal ADD COLUMN cadangan_kultum_gedung_a VARCHAR(255) DEFAULT \'\'');
    }
    if (!columnNames.includes('cadangan_kultum_gedung_b')) {
      console.log('Migrating: Adding column cadangan_kultum_gedung_b to table jadwal...');
      await pool.query('ALTER TABLE jadwal ADD COLUMN cadangan_kultum_gedung_b VARCHAR(255) DEFAULT \'\'');
    }
    console.log('All dynamic column migrations verified!');
  } catch (err: any) {
    console.error('Failed to run column migrations:', err.message);
  }
}

// Helper to get pool and ensure connection
async function getDbPool() {
  return await getPool();
}

// API ENDPOINTS

// Get all database records aggregated
app.get('/api/all', async (req, res) => {
  try {
    const pool = await getDbPool();
    const tahunAjaranRows = await pool.query('SELECT * FROM tahun_ajaran ORDER BY id ASC');
    const kelasRows = await pool.query('SELECT * FROM kelas ORDER BY id ASC');
    const siswaRows = await pool.query('SELECT * FROM siswa ORDER BY id ASC');
    const usersRows = await pool.query('SELECT * FROM users ORDER BY id ASC');
    const jadwalRows = await pool.query('SELECT * FROM jadwal ORDER BY tanggal DESC, id DESC');

    // Normalize types and map to frontend camelCase formats
    const tahunAjaran = (tahunAjaranRows.rows as any[]).map(ta => ({
      id: String(ta.id),
      name: String(ta.name),
      isActive: ta.is_active === 1 || ta.is_active === true
    }));

    const kelas = (kelasRows.rows as any[]).map(k => ({
      id: String(k.id),
      name: String(k.name),
      waliKelas: String(k.wali_kelas || ''),
      gedung: k.gedung === 'B' ? 'B' : 'A'
    }));

    const siswa = (siswaRows.rows as any[]).map(s => ({
      id: String(s.id),
      nis: String(s.nis || ''),
      name: String(s.name),
      kelasId: String(s.kelas_id || '')
    }));

    const users = (usersRows.rows as any[]).map(u => ({
      id: String(u.id),
      username: String(u.username),
      role: u.role === 'admin' ? 'admin' : 'piket',
      name: String(u.name || '')
    }));

    const jadwal = (jadwalRows.rows as any[]).map(j => ({
      id: String(j.id),
      tanggal: formatDate(j.tanggal),
      jamKe0GedungA: String(j.jam_ke_0_gedung_a || ''),
      jamKe0GedungB: String(j.jam_ke_0_gedung_b || ''),
      dzuhurGedungA: String(j.dzuhur_gedung_a || ''),
      dzuhurGedungB: String(j.dzuhur_gedung_b || ''),
      kultumGedungA: String(j.kultum_gedung_a || ''),
      kultumGedungB: String(j.kultum_gedung_b || ''),
      cadanganKultumGedungA: String(j.cadangan_kultum_gedung_a || ''),
      cadanganKultumGedungB: String(j.cadangan_kultum_gedung_b || ''),
      azanGedungA: String(j.azan_gedung_a || ''),
      azanGedungB: String(j.azan_gedung_b || ''),
      tadarusGedungA: String(j.tadarus_gedung_a || ''),
      tadarusGedungB: String(j.tadarus_gedung_b || '')
    }));

    return res.json({
      status: 'success',
      data: {
        tahunAjaran,
        kelas,
        siswa,
        users,
        jadwal
      }
    });

  } catch (err: any) {
    console.error('Error fetching data from MySQL:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});


// Single POST Router replicating GAS Post Routing for backward compatibility & minimum frontend rewrite
app.post('/api/save', async (req, res) => {
  const { action, data, id } = req.body;

  try {
    const pool = await getDbPool();
    let resultId = id;

    if (action === 'saveTahunAjaran') {
      const isActive = data.isActive === true || data.isActive === 'true' || data.isActive === 1 ? 1 : 0;
      
      // If we are activating this year, optionally set others to inactive
      if (isActive === 1) {
        await pool.query('UPDATE tahun_ajaran SET is_active = 0');
      }

      const targetId = id || Date.now().toString();

      if (id) {
        await pool.query(
          'UPDATE tahun_ajaran SET name = ?, is_active = ? WHERE id = ?',
          [data.name, isActive, String(id)]
        );
      } else {
        await pool.query(
          'INSERT INTO tahun_ajaran (id, name, is_active) VALUES (?, ?, ?)',
          [targetId, data.name, isActive]
        );
      }
      resultId = targetId;

    } else if (action === 'saveKelas') {
      const gedung = String(data.gedung || 'A').toUpperCase() === 'B' ? 'B' : 'A';
      const targetId = id || Date.now().toString();

      if (id) {
        await pool.query(
          'UPDATE kelas SET name = ?, wali_kelas = ?, gedung = ? WHERE id = ?',
          [data.name, data.waliKelas || '', gedung, String(id)]
        );
      } else {
        await pool.query(
          'INSERT INTO kelas (id, name, wali_kelas, gedung) VALUES (?, ?, ?, ?)',
          [targetId, data.name, data.waliKelas || '', gedung]
        );
      }
      resultId = targetId;

    } else if (action === 'saveSiswa') {
      const targetId = id || Date.now().toString();

      if (id) {
        await pool.query(
          'UPDATE siswa SET nis = ?, name = ?, kelas_id = ? WHERE id = ?',
          [data.nis || '', data.name, String(data.kelasId || ''), String(id)]
        );
      } else {
        await pool.query(
          'INSERT INTO siswa (id, nis, name, kelas_id) VALUES (?, ?, ?, ?)',
          [targetId, data.nis || '', data.name, String(data.kelasId || '')]
        );
      }
      resultId = targetId;

    } else if (action === 'deleteSiswa') {
      if (id) {
        await pool.query('DELETE FROM siswa WHERE id = ?', [String(id)]);
      }

    } else if (action === 'saveUser') {
      const targetId = id || Date.now().toString();

      if (id) {
        await pool.query(
          'UPDATE users SET username = ?, role = ?, name = ? WHERE id = ?',
          [data.username, data.role || 'piket', data.name || '', String(id)]
        );
      } else {
        await pool.query(
          'INSERT INTO users (id, username, role, name) VALUES (?, ?, ?, ?)',
          [targetId, data.username, data.role || 'piket', data.name || '']
        );
      }
      resultId = targetId;

    } else if (action === 'saveJadwal') {
      const targetId = id || Date.now().toString();
      const formattedDate = formatDate(data.tanggal);

      if (id) {
        await pool.query(
          `UPDATE jadwal SET 
            tanggal = ?, 
            jam_ke_0_gedung_a = ?, jam_ke_0_gedung_b = ?, 
            dzuhur_gedung_a = ?, dzuhur_gedung_b = ?, 
            kultum_gedung_a = ?, kultum_gedung_b = ?, 
            cadangan_kultum_gedung_a = ?, cadangan_kultum_gedung_b = ?,
            azan_gedung_a = ?, azan_gedung_b = ?, 
            tadarus_gedung_a = ?, tadarus_gedung_b = ?
           WHERE id = ?`,
          [
            formattedDate, 
            data.jamKe0GedungA || '', data.jamKe0GedungB || '',
            data.dzuhurGedungA || '', data.dzuhurGedungB || '',
            data.kultumGedungA || '', data.kultumGedungB || '',
            data.cadanganKultumGedungA || '', data.cadanganKultumGedungB || '',
            data.azanGedungA || '', data.azanGedungB || '',
            data.tadarusGedungA || '', data.tadarusGedungB || '',
            String(id)
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO jadwal (
            id, tanggal, 
            jam_ke_0_gedung_a, jam_ke_0_gedung_b, 
            dzuhur_gedung_a, dzuhur_gedung_b, 
            kultum_gedung_a, kultum_gedung_b, 
            cadangan_kultum_gedung_a, cadangan_kultum_gedung_b,
            azan_gedung_a, azan_gedung_b, 
            tadarus_gedung_a, tadarus_gedung_b
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            targetId, formattedDate, 
            data.jamKe0GedungA || '', data.jamKe0GedungB || '',
            data.dzuhurGedungA || '', data.dzuhurGedungB || '',
            data.kultumGedungA || '', data.kultumGedungB || '',
            data.cadanganKultumGedungA || '', data.cadanganKultumGedungB || '',
            data.azanGedungA || '', data.azanGedungB || '',
            data.tadarusGedungA || '', data.tadarusGedungB || ''
          ]
        );
      }
      resultId = targetId;

    } else {
      return res.status(400).json({ status: 'error', message: `Unknown action: ${action}` });
    }

    return res.json({ status: 'success', id: resultId });

  } catch (err: any) {
    console.error(`Error saving action ${action}:`, err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// Service configuration sync for Client UI
app.get('/api/db-config', (req, res) => {
  res.json({
    host: 'hidden',
    user: 'hidden',
    database: 'hidden',
    port: 0
  });
});

// Configure Vite or Static Assets middleware
async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    console.log('Mounting Vite dev server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static files...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}

export default app;

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  startServer();
}
