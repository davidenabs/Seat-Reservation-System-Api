import config from '@/config/environment';
import { User, Booking, BookingRequest } from '@/types/index';
import { sendEmail } from '@/utils/email';
import { EmailTemplateBuilder } from '@/utils/emailTemplates';
import { logger } from '@/utils/logger';
import { sendSMS } from '@/utils/sms';

export class NotificationService {

  async sendBookingConfirmationEmail(user: User, booking: Booking, event: any): Promise<void> {
    const emailTemplates = new EmailTemplateBuilder();
    const html = emailTemplates.generateBookingConfirmation(booking);

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@eventhall.com',
      to: user.email,
      subject: 'Booking Confirmation - Event Hall Reservation',
      html,
    };

    await sendEmail(mailOptions);
  }

  async sendTicketSMS(phone: string, ticketId: string): Promise<void> {
    const message = `Your event hall booking is confirmed! Ticket ID: ${ticketId}. Please keep this for verification at the event.`;

    await sendSMS(phone, message);
  }

  async sendBulkNotification(users: User[], message: string, type: 'sms' | 'email' = 'email'): Promise<void> {
    if (type === 'email') {
      const promises = users.map(user => {
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@eventhall.com',
          to: user.email,
          subject: 'Event Hall Notification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Event Hall Notification</h2>
              <p>Dear ${user.name},</p>
              <p>${message}</p>
              <hr style="margin: 30px 0;">
              <p style="font-size: 12px; color: #666;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          `
        };
        return sendEmail(mailOptions);
      });
      await Promise.all(promises);
    } else {
      const phoneNumbers = users.map(user => user.phone);
      await sendSMS(phoneNumbers, message);
    }
  }

  async sendOTPEmail(email: string, otp: string, name: string): Promise<void> {
    const emailTemplates = new EmailTemplateBuilder();

    try {
      const subject = 'Verify Your Email - Booking Confirmation';
     
      const html = emailTemplates.generateOTPEmail(
        {
          userEmail: email,
          otpCode: otp,
          userName: name,
        }
      );
      await sendEmail({ to: email, subject, html });
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(admin: any, tempPassword: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Admin Panel</h2>
        <p>Hello ${admin.username},</p>
        <p>Your admin account has been created successfully. Here are your login details:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Username:</strong> ${admin.username}</p>
          <p><strong>Email:</strong> ${admin.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p><strong>Role:</strong> ${admin.role}</p>
        </div>
        <p style="color: #e74c3c;"><strong>Important:</strong> Please change your password after first login for security.</p>
        <p>Best regards,<br>Admin Team</p>
      </div>
    `;

    await sendEmail({
      to: admin.email,
      subject: 'Welcome to Admin Panel - Account Created',
      html
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(admin: any, resetToken: string): Promise<void> {
    const resetLink = `${config.app.frontendUrl}/admin/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${admin.username},</p>
        <p>You requested to reset your password. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p style="color: #e74c3c;">This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Admin Team</p>
      </div>
    `;

    await sendEmail({
      to: admin.email,
      subject: 'Password Reset Request',
      html
    });
  }

  // Send password change notification
  async sendPasswordChangeNotification(admin: any): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed Successfully</h2>
        <p>Hello ${admin.username},</p>
        <p>Your password has been changed successfully.</p>
        <p><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
        <p>If you didn't make this change, please contact support immediately.</p>
        <p>Best regards,<br>Admin Team</p>
      </div>
    `;

    await sendEmail({
      to: admin.email,
      subject: 'Password Changed Successfully',
      html
    });
  }

  // Send password reset confirmation
  async sendPasswordResetConfirmation(admin: any): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Password Reset Successful</h2>
        <p>Hello ${admin.username},</p>
        <p>Your password has been reset successfully.</p>
        <p><strong>Reset at:</strong> ${new Date().toLocaleString()}</p>
        <p>You can now login with your new password.</p>
        <p>Best regards,<br>Admin Team</p>
      </div>
    `;

    await sendEmail({
      to: admin.email,
      subject: 'Password Reset Successful',
      html
    });
  }

  async sendCancellationConfirmationEmail(booking: Booking): Promise<void> { }
}