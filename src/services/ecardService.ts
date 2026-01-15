import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { IEcard, EcardResponse } from "@/pages/EcardManagement/interface";

// Get all default emails/ecards
export const getDefaultEmails = (filters?: {
  search?: string;
  email_type?: string;
  email_category?: number;
}): Promise<AxiosResponse<EcardResponse>> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.email_type) params.append('email_type', filters.email_type);
  if (filters?.email_category !== undefined) params.append('email_category', String(filters.email_category));

  const queryString = params.toString();
  return api.get(`/email/default-email${queryString ? '?' + queryString : ''}`);
};

// Get single default email/ecard
export const getDefaultEmail = (id: number): Promise<AxiosResponse<IEcard>> =>
  api.get(`/email/default-email/${id}`);

// Create default email/ecard
export const createDefaultEmail = (data: FormData): Promise<AxiosResponse<IEcard>> =>
  api.post('/email/default-email', data);

// Update default email/ecard
export const updateDefaultEmail = (id: number, data: FormData): Promise<AxiosResponse<IEcard>> =>
  api.put(`/email/default-email/${id}`, data);

// Delete default email/ecard
export const deleteDefaultEmail = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/email/default-email/${id}`);

// Distribute ecard to all users
export const distributeEcard = (id: number): Promise<AxiosResponse<{ message: string; users_count: number }>> =>
  api.post(`/email/default-email/${id}/distribute`);

// Preview ecard
export const previewEcard = (id: number): Promise<AxiosResponse<{ html_content: string }>> =>
  api.get(`/email/default-email/${id}/preview`);

// Preview ecard HTML with filled placeholders
export const previewEcardHtml = (userId: number, data: {
  email_html: string;
  ecard_text?: string;
  email_preheader?: string;
  greeting?: string;
  ecard_image?: string;
  first_name?: string;
  last_name?: string;
}): Promise<AxiosResponse<{ html_content: string; success: boolean }>> =>
  api.post(`/email/ecard-preview/${userId}`, data);
