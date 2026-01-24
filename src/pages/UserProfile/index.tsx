import { useMemo, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
    getCallToAction,
    getEmailSettings,
    getNewsletter,
    getServiceSettings,
    getSocials,
    getUserDetails
} from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import type {
    ICallToAction,
    IEmailSettings,
    INewsletterInfo,
    IServiceSettings,
    ISocials,
    IUserDetails
} from "@/pages/UserDetails/interface";
import type { AxiosResponse } from "axios";
import Loading from "@/components/Loading";
import UpdateUserProfile from "./UpdateUserProfile";
import { Button } from "@/components/ui/button";
import UpdateUserSocialLinks from "./UpdateUserSocialLinks";
import UpdateUserAccountDetails from "./UpdateUserAccountDetails";
import UpdateUserNewsletterInfo from "./UpdateUserNewsletterInfo";
import UpdateUserPersonalInfo from "./UpdateUserPersonalInfo";
import UpdateUserServiceSettings from "./UpdateUserServiceSettings";
import UpdateUserEmailSettings from "./UpdateUserEmailSettings";
import UpdateUserCallToAction from "./UpdateUserCallToAction";
import UpdateUserBranding from "./UpdateUserBranding";

const UserProfile = () => {
    const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);

    const { data: userDetailsData, isLoading: isUserDetailsLoading, refetch: refetchUserDetails } = useQuery<AxiosResponse<IUserDetails>>({
        queryKey: [queryKeys.getUserDetails, currentUser?.rep_id],
        queryFn: () => getUserDetails(currentUser?.rep_id as string | number),
        enabled: !!currentUser?.rep_id,
    });

    // Fetch newsletter information
    const { data: newsletterData, isLoading: isNewsletterLoading, refetch: refetchNewsletter } = useQuery<AxiosResponse<INewsletterInfo>>({
        queryKey: [queryKeys.getNewsletter, currentUser?.rep_id],
        queryFn: () => getNewsletter(currentUser?.rep_id as string | number),
        enabled: !!currentUser?.rep_id,
    });

    // Fetch socials information
    const { data: socialsData, isLoading: isSocialsLoading, refetch: refetchSocials } = useQuery<AxiosResponse<ISocials>>({
        queryKey: [queryKeys.getSocials, currentUser?.rep_id],
        queryFn: () => getSocials(currentUser?.rep_id as string | number),
        enabled: !!currentUser?.rep_id,
    });

    const { data: serviceSettingsData, isLoading: isServicesLoading, refetch: refetchServiceSettings } = useQuery<AxiosResponse<IServiceSettings>>({
        queryKey: [queryKeys.getServiceSettings, currentUser?.rep_id],
        queryFn: () => getServiceSettings(currentUser?.rep_id as string | number),
        enabled: !!currentUser?.rep_id,
    });

    const { data: emailSettingsData, isLoading: isEmailSettingsLoading, refetch: refetchEmailSettings } = useQuery<AxiosResponse<IEmailSettings>>({
        queryKey: [queryKeys.getEmailSettings, currentUser?.rep_id],
        queryFn: () => getEmailSettings(currentUser?.rep_id as string | number),
        enabled: !!currentUser?.rep_id,
    });

    const { data: callToActionData, isLoading: isCallToActionLoading, refetch: refetchCallToAction } = useQuery<AxiosResponse<ICallToAction>>({
        queryKey: [queryKeys.getCallToAction, currentUser?.rep_id],
        queryFn: () => getCallToAction(currentUser?.rep_id as string | number),
        enabled: !!currentUser?.rep_id,
    });

    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Profile' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    const userDetails = (userDetailsData?.data ?? currentUser) as unknown as IUserDetails | undefined;

    const {
        first_name,
        last_name,
        email,
        is_superuser,
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
        branch_id,
        industry_type,
        socials
    } = userDetails || {};

    const [isEditMode, setIsEditMode] = useState(false);
    const [isPersonalEditMode, setIsPersonalEditMode] = useState(false);
    const [isAccountEditMode, setIsAccountEditMode] = useState(false);
    const [isNewsletterEditMode, setIsNewsletterEditMode] = useState(false);
    const [isSocialEditMode, setIsSocialEditMode] = useState(false);
    const [isServicesEditMode, setIsServicesEditMode] = useState(false);
    const [isEmailSettingsEditMode, setIsEmailSettingsEditMode] = useState(false);
    const [isCallToActionEditMode, setIsCallToActionEditMode] = useState(false);
    const [isBrandingEditMode, setIsBrandingEditMode] = useState(false);

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
                    onClick: () => setIsEditMode(true),
                    variant: "default" as const,
                    icon: Edit,
                    hidden: isEditMode,
                },
            ]}
        >
            {!isEditMode && <div className="flex w-full flex-col gap-3 mb-10">
                {/* Profile Header Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={userDetails?.photo || ''} alt={`${first_name} ${last_name}`} />
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                You can also update personal information here by clicking the update button.
                            </CardDescription>
                        </div>
                        {!isPersonalEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsPersonalEditMode(true)}
                                disabled={isUserDetailsLoading}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Personal Info
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isPersonalEditMode ? (
                            <UpdateUserPersonalInfo
                                user={userDetails as IUserDetails | undefined}
                                userId={userDetails?.rep_id}
                                setIsEditMode={setIsPersonalEditMode}
                                refetch={refetchUserDetails}
                            />
                        ) : (
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
                                    <p className="text-base mt-1">{formatDate(date_joined ?? '')}</p>
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
                            </div>
                        </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Details Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>
                                Your account type and permissions
                            </CardDescription>
                        </div>
                        {!isAccountEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsAccountEditMode(true)}
                                disabled={isUserDetailsLoading}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Account
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isAccountEditMode ? (
                            <UpdateUserAccountDetails
                                user={userDetails}
                                userId={userDetails?.rep_id}
                                setIsEditMode={setIsAccountEditMode}
                                refetch={refetchUserDetails}
                            />
                        ) : (
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
                                    <p className="text-base mt-1">{displayValue(userDetails?.id ?? currentUser?.id)}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Social Accounts Information Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Social Accounts Information</CardTitle>
                            <CardDescription>
                                Following are the social accounts information for the user.
                            </CardDescription>
                        </div>
                        {!isSocialEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsSocialEditMode(true)}
                                disabled={isSocialsLoading}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Social Links
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isSocialsLoading ? (
                            <Loading />
                        ) : isSocialEditMode ? (
                            <UpdateUserSocialLinks
                                socials={socialsData?.data ?? socials}
                                userId={currentUser?.rep_id}
                                setIsEditMode={setIsSocialEditMode}
                                refetch={refetchSocials}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Column 1 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Facebook url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.facebook)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Instagram url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.instagram)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Google url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.google)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Moneyapp url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.moneyapp)}</p>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Linkedin url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.linkedin)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Youtube url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.youtube)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Yelp url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.yelp)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Socialapp url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.socialapp)}</p>
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Twitter url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.twitter)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Blogger url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.blogr)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Vimeo url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.vimeo)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Customapp url
                                        </label>
                                        <p className="text-base mt-1">{displayValue((socialsData?.data ?? socials)?.customapp)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Newsletter Information Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Newsletter Information</CardTitle>
                            <CardDescription>
                                Following are the newsletter information for the user.
                            </CardDescription>
                        </div>
                        {!isNewsletterEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsNewsletterEditMode(true)}
                                disabled={isNewsletterLoading}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Newsletter
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isNewsletterLoading ? (
                            <Loading />
                        ) : isNewsletterEditMode ? (
                            <UpdateUserNewsletterInfo
                                newsletter={newsletterData?.data}
                                userId={userDetails?.rep_id}
                                setIsEditMode={setIsNewsletterEditMode}
                                refetch={refetchNewsletter}
                                companyName={userDetails?.company}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Column 1 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Company
                                        </label>
                                        <p className="text-base mt-1">{displayValue(userDetails?.company)}</p>
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

                {/* Services Settings Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Services Settings</CardTitle>
                            <CardDescription>
                                Manage active services and billing preferences.
                            </CardDescription>
                        </div>
                        {!isServicesEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsServicesEditMode(true)}
                                disabled={isServicesLoading}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Services
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isServicesLoading ? (
                            <Loading />
                        ) : isServicesEditMode ? (
                            <UpdateUserServiceSettings
                                userId={userDetails?.rep_id}
                                serviceSettings={serviceSettingsData?.data}
                                setIsEditMode={setIsServicesEditMode}
                                refetch={refetchServiceSettings}
                            />
                        ) : (
                            <ServiceSettingsSummary serviceSettings={serviceSettingsData?.data} />
                        )}
                    </CardContent>
                </Card>

                {/* Email Settings Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>
                                Configure email automation preferences.
                            </CardDescription>
                        </div>
                        {!isEmailSettingsEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsEmailSettingsEditMode(true)}
                                disabled={isEmailSettingsLoading}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Email Settings
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isEmailSettingsLoading ? (
                            <Loading />
                        ) : isEmailSettingsEditMode ? (
                            <UpdateUserEmailSettings
                                userId={userDetails?.rep_id}
                                emailSettings={emailSettingsData?.data}
                                setIsEditMode={setIsEmailSettingsEditMode}
                                refetch={refetchEmailSettings}
                            />
                        ) : (
                            <EmailSettingsSummary emailSettings={emailSettingsData?.data} />
                        )}
                    </CardContent>
                </Card>

                {/* Call to Action Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Call To Action</CardTitle>
                            <CardDescription>
                                Customize CTA buttons shown on marketing assets.
                            </CardDescription>
                        </div>
                        {!isCallToActionEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsCallToActionEditMode(true)}
                                disabled={isCallToActionLoading}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Call To Action
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isCallToActionLoading ? (
                            <Loading />
                        ) : isCallToActionEditMode ? (
                            <UpdateUserCallToAction
                                userId={userDetails?.rep_id}
                                callToAction={callToActionData?.data}
                                setIsEditMode={setIsCallToActionEditMode}
                                refetch={refetchCallToAction}
                            />
                        ) : (
                            <CallToActionSummary callToAction={callToActionData?.data} />
                        )}
                    </CardContent>
                </Card>

                {/* Branding Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Branding Assets</CardTitle>
                            <CardDescription>
                                Manage your company branding assets and content
                            </CardDescription>
                        </div>
                        {!isBrandingEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsBrandingEditMode(true)}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Branding
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isBrandingEditMode ? (
                            <UpdateUserBranding
                                userId={currentUser?.rep_id}
                                setIsEditMode={setIsBrandingEditMode}
                                refetch={refetchUserDetails}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Click "Edit Branding" to manage your branding assets, logos, and content.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>}
            {isEditMode && (
                <UpdateUserProfile
                    user={userDetails as unknown as IUserDetails}
                    refetch={refetchNewsletter}
                    setIsEditMode={setIsEditMode}
                />
            )}
        </PageHeader>
    );
};

export default UserProfile;

const renderBoolean = (value?: boolean) => value ? "Yes" : "No";

const ServiceSettingsSummary = ({ serviceSettings }: { serviceSettings?: IServiceSettings }) => {
    if (!serviceSettings) {
        return <p className="text-sm text-muted-foreground">No service settings available.</p>;
    }

    const items = [
        { label: "Email Service", value: serviceSettings.email_service },
        { label: "Blazing Social Service", value: serviceSettings.bs_service },
        { label: "Send Post Service", value: serviceSettings.send_post_service },
        { label: "Send Newsletter", value: serviceSettings.send_newsletter },
        { label: "Send Coming Home", value: serviceSettings.send_cominghome },
        { label: "No Branding", value: serviceSettings.no_branding },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item) => (
                <div key={item.label} className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        {item.label}
                    </label>
                    <p className="text-base mt-1">{renderBoolean(item.value)}</p>
                </div>
            ))}
            {serviceSettings.coming_home_file && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Coming Has Home</label>
                    <p className="text-base mt-1">{serviceSettings.coming_home_file}</p>
                </div>
            )}
        </div>
    );
};

const EmailSettingsSummary = ({ emailSettings }: { emailSettings?: IEmailSettings }) => {
    if (!emailSettings) {
        return <p className="text-sm text-muted-foreground">No email settings configured.</p>;
    }

    const items = [
        { label: "Birthday Emails", value: emailSettings.birthday },
        { label: "Spouse Birthday Emails", value: emailSettings.spouse_birthday },
        { label: "Newsletter Status", value: emailSettings.newsletter_status === "send" },
        { label: "Newsletter Frequency", text: emailSettings.frequency ?? "—" },
        { label: "E-card Status", value: emailSettings.ecard_status === "send" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item) => (
                <div key={item.label} className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        {item.label}
                    </label>
                    {"text" in item ? (
                        <p className="text-base mt-1">{item.text}</p>
                    ) : (
                        <p className="text-base mt-1">{renderBoolean(item.value)}</p>
                    )}
                </div>
            ))}
        </div>
    );
};

const CallToActionSummary = ({ callToAction }: { callToAction?: ICallToAction }) => {
    if (!callToAction) {
        return <p className="text-sm text-muted-foreground">No call to action configured.</p>;
    }

    const items = [
        { label: "CTA Label 1", text: callToAction.cta_label1 },
        { label: "CTA URL 1", text: callToAction.cta_url1 },
        { label: "CTA Label 2", text: callToAction.cta_label2 },
        { label: "CTA URL 2", text: callToAction.cta_url2 },
        { label: "Reverse Label", text: callToAction.reverse_label },
        { label: "CTA URL 3", text: callToAction.cta_url3 },
        { label: "Hashtags", text: callToAction.hashtags },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item) => (
                <div key={item.label} className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        {item.label}
                    </label>
                    <p className="text-base mt-1">{item.text || "—"}</p>
                </div>
            ))}
        </div>
    );
};

