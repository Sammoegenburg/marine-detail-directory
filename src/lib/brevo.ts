// src/lib/brevo.ts
// Brevo transactional email client

import * as Brevo from "@getbrevo/brevo";
import {
  newLeadEmailHtml,
  claimVerificationEmailHtml,
} from "./email-templates";

if (!process.env.BREVO_API_KEY) {
  console.warn("[Brevo] BREVO_API_KEY is not set — emails will not be sent");
}

function getApiInstance(): Brevo.TransactionalEmailsApi {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY!
  );
  return apiInstance;
}

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "noreply@marinedetaildirectory.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "MarineDetailDirectory";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://marine-detail-directory.vercel.app";

type LeadNotificationParams = {
  leadId: string;
  cityName: string;
  stateName: string;
  serviceName: string;
  boatSize: string;
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
  if (!process.env.BREVO_API_KEY || companies.length === 0) return;

  const apiInstance = getApiInstance();

  const results = await Promise.allSettled(
    companies.map(async (company) => {
      const email = new Brevo.SendSmtpEmail();
      email.subject = `🎯 New ${lead.serviceName} Lead in ${lead.cityName} — Unlock for $${lead.leadPrice.toFixed(2)}`;
      email.htmlContent = newLeadEmailHtml({
        companyName: company.name,
        cityName: lead.cityName,
        stateName: lead.stateName,
        serviceName: lead.serviceName,
        boatSize: lead.boatSize,
        leadPrice: lead.leadPrice,
        leadId: lead.leadId,
        baseUrl: BASE_URL,
      });
      email.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
      email.to = [{ email: company.email, name: company.name }];

      return apiInstance.sendTransacEmail(email);
    })
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(
        `[Brevo] Failed to notify company "${companies[i].name}":`,
        result.reason
      );
    }
  });
}

export async function sendClaimVerificationEmail(
  email: string,
  companyName: string,
  claimUrl: string,
  cityName: string,
  stateName: string
): Promise<void> {
  if (!process.env.BREVO_API_KEY) return;

  const apiInstance = getApiInstance();
  const msg = new Brevo.SendSmtpEmail();
  msg.subject = `Verify your claim for ${companyName} — MarineDetailDirectory`;
  msg.htmlContent = claimVerificationEmailHtml({
    companyName,
    cityName,
    stateName,
    claimUrl,
  });
  msg.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
  msg.to = [{ email, name: companyName }];

  try {
    await apiInstance.sendTransacEmail(msg);
  } catch (err) {
    console.error("[Brevo] Failed to send claim verification email:", err);
  }
}
