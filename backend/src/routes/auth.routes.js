
import express from 'express';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import {
    register,
    verifyEmail,
    login,
    getCurrentUser,
    logout 
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();


router.post('/register', register);

router.post('/login', login);

router.get('/verify-email', verifyEmail);

router.get('/me', requireAuth, getCurrentUser);

router.post('/logout', logout);

export default router;

