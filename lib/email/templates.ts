const SITE_URL = 'https://oisinthomas.com';
const FROM_NAME = 'Oisín Thomas';
const BRAND_COLOR = '#3b82f6';
const TEXT_COLOR = '#1e293b';
const MUTED_COLOR = '#64748b';
const BG_COLOR = '#f8fafc';
const BORDER_COLOR = '#cbd5e1';
const FONT_STACK = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${FROM_NAME}'s Blog</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_COLOR};font-family:${FONT_STACK};color:${TEXT_COLOR};-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid ${BORDER_COLOR};border-radius:8px;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function confirmationEmailHtml(confirmUrl: string): string {
  return baseLayout(`
    <tr>
      <td style="padding:32px 32px 24px;">
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${TEXT_COLOR};">
          Confirm your subscription
        </h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${MUTED_COLOR};">
          Thanks for subscribing! Please confirm your email address by clicking the button below.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-radius:6px;background-color:${BRAND_COLOR};">
              <a href="${confirmUrl}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
                Confirm Subscription
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:${MUTED_COLOR};">
          If you didn't subscribe, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;border-top:1px solid ${BORDER_COLOR};">
        <p style="margin:0;font-size:12px;color:${MUTED_COLOR};">
          <a href="${SITE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${FROM_NAME}'s Blog</a>
        </p>
      </td>
    </tr>
  `);
}

export function unsubscribeFooterHtml(unsubscribeUrl: string, manageUrl?: string): string {
  const links = manageUrl
    ? `<a href="${manageUrl}" style="color:${MUTED_COLOR};text-decoration:underline;">Manage preferences</a> · <a href="${unsubscribeUrl}" style="color:${MUTED_COLOR};text-decoration:underline;">Unsubscribe</a>`
    : `<a href="${unsubscribeUrl}" style="color:${MUTED_COLOR};text-decoration:underline;">Unsubscribe</a>`;

  return `
    <tr>
      <td style="padding:16px 32px;border-top:1px solid ${BORDER_COLOR};">
        <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED_COLOR};text-align:center;">
          You received this because you subscribed to <a href="${SITE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${FROM_NAME}'s Blog</a>.
          <br />
          ${links}
        </p>
      </td>
    </tr>
  `;
}

export function postNotificationEmailHtml({
  post,
  contentHtml,
  unsubscribeUrl,
  manageUrl,
  trackingPixelUrl,
}: {
  post: { title: string; slug: string; description: string | null };
  contentHtml: string;
  unsubscribeUrl: string;
  manageUrl?: string;
  trackingPixelUrl: string;
}): string {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  return baseLayout(`
    <tr>
      <td style="padding:32px 32px 16px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${BRAND_COLOR};">
          New Post
        </p>
        <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${TEXT_COLOR};">
          <a href="${postUrl}" style="color:${TEXT_COLOR};text-decoration:none;">${escapeHtml(post.title)}</a>
        </h1>
        ${post.description ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:${MUTED_COLOR};">${escapeHtml(post.description)}</p>` : ''}
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="font-size:16px;line-height:1.7;color:${TEXT_COLOR};">
          ${contentHtml}
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 32px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-radius:6px;background-color:${BRAND_COLOR};">
              <a href="${postUrl}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
                Read on the blog
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${unsubscribeFooterHtml(unsubscribeUrl, manageUrl)}
    <tr>
      <td style="height:1px;font-size:1px;line-height:1px;">
        <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;border:0;" />
      </td>
    </tr>
  `);
}

export function welcomeEmailHtml(manageUrl: string): string {
  return baseLayout(`
    <tr>
      <td style="padding:32px 32px 24px;">
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${TEXT_COLOR};">
          Thanks for subscribing!
        </h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${MUTED_COLOR};">
          You'll receive an email whenever I publish a new post. No spam, no fluff.
        </p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${MUTED_COLOR};">
          In the meantime, you can browse the archive:
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-radius:6px;background-color:${BRAND_COLOR};">
              <a href="${SITE_URL}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
                Visit the blog
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;border-top:1px solid ${BORDER_COLOR};">
        <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED_COLOR};text-align:center;">
          <a href="${SITE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${FROM_NAME}'s Blog</a>
          <br />
          <a href="${manageUrl}" style="color:${MUTED_COLOR};text-decoration:underline;">Manage preferences</a>
        </p>
      </td>
    </tr>
  `);
}

export function getEmailHeaders(unsubscribeUrl: string) {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
