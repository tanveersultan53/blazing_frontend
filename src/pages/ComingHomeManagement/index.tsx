import { useMemo, useRef, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Upload, RefreshCw, Check, X, Pencil, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useComingHomeManagement } from "./useComingHomeManagement";
import type { IComingHomeUser } from "./interface";

const ComingHomeManagement = () => {
    useBreadcrumbs([
        { label: "Digital Newsletter", href: "/coming-home" },
    ]);

    const {
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
        importMutation,
        syncMutation,
    } = useComingHomeManagement();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const columns: ColumnDef<IComingHomeUser, any>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "User",
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">
                            {row.original.first_name} {row.original.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {row.original.email}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "coming_home_url",
                header: "Newsletter URL",
                cell: ({ row }) => {
                    const isEditing = editingUrlRepId === row.original.rep_id;

                    if (isEditing) {
                        return (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={editingUrlValue}
                                    onChange={(e) => setEditingUrlValue(e.target.value)}
                                    placeholder="https://mydigitalnewsletter.online/WebDesk/..."
                                    className="h-8 text-sm min-w-[300px]"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleSaveUrl(row.original.rep_id)}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleCancelEditUrl}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    }

                    return row.original.coming_home_url ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm truncate max-w-[300px]">
                                {row.original.coming_home_url}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                    handleStartEditUrl(
                                        row.original.rep_id,
                                        row.original.coming_home_url
                                    )
                                }
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <a
                                href={row.original.coming_home_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() =>
                                handleStartEditUrl(row.original.rep_id, null)
                            }
                        >
                            <Pencil className="h-3 w-3 mr-1" />
                            Add URL
                        </Button>
                    );
                },
            },
            {
                accessorKey: "coming_home_file",
                header: "File Status",
                cell: ({ row }) =>
                    row.original.coming_home_file ? (
                        <Badge variant="secondary">
                            {row.original.coming_home_file}
                        </Badge>
                    ) : (
                        <span className="text-sm text-muted-foreground">No file</span>
                    ),
            },
            {
                accessorKey: "coming_home_last_synced",
                header: "Last Synced",
                cell: ({ row }) =>
                    row.original.coming_home_last_synced ? (
                        <span className="text-sm">
                            {new Date(row.original.coming_home_last_synced).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                    ),
            },
            {
                accessorKey: "send_cominghome",
                header: "Enabled",
                cell: ({ row }) => (
                    <Switch
                        checked={!!row.original.send_cominghome}
                        onCheckedChange={() =>
                            handleToggleEnabled(
                                row.original.rep_id,
                                !!row.original.send_cominghome
                            )
                        }
                    />
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!row.original.coming_home_url || syncMutation.isPending}
                        onClick={() => handleSyncUser(row.original.rep_id)}
                    >
                        <RefreshCw className={`h-3 w-3 mr-1 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                        Sync
                    </Button>
                ),
            },
        ],
        [
            editingUrlRepId,
            editingUrlValue,
            setEditingUrlValue,
            handleStartEditUrl,
            handleSaveUrl,
            handleCancelEditUrl,
            handleToggleEnabled,
            handleSyncUser,
            syncMutation.isPending,
        ]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleImportSubmit = () => {
        if (!selectedFile) {
            toast.error("Please select a file");
            return;
        }
        handleImport(selectedFile);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <PageHeader
                title="Digital Newsletter Management"
                description="Manage Coming Home digital newsletter URLs and sync HTML content for each user."
                actions={[
                    {
                        label: "Import Excel",
                        onClick: () => setIsImportDialogOpen(true),
                        variant: "outline",
                        icon: Upload,
                    },
                    {
                        label: "Sync All",
                        onClick: handleSyncAll,
                        disabled: syncMutation.isPending,
                        icon: RefreshCw,
                    },
                ]}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={users}
                        isLoading={isLoading}
                        globalSearch={search}
                        onGlobalSearchChange={setSearch}
                    />
                </CardContent>
            </Card>

            {/* Import Dialog */}
            <Dialog
                open={isImportDialogOpen}
                onOpenChange={(open) => {
                    setIsImportDialogOpen(open);
                    if (!open) {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Newsletter URLs</DialogTitle>
                        <DialogDescription>
                            Upload an Excel file (.xlsx) containing digital newsletter URLs.
                            URLs will be matched to users by username extracted from the URL path.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Excel File</Label>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                            />
                        </div>
                        {selectedFile && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsImportDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImportSubmit}
                            disabled={!selectedFile || importMutation.isPending}
                        >
                            {importMutation.isPending ? "Importing..." : "Import"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ComingHomeManagement;
