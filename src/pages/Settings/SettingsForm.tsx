import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import type { AxiosResponse } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/helpers/constants";
import { getSettings, updateSettings } from "@/services/userManagementService";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import React from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { ISettings } from "../UserDetails/interface";

interface SettingsFormProps {
    userId: number | string;
    isEditMode: boolean;
    onSaveComplete: () => void;
    onSaveError: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
    userId,
    isEditMode,
    onSaveComplete,
    onSaveError
}) => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<AxiosResponse<ISettings>>({
        queryKey: [queryKeys.getSettings, userId],
        queryFn: () => getSettings(userId as string | number),
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (settings: ISettings) => updateSettings({ id: userId, settings }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.getSettings, userId] });
            onSaveComplete();
            toast.success("Settings updated successfully!");
        },
        onError: (error: any) => {
            console.error('Error updating settings:', error);
            onSaveError();
            toast.error(error?.response?.data?.message || "Failed to update settings. Please try again.");
        }
    });

    const initialValues = {
        name: '',
        password: '',
        isNoRatePlan: false,
        isChangeablePhoneLabel: false,
        isNameInSubject: false,
        isEmailReport: false,
    };

    const form = useForm<ISettings>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const { register, formState: { errors }, watch, setValue, handleSubmit } = form;

    const onSubmit = (formData: ISettings) => {
        // Map form field names to API field names and filter out null/undefined/empty values
        const apiPayload = {
            name: formData.name || null,
            sendgrid_password: formData.password || null,
            no_rate_post: formData.isNoRatePlan || null,
            change_phone_label: formData.isChangeablePhoneLabel || null,
            use_first_name: formData.isNameInSubject || null,
            no_emal_report: formData.isEmailReport || null,
        };

        // Filter out null values
        const filteredData = Object.fromEntries(
            Object.entries(apiPayload).filter(([_, value]) =>
                value !== null && value !== undefined && value !== ''
            )
        );

        updateSettingsMutation.mutate(filteredData as any);
    };


    return isLoading ? <Loading /> : (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>You can also update social links information here by clicking the update button.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!isEditMode &&
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-medium text-muted-foreground">Name</label>
                                    <p className="text-sm font-semibold">{data?.data?.name || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="sendgrid_password" className="text-xs font-medium text-muted-foreground">SendGrid Password</label>
                                    <p className="text-sm font-semibold">{data?.data?.sendgrid_password || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="no_rate_post" className="text-xs font-medium text-muted-foreground">No Rate Plan</label>
                                    <p className="text-sm font-semibold">{data?.data?.no_rate_post ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="change_phone_label" className="text-xs font-medium text-muted-foreground">Changeable Phone Label</label>
                                    <p className="text-sm font-semibold">{data?.data?.change_phone_label ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="use_first_name" className="text-xs font-medium text-muted-foreground">First Name In Subject</label>
                                    <p className="text-sm font-semibold">{data?.data?.use_first_name ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="no_emal_report" className="text-xs font-medium text-muted-foreground">Email Report</label>
                                    <p className="text-sm font-semibold">{data?.data?.no_emal_report ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        isEditMode &&
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-medium text-muted-foreground">Name</label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter Name"
                                        {...register('name')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                                        Password *
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        placeholder="Enter password (min 8 characters)"
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                        })}
                                        error={!!errors.password}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isNoRatePlan"
                                            checked={watch('isNoRatePlan')}
                                            onCheckedChange={(checked) => setValue('isNoRatePlan', checked as boolean)}
                                        />
                                        <label htmlFor="isNoRatePlan" className="text-sm font-medium">No Rate Plan</label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isChangeablePhoneLabel"
                                            checked={watch('isChangeablePhoneLabel')}
                                            onCheckedChange={(checked) => setValue('isChangeablePhoneLabel', checked as boolean)}
                                        />
                                        <label htmlFor="isChangeablePhoneLabel" className="text-sm font-medium">Changeable Phone Label</label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isNameInSubject"
                                            checked={watch('isNameInSubject')}
                                            onCheckedChange={(checked) => setValue('isNameInSubject', checked as boolean)}
                                        />
                                        <label htmlFor="isNameInSubject" className="text-sm font-medium">First Name In Subject</label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isEmailReport"
                                            checked={watch('isEmailReport')}
                                            onCheckedChange={(checked) => setValue('isEmailReport', checked as boolean)}
                                        />
                                        <label htmlFor="isEmailReport" className="text-sm font-medium">Email Report</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </CardContent>
            </Card>
        </form>
    );
};

export default SettingsForm;
