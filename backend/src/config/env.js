// backend/src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  emailVerificationTokenHours: Number(process.env.EMAIL_VERIFICATION_TOKEN_HOURS || 24),
  mailerSendApiKey: process.env.MAILERSEND_API_KEY,
};
