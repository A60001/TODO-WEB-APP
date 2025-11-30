import { pool } from '../config/db.js';
import { getTaskListsForUser } from '../services/tasklists.service.js';

export async function getTaskLists(req, res, next) {
  try {
    const userId = req.user.id;

    const lists = await getTaskListsForUser(userId);

    return res.json({ lists });
  } catch (err) {
    return next(err);
  }
}



export async function deleteTaskList(req, res, next) {
  try {
    const userId = req.user.id;
    const listId = req.params.id;

    
    const { rows } = await pool.query(
      `
        SELECT id, is_default
        FROM task_lists
        WHERE id = $1 AND user_id = $2
        LIMIT 1
      `,
      [listId, userId]
    );

    const list = rows[0];

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    
    if (list.is_default) {
      return res.status(400).json({ message: 'Default list cannot be deleted.' });
    }


    await pool.query(
      `
        DELETE FROM task_lists
        WHERE id = $1 AND user_id = $2
      `,
      [listId, userId]
    );

    return res.json({ message: 'List deleted successfully.' });
  } catch (err) {
    return next(err);
  }
}
