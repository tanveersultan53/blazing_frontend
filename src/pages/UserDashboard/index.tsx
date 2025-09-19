import { useMemo, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { FileDown, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/data-table";
import { useUserDashboard } from "./useUserDashboard";

const UserDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Dashboard' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    const [activeTab, setActiveTab] = useState<'contact' | 'referal_partner' | 'all'>(tab as 'contact' | 'referal_partner' | 'all' || 'contact');

    // Use the dashboard hook
    const { data, columns, actionItems, handleViewDetails } = useUserDashboard(activeTab);

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'contact' | 'referal_partner' | 'all');
        navigate(`/user-dashboard?tab=${value}`);
    };

    const getButtonName = () => {
        if (activeTab === 'contact') {
            return 'Add Contact';
        } else if (activeTab === 'referal_partner') {
            return 'Add Referal Partner';
        }
        return '';
    }

    return <PageHeader
        title="Dashboard"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos."
        actions={[
            ...(getButtonName() ? [{
                label: getButtonName() as string,
                onClick: () => navigate('/add-person?type=' + activeTab),
                variant: "default" as const,
                icon: UserPlus,
            }] : []),
            {
                label: "Export Users",
                onClick: () => console.log("Export clicked"),
                variant: "outline" as const,
                icon: FileDown,
            },
        ]}
    >
        <div className="flex w-full flex-col gap-6">
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="referal_partner">Referal Partner</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
            </Tabs>
            <DataTable
                columns={columns}
                data={data}
                searchColumns={['first_name', 'last_name', 'email', 'company', 'title', 'city', 'state']}
                showActionsColumn={true}
                onViewDetails={handleViewDetails}
                actionItems={actionItems}
            />
        </div>


    </PageHeader>;
};

export default UserDashboard;