/**
 * Central API client for the portfolio backend.
 * All fetch calls go through here — easy to swap base URL.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface PortfolioData {
  skills: {
    languages: string[];
    concepts: string[];
    backend: string[];
    database: string[];
    ai_ml: string[];
    development: string[];
    tools: string[];
  };
  projects: {
    title: string;
    description: string;
    tech: string[];
    github: string;
    live: string;
    ongoing?: boolean;
  }[];
  education: {
    school: string;
    degree: string;
    detail: string;
    year: string;
  }[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  volunteering: {
    event: string;
    roles: string[];
  }[];
  beyond_coding: {
    title: string;
    level: string;
  }[];
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

/** GET /api/portfolio */
export async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch(`${API_URL}/api/portfolio`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Portfolio API error: ${res.status}`);
  const json = await res.json();
  return json.data as PortfolioData;
}

/** POST /api/contact */
export async function submitContact(
  payload: ContactPayload
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/** Returns the resume URL to open in new tab */
export function getResumeUrl(): string {
  return `${API_URL}/api/resume`;
}
