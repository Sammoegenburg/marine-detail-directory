// src/lib/email-templates.ts
// Branded HTML email templates — no external dependencies

export type NewLeadEmailParams = {
  companyName: string;
  cityName: string;
  stateName: string;
  serviceName: string;
  boatSize: string;
  leadPrice: number;
  leadId: string;
  baseUrl: string;
};

export type ClaimVerificationEmailParams = {
  companyName: string;
  cityName: string;
  stateName: string;
  claimUrl: string;
};

const BRAND_COLOR = "#1d4ed8"; // blue-700
const BRAND_NAME = "MarineDetailDirectory";

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_COLOR};border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">
                ⚓ ${BRAND_NAME}
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f5f9;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                ${BRAND_NAME} · You're receiving this because you're a listed detailer.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function newLeadEmailHtml(params: NewLeadEmailParams): string {
  const { companyName, cityName, stateName, serviceName, boatSize, leadPrice, leadId, baseUrl } = params;

  const boatSizeLabel: Record<string, string> = {
    UNDER_20FT: "Under 20 ft",
    TWENTY_TO_30FT: "20–30 ft",
    THIRTY_TO_40FT: "30–40 ft",
    OVER_40FT: "Over 40 ft",
  };

  const viewUrl = `${baseUrl}/company/leads`;

  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:700;">
      🎯 New Lead in ${cityName}!
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
      Hi ${companyName} — a customer near you is requesting a quote.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:13px;width:140px;">Service Needed</td>
              <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:13px;">Boat Size</td>
              <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${boatSizeLabel[boatSize] ?? boatSize}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:13px;">Location</td>
              <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${cityName}, ${stateName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:13px;">Unlock Price</td>
              <td style="padding:6px 0;font-size:14px;font-weight:700;color:${BRAND_COLOR};">$${leadPrice.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Contact information is hidden until you unlock this lead. Leads expire after 72 hours — act fast!
    </p>

    <div style="text-align:center;margin-bottom:8px;">
      <a href="${viewUrl}"
         style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
        View Lead →
      </a>
    </div>
    <p style="margin:12px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
      Lead ID: ${leadId}
    </p>
  `;

  return emailWrapper(content);
}

export function claimVerificationEmailHtml(params: ClaimVerificationEmailParams): string {
  const { companyName, cityName, stateName, claimUrl } = params;

  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:700;">
      Verify Your Business Claim
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
      You've requested to claim <strong style="color:#0f172a;">${companyName}</strong>
      in ${cityName}, ${stateName}.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 8px;color:#1e40af;font-size:14px;font-weight:600;">What happens next:</p>
          <ol style="margin:0;padding-left:20px;color:#1e3a8a;font-size:13px;line-height:1.8;">
            <li>Your claim is submitted for admin review</li>
            <li>We verify your ownership (usually within 24 hours)</li>
            <li>Once approved, you'll have full access to your dashboard and leads</li>
          </ol>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Click the button below to complete your registration and submit your claim.
    </p>

    <div style="text-align:center;margin-bottom:8px;">
      <a href="${claimUrl}"
         style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
        Complete My Claim →
      </a>
    </div>

    <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;text-align:center;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `;

  return emailWrapper(content);
}
