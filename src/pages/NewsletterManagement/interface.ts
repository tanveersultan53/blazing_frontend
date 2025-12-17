export interface INewsletter {
  id?: number;
  economic_news_text: string;
  interest_rate_text: string;
  real_estate_news_text: string;
  article_1: string;
  article_2: string;
  schedule_date: string;
  status?: 'draft' | 'scheduled' | 'sent';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

export interface NewsletterLog {
  id: number;
  newsletter_id: number;
  action: string;
  message: string;
  created_at: string;
  created_by?: string;
}

export interface NewsletterResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: INewsletter[];
}

export interface NewsletterLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewsletterLog[];
}
