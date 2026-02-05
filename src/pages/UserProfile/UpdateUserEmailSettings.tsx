import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { IEmailSettings } from "../UserDetails/interface";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { updateEmailSettings } from "@/services/userManagementService";
import { toast } from "sonner";

interface UpdateUserEmailSettingsProps {
    userId?: string | number;
    emailSettings?: IEmailSettings;
    setIsEditMode: (value: boolean) => void;
    refetch: () => void;
}

const defaultEmailSettings: IEmailSettings = {
    birthday: false,
    spouse_birthday: false,
    birthday_status: "send",
    whobday: "both",
    ecard_status: "send",
    whoecards: "both",
    newyears: false,
    stpatrick: false,
    july4: false,
    halloween: false,
    summer: false,
    thanksgiving: false,
    veteransday: false,
    spring: false,
    laborday: false,
    december: false,
    fall: false,
    valentine: false,
    memorialday: false,
    newsletter_status: "send",
    newsletter_default: "long_version",
    frequency: "monthly",
    newsletter_date: format(new Date(), "yyyy-MM-dd"),
    newsletter_status2: "send",
    newsletter_default2: "long_version",
    frequency2: "monthly",
    newsletter_date2: format(new Date(), "yyyy-MM-dd"),
    autooptionscol: false,
    active_deactive_all_settings: false,
};

const holidayFields: Array<keyof IEmailSettings> = [
    "newyears",
    "stpatrick",
    "july4",
    "halloween",
    "summer",
    "thanksgiving",
    "veteransday",
    "spring",
    "laborday",
    "december",
    "fall",
    "valentine",
    "memorialday",
];

const checkboxFields: Array<keyof IEmailSettings> = [
    "birthday",
    "spouse_birthday",
    ...holidayFields,
];

