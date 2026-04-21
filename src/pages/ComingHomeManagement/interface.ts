export interface IComingHomeUser {
    user_id: number;
    rep_id: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    coming_home_url: string | null;
    coming_home_file: string | null;
    coming_home_last_synced: string | null;
    send_cominghome: boolean;
}

export interface ComingHomeListResponse {
    results: IComingHomeUser[];
}

export interface ImportResult {
    matched: {
        url: string;
        username: string;
        user: string;
        rep_id: string;
    }[];
    unmatched: {
        url: string;
        username?: string;
        reason: string;
    }[];
    total_matched: number;
    total_unmatched: number;
}

export interface SyncResult {
    synced: {
        rep_id: string;
        user: string;
        file: string;
    }[];
    failed: {
        rep_id: string;
        user: string;
        url: string;
        error: string;
    }[];
    total_synced: number;
    total_failed: number;
}
