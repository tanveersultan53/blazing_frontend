import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { DefaultEmailTemplate, EmailTemplateList } from "@/pages/Email/interface";

interface EmailTemplate {
    name: string,
    subject: string,
    is_default: boolean,
    customer?: number,
    template?: number,
    is_active?: boolean
}

interface DefaultEmailTemplateResponse {
    results: DefaultEmailTemplate[];
}

interface EmailTemplateListResponse {
    results: EmailTemplateList[];
}

export const createEmailTemplate = (details: EmailTemplate): Promise<AxiosResponse<EmailTemplate>> =>
    api.post("/email/customer-templates", details);

export const getDefaultEmailTemplate = (): Promise<AxiosResponse<DefaultEmailTemplateResponse>> =>
    api.get("/email/templates");

export const getEmailTemplates = (): Promise<AxiosResponse<EmailTemplateListResponse>> =>
    api.get(`/email/customer-templates`);