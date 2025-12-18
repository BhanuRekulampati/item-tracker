import nodemailer from "nodemailer";

// Email configuration - can use Gmail, SendGrid, Resend, or any SMTP provider
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    console.warn("SMTP credentials not set. Email sending will be disabled in production.");
    // Return a dummy transporter for development
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user",
        pass: "ethereal.pass",
      },
    });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
};

export async function sendOTPEmail(email: string, otp: string, fullName: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const appName = "QR-Track";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@itemtracker.com";

    const mailOptions = {
      from: `"${appName}" <${fromEmail}>`,
      to: email,
      subject: "Verify Your Email - QR-Track",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background-color: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${appName}</h1>
            </div>
            <div class="content">
              <p>Hello ${fullName},</p>
              <p>Thank you for signing up! Please verify your email address by entering the following code:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't create an account with ${appName}, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${fullName},
        
        Thank you for signing up! Please verify your email address by entering the following code:
        
        ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't create an account with ${appName}, you can safely ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // In development/test mode, log the email instead of actually sending
    if (process.env.NODE_ENV !== "production" && !process.env.SMTP_USER) {
      console.log("=== EMAIL NOT SENT (SMTP not configured) ===");
      console.log("To:", email);
      console.log("OTP:", otp);
      console.log("================================");
      return true; // Return true so registration can proceed in dev mode
    }

    console.log("OTP email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    // In development, allow registration to proceed even if email fails
    if (process.env.NODE_ENV !== "production") {
      console.log("=== EMAIL SEND FAILED (continuing in dev mode) ===");
      console.log("OTP:", otp);
      return true;
    }
    return false;
  }
}
