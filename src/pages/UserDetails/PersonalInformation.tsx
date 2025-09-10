import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IUserDetails } from "./interface";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CreateUserFormData } from "../CreateUser/useCreateUser";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/services/userManagementService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import type { AxiosResponse } from "axios";

const PersonalInformation = ({ user, refetch }: { user: IUserDetails | undefined, refetch: () => void }) => {
    const { id } = useParams();

    const initialValues = {
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        cellphone: user?.cellphone || '',
        work_phone: user?.work_phone || '',
        work_ext: user?.work_ext || '',
        address: user?.address || '',
        address2: user?.address2 || '',
        city: user?.city || '',
        state: user?.state || '',
        zip_code: user?.zip_code || '',
        title: user?.title || '',
        company: user?.company || '',
        rep_name: user?.rep_name || '',
        mid: user?.mid || '',
        website: user?.website || '',
        company_id: user?.company_id.toString() || '',
        branch_id: user?.branch_id || '',
        is_active: user?.is_active || false,
        personal_license: user?.personal_license || '',
    }

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<CreateUserFormData>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const { register, formState: { errors } } = form;

    const { mutate: updateUserMutation } = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            toast.success("User updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
        },
        onError: (error: any) => {
            const response = error.response;
            response && handleApiError(response);
            setIsSubmitting(false);
        }
    });

    const handleApiError = (response: AxiosResponse) => {
        if (response.data) {
            // Handle validation errors from server
            const errorData = response.data as Record<string, string[]>;

            // Set field-specific errors
            Object.keys(errorData).forEach((fieldName) => {
                const fieldErrors = errorData[fieldName];
                if (fieldErrors && fieldErrors.length > 0) {
                    // Set the first error message for each field
                    form.setError(fieldName as keyof CreateUserFormData, {
                        type: 'server',
                        message: fieldErrors[0]
                    });
                }
            });

            toast.error("Please fix the validation errors below");
        } else {
            // Handle other types of errors
            toast.error("Failed to update user. Please try again.");
        }
    }

    const onSubmit = (data: CreateUserFormData) => {
        setIsSubmitting(true);
        const postData = {
            ...data,
        }
        delete postData.email;
        updateUserMutation({ id: id as string | number, user: postData });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>You can also update personal information here by clicking the update button. </CardDescription>
                    </div>
                    {!isEditMode &&
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditMode(!isEditMode)}>
                            <PencilIcon className="w-4 h-4" />
                            Update Personal Details
                        </Button>
                    }
                    {isEditMode &&
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={handleCancel} disabled={isSubmitting}>
                                <XIcon className="w-4 h-4" />
                                Cancel
                            </Button>
                            <Button variant="default" size="sm" className="flex items-center gap-2" disabled={isSubmitting} type="submit"><CheckIcon className="w-4 h-4" />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    }
                </CardHeader>
                <CardContent>
                    {!isEditMode &&
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">First Name</label>
                                    <p className="text-sm font-semibold">{user?.first_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="mid" className="text-xs font-medium text-muted-foreground">Middle Name</label>
                                    <p className="text-sm font-semibold">{user?.mid}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="last_name" className="text-xs font-medium text-muted-foreground">Last Name</label>
                                    <p className="text-sm font-semibold">{user?.last_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</label>
                                    <p className="text-sm font-semibold">{user?.email}</p>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-2">
                                    <label htmlFor="cellphone" className="text-xs font-medium text-muted-foreground">Cellphone</label>
                                    <p className="text-sm font-semibold">{user?.cellphone}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Work Phone</label>
                                    <p className="text-sm font-semibold">{user?.work_phone}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="ext" className="text-xs font-medium text-muted-foreground">Extension</label>
                                    <p className="text-sm font-semibold">{user?.work_ext}</p>
                                </div>


                                {/* Additional Contact & Address */}
                                <div className="space-y-2">
                                    <label htmlFor="website" className="text-xs font-medium text-muted-foreground">Website</label>
                                    <p className="text-sm font-semibold">{user?.website}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="address" className="text-xs font-medium text-muted-foreground">Address</label>
                                    <p className="text-sm font-semibold">{user?.address}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="address2" className="text-xs font-medium text-muted-foreground">Address 2</label>
                                    <p className="text-sm font-semibold">{user?.address2}</p>
                                </div>

                                {/* Location Information */}
                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-xs font-medium text-muted-foreground">City</label>
                                    <p className="text-sm font-semibold">{user?.city}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="state" className="text-xs font-medium text-muted-foreground">State</label>
                                    <p className="text-sm font-semibold">{user?.state}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="zip_code" className="text-xs font-medium text-muted-foreground">Zip Code</label>
                                    <p className="text-sm font-semibold">{user?.zip_code}</p>
                                </div>

                                {/* Professional Information */}
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-xs font-medium text-muted-foreground">Title</label>
                                    <p className="text-sm font-semibold">{user?.title}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="company" className="text-xs font-medium text-muted-foreground">Company</label>
                                    <p className="text-sm font-semibold">{user?.company}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="rep_name" className="text-xs font-medium text-muted-foreground">Representative Name</label>
                                    <p className="text-sm font-semibold">{user?.rep_name}</p>
                                </div>

                                {/* System Information */}
                                <div className="space-y-2">
                                    <label htmlFor="company_id" className="text-xs font-medium text-muted-foreground">Company ID</label>
                                    <p className="text-sm font-semibold">{user?.company_id}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="branch_id" className="text-xs font-medium text-muted-foreground">Branch License</label>
                                    <p className="text-sm font-semibold">{user?.branch_id}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="personal_license" className="text-xs font-medium text-muted-foreground">Personal License</label>
                                    <p className="text-sm font-semibold">{user?.personal_license ?? '-'}</p>
                                </div>

                                {/* Account & Permissions */}
                                <div className="space-y-2">
                                    <label htmlFor="account_folder" className="text-xs font-medium text-muted-foreground">Account Folder</label>
                                    <p className="text-sm font-semibold">{user?.account_folder ?? '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="date_joined" className="text-xs font-medium text-muted-foreground">Date Joined</label>
                                    <p className="text-sm font-semibold">{user?.date_joined ? dayjs(user?.date_joined).format('MMMM DD, YYYY') : ''}</p>
                                </div>

                                {/* Status & Permissions */}
                                <div className="space-y-2">
                                    <label htmlFor="is_active" className="text-xs font-medium text-muted-foreground">Active</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={user?.is_active ? "default" : "secondary"}>
                                            {user?.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="is_staff" className="text-xs font-medium text-muted-foreground">Staff</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={user?.is_staff ? "default" : "secondary"}>
                                            {user?.is_staff ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="is_superuser" className="text-xs font-medium text-muted-foreground">Superuser</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={user?.is_superuser ? "default" : "secondary"}>
                                            {user?.is_superuser ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {isEditMode
                        &&
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-sm font-medium">
                                        First Name *
                                    </label>
                                    <Input
                                        id="first_name"
                                        placeholder="Enter first name"
                                        {...register('first_name', {
                                            required: 'First name is required',
                                            minLength: { value: 2, message: 'First name must be at least 2 characters' }
                                        })}
                                        className={errors.first_name ? 'border-red-500' : ''}
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-red-500">{errors.first_name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="last_name" className="text-sm font-medium">
                                        Last Name *
                                    </label>
                                    <Input
                                        id="last_name"
                                        placeholder="Enter last name"
                                        {...register('last_name', {
                                            required: 'Last name is required',
                                            minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                                        })}
                                        className={errors.last_name ? 'border-red-500' : ''}
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-red-500">{errors.last_name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">
                                        Email Address *
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        disabled={true}
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="cellphone" className="text-sm font-medium">
                                        Cell Phone
                                    </label>
                                    <Input
                                        id="cellphone"
                                        type="tel"
                                        placeholder="e.g., +1234567890"
                                        {...register('cellphone', {
                                            pattern: {
                                                value: /^\+[1-9]\d{1,14}$/,
                                                message: 'Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
                                            }
                                        })}
                                        className={errors.cellphone ? 'border-red-500' : ''}
                                    />
                                    {errors.cellphone && (
                                        <p className="text-sm text-red-500">{errors.cellphone.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="work_phone" className="text-sm font-medium">
                                        Work Phone
                                    </label>
                                    <Input
                                        id="work_phone"
                                        type="tel"
                                        placeholder="e.g., +1234567890"
                                        {...register('work_phone', {
                                            pattern: {
                                                value: /^\+[1-9]\d{1,14}$/,
                                                message: 'Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
                                            }
                                        })}
                                        className={errors.work_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.work_phone && (
                                        <p className="text-sm text-red-500">{errors.work_phone.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="work_ext" className="text-sm font-medium">
                                        Work Extension
                                    </label>
                                    <Input
                                        id="work_ext"
                                        placeholder="Enter extension"
                                        {...register('work_ext')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="website" className="text-sm font-medium">
                                        Website
                                    </label>
                                    <Input
                                        id="website"
                                        type="url"
                                        placeholder="https://www.example.com"
                                        {...register('website', {
                                            pattern: {
                                                value: /^https?:\/\/.+/,
                                                message: 'Please enter a valid URL (starting with http:// or https://)'
                                            }
                                        })}
                                        className={errors.website ? 'border-red-500' : ''}
                                    />
                                    {errors.website && (
                                        <p className="text-sm text-red-500">{errors.website.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="address" className="text-sm font-medium">
                                        Address *
                                    </label>
                                    <Input
                                        id="address"
                                        placeholder="Enter street address"
                                        {...register('address', {
                                            required: 'Address is required',
                                            minLength: { value: 5, message: 'Address must be at least 5 characters' }
                                        })}
                                        className={errors.address ? 'border-red-500' : ''}
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">{errors.address.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="address2" className="text-sm font-medium">
                                        Address Line 2
                                    </label>
                                    <Input
                                        id="address2"
                                        placeholder="Enter apartment, suite, etc. (optional)"
                                        {...register('address2')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-sm font-medium">
                                        City *
                                    </label>
                                    <Input
                                        id="city"
                                        placeholder="Enter city"
                                        {...register('city', {
                                            required: 'City is required',
                                            minLength: { value: 2, message: 'City must be at least 2 characters' }
                                        })}
                                        className={errors.city ? 'border-red-500' : ''}
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-red-500">{errors.city.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="state" className="text-sm font-medium">
                                        State *
                                    </label>
                                    <Input
                                        id="state"
                                        placeholder="Enter state"
                                        {...register('state', {
                                            required: 'State is required',
                                            minLength: { value: 2, message: 'State must be at least 2 characters' }
                                        })}
                                        className={errors.state ? 'border-red-500' : ''}
                                    />
                                    {errors.state && (
                                        <p className="text-sm text-red-500">{errors.state.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="zip_code" className="text-sm font-medium">
                                        ZIP Code *
                                    </label>
                                    <Input
                                        id="zip_code"
                                        placeholder="12345 or 12345-6789"
                                        {...register('zip_code', {
                                            required: 'ZIP code is required',
                                            pattern: {
                                                value: /^\d{5}(-\d{4})?$/,
                                                message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
                                            }
                                        })}
                                        className={errors.zip_code ? 'border-red-500' : ''}
                                    />
                                    {errors.zip_code && (
                                        <p className="text-sm text-red-500">{errors.zip_code.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">
                                        Title
                                    </label>
                                    <Input
                                        id="title"
                                        placeholder="Enter job title"
                                        {...register('title')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="company" className="text-sm font-medium">
                                        Company Name *
                                    </label>
                                    <Input
                                        id="company"
                                        placeholder="Enter company name"
                                        {...register('company', {
                                            required: 'Company name is required',
                                            minLength: { value: 2, message: 'Company name must be at least 2 characters' }
                                        })}
                                        className={errors.company ? 'border-red-500' : ''}
                                    />
                                    {errors.company && (
                                        <p className="text-sm text-red-500">{errors.company.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="rep_name" className="text-sm font-medium">
                                        Representative Name
                                    </label>
                                    <Input
                                        id="rep_name"
                                        placeholder="Enter representative name"
                                        {...register('rep_name')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="mid" className="text-sm font-medium">
                                        MID
                                    </label>
                                    <Input
                                        id="mid"
                                        placeholder="Enter MID"
                                        {...register('mid')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="company_id" className="text-sm font-medium">
                                        Company ID *
                                    </label>
                                    <Input
                                        id="company_id"
                                        type="text"
                                        placeholder="Enter company ID (numbers only)"
                                        {...register('company_id', {
                                            required: 'Company ID is required',
                                            pattern: {
                                                value: /^\d+$/,
                                                message: 'A valid integer is required.'
                                            }
                                        })}
                                        className={errors.company_id ? 'border-red-500' : ''}
                                    />
                                    {errors.company_id && (
                                        <p className="text-sm text-red-500">{errors.company_id.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="branch_id" className="text-sm font-medium">
                                        Branch ID
                                    </label>
                                    <Input
                                        id="branch_id"
                                        placeholder="Enter branch ID"
                                        {...register('branch_id')}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={form.watch('is_active') as boolean}
                                    onCheckedChange={(checked) => form.setValue('is_active', checked as boolean)}
                                />
                                <label htmlFor="is_active" className="text-sm font-medium">
                                    Make this user active/deactive
                                </label>
                            </div>
                        </div>
                    }
                </CardContent>
            </Card>
        </form>
    )
}

export default PersonalInformation;