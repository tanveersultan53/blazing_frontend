import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import type { ICallToAction } from "../UserDetails/interface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import { urlValidation } from "@/lib/utils";
import { updateCallToAction } from "@/services/userManagementService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateUserCallToActionProps {
    userId?: string | number;
    callToAction?: ICallToAction;
    setIsEditMode: (value: boolean) => void;
    refetch: () => void;
}

const defaultValues: ICallToAction = {
    cta_label1: "",
    cta_url1: "",
    cta_label2: "",
    cta_url2: "",
    reverse_label: "",
    cta_url3: "",
    hashtags: "",
};

const UpdateUserCallToAction = ({
    userId,
    callToAction,
    setIsEditMode,
    refetch,
}: UpdateUserCallToActionProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = useMemo(
        () => ({
            ...defaultValues,
            ...callToAction,
        }),
        [callToAction],
    );

    const form = useForm<ICallToAction>({
        defaultValues: initialValues,
        mode: "onChange",
    });

    const { register, formState: { errors }, reset } = form;

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    const { mutate: updateCallToActionMutation } = useMutation({
        mutationFn: (payload: ICallToAction) =>
            updateCallToAction({
                id: userId as string | number,
                callToAction: payload,
            }),
        onSuccess: () => {
            toast.success("Call to action updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
        },
        onError: () => {
            toast.error("Failed to update call to action. Please try again.");
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: ICallToAction) => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }
        setIsSubmitting(true);
        updateCallToActionMutation(data);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        reset(initialValues);
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LabeledInput
                    id="cta_label1"
                    label="CTA Label 1"
                    placeholder="Enter CTA label"
                    register={register("cta_label1")}
                />
                <LabeledInput
                    id="cta_url1"
                    label="CTA URL 1"
                    placeholder="https://www.example.com"
                    register={register("cta_url1", urlValidation)}
                    error={errors.cta_url1?.message as string}
                />
                <LabeledInput
                    id="cta_label2"
                    label="CTA Label 2"
                    placeholder="Enter CTA label"
                    register={register("cta_label2")}
                />
                <LabeledInput
                    id="cta_url2"
                    label="CTA URL 2"
                    placeholder="https://www.example.com"
                    register={register("cta_url2", urlValidation)}
                    error={errors.cta_url2?.message as string}
                />
                <LabeledInput
                    id="reverse_label"
                    label="Reverse Label"
                    placeholder="Enter reverse label"
                    register={register("reverse_label")}
                />
                <LabeledInput
                    id="cta_url3"
                    label="CTA URL 3"
                    placeholder="https://www.example.com"
                    register={register("cta_url3", urlValidation)}
                    error={errors.cta_url3?.message as string}
                />
                <LabeledInput
                    id="hashtags"
                    label="Hashtags"
                    placeholder="Enter hashtags (comma separated)"
                    register={register("hashtags")}
                />
            </div>
        </form>
    );
};

interface LabeledInputProps {
    id: string;
    label: string;
    placeholder?: string;
    register: UseFormRegisterReturn;
    error?: string;
}

const LabeledInput = ({ id, label, placeholder, register, error }: LabeledInputProps) => (
    <div className="space-y-2">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
            {label}
        </label>
        <Input id={id} placeholder={placeholder} {...register} />
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
);

export default UpdateUserCallToAction;

