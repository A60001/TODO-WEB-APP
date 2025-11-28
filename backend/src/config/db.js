import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});


export async function testDbConnection() {
  const result = await pool.query('SELECT NOW()');
  console.log('DB connected at:', result.rows[0].now);
}
