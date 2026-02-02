import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";

export interface EcardDistribution {
  id: number;
  ecard: number;
  ecard_name?: string;
  status: "pending" | "in_progress" | "sent" | "delivered" | "completed" | "failed" | "cancelled";
  users: number[];
  send_to_all: boolean;
  recipient_type: "all" | "contact" | "partner";
  scheduled_at: string;
  completed_at?: string;
  is_active: boolean;
  created: string;
  modified: string;
  total_recipients?: number;
  sent_count?: number;
  failed_count?: number;
}

export interface EcardDistributionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EcardDistribution[];
}

export interface CreateEcardDistributionData {
  ecard: number;
  status?: string;
  users?: number[];
  send_to_all: boolean;
  recipient_type: "all" | "contact" | "partner";
  scheduled_at: string;
  is_active?: boolean;
}

export interface UpdateEcardDistributionData {
  ecard?: number;
  status?: string;
  users?: number[];
  send_to_all?: boolean;
  recipient_type?: "all" | "contact" | "partner";
  scheduled_at?: string;
  is_active?: boolean;
}

export interface EcardDistributionStatistics {
  total_distributions: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
  cancelled: number;
}

// Get all ecard distributions
export const getEcardDistributions = (filters?: {
  status?: string;
  recipient_type?: string;
  ordering?: string;
}): Promise<AxiosResponse<EcardDistributionResponse>> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.recipient_type) params.append('recipient_type', filters.recipient_type);
  if (filters?.ordering) params.append('ordering', filters.ordering);

  const queryString = params.toString();
  return api.get(`/email/ecard-distributions${queryString ? '?' + queryString : ''}`);
};

// Get single ecard distribution
export const getEcardDistribution = (id: number): Promise<AxiosResponse<EcardDistribution>> =>
  api.get(`/email/ecard-distributions/${id}`);

// Create ecard distribution
export const createEcardDistribution = (data: CreateEcardDistributionData): Promise<AxiosResponse<EcardDistribution>> =>
  api.post('/email/ecard-distributions', data);

// Update ecard distribution
export const updateEcardDistribution = (id: number, data: UpdateEcardDistributionData): Promise<AxiosResponse<EcardDistribution>> =>
  api.patch(`/email/ecard-distributions/${id}`, data);

// Delete ecard distribution
export const deleteEcardDistribution = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/email/ecard-distributions/${id}`);

// Note: To cancel a distribution, use updateEcardDistribution with { status: 'cancelled' }
// Note: To mark as completed, use updateEcardDistribution with { status: 'completed' }
