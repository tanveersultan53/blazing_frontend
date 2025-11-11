import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { DefaultEmailTemplate, EmailTemplate } from "@/pages/Email/interface";

interface DefaultEmailTemplateResponse {
    results: DefaultEmailTemplate[];
}

interface EmailTemplateListResponse {
    results: EmailTemplate[];
}

export const createEmailTemplate = (details: EmailTemplate): Promise<AxiosResponse<EmailTemplate>> =>
    api.post("/email/customer-templates", details);

export const getDefaultEmailTemplate = (): Promise<AxiosResponse<DefaultEmailTemplateResponse>> =>
    api.get("/email/templates");

export const getEmailTemplates = (): Promise<AxiosResponse<EmailTemplateListResponse>> =>
    api.get(`/email/customer-templates`);

export const deleteEmailTemplate = (id: string | number): Promise<AxiosResponse<void>> =>
    api.delete(`/email/customer-templates/${id}`);

export const updateEmailTemplate = (id: string | number, details: EmailTemplate): Promise<AxiosResponse<EmailTemplate>> =>
    api.put(`/email/customer-templates/${id}`, details);

export const getEmailTemplateById = (id: string | number): Promise<AxiosResponse<EmailTemplate>> =>
    api.get(`/email/customer-templates/${id}`);