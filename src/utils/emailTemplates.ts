// emailTemplates.js - Reusable Email Template System

import { Booking, User, Event } from "@/types";
import { formatDate } from "./formatDate";
import config from "@/config/environment";

export class EmailTemplateBuilder {
  private readonly baseStyles: string;

  constructor() {
    this.baseStyles = `
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background: linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%);
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
            margin-bottom: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #10b981;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .status-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            margin: 20px auto;
          }
          .success { background-color: #10b981; }
          .warning { background-color: #f59e0b; }
          .error { background-color: #ef4444; }
          .info { background-color: #3b82f6; }
          
          .status-icon svg {
            width: 32px;
            height: 32px;
            fill: white;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 10px 0;
            text-align: center;
          }
          .subtitle {
            color: #6b7280;
            text-align: center;
            margin-bottom: 30px;
          }
          .details-section {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
          }
          .details-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 500;
            color: #6b7280;
          }
          .detail-value {
            color: #374151;
            font-weight: 500;
          }
          .badge {
            background: #e5e7eb;
            color: #374151;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
          }
          .badge.confirmed { background: #d1fae5; color: #065f46; }
          .badge.cancelled { background: #fee2e2; color: #991b1b; }
          .badge.pending { background: #fef3c7; color: #92400e; }
          
          .button {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            text-align: center;
            margin: 10px 5px;
          }
          .button-primary {
            background: #000000;
            color: white;
          }
          .button-primary:hover {
            background: #1f2937;
          }
          .button-secondary {
            background: transparent;
            color: #374151;
            border: 2px solid #d1d5db;
          }
          .button-danger {
            background: red;
            color: white;
          }
          .info-section {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          .info-title {
            color: #1e40af;
            font-weight: 600;
            margin-left: 8px;
          }
          .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .info-list li {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;
            color: #1d4ed8;
            font-size: 14px;
          }
          .info-bullet {
            width: 6px;
            height: 6px;
            background: #1d4ed8;
            border-radius: 50%;
            margin-top: 8px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .qr-section {
            text-align: center;
            padding: 20px;
            margin: 20px 0;
          }
          .qr-code {
            max-width: 200px;
            height: auto;
            border-radius: 8px;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
          }
          @media only screen and (max-width: 600px) {
            .container {
              margin: 10px;
              padding: 15px;
            }
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 5px;
            }
          }
        </style>
      `;
  }

  getLogo() {
    return 'data:image/png;base64,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';
  }

  // SVG Icons
  getIcon(type: 'success' | 'warning' | 'error' | 'info') {
    const icons = {
      success: `<svg viewBox="0 0 24 24"><path d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 6.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z"  width="16" height="16"/></svg>`,
      warning: `<svg viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"  width="16" height="16"/></svg>`,
      error: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"  width="16" height="16"/></svg>`,
      info: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"  width="16" height="16"/></svg>`
    };
    // return icons[type] || icons.info;
    return icons.info;
  }

