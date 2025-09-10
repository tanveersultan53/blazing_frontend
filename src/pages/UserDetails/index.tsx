import PageHeader from "@/components/PageHeader";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import { useMemo } from "react";
import useUserDetails from "./useUserDetails";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PersonalInformation from "./PersonalInformation";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialLinksInformation from "./SocialLinksInformation";
import NewsLetterInformation from "./NewsLetterInformation";
import CallToAction from "./CallToAction";
import Settings from "./Settings";
import Services from "./Services";
import EmailSettings from "./EmailSettings";

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
                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'personal' | 'social' | 'settings' | 'services' | 'newsletters' | 'email' | 'call')}>
                    <TabsList>
                        <TabsTrigger value="personal">Personal Information</TabsTrigger>
                        <TabsTrigger value="social">Social Media</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="newsletters">Newsletters Information</TabsTrigger>
                        <TabsTrigger value="email">Email Settings</TabsTrigger>
                        <TabsTrigger value="call">Call to Action</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal"><PersonalInformation user={user} refetch={refetch} /></TabsContent>
                    <TabsContent value="social"><SocialLinksInformation /></TabsContent>
                    <TabsContent value="settings"><Settings /></TabsContent>
                    <TabsContent value="services"><Services /></TabsContent>
                    <TabsContent value="newsletters"><NewsLetterInformation user={user}/></TabsContent>
                    <TabsContent value="email"><EmailSettings /></TabsContent>
                    <TabsContent value="call"><CallToAction /></TabsContent>
                </Tabs>
            </div>
        </PageHeader>
};

export default UserDetails;