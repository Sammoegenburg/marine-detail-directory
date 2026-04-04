// src/lib/seo/templates.ts
// pSEO text template interpolation for city/service pages

export type TemplateVars = {
  city: string;
  state: string;
  stateAbbr: string;
  service: string;
  serviceLower: string;
  avgPrice?: string;
  companyCount?: number;
  season?: string;
  climateNote?: string;
};

export function interpolate(template: string, vars: TemplateVars): string {
  return template
    .replace(/\{\{city\}\}/g, vars.city)
    .replace(/\{\{state\}\}/g, vars.state)
    .replace(/\{\{stateAbbr\}\}/g, vars.stateAbbr)
    .replace(/\{\{service\}\}/g, vars.service)
    .replace(/\{\{serviceLower\}\}/g, vars.serviceLower)
    .replace(/\{\{avgPrice\}\}/g, vars.avgPrice ?? "competitive rates")
    .replace(/\{\{companyCount\}\}/g, String(vars.companyCount ?? "local"))
    .replace(/\{\{season\}\}/g, vars.season ?? "year-round")
    .replace(/\{\{climateNote\}\}/g, vars.climateNote ?? "");
}

export const STATE_HUB_TEMPLATE = `
Find the best boat detailing services across {{state}}. Whether you're docked in a marina or mooring offshore, {{state}}'s boating community deserves professional care. Browse verified detailers by city and request a free quote today.
`.trim();

export const CITY_HUB_TEMPLATE = `
Looking for professional boat detailing in {{city}}, {{stateAbbr}}? Compare local marine detailers, read verified reviews, and get free quotes from licensed and insured professionals. Serving boat owners in the {{city}} area {{season}}.
`.trim();

export const SERVICE_PAGE_TEMPLATE = `
Get professional {{serviceLower}} in {{city}}, {{stateAbbr}}. Our network of verified marine detailers offers {{serviceLower}} starting at {{avgPrice}}. {{climateNote}} Request a free quote and we'll connect you with the top-rated {{serviceLower}} specialists near you.
`.trim();
