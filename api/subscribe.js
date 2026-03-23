const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Team notification
    await resend.emails.send({
      from: 'noreply@bookinthat.com',
      to: 'hello@bookinthat.com',
      subject: "New Waitlist Signup — Bookin' That",
      html: `<p>New signup from: <strong>${email}</strong></p>`,
    });

    // Confirmation to submitter
    await resend.emails.send({
      from: 'noreply@bookinthat.com',
      to: email,
      subject: "You're in — Bookin' That",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h2 style="font-weight: 900; text-transform: uppercase; margin: 0 0 16px;">You're on the list.</h2>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">We got your request and we'll get back to you quick.</p>
          <p style="font-size: 12px; opacity: 0.5; margin: 0;">— The Bookin' That team</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
