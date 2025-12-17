export interface ITemplate {
    id: number;
    name: string;
    type: string;
    html_file: string;
    html_content?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    customer: number | null;
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
    type: string;
    is_active: boolean;
    html_file?: FileList;
    html_content?: string;
    design_json?: object;
}
