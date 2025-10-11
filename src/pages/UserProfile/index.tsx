import { useMemo } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getNewsletter } from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import type { INewsletterInfo } from "@/pages/UserDetails/interface";
import type { AxiosResponse } from "axios";
import Loading from "@/components/Loading";

const UserProfile = () => {
    const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);

    // Fetch newsletter information
    const { data: newsletterData, isLoading: isNewsletterLoading } = useQuery<AxiosResponse<INewsletterInfo>>({
        queryKey: [queryKeys.getNewsletter, currentUser?.rep_id],
        queryFn: () => getNewsletter(currentUser?.rep_id as string | number),
        enabled: !!currentUser?.rep_id,
    });

    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Profile' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    const { 
        first_name, 
        last_name, 
        email, 
        is_superuser,
        is_staff,
        is_active,
        date_joined,
        rep_id,
        rep_name,
        company,
        company_id,
        address,
        address2,
        city,
        state,
        zip_code,
        work_phone,
        work_ext,
        cellphone,
        title,
        mid,
        website,
        account_folder,
        branch_id,
        industry_type,
        socials
    } = currentUser || {};

    // Get initials for avatar fallback
    const initials = `${first_name?.charAt(0) || ''}${last_name?.charAt(0) || ''}`.toUpperCase();

    // Format phone numbers
    const formatPhoneNumber = (phone: string, ext?: string) => {
        if (!phone) return '-';
        if (ext) {
            return `${phone} ext. ${ext}`;
        }
        return phone;
    };

    // Format work phone with extension
    const formattedWorkPhone = work_phone ? formatPhoneNumber(work_phone, work_ext) : '-';
    
    // Format date joined
    const formatDate = (date: Date | string) => {
        if (!date) return '-';
        try {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch {
            return '-';
        }
    };

    // Helper function to display value or dash
    const displayValue = (value: any) => {
        return value && value !== '' ? value : '-';
    };

    return (
        <PageHeader
            title="Profile"
            description="View and manage your profile information"
            actions={[
                {
                    label: "Edit Profile",
                    onClick: () => console.log("Edit profile clicked"),
                    variant: "default" as const,
                    icon: Edit,
                },
            ]}
        >
            <div className="flex w-full flex-col gap-3 mb-10">
                {/* Profile Header Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="https://www.tadpole.co.nz/wp-content/uploads/2021/02/team-1.jpg" alt={`${first_name} ${last_name}`} />
                                <AvatarFallback className="bg-orange-500 text-white text-xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-2xl">
                                        {first_name} {last_name}
                                    </CardTitle>
                                    {is_superuser && (
                                        <Badge variant="default" className="bg-orange-500">
                                            Admin
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-base mt-1">
                                    {email}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Personal Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            You can also update personal information here by clicking the update button.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        First Name
                                    </label>
                                    <p className="text-base mt-1">{displayValue(first_name)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Email
                                    </label>
                                    <p className="text-base mt-1">{displayValue(email)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Work Phone
                                    </label>
                                    <p className="text-base mt-1">{formattedWorkPhone}</p>
                                    {work_phone && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Raw: {work_phone} | Ext: {work_ext || 'N/A'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Address 2
                                    </label>
                                    <p className="text-base mt-1">{displayValue(address2)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Zip Code
                                    </label>
                                    <p className="text-base mt-1">{displayValue(zip_code)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Industry Type
                                    </label>
                                    <p className="text-base mt-1">{displayValue(industry_type)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Branch License
                                    </label>
                                    <p className="text-base mt-1">{displayValue(branch_id)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Date Joined
                                    </label>
                                    <p className="text-base mt-1">{formatDate(date_joined)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Superuser
                                    </label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={is_superuser ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"}>
                                            {is_superuser ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Middle Name
                                    </label>
                                    <p className="text-base mt-1">{displayValue(mid)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Password
                                    </label>
                                    <p className="text-base mt-1">{displayValue('')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Website
                                    </label>
                                    <p className="text-base mt-1">{displayValue(website)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        City
                                    </label>
                                    <p className="text-base mt-1">{displayValue(city)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Title
                                    </label>
                                    <p className="text-base mt-1">{displayValue(title)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Representative Name
                                    </label>
                                    <p className="text-base mt-1">{displayValue(rep_name)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Personal License
                                    </label>
                                    <p className="text-base mt-1">{displayValue('')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Active
                                    </label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={is_active ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-red-100 text-red-800 border-red-300"}>
                                            {is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Last Name
                                    </label>
                                    <p className="text-base mt-1">{displayValue(last_name)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Cell Phone
                                    </label>
                                    <p className="text-base mt-1">{displayValue(cellphone)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Address
                                    </label>
                                    <p className="text-base mt-1">{displayValue(address)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        State
                                    </label>
                                    <p className="text-base mt-1">{displayValue(state)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Company
                                    </label>
                                    <p className="text-base mt-1">{displayValue(company)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Company ID
                                    </label>
                                    <p className="text-base mt-1">{displayValue(company_id)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Account Folder
                                    </label>
                                    <p className="text-base mt-1">{displayValue(account_folder)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Staff
                                    </label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={is_staff ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-gray-100 text-gray-800 border-gray-300"}>
                                            {is_staff ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>
                            Your account type and permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Account Type
                                </label>
                                <p className="text-base mt-1">
                                    {is_superuser ? 'Administrator' : 'User'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                </label>
                                <div className="mt-1">
                                    <Badge variant="outline" className={is_active ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}>
                                        {is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Representative ID
                                </label>
                                <p className="text-base mt-1">{displayValue(rep_id)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    User ID
                                </label>
                                <p className="text-base mt-1">{displayValue(currentUser?.id)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Accounts Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Accounts Information</CardTitle>
                        <CardDescription>
                            You can also update social links information here by clicking the update button.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Column 1 */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Facebook url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.facebook)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Instagram url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.instagram)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Google url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.google)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Moneyapp url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.moneyapp)}</p>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Linkedin url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.linkedin)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Youtube url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.youtube)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Yelp url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.yelp)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Socialapp url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.socialapp)}</p>
                                </div>
                            </div>

                            {/* Column 3 */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Twitter url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.twitter)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Blogger url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.blogr)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Vimeo url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.vimeo)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Customapp url
                                    </label>
                                    <p className="text-base mt-1">{displayValue(socials?.customapp)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Newsletter Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Newsletter Information</CardTitle>
                        <CardDescription>
                            You can also update newsletter information here by clicking the update button.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isNewsletterLoading ? (
                            <Loading />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Column 1 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Company
                                        </label>
                                        <p className="text-base mt-1">{displayValue(currentUser?.company)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            MFDIC
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.fdic ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            BBB
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.bbb ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            BBB-A
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.bbba ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Discloure
                                        </label>
                                        <p className="text-base mt-1">{displayValue(newsletterData?.data?.discloure)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            EHO
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.EHO ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            HUD
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.hud ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            No Rate Post
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.no_rate_post ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            EHL
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.EHL ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            NCUA
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.ncua ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Realtor Symbol
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.realtor ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Custom Symbol
                                        </label>
                                        <p className="text-base mt-1">{newsletterData?.data?.custom ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageHeader>
    );
};

export default UserProfile;

