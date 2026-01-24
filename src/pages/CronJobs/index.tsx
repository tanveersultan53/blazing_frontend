import { useMemo, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Play, StopCircle, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";

interface CronJob {
    id: number;
    name: string;
    schedule: string;
    description: string;
    status: "running" | "stopped" | "paused";
    lastRun?: string;
    nextRun?: string;
}

const CronJobs = () => {
    const breadcrumbs = useMemo(() => [
        { label: 'Dashboard', path: '/' },
        { label: 'Cron Jobs' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    // Sample cron jobs data - replace with actual API data later
    const [cronJobs, setCronJobs] = useState<CronJob[]>([
        {
            id: 1,
            name: "Birthday Email Sender",
            schedule: "0 9 * * *",
            description: "Sends birthday emails to contacts daily at 9 AM",
            status: "running",
            lastRun: "2026-01-08 09:00:00",
            nextRun: "2026-01-09 09:00:00",
        },
        {
            id: 2,
            name: "Newsletter Sender",
            schedule: "0 10 * * 1",
            description: "Sends weekly newsletters every Monday at 10 AM",
            status: "running",
            lastRun: "2026-01-06 10:00:00",
            nextRun: "2026-01-13 10:00:00",
        },
        {
            id: 3,
            name: "Holiday Ecard Sender",
            schedule: "0 8 * * *",
            description: "Sends holiday ecards daily at 8 AM",
            status: "stopped",
            lastRun: "2026-01-07 08:00:00",
            nextRun: "-",
        },
        {
            id: 4,
            name: "Email Report Generator",
            schedule: "0 23 * * *",
            description: "Generates daily email reports at 11 PM",
            status: "running",
            lastRun: "2026-01-07 23:00:00",
            nextRun: "2026-01-08 23:00:00",
        },
    ]);

    const handleStart = (jobId: number, jobName: string) => {
        // TODO: Replace with actual API call
        setCronJobs(prev => prev.map(job =>
            job.id === jobId ? { ...job, status: "running" as const } : job
        ));
        toast.success(`${jobName} started successfully`);
    };

    const handleStop = (jobId: number, jobName: string) => {
        // TODO: Replace with actual API call
        setCronJobs(prev => prev.map(job =>
            job.id === jobId ? { ...job, status: "stopped" as const } : job
        ));
        toast.success(`${jobName} stopped successfully`);
    };

    const handleRestart = (_jobId: number, jobName: string) => {
        // TODO: Replace with actual API call
        toast.success(`${jobName} restarted successfully`);
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
            accessorKey: "lastRun",
            header: "Last Run",
            cell: ({ row }) => (
                <span className="text-sm">{row.original.lastRun || "-"}</span>
            ),
        },
        {
            accessorKey: "nextRun",
            header: "Next Run",
            cell: ({ row }) => (
                <span className="text-sm">{row.original.nextRun || "-"}</span>
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
                            onClick={() => handleStart(row.original.id, row.original.name)}
                        >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStop(row.original.id, row.original.name)}
                        >
                            <StopCircle className="h-4 w-4 mr-1" />
                            Stop
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestart(row.original.id, row.original.name)}
                    >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Restart
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <PageHeader
            title="Cron Jobs Management"
            description="View and manage all scheduled cron jobs"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Active Cron Jobs</CardTitle>
                    <CardDescription>
                        Monitor and control all automated tasks and scheduled jobs
                    </CardDescription>
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
        </PageHeader>
    );
};

export default CronJobs;
