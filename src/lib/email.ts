import nodemailer from "nodemailer"

const transporter =
  process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      })
    : null

const FROM_ADDRESS = process.env.SMTP_FROM || "noreply@theprintf.com"

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  if (!transporter) {
    console.warn("[Email] SMTP not configured — cannot send password reset email")
    return false
  }

  try {
    await transporter.sendMail({
      from: `"printf()" <${FROM_ADDRESS}>`,
      to,
      subject: "Reset your printf password",
      text: `You requested a password reset.\n\nClick this link to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px;">Reset your password</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            You requested a password reset for your printf() account. Click the button below to set a new password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #FF9933; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; line-height: 1.5;">
            If you didn't request this, you can safely ignore this email. Your password will not change.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">printf() &mdash; theprintf.com</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error)
    return false
  }
}
