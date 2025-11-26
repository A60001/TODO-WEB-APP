
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../config/db.js';

const SALT_ROUNDS = 10;


export async function findUserByEmail(email) {
  const query = `
    SELECT id, email, password_hash, is_email_verified
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}


export async function createUser({ email, name, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const query = `
    INSERT INTO users (email, name, password_hash, is_email_verified)
    VALUES ($1, $2, $3, FALSE)
    RETURNING id, email, name, is_email_verified, created_at
  `;
  const values = [email, name || null, passwordHash];

  const result = await pool.query(query, [values[0], values[1], values[2]]);
  return result.rows[0];
}


export async function createEmailVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours

  const query = `
    INSERT INTO email_verification_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, token, expires_at
  `;
  const values = [userId, token, expiresAt];

  const result = await pool.query(query, values);
  return result.rows[0]; 
}
