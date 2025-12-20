import * as brevo from "@getbrevo/brevo";

// Email service using Brevo API (more reliable than SMTP for cloud deployments)

export async function sendOTPEmail(email: string, otp: string, fullName: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim();
  const appName = "QR-Track";

  // If no API key, just log the OTP (for development)
  if (!apiKey) {
    console.log("=== EMAIL (Brevo API not configured) ===");
    console.log("To:", email);
    console.log("OTP:", otp);
    console.log("===================================");
    return true;
  }

  if (!fromEmail) {
    console.error("EMAIL_FROM is not set");
    return false;
  }

  try {
    // Initialize Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    // Create email content
    const htmlContent = `
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
    `;

    const textContent = `Hello ${fullName},\n\nThank you for signing up! Please verify your email address by entering the following code:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't create an account with ${appName}, you can safely ignore this email.`;

    // Create sendSmtpEmail object
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Verify Your Email - QR-Track";
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.sender = { name: appName, email: fromEmail };
    sendSmtpEmail.to = [{ email: email, name: fullName }];

    // Send email via Brevo API
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("OTP email sent via Brevo API:", result.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending OTP email via Brevo API:", error);
    
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
