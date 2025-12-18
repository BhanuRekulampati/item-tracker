// Email service using Resend (or fallback to console logging in dev)

export async function sendOTPEmail(email: string, otp: string, fullName: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const appName = "QR-Track";

  // If no Resend API key, just log the OTP (for development)
  if (!resendApiKey) {
    console.log("=== EMAIL (Resend not configured) ===");
    console.log("To:", email);
    console.log("OTP:", otp);
    console.log("=====================================");
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${appName} <${fromEmail}>`,
        to: [email],
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API error:", errorData);
      
      // In development, allow registration to proceed even if email fails
      if (process.env.NODE_ENV !== "production") {
        console.log("=== EMAIL SEND FAILED (continuing in dev mode) ===");
        console.log("To:", email);
        console.log("OTP:", otp);
        return true;
      }
      return false;
    }

    const data = await response.json();
    console.log("OTP email sent via Resend:", data.id);
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
