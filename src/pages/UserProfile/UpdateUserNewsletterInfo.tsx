import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import type { INewsletterInfo } from "../UserDetails/interface";
import { useMutation } from "@tanstack/react-query";
import { updateNewsletter } from "@/services/userManagementService";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";

interface UpdateUserNewsletterInfoProps {
    newsletter?: INewsletterInfo;
    userId?: string | number;
    setIsEditMode: (value: boolean) => void;
    refetch: () => void;
    companyName?: string;
}

const UpdateUserNewsletterInfo = ({
    newsletter,
    userId,
    setIsEditMode,
    refetch,
    companyName,
}: UpdateUserNewsletterInfoProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = useMemo(
        () => ({
            id: newsletter?.id ?? 0,
            company: newsletter?.company ?? companyName ?? "",
            industry: newsletter?.industry ?? 0,
            bbb: Boolean(newsletter?.bbb),
            bbba: Boolean(newsletter?.bbba),
            EHL: Boolean(newsletter?.EHL),
            EHO: Boolean(newsletter?.EHO),
            fdic: Boolean(newsletter?.fdic),
            ncua: Boolean(newsletter?.ncua),
            realtor: Boolean(newsletter?.realtor),
            hud: Boolean(newsletter?.hud),
            no_rate_post: Boolean(newsletter?.no_rate_post),
            custom: Boolean(newsletter?.custom),
            discloure: newsletter?.discloure ?? "",
        }),
        [
            newsletter?.bbb,
            newsletter?.bbba,
            newsletter?.EHL,
            newsletter?.EHO,
            newsletter?.fdic,
            newsletter?.ncua,
            newsletter?.realtor,
            newsletter?.hud,
            newsletter?.no_rate_post,
            newsletter?.custom,
            newsletter?.discloure,
            newsletter?.industry,
            newsletter?.company,
        ],
    );

    const { control, handleSubmit, reset, register, formState: { errors } } = useForm<Partial<INewsletterInfo>>({
        defaultValues: defaultValues,
        mode: "onChange",
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const { mutate: updateNewsletterMutation } = useMutation({
        mutationFn: ({ id, payload }: { id: string | number; payload: INewsletterInfo }) =>
            updateNewsletter({ id, newsletter: payload }),
        onSuccess: () => {
            toast.success("Newsletter information updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
        },
        onError: () => {
            toast.error("Failed to update newsletter information");
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: Partial<INewsletterInfo>) => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }

        setIsSubmitting(true);
        const payload: INewsletterInfo = {
            id: data.id ?? newsletter?.id ?? 0,
            company: companyName ?? data.company ?? newsletter?.company ?? "",
            industry: data.industry ?? newsletter?.industry ?? 0,
            bbb: Boolean(data.bbb),
            bbba: Boolean(data.bbba),
            EHL: Boolean(data.EHL),
            EHO: Boolean(data.EHO),
            fdic: Boolean(data.fdic),
            ncua: Boolean(data.ncua),
            realtor: Boolean(data.realtor),
            hud: Boolean(data.hud),
            no_rate_post: Boolean(data.no_rate_post),
            custom: Boolean(data.custom),
            discloure: data.discloure ?? newsletter?.discloure ?? "",
        };
        updateNewsletterMutation({ id: userId, payload });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        reset(defaultValues as INewsletterInfo);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                    <Controller
                        name="bbb"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="bbb"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="bbb" className="text-sm font-medium">BBB</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="bbba"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="bbba"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="bbba" className="text-sm font-medium">BBB-A</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="EHL"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="EHL"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="EHL" className="text-sm font-medium">EHL</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="EHO"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="EHO"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="EHO" className="text-sm font-medium">EHO</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="fdic"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="fdic"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="fdic" className="text-sm font-medium">FDIC</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="ncua"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="ncua"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="ncua" className="text-sm font-medium">NCUA</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="realtor"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="realtor"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="realtor" className="text-sm font-medium">Realtor</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="hud"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="hud"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="hud" className="text-sm font-medium">HUD</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="no_rate_post"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="no_rate_post"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
                    />
                    <label htmlFor="no_rate_post" className="text-sm font-medium">No Rate Post</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="custom"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="custom"
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                        )}
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
                        {...register("discloure")}
                        className={errors.discloure ? "border-red-500" : ""}
                        rows={3}
                    />
                    {errors.discloure && (
                        <p className="text-sm text-red-500">{errors.discloure.message as string}</p>
                    )}
                </div>
            </div>
        </form>
    );
};

export default UpdateUserNewsletterInfo;

