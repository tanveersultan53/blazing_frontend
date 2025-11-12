import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IUserDetails } from "./interface";
import { CheckIcon, PencilIcon, XIcon, Upload, Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { CreateUserFormData } from "../CreateUser/useCreateUser";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/services/userManagementService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import type { AxiosResponse } from "axios";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import { formatCellPhone, formatWorkPhone, autoFormatPhoneNumber, cleanPhoneNumber } from "@/lib/phoneFormatter";

const PersonalInformation = ({ user, refetch }: { user: IUserDetails | undefined, refetch: () => void }) => {
    const { id } = useParams();

    const initialValues = {
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        cellphone: formatCellPhone(user?.cellphone) || '',
        work_phone: formatCellPhone(user?.work_phone) || '',
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
        company_id: user?.company_id?.toString() || '',
        branch_id: user?.branch_id || '',
        is_active: user?.is_active || false,
        personal_license: user?.personal_license || '',
        industry_type: user?.industry_type || '',
        password: user?.password || '',
        // Media fields
        photo: undefined,
        logo: undefined,
        disclaimer: user?.disclaimer || '',
    }

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<CreateUserFormData>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const { register, formState: { errors }, watch, setValue } = form;

    // Watch for file changes to show previews
    const photoFile = watch('photo');
    const logoFile = watch('logo');
    const photoPreviewRef = useRef<string | null>(null);
    const logoPreviewRef = useRef<string | null>(null);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (photoPreviewRef.current) {
                URL.revokeObjectURL(photoPreviewRef.current);
            }
            if (logoPreviewRef.current) {
                URL.revokeObjectURL(logoPreviewRef.current);
            }
        };
    }, []);

    // Function to clear file selection
    const clearFile = (fieldName: 'photo' | 'logo') => {
        setValue(fieldName, undefined as any);
        if (fieldName === 'photo' && photoPreviewRef.current) {
            URL.revokeObjectURL(photoPreviewRef.current);
            photoPreviewRef.current = null;
        }
        if (fieldName === 'logo' && logoPreviewRef.current) {
            URL.revokeObjectURL(logoPreviewRef.current);
            logoPreviewRef.current = null;
        }
    };

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
        // Validate industry_type field
        if (!data.industry_type) {
            form.setError('industry_type', {
                type: 'required',
                message: 'Industry type is required'
            });
            return;
        }

        setIsSubmitting(true);

        // Create FormData for file uploads
        const formData = new FormData();

        // Add all form fields to FormData
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof CreateUserFormData];
            if (key === 'photo' || key === 'logo') {
                // Handle file uploads
                if (value && (value as FileList).length > 0) {
                    formData.append(key, (value as FileList)[0]);
                }
            } else if (key !== 'email') { // Skip email field but include all other fields
                // Handle regular fields - include all values except undefined
                if (value !== undefined) {
                    if (key === 'cellphone' || key === 'work_phone') {
                        formData.append(key, cleanPhoneNumber(value as string));
                    } else if (key === 'is_active') {
                        formData.append(key, (value as boolean).toString());
                    } else {
                        formData.append(key, value as string);
                    }
                }
            }
        });

        updateUserMutation({ id: id as string | number, user: formData as any });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data">
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
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</label>
                                    <p className="text-sm font-semibold">{user?.password ? '••••••••' : '-'}</p>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-2">
                                    <label htmlFor="cellphone" className="text-xs font-medium text-muted-foreground">Cell Phone</label>
                                    <p className="text-sm font-semibold">{formatCellPhone(user?.cellphone)}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Work Phone</label>
                                    <p className="text-sm font-semibold">
                                        {user?.work_phone ? formatWorkPhone(user.work_phone, user.work_ext) : 'Not provided'}
                                    </p>
                                    {/* Debug info - remove this after testing */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <p className="text-xs text-gray-500">
                                            Raw: {user?.work_phone} | Ext: {user?.work_ext}
                                        </p>
                                    )}
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
                                    <label htmlFor="industry_type" className="text-xs font-medium text-muted-foreground">Industry Type</label>
                                    <p className="text-sm font-semibold">{user?.industry_type ?? '-'}</p>
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

                            {/* Media Information Section */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4">Media Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">User Photo</label>
                                        <div className="flex items-center gap-4">
                                            {user?.photo ? (
                                                <img
                                                    src={user.photo}
                                                    alt="User photo"
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">User Logo</label>
                                        <div className="flex items-center gap-4">
                                            {user?.logo ? (
                                                <img
                                                    src={user.logo}
                                                    alt="User logo"
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                </div>
                            </div>
                            {user?.disclaimer && (
                                <div className="mt-6 space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Disclaimer Text</label>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm">{user.disclaimer}</p>
                                    </div>
                                </div>
                            )}
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
                                <label htmlFor="mid" className="text-sm font-medium">
                                    Middle Name
                                </label>
                                <Input
                                    id="mid"
                                    placeholder="Enter Middle Name"
                                    {...register('mid')}
                                />
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
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    placeholder="Enter password"
                                    {...register('password')}
                                    error={!!errors.password}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="cellphone" className="text-sm font-medium">
                                    Cell Phone
                                </label>
                                <Input
                                    id="cellphone"
                                    type="tel"
                                    placeholder="(858) 369-5555"
                                    {...register('cellphone', {
                                        pattern: {
                                            value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                                            message: 'Phone number must be in format: (XXX) XXX-XXXX'
                                        },
                                        onChange: (e) => {
                                            const formatted = autoFormatPhoneNumber(e.target.value);
                                            setValue('cellphone', formatted, { shouldValidate: true });
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
                                    placeholder="(858) 369-5555"
                                    {...register('work_phone', {
                                        pattern: {
                                            value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                                            message: 'Phone number must be in format: (XXX) XXX-XXXX'
                                        },
                                        onChange: (e) => {
                                            const formatted = autoFormatPhoneNumber(e.target.value);
                                            setValue('work_phone', formatted, { shouldValidate: true });
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
                                    Address
                                </label>
                                <Input
                                    id="address"
                                    placeholder="Enter street address"
                                    {...register('address')}
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
                                    City
                                </label>
                                <Input
                                    id="city"
                                    placeholder="Enter city"
                                    {...register('city')}
                                    className={errors.city ? 'border-red-500' : ''}
                                />
                                {errors.city && (
                                    <p className="text-sm text-red-500">{errors.city.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="state" className="text-sm font-medium">
                                    State
                                </label>
                                <Input
                                    id="state"
                                    placeholder="Enter state"
                                    {...register('state')}
                                    className={errors.state ? 'border-red-500' : ''}
                                />
                                {errors.state && (
                                    <p className="text-sm text-red-500">{errors.state.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="zip_code" className="text-sm font-medium">
                                    ZIP Code
                                </label>
                                <Input
                                    id="zip_code"
                                    placeholder="12345 or 12345-6789"
                                    {...register('zip_code')}
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
                                    Company Name
                                </label>
                                <Input
                                    id="company"
                                    placeholder="Enter company name"
                                    {...register('company')}
                                    className={errors.company ? 'border-red-500' : ''}
                                />
                                {errors.company && (
                                    <p className="text-sm text-red-500">{errors.company.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="industry_type" className="text-sm font-medium">
                                    Industry Type *
                                </label>
                                <Select
                                    onValueChange={(value) => {
                                        setValue('industry_type', value);
                                        if (errors.industry_type) {
                                            form.clearErrors('industry_type');
                                        }
                                    }}
                                    value={watch('industry_type')}
                                >
                                    <SelectTrigger className={`w-full ${errors.industry_type ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select industry type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mortgage">Mortgage</SelectItem>
                                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                                        <SelectItem value="Title Insurance">Title Insurance</SelectItem>
                                        <SelectItem value="Others">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.industry_type && (
                                    <p className="text-sm text-red-500">{errors.industry_type.message}</p>
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
                                    className={errors.rep_name ? 'border-red-500' : ''}
                                />
                                {errors.rep_name && (
                                    <p className="text-sm text-red-500">{errors.rep_name.message}</p>
                                )}
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

                        {/* Media Information Section */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="text-lg font-semibold mb-4">Media Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="photo" className="text-sm font-medium">
                                        User Photo
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            {...register('photo')}
                                            onChange={(e) => {
                                                register('photo').onChange(e);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {photoFile && photoFile[0] ? photoFile[0].name : 'No file chosen'}
                                                </span>
                                            </div>
                                            <Button type="button" variant="outline" size="sm" className="ml-2">
                                                <Upload className="h-4 w-4 mr-1" />
                                                Choose File
                                            </Button>
                                        </div>
                                    </div>
                                    {photoFile && photoFile[0] && (
                                        <div className="mt-2">
                                            <div className="relative inline-block">
                                                <img
                                                    src={(() => {
                                                        if (photoPreviewRef.current) {
                                                            URL.revokeObjectURL(photoPreviewRef.current);
                                                        }
                                                        photoPreviewRef.current = URL.createObjectURL(photoFile[0]);
                                                        return photoPreviewRef.current;
                                                    })()}
                                                    alt="Photo preview"
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                    onClick={() => clearFile('photo')}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Preview</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">Upload a profile photo (JPG, PNG, GIF)</p>
                                    {errors.photo && (
                                        <p className="text-sm text-red-500">{errors.photo.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="logo" className="text-sm font-medium">
                                        User Logo
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            {...register('logo')}
                                            onChange={(e) => {
                                                register('logo').onChange(e);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {logoFile && logoFile[0] ? logoFile[0].name : 'No file chosen'}
                                                </span>
                                            </div>
                                            <Button type="button" variant="outline" size="sm" className="ml-2">
                                                <Upload className="h-4 w-4 mr-1" />
                                                Choose File
                                            </Button>
                                        </div>
                                    </div>
                                    {logoFile && logoFile[0] && (
                                        <div className="mt-2">
                                            <div className="relative inline-block">
                                                <img
                                                    src={(() => {
                                                        if (logoPreviewRef.current) {
                                                            URL.revokeObjectURL(logoPreviewRef.current);
                                                        }
                                                        logoPreviewRef.current = URL.createObjectURL(logoFile[0]);
                                                        return logoPreviewRef.current;
                                                    })()}
                                                    alt="Logo preview"
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                    onClick={() => clearFile('logo')}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Preview</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">Upload a company/user logo (JPG, PNG, GIF)</p>
                                    {errors.logo && (
                                        <p className="text-sm text-red-500">{errors.logo.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <label htmlFor="disclaimer" className="text-sm font-medium">
                                    Disclaimer Text
                                </label>
                                <Textarea
                                    id="disclaimer"
                                    placeholder="Enter disclaimer text (optional)"
                                    {...register('disclaimer')}
                                    className={errors.disclaimer ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-gray-500">Add any disclaimer or additional information about the user</p>
                                {errors.disclaimer && (
                                    <p className="text-sm text-red-500">{errors.disclaimer.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                }
            </CardContent>
        </Card>
        </form >
    )
}

export default PersonalInformation;