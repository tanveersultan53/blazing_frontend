export interface INewsletter {
  id?: number;
  newsletter_label: string;
  news_text: string;
  rate_text: string;
  econ_text: string;
  article1_text: string;
  article2_text: string;
  news_image?: File | string | null;
  rate_image?: File | string | null;
  econ_image?: File | string | null;
  article1_image?: File | string | null;
  article2_image?: File | string | null;
  scheduled_date: string;
  scheduled_time: string;
  is_active?: boolean;
  created?: string;
  modified?: string;
  // Branding fields
  companylogo?: File | string | null;
  photo?: File | string | null;
  logo?: File | string | null;
  qrcode?: File | string | null;
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
  // Image URLs (returned by API in view/edit mode)
  news_image_url?: string;
  rate_image_url?: string;
  econ_image_url?: string;
  article1_image_url?: string;
  article2_image_url?: string;
  companylogo_url?: string;
  photo_url?: string;
  logo_url?: string;
  qrcode_url?: string;
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
