import { Resend } from 'resend'

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function sendVerificationCode(email: string, code: string, slug: string): Promise<boolean> {
  const client = getResend()
  if (!client) {
    console.error('RESEND_API_KEY not configured — cannot send verification email')
    return false
  }

  const { error } = await client.emails.send({
    from: 'SlashCast <noreply@slashcast.dev>',
    to: email,
    subject: 'Verify your SlashCast account',
    text: [
      `Your verification code for slashcast.dev/${slug} is: ${code}`,
      '',
      'This code expires in 15 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
      '',
      '— SlashCast',
    ].join('\n'),
  })

  if (error) {
    console.error('Failed to send verification email:', error)
    return false
  }

  return true
}

export async function sendRecoveryCode(email: string, code: string, slug: string): Promise<boolean> {
  const client = getResend()
  if (!client) {
    console.error('RESEND_API_KEY not configured — cannot send recovery email')
    return false
  }

  const { error } = await client.emails.send({
    from: 'SlashCast <noreply@slashcast.dev>',
    to: email,
    subject: 'Your SlashCast recovery code',
    text: [
      `Your recovery code for slashcast.dev/${slug} is: ${code}`,
      '',
      'This code expires in 15 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
      '',
      '— SlashCast',
    ].join('\n'),
  })

  if (error) {
    console.error('Failed to send recovery email:', error)
    return false
  }

  return true
}
