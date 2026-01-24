import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";

// CronJob Interface
export interface CronJob {
    id: number;
    name: string;
    description?: string;
    job_type: string;
    job_type_display?: string;
    ecard?: number;
    ecard_name?: string;
    schedule: string;
    status: "running" | "stopped" | "paused";
    status_display?: string;
    last_run?: string;
    next_run?: string;
    is_active: boolean;
    created?: string;
    modified?: string;
}

// Create CronJob Interface
export interface CreateCronJobData {
    name: string;
    description?: string;
    job_type: string;
    ecard?: number;
    schedule: string;
    status?: "running" | "stopped" | "paused";
}

// Update CronJob Interface
export interface UpdateCronJobData {
    name?: string;
    description?: string;
    job_type?: string;
    ecard?: number;
    schedule?: string;
    status?: "running" | "stopped" | "paused";
    is_active?: boolean;
}

// API Response Interface
interface CronJobListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CronJob[];
}

// Get all cron jobs
export const getCronJobs = (): Promise<AxiosResponse<CronJobListResponse>> => {
    return api.get("/email/cron-jobs");
};

// Get a single cron job by ID
export const getCronJobById = (id: number): Promise<AxiosResponse<CronJob>> => {
    return api.get(`/email/cron-jobs/${id}`);
};

// Create a new cron job
export const createCronJob = (data: CreateCronJobData): Promise<AxiosResponse<CronJob>> => {
    return api.post("/email/cron-jobs", data);
};

// Update a cron job
export const updateCronJob = (
    id: number,
    data: UpdateCronJobData
): Promise<AxiosResponse<CronJob>> => {
    return api.patch(`/email/cron-jobs/${id}`, data);
};

// Delete a cron job
export const deleteCronJob = (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/email/cron-jobs/${id}`);
};

// Start a cron job
export const startCronJob = (id: number): Promise<AxiosResponse<{ message: string; data: CronJob }>> => {
    return api.post(`/email/cron-jobs/${id}/start`);
};

// Stop a cron job
export const stopCronJob = (id: number): Promise<AxiosResponse<{ message: string; data: CronJob }>> => {
    return api.post(`/email/cron-jobs/${id}/stop`);
};

// Restart a cron job
export const restartCronJob = (id: number): Promise<AxiosResponse<{ message: string; data: CronJob }>> => {
    return api.post(`/email/cron-jobs/${id}/restart`);
};
