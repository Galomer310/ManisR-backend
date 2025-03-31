// backend/src/config/email.ts
import emailjs from "emailjs-com";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// Initialize EmailJS with your User ID (public key)
emailjs.init(process.env.EMAILJS_USER_ID || "");

/**
 * Sends a verification email using EmailJS.
 */
export async function sendVerificationEmail(email: string, token: string) {
  // Construct the verification URL
  const verificationUrl = `${process.env.BACKEND_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;

  // Prepare the template parameters as required by your EmailJS template.
  const templateParams = {
    to_email: email,
    verification_url: verificationUrl,
    subject: "Verify Your Email Address",
    // You can add additional template fields here if your template requires them.
  };

  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID || "",
      process.env.EMAILJS_TEMPLATE_ID || "",
      templateParams,
      process.env.EMAILJS_USER_ID || ""
    );
    console.log("Email sent:", response.status, response.text);
    return response;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}
