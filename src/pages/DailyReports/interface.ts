export interface IBirthdayEntry {
    first_name: string;
    last_name: string;
    age: number | null;
    birthday: string;
}

export interface IDailyReport {
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
    todays_birthdays: IBirthdayEntry[];
    email_sent_successfully: boolean;
    report_html?: string;
    created: string;
    modified: string;
}

export interface DailyReportFilters {
    rep_name?: string;
}
