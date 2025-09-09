import PageHeader from "@/components/PageHeader";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import { useMemo } from "react";
import useUserDetails from "./useUserDetails";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PersonalInformation from "./PersonalInformation";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDetails = () => {
    const { user, isLoading, activeTab, setActiveTab, refetch } = useUserDetails();
    const navigate = useNavigate();
    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Users', path: '/' },
        { label: 'User Details', path: `` }
    ], []);

    useBreadcrumbs(breadcrumbs);

    return isLoading ?
        <Loading />
        :
        <PageHeader
            title={`${user?.first_name || ''} ${user?.last_name || ''}`}
            description={user?.email ?? ''}
            actions={[
                {
                    label: "Back to Users List",
                    onClick: () => navigate('/users'),
                    variant: "outline",
                    icon: ArrowLeft,
                },
            ]}

        >
            <div className="flex w-full flex-col gap-6">
                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'personal' | 'socials' | 'messaging' | 'compliance' | 'branding' | 'preferences' | 'autooptions')}>
                    <TabsList>
                        <TabsTrigger value="personal">Personal Information</TabsTrigger>
                        <TabsTrigger value="socials">Social Media</TabsTrigger>
                        <TabsTrigger value="messaging">Messaging</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="branding">Branding</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        <TabsTrigger value="autooptions">Auto Options</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal"><PersonalInformation user={user} refetch={refetch} /></TabsContent>
                    <TabsContent value="socials">Social Media</TabsContent>
                    <TabsContent value="messaging">Messaging</TabsContent>
                    <TabsContent value="compliance">Compliance</TabsContent>
                    <TabsContent value="branding">Branding</TabsContent>
                    <TabsContent value="preferences">Preferences</TabsContent>
                    <TabsContent value="autooptions">Auto Options</TabsContent>
                </Tabs>
            </div>
        </PageHeader>
};

export default UserDetails;