import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";

export interface NewsletterDistribution {
  id: number;
  newsletter: number;
  newsletter_label?: string;
  status: "pending" | "in_progress" | "sent" | "delivered" | "completed" | "failed" | "cancelled";
  users: number[];
  send_to_all: boolean;
  recipient_type: "all" | "partner" | "contact";
  version: "long" | "short" | "both";
  scheduled_at: string;
  completed_at?: string;
  is_active: boolean;
  created: string;
  modified: string;
  total_recipients?: number;
  sent_count?: number;
  failed_count?: number;
}

export interface NewsletterDistributionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewsletterDistribution[];
}

export interface CreateNewsletterDistributionData {
  newsletter: number;
  status?: string;
  users?: number[];
  send_to_all: boolean;
  recipient_type: "all" | "partner" | "contact";
  version: "long" | "short" | "both";
  scheduled_at: string;
  is_active?: boolean;
}

export interface UpdateNewsletterDistributionData {
  newsletter?: number;
  status?: string;
  users?: number[];
  send_to_all?: boolean;
  recipient_type?: "all" | "partner" | "contact";
  version?: "long" | "short" | "both";
  scheduled_at?: string;
  is_active?: boolean;
}

export interface NewsletterDistributionStatistics {
  total_distributions: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
  cancelled: number;
}

// Get all newsletter distributions
export const getNewsletterDistributions = (filters?: {
  status?: string;
  recipient_type?: string;
  version?: string;
  ordering?: string;
}): Promise<AxiosResponse<NewsletterDistributionResponse>> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.recipient_type) params.append('recipient_type', filters.recipient_type);
  if (filters?.version) params.append('version', filters.version);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const queryString = params.toString();
  return api.get(`/email/newsletter-distributions${queryString ? '?' + queryString : ''}`);
};

// Get single newsletter distribution
export const getNewsletterDistribution = (id: number): Promise<AxiosResponse<NewsletterDistribution>> =>
  api.get(`/email/newsletter-distributions/${id}`);

// Create newsletter distribution
export const createNewsletterDistribution = (data: CreateNewsletterDistributionData): Promise<AxiosResponse<NewsletterDistribution>> =>
  api.post('/email/newsletter-distributions', data);

// Update newsletter distribution
export const updateNewsletterDistribution = (id: number, data: UpdateNewsletterDistributionData): Promise<AxiosResponse<NewsletterDistribution>> =>
  api.patch(`/email/newsletter-distributions/${id}`, data);

// Delete newsletter distribution
export const deleteNewsletterDistribution = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/email/newsletter-distributions/${id}`);

// Note: To cancel a distribution, use updateNewsletterDistribution with { status: 'cancelled' }
// Note: To mark as completed, use updateNewsletterDistribution with { status: 'completed' }
