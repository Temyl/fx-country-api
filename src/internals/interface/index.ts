export interface Country {
  id: string
  name: string;
  capital: string;
  region: string;
  population: number;
  currency_code: string | null;
  exchange_rate: number | null;
  estimated_gbp: number | null;
  flag_url: string;
  last_refreshed_at: Date;
}

export interface CountrySummary {
    name: string;
    currency_code: string | null;
    estimated_gbp: number | null;
    flag_url?: string | null;
}

export interface SummaryOptions {
    totalCountries: number;
    lastRefreshedAt: Date;
    countries: CountrySummary[];
}

