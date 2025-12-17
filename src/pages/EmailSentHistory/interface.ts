export interface IEmailSentHistory {
  id: number;
  rep: number;
  rep_username: string;
  rep_name: string;
  contact: number;
  contact_name: string;
  email: string;
  filename: string;
  email_type: number;
  template_id: number;
  template_name: string;
  date_sent: string;
  status?: 'sent' | 'failed' | 'pending';
}

export interface EmailSentHistoryFilters {
  contact_name?: string;
  email?: string;
  template_name?: string;
  rep_name?: string;
}

export interface SentEmailResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IEmailSentHistory[];
}
