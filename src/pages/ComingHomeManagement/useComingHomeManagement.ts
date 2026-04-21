import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getComingHomeUsers,
    updateComingHomeUser,
    importComingHomeUrls,
    syncComingHome,
} from "@/services/comingHomeService";

export const useComingHomeManagement = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [editingUrlRepId, setEditingUrlRepId] = useState<string | null>(null);
    const [editingUrlValue, setEditingUrlValue] = useState("");

    // Fetch users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ["coming-home-users", search],
        queryFn: () => getComingHomeUsers(search || undefined),
    });

    const users = usersData?.data?.results || [];

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: ({ repId, data }: { repId: string; data: { coming_home_url?: string; send_cominghome?: boolean } }) =>
            updateComingHomeUser(repId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coming-home-users"] });
            toast.success("User updated successfully");
            setEditingUrlRepId(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to update user");
        },
    });

    // Import mutation
    const importMutation = useMutation({
        mutationFn: (file: File) => importComingHomeUrls(file),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["coming-home-users"] });
            const { total_matched, total_unmatched } = response.data;
            toast.success(`Import complete: ${total_matched} matched, ${total_unmatched} unmatched`);
            setIsImportDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to import file");
        },
    });

    // Sync mutation
    const syncMutation = useMutation({
        mutationFn: (repIds?: string[]) => syncComingHome(repIds),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["coming-home-users"] });
            const { total_synced, total_failed } = response.data;
            if (total_failed > 0) {
                toast.warning(`Sync: ${total_synced} succeeded, ${total_failed} failed`);
            } else {
                toast.success(`Synced ${total_synced} newsletter(s) successfully`);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Sync failed");
        },
    });

    const handleToggleEnabled = (repId: string, currentValue: boolean) => {
        updateMutation.mutate({ repId, data: { send_cominghome: !currentValue } });
    };

    const handleStartEditUrl = (repId: string, currentUrl: string | null) => {
        setEditingUrlRepId(repId);
        setEditingUrlValue(currentUrl || "");
    };

    const handleSaveUrl = (repId: string) => {
        updateMutation.mutate({ repId, data: { coming_home_url: editingUrlValue } });
    };

    const handleCancelEditUrl = () => {
        setEditingUrlRepId(null);
        setEditingUrlValue("");
    };

    const handleSyncUser = (repId: string) => {
        syncMutation.mutate([repId]);
    };

    const handleSyncAll = () => {
        syncMutation.mutate(undefined);
    };

    const handleImport = (file: File) => {
        importMutation.mutate(file);
    };

    return {
        users,
        isLoading,
        search,
        setSearch,
        isImportDialogOpen,
        setIsImportDialogOpen,
        editingUrlRepId,
        editingUrlValue,
        setEditingUrlValue,
        handleToggleEnabled,
        handleStartEditUrl,
        handleSaveUrl,
        handleCancelEditUrl,
        handleSyncUser,
        handleSyncAll,
        handleImport,
        updateMutation,
        importMutation,
        syncMutation,
    };
};
