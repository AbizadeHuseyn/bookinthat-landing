const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const displayName = name ? name.trim() : '';
  const headline = displayName
    ? `${displayName},<br>YOU'RE ON THE LIST.`
    : `YOU'RE ON THE LIST.`;

  const userEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're in — Bookin' That</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcf9f7; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #1b1c1b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fcf9f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border: 2px solid #1b1c1b; box-shadow: 4px 4px 0px #1b1c1b;">
          <tr>
            <td style="background-color: #1b1c1b; padding: 20px 32px;">
              <span style="color: #ffffff; font-size: 18px; font-weight: 900; letter-spacing: -0.5px;">BOOKIN' THAT.</span>
            </td>
          </tr>
          <tr>
            <td style="background-color: #e8967d; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 48px 32px 24px 32px;">
              <div style="display: inline-block; background-color: #8e4c38; color: #ffffff; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; margin-bottom: 24px;">
                WELCOME ABOARD
              </div>
              <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 900; line-height: 1.1; color: #1b1c1b; text-transform: uppercase;">
                ${headline}
              </h1>
              <div style="width: 60px; height: 3px; background-color: #e8967d; margin: 24px 0;"></div>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #53433f;">
                We got your request and we're genuinely excited about it. Someone from our team will reach out shortly — no bots, no auto-replies, just a real human.
              </p>
              <p style="margin: 0; font-size: 15px; color: #86736e; font-style: italic;">
                In the meantime, take care of yourself.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #e8967d; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background-color: #f6f3f1; padding: 24px 32px;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #86736e;">
                THE EDITORIAL BOOKING PLATFORM
              </p>
              <p style="margin: 0; font-size: 11px; color: #86736e;">
                &copy; 2026 Bookin&rsquo; That.
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding: 24px 0;">
              <p style="margin: 0; font-size: 10px; color: #86736e; font-weight: 600;">
                You&rsquo;re receiving this because you signed up at bookinthat.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const adminEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Signup</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcf9f7; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #1b1c1b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fcf9f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border: 2px solid #1b1c1b;">
          <tr>
            <td style="background-color: #1b1c1b; padding: 16px 32px;">
              <span style="color: #ffffff; font-size: 14px; font-weight: 900; letter-spacing: -0.5px;">BOOKIN&rsquo; THAT &mdash; NEW SIGNUP</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 900; color: #1b1c1b;">
                ${displayName || '(no name)'}
              </h2>
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #53433f;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="margin: 0; font-size: 14px; color: #86736e;">
                Submitted just now via bookinthat.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const [userResult, adminResult] = await Promise.allSettled([
    resend.emails.send({
      from: 'noreply@bookinthat.com',
      to: email,
      subject: "You're in — Bookin' That",
      html: userEmailHtml,
    }),
    resend.emails.send({
      from: 'noreply@bookinthat.com',
      to: 'huseyn.abizadeh@gmail.com',
      subject: `New signup: ${displayName || 'Unknown'} (${email})`,
      html: adminEmailHtml,
    }),
  ]);

  if (userResult.status === 'rejected') {
    console.error('User email failed:', userResult.reason);
    return res.status(500).json({ error: 'Failed to send confirmation email' });
  }

  if (adminResult.status === 'rejected') {
    console.error('Admin email failed:', adminResult.reason);
  }

  return res.status(200).json({ success: true });
};