const UpdateUserEmailSettings = ({
    userId,
    emailSettings,
    setIsEditMode,
    refetch,
}: UpdateUserEmailSettingsProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = useMemo(
        () => ({
            ...defaultEmailSettings,
            ...emailSettings,
        }),
        [emailSettings],
    );

    const form = useForm<IEmailSettings>({
        defaultValues,
        mode: "onChange",
    });

    const { watch, setValue, reset } = form;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const { mutate: updateEmailSettingsMutation } = useMutation({
        mutationFn: (payload: IEmailSettings) =>
            updateEmailSettings({
                id: userId as string | number,
                emailSettings: payload,
            }),
        onSuccess: () => {
            toast.success("Email settings updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
        },
        onError: () => {
            toast.error("Failed to update email settings. Please try again.");
            setIsSubmitting(false);
        },
    });

    const validateMandatoryFields = (data: IEmailSettings) => {
        const mandatoryFields: Array<keyof IEmailSettings> = [
            "birthday_status",
            "whobday",
            "ecard_status",
            "whoecards",
            "newsletter_status",
            "newsletter_default",
            "frequency",
            "newsletter_status2",
            "newsletter_default2",
            "frequency2",
        ];

        for (const field of mandatoryFields) {
            if (data[field] === null || data[field] === undefined || data[field] === "") {
                toast.error(`${field.replace(/_/g, " ")} is required`);
                return false;
            }
        }
        return true;
    };

    const handleSelectAll = () => {
        checkboxFields.forEach((field) => setValue(field, true));
        setValue("birthday_status", "send");
        setValue("whobday", "both");
        setValue("ecard_status", "send");
        setValue("whoecards", "both");
        setValue("newsletter_status", "send");
        setValue("newsletter_default", "long_version");
        setValue("frequency", "monthly");
        setValue("newsletter_date", format(new Date(), "yyyy-MM-dd"));
        setValue("newsletter_status2", "send");
        setValue("newsletter_default2", "long_version");
        setValue("frequency2", "monthly");
        setValue("newsletter_date2", format(new Date(), "yyyy-MM-dd"));
    };

    const handleClearAll = () => {
        checkboxFields.forEach((field) => setValue(field, false));
        setValue("birthday_status", "send");
        setValue("whobday", "both");
        setValue("ecard_status", "send");
        setValue("whoecards", "both");
        setValue("newsletter_status", "send");
        setValue("newsletter_default", "long_version");
        setValue("frequency", "monthly");
        setValue("newsletter_date", format(new Date(), "yyyy-MM-dd"));
        setValue("newsletter_status2", "send");
        setValue("newsletter_default2", "long_version");
        setValue("frequency2", "monthly");
        setValue("newsletter_date2", format(new Date(), "yyyy-MM-dd"));
    };

    const handleSetAllHolidays = () => {
        holidayFields.forEach((field) => setValue(field, true));
        setValue("ecard_status", "send");
        setValue("whoecards", "both");
    };

    const handleClearHolidays = () => {
        holidayFields.forEach((field) => setValue(field, false));
        setValue("ecard_status", "send");
        setValue("whoecards", "both");
    };

    const onSubmit = (data: IEmailSettings) => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }

        if (!validateMandatoryFields(data)) {
            return;
        }

        setIsSubmitting(true);
        updateEmailSettingsMutation(data);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        reset(defaultValues);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="active_deactive_all_settings"
                    checked={watch("active_deactive_all_settings")}
                    onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        setValue("active_deactive_all_settings", isChecked);
                        if (isChecked) {
                            handleSelectAll();
                        } else {
                            handleClearAll();
                        }
                    }}
                />
                <label htmlFor="active_deactive_all_settings" className="text-sm font-medium">
                    Active/Deactive all Settings
                </label>
            </div>

            <Separator />

            <section className="space-y-4">
                <h3 className="text-sm font-medium">Birthday Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <CheckboxWithLabel
                        id="birthday"
                        label="Main Birthday"
                        checked={watch("birthday")}
                        onCheckedChange={(checked) => setValue("birthday", Boolean(checked))}
                    />
                    <CheckboxWithLabel
                        id="spouse_birthday"
                        label="Spouse Birthday"
                        checked={watch("spouse_birthday")}
                        onCheckedChange={(checked) => setValue("spouse_birthday", Boolean(checked))}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SelectField
                        label="Birthday Status"
                        value={watch("birthday_status") ?? ""}
                        onChange={(value) => setValue("birthday_status", value as "send" | "dont_send")}
                        options={[
                            { value: "send", label: "Send" },
                            { value: "dont_send", label: "Don't Send" },
                        ]}
                    />
                    <SelectField
                        label="Recipient"
                        value={watch("whobday") ?? ""}
                        onChange={(value) => setValue("whobday", value as "contacts_only" | "partners_only" | "both")}
                        options={[
                            { value: "contacts_only", label: "Contacts Only" },
                            { value: "partners_only", label: "Partners Only" },
                            { value: "both", label: "Both" },
                        ]}
                    />
                </div>
            </section>

            <Separator />

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Holiday Options</h3>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={handleSetAllHolidays}>
                            Select All Holidays
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={handleClearHolidays}>
                            Clear Holidays
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {holidayFields.map((field) => (
                        <CheckboxWithLabel
                            key={field}
                            id={field}
                            label={field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                            checked={watch(field)}
                            onCheckedChange={(checked) => setValue(field, Boolean(checked))}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SelectField
                        label="E-card Status"
                        value={watch("ecard_status") ?? ""}
                        onChange={(value) => setValue("ecard_status", value as "send" | "dont_send")}
                        options={[
                            { value: "send", label: "Send" },
                            { value: "dont_send", label: "Don't Send" },
                        ]}
                    />
                    <SelectField
                        label="Recipient"
                        value={watch("whoecards") ?? ""}
                        onChange={(value) => setValue("whoecards", value as "contacts_only" | "partners_only" | "both")}
                        options={[
                            { value: "contacts_only", label: "Contacts Only" },
                            { value: "partners_only", label: "Partners Only" },
                            { value: "both", label: "Both" },
                        ]}
                    />
                </div>
            </section>

            <Separator />

            <NewsletterSection
                title="Newsletter Options (Primary)"
                status={watch("newsletter_status")}
                onStatusChange={(value) => setValue("newsletter_status", value as "send" | "dont_send")}
                version={watch("newsletter_default")}
                onVersionChange={(value) =>
                    setValue("newsletter_default", value as "long_version" | "short_version" | "none")
                }
                frequency={watch("frequency")}
                onFrequencyChange={(value) =>
                    setValue("frequency", value as "weekly" | "every_2_weeks" | "monthly" | "quarterly" | "none")
                }
                date={watch("newsletter_date")}
                onDateChange={(date) =>
                    setValue("newsletter_date", date ? format(date, "yyyy-MM-dd") : "")
                }
            />

            <NewsletterSection
                title="Newsletter Options (Secondary)"
                status={watch("newsletter_status2")}
                onStatusChange={(value) => setValue("newsletter_status2", value as "send" | "dont_send")}
                version={watch("newsletter_default2")}
                onVersionChange={(value) =>
                    setValue("newsletter_default2", value as "long_version" | "short_version" | "none")
                }
                frequency={watch("frequency2")}
                onFrequencyChange={(value) =>
                    setValue("frequency2", value as "weekly" | "every_2_weeks" | "monthly" | "quarterly" | "none")
                }
                date={watch("newsletter_date2")}
                onDateChange={(date) =>
                    setValue("newsletter_date2", date ? format(date, "yyyy-MM-dd") : "")
                }
            />
        </form>
    );
};

interface CheckboxWithLabelProps {
    id: string;
    label: string;
    checked?: boolean;
    onCheckedChange: (checked: boolean) => void;
}

const CheckboxWithLabel = ({ id, label, checked, onCheckedChange }: CheckboxWithLabelProps) => (
    <div className="flex items-center space-x-2 mt-1">
        <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        />
        <label htmlFor={id} className="text-sm font-medium">
            {label}
        </label>
    </div>
);

interface SelectFieldOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectFieldOption[];
}

const SelectField = ({ label, value, onChange, options }: SelectFieldProps) => (
    <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

interface NewsletterSectionProps {
    title: string;
    status: string | null | undefined;
    onStatusChange: (value: string) => void;
    version: string | null | undefined;
    onVersionChange: (value: string) => void;
    frequency: string | null | undefined;
    onFrequencyChange: (value: string) => void;
    date: string | null | undefined;
    onDateChange: (date: Date | undefined) => void;
}

const NewsletterSection = ({
    title,
    status,
    onStatusChange,
    version,
    onVersionChange,
    frequency,
    onFrequencyChange,
    date,
    onDateChange,
}: NewsletterSectionProps) => (
    <section className="space-y-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField
                label="Newsletter Status"
                value={status ?? ""}
                onChange={onStatusChange}
                options={[
                    { value: "send", label: "Send" },
                    { value: "dont_send", label: "Don't Send" },
                ]}
            />
            <SelectField
                label="Newsletter Version"
                value={version ?? ""}
                onChange={onVersionChange}
                options={[
                    { value: "long_version", label: "Long Version" },
                    { value: "short_version", label: "Short Version" },
                    { value: "none", label: "None" },
                ]}
            />
            <SelectField
                label="Frequency"
                value={frequency ?? ""}
                onChange={onFrequencyChange}
                options={[
                    { value: "weekly", label: "Weekly" },
                    { value: "every_2_weeks", label: "Every 2 Weeks" },
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "none", label: "None" },
                ]}
            />
            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Newsletter Date</label>
                <DatePicker value={date ? new Date(date) : undefined} onChange={onDateChange} />
            </div>
        </div>
    </section>
);

export default UpdateUserEmailSettings;

