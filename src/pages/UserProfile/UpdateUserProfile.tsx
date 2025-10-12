import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IUserDetails } from "../UserDetails/interface";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CreateUserFormData } from "../CreateUser/useCreateUser";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/services/userManagementService";
import { toast } from "sonner";
import type { ISocials, INewsletterInfo  } from "../UserDetails/interface";
import type { AxiosResponse } from "axios";
import { formatCellPhone, autoFormatPhoneNumber, cleanPhoneNumber } from "@/lib/phoneFormatter";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { urlValidation } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const UpdateUserProfile = ({ user, refetch, setIsEditMode }:
    { user: IUserDetails | undefined, refetch: () => void, setIsEditMode: (isEditMode: boolean) => void }) => {
    const id = user?.rep_id;

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
        company_id: user?.company_id.toString() || '',
        branch_id: user?.branch_id || '',
        personal_license: user?.personal_license || '',
        industry_type: user?.industry_type || '',
        password: user?.password || '',

        facebook: user?.socials?.facebook || '',
        linkedin: user?.socials?.linkedin || '',
        twitter: user?.socials?.twitter || '',
        instagram: user?.socials?.instagram || '',
        youtube: user?.socials?.youtube || '',
        blogr: user?.socials?.blogr || '',
        google: user?.socials?.google || '',
        yelp: user?.socials?.yelp || '',
        vimeo: user?.socials?.vimeo || '',
        moneyapp: user?.socials?.moneyapp || '',
        socialapp: user?.socials?.socialapp || '',
        customapp: user?.socials?.customapp || '',

        bbb: user?.compliance?.bbb || false,
        bbba: user?.compliance?.bbba || false,
        EHL: user?.compliance?.EHL || false,
        EHO: user?.compliance?.EHO || false,
        fdic: user?.compliance?.fdic || false,
        ncua: user?.compliance?.ncua || false,
        realtor: user?.compliance?.realtor || false,
        hud: user?.compliance?.hud || false,
        no_rate_post: user?.compliance?.no_rate_post || false,
        custom: user?.compliance?.custom || false,
        discloure: user?.branding?.disclosure || '',
    }

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<CreateUserFormData & ISocials & INewsletterInfo>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const { register, formState: { errors }, watch, setValue, handleSubmit } = form;

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
                    form.setError(fieldName as keyof CreateUserFormData & ISocials & INewsletterInfo, {
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

    const onSubmit = (data: CreateUserFormData & ISocials & INewsletterInfo) => {
        // Validate industry_type field
        if (!data.industry_type) {
            form.setError('industry_type', {
                type: 'required',
                message: 'Industry type is required'
            });
            return;
        }

        setIsSubmitting(true);
        const postData = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            cellphone: cleanPhoneNumber(data.cellphone),
            work_phone: cleanPhoneNumber(data.work_phone),
            work_ext: data.work_ext,
            address: data.address,
            address2: data.address2,
            city: data.city,
            state: data.state,
            zip_code: data.zip_code,
            title: data.title,
            company: data.company,
            rep_name: data.rep_name,
            mid: data.mid,
            website: data.website,
            company_id: data.company_id,
            branch_id: data.branch_id,
            personal_license: data.personal_license,
            industry_type: data.industry_type,
            password: data.password,

            socials: {
                facebook: data.facebook,
                linkedin: data.linkedin,
                twitter: data.twitter,
                instagram: data.instagram,
                youtube: data.youtube,
                blogr: data.blogr,
                google: data.google,
                yelp: data.yelp,
                vimeo: data.vimeo,
                moneyapp: data.moneyapp,
                socialapp: data.socialapp,
                customapp: data.customapp,
            },

            compliance: {
                bbb: data.bbb,
                bbba: data.bbba,
                EHL: data.EHL,
                EHO: data.EHO,
                fdic: data.fdic,
                ncua: data.ncua,
                realtor: data.realtor,
                hud: data.hud,
                no_rate_post: data.no_rate_post,
                custom: data.custom,
            },

            branding: {
                disclosure: data.discloure,
            },
        }
        delete postData.email;
        updateUserMutation({ id: id as string | number, user: postData });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>You can also update personal information here by clicking the update button. </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={handleCancel} disabled={isSubmitting}>
                            <XIcon className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button variant="default" size="sm" className="flex items-center gap-2" disabled={isSubmitting} type="submit"><CheckIcon className="w-4 h-4" />
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>

                </CardHeader>
                <CardContent>
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
                        <Separator />
                        <p className="text-md font-medium">Social Links</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div className="space-y-2">
                                <label htmlFor="facebook" className="text-xs font-medium text-muted-foreground">Facebook url</label>
                                <Input
                                    id="facebook"
                                    type="url"
                                    placeholder="https://www.facebook.com/username"
                                    {...register('facebook', urlValidation)}
                                    className={errors.facebook ? 'border-red-500' : ''}
                                />
                                {errors.facebook && (
                                    <p className="text-sm text-red-500">{errors.facebook.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="linkedin" className="text-xs font-medium text-muted-foreground">Linkedin url</label>
                                <Input
                                    id="linkedin"
                                    type="url"
                                    placeholder="https://www.linkedin.com/in/username"
                                    {...register('linkedin', urlValidation)}
                                    className={errors.linkedin ? 'border-red-500' : ''}
                                />
                                {errors.linkedin && (
                                    <p className="text-sm text-red-500">{errors.linkedin.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="twitter" className="text-xs font-medium text-muted-foreground">Twitter url</label>
                                <Input
                                    id="twitter"
                                    type="url"
                                    placeholder="https://www.twitter.com/username"
                                    {...register('twitter', urlValidation)}
                                    className={errors.twitter ? 'border-red-500' : ''}
                                />
                                {errors.twitter && (
                                    <p className="text-sm text-red-500">{errors.twitter.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="instagram" className="text-xs font-medium text-muted-foreground">Instagram url</label>
                                <Input
                                    id="instagram"
                                    type="url"
                                    placeholder="https://www.instagram.com/username"
                                    {...register('instagram', urlValidation)}
                                    className={errors.instagram ? 'border-red-500' : ''}
                                />
                                {errors.instagram && (
                                    <p className="text-sm text-red-500">{errors.instagram.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="youtube" className="text-xs font-medium text-muted-foreground">Youtube url</label>
                                <Input
                                    id="youtube"
                                    type="url"
                                    placeholder="https://www.youtube.com/channel/username"
                                    {...register('youtube', urlValidation)}
                                    className={errors.youtube ? 'border-red-500' : ''}
                                />
                                {errors.youtube && (
                                    <p className="text-sm text-red-500">{errors.youtube.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="blogr" className="text-xs font-medium text-muted-foreground">Blogger url</label>
                                <Input
                                    id="blogr"
                                    type="url"
                                    placeholder="https://www.blogger.com/username"
                                    {...register('blogr', urlValidation)}
                                    className={errors.blogr ? 'border-red-500' : ''}
                                />
                                {errors.blogr && (
                                    <p className="text-sm text-red-500">{errors.blogr.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="google" className="text-xs font-medium text-muted-foreground">Google url</label>
                                <Input
                                    id="google"
                                    type="url"
                                    placeholder="https://www.google.com/business/username"
                                    {...register('google', urlValidation)}
                                    className={errors.google ? 'border-red-500' : ''}
                                />
                                {errors.google && (
                                    <p className="text-sm text-red-500">{errors.google.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="yelp" className="text-xs font-medium text-muted-foreground">Yelp url</label>
                                <Input
                                    id="yelp"
                                    type="url"
                                    placeholder="https://www.yelp.com/biz/username"
                                    {...register('yelp', urlValidation)}
                                    className={errors.yelp ? 'border-red-500' : ''}
                                />
                                {errors.yelp && (
                                    <p className="text-sm text-red-500">{errors.yelp.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="vimeo" className="text-xs font-medium text-muted-foreground">Vimeo url</label>
                                <Input
                                    id="vimeo"
                                    type="url"
                                    placeholder="https://www.vimeo.com/username"
                                    {...register('vimeo', urlValidation)}
                                    className={errors.vimeo ? 'border-red-500' : ''}
                                />
                                {errors.vimeo && (
                                    <p className="text-sm text-red-500">{errors.vimeo.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="moneyapp" className="text-xs font-medium text-muted-foreground">Moneyapp url</label>
                                <Input
                                    id="moneyapp"
                                    type="url"
                                    placeholder="https://www.moneyapp.com/username"
                                    {...register('moneyapp', urlValidation)}
                                    className={errors.moneyapp ? 'border-red-500' : ''}
                                />
                                {errors.moneyapp && (
                                    <p className="text-sm text-red-500">{errors.moneyapp.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="socialapp" className="text-xs font-medium text-muted-foreground">Socialapp url</label>
                                <Input
                                    id="socialapp"
                                    type="url"
                                    placeholder="https://www.socialapp.com/username"
                                    {...register('socialapp', urlValidation)}
                                    className={errors.socialapp ? 'border-red-500' : ''}
                                />
                                {errors.socialapp && (
                                    <p className="text-sm text-red-500">{errors.socialapp.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="customapp" className="text-xs font-medium text-muted-foreground">Customapp url</label>
                                <Input
                                    id="customapp"
                                    type="url"
                                    placeholder="https://www.customapp.com/username"
                                    {...register('customapp', urlValidation)}
                                    className={errors.customapp ? 'border-red-500' : ''}
                                />
                                {errors.customapp && (
                                    <p className="text-sm text-red-500">{errors.customapp.message as string}</p>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <p className="text-md font-medium">Newsletter Information</p>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="bbb"
                                        checked={watch('bbb')}
                                        onCheckedChange={(checked) => setValue('bbb', checked as boolean)}
                                    />
                                    <label htmlFor="bbb" className="text-sm font-medium">BBB</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="bbba"
                                        checked={watch('bbba')}
                                        onCheckedChange={(checked) => setValue('bbba', checked as boolean)}
                                    />
                                    <label htmlFor="bbba" className="text-sm font-medium">BBB-A</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="EHL"
                                        checked={watch('EHL')}
                                        onCheckedChange={(checked) => setValue('EHL', checked as boolean)}
                                    />
                                    <label htmlFor="EHL" className="text-sm font-medium">EHL</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="EHO"
                                        checked={watch('EHO')}
                                        onCheckedChange={(checked) => setValue('EHO', checked as boolean)}
                                    />
                                    <label htmlFor="EHO" className="text-sm font-medium">EHO</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="fdic"
                                        checked={watch('fdic')}
                                        onCheckedChange={(checked) => setValue('fdic', checked as boolean)}
                                    />
                                    <label htmlFor="fdic" className="text-sm font-medium">FDIC</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ncua"
                                        checked={watch('ncua')}
                                        onCheckedChange={(checked) => setValue('ncua', checked as boolean)}
                                    />
                                    <label htmlFor="ncua" className="text-sm font-medium">NCUA</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="realtor"
                                        checked={watch('realtor')}
                                        onCheckedChange={(checked) => setValue('realtor', checked as boolean)}
                                    />
                                    <label htmlFor="realtor" className="text-sm font-medium">Realtor</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hud"
                                        checked={watch('hud')}
                                        onCheckedChange={(checked) => setValue('hud', checked as boolean)}
                                    />
                                    <label htmlFor="hud" className="text-sm font-medium">HUD</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="no_rate_post"
                                        checked={watch('no_rate_post')}
                                        onCheckedChange={(checked) => setValue('no_rate_post', checked as boolean)}
                                    />
                                    <label htmlFor="no_rate_post" className="text-sm font-medium">No Rate Post</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="custom"
                                        checked={watch('custom')}
                                        onCheckedChange={(checked) => setValue('custom', checked as boolean)}
                                    />
                                    <label htmlFor="custom" className="text-sm font-medium">Custom</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="discloure" className="text-xs font-medium text-muted-foreground">Discloure</label>
                                    <Textarea
                                        id="discloure"
                                        placeholder="Enter discloure"
                                        {...register('discloure')}
                                        className={errors.discloure ? 'border-red-500' : ''}
                                        rows={3}
                                    />
                                    {errors.discloure && (
                                        <p className="text-sm text-red-500">{errors.discloure.message as string}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}

export default UpdateUserProfile;