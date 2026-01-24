import { useMemo } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Eye, Send } from "lucide-react";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";

interface EmailActivity {
    id: number;
    subject: string;
    recipient: string;
    status: string;
    sentDate: string;
    opens: number;
    clicks: number;
}

const EmailActivity = () => {
    const breadcrumbs = useMemo(() => [
        { label: 'Email Activity' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    // Sample email activity data - replace with actual API data later
    const emailActivities: EmailActivity[] = [
        {
            id: 1,
            subject: "Welcome Email",
            recipient: "john.doe@example.com",
            status: "delivered",
            sentDate: "2024-01-20",
            opens: 3,
            clicks: 1,
        },
        {
            id: 2,
            subject: "Monthly Newsletter",
            recipient: "jane.smith@example.com",
            status: "opened",
            sentDate: "2024-01-19",
            opens: 5,
            clicks: 2,
        },
        {
            id: 3,
            subject: "Product Update",
            recipient: "bob.johnson@example.com",
            status: "sent",
            sentDate: "2024-01-18",
            opens: 0,
            clicks: 0,
        },
        {
            id: 4,
            subject: "Special Offer",
            recipient: "alice.williams@example.com",
            status: "failed",
            sentDate: "2024-01-17",
            opens: 0,
            clicks: 0,
        },
        {
            id: 5,
            subject: "Password Reset",
            recipient: "mike.davis@example.com",
            status: "delivered",
            sentDate: "2024-01-16",
            opens: 1,
            clicks: 1,
        },
        {
            id: 6,
            subject: "Account Verification",
            recipient: "sarah.wilson@example.com",
            status: "opened",
            sentDate: "2024-01-15",
            opens: 2,
            clicks: 0,
        },
    ];

    // Calculate statistics
    const stats = useMemo(() => {
        const total = emailActivities.length;
        const delivered = emailActivities.filter(e => e.status === 'delivered' || e.status === 'opened').length;
        const opened = emailActivities.filter(e => e.status === 'opened').length;
        const failed = emailActivities.filter(e => e.status === 'failed').length;

        return { total, delivered, opened, failed };
    }, [emailActivities]);

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            delivered: "bg-green-100 text-green-800 border-green-200",
            opened: "bg-blue-100 text-blue-800 border-blue-200",
            sent: "bg-gray-100 text-gray-800 border-gray-200",
            failed: "bg-red-100 text-red-800 border-red-200",
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status as keyof typeof statusClasses] || statusClasses.sent}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Define table columns
    const columns: ColumnDef<EmailActivity>[] = [
        {
            accessorKey: "subject",
            header: "Subject",
        },
        {
            accessorKey: "recipient",
            header: "Recipient",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            accessorKey: "sentDate",
            header: "Sent Date",
        },
        {
            accessorKey: "opens",
            header: "Opens",
            cell: ({ row }) => (
                <div className="text-center">{row.original.opens}</div>
            ),
        },
        {
            accessorKey: "clicks",
            header: "Clicks",
            cell: ({ row }) => (
                <div className="text-center">{row.original.clicks}</div>
            ),
        },
    ];

    return (
        <PageHeader
            title="Email Activity"
            description="Track your email sending activity and engagement metrics"
        >
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All emails sent</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.delivered}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}% delivery rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Opened</CardTitle>
                        <Eye className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.opened}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100) : 0}% open rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.failed}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% failure rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Activity Details</CardTitle>
                    <CardDescription>View all your email sending history and engagement</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="px-6 pb-6">
                        <DataTable
                            columns={columns}
                            data={emailActivities}
                            searchColumns={['subject', 'recipient']}
                            showActionsColumn={false}
                        />
                    </div>
                </CardContent>
            </Card>
        </PageHeader>
    );
};

export default EmailActivity;
