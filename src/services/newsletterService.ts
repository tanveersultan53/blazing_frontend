import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { INewsletter, NewsletterResponse, NewsletterLogsResponse } from "@/pages/NewsletterManagement/interface";

// Get all newsletters
export const getNewsletters = (filters?: {
  search?: string;
  status?: string;
}): Promise<AxiosResponse<NewsletterResponse>> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);

  const queryString = params.toString();
  return api.get(`/email/newsletter${queryString ? '?' + queryString : ''}`);
};

// Get single newsletter
export const getNewsletter = (id: number): Promise<AxiosResponse<INewsletter>> =>
  api.get(`/email/newsletter/${id}`);

// Create newsletter
export const createNewsletter = (data: FormData): Promise<AxiosResponse<INewsletter>> =>
  api.post('/email/newsletter', data);

// Update newsletter
export const updateNewsletter = (id: number, data: FormData): Promise<AxiosResponse<INewsletter>> =>
  api.patch(`/email/newsletter/${id}`, data);

// Delete newsletter
export const deleteNewsletter = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/email/newsletter/${id}`);

// Get newsletter logs
export const getNewsletterLogs = (newsletterId?: number): Promise<AxiosResponse<NewsletterLogsResponse>> => {
  const params = new URLSearchParams();
  if (newsletterId) params.append('newsletter_id', String(newsletterId));

  const queryString = params.toString();
  return api.get(`/newsletters/logs${queryString ? '?' + queryString : ''}`);
};

// Send newsletter
export const sendNewsletter = (id: number): Promise<AxiosResponse<{ message: string; recipients_count: number }>> =>
  api.post(`/newsletters/${id}/send`);

// Verify newsletter
export const verifyNewsletter = (userId: number, data: FormData): Promise<AxiosResponse<{ short_newsletter_url: string; long_newsletter_url: string }>> =>
  api.post(`/email/verify-news-letter/${userId}`, data);

// Send test email
export const sendTestEmail = (userId: number, data: FormData): Promise<AxiosResponse<{ success: boolean; message: string; newsletter_version: string }>> =>
  api.post(`/email/send-test-email/${userId}`, data);
