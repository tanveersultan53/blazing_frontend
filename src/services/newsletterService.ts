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
  return api.get(`/newsletters${queryString ? '?' + queryString : ''}`);
};

// Get single newsletter
export const getNewsletter = (id: number): Promise<AxiosResponse<INewsletter>> =>
  api.get(`/newsletters/${id}`);

// Create newsletter
export const createNewsletter = (data: INewsletter): Promise<AxiosResponse<INewsletter>> =>
  api.post('/newsletters', data);

// Update newsletter
export const updateNewsletter = (id: number, data: Partial<INewsletter>): Promise<AxiosResponse<INewsletter>> =>
  api.patch(`/newsletters/${id}`, data);

// Delete newsletter
export const deleteNewsletter = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/newsletters/${id}`);

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
