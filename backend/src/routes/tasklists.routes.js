import express from 'express';
import { getTaskLists, deleteTaskList, createTaskList, renameTaskList } from '../controllers/tasklists.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth, getTaskLists);

router.post('/', requireAuth, createTaskList);

router.patch('/:id', requireAuth, renameTaskList);

router.delete('/:id', requireAuth, deleteTaskList);

export default router;
