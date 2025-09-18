import { useMemo, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { FileDown, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
    const navigate = useNavigate();
    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Dashboard' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    const [activeTab, setActiveTab] = useState<'contact' | 'referal_partner' | 'all'>('contact');

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
                onClick: () => { },
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
                <TabsContent value="contact"><></></TabsContent>
                <TabsContent value="referal_partner"><></></TabsContent>
                <TabsContent value="all"><></></TabsContent>
            </Tabs>
        </div>
    </PageHeader>;
};

export default UserDashboard;