import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getSocials, updateSocials } from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import Loading from "@/components/Loading";
import type { ISocials } from "./interface";
import type { AxiosResponse } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { urlValidation } from "@/lib/utils";

const SocialLinksInformation = () => {
    const { id } = useParams();

    const { data, isLoading, refetch } = useQuery<AxiosResponse<ISocials>>({
        queryKey: [queryKeys.getSocials, id],
        queryFn: () => getSocials(id as string | number),
    });


    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = {
        id: data?.data?.id || 0,
        facebook: data?.data?.facebook || '',
        linkedin: data?.data?.linkedin || '',
        twitter: data?.data?.twitter || '',
        instagram: data?.data?.instagram || '',
        youtube: data?.data?.youtube || '',
        blogr: data?.data?.blogr || '',
        google: data?.data?.google || '',
        yelp: data?.data?.yelp || '',
        vimeo: data?.data?.vimeo || '',
        moneyapp: data?.data?.moneyapp || '',
        socialapp: data?.data?.socialapp || '',
        customapp: data?.data?.customapp || '',
    }

    const form = useForm<ISocials>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    // Reset form when data changes
    React.useEffect(() => {
        if (data?.data) {
            form.reset(initialValues);
        }
    }, [data?.data]);

    const { register, formState: { errors } } = form;

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
    };

    const { mutate: updateSocialsMutation } = useMutation({
        mutationFn: updateSocials,
        onSuccess: () => {
            toast.success("Socials Media Links have been updated successfully");
            setIsEditMode(false);
            setIsSubmitting(false);
            refetch();
        },
        onError: () => {
            setIsSubmitting(false);
        }
    });

    const onSubmit = (formData: ISocials) => {
        setIsSubmitting(true);
        updateSocialsMutation({ id: id as string | number, socials: formData });
    };

    return isLoading ? <Loading /> : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Social Accounts Information</CardTitle>
                        <CardDescription>You can also update social links information here by clicking the update button. </CardDescription>
                    </div>
                    {!isEditMode &&
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditMode(!isEditMode)}>
                            <PencilIcon className="w-4 h-4" />
                            Update Social Links
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
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Facebook url</label>
                                    <p className="text-sm font-semibold">{data?.data?.facebook || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Linkedin url</label>
                                    <p className="text-sm font-semibold">{data?.data?.linkedin || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Twitter url</label>
                                    <p className="text-sm font-semibold">{data?.data?.twitter || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Instagram url</label>
                                    <p className="text-sm font-semibold">{data?.data?.instagram || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Youtube url</label>
                                    <p className="text-sm font-semibold">{data?.data?.youtube || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Blogger url</label>
                                    <p className="text-sm font-semibold">{data?.data?.blogr || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Google url</label>
                                    <p className="text-sm font-semibold">{data?.data?.google || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Yelp url</label>
                                    <p className="text-sm font-semibold">{data?.data?.yelp || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Vimeo url</label>
                                    <p className="text-sm font-semibold">{data?.data?.vimeo || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Moneyapp url</label>
                                    <p className="text-sm font-semibold">{data?.data?.moneyapp || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Socialapp url</label>
                                    <p className="text-sm font-semibold">{data?.data?.socialapp || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Customapp url</label>
                                    <p className="text-sm font-semibold">{data?.data?.customapp || '-'}</p>
                                </div>
                            </div>
                        </div>
                    }
                    {isEditMode &&
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="facebook" className="text-xs font-medium text-muted-foreground">Facebook url</label>
                                    <Input 
                                        id="facebook"
                                        type="url"
                                        placeholder="https://www.facebook.com/username"
                                        {...register('facebook', urlValidation)}
                                        className={errors.facebook ? 'border-red-500' : ''}
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
                                        {...register('linkedin', urlValidation)}
                                        className={errors.linkedin ? 'border-red-500' : ''}
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
                                        {...register('twitter', urlValidation)}
                                        className={errors.twitter ? 'border-red-500' : ''}
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
                                        {...register('instagram', urlValidation)}
                                        className={errors.instagram ? 'border-red-500' : ''}
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
                                        {...register('youtube', urlValidation)}
                                        className={errors.youtube ? 'border-red-500' : ''}
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
                                        {...register('blogr', urlValidation)}
                                        className={errors.blogr ? 'border-red-500' : ''}
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
                                        {...register('google', urlValidation)}
                                        className={errors.google ? 'border-red-500' : ''}
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
                                        {...register('yelp', urlValidation)}
                                        className={errors.yelp ? 'border-red-500' : ''}
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
                                        {...register('vimeo', urlValidation)}
                                        className={errors.vimeo ? 'border-red-500' : ''}
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
                                        {...register('moneyapp', urlValidation)}
                                        className={errors.moneyapp ? 'border-red-500' : ''}
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
                                        {...register('socialapp', urlValidation)}
                                        className={errors.socialapp ? 'border-red-500' : ''}
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
                                        {...register('customapp', urlValidation)}
                                        className={errors.customapp ? 'border-red-500' : ''}
                                    />
                                    {errors.customapp && (
                                        <p className="text-sm text-red-500">{errors.customapp.message as string}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    }
                </CardContent>
            </Card>
        </form>
    )
}

export default SocialLinksInformation;