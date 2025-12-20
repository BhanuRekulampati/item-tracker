import nodemailer from "nodemailer";

// Email service using Brevo SMTP (or fallback to console logging in dev)

export async function sendOTPEmail(email: string, otp: string, fullName: string): Promise<boolean> {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();
  const fromEmail = (process.env.EMAIL_FROM || smtpUser)?.trim();
  const appName = "QR-Track";

  // If no SMTP credentials, just log the OTP (for development)
  if (!smtpUser || !smtpPassword) {
    console.log("=== EMAIL (SMTP not configured) ===");
    console.log("To:", email);
    console.log("OTP:", otp);
    console.log("===================================");
    return true;
  }

  try {
    // Brevo SMTP settings - trim all values to remove whitespace/newlines
    const smtpHost = (process.env.SMTP_HOST || "smtp-relay.brevo.com").trim();
    const smtpPort = parseInt((process.env.SMTP_PORT || "587").trim());
    
    console.log("Connecting to SMTP:", smtpHost, "on port", smtpPort);
    
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

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
      text: `Hello ${fullName},\n\nThank you for signing up! Please verify your email address by entering the following code:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't create an account with ${appName}, you can safely ignore this email.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    
    // In development, allow registration to proceed even if email fails
    if (process.env.NODE_ENV !== "production") {
      console.log("=== EMAIL SEND FAILED (continuing in dev mode) ===");
      console.log("To:", email);
      console.log("OTP:", otp);
      return true;
    }
    return false;
  }
}
