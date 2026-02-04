import { useMemo, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Play, StopCircle, RefreshCw, Clock, Plus, Info, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCronJobs,
    createCronJob,
    updateCronJob,
    deleteCronJob,
    startCronJob,
    stopCronJob,
    restartCronJob,
    type CronJob as CronJobType,
    type CreateCronJobData,
    type UpdateCronJobData,
} from "@/services/cronJobService";
import { getDefaultEmails } from "@/services/ecardService";
import {
    getEcardDistributions,
    deleteEcardDistribution,
    updateEcardDistribution,
    type EcardDistribution,
} from "@/services/ecardDistributionService";
import {
    getNewsletterDistributions,
    deleteNewsletterDistribution,
    updateNewsletterDistribution,
    type NewsletterDistribution,
} from "@/services/newsletterDistributionService";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Using CronJob type from service
type CronJob = CronJobType;

interface NewCronJob {
    name: string;
    schedule: string;
    description: string;
    jobType: string;
    ecardId?: number;
}

const CronJobs = () => {
    const breadcrumbs = useMemo(() => [
        { label: 'Dashboard', path: '/' },
        { label: 'Cron Jobs' }
    ], []);

    useBreadcrumbs(breadcrumbs);
    const queryClient = useQueryClient();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCronHelp, setShowCronHelp] = useState(false);
    const [editingCronJob, setEditingCronJob] = useState<CronJob | null>(null);
    const [deletingCronJobId, setDeletingCronJobId] = useState<number | null>(null);
    const [newCronJob, setNewCronJob] = useState<NewCronJob>({
        name: "",
        schedule: "",
        description: "",
        jobType: "NORMAL",
        ecardId: undefined,
    });

    // Fetch cron jobs from API
    const { data: cronJobsData } = useQuery({
        queryKey: ['cronJobs'],
        queryFn: getCronJobs,
    });

    const cronJobs = cronJobsData?.data?.results || [];

    // Fetch ecards for dropdown
    const { data: ecardsData } = useQuery({
        queryKey: ['ecards'],
        queryFn: () => getDefaultEmails(),
    });

    const ecards = ecardsData?.data?.results || [];

    // Fetch ecard distributions
    const { data: ecardDistributionsData } = useQuery({
        queryKey: ['ecardDistributions'],
        queryFn: () => getEcardDistributions(),
    });

    const ecardDistributions = ecardDistributionsData?.data?.results || [];

    // Fetch newsletter distributions
    const { data: newsletterDistributionsData } = useQuery({
        queryKey: ['newsletterDistributions'],
        queryFn: () => getNewsletterDistributions(),
    });

    const newsletterDistributions = newsletterDistributionsData?.data?.results || [];

    // State for ecard distribution actions
    const [deletingDistributionId, setDeletingDistributionId] = useState<number | null>(null);
    const [showDeleteDistributionDialog, setShowDeleteDistributionDialog] = useState(false);

    // State for newsletter distribution actions
    const [deletingNewsletterDistributionId, setDeletingNewsletterDistributionId] = useState<number | null>(null);
    const [showDeleteNewsletterDistributionDialog, setShowDeleteNewsletterDistributionDialog] = useState(false);

    // Delete ecard distribution mutation
    const deleteDistributionMutation = useMutation({
        mutationFn: (id: number) => deleteEcardDistribution(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ecardDistributions'] });
            setShowDeleteDistributionDialog(false);
            setDeletingDistributionId(null);
            toast.success("Distribution deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete distribution");
        },
    });

    // Cancel ecard distribution mutation
    const cancelDistributionMutation = useMutation({
        mutationFn: (id: number) => updateEcardDistribution(id, { status: 'cancelled', is_active: false }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ecardDistributions'] });
            toast.success("Distribution cancelled successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to cancel distribution");
        },
    });

    // Mark completed mutation
    const markCompletedMutation = useMutation({
        mutationFn: (id: number) => updateEcardDistribution(id, { status: 'completed' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ecardDistributions'] });
            toast.success("Distribution marked as completed");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to mark as completed");
        },
    });

    // Delete newsletter distribution mutation
    const deleteNewsletterDistributionMutation = useMutation({
        mutationFn: (id: number) => deleteNewsletterDistribution(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['newsletterDistributions'] });
            setShowDeleteNewsletterDistributionDialog(false);
            setDeletingNewsletterDistributionId(null);
            toast.success("Newsletter distribution deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete newsletter distribution");
        },
    });

    // Cancel newsletter distribution mutation
    const cancelNewsletterDistributionMutation = useMutation({
        mutationFn: (id: number) => updateNewsletterDistribution(id, { status: 'cancelled', is_active: false }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['newsletterDistributions'] });
            toast.success("Newsletter distribution cancelled successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to cancel newsletter distribution");
        },
    });

    // Mark newsletter completed mutation
    const markNewsletterCompletedMutation = useMutation({
        mutationFn: (id: number) => updateNewsletterDistribution(id, { status: 'completed' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['newsletterDistributions'] });
            toast.success("Newsletter distribution marked as completed");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to mark as completed");
        },
    });

    // Create cron job mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateCronJobData) => createCronJob(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
            setShowCreateDialog(false);
            setNewCronJob({
                name: "",
                schedule: "",
                description: "",
                jobType: "NORMAL",
                ecardId: undefined,
            });
            toast.success("Cron job created successfully");
        },
        onError: (error: any) => {
            console.error("Create cron job error:", error);
            console.error("Error response:", error?.response);
            console.error("Error data:", error?.response?.data);

            const errorMessage = error?.response?.data?.schedule?.[0]
                || error?.response?.data?.message
                || error?.response?.data?.detail
                || Object.values(error?.response?.data || {})[0]
                || "Failed to create cron job";

            toast.error(errorMessage);
        },
    });

    // Start cron job mutation
    const startMutation = useMutation({
        mutationFn: (id: number) => startCronJob(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
            toast.success(response.data.message);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to start cron job");
        },
    });

    // Stop cron job mutation
    const stopMutation = useMutation({
        mutationFn: (id: number) => stopCronJob(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
            toast.success(response.data.message);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to stop cron job");
        },
    });

    // Restart cron job mutation
    const restartMutation = useMutation({
        mutationFn: (id: number) => restartCronJob(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
            toast.success(response.data.message);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to restart cron job");
        },
    });

    // Update cron job mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCronJobData }) => updateCronJob(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
            setShowEditDialog(false);
            setEditingCronJob(null);
            toast.success("Cron job updated successfully");
        },
        onError: (error: any) => {
            console.error("Update cron job error:", error);
            const errorMessage = error?.response?.data?.schedule?.[0]
                || error?.response?.data?.message
                || error?.response?.data?.detail
                || Object.values(error?.response?.data || {})[0]
                || "Failed to update cron job";
            toast.error(errorMessage);
        },
    });

    // Delete cron job mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteCronJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
            setShowDeleteDialog(false);
            setDeletingCronJobId(null);
            toast.success("Cron job deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete cron job");
        },
    });

    const handleStart = (jobId: number) => {
        startMutation.mutate(jobId);
    };

    const handleStop = (jobId: number) => {
        stopMutation.mutate(jobId);
    };

    const handleRestart = (jobId: number) => {
        restartMutation.mutate(jobId);
    };

    const handleEdit = (cronJob: CronJob) => {
        setEditingCronJob(cronJob);
        setNewCronJob({
            name: cronJob.name,
            schedule: cronJob.schedule,
            description: cronJob.description || "",
            jobType: cronJob.job_type,
            ecardId: cronJob.ecard,
        });
        setShowEditDialog(true);
    };

    const handleDelete = (jobId: number) => {
        setDeletingCronJobId(jobId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (deletingCronJobId) {
            deleteMutation.mutate(deletingCronJobId);
        }
    };

    const getStatusBadge = (status: CronJob["status"]) => {
        const statusConfig = {
            running: { label: "Running", className: "bg-green-100 text-green-800 border-green-200" },
            stopped: { label: "Stopped", className: "bg-red-100 text-red-800 border-red-200" },
            paused: { label: "Paused", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
        };

        const config = statusConfig[status];
        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const columns: ColumnDef<CronJob>[] = [
        {
            accessorKey: "name",
            header: "Job Name",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-sm text-muted-foreground">{row.original.description}</p>
                    {row.original.ecard_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Ecard: {row.original.ecard_name}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "schedule",
            header: "Schedule",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <code className="text-sm bg-muted px-2 py-1 rounded">{row.original.schedule}</code>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            accessorKey: "last_run",
            header: "Last Run",
            cell: ({ row }) => (
                <span className="text-sm">{row.original.last_run || "-"}</span>
            ),
        },
        {
            accessorKey: "next_run",
            header: "Next Run",
            cell: ({ row }) => (
                <span className="text-sm">{row.original.next_run || "-"}</span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 flex-wrap">
                    {row.original.status === "stopped" ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStart(row.original.id)}
                        >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStop(row.original.id)}
                        >
                            <StopCircle className="h-4 w-4 mr-1" />
                            Stop
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestart(row.original.id)}
                    >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Restart
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(row.original)}
                    >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(row.original.id)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const handleCreateCronJob = () => {
        const data: CreateCronJobData = {
            name: newCronJob.name,
            schedule: newCronJob.schedule,
            description: newCronJob.description,
            job_type: newCronJob.jobType,
            ecard: newCronJob.ecardId,
            status: "stopped",
        };

        console.log("Creating cron job with data:", data);
        createMutation.mutate(data);
    };

    const handleUpdateCronJob = () => {
        if (!editingCronJob) return;

        const data: UpdateCronJobData = {
            name: newCronJob.name,
            schedule: newCronJob.schedule,
            description: newCronJob.description,
            job_type: newCronJob.jobType,
            ecard: newCronJob.ecardId,
        };

        console.log("Updating cron job with data:", data);
        updateMutation.mutate({ id: editingCronJob.id, data });
    };

    const handleInputChange = (field: keyof NewCronJob, value: string | number | undefined) => {
        setNewCronJob(prev => ({ ...prev, [field]: value }));
    };

    // Ecard distribution handlers
    const handleDeleteDistribution = (id: number) => {
        setDeletingDistributionId(id);
        setShowDeleteDistributionDialog(true);
    };

    const confirmDeleteDistribution = () => {
        if (deletingDistributionId) {
            deleteDistributionMutation.mutate(deletingDistributionId);
        }
    };

    const handleCancelDistribution = (id: number) => {
        cancelDistributionMutation.mutate(id);
    };

    const handleMarkCompleted = (id: number) => {
        markCompletedMutation.mutate(id);
    };

    // Newsletter distribution handlers
    const handleDeleteNewsletterDistribution = (id: number) => {
        setDeletingNewsletterDistributionId(id);
        setShowDeleteNewsletterDistributionDialog(true);
    };

    const confirmDeleteNewsletterDistribution = () => {
        if (deletingNewsletterDistributionId) {
            deleteNewsletterDistributionMutation.mutate(deletingNewsletterDistributionId);
        }
    };

    const handleCancelNewsletterDistribution = (id: number) => {
        cancelNewsletterDistributionMutation.mutate(id);
    };

    const handleMarkNewsletterCompleted = (id: number) => {
        markNewsletterCompletedMutation.mutate(id);
    };

    const getDistributionStatusBadge = (status: EcardDistribution["status"] | NewsletterDistribution["status"]) => {
        const statusConfig = {
            pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
            in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
            sent: { label: "Sent", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
            delivered: { label: "Delivered", className: "bg-cyan-100 text-cyan-800 border-cyan-200" },
            completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
            failed: { label: "Failed", className: "bg-red-100 text-red-800 border-red-200" },
            cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800 border-gray-200" },
        };

        const config = statusConfig[status];
        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        );
    };

    // Ecard distributions columns
    const distributionColumns: ColumnDef<EcardDistribution>[] = [
        {
            accessorKey: "ecard_name",
            header: "Ecard",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.ecard_name || `Ecard #${row.original.ecard}`}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.send_to_all ? "All Users" : `${row.original.users?.length || 0} Selected Users`}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getDistributionStatusBadge(row.original.status),
        },
        {
            accessorKey: "scheduled_at",
            header: "Scheduled",
            cell: ({ row }) => (
                <span className="text-sm">{new Date(row.original.scheduled_at).toLocaleString()}</span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 flex-wrap">
                    {row.original.status === "pending" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelDistribution(row.original.id)}
                        >
                            Cancel
                        </Button>
                    )}
                    {row.original.status === "in_progress" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkCompleted(row.original.id)}
                        >
                            Mark Completed
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDistribution(row.original.id)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    // Newsletter distributions columns
    const newsletterDistributionColumns: ColumnDef<NewsletterDistribution>[] = [
        {
            accessorKey: "newsletter_label",
            header: "Newsletter",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.newsletter_label || `Newsletter #${row.original.newsletter}`}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.send_to_all ? "All Users" : `${row.original.users?.length || 0} Selected Users`}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getDistributionStatusBadge(row.original.status),
        },
        {
            accessorKey: "scheduled_at",
            header: "Scheduled",
            cell: ({ row }) => (
                <span className="text-sm">{new Date(row.original.scheduled_at).toLocaleString()}</span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 flex-wrap">
                    {row.original.status === "pending" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelNewsletterDistribution(row.original.id)}
                        >
                            Cancel
                        </Button>
                    )}
                    {row.original.status === "in_progress" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkNewsletterCompleted(row.original.id)}
                        >
                            Mark Completed
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNewsletterDistribution(row.original.id)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <PageHeader
            title="Jobs Management"
            description="View and manage scheduled jobs and distributions"
        >
            <Tabs defaultValue="cron-jobs" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cron-jobs">Cron Jobs</TabsTrigger>
                    <TabsTrigger value="ecard-distributions">Ecard Distributions</TabsTrigger>
                    <TabsTrigger value="newsletter-distributions">Newsletter Distributions</TabsTrigger>
                </TabsList>

                <TabsContent value="cron-jobs" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Active Cron Jobs</CardTitle>
                                    <CardDescription>
                                        Monitor and control all automated tasks and scheduled jobs
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Cron Job
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={cronJobs}
                                searchColumns={['name', 'description']}
                                showActionsColumn={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ecard-distributions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle>Ecard Distributions</CardTitle>
                                <CardDescription>
                                    View and manage scheduled ecard distribution jobs
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={distributionColumns}
                                data={ecardDistributions}
                                searchColumns={['ecard_name']}
                                showActionsColumn={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="newsletter-distributions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle>Newsletter Distributions</CardTitle>
                                <CardDescription>
                                    View and manage scheduled newsletter distribution jobs
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={newsletterDistributionColumns}
                                data={newsletterDistributions}
                                searchColumns={['newsletter_label']}
                                showActionsColumn={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create New Cron Job</DialogTitle>
                        <DialogDescription>
                            Configure a new cron job for automated email tasks
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Job Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Birthday Email Sender"
                                value={newCronJob.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="jobType">Email Category Type</Label>
                            <Select
                                value={newCronJob.jobType}
                                onValueChange={(value) => handleInputChange("jobType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select email category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal Email</SelectItem>
                                    <SelectItem value="BIRTHDAY">Birthday</SelectItem>
                                    <SelectItem value="NEW_YEARS">New Years</SelectItem>
                                    <SelectItem value="ST_PATRICKS_DAY">St. Patrick's Day</SelectItem>
                                    <SelectItem value="FOURTH_OF_JULY">4th of July</SelectItem>
                                    <SelectItem value="HALLOWEEN">Halloween</SelectItem>
                                    <SelectItem value="SUMMER">Summer</SelectItem>
                                    <SelectItem value="THANKSGIVING">Thanksgiving</SelectItem>
                                    <SelectItem value="VETERANS_DAY">Veterans Day</SelectItem>
                                    <SelectItem value="SPRING">Spring</SelectItem>
                                    <SelectItem value="LABOR_DAY">Labor Day</SelectItem>
                                    <SelectItem value="DECEMBER_HOLIDAYS">December Holidays</SelectItem>
                                    <SelectItem value="FALL">Fall</SelectItem>
                                    <SelectItem value="VALENTINES_DAY">Valentine's Day</SelectItem>
                                    <SelectItem value="MEMORIAL_DAY">Memorial Day</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ecard">Ecard/Email Template (Optional)</Label>
                            <Select
                                value={newCronJob.ecardId?.toString() || "none"}
                                onValueChange={(value) => handleInputChange("ecardId", value === "none" ? undefined : parseInt(value) as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an ecard (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {ecards.map((ecard: any) => (
                                        <SelectItem key={ecard.id} value={ecard.id.toString()}>
                                            {ecard.email_name || `Ecard #${ecard.id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Select the ecard/email that will be sent when this job runs
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="schedule">Cron Schedule</Label>
                                <button
                                    type="button"
                                    onClick={() => setShowCronHelp(true)}
                                    className="inline-flex items-center"
                                >
                                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                </button>
                            </div>
                            <Input
                                id="schedule"
                                placeholder="e.g., 0 9 * * * (daily at 9 AM)"
                                value={newCronJob.schedule}
                                onChange={(e) => handleInputChange("schedule", e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Format: minute hour day month day_of_week
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what this job does..."
                                value={newCronJob.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateCronJob}
                            disabled={!newCronJob.name || !newCronJob.schedule || createMutation.isPending}
                        >
                            {createMutation.isPending ? "Creating..." : "Create Cron Job"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Cron Job Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Cron Job</DialogTitle>
                        <DialogDescription>
                            Update the cron job configuration
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Job Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="e.g., Birthday Email Sender"
                                value={newCronJob.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-jobType">Email Category Type</Label>
                            <Select
                                value={newCronJob.jobType}
                                onValueChange={(value) => handleInputChange("jobType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select email category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal Email</SelectItem>
                                    <SelectItem value="BIRTHDAY">Birthday</SelectItem>
                                    <SelectItem value="NEW_YEARS">New Years</SelectItem>
                                    <SelectItem value="ST_PATRICKS_DAY">St. Patrick's Day</SelectItem>
                                    <SelectItem value="FOURTH_OF_JULY">4th of July</SelectItem>
                                    <SelectItem value="HALLOWEEN">Halloween</SelectItem>
                                    <SelectItem value="SUMMER">Summer</SelectItem>
                                    <SelectItem value="THANKSGIVING">Thanksgiving</SelectItem>
                                    <SelectItem value="VETERANS_DAY">Veterans Day</SelectItem>
                                    <SelectItem value="SPRING">Spring</SelectItem>
                                    <SelectItem value="LABOR_DAY">Labor Day</SelectItem>
                                    <SelectItem value="DECEMBER_HOLIDAYS">December Holidays</SelectItem>
                                    <SelectItem value="FALL">Fall</SelectItem>
                                    <SelectItem value="VALENTINES_DAY">Valentine's Day</SelectItem>
                                    <SelectItem value="MEMORIAL_DAY">Memorial Day</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-ecard">Ecard/Email Template (Optional)</Label>
                            <Select
                                value={newCronJob.ecardId?.toString() || "none"}
                                onValueChange={(value) => handleInputChange("ecardId", value === "none" ? undefined : parseInt(value) as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an ecard (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {ecards.map((ecard: any) => (
                                        <SelectItem key={ecard.id} value={ecard.id.toString()}>
                                            {ecard.email_name || `Ecard #${ecard.id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="edit-schedule">Cron Schedule</Label>
                                <button
                                    type="button"
                                    onClick={() => setShowCronHelp(true)}
                                    className="inline-flex items-center"
                                >
                                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                </button>
                            </div>
                            <Input
                                id="edit-schedule"
                                placeholder="e.g., 0 9 * * * (daily at 9 AM)"
                                value={newCronJob.schedule}
                                onChange={(e) => handleInputChange("schedule", e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Format: minute hour day month day_of_week
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Describe what this job does..."
                                value={newCronJob.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateCronJob}
                            disabled={!newCronJob.name || !newCronJob.schedule || updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Updating..." : "Update Cron Job"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Cron Job Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the cron job.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Distribution Confirmation Dialog */}
            <AlertDialog open={showDeleteDistributionDialog} onOpenChange={setShowDeleteDistributionDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the ecard distribution.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteDistribution}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteDistributionMutation.isPending}
                        >
                            {deleteDistributionMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Newsletter Distribution Confirmation Dialog */}
            <AlertDialog open={showDeleteNewsletterDistributionDialog} onOpenChange={setShowDeleteNewsletterDistributionDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the newsletter distribution.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteNewsletterDistribution}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteNewsletterDistributionMutation.isPending}
                        >
                            {deleteNewsletterDistributionMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cron Schedule Help Dialog */}
            <Dialog open={showCronHelp} onOpenChange={setShowCronHelp}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cron Schedule Format Guide</DialogTitle>
                        <DialogDescription>
                            Learn how to create cron schedules for automated jobs
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <h4 className="font-semibold mb-2">Cron Schedule Format</h4>
                            <code className="text-sm bg-muted px-3 py-2 rounded block">
                                minute hour day month day_of_week
                            </code>
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-2">Common Examples:</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 9 * * *</code>
                                    <span className="text-muted-foreground">Daily at 9:00 AM</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 10 * * 1</code>
                                    <span className="text-muted-foreground">Every Monday at 10:00 AM</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 8 1 * *</code>
                                    <span className="text-muted-foreground">1st day of every month at 8:00 AM</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 23 * * *</code>
                                    <span className="text-muted-foreground">Daily at 11:00 PM</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">*/15 * * * *</code>
                                    <span className="text-muted-foreground">Every 15 minutes</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-2">Weekly Schedules:</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 0 * * 0</code>
                                    <span className="text-muted-foreground">Every Sunday at midnight</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 9 * * 1-5</code>
                                    <span className="text-muted-foreground">Weekdays (Mon-Fri) at 9:00 AM</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 14 * * 6</code>
                                    <span className="text-muted-foreground">Every Saturday at 2:00 PM</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-2">Monthly & Yearly:</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 12 15 * *</code>
                                    <span className="text-muted-foreground">15th of every month at noon</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 9 1 1 *</code>
                                    <span className="text-muted-foreground">January 1st at 9:00 AM (yearly)</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 10 25 12 *</code>
                                    <span className="text-muted-foreground">December 25th at 10:00 AM</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 8 1 */3 *</code>
                                    <span className="text-muted-foreground">1st of every 3rd month (quarterly)</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 0 1 6,12 *</code>
                                    <span className="text-muted-foreground">June 1st & Dec 1st at midnight</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-2">Advanced Patterns:</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 */2 * * *</code>
                                    <span className="text-muted-foreground">Every 2 hours</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">30 8-17 * * *</code>
                                    <span className="text-muted-foreground">Every hour at :30 from 8 AM to 5 PM</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <code className="bg-muted px-2 py-1 rounded text-xs whitespace-nowrap font-mono">0 9 * * 1,3,5</code>
                                    <span className="text-muted-foreground">Mon, Wed, Fri at 9:00 AM</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-3">
                            <p className="text-sm font-semibold mb-2">Field Descriptions:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• <strong>minute:</strong> 0-59</li>
                                <li>• <strong>hour:</strong> 0-23 (0 = midnight, 12 = noon)</li>
                                <li>• <strong>day:</strong> 1-31</li>
                                <li>• <strong>month:</strong> 1-12 (1 = January, 12 = December)</li>
                                <li>• <strong>day_of_week:</strong> 0-6 (0 = Sunday, 6 = Saturday)</li>
                            </ul>
                            <p className="text-sm text-muted-foreground mt-3">
                                <strong>Special characters:</strong>
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                                <li>• <code className="bg-muted px-1 rounded">*</code> = any value</li>
                                <li>• <code className="bg-muted px-1 rounded">*/n</code> = every n (e.g., */15 = every 15)</li>
                                <li>• <code className="bg-muted px-1 rounded">n-m</code> = range (e.g., 1-5 = Monday to Friday)</li>
                                <li>• <code className="bg-muted px-1 rounded">n,m</code> = list (e.g., 1,3,5 = Mon, Wed, Fri)</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowCronHelp(false)}>
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageHeader>
    );
};

export default CronJobs;
