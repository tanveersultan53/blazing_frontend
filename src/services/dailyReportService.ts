import type { AxiosResponse } from "axios";
import api from "./axiosInterceptor";

export interface BirthdayEntry {
    first_name: string;
    last_name: string;
    age: number | null;
    birthday: string;
}

export interface DailyEmailReport {
    id: number;
    rep: number;
    rep_name: string;
    rep_email: string;
    report_date: string;
    cron_job: number | null;
    cron_job_name: string | null;
    birthday_ecards_count: number;
    holiday_ecards_count: number;
    newsletter_count: number;
    newsletter_monthly_count: number;
    newsletter_html_count: number;
    coming_home_count: number;
    total_emails_sent: number;
    next_due_contacts: string | null;
    next_due_partners: string | null;
    todays_birthdays: BirthdayEntry[];
    email_sent_successfully: boolean;
    report_html?: string;
    created: string;
    modified: string;
}

export interface DailyReportListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: DailyEmailReport[];
}

export const getDailyReports = (filters?: {
    search?: string;
    rep?: number;
    report_date?: string;
}): Promise<AxiosResponse<DailyReportListResponse>> => {
    return api.get("/email/daily-reports", { params: filters });
};

export const getDailyReportById = (
    id: number
): Promise<AxiosResponse<DailyEmailReport>> => {
    return api.get(`/email/daily-reports/${id}`);
};

export const generateDailyReports = (
    cronJobId?: number
): Promise<AxiosResponse<{ status: string; reports_created: number }>> => {
    return api.post("/email/daily-reports/generate", {
        cron_job_id: cronJobId,
    });
};

export const purgeDailyReports = (
    days: number = 30
): Promise<AxiosResponse<{ status: string; deleted_count: number; cutoff_date: string }>> => {
    return api.post("/email/daily-reports/purge", { days });
};
