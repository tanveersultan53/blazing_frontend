import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import type { ISocials } from "../UserDetails/interface";
import { urlValidation } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { updateSocials } from "@/services/userManagementService";
import { toast } from "sonner";

interface UpdateUserSocialLinksProps {
    socials?: Partial<ISocials>;
    userId?: string | number;
    setIsEditMode: (value: boolean) => void;
    refetch: () => void;
}

const createDefaultValues = (socials?: Partial<ISocials>) => ({
    id: socials?.id || 0,
    facebook: socials?.facebook || "",
    linkedin: socials?.linkedin || "",
    twitter: socials?.twitter || "",
    instagram: socials?.instagram || "",
    youtube: socials?.youtube || "",
    blogr: socials?.blogr || "",
    google: socials?.google || "",
    yelp: socials?.yelp || "",
    vimeo: socials?.vimeo || "",
    moneyapp: socials?.moneyapp || "",
    socialapp: socials?.socialapp || "",
    customapp: socials?.customapp || "",
});

const UpdateUserSocialLinks = ({ socials, userId, setIsEditMode, refetch }: UpdateUserSocialLinksProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = useMemo(() => createDefaultValues(socials), [socials]);

    const form = useForm<ISocials>({
        defaultValues,
        mode: "onChange",
    });

    const { register, formState: { errors }, handleSubmit, reset } = form;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const { mutate: updateSocialsMutation } = useMutation({
        mutationFn: updateSocials,
        onSuccess: () => {
            toast.success("Social links updated successfully");
            setIsEditMode(false);
            refetch();
            setIsSubmitting(false);
        },
        onError: () => {
            toast.error("Failed to update social links");
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: ISocials) => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }

        setIsSubmitting(true);
        updateSocialsMutation({
            id: userId,
            socials: {
                ...data,
            },
        });
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label htmlFor="facebook" className="text-xs font-medium text-muted-foreground">Facebook url</label>
                    <Input
                        id="facebook"
                        type="url"
                        placeholder="https://www.facebook.com/username"
                        {...register("facebook", urlValidation)}
                        className={errors.facebook ? "border-red-500" : ""}
                    />
                    {errors.facebook && (
                        <p className="text-sm text-red-500">{errors.facebook.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="linkedin" className="text-xs font-medium text-muted-foreground">Linkedin url</label>
                    <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://www.linkedin.com/in/username"
                        {...register("linkedin", urlValidation)}
                        className={errors.linkedin ? "border-red-500" : ""}
                    />
                    {errors.linkedin && (
                        <p className="text-sm text-red-500">{errors.linkedin.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="twitter" className="text-xs font-medium text-muted-foreground">Twitter url</label>
                    <Input
                        id="twitter"
                        type="url"
                        placeholder="https://www.twitter.com/username"
                        {...register("twitter", urlValidation)}
                        className={errors.twitter ? "border-red-500" : ""}
                    />
                    {errors.twitter && (
                        <p className="text-sm text-red-500">{errors.twitter.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="instagram" className="text-xs font-medium text-muted-foreground">Instagram url</label>
                    <Input
                        id="instagram"
                        type="url"
                        placeholder="https://www.instagram.com/username"
                        {...register("instagram", urlValidation)}
                        className={errors.instagram ? "border-red-500" : ""}
                    />
                    {errors.instagram && (
                        <p className="text-sm text-red-500">{errors.instagram.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="youtube" className="text-xs font-medium text-muted-foreground">Youtube url</label>
                    <Input
                        id="youtube"
                        type="url"
                        placeholder="https://www.youtube.com/channel/username"
                        {...register("youtube", urlValidation)}
                        className={errors.youtube ? "border-red-500" : ""}
                    />
                    {errors.youtube && (
                        <p className="text-sm text-red-500">{errors.youtube.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="blogr" className="text-xs font-medium text-muted-foreground">Blogger url</label>
                    <Input
                        id="blogr"
                        type="url"
                        placeholder="https://www.blogger.com/username"
                        {...register("blogr", urlValidation)}
                        className={errors.blogr ? "border-red-500" : ""}
                    />
                    {errors.blogr && (
                        <p className="text-sm text-red-500">{errors.blogr.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="google" className="text-xs font-medium text-muted-foreground">Google url</label>
                    <Input
                        id="google"
                        type="url"
                        placeholder="https://www.google.com/business/username"
                        {...register("google", urlValidation)}
                        className={errors.google ? "border-red-500" : ""}
                    />
                    {errors.google && (
                        <p className="text-sm text-red-500">{errors.google.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="yelp" className="text-xs font-medium text-muted-foreground">Yelp url</label>
                    <Input
                        id="yelp"
                        type="url"
                        placeholder="https://www.yelp.com/biz/username"
                        {...register("yelp", urlValidation)}
                        className={errors.yelp ? "border-red-500" : ""}
                    />
                    {errors.yelp && (
                        <p className="text-sm text-red-500">{errors.yelp.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="vimeo" className="text-xs font-medium text-muted-foreground">Vimeo url</label>
                    <Input
                        id="vimeo"
                        type="url"
                        placeholder="https://www.vimeo.com/username"
                        {...register("vimeo", urlValidation)}
                        className={errors.vimeo ? "border-red-500" : ""}
                    />
                    {errors.vimeo && (
                        <p className="text-sm text-red-500">{errors.vimeo.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="moneyapp" className="text-xs font-medium text-muted-foreground">Moneyapp url</label>
                    <Input
                        id="moneyapp"
                        type="url"
                        placeholder="https://www.moneyapp.com/username"
                        {...register("moneyapp", urlValidation)}
                        className={errors.moneyapp ? "border-red-500" : ""}
                    />
                    {errors.moneyapp && (
                        <p className="text-sm text-red-500">{errors.moneyapp.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="socialapp" className="text-xs font-medium text-muted-foreground">Socialapp url</label>
                    <Input
                        id="socialapp"
                        type="url"
                        placeholder="https://www.socialapp.com/username"
                        {...register("socialapp", urlValidation)}
                        className={errors.socialapp ? "border-red-500" : ""}
                    />
                    {errors.socialapp && (
                        <p className="text-sm text-red-500">{errors.socialapp.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="customapp" className="text-xs font-medium text-muted-foreground">Customapp url</label>
                    <Input
                        id="customapp"
                        type="url"
                        placeholder="https://www.customapp.com/username"
                        {...register("customapp", urlValidation)}
                        className={errors.customapp ? "border-red-500" : ""}
                    />
                    {errors.customapp && (
                        <p className="text-sm text-red-500">{errors.customapp.message as string}</p>
                    )}
                </div>
            </div>
        </form>
    );
};

export default UpdateUserSocialLinks;

