import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { DefaultEmailTemplate, EmailTemplateList } from "@/pages/Email/interface";

interface EmailTemplate {
    name: string,
    subject: string,
    is_default: boolean,
    customer?: number,
    template?: number, // Optional: reference to default template (for starting point)
    html_content?: string, // Actual HTML content of the template
    html_file?: string, // Optional URL to HTML file
    design_json?: string, // Email editor design JSON for editing
    is_active?: boolean
}

interface DefaultEmailTemplateResponse {
    results: DefaultEmailTemplate[];
}

interface EmailTemplateListResponse {
    results: EmailTemplateList[];
}

export const createEmailTemplate = (details: EmailTemplate): Promise<AxiosResponse<EmailTemplate>> => {
    // Map frontend field names to backend field names
    const backendPayload = {
        email_name: details.name,
        email_subject: details.subject,
        rep: details.customer,
        template: details.template,
        html_content: details.html_content,
        design_json: details.design_json,
        is_default: details.is_default,
        is_active: details.is_active,
    };
    return api.post("/email/customer-templates", backendPayload);
};

export const updateEmailTemplate = (id: number, details: Partial<EmailTemplate>): Promise<AxiosResponse<EmailTemplate>> => {
    // Map frontend field names to backend field names
    const backendPayload: any = {};
    if (details.name !== undefined) backendPayload.email_name = details.name;
    if (details.subject !== undefined) backendPayload.email_subject = details.subject;
    if (details.customer !== undefined) backendPayload.rep = details.customer;
    if (details.template !== undefined) backendPayload.template = details.template;
    if (details.html_content !== undefined) backendPayload.html_content = details.html_content;
    if (details.design_json !== undefined) backendPayload.design_json = details.design_json;
    if (details.is_default !== undefined) backendPayload.is_default = details.is_default;
    if (details.is_active !== undefined) backendPayload.is_active = details.is_active;

    return api.put(`/email/customer-templates/${id}`, backendPayload);
};

export const deleteEmailTemplate = (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/email/customer-templates/${id}`);

export const getDefaultEmailTemplate = (): Promise<AxiosResponse<DefaultEmailTemplateResponse>> =>
    api.get("/email/templates");

export const getEmailTemplates = (): Promise<AxiosResponse<EmailTemplateListResponse>> =>
    api.get(`/email/customer-templates`);

// Attachment services
export const uploadAttachment = (emailTemplateId: number, file: File): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    formData.append('email_template', emailTemplateId.toString());
    formData.append('file', file);

    return api.post('/email/attachments', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteAttachment = (attachmentId: number): Promise<AxiosResponse<void>> =>
    api.delete(`/email/attachments/${attachmentId}`);

// Send email
export const sendEmail = (data: {
    template_id: number;
    recipient_type: string;
    custom_emails?: string[];
    include_attachments?: boolean;
}): Promise<AxiosResponse<any>> =>
    api.post('/email/customer-templates/send', data);