export interface EmailTemplate {
  company_id: number,
  rep: number,
  email_type: number | undefined,
  email_name: string | undefined,
  email_subject: string | undefined,
  email_html: string | undefined,
  send_ecard: boolean
  email_id?: number;
}

export interface DefaultEmailTemplate {
  created_at: string;
  html_file: string;
  html_content: string;
  id: number;
  is_active: boolean;
  name: string;
  type: string;
  updated_at: string;
}
