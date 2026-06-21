import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL SKIPPED — no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await t.sendMail({
      from: `"ORAD — Ghipps" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
  }
};

export const emailTemplates = {
  accessRequestReviewed: ({ name, folderName, status, note }) => ({
    subject: `Access request ${status} — ${folderName}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
      <h2 style="color:#0F1C2E">ORAD — Ghipps Operations Portal</h2>
      <p>Hi ${name},</p>
      <p>Your request for access to <strong>${folderName}</strong> has been <strong style="color:${status==='approved'?'#1A9E5E':'#C0392B'}">${status}</strong>.</p>
      ${note ? `<p style="background:#f5f5f5;padding:12px;border-radius:6px">Note from admin: ${note}</p>` : ''}
      <p>Log in to ORAD to ${status==='approved'?'access the folder':'view your requests'}.</p>
    </div>`,
  }),
  newComment: ({ recipientName, commenterName, docName, preview }) => ({
    subject: `New comment on "${docName}"`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
      <h2 style="color:#0F1C2E">ORAD — Ghipps Operations Portal</h2>
      <p>Hi ${recipientName},</p>
      <p><strong>${commenterName}</strong> commented on <strong>${docName}</strong>:</p>
      <p style="background:#f5f5f5;padding:12px;border-radius:6px;font-style:italic">"${preview}"</p>
      <p>Log in to ORAD to view and reply.</p>
    </div>`,
  }),
  accountCreated: ({ name, username, password, portalUrl }) => ({
    subject: 'Your ORAD account has been created',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
      <h2 style="color:#0F1C2E">ORAD — Ghipps Operations Portal</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created. Here are your login details:</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Username</td><td style="padding:8px">${username}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Password</td><td style="padding:8px">${password}</td></tr>
      </table>
      <p>Please change your password after your first login.</p>
      <a href="${portalUrl}" style="display:inline-block;padding:12px 24px;background:#0F1C2E;color:#fff;text-decoration:none;border-radius:8px">Log In to ORAD</a>
    </div>`,
  }),
};
