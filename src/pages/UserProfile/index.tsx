import { useMemo } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Edit, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const UserProfile = () => {
    const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);

    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Profile' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    const { first_name, last_name, email, is_superuser } = currentUser || {};

    // Get initials for avatar fallback
    const initials = `${first_name?.charAt(0) || ''}${last_name?.charAt(0) || ''}`.toUpperCase();

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
            <div className="flex w-full flex-col gap-3">
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
                            Your basic profile information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    First Name
                                </label>
                                <p className="text-base mt-1">{first_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Last Name
                                </label>
                                <p className="text-base mt-1">{last_name || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </label>
                                <p className="text-base mt-1">{email || 'N/A'}</p>
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
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageHeader>
    );
};

export default UserProfile;

