import { type AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { ITemplate, ITemplateAttachment } from "@/pages/TemplateManagement/interface";

export interface TemplateFilters {
  name?: string;
  assigned_user?: string;
  search?: string;
  customer?: string;
}

export const getTemplates = (filters: TemplateFilters = {}): Promise<AxiosResponse<{ count: number; next: string | null; previous: string | null; results: ITemplate[] }>> => {
  const params = new URLSearchParams();

  // Add all non-empty filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  return api.get(`/email/templates${queryString ? '?' + queryString : ''}`);
};

export const getTemplateById = (id: number): Promise<AxiosResponse<ITemplate>> => {
  return api.get(`/email/templates/${id}`);
};

export const createTemplate = (template: FormData): Promise<AxiosResponse<ITemplate>> => {
  return api.post("/email/templates", template, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateTemplate = ({ id, template }: { id: number, template: FormData }): Promise<AxiosResponse<ITemplate>> => {
  return api.patch(`/email/templates/${id}`, template, {
    headers: {
      'Content-Type': undefined,
    },
  });
};

export const deleteTemplate = (id: number): Promise<AxiosResponse<void>> => {
  return api.delete(`/email/templates/${id}`);
};

export const getTemplateAttachments = (templateId: number): Promise<AxiosResponse<ITemplateAttachment[]>> => {
  return api.get(`/templates/${templateId}/attachments`);
};

export const uploadTemplateAttachment = (templateId: number, file: File): Promise<AxiosResponse<ITemplateAttachment>> => {
  const formData = new FormData();
  formData.append('template_id', templateId.toString());
  formData.append('file', file);

  return api.post(`/templates/${templateId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteTemplateAttachment = (templateId: number, attachmentId: number): Promise<AxiosResponse<void>> => {
  return api.delete(`/templates/${templateId}/attachments/${attachmentId}`);
};
