export interface IEmailSentHistory {
  id: number;
  email_name: string;
  subject: string;
  recipient_email: string;
  date_sent: string;
  status: 'sent' | 'failed' | 'pending';
  template_name?: string;
}

export interface EmailSentHistoryFilters {
  email_name?: string;
  subject?: string;
  recipient_email?: string;
  status?: string;
}
