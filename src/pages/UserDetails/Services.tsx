import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { IServiceSettings } from "./interface";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/helpers/constants";
import { getServiceSettings, updateServiceSettings } from "@/services/userManagementService";
import type { AxiosResponse } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Loading from "@/components/Loading";
import { toast } from "sonner";

const Services = () => {
    const { id } = useParams();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<AxiosResponse<IServiceSettings>>({
        queryKey: [queryKeys.getServiceSettings, id],
        queryFn: () => getServiceSettings(id as string | number),
    });

    const updateServiceSettingsMutation = useMutation({
        mutationFn: (serviceSettings: IServiceSettings) => updateServiceSettings({ id: id as string | number, serviceSettings }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.getServiceSettings, id] });
            setIsEditMode(false);
            setIsSubmitting(false);
            toast.success("Service settings updated successfully!");
        },
        onError: (error: any) => {
            console.error('Error updating service settings:', error);
            setIsSubmitting(false);
            toast.error(error?.response?.data?.message || "Failed to update service settings. Please try again.");
        }
    });

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(data?.data || initialValues);
    };

    const initialValues = {
        email_service: false,
        bs_service: false,
        send_post_service: false,
        send_newsletter: false,
        send_cominghome: false,
        coming_home_file: '', // later to be removed coming_home_file 
        has_coming_home: false,
        no_branding: false,
        email_service_amt: 0,
        bs_service_amt: 0,
        send_post_amt: 0,
        send_news_amt: 0,
        send_cominghome_amt: 0,
        email_service_cost: 0,
        bs_service_cost: 0,
        send_post_cost: 0,
        send_news_cost: 0,
        send_cominghome_cost: 0,
    }

    const form = useForm<IServiceSettings>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const { register, watch, setValue } = form;

    // Helper function to handle checkbox change and clear related fields
    const handleServiceCheckboxChange = (serviceName: keyof IServiceSettings, checked: boolean) => {
        setValue(serviceName, checked);

        if (!checked) {
            // Clear the charge and royalty fields when unchecked
            const chargeField = `${serviceName}_amt` as keyof IServiceSettings;
            const royaltyField = `${serviceName}_cost` as keyof IServiceSettings;
            setValue(chargeField, 0);
            setValue(royaltyField, 0);
        }
    };

    const onSubmit = (formData: IServiceSettings) => {
        // Filter out null, undefined, and empty string values
        const filteredData = Object.fromEntries(
            Object.entries(formData).filter(([_, value]) =>
                value !== null && value !== undefined && value !== ''
            )
        ) as IServiceSettings;

        setIsSubmitting(true);
        updateServiceSettingsMutation.mutate({...filteredData, coming_home_file: watch('send_cominghome') ? 'yes' : 'no'}); // later to be removed coming_home_file 
    };

    useEffect(() => {
        if (data?.data) {
            form.reset(data.data);
        }
    }, [data?.data]);

    return isLoading ? <Loading /> : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Service Setting</CardTitle>
                        <CardDescription>You can also update services information here by clicking the update button. </CardDescription>
                    </div>
                    {!isEditMode &&
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditMode(!isEditMode)}>
                            <PencilIcon className="w-4 h-4" />
                            Update Services
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
                                    <label htmlFor="email_service" className="text-xs font-medium text-muted-foreground">Email Service</label>
                                    <p className="text-sm font-medium">{data?.data?.email_service ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email_service_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                    <p className="text-sm font-medium">{data?.data?.email_service_amt || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email_service_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                    <p className="text-sm font-medium">{data?.data?.email_service_cost || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="bs_service" className="text-xs font-medium text-muted-foreground">BS Service</label>
                                    <p className="text-sm font-medium">{data?.data?.bs_service ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bs_service_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                    <p className="text-sm font-medium">{data?.data?.bs_service_amt || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bs_service_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                    <p className="text-sm font-medium">{data?.data?.bs_service_cost || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="send_post_service" className="text-xs font-medium text-muted-foreground">Send Post Service</label>
                                    <p className="text-sm font-medium">{data?.data?.send_post_service ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="send_post_service_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                    <p className="text-sm font-medium">{data?.data?.send_post_amt || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="send_post_service_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                    <p className="text-sm font-medium">{data?.data?.send_post_cost || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="send_weekly_newsletter" className="text-xs font-medium text-muted-foreground">Send Weekly Newsletter</label>
                                    <p className="text-sm font-medium">{data?.data?.send_newsletter ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="send_weekly_newsletter_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                    <p className="text-sm font-medium">{data?.data?.send_news_amt || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="send_weekly_newsletter_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                        <p className="text-sm font-medium">{data?.data?.send_news_cost || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="send_coming_home_service" className="text-xs font-medium text-muted-foreground">Send Coming Home File</label>
                                    <p className="text-sm font-medium">{data?.data?.send_cominghome ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="send_coming_home_service_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                    <p className="text-sm font-medium">{data?.data?.send_cominghome_amt || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="send_coming_home_service_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                    <p className="text-sm font-medium">{data?.data?.send_cominghome_cost || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="has_coming" className="text-xs font-medium text-muted-foreground">Has Coming</label>
                                    <p className="text-sm font-medium">{data?.data?.has_coming_home ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="no_branding" className="text-xs font-medium text-muted-foreground">No Branding</label>
                                    <p className="text-sm font-medium">{data?.data?.no_branding ? 'Enabled' : 'Disabled'}</p>
                                </div>
                            </div>
                        </div>
                    }






                    {isEditMode && <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 h-full">
                                    <Checkbox
                                        id="email_service"
                                        checked={watch('email_service')}
                                        onCheckedChange={(checked) => handleServiceCheckboxChange('email_service', checked as boolean)}
                                    />
                                    <label htmlFor="email_service" className="text-sm font-medium">Email Service</label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email_service_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                <Input
                                    id="email_service_charge"
                                    type="text"
                                    placeholder="Enter Service Charge"
                                    disabled={!watch('email_service')}
                                    {...register('email_service_amt')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email_service_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                <Input
                                    id="email_service_royality"
                                    type="text"
                                    placeholder="Enter Service Royality"
                                    disabled={!watch('email_service')}
                                    {...register('email_service_cost')}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 h-full">
                                    <Checkbox
                                        id="bs_service"
                                        checked={watch('bs_service')}
                                        onCheckedChange={(checked) => handleServiceCheckboxChange('bs_service', checked as boolean)}
                                    />
                                    <label htmlFor="bs_service" className="text-sm font-medium">BS Service</label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="bs_service_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                <Input
                                    id="bs_service_charge"
                                    type="text"
                                    placeholder="Enter Service Charge"
                                    disabled={!watch('bs_service')}
                                    {...register('bs_service_amt')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="bs_service_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                <Input
                                    id="bs_service_royality"
                                    type="text"
                                    placeholder="Enter Service Royality"
                                    disabled={!watch('bs_service')}
                                    {...register('bs_service_cost')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 h-full">
                                    <Checkbox
                                        id="send_post_service"
                                        checked={watch('send_post_service')}
                                        onCheckedChange={(checked) => handleServiceCheckboxChange('send_post_service', checked as boolean)}
                                    />
                                    <label htmlFor="send_post_service" className="text-sm font-medium">Send Post Service</label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="send_post_service_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                <Input
                                    id="send_post_service_charge"
                                    type="text"
                                    placeholder="Enter Service Charge"
                                    disabled={!watch('send_post_service')}
                                    {...register('send_post_amt')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="send_post_service_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                <Input
                                    id="send_post_service_royality"
                                    type="text"
                                    placeholder="Enter Service Royality"
                                    disabled={!watch('send_post_service')}
                                    {...register('send_post_cost')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 h-full">
                                    <Checkbox
                                        id="send_weekly_newsletter"
                                        checked={watch('send_newsletter')}
                                        onCheckedChange={(checked) => handleServiceCheckboxChange('send_newsletter', checked as boolean)}
                                    />
                                    <label htmlFor="send_weekly_newsletter" className="text-sm font-medium">Send Weekly Newsletter</label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="send_weekly_newsletter_charge" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                <Input
                                    id="send_weekly_newsletter_charge"
                                    type="text"
                                    placeholder="Enter Service Charge"
                                    disabled={!watch('send_newsletter')}
                                    {...register('send_news_amt')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="send_weekly_newsletter_royality" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                <Input
                                    id="send_weekly_newsletter_royality"
                                    type="text"
                                    placeholder="Enter Service Royality"
                                    disabled={!watch('send_newsletter')}
                                    {...register('send_news_cost')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 h-full">
                                    <Checkbox
                                        id="send_cominghome"
                                        checked={watch('send_cominghome')}
                                        onCheckedChange={(checked) => handleServiceCheckboxChange('send_cominghome', checked as boolean)}
                                    />
                                    <label htmlFor="send_cominghome" className="text-sm font-medium">Send Coming Home File</label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="send_cominghome_amt" className="text-xs font-medium text-muted-foreground">Service Charges ($)</label>
                                <Input
                                    id="send_cominghome_amt"
                                    type="text"
                                    placeholder="Enter Service Charge"
                                    disabled={!watch('send_cominghome')}
                                    {...register('send_cominghome_amt')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="send_cominghome_cost" className="text-xs font-medium text-muted-foreground">Service Royality (%)</label>
                                <Input
                                    id="send_cominghome_cost"
                                    type="text"
                                    placeholder="Enter Service Royality"
                                    disabled={!watch('send_cominghome')}
                                    {...register('send_cominghome_cost')}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="has_coming_home"
                                    checked={watch('has_coming_home')}
                                    onCheckedChange={(checked) => setValue('has_coming_home', checked as boolean)}
                                />
                                <label htmlFor="has_coming_home" className="text-sm font-medium">Has Coming</label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="no_branding"
                                    checked={watch('no_branding')}
                                    onCheckedChange={(checked) => setValue('no_branding', checked as boolean)}
                                />
                                <label htmlFor="no_branding" className="text-sm font-medium">No Branding</label>
                            </div>
                        </div>
                    </div>
                    }
                </CardContent>
            </Card>
        </form >
    )
}

export default Services;    