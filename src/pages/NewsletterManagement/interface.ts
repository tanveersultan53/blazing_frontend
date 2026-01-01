export interface INewsletter {
  id?: number;
  newsletter_label: string;
  news_text: string;
  rate_text: string;
  econ_text: string;
  article1_text: string;
  article2_text: string;
  news_image?: File | null;
  rate_image?: File | null;
  econ_image?: File | null;
  article1_image?: File | null;
  article2_image?: File | null;
  scheduled_date: string;
  scheduled_time: string;
  is_active?: boolean;
  created?: string;
  modified?: string;
  // Branding fields
  companylogo?: File | null;
  photo?: File | null;
  logo?: File | null;
  qrcode?: File | null;
  personaltext?: string;
  disclosure?: string;
  hlogo?: number;
  wlogo?: number;
  hphoto?: number;
  wphoto?: number;
  custom?: boolean;
  // Social media links
  fb?: string;
  ig?: string;
  li?: string;
  tw?: string;
  yt?: string;
  tk?: string;
  vo?: string;
  yp?: string;
  gg?: string;
  bg?: string;
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
