import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_ADDRESS = process.env.EMAIL_FROM || "printf() <noreply@theprintf.com>"

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set — cannot send password reset email")
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "Reset your printf password",
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

    if (error) {
      console.error("[Email] Resend error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error)
    return false
  }
}
