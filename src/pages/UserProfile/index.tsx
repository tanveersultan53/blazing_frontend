import { useMemo, useRef, useState } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { Camera, Edit, ImageIcon, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getUserDetails,
  patchUser,
} from "@/services/userManagementService";
import { toast } from "sonner";
import { queryKeys } from "@/helpers/constants";
import type {
  IUserDetails,
} from "@/pages/UserDetails/interface";
import type { AxiosResponse } from "axios";
import UpdateUserProfile from "./UpdateUserProfile";
import { Button } from "@/components/ui/button";
import UpdateUserPersonalInfo from "./UpdateUserPersonalInfo";

const UserProfile = () => {
  const currentUser = useSelector(
    (state: { user: { currentUser: User } }) => state.user.currentUser,
  );

  const {
    data: userDetailsData,
    isLoading: isUserDetailsLoading,
    refetch: refetchUserDetails,
  } = useQuery<AxiosResponse<IUserDetails>>({
    queryKey: [queryKeys.getUserDetails, currentUser?.rep_id],
    queryFn: () => getUserDetails(currentUser?.rep_id as string | number),
    enabled: !!currentUser?.rep_id,
  });


  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [{ label: "Profile" }], []);

  useBreadcrumbs(breadcrumbs);

  const userDetails = (userDetailsData?.data ?? currentUser) as unknown as
    | IUserDetails
    | undefined;

  const {
    first_name,
    last_name,
    email,
    is_superuser,
    is_active,
    date_joined,
    rep_id: _rep_id,
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
    branch_id: _branch_id,
    industry_type,
  } = userDetails || {};

  const [isEditMode, setIsEditMode] = useState(false);
  const [isPersonalEditMode, setIsPersonalEditMode] = useState(false);

  // Photo & logo upload refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Mutation for updating user photo/logo
  const uploadImageMutation = useMutation({
    mutationFn: ({ field, file }: { field: "photo" | "logo"; file: File }) => {
      const formData = new FormData();
      formData.append(field, file);
      return patchUser({ id: currentUser?.rep_id as string, data: formData });
    },
    onSuccess: (_data, variables) => {
      const label = variables.field === "photo" ? "Photo" : "Logo";
      toast.success(`${label} updated successfully!`);
      refetchUserDetails();
    },
    onError: (error: any, variables) => {
      const label = variables.field === "photo" ? "Photo" : "Logo";
      toast.error(error.response?.data?.[variables.field]?.[0] || `Failed to update ${label.toLowerCase()}`);
    },
  });

  const handleImageChange = (field: "photo" | "logo", file: File | null) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size cannot exceed 5MB.");
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPG, and GIF files are allowed.");
      return;
    }
    uploadImageMutation.mutate({ field, file });
  };

  // Get initials for avatar fallback
  const initials =
    `${first_name?.charAt(0) || ""}${last_name?.charAt(0) || ""}`.toUpperCase();

  // Format phone numbers
  const formatPhoneNumber = (phone: string, ext?: string) => {
    if (!phone) return "-";
    if (ext) {
      return `${phone} ext. ${ext}`;
    }
    return phone;
  };

  // Format work phone with extension
  const formattedWorkPhone = work_phone
    ? formatPhoneNumber(work_phone, work_ext)
    : "-";

  // Format date joined
  const formatDate = (date: Date | string) => {
    if (!date) return "-";
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // Helper function to display value or dash
  const displayValue = (value: any) => {
    return value && value !== "" ? value : "-";
  };

  return (
    <PageHeader
      title="Profile"
      description=""
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
      {!isEditMode && (
        <div className="flex w-full flex-col gap-3 mb-10">
          {/* Profile Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                {/* Left: Photo + Name */}
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={userDetails?.photo || ""}
                        alt={`${first_name} ${last_name}`}
                      />
                      <AvatarFallback className="bg-orange-500 text-white text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {uploadImageMutation.isPending && uploadImageMutation.variables?.field === "photo" && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 flex items-center gap-2"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadImageMutation.isPending}
                    >
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        handleImageChange("photo", e.target.files?.[0] || null);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                {/* Right: Logo + Upload Button */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-32 border rounded-lg flex items-center justify-center overflow-hidden bg-muted/30">
                    {userDetails?.logo ? (
                      <img
                        src={userDetails.logo}
                        alt="Company Logo"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                        <span className="text-xs">No Logo</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadImageMutation.isPending}
                  >
                    {uploadImageMutation.isPending && uploadImageMutation.variables?.field === "logo" ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Logo
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      handleImageChange("logo", e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Personal Information</CardTitle>
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
                      <p className="text-base mt-1">
                        {displayValue(first_name)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Company Name
                      </label>
                      <p className="text-base mt-1">{displayValue(company)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        User ID
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
                          Raw: {work_phone} | Ext: {work_ext || "N/A"}
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
                      <p className="text-base mt-1">
                        {displayValue(industry_type)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Date Joined
                      </label>
                      <p className="text-base mt-1">
                        {formatDate(date_joined ?? "")}
                      </p>
                    </div>
                    {currentUser?.is_superuser && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Representative Name
                          </label>
                          <p className="text-base mt-1">{displayValue(rep_name)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Company ID
                          </label>
                          <p className="text-base mt-1">{displayValue(company_id)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Active
                          </label>
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className={
                                is_active
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }
                            >
                              {is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Superuser
                          </label>
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className={
                                is_superuser
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-gray-100 text-gray-800 border-gray-300"
                              }
                            >
                              {is_superuser ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
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
                      <p className="text-base mt-1">••••••••</p>
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
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Name
                      </label>
                      <p className="text-base mt-1">
                        {displayValue(last_name)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Cell Phone
                      </label>
                      <p className="text-base mt-1">
                        {displayValue(cellphone)}
                      </p>
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      )}
      {isEditMode && (
        <UpdateUserProfile
          user={userDetails as unknown as IUserDetails}
          refetch={refetchUserDetails}
          setIsEditMode={setIsEditMode}
        />
      )}
    </PageHeader>
  );
};

export default UserProfile;