  // Base template structure
  generateBaseTemplate(content: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Notification</title>
        ${this.baseStyles}
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
      </html>
      `;
  }

  // Booking Confirmation Template
  generateBookingConfirmation(data: Booking) {
    const {
      eventDate,
      seatLabels,
      ticketId,
      status = 'confirmed',
      qrCode,
      event,
      user,
      calendarLink,
      reservationToken
    } = data;

    const u = user as User;
    const e = event as Event;

    const content = `
        <div class="header">
           <img src="${this.getLogo()}" alt="Logo" class="logo">
        </div>
  
        <div class="status-icon success">
          <div>${this.getIcon('success')}</div>
        </div>
  
        <h1 class="title">Booking Successful!</h1>
        <p class="subtitle">Your seat has been reserved successfully</p>
  
        <div class="details-section">
          <h2 class="details-title">Booking Summary</h2>
          <div class="detail-row">
            <span class="detail-label">Session</span>
            <span class="detail-value">${'The Nigerian Family Space'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${formatDate(eventDate.toString())}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">${'4:00PM'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="badge confirmed">${status.toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Seat(s)</span>
            <span class="detail-value badge">${Array.isArray(seatLabels) ? seatLabels.join(', ') : seatLabels}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${e?.location ?? "Conference Hall A"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value" style="font-family: monospace;">${ticketId}</span>
          </div>
        </div>
  
        ${qrCode ? `
        <div class="qr-section">
          <img src="${qrCode}" alt="QR Code" class="qr-code">
          <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">Scan this QR code at the venue</p>
        </div>
        ` : ''}
  
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" class="button button-primary">View Details</a>
          <a href="${calendarLink}" class="button button-secondary">Add to Calendar</a>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.app.frontendUrl}/cancel/${ticketId}/${reservationToken}" class="button button-danger">Cancel Booking</a>
        </div>
  
        <div class="info-section">
          <div class="info-header">
            <!--<div>${this.getIcon('info')}</div>-->
            <span class="info-title">Important Information</span>
          </div>
          <ul class="info-list">
            <li><span class="info-bullet"></span>Please arrive 15 minutes before the session starts</li>
            <li><span class="info-bullet"></span>Bring a valid ID for verification</li>
            <li><span class="info-bullet"></span>Session materials will be provided</li>
            <li><span class="info-bullet"></span>Contact support@company.com for any queries</li>
          </ul>
        </div>
  
        <div class="footer">
          <p>Thank you for booking with us! We look forward to seeing you at the event.</p>
          <p>This email was sent to ${u.email}</p>
        </div>
      `;

    return this.generateBaseTemplate(content);
  }

  // Booking Cancellation Template
  generateBookingCancellation(data: Booking, reason = 'Customer request') {
    const {
      eventDate,
      seatLabels,
      ticketId,
      status = 'confirmed',
      qrCode,
      event,
      user

    } = data;

    const u = user as User;
    const e = event as Event;

    const content = `
        <div class="header">
          <img src="${this.getLogo()}" alt="Logo" class="logo">
        </div>
  
        <div class="status-icon error">
          <div>${this.getIcon('error')} </div> 
      </div>
  
        <h1 class="title">Booking Cancelled</h1>
        <p class="subtitle">Your booking has been successfully cancelled</p>
  
        <div class="details-section">
          <h2 class="details-title">Cancellation Details</h2>
          <div class="detail-row">
            <span class="detail-label">Session</span>
            <span class="detail-value">${e.sessionName ?? ""}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${formatDate(eventDate.toString())}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">${e.time ?? "4:00PM"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Seat(s)</span>
            <span class="detail-value">${Array.isArray(seatLabels) ? seatLabels.join(', ') : seatLabels}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value" style="font-family: monospace;">${ticketId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Reason</span>
            <span class="detail-value">${reason}</span>
          </div>
        </div>
  
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" class="button button-primary">Browse Other Events</a>
          <a href="#" class="button button-secondary">Contact Support</a>
        </div>
  
        <div class="footer">
          <p>We're sorry to see you go. We hope to serve you again in the future.</p>
          <p>This email was sent to ${u.email}</p>
        </div>
      `;

    return this.generateBaseTemplate(content);
  }

  // OTP Email Template
  generateOTPEmail(data: { userName?: "" | string; otpCode: any; expiryTime?: "10 minutes" | undefined; purpose?: "verify your account" | undefined; userEmail: any; companyName?: "Your Company" | undefined; }) {
    const {
      userName = '',
      otpCode,
      expiryTime = '10 minutes',
      purpose = 'verify your account',
      userEmail,
      companyName = 'Your Company'
    } = data;

    const content = `
      <div class="header">
       <img src="${this.getLogo()}" alt="Logo" class="logo">
      </div>

      <div class="status-icon info">
        <div>${this.getIcon('info')}</div> 
     </div>

      <h1 class="title">Verification Code</h1>
      <p class="subtitle">Please use the following code to ${purpose}</p>

      ${userName ? `<p style="text-align: center; margin: 20px 0; color: #374151;">Hello ${userName},</p>` : ''}

      <div class="otp-section" style="text-align: center; margin: 40px 0; padding: 30px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px;">
        <p style="color: #64748b; font-size: 14px; margin-bottom: 10px; font-weight: 500;">YOUR VERIFICATION CODE</p>
        <div class="otp-code" style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b; font-family: 'Courier New', monospace; background: #ffffff; padding: 15px 25px; border-radius: 8px; display: inline-block; border: 1px solid #e2e8f0;">${otpCode}</div>
        <p style="color: #64748b; font-size: 12px; margin-top: 10px;">This code will expire in ${expiryTime}</p>
      </div>

      <div class="info-section">
        <div class="info-header">
         <!-- <div>${this.getIcon('warning')}</div>-->
          <span class="info-title">Security Notice</span>
        </div>
        <ul class="info-list">
          <li><span class="info-bullet"></span>This code is valid for ${expiryTime} only</li>
          <li><span class="info-bullet"></span>Never share this code with anyone</li>
          <li><span class="info-bullet"></span>If you didn't request this code, please ignore this email</li>
          <li><span class="info-bullet"></span>Contact support if you have any concerns</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          <strong>Having trouble?</strong> If you're unable to use the code above, please contact our support team at 
          <a href="mailto:support@company.com" style="color: #d97706; text-decoration: none;">support@company.com</a>
        </p>
      </div>

      <div class="footer">
        <p>This verification code was requested for ${userEmail}</p>
        <p>© ${new Date().getFullYear()}. All rights reserved.</p>
      </div>
    `;

    return this.generateBaseTemplate(content);
  }

  // Welcome Email Template
  // generateWelcomeEmail(data) {
  //   const {
  //     logoUrl = '',
  //     userName,
  //     userEmail,
  //     welcomeMessage = 'Welcome to our platform!',
  //     features = []
  //   } = data;

  //   const content = `
  //       <div class="header">
  //         ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
  //       </div>

  //       <div class="status-icon info">
  //         <div>${this.getIcon('info')}

  //       <h1 class="title">Welcome, ${userName}!</h1>
  //       <p class="subtitle">${welcomeMessage}</p>

  //       <div class="details-section">
  //         <h2 class="details-title">Get Started</h2>
  //         <p style="margin-bottom: 20px;">Here's what you can do with your account:</p>

  //         ${features.length > 0 ? `
  //         <ul class="info-list">
  //           ${features.map(feature => `
  //             <li><span class="info-bullet"></span>${feature}</li>
  //           `).join('')}
  //         </ul>
  //         ` : `
  //         <ul class="info-list">
  //           <li><span class="info-bullet"></span>Browse and book events</li>
  //           <li><span class="info-bullet"></span>Manage your bookings</li>
  //           <li><span class="info-bullet"></span>Receive event notifications</li>
  //           <li><span class="info-bullet"></span>Access exclusive content</li>
  //         </ul>
  //         `}
  //       </div>

  //       <div style="text-align: center; margin: 30px 0;">
  //         <a href="#" class="button button-primary">Complete Profile</a>
  //         <a href="#" class="button button-secondary">Browse Events</a>
  //       </div>

  //       <div class="info-section">
  //         <div class="info-header">
  //           <div>${this.getIcon('info')}
  //         </div>
  //         <ul class="info-list">
  //           <li><span class="info-bullet"></span>Check our FAQ section</li>
  //           <li><span class="info-bullet"></span>Contact support at support@company.com</li>
  //           <li><span class="info-bullet"></span>Join our community forum</li>
  //         </ul>
  //       </div>

  //       <div class="footer">
  //         <p>Thank you for joining us! We're excited to have you on board.</p>
  //         <p>This email was sent to ${userEmail}</p>
  //       </div>
  //     `;

  //   return this.generateBaseTemplate(content);
  // }

  // General Notification Template
  // generateNotification(data) {
  //   const {
  //     logoUrl = '',
  //     title,
  //     message,
  //     type = 'info', // success, warning, error, info
  //     actionButton,
  //     userEmail,
  //     details = []
  //   } = data;

  //   const content = `
  //       <div class="header">
  //         ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
  //       </div>

  //       <div class="status-icon ${type}">
  //         <div>${this.getIcon(type)}
  //</div>       </div>

  //       <h1 class="title">${title}</h1>
  //       <p class="subtitle">${message}</p>

  //       ${details.length > 0 ? `
  //       <div class="details-section">
  //         <h2 class="details-title">Details</h2>
  //         ${details.map(detail => `
  //           <div class="detail-row">
  //             <span class="detail-label">${detail.label}</span>
  //             <span class="detail-value">${detail.value}</span>
  //           </div>
  //         `).join('')}
  //       </div>
  //       ` : ''}

  //       ${actionButton ? `
  //       <div style="text-align: center; margin: 30px 0;">
  //         <a href="${actionButton.url}" class="button button-primary">${actionButton.text}</a>
  //       </div>
  //       ` : ''}

  //       <div class="footer">
  //         <p>This is an automated notification from our system.</p>
  //         <p>This email was sent to ${userEmail}</p>
  //       </div>
  //     `;

  //   return this.generateBaseTemplate(content);
  // }
}

// Usage Examples and Export
const emailTemplates = new EmailTemplateBuilder();

// Example usage in Node.js:
/*
const nodemailer = require('nodemailer');
 
// Configure your email transporter
const transporter = nodemailer.createTransporter({
  // your email config
});
 
// Send booking confirmation
const bookingData = {
  logoUrl: 'https://your-domain.com/logo.png',
  sessionName: 'The Nigerian Family Space',
  date: 'Thursday, July 18, 2023',
  time: '4:00 PM - 6:00 PM',
  seats: ['46C'],
  location: 'Conference Hall A',
  bookingId: '#BK-2023-001234',
  status: 'confirmed',
  qrCode: 'https://your-qr-code-url.com/qr.png',
  userEmail: 'user@example.com'
};
 
const htmlContent = emailTemplates.generateBookingConfirmation(bookingData);
 
await transporter.sendMail({
  from: 'noreply@yourcompany.com',
  to: bookingData.userEmail,
  subject: 'Booking Confirmation - ' + bookingData.sessionName,
  html: htmlContent
});
*/

module.exports = {
  EmailTemplateBuilder,
  emailTemplates
};