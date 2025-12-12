export interface ITemplate {
    id: number;
    name: string;
    assigned_user: string;
    assigned_user_id: number;
    created_at: string;
    updated_at?: string;
    html_content?: string;
    design_json?: object;
}

export interface ITemplateAttachment {
    id: number;
    template_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    created_at: string;
}

export interface CreateTemplateFormData {
    name: string;
    assigned_user_id: number;
    html_file?: FileList;
    attachments?: FileList;
    html_content?: string;
    design_json?: object;
}
