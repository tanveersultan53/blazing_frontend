import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { AddPersonFormData } from "@/pages/AddPerson/interface";

export const createContact = (details: AddPersonFormData): Promise<AxiosResponse<AddPersonFormData>> =>
    api.post("/customer/api/contacts", details);

export interface ContactFilters {
  type?: string;
  customer_type?: string;
  name?: string;
  email?: string;
  cell?: string;
  work_phone?: string;
  company?: string;
  title?: string;
  send_status?: string;
  created?: string;
  modified?: string;
  search?: string; // Global search parameter
  user_id?: string | number;
}

export const getContacts = ( filters: ContactFilters = {} ): Promise<AxiosResponse<any>> => {
  const params = new URLSearchParams();
  
  // Add all non-empty filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  
  if(filters.user_id) {
    return api.get(`/customer/api/contacts/${filters.user_id}${queryString ? '?' + queryString : ''}`);
  }
  return api.get(`/customer/api/contacts${queryString ? '?' + queryString : ''}`);
};

export const getContactDetails = (id: string | number): Promise<AxiosResponse<any>> =>
    api.get(`/customer/api/contacts/${id}`);

export const updateContact = (id: string | number, data: any): Promise<AxiosResponse<any>> =>
    api.patch(`/customer/api/contacts/${id}`, data);

export const deleteContact = ( id: string ): Promise<AxiosResponse<any>> =>
    api.delete("/customer/api/contacts/" + id);