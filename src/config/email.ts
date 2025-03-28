// backend/src/config/email.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// Configure the email transporter using SMTP settings.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a verification email with a clickable link.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.BACKEND_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;
  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email Address",
    text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    html: `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">Verify Email</a></p>`,
  };
  return transporter.sendMail(mailOptions);
}
