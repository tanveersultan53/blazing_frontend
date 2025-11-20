export interface EmailTemplate {
  name: string,
  subject: string,
  is_default: boolean,
  customer?: number,
  template?: number, // Optional: reference to default template (for starting point)
  html_content?: string, // Actual HTML content of the template
  html_file?: string, // Optional URL to HTML file
  design_json?: string, // Email editor design JSON for editing
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
  email_id: number // Backend uses email_id as primary key
  id?: number // Alias for compatibility
  email_name: string // Backend field name
  name?: string // Alias for compatibility
  email_subject: string // Backend field name
  subject?: string // Alias for compatibility
  rep: number // Backend uses 'rep' not 'customer'
  customer?: number // Alias for compatibility
  company_id?: number
  email_type?: number
  template?: number // Optional: reference to default template (for starting point)
  html_content?: string // Actual HTML content of the template
  html_file?: string // Optional URL to HTML file (legacy)
  email_html?: string // Legacy field
  design_json?: string // Email editor design JSON for editing
  send_ecard?: boolean
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  attachments: any[]
}
