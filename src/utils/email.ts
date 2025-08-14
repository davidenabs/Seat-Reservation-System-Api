// import config from '@/config/environment';
// import { MailtrapClient } from 'mailtrap';

// const TOKEN = 'da9a9c0f1f96458a708ae310f06998cb';//|| config.mailtrap.token; // e.g. from your .env or config file
// const SENDER_EMAIL = config.mailtrap.senderEmail; // e.g. 'no-reply@yourdomain.com'

// const client = new MailtrapClient({ token: TOKEN });

// const sender = {
//   name: "Your App Name",
//   email: SENDER_EMAIL,
// };

// export const sendEmail = async ({
//   to,
//   subject,
//   html,
//   text,
// }: {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
// }) => {
//   try {
//     await client.send({
//       from: sender,
//       to: [{ email: to }],
//       subject,
//       html,
//       text: text || 'This is a fallback plain text body.',
//     });

//     console.log(`Email sent to ${to}`);
//   } catch (err) {
//     console.error('Email error:', err);
//     throw err;
//   }
// };

import config from '@/config/environment';
import nodemailer from 'nodemailer';
import { logger } from './logger';

// const accessToken = await oAuth2Client.getAccessToken()

// const transporter = nodemailer.createTransport({
//   // service: 'gmail',
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     // user: 'helloquicklify@gmail.com',
//     // // pass: 'R@p112233'
//     type: "OAuth2",
//     user: "davidenabs@gmail.com",
//     clientId: "548470483426-bqv4hf6jga08k3bahduqk60geuthpk1r.apps.googleusercontent.com",// process.env.GOOGLE_CLIENT_ID,
//     clientSecret: "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", //process.env.GOOGLE_CLIENT_SECRET,
//     // refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//   }
// });

// Looking to send emails in production? Check out our Email API/SMTP product!
var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "be2d917dd5f2a1",
    pass: "30544cafcdcd0e"
  }
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  try {
    await transporter.sendMail({
      from: process.env.SENDGRID_FROM_EMAIL!,
      to,
      subject,
      html
    });
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error('Email error:', err);
    throw err;
  }
};