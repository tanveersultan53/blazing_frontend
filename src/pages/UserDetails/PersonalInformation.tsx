import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IUserDetails } from "./interface";
import { CheckIcon, EyeIcon, PencilIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { CreateUserFormData } from "../CreateUser/useCreateUser";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
        mid: user?.mid || '',
        website: user?.website || '',
        company_id: user?.company_id?.toString() || '',
        branch_id: user?.branch_id || '',
        is_active: user?.is_active || false,
        personal_license: user?.personal_license || '',
        industry_type: user?.industry_type || '',
        password: user?.password || '',
        disclaimer: user?.disclaimer || '',
    }

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const form = useForm<CreateUserFormData>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const { register, formState: { errors }, watch, setValue } = form;

    const { mutate: updateUserMutation } = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            toast.success("User updated successfully");
            setIsEditMode(false);
            setPhotoFile(null);
            setLogoFile(null);
            setPhotoPreview(null);
            setLogoPreview(null);
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

        // Create FormData for form submission
        const formData = new FormData();

        // Add all form fields to FormData
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof CreateUserFormData];
            if (key === 'email' || key === 'photo' || key === 'logo') return; // Skip - handled separately
            if (key === 'password' && (!value || (value as string).trim() === '')) return; // Skip empty password
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
        });

        // Append photo/logo files if selected
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        updateUserMutation({ id: id as string | number, user: formData as any });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
        setPhotoFile(null);
        setLogoFile(null);
        setPhotoPreview(null);
        setLogoPreview(null);
    };

    const handleFileChange = (type: 'photo' | 'logo') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        if (type === 'photo') {
            setPhotoFile(file);
            setPhotoPreview(previewUrl);
        } else {
            setLogoFile(file);
            setLogoPreview(previewUrl);
        }
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
                                    <p className="text-sm font-semibold">••••••••</p>
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
                                    <label htmlFor="date_joined" className="text-xs font-medium text-muted-foreground">Date Joined</label>
                                    <p className="text-sm font-semibold">{user?.date_joined ? dayjs(user?.date_joined).format('MMMM DD, YYYY') : ''}</p>
                                </div>

                            </div>

                            {/* Photo, Logo & Disclaimer */}
                            <div className="border-t pt-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold">Photo, Logo & Disclaimer</h3>
                                    <Button type="button" variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setViewDialogOpen(true)}>
                                        <EyeIcon className="w-4 h-4" />
                                        View
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Photo</label>
                                        {user?.photo ? (
                                            <img src={user.photo} alt="User photo" className="w-16 h-16 rounded-full object-cover border" />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Not set</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Logo</label>
                                        {user?.logo ? (
                                            <img src={user.logo} alt="User logo" className="w-16 h-16 object-contain border rounded" />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Not set</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Disclaimer</label>
                                        <p className="text-sm font-semibold">{user?.disclaimer || 'Not set'}</p>
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
                                    placeholder="Leave blank to keep current password"
                                    {...register('password')}
                                    error={!!errors.password}
                                />
                                <p className="text-xs text-muted-foreground">Only fill in to change the password.</p>
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

                            <div className="space-y-2">
                                <label htmlFor="personal_license" className="text-sm font-medium">
                                    Personal License
                                </label>
                                <Input
                                    id="personal_license"
                                    placeholder="Enter personal license"
                                    {...register('personal_license')}
                                />
                            </div>
                        </div>

                        {/* Photo, Logo & Disclaimer */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-semibold mb-3">Photo, Logo & Disclaimer</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Photo</label>
                                    {(photoPreview || user?.photo) && (
                                        <img
                                            src={photoPreview || user?.photo}
                                            alt="Photo preview"
                                            className="w-16 h-16 rounded-full object-cover border mb-2"
                                        />
                                    )}
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange('photo')}
                                        className="hidden"
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                                        {photoPreview || user?.photo ? 'Change Photo' : 'Upload Photo'}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Logo</label>
                                    {(logoPreview || user?.logo) && (
                                        <img
                                            src={logoPreview || user?.logo}
                                            alt="Logo preview"
                                            className="w-16 h-16 object-contain border rounded mb-2"
                                        />
                                    )}
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange('logo')}
                                        className="hidden"
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                                        {logoPreview || user?.logo ? 'Change Logo' : 'Upload Logo'}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="disclaimer" className="text-sm font-medium">
                                        Disclaimer
                                    </label>
                                    <Input
                                        id="disclaimer"
                                        placeholder="Enter disclaimer text"
                                        {...register('disclaimer')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </CardContent>
        </Card>

        {/* View Photo, Logo & Disclaimer Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Photo, Logo & Disclaimer</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Photo</label>
                        {user?.photo ? (
                            <img src={user.photo} alt="User photo" className="max-w-full max-h-48 rounded object-contain border" />
                        ) : (
                            <p className="text-sm text-muted-foreground">Not set</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Logo</label>
                        {user?.logo ? (
                            <img src={user.logo} alt="User logo" className="max-w-full max-h-48 object-contain border rounded" />
                        ) : (
                            <p className="text-sm text-muted-foreground">Not set</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Disclaimer</label>
                        <p className="text-sm">{user?.disclaimer || 'Not set'}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </form >
    )
}

export default PersonalInformation;