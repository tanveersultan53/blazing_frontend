import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import type { ISettings } from "./interface";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { XIcon } from "lucide-react";
import { CheckIcon } from "lucide-react";
import type { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/helpers/constants";
import { getSettings } from "@/services/userManagementService";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import React from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";

const Settings = () => {
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const { data, isLoading } = useQuery<AxiosResponse<ISettings>>({
        queryKey: [queryKeys.getSettings, id],
        queryFn: () => getSettings(id as string | number),
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

    const { register, formState: { errors }, watch, setValue } = form;


    const onSubmit = (formData: ISettings) => {
        setIsSubmitting(true);
    };

    // Reset form when data changes
    React.useEffect(() => {
        if (data?.data) {
            form.reset(initialValues);
        }
    }, [data?.data]);

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
    };

    return isLoading ? <Loading /> : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>You can also update social links information here by clicking the update button. </CardDescription>
                    </div>
                    {!isEditMode &&
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditMode(!isEditMode)}>
                            <PencilIcon className="w-4 h-4" />
                            Update Settings
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Name</label>
                                    <p className="text-sm font-semibold">{data?.data?.name || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">SendGrid Password</label>
                                    <p className="text-sm font-semibold">{data?.data?.password || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">No Rate Plan</label>
                                    <p className="text-sm font-semibold">{data?.data?.isNoRatePlan ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Changeable Phone Label</label>
                                    <p className="text-sm font-semibold">{data?.data?.isChangeablePhoneLabel ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">First Name In Subject</label>
                                    <p className="text-sm font-semibold">{data?.data?.isNameInSubject ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Email Report</label>
                                    <p className="text-sm font-semibold">{data?.data?.isEmailReport ? 'Yes' : 'No'}</p>
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
    )
}

export default Settings;    