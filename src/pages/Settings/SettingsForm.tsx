import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
    import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import type { AxiosResponse } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/helpers/constants";
import { getEmailSettings, updateEmailSettings, getSocials, updateSocials } from "@/services/userManagementService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import type { IEmailSettings, ISocials } from "../UserDetails/interface";
import { Input } from "@/components/ui/input";

const SettingsForm = ({ userId }: { userId: string }) => {

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSocialEditMode, setIsSocialEditMode] = useState(false);
    const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);
    const [sendGridPassword, setSendGridPassword] = useState("");

    const { data, isLoading, refetch } = useQuery<AxiosResponse<IEmailSettings>>({
        queryKey: [queryKeys.getEmailSettings, userId],
        queryFn: () => getEmailSettings(userId as string | number),
    });

    const { data: socialsData, isLoading: isSocialsLoading, refetch: refetchSocials } = useQuery<AxiosResponse<ISocials>>({
        queryKey: [queryKeys.getSocials, userId],
        queryFn: () => getSocials(userId as string | number),
    });

    const initialValues = {
        birthday: data?.data?.birthday || false,
        spouse_birthday: data?.data?.spouse_birthday || false,
        birthday_status: data?.data?.birthday_status || 'send',
        whobday: data?.data?.whobday || 'both',
        ecard_status: data?.data?.ecard_status || 'send',
        whoecards: data?.data?.whoecards || 'both',
        newyears: data?.data?.newyears || false,
        stpatrick: data?.data?.stpatrick || false,
        july4: data?.data?.july4 || false,
        halloween: data?.data?.halloween || false,
        summer: data?.data?.summer || false,
        thanksgiving: data?.data?.thanksgiving || false,
        veteransday: data?.data?.veteransday || false,
        spring: data?.data?.spring || false,
        laborday: data?.data?.laborday || false,
        december: data?.data?.december || false,
        fall: data?.data?.fall || false,
        valentine: data?.data?.valentine || false,
        memorialday: data?.data?.memorialday || false,
        newsletter_status: data?.data?.newsletter_status || 'send',
        newsletter_default: data?.data?.newsletter_default || 'long_version',
        frequency: data?.data?.frequency || 'monthly',
        newsletter_date: data?.data?.newsletter_date || format(new Date(), 'yyyy-MM-dd'),
        newsletter_status2: data?.data?.newsletter_status2 || 'send',
        newsletter_default2: data?.data?.newsletter_default2 || 'long_version',
        frequency2: data?.data?.frequency2 || 'monthly',
        newsletter_date2: data?.data?.newsletter_date2 || format(new Date(), 'yyyy-MM-dd'),
        autooptionscol: data?.data?.autooptionscol,
        active_deactive_all_settings: data?.data?.active_deactive_all_settings || false,
        no_rate_post: data?.data?.no_rate_post || false,
        no_emal_report: data?.data?.no_emal_report || false,
        use_first_name: data?.data?.use_first_name || false,
        change_phone_label: data?.data?.change_phone_label || false,
    }

    const form = useForm<IEmailSettings>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const socialForm = useForm<ISocials>({
        defaultValues: {
            id: socialsData?.data?.id || 0,
            facebook: socialsData?.data?.facebook || '',
            linkedin: socialsData?.data?.linkedin || '',
            twitter: socialsData?.data?.twitter || '',
            instagram: socialsData?.data?.instagram || '',
            youtube: socialsData?.data?.youtube || '',
            blogr: socialsData?.data?.blogr || '',
            google: socialsData?.data?.google || '',
            yelp: socialsData?.data?.yelp || '',
            vimeo: socialsData?.data?.vimeo || '',
        },
        mode: 'onChange'
    });

    // Validation function to ensure mandatory fields are not null
    const validateMandatoryFields = (data: IEmailSettings) => {
        const mandatoryFields = [
            'birthday_status', 'whobday', 'ecard_status', 'whoecards',
            'newsletter_status', 'newsletter_default', 'frequency',
            'newsletter_status2', 'newsletter_default2', 'frequency2'
        ];

        for (const field of mandatoryFields) {
            if (data[field as keyof IEmailSettings] === null || data[field as keyof IEmailSettings] === undefined) {
                toast.error(`${field} is required and cannot be null`);
                return false;
            }
        }
        return true;
    };

    const { watch, setValue } = form;

    const { mutate: updateEmailSettingsMutation } = useMutation({
        mutationFn: updateEmailSettings,
        onSuccess: () => {
            toast.success("Email settings updated successfully");
            setIsEditMode(false);
            setIsSubmitting(false);
            refetch();
        },
        onError: () => {
            setIsSubmitting(false);
        }
    });

    const { mutate: updateSocialsMutation } = useMutation({
        mutationFn: updateSocials,
        onSuccess: () => {
            toast.success("Social links updated successfully");
            setIsSocialEditMode(false);
            setIsSocialSubmitting(false);
            refetchSocials();
        },
        onError: () => {
            toast.error("Failed to update social links");
            setIsSocialSubmitting(false);
        }
    });

    const onSubmit = (formData: IEmailSettings) => {
        // Validate mandatory fields before submission
        if (!validateMandatoryFields(formData)) {
            setIsSubmitting(false);
            return;
        }
        
        setIsSubmitting(true);
        updateEmailSettingsMutation({ id: userId as string | number, emailSettings: formData });
    };

    React.useEffect(() => {
        if (data?.data) {
            form.reset(initialValues);
        }
    }, [data?.data]);

    React.useEffect(() => {
        if (socialsData?.data) {
            socialForm.reset({
                id: socialsData.data.id,
                facebook: socialsData.data.facebook || '',
                linkedin: socialsData.data.linkedin || '',
                twitter: socialsData.data.twitter || '',
                instagram: socialsData.data.instagram || '',
                youtube: socialsData.data.youtube || '',
                blogr: socialsData.data.blogr || '',
                google: socialsData.data.google || '',
                yelp: socialsData.data.yelp || '',
                vimeo: socialsData.data.vimeo || '',
            });
        }
    }, [socialsData?.data]);

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
    };

    const handleSocialCancel = () => {
        setIsSocialEditMode(false);
        if (socialsData?.data) {
            socialForm.reset({
                id: socialsData.data.id,
                facebook: socialsData.data.facebook || '',
                linkedin: socialsData.data.linkedin || '',
                twitter: socialsData.data.twitter || '',
                instagram: socialsData.data.instagram || '',
                youtube: socialsData.data.youtube || '',
                blogr: socialsData.data.blogr || '',
                google: socialsData.data.google || '',
                yelp: socialsData.data.yelp || '',
                vimeo: socialsData.data.vimeo || '',
            });
        }
    };

    const onSocialSubmit = (formData: ISocials) => {
        setIsSocialSubmitting(true);
        updateSocialsMutation({ id: userId as string | number, socials: formData });
    };

    // Define holiday fields for better maintainability
    const holidayFields = [
        'newyears', 'stpatrick', 'july4', 'halloween', 'summer',
        'thanksgiving', 'veteransday', 'spring', 'laborday',
        'december', 'fall', 'valentine', 'memorialday'
    ];

    // Define all checkbox fields that should be affected by autooptionscol
    const allCheckboxFields = [
        'birthday', 'spouse_birthday', ...holidayFields
    ];


    // Handler for setting all options when autooptionscol is checked
    const handleSetAllOptions = () => {
        // Set all checkboxes to true
        allCheckboxFields.forEach(field => {
            setValue(field as keyof IEmailSettings, true);
        });

        // Set default values for all dropdowns
        setValue('birthday_status', 'send');
        setValue('whobday', 'both');
        setValue('ecard_status', 'send');
        setValue('whoecards', 'both');
        setValue('newsletter_status', 'send');
        setValue('newsletter_default', 'long_version');
        setValue('frequency', 'monthly');
        setValue('newsletter_date', format(new Date(), 'yyyy-MM-dd'));
        setValue('newsletter_status2', 'send');
        setValue('newsletter_default2', 'long_version');
        setValue('frequency2', 'monthly');
        setValue('newsletter_date2', format(new Date(), 'yyyy-MM-dd'));
    };

    // Handler for resetting all options when autooptionscol is unchecked
    const handleResetAllOptions = () => {
        // Set all checkboxes to false
        allCheckboxFields.forEach(field => {
            setValue(field as keyof IEmailSettings, false);
        });

        // Reset all dropdown values to default values instead of null
        setValue('birthday_status', 'send');
        setValue('whobday', 'both');
        setValue('ecard_status', 'send');
        setValue('whoecards', 'both');
        setValue('newsletter_status', 'send');
        setValue('newsletter_default', 'long_version');
        setValue('frequency', 'monthly');
        setValue('newsletter_date', format(new Date(), 'yyyy-MM-dd'));
        setValue('newsletter_status2', 'send');
        setValue('newsletter_default2', 'long_version');
        setValue('frequency2', 'monthly');
        setValue('newsletter_date2', format(new Date(), 'yyyy-MM-dd'));
    };

    // Optimized handler for setting all holiday options
    const handleSetAllHolidays = () => {
        // Set all holiday checkboxes to true
        holidayFields.forEach(field => {
            setValue(field as keyof IEmailSettings, true);
        });
        // Set default values for status and recipient
        setValue('ecard_status', 'send');
        setValue('whoecards', 'both');
    };

    // Optimized handler for clearing all holiday options
    const handleSetNoneHolidays = () => {
        // Set all holiday checkboxes to false
        holidayFields.forEach(field => {
            setValue(field as keyof IEmailSettings, false);
        });
        // Reset status and recipient to default values
        setValue('ecard_status', 'send');
        setValue('whoecards', 'both');
    };


    return (isLoading || isSocialsLoading) ? <Loading /> : (
        <>
        <form onSubmit={form.handleSubmit(onSubmit)}> <Card className="mb-12">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>You can also update email settings here by clicking the update button. </CardDescription>
                </div>
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
                {!isEditMode &&
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditMode(!isEditMode)}>
                        <PencilIcon className="w-4 h-4" />
                        Update Email Settings
                    </Button>
                }
            </CardHeader>
            <CardContent>
                {!isEditMode &&
                    <div className="space-y-6">
                        <label className="text-sm font-medium">Birthday Options</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Main Birthday</label>
                                <p className="text-sm font-semibold">{data?.data?.birthday ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Spouse Birthday</label>
                                <p className="text-sm font-semibold">{data?.data?.spouse_birthday ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Birthday Status</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.birthday_status}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Recipient</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.whobday}</p>
                            </div>
                        </div>
                        <Separator />
                        <label className="text-sm font-medium">Holiday Options</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">New Years</label>
                                <p className="text-sm font-semibold">{data?.data?.newyears ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Summer Day</label>
                                <p className="text-sm font-semibold">{data?.data?.summer ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Labor Day</label>
                                <p className="text-sm font-semibold">{data?.data?.laborday ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Memorial Day</label>
                                <p className="text-sm font-semibold">{data?.data?.memorialday ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">St Patrick's Day</label>
                                <p className="text-sm font-semibold">{data?.data?.stpatrick ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Halloween</label>
                                <p className="text-sm font-semibold">{data?.data?.halloween ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Thanksgiving</label>
                                <p className="text-sm font-semibold">{data?.data?.thanksgiving ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Veterans Day</label>
                                <p className="text-sm font-semibold">{data?.data?.veteransday ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Spring</label>
                                <p className="text-sm font-semibold">{data?.data?.spring ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">December Holidays</label>
                                <p className="text-sm font-semibold">{data?.data?.december ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Fall Holidays</label>
                                <p className="text-sm font-semibold">{data?.data?.fall ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Valentine's Day</label>
                                <p className="text-sm font-semibold">{data?.data?.valentine ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">July 4th</label>
                                <p className="text-sm font-semibold">{data?.data?.july4 ? 'Send' : "Don't Send"}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">ECard Status</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.ecard_status}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Recipient</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.whoecards}</p>
                            </div>
                        </div>
                        <Separator />
                        <label className="text-sm font-medium">Newsletter Options</label>
                        <p className="text-sm font-medium mt-4 mb-2">Contacts</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Newsletter Status</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.newsletter_status}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Newsletter Version</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.newsletter_default}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Frequency</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.frequency}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Newsletter Date</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.newsletter_date}</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium mt-4 mb-2">Contacts</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Newsletter Status</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.newsletter_status2}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Newsletter Version</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.newsletter_default2}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Frequency</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.frequency2}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="active_deactive_all_settings" className="text-xs font-medium text-muted-foreground">Newsletter Date</label>
                                <p className="text-sm font-semibold capitalize">{data?.data?.newsletter_date2}</p>
                            </div>
                        </div>
                        <Separator />
                        <label className="text-sm font-medium">Additional Settings</label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div className="space-y-2">
                                <label htmlFor="no_rate_post" className="text-xs font-medium text-muted-foreground">No Rate Plan</label>
                                <p className="text-sm font-semibold">{data?.data?.no_rate_post ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="no_emal_report" className="text-xs font-medium text-muted-foreground">Email Report</label>
                                <p className="text-sm font-semibold">{data?.data?.no_emal_report ? 'No' : 'Yes'}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="use_first_name" className="text-xs font-medium text-muted-foreground">First Name In Subject</label>
                                <p className="text-sm font-semibold">{data?.data?.use_first_name ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="change_phone_label" className="text-xs font-medium text-muted-foreground">Changeable Phone Label</label>
                                <p className="text-sm font-semibold">{data?.data?.change_phone_label ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>
                }
                {isEditMode &&
                    <>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="active_deactive_all_settings"
                                    checked={watch('active_deactive_all_settings')}
                                    onCheckedChange={(checked) => {
                                        setValue('active_deactive_all_settings', checked as boolean);
                                        if (checked) {
                                            handleSetAllOptions();
                                        } else {
                                            handleResetAllOptions();
                                        }
                                    }}
                                />
                                <label htmlFor="active_deactive_all_settings" className="text-sm font-medium">Active/Deactive all Settings</label>
                            </div>
                            <Separator />
                            <label className="text-sm font-medium">Birthday Options</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2 mt-6">
                                    <Checkbox
                                        id="birthday"
                                        checked={watch('birthday')}
                                        onCheckedChange={(checked) => setValue('birthday', checked as boolean)}
                                    />
                                    <label htmlFor="birthday" className="text-sm font-medium">Main Birthday</label>
                                </div>
                                <div className="flex items-center space-x-2 mt-6">
                                    <Checkbox
                                        id="spouse_birthday"
                                        checked={watch('spouse_birthday')}
                                        onCheckedChange={(checked) => setValue('spouse_birthday', checked as boolean)}
                                    />
                                    <label htmlFor="spouse_birthday" className="text-sm font-medium">Spouse Birthday</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Birthday Status</label>
                                    <Select
                                        value={watch('birthday_status') || ''}
                                        onValueChange={(value) => setValue('birthday_status', value as 'send' | 'dont_send')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select birthday status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="send">Send</SelectItem>
                                            <SelectItem value="dont_send">Don't Send</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Recipient</label>
                                    <Select
                                        value={watch('whobday') || ''}
                                        onValueChange={(value) => setValue('whobday', value as 'contacts_only' | 'partners_only' | 'both')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contacts_only">Contacts Only</SelectItem>
                                            <SelectItem value="partners_only">Partners Only</SelectItem>
                                            <SelectItem value="both">Both</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Holiday Options</label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSetAllHolidays}
                                    >
                                        Set All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSetNoneHolidays}
                                    >
                                        Set None
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="newyears"
                                        checked={watch('newyears')}
                                        onCheckedChange={(checked) => setValue('newyears', checked as boolean)}
                                    />
                                    <label htmlFor="newyears" className="text-sm font-medium">New Years</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id='summer'
                                        checked={watch('summer')}
                                        onCheckedChange={(checked) => setValue('summer', checked as boolean)}
                                    />
                                    <label htmlFor="summer" className="text-sm font-medium">Summer Day</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="laborday"
                                        checked={watch('laborday')}
                                        onCheckedChange={(checked) => setValue('laborday', checked as boolean)}
                                    />
                                    <label htmlFor="laborday" className="text-sm font-medium">Labor Day</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="memorialday"
                                        checked={watch('memorialday')}
                                        onCheckedChange={(checked) => setValue('memorialday', checked as boolean)}
                                    />
                                    <label htmlFor="memorialday" className="text-sm font-medium">Memorial Day</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="stpatrick"
                                        checked={watch('stpatrick')}
                                        onCheckedChange={(checked) => setValue('stpatrick', checked as boolean)}
                                    />
                                    <label htmlFor="stpatrick" className="text-sm font-medium">St Patrick's Day</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="halloween"
                                        checked={watch('halloween')}
                                        onCheckedChange={(checked) => setValue('halloween', checked as boolean)}
                                    />
                                    <label htmlFor="halloween" className="text-sm font-medium">Halloween</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="thanksgiving"
                                        checked={watch('thanksgiving')}
                                        onCheckedChange={(checked) => setValue('thanksgiving', checked as boolean)}
                                    />
                                    <label htmlFor="thanksgiving" className="text-sm font-medium">Thanksgiving</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="veteransday"
                                        checked={watch('veteransday')}
                                        onCheckedChange={(checked) => setValue('veteransday', checked as boolean)}
                                    />
                                    <label htmlFor="veteransday" className="text-sm font-medium">Veterans Day</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="spring"
                                        checked={watch('spring')}
                                        onCheckedChange={(checked) => setValue('spring', checked as boolean)}
                                    />
                                    <label htmlFor="spring" className="text-sm font-medium">Spring</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="december"
                                        checked={watch('december')}
                                        onCheckedChange={(checked) => setValue('december', checked as boolean)}
                                    />
                                    <label htmlFor="december" className="text-sm font-medium">December Holidays</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="fall"
                                        checked={watch('fall')}
                                        onCheckedChange={(checked) => setValue('fall', checked as boolean)}
                                    />
                                    <label htmlFor="fall" className="text-sm font-medium">Fall Holidays</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="valentine"
                                        checked={watch('valentine')}
                                        onCheckedChange={(checked) => setValue('valentine', checked as boolean)}
                                    />
                                    <label htmlFor="valentine" className="text-sm font-medium">Valentine's Day</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="july4"
                                        checked={watch('july4')}
                                        onCheckedChange={(checked) => setValue('july4', checked as boolean)}
                                    />
                                    <label htmlFor="july4" className="text-sm font-medium">July 4th</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">ECard Status</label>
                                    <Select
                                        value={watch('ecard_status') || ''}
                                        onValueChange={(value) => setValue('ecard_status', value as 'send' | 'dont_send')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select ECard status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="send">Send</SelectItem>
                                            <SelectItem value="dont_send">Don't Send</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Recipient</label>
                                    <Select
                                        value={watch('whoecards') || ''}
                                        onValueChange={(value) => setValue('whoecards', value as 'contacts_only' | 'partners_only' | 'both')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contacts_only">Contacts Only</SelectItem>
                                            <SelectItem value="partners_only">Partners Only</SelectItem>
                                            <SelectItem value="both">Both</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Separator />
                            <label className="text-sm font-medium">Newsletter Options</label>
                            <p className="text-sm font-medium mt-4 mb-2">Contacts</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Newsletter Status</label>
                                    <Select
                                        value={watch('newsletter_status') || ''}
                                        onValueChange={(value) => setValue('newsletter_status', value as 'send' | 'dont_send')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Newsletter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="send">Send</SelectItem>
                                            <SelectItem value="dont_send">Don't Send</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Newsletter Version</label>
                                    <Select
                                        value={watch('newsletter_default') || ''}
                                        onValueChange={(value) => setValue('newsletter_default', value as 'long_version' | 'short_version' | 'none')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Newsletter version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="long_version">Long Version</SelectItem>
                                            <SelectItem value="short_version">Short Version</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                                    <Select
                                        value={watch('frequency') || ''}
                                        onValueChange={(value) => setValue('frequency', value as 'weekly' | 'every_2_weeks' | 'monthly' | 'quarterly' | 'none')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="every_2_weeks">Every 2 Weeks</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Newsletter Date</label>
                                    <div className="w-full">
                                        <DatePicker
                                            value={watch('newsletter_date') ? new Date(watch('newsletter_date')!) : undefined}
                                            onChange={(date: Date | undefined) => setValue('newsletter_date', date ? format(date, 'yyyy-MM-dd') : null)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm font-medium mt-6 mb-2">Parents</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Newsletter Status</label>
                                    <Select
                                        value={watch('newsletter_status2') || ''}
                                        onValueChange={(value) => setValue('newsletter_status2', value as 'send' | 'dont_send')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Newsletter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="send">Send</SelectItem>
                                            <SelectItem value="dont_send">Don't Send</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Newsletter Version</label>
                                    <Select
                                        value={watch('newsletter_default2') || ''}
                                        onValueChange={(value) => setValue('newsletter_default2', value as 'long_version' | 'short_version' | 'none')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Newsletter version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="long_version">Long Version</SelectItem>
                                            <SelectItem value="short_version">Short Version</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                                    <Select
                                        value={watch('frequency2') || ''}
                                        onValueChange={(value) => setValue('frequency2', value as 'weekly' | 'every_2_weeks' | 'monthly' | 'quarterly' | 'none')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="every_2_weeks">Every 2 Weeks</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Newsletter Date</label>
                                    <div className="w-full">
                                        <DatePicker
                                            value={watch('newsletter_date2') ? new Date(watch('newsletter_date2')!) : undefined}
                                            onChange={(date: Date | undefined) => setValue('newsletter_date2', date ? format(date, 'yyyy-MM-dd') : null)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <label className="text-sm font-medium">Additional Settings</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="no_rate_post"
                                        checked={watch('no_rate_post')}
                                        onCheckedChange={(checked) => setValue('no_rate_post', checked as boolean)}
                                    />
                                    <label htmlFor="no_rate_post" className="text-sm font-medium">No Rate Plan</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="no_emal_report"
                                        checked={watch('no_emal_report')}
                                        onCheckedChange={(checked) => setValue('no_emal_report', checked as boolean)}
                                    />
                                    <label htmlFor="no_emal_report" className="text-sm font-medium">Email Report</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="use_first_name"
                                        checked={watch('use_first_name')}
                                        onCheckedChange={(checked) => setValue('use_first_name', checked as boolean)}
                                    />
                                    <label htmlFor="use_first_name" className="text-sm font-medium">First Name In Subject</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="change_phone_label"
                                        checked={watch('change_phone_label')}
                                        onCheckedChange={(checked) => setValue('change_phone_label', checked as boolean)}
                                    />
                                    <label htmlFor="change_phone_label" className="text-sm font-medium">Changeable Phone Label</label>
                                </div>
                            </div>
                        </div>
                    </>
                }
            </CardContent>
        </Card>
        </form>

        {/* Social Links Card */}
        <form onSubmit={socialForm.handleSubmit(onSocialSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Social Links & SendGrid Settings</CardTitle>
                        <CardDescription>You can also update social links information and SendGrid password here by clicking the update button.</CardDescription>
                    </div>
                    {isSocialEditMode &&
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={handleSocialCancel} disabled={isSocialSubmitting}>
                                <XIcon className="w-4 h-4" />
                                Cancel
                            </Button>
                            <Button variant="default" size="sm" className="flex items-center gap-2" disabled={isSocialSubmitting} type="submit">
                                <CheckIcon className="w-4 h-4" />
                                {isSocialSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    }
                    {!isSocialEditMode &&
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsSocialEditMode(!isSocialEditMode)}>
                            <PencilIcon className="w-4 h-4" />
                            Update Settings
                        </Button>
                    }
                </CardHeader>
                <CardContent>
                    {!isSocialEditMode &&
                        <div className="space-y-6">
                            <label className="text-sm font-medium">Social Links</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Facebook</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.facebook || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">LinkedIn</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.linkedin || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Twitter</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.twitter || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Instagram</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.instagram || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">YouTube</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.youtube || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Blog</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.blogr || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Google</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.google || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Yelp</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.yelp || 'Not set'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Vimeo</label>
                                    <p className="text-sm font-semibold">{socialsData?.data?.vimeo || 'Not set'}</p>
                                </div>
                            </div>
                            <Separator />
                            <label className="text-sm font-medium">SendGrid Settings</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">SendGrid Password</label>
                                    <p className="text-sm font-semibold">{sendGridPassword ? '••••••••' : 'Not set'}</p>
                                </div>
                            </div>
                        </div>
                    }
                    {isSocialEditMode &&
                        <div className="space-y-6">
                            <label className="text-sm font-medium">Social Links</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="facebook" className="text-xs font-medium text-muted-foreground">Facebook</label>
                                    <Input
                                        id="facebook"
                                        placeholder="https://facebook.com/..."
                                        {...socialForm.register('facebook')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="linkedin" className="text-xs font-medium text-muted-foreground">LinkedIn</label>
                                    <Input
                                        id="linkedin"
                                        placeholder="https://linkedin.com/in/..."
                                        {...socialForm.register('linkedin')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="twitter" className="text-xs font-medium text-muted-foreground">Twitter</label>
                                    <Input
                                        id="twitter"
                                        placeholder="https://twitter.com/..."
                                        {...socialForm.register('twitter')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="instagram" className="text-xs font-medium text-muted-foreground">Instagram</label>
                                    <Input
                                        id="instagram"
                                        placeholder="https://instagram.com/..."
                                        {...socialForm.register('instagram')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="youtube" className="text-xs font-medium text-muted-foreground">YouTube</label>
                                    <Input
                                        id="youtube"
                                        placeholder="https://youtube.com/..."
                                        {...socialForm.register('youtube')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="blogr" className="text-xs font-medium text-muted-foreground">Blog</label>
                                    <Input
                                        id="blogr"
                                        placeholder="https://yourblog.com..."
                                        {...socialForm.register('blogr')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="google" className="text-xs font-medium text-muted-foreground">Google</label>
                                    <Input
                                        id="google"
                                        placeholder="https://google.com/..."
                                        {...socialForm.register('google')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="yelp" className="text-xs font-medium text-muted-foreground">Yelp</label>
                                    <Input
                                        id="yelp"
                                        placeholder="https://yelp.com/..."
                                        {...socialForm.register('yelp')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="vimeo" className="text-xs font-medium text-muted-foreground">Vimeo</label>
                                    <Input
                                        id="vimeo"
                                        placeholder="https://vimeo.com/..."
                                        {...socialForm.register('vimeo')}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <label className="text-sm font-medium">SendGrid Settings</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="sendgrid_password" className="text-xs font-medium text-muted-foreground">SendGrid Password</label>
                                    <Input
                                        id="sendgrid_password"
                                        type="password"
                                        placeholder="Enter SendGrid password"
                                        value={sendGridPassword}
                                        onChange={(e) => setSendGridPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                </CardContent>
            </Card>
        </form>
        </>
    )
}

export default SettingsForm;    