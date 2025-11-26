
import express from 'express';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import {
    register,
    verifyEmail
} from '../controllers/auth.controller.js';

const router = express.Router();


router.post('/register', register);
// router.post('/login', login);
router.get('/verify-email', verifyEmail);

export default router;
