import { type AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { ComingHomeListResponse, ImportResult, SyncResult } from "@/pages/ComingHomeManagement/interface";

export const getComingHomeUsers = (search?: string): Promise<AxiosResponse<ComingHomeListResponse>> => {
    const params = search ? { search } : {};
    return api.get('/accounts/admin/coming-home', { params });
};

export const updateComingHomeUser = (
    repId: string,
    data: { coming_home_url?: string; send_cominghome?: boolean; coming_home_file?: string }
): Promise<AxiosResponse> => {
    return api.patch(`/accounts/admin/coming-home/${repId}`, data);
};

export const importComingHomeUrls = (file: File): Promise<AxiosResponse<ImportResult>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/accounts/admin/coming-home/import', formData);
};

export const syncComingHome = (repIds?: string[]): Promise<AxiosResponse<SyncResult>> => {
    return api.post('/accounts/admin/coming-home/sync', repIds ? { rep_ids: repIds } : {});
};
