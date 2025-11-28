import {
  validateEmail,
  validatePassword,
  validateName,
} from '../utils/validators.js';
import {
  findUserByEmail,
  createUser,
  createEmailVerificationToken,
  authenticateUser,
  signAuthToken,
} from '../services/auth.service.js';
import { sendVerificationEmail } from '../utils/email.js';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';


export async function register(req, res, next) {
  try {
    console.log('--- /api/auth/register called ---');
    console.log('Headers:', req.headers);
    console.log('Body received:', req.body);

    
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message:
          'Request body is missing or not parsed. Make sure you send JSON with Content-Type: application/json.',
      });
    }

    const { email, password, name } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }


    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol.',
      });
    }

    
    if (!validateName(name)) {
      return res.status(400).json({
        message: 'Name is invalid. Please provide a shorter valid name.',
      });
    }

    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already in use. Please login instead.',
      });
    }

    
    const user = await createUser({ email, name, password });

    
    const verificationToken = await createEmailVerificationToken(user.id);
    console.log('Email verification token (DEV ONLY):', verificationToken.token);

    
    const appBaseUrl =
      process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

    const verificationUrl = `${appBaseUrl}/api/auth/verify-email?token=${verificationToken.token}`;

    
    try {
      await sendVerificationEmail(user.email, verificationUrl);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);

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


export async function login(req, res, next) {
  try {
    console.log('--- /api/auth/login called ---');
    console.log('Body received:', req.body);

    const { email, password } = req.body || {};

   
    if (!email && !password) {
      return res.status(400).json({
        message: 'Email and password are both required.',
      });
    }
    
    else if (!email) {
      return res.status(400).json({
        message: 'Email is required.',
      });
    }
   
    else if (!password) {
      return res.status(400).json({
        message: 'Password is required.',
      });
    }

    

    

    
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    
    const user = await authenticateUser(email, password);

    if (!user) {
      
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    
    if (!user.is_email_verified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
      });
    }

    
    const token = signAuthToken(user);

    
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000, 
    });

    
    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_email_verified: user.is_email_verified,
      },
    });
  } catch (err) {
    console.error('Error in login:', err);
    next(err);
  }
}



export function logout(req, res) {

  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });


  return res.json({ message: 'Logged out successfully' });
}






export async function verifyEmail(req, res, next) {
  try {
    
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ message: 'Verification token is missing.' });
    }

    
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

    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification token.' });
    }

    const record = result.rows[0];

    if (record.used_at) {
      return res.status(400).json({
        message: 'Token already used. Email is already verified.',
      });
    }

    const now = new Date();
    const expiresAt = new Date(record.expires_at);

    if (expiresAt <= now) {
      return res
        .status(400)
        .json({ message: 'Verification token has expired.' });
    }

    await pool.query(
      `UPDATE users SET is_email_verified = TRUE WHERE id = $1`,
      [record.user_id]
    );

    await pool.query(
      `UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1`,
      [record.id]
    );

    const redirectUrl = `${env.clientUrl}/verify-email/success`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Error in verifyEmail:', err);
    
    return next(err);
  }
}



export async function getCurrentUser(req, res, next) {
  try {
    
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT id, email, name, is_email_verified, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.is_email_verified,
      createdAt: user.created_at,
    });
  } catch (err) {
    
    return next(err);
  }
}



// export { register, verifyEmail };
