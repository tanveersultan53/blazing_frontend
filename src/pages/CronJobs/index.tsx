import { useMemo, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Play, StopCircle, RefreshCw, Clock, Plus, Info } from "lucide-react";
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
    startCronJob,
    stopCronJob,
    restartCronJob,
    type CronJob as CronJobType,
    type CreateCronJobData,
} from "@/services/cronJobService";
import { getDefaultEmails } from "@/services/ecardService";

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
    const [showCronHelp, setShowCronHelp] = useState(false);
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
            toast.error(error?.response?.data?.message || "Failed to create cron job");
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

    const handleStart = (jobId: number) => {
        startMutation.mutate(jobId);
    };

    const handleStop = (jobId: number) => {
        stopMutation.mutate(jobId);
    };

    const handleRestart = (jobId: number) => {
        restartMutation.mutate(jobId);
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
                <div className="flex items-center gap-2">
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

        createMutation.mutate(data);
    };

    const handleInputChange = (field: keyof NewCronJob, value: string | number | undefined) => {
        setNewCronJob(prev => ({ ...prev, [field]: value }));
    };

    return (
        <PageHeader
            title="Cron Jobs Management"
            description="View and manage all scheduled cron jobs"
        >
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
                                value={newCronJob.ecardId?.toString() || ""}
                                onValueChange={(value) => handleInputChange("ecardId", value ? parseInt(value) : undefined as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an ecard (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
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
