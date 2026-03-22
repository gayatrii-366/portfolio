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



/** GET /api/portfolio */
export async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch(`${API_URL}/api/portfolio`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Portfolio API error: ${res.status}`);
  const json = await res.json();
  return json.data as PortfolioData;
}

