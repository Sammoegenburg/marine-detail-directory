// src/lib/brevo.ts
// Brevo transactional email via REST API (no SDK dependency)

import {
  newLeadEmailHtml,
  claimVerificationEmailHtml,
  claimApprovalEmailHtml,
  claimRejectionEmailHtml,
  passwordResetEmailHtml,
} from "./email-templates";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "noreply@marinedetaildirectory.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "MarineDetailDirectory";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://marine-detail-directory.vercel.app";

async function sendEmail(payload: {
  to: { email: string; name: string }[];
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY not set — skipping email");
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      ...payload,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${text}`);
  }
}

type LeadNotificationParams = {
  leadId: string;
  cityName: string;
  stateName: string;
  serviceName: string;
  vehicleType: string;
  boatSize?: string;
  leadPrice: number;
};

type CompanyRecipient = {
  name: string;
  email: string;
};

export async function sendNewLeadNotification(
  lead: LeadNotificationParams,
  companies: CompanyRecipient[]
): Promise<void> {
  if (companies.length === 0) return;

  const results = await Promise.allSettled(
    companies.map((company) =>
      sendEmail({
        to: [{ email: company.email, name: company.name }],
        subject: `🎯 New ${lead.vehicleType === "CAR" ? "Car" : "Boat"} Detailing Lead in ${lead.cityName} — Unlock for $${lead.leadPrice.toFixed(2)}`,
        htmlContent: newLeadEmailHtml({
          companyName: company.name,
          cityName: lead.cityName,
          stateName: lead.stateName,
          serviceName: lead.serviceName,
          vehicleType: lead.vehicleType,
          boatSize: lead.boatSize,
          leadPrice: lead.leadPrice,
          leadId: lead.leadId,
          baseUrl: BASE_URL,
        }),
      })
    )
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(
        `[Brevo] Failed to notify "${companies[i].name}":`,
        result.reason
      );
    }
  });
}

export async function sendClaimApprovalEmail(
  email: string,
  companyName: string,
  cityName: string,
  stateName: string
): Promise<void> {
  try {
    await sendEmail({
      to: [{ email, name: companyName }],
      subject: `✅ Your profile for ${companyName} has been approved!`,
      htmlContent: claimApprovalEmailHtml({ companyName, cityName, stateName }),
    });
  } catch (err) {
    console.error("[Brevo] Failed to send approval email:", err);
  }
}

export async function sendClaimRejectionEmail(
  email: string,
  companyName: string,
  cityName: string,
  stateName: string
): Promise<void> {
  try {
    await sendEmail({
      to: [{ email, name: companyName }],
      subject: `Update on your claim for ${companyName} — MarineDetailDirectory`,
      htmlContent: claimRejectionEmailHtml({ companyName, cityName, stateName }),
    });
  } catch (err) {
    console.error("[Brevo] Failed to send rejection email:", err);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  try {
    await sendEmail({
      to: [{ email, name: email }],
      subject: "Reset your DetailHub password",
      htmlContent: passwordResetEmailHtml({ resetUrl }),
    });
  } catch (err) {
    console.error("[Brevo] Failed to send password reset email:", err);
  }
}

export async function sendClaimVerificationEmail(
  email: string,
  companyName: string,
  claimUrl: string,
  cityName: string,
  stateName: string
): Promise<void> {
  try {
    await sendEmail({
      to: [{ email, name: companyName }],
      subject: `Verify your claim for ${companyName} — MarineDetailDirectory`,
      htmlContent: claimVerificationEmailHtml({
        companyName,
        cityName,
        stateName,
        claimUrl,
      }),
    });
  } catch (err) {
    console.error("[Brevo] Failed to send claim verification email:", err);
  }
}
