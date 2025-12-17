import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";

// Customer Email Template Interface
export interface CustomerEmailTemplate {
    email_id?: number;
    company_id?: number;
    rep?: number;
    template?: number; // Reference to system template
    email_type?: number; // 1-13: Holiday ecards, 14: Birthday, 15: Newsletter, 99: Custom
    email_name?: string;
    email_subject?: string;
    email_html?: string;
    html_content?: string;
    design_json?: string | object;
    send_ecard?: boolean;
    is_default?: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    attachments?: EmailAttachment[];
}

// System Email Template Interface
export interface SystemEmailTemplate {
    id: number;
    name: string;
    type: string;
    html_file: string;
    html_content?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    customer?: number;
}

// Email Attachment Interface
export interface EmailAttachment {
    id: number;
    email_template: number;
    email_template_name?: string;
    file: string;
    uploaded_at: string;
}

// API Response Interfaces
interface SystemTemplateResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SystemEmailTemplate[];
}

interface CustomerTemplateResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CustomerEmailTemplate[];
}

// ==================== SYSTEM EMAIL TEMPLATES ====================

export const getSystemTemplates = (filters?: {
    type?: string;
    is_active?: boolean;
}): Promise<AxiosResponse<SystemTemplateResponse>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

    const queryString = params.toString();
    return api.get(`/email/templates${queryString ? '?' + queryString : ''}`);
};

// Get available templates for Email Library (user-facing)
export const getAvailableTemplates = (filters?: {
    type?: string;
    is_active?: boolean;
}): Promise<AxiosResponse<SystemTemplateResponse>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

    const queryString = params.toString();
    return api.get(`/email/templates/available-templates${queryString ? '?' + queryString : ''}`);
};

export const getSystemTemplateById = (id: number): Promise<AxiosResponse<SystemEmailTemplate>> =>
    api.get(`/email/templates/${id}`);

// ==================== CUSTOMER EMAIL TEMPLATES ====================

export const getCustomerEmailTemplates = (filters?: {
    email_type?: number;
    search?: string;
    is_active?: boolean;
}): Promise<AxiosResponse<CustomerTemplateResponse>> => {
    const params = new URLSearchParams();
    if (filters?.email_type) params.append('email_type', String(filters.email_type));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

    const queryString = params.toString();
    return api.get(`/email/customer-templates${queryString ? '?' + queryString : ''}`);
};

// Alias for backward compatibility - fetches active system templates
export const getDefaultEmailTemplate = (): Promise<AxiosResponse<SystemTemplateResponse>> => {
    return getSystemTemplates({ is_active: true });
};

// Alias for backward compatibility - fetches all active system templates
export const getEmailTemplates = (): Promise<AxiosResponse<SystemTemplateResponse>> => {
    return getSystemTemplates({ is_active: true });
};

export const getCustomerEmailTemplate = (id: number): Promise<AxiosResponse<CustomerEmailTemplate>> =>
    api.get(`/email/customer-templates/${id}`);

export const createCustomerEmailTemplate = (
    details: CustomerEmailTemplate
): Promise<AxiosResponse<CustomerEmailTemplate>> => {
    return api.post("/email/customer-templates", details);
};

export const updateCustomerEmailTemplate = (
    id: number,
    details: Partial<CustomerEmailTemplate>
): Promise<AxiosResponse<CustomerEmailTemplate>> => {
    return api.patch(`/email/customer-templates/${id}`, details);
};

export const deleteCustomerEmailTemplate = (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/email/customer-templates/${id}`);

export const copySystemTemplate = (data: {
    template_id: number;
    email_name?: string;
    email_subject?: string;
    email_type?: number;
    is_active?: boolean;
    send_ecard?: boolean;
    is_default?: boolean;
}): Promise<AxiosResponse<CustomerEmailTemplate>> =>
    api.post('/email/templates/available-templates/copy-template', data);

// ==================== EMAIL ATTACHMENTS ====================

export const getAttachments = (emailTemplateId: number): Promise<AxiosResponse<EmailAttachment[]>> =>
    api.get(`/email/attachments?email_template=${emailTemplateId}`);

export const uploadAttachment = (emailTemplateId: number, file: File): Promise<AxiosResponse<EmailAttachment>> => {
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

// ==================== SEND EMAIL ====================

export const sendEmail = (data: {
    template_id: number;
    recipient_type: 'contacts' | 'partners' | 'all' | 'custom';
    custom_emails?: string[];
    include_attachments?: boolean;
}): Promise<AxiosResponse<{
    success: boolean;
    message: string;
    recipients_count: number;
}>> =>
    api.post('/email/customer-templates/send', data);

// ==================== SENT EMAIL HISTORY ====================

export interface SentEmailHistoryItem {
    id: number;
    rep: number;
    rep_username: string;
    rep_name: string;
    contact: number;
    contact_name: string;
    email: string;
    filename: string;
    email_type: number;
    template_id: number;
    template_name: string;
    date_sent: string;
    status?: 'sent' | 'failed' | 'pending';
}

export interface SentEmailHistoryResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SentEmailHistoryItem[];
}

export const getSentEmails = (filters?: {
    search?: string;
    date_from?: string;
    date_to?: string;
}): Promise<AxiosResponse<SentEmailHistoryResponse>> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const queryString = params.toString();
    return api.get(`/email/sent-emails${queryString ? '?' + queryString : ''}`);
};