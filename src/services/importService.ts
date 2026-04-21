import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { ImportTemplate, FieldMapping } from "@/pages/Import/types";

export const listTemplates = (): Promise<AxiosResponse<ImportTemplate[]>> =>
  api.get("/customer/api/import-templates");

export const getTemplate = (id: number): Promise<AxiosResponse<ImportTemplate>> =>
  api.get(`/customer/api/import-templates/${id}`);

export const createTemplate = (data: Partial<ImportTemplate>): Promise<AxiosResponse<ImportTemplate>> =>
  api.post("/customer/api/import-templates", data);

export const updateTemplate = (id: number, data: Partial<ImportTemplate>): Promise<AxiosResponse<ImportTemplate>> =>
  api.patch(`/customer/api/import-templates/${id}`, data);

export const deleteTemplate = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/customer/api/import-templates/${id}`);

export const parseHeaders = (file: File): Promise<AxiosResponse<{ headers: string[] }>> => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/customer/api/import/parse-headers", formData);
};

export const previewImport = (
  file: File,
  mappings: FieldMapping[],
  options: Record<string, boolean>,
  importType: string
): Promise<AxiosResponse<{ preview: any[] }>> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mappings", JSON.stringify(mappings));
  formData.append("options", JSON.stringify(options));
  formData.append("import_type", importType);
  return api.post("/customer/api/import/preview", formData);
};

export const executeImport = (
  templateId: number,
  previewRows: any[],
  importType: string,
  importStatus: string
): Promise<AxiosResponse<{ added: number; updated: number; skipped: number }>> =>
  api.post("/customer/api/import/execute", {
    template_id: templateId,
    preview_rows: previewRows,
    import_type: importType,
    import_status: importStatus,
  });

export const rollbackImport = (templateId: number): Promise<AxiosResponse<{ deleted: number }>> =>
  api.post(`/customer/api/import/rollback/${templateId}`);
