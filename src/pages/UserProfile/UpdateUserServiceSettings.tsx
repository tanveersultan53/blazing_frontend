import { useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { IServiceSettings } from "../UserDetails/interface";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, Upload, Trash2 } from "lucide-react";
import { updateServiceSettings } from "@/services/userManagementService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateUserServiceSettingsProps {
    userId?: string | number;
    serviceSettings?: IServiceSettings;
    setIsEditMode: (value: boolean) => void;
    refetch: () => void;
}

const initialValues: IServiceSettings = {
    email_service: false,
    bs_service: false,
    send_post_service: false,
    send_newsletter: false,
    send_cominghome: false,
    coming_home_file: "",
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
};

const UpdateUserServiceSettings = ({
    userId,
    serviceSettings,
    setIsEditMode,
    refetch,
}: UpdateUserServiceSettingsProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comingHomeFile, setComingHomeFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultValues = useMemo(
        () => ({
            ...initialValues,
            ...serviceSettings,
        }),
        [serviceSettings],
    );

    const form = useForm<IServiceSettings>({
        defaultValues,
        mode: "onChange",
    });

    const { register, watch, reset, setValue } = form;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const handleServiceCheckboxChange = (
        serviceName: keyof IServiceSettings,
        checked: boolean,
    ) => {
        setValue(serviceName, checked);

        if (!checked) {
            const chargeField = `${serviceName}_amt` as keyof IServiceSettings;
            const royaltyField = `${serviceName}_cost` as keyof IServiceSettings;
            if (chargeField in defaultValues) setValue(chargeField, 0 as any);
            if (royaltyField in defaultValues) setValue(royaltyField, 0 as any);
        }
    };

    const { mutate: updateServiceSettingsMutation } = useMutation({
        mutationFn: (payload: IServiceSettings) =>
            updateServiceSettings({
                id: userId as string | number,
                serviceSettings: payload,
            }),
        onSuccess: () => {
            toast.success("Service settings updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
            setComingHomeFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        onError: (error: any) => {
            console.error("Error updating service settings:", error);
            toast.error(
                error?.response?.data?.message ??
                    "Failed to update service settings. Please try again.",
            );
            setIsSubmitting(false);
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type (only HTML files)
            if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
                toast.error('Please upload an HTML file');
                return;
            }
            setComingHomeFile(file);
            toast.success('File selected: ' + file.name);
        }
    };

    const handleClearFile = () => {
        setComingHomeFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Clear the coming_home_file field
        setValue('coming_home_file', '');
        toast.success('File cleared');
    };

    const onSubmit = (data: IServiceSettings) => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }
        setIsSubmitting(true);
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(
                ([, value]) => value !== null && value !== undefined && value !== "",
            ),
        ) as IServiceSettings;

        // If there's a file to upload, use FormData
        if (comingHomeFile) {
            const formDataWithFile = new FormData();

            // Append all the service settings
            Object.entries(filteredData).forEach(([key, value]) => {
                formDataWithFile.append(key, String(value));
            });

            // Append the file
            formDataWithFile.append('coming_home_file', comingHomeFile);

            updateServiceSettingsMutation(formDataWithFile as any);
        } else {
            updateServiceSettingsMutation({
                ...filteredData,
                coming_home_file: filteredData.send_cominghome ? "yes" : "no",
            });
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        reset(defaultValues);
        setComingHomeFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2">
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

            <ServiceSettingRow
                label="Email Service"
                enabled={watch("email_service")}
                onCheckedChange={(checked) =>
                    handleServiceCheckboxChange("email_service", checked as boolean)
                }
                chargeField={
                    <Input
                        id="email_service_amt"
                        type="number"
                        placeholder="Enter service charge"
                        disabled={!watch("email_service")}
                        {...register("email_service_amt", { valueAsNumber: true })}
                    />
                }
                royaltyField={
                    <Input
                        id="email_service_cost"
                        type="number"
                        placeholder="Enter service royalty"
                        disabled={!watch("email_service")}
                        {...register("email_service_cost", { valueAsNumber: true })}
                    />
                }
            />

            <ServiceSettingRow
                label="Blazing Social Service"
                enabled={watch("bs_service")}
                onCheckedChange={(checked) =>
                    handleServiceCheckboxChange("bs_service", checked as boolean)
                }
                chargeField={
                    <Input
                        id="bs_service_amt"
                        type="number"
                        placeholder="Enter service charge"
                        disabled={!watch("bs_service")}
                        {...register("bs_service_amt", { valueAsNumber: true })}
                    />
                }
                royaltyField={
                    <Input
                        id="bs_service_cost"
                        type="number"
                        placeholder="Enter service royalty"
                        disabled={!watch("bs_service")}
                        {...register("bs_service_cost", { valueAsNumber: true })}
                    />
                }
            />

            <ServiceSettingRow
                label="Send Post Service"
                enabled={watch("send_post_service")}
                onCheckedChange={(checked) =>
                    handleServiceCheckboxChange("send_post_service", checked as boolean)
                }
                chargeField={
                    <Input
                        id="send_post_amt"
                        type="number"
                        placeholder="Enter service charge"
                        disabled={!watch("send_post_service")}
                        {...register("send_post_amt", { valueAsNumber: true })}
                    />
                }
                royaltyField={
                    <Input
                        id="send_post_cost"
                        type="number"
                        placeholder="Enter service royalty"
                        disabled={!watch("send_post_service")}
                        {...register("send_post_cost", { valueAsNumber: true })}
                    />
                }
            />

            <ServiceSettingRow
                label="Send Weekly Newsletter"
                enabled={watch("send_newsletter")}
                onCheckedChange={(checked) =>
                    handleServiceCheckboxChange("send_newsletter", checked as boolean)
                }
                chargeField={
                    <Input
                        id="send_news_amt"
                        type="number"
                        placeholder="Enter service charge"
                        disabled={!watch("send_newsletter")}
                        {...register("send_news_amt", { valueAsNumber: true })}
                    />
                }
                royaltyField={
                    <Input
                        id="send_news_cost"
                        type="number"
                        placeholder="Enter service royalty"
                        disabled={!watch("send_newsletter")}
                        {...register("send_news_cost", { valueAsNumber: true })}
                    />
                }
            />

            <ServiceSettingRow
                label="Send Coming Home File"
                enabled={watch("send_cominghome")}
                onCheckedChange={(checked) =>
                    handleServiceCheckboxChange("send_cominghome", checked as boolean)
                }
                chargeField={
                    <Input
                        id="send_cominghome_amt"
                        type="number"
                        placeholder="Enter service charge"
                        disabled={!watch("send_cominghome")}
                        {...register("send_cominghome_amt", { valueAsNumber: true })}
                    />
                }
                royaltyField={
                    <Input
                        id="send_cominghome_cost"
                        type="number"
                        placeholder="Enter service royalty"
                        disabled={!watch("send_cominghome")}
                        {...register("send_cominghome_cost", { valueAsNumber: true })}
                    />
                }
            />

            {/* Coming Home Newsletter File Upload */}
            {watch('send_cominghome') && (
                <div className="space-y-4 border-t pt-4 mt-4">
                    <label className="text-sm font-medium">Coming Home Newsletter</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".html,text/html"
                                onChange={handleFileChange}
                                className="hidden"
                                id="coming-home-file-input-profile"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {comingHomeFile ? comingHomeFile.name : 'Upload HTML File'}
                            </Button>
                        </div>
                        {(comingHomeFile || serviceSettings?.coming_home_file) && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={handleClearFile}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    {serviceSettings?.coming_home_file && !comingHomeFile && (
                        <p className="text-sm text-muted-foreground">
                            Current file: {serviceSettings.coming_home_file}
                        </p>
                    )}
                    {comingHomeFile && (
                        <p className="text-sm text-green-600">
                            New file selected: {comingHomeFile.name}
                        </p>
                    )}
                </div>
            )}

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="no_branding"
                    checked={watch("no_branding")}
                    onCheckedChange={(checked) =>
                        setValue("no_branding", checked as boolean)
                    }
                />
            <label htmlFor="no_branding" className="text-sm font-medium">
                    No Branding
                </label>
            </div>
        </form>
    );
};

interface ServiceSettingRowProps {
    label: string;
    enabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
    chargeField: ReactNode;
    royaltyField: ReactNode;
}

const ServiceSettingRow = ({
    label,
    enabled,
    onCheckedChange,
    chargeField,
    royaltyField,
}: ServiceSettingRowProps) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
            <div className="flex items-center space-x-2 h-full">
                <Checkbox
                    id={`${label.toLowerCase().replace(/\s+/g, "_")}`}
                    checked={enabled}
                    onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
                />
                <label
                    htmlFor={`${label.toLowerCase().replace(/\s+/g, "_")}`}
                    className="text-sm font-medium"
                >
                    {label}
                </label>
            </div>
        </div>
        <div className="space-y-2">{chargeField}</div>
        <div className="space-y-2">{royaltyField}</div>
    </div>
);

export default UpdateUserServiceSettings;

