// src/controllers/auth.controller.js

import {
  validateEmail,
  validatePassword,
  validateName,
} from '../utils/validators.js';
import {
  findUserByEmail,
  createUser,
  createEmailVerificationToken,
} from '../services/auth.service.js';
import { sendVerificationEmail } from '../utils/email.js';


export async function register(req, res, next) {
  try {
    console.log('--- /api/auth/register called ---');
    console.log('Headers:', req.headers);
    console.log('Body received:', req.body);

    // Guard: if body is missing
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message:
          'Request body is missing or not parsed. Make sure you send JSON with Content-Type: application/json.',
      });
    }

    const { email, password, name } = req.body;

    // Basic presence check
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol.',
      });
    }

    // Validate name (optional)
    if (!validateName(name)) {
      return res.status(400).json({
        message: 'Name is invalid. Please provide a shorter valid name.',
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already in use. Please login instead.',
      });
    }

    // Create user
    const user = await createUser({ email, name, password });

    // Create verification token
    const verificationToken = await createEmailVerificationToken(user.id);
    console.log('Email verification token (DEV ONLY):', verificationToken.token);

    // 🔑 Build verification URL using backend base URL from env
    const appBaseUrl =
      process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

    const verificationUrl = `${appBaseUrl}/api/auth/verify-email?token=${verificationToken.token}`;

    // 📧 Send verification email via MailerSend
    try {
      await sendVerificationEmail(user.email, verificationUrl);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);

      // Option A: still return success but mention email issue (user can re-request later)
      // return res.status(500).json({ message: 'User created, but failed to send verification email. Please try again later.' });

      // Option B (current): fail the whole request
      return res.status(500).json({
        message:
          'Registration failed while sending verification email. Please try again later.',
      });
    }

    return res.status(201).json({
      message:
        'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_email_verified: user.is_email_verified,
      },
    });
  } catch (err) {
    next(err);
  }
}



export async function verifyEmail(req, res) {
  try {
    // 1) Read token from URL query string
    // Example URL: /api/auth/verify-email?token=abc123
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is missing.' });
    }

    // 2) Look up the token in the database
    const result = await pool.query(
      `
        SELECT
          evt.id,
          evt.user_id,
          evt.expires_at,
          evt.used_at,
          u.is_email_verified
        FROM email_verification_tokens AS evt
        JOIN users AS u
          ON u.id = evt.user_id
        WHERE evt.token = $1
      `,
      [token]
    );

    // If no record found, token is invalid
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification token.' });
    }

    const record = result.rows[0];

    // 3) Check if token already used
    if (record.used_at) {
      return res
        .status(400)
        .json({ message: 'Token already used. Email is already verified.' });
    }

    // 4) Check if token expired
    const now = new Date();
    const expiresAt = new Date(record.expires_at);

    if (expiresAt <= now) {
      return res.status(400).json({ message: 'Verification token has expired.' });
    }

    // 5) Token is valid -> mark user as verified
    await pool.query(
      `UPDATE users SET is_email_verified = TRUE WHERE id = $1`,
      [record.user_id]
    );

    // 6) Mark token as used
    await pool.query(
      `UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1`,
      [record.id]
    );

    // 7) Redirect to frontend success page
    const redirectUrl = `${env.clientUrl}/verify-email/success`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Error in verifyEmail:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}



// export { register, verifyEmail };
