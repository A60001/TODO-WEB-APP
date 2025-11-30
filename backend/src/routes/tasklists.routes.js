import express from 'express';
import { getTaskLists, deleteTaskList  } from '../controllers/tasklists.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth, getTaskLists);

router.delete('/:id', requireAuth, deleteTaskList);

export default router;
