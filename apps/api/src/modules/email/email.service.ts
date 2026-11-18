import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, 'Email service initialized with SMTP transport');
    } else {
      logger.info('Email service initialized in development fallback mode (logging to stdout)');
    }
  }

  async sendPasswordResetCode(to: string, code: string): Promise<boolean> {
    const subject = 'Sanad Governance: Password Recovery Code';
    const text = `Your Sanad password recovery code is: ${code}\n\nThis verification code expires in 15 minutes. If you did not request this recovery code, please contact your systems administrator immediately.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sanad Password Recovery</title>
</head>
<body style="margin: 0; padding: 30px; background-color: #FBF9F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #121A18;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5DFD2; padding: 36px; box-shadow: 0 4px 16px rgba(13, 69, 62, 0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: rgba(201, 151, 39, 0.12); color: #9E7418; border: 1px solid #C99727; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.8px;">
        Sanad Platform Governance
      </div>
      <h2 style="font-size: 22px; color: #0D453E; margin: 16px 0 6px 0; font-weight: 700;">Account Password Recovery</h2>
      <p style="font-size: 13px; color: #566864; margin: 0;">Verification code for administrative account access</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #121A18;">
      We received a request to reset your password on the Sanad Governance Portal. Please use the verification code below to authorize your password update:
    </p>

    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background-color: #F4ECE0; border: 1px solid #C99727; border-radius: 8px; padding: 14px 28px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0D453E; font-family: monospace;">
          ${code}
        </span>
      </div>
      <p style="font-size: 12px; color: #566864; margin-top: 10px;">Valid for 15 minutes</p>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #566864;">
      If you did not initiate this request, your account may be subject to unauthorized access attempts. Please ensure your credentials remain protected.
    </p>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5DFD2; text-align: center; font-size: 11px; color: #566864;">
      Sanad Platform Governance Suite &bull; Automated Security Service
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to,
          subject,
          text,
          html,
        });
        logger.info({ to, subject }, 'Password reset email sent successfully via SMTP');
      } else {
        logger.info({ to, code }, '[Development Email Simulated] Password reset code dispatched to recipient');
      }
      return true;
    } catch (error) {
      logger.error({ error, to }, 'Failed to deliver password reset email');
      return false;
    }
  }
}

export const emailService = new EmailService();
