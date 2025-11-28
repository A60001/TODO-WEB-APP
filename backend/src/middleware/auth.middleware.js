import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';


export function requireAuth(req, res, next) {
  
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: no token provided' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.userId };

    return next();
  } catch (err) {

    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
  }
}
