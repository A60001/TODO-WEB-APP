import { pool } from '../config/db.js';

export async function getTaskListsForUser(userId) {
  const query = `
    SELECT id, name, sort_order, created_at, updated_at
    FROM task_lists
    WHERE user_id = $1
    ORDER BY sort_order ASC, created_at ASC
  `;

  const values = [userId];

  const { rows } = await pool.query(query, values);

  return rows;
}
