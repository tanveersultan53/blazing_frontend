import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import type { IUserDetails } from "../UserDetails/interface";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/services/userManagementService";
import { toast } from "sonner";
import { autoFormatPhoneNumber, cleanPhoneNumber, formatCellPhone } from "@/lib/phoneFormatter";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, XIcon } from "lucide-react";

interface UpdateUserPersonalInfoProps {
    user?: IUserDetails;
    userId?: string | number;
    setIsEditMode: (value: boolean) => void;
    refetch: () => void;
}

interface PersonalInfoFormValues {
    first_name: string;
    mid: string;
    last_name: string;
    email: string;
    password: string;
    cellphone: string;
    work_phone: string;
    work_ext: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip_code: string;
    title: string;
    company: string;
    rep_name: string;
    company_id: string;
    branch_id: string;
    personal_license: string;
    industry_type: string;
    account_folder: string;
    website: string;
}

const UpdateUserPersonalInfo = ({ user, userId, setIsEditMode, refetch }: UpdateUserPersonalInfoProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = useMemo<PersonalInfoFormValues>(() => ({
        first_name: user?.first_name ?? "",
        mid: user?.mid ?? "",
        last_name: user?.last_name ?? "",
        email: user?.email ?? "",
        password: "",
        cellphone: formatCellPhone(user?.cellphone) ?? "",
        work_phone: formatCellPhone(user?.work_phone) ?? "",
        work_ext: user?.work_ext ?? "",
        address: user?.address ?? "",
        address2: user?.address2 ?? "",
        city: user?.city ?? "",
        state: user?.state ?? "",
        zip_code: user?.zip_code ?? "",
        title: user?.title ?? "",
        company: user?.company ?? "",
        rep_name: user?.rep_name ?? "",
        company_id: (user?.company_id ?? "").toString(),
        branch_id: user?.branch_id ?? "",
        personal_license: user?.personal_license ?? "",
        industry_type: user?.industry_type ?? "",
        account_folder: user?.account_folder ?? "",
        website: user?.website ?? "",
    }), [
        user?.first_name,
        user?.mid,
        user?.last_name,
        user?.email,
        user?.cellphone,
        user?.work_phone,
        user?.work_ext,
        user?.address,
        user?.address2,
        user?.city,
        user?.state,
        user?.zip_code,
        user?.title,
        user?.company,
        user?.rep_name,
        user?.company_id,
        user?.branch_id,
        user?.personal_license,
        user?.industry_type,
        user?.account_folder,
        user?.website,
    ]);

    const form = useForm<PersonalInfoFormValues>({
        defaultValues,
        mode: "onChange",
    });

    const { register, formState: { errors }, setValue, handleSubmit, reset } = form;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const { mutate: updateUserMutation } = useMutation({
        mutationFn: ({ id, payload }: { id: string | number; payload: FormData }) =>
            updateUser({ id, user: payload }),
        onSuccess: () => {
            toast.success("Personal information updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
        },
        onError: (error: any) => {
            const response = error?.response;
            if (response?.data) {
                const errorData = response.data as Record<string, string[]>;
                Object.keys(errorData).forEach((fieldName) => {
                    const fieldErrors = errorData[fieldName];
                    if (fieldErrors && fieldErrors.length > 0) {
                        form.setError(fieldName as keyof PersonalInfoFormValues, {
                            type: "server",
                            message: fieldErrors[0],
                        });
                    }
                });
            }
            toast.error("Failed to update personal information");
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: PersonalInfoFormValues) => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }

        if (!data.industry_type) {
            form.setError("industry_type", {
                type: "required",
                message: "Industry type is required",
            });
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("first_name", data.first_name);
        formData.append("mid", data.mid ?? "");
        formData.append("last_name", data.last_name);
        formData.append("cellphone", cleanPhoneNumber(data.cellphone));
        formData.append("work_phone", cleanPhoneNumber(data.work_phone));
        formData.append("work_ext", data.work_ext ?? "");
        formData.append("address", data.address ?? "");
        formData.append("address2", data.address2 ?? "");
        formData.append("city", data.city ?? "");
        formData.append("state", data.state ?? "");
        formData.append("zip_code", data.zip_code ?? "");
        formData.append("title", data.title ?? "");
        formData.append("company", data.company ?? "");
        formData.append("rep_name", data.rep_name ?? "");
        formData.append("company_id", data.company_id ?? "");
        formData.append("branch_id", data.branch_id ?? "");
        formData.append("personal_license", data.personal_license ?? "");
        formData.append("industry_type", data.industry_type ?? "");
        formData.append("account_folder", data.account_folder ?? "");
        formData.append("website", data.website ?? "");

        if (data.password) {
            formData.append("password", data.password);
        }

        updateUserMutation({ id: userId, payload: formData });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        reset(defaultValues);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-2 mb-6">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                >
                    <XIcon className="w-4 h-4" />
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                >
                    <CheckIcon className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label htmlFor="first_name" className="text-sm font-medium">
                        First Name *
                    </label>
                    <Input
                        id="first_name"
                        placeholder="Enter first name"
                        {...register("first_name", {
                            required: "First name is required",
                            minLength: { value: 2, message: "First name must be at least 2 characters" },
                        })}
                        className={errors.first_name ? "border-red-500" : ""}
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
                        placeholder="Enter middle name"
                        {...register("mid")}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="last_name" className="text-sm font-medium">
                        Last Name *
                    </label>
                    <Input
                        id="last_name"
                        placeholder="Enter last name"
                        {...register("last_name", {
                            required: "Last name is required",
                            minLength: { value: 2, message: "Last name must be at least 2 characters" },
                        })}
                        className={errors.last_name ? "border-red-500" : ""}
                    />
                    {errors.last_name && (
                        <p className="text-sm text-red-500">{errors.last_name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        disabled
                        {...register("email")}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        {...register("password")}
                        className={errors.password ? "border-red-500" : ""}
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
                        {...register("cellphone", {
                            pattern: {
                                value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                                message: "Phone number must be in format: (XXX) XXX-XXXX",
                            },
                            onChange: (e) => {
                                const formatted = autoFormatPhoneNumber(e.target.value);
                                setValue("cellphone", formatted, { shouldValidate: true });
                            },
                        })}
                        className={errors.cellphone ? "border-red-500" : ""}
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
                        {...register("work_phone", {
                            pattern: {
                                value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                                message: "Phone number must be in format: (XXX) XXX-XXXX",
                            },
                            onChange: (e) => {
                                const formatted = autoFormatPhoneNumber(e.target.value);
                                setValue("work_phone", formatted, { shouldValidate: true });
                            },
                        })}
                        className={errors.work_phone ? "border-red-500" : ""}
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
                        {...register("work_ext")}
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
                        {...register("website")}
                        className={errors.website ? "border-red-500" : ""}
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
                        {...register("address")}
                        className={errors.address ? "border-red-500" : ""}
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
                        placeholder="Enter apartment, suite, etc."
                        {...register("address2")}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">
                        City
                    </label>
                    <Input
                        id="city"
                        placeholder="Enter city"
                        {...register("city")}
                        className={errors.city ? "border-red-500" : ""}
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
                        {...register("state")}
                        className={errors.state ? "border-red-500" : ""}
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
                        placeholder="12345"
                        {...register("zip_code")}
                        className={errors.zip_code ? "border-red-500" : ""}
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
                        {...register("title")}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium">
                        Company Name
                    </label>
                    <Input
                        id="company"
                        placeholder="Enter company name"
                        {...register("company", {
                            required: "Company name is required",
                        })}
                        className={errors.company ? "border-red-500" : ""}
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
                            setValue("industry_type", value, { shouldValidate: true });
                        }}
                        value={form.watch("industry_type")}
                    >
                        <SelectTrigger className={errors.industry_type ? "border-red-500" : ""}>
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
                        {...register("rep_name")}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="company_id" className="text-sm font-medium">
                        Company ID *
                    </label>
                    <Input
                        id="company_id"
                        placeholder="Enter company ID"
                        {...register("company_id", {
                            required: "Company ID is required",
                        })}
                        className={errors.company_id ? "border-red-500" : ""}
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
                        {...register("branch_id")}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="personal_license" className="text-sm font-medium">
                        Personal License
                    </label>
                    <Input
                        id="personal_license"
                        placeholder="Enter personal license"
                        {...register("personal_license")}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="account_folder" className="text-sm font-medium">
                        Account Folder
                    </label>
                    <Input
                        id="account_folder"
                        placeholder="Enter account folder"
                        {...register("account_folder")}
                    />
                </div>
            </div>

            <Separator className="my-6" />
        </form>
    );
};

export default UpdateUserPersonalInfo;

