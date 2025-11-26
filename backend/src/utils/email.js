import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { env } from '../config/env.js';

const mailerSend = new MailerSend({
  apiKey: env.mailerSendApiKey || process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(
  env.mailerSendFromEmail || process.env.MAILERSEND_FROM_EMAIL,
  env.mailerSendFromName || process.env.MAILERSEND_FROM_NAME
);

export async function sendVerificationEmail(toEmail, verificationUrl) {
  const recipients = [new Recipient(toEmail, toEmail)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Verify your email for Todo App')
    .setHtml(`
      <p>Hi,</p>
      <p>Thanks for signing up to <strong>ACTDONE</strong>.</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verificationUrl}" target="_blank" rel="noopener">Verify my email</a></p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `)
    .setText(
      `Thanks for signing up to ACTDONE.\n` +
      `Please verify your email by visiting this link:\n${verificationUrl}\n\n` +
      `If you didn't create an account, you can ignore this email.`
    );

  try {
    const response = await mailerSend.email.send(emailParams);
    
    console.log('Verification email sent:', response.statusCode);
  } catch (error) {
    console.error('Error sending verification email:', error?.message || error);
    
    throw new Error('Failed to send verification email');
  }
}
