export interface EmailTemplate {
  name: string,
  subject: string,
  is_default: boolean,
  customer?: number,
  template?: number,
  is_active?: boolean
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

export interface EmailTemplateList {
  id: number
  name: string
  subject: string
  is_default: boolean
  customer: number
  template: number
  is_active: boolean
  created_at: string
  updated_at: string
  attachments: any[]
}
