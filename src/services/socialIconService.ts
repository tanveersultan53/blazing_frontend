import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";

export interface ISocialIcon {
  id?: number;
  name: string;
  image: File | string | null;
  mapping_key: string;
}

export interface SocialIconResponse {
  results: ISocialIcon[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Get all social icons
export const getSocialIcons = (filters?: {
  search?: string;
}): Promise<AxiosResponse<SocialIconResponse>> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);

  const queryString = params.toString();
  return api.get(`/static-data/social-icons/${queryString ? '?' + queryString : ''}`);
};

// Get single social icon
export const getSocialIcon = (id: number): Promise<AxiosResponse<ISocialIcon>> =>
  api.get(`/static-data/social-icons/${id}/`);

// Create social icon
export const createSocialIcon = (data: FormData): Promise<AxiosResponse<ISocialIcon>> =>
  api.post('/static-data/social-icons/', data);

// Update social icon
export const updateSocialIcon = (id: number, data: FormData): Promise<AxiosResponse<ISocialIcon>> =>
  api.patch(`/static-data/social-icons/${id}/`, data);

// Delete social icon
export const deleteSocialIcon = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/static-data/social-icons/${id}/`);
