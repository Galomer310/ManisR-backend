// backend/src/config/email.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// Create a transporter object using SMTP settings from your .env file.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. smtp.gmail.com if using Gmail
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false for TLS
  auth: {
    user: process.env.SMTP_USER, // your email address
    pass: process.env.SMTP_PASS, // your email password or app-specific password
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    // If using a service like Ethereal for testing, you can log the preview URL:
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}
