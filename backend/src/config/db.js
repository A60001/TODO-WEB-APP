import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Optional: quick test (you can comment this out later)
export async function testDbConnection() {
  const result = await pool.query('SELECT NOW()');
  console.log('DB connected at:', result.rows[0].now);
}
