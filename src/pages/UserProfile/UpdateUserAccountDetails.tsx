import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useForm } from "react-hook-form";
import type { IUserDetails } from "../UserDetails/interface";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/services/userManagementService";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";

interface UpdateUserAccountDetailsProps {
    user?: Partial<IUserDetails>;
    userId?: string | number;
    setIsEditMode: (value: boolean) => void;
    refetch: () => void;
}

interface AccountDetailsFormValues {
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
}

const UpdateUserAccountDetails = ({ user, userId, setIsEditMode, refetch }: UpdateUserAccountDetailsProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = useMemo<AccountDetailsFormValues>(() => ({
        is_superuser: Boolean(user?.is_superuser),
        is_staff: Boolean(user?.is_staff),
        is_active: Boolean(user?.is_active),
    }), [user?.is_superuser, user?.is_staff, user?.is_active]);

    const { control, handleSubmit, reset } = useForm<AccountDetailsFormValues>({
        defaultValues,
        mode: "onChange",
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const { mutate: updateUserMutation } = useMutation({
        mutationFn: ({ id, payload }: { id: string | number; payload: AccountDetailsFormValues }) => {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            return updateUser({ id, user: formData });
        },
        onSuccess: () => {
            toast.success("Account details updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
        },
        onError: () => {
            toast.error("Failed to update account details");
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: AccountDetailsFormValues) => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }
        setIsSubmitting(true);
        updateUserMutation({ id: userId, payload: data });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        reset(defaultValues);
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
            <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Account Permissions</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="is_superuser"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_superuser"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                    />
                                    <label htmlFor="is_superuser" className="text-sm">
                                        Administrator (Superuser)
                                    </label>
                                </div>
                            )}
                        />
                        <Controller
                            name="is_staff"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_staff"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                    />
                                    <label htmlFor="is_staff" className="text-sm">
                                        Staff Access
                                    </label>
                                </div>
                            )}
                        />
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                    />
                                    <label htmlFor="is_active" className="text-sm">
                                        Active User
                                    </label>
                                </div>
                            )}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Representative ID</label>
                        <p className="text-sm font-semibold mt-1">{user?.rep_id ?? "-"}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">User ID</label>
                        <p className="text-sm font-semibold mt-1">{user?.id ?? "-"}</p>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default UpdateUserAccountDetails;

