export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  content?: string; // For future use when viewing template
}
