import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCallToAction, updateCallToAction } from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import Loading from "@/components/Loading";
import type { ICallToAction } from "./interface";
import type { AxiosResponse } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { urlValidation } from "@/lib/utils";

const CallToAction = () => {
    const { id } = useParams();

    const { data, isLoading, refetch } = useQuery<AxiosResponse<ICallToAction>>({
        queryKey: [queryKeys.getCallToAction, id],
        queryFn: () => getCallToAction(id as string | number),
    });


    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = {
        cta_label1: data?.data?.cta_label1 || '',
        cta_url1: data?.data?.cta_url1 || '',
        cta_label2: data?.data?.cta_label2 || '',
        cta_url2: data?.data?.cta_url2 || '',
        reverse_label: data?.data?.reverse_label || '',
        cta_url3: data?.data?.cta_url3 || '',
        hashtags: data?.data?.hashtags || '',
    }
        
    const form = useForm<ICallToAction>({
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

    const { mutate: updateCallToActionMutation } = useMutation({
        mutationFn: updateCallToAction,
        onSuccess: () => {
            toast.success("Call To Action have been updated successfully");
            setIsEditMode(false);
            setIsSubmitting(false);
            refetch();
        },
        onError: () => {
            setIsSubmitting(false);
        }
    });

    const onSubmit = (formData: ICallToAction) => {
        setIsSubmitting(true);
        updateCallToActionMutation({ id: id as string | number, callToAction: formData });
    };

    return isLoading ? <Loading /> : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Call To Action</CardTitle>
                        <CardDescription>You can also update call to action information here by clicking the update button. </CardDescription>
                    </div>
                    {!isEditMode &&
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditMode(!isEditMode)}>
                            <PencilIcon className="w-4 h-4" />
                            Update Actions
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
                                    <label className="text-xs font-medium text-muted-foreground">CTA Label 1</label>
                                    <p className="text-sm font-semibold">{data?.data?.cta_label1 || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">CTA URL 1</label>
                                    <p className="text-sm font-semibold">{data?.data?.cta_url1 || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">CTA Label 2</label>
                                    <p className="text-sm font-semibold">{data?.data?.cta_label2 || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">CTA URL 2</label>
                                    <p className="text-sm font-semibold">{data?.data?.cta_url2 || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Reverse Label</label>
                                    <p className="text-sm font-semibold">{data?.data?.reverse_label || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">CTA URL 3</label>
                                    <p className="text-sm font-semibold">{data?.data?.cta_url3 || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Hashtags</label>
                                    <p className="text-sm font-semibold">{data?.data?.hashtags || '-'}</p>
                                </div>
                            </div>
                        </div>
                    }
                    {isEditMode &&
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="cta_label1" className="text-xs font-medium text-muted-foreground">CTA Label 1</label>
                                    <Input 
                                        id="cta_label1"
                                        type="text"
                                        placeholder="Enter CTA label 1"
                                        {...register('cta_label1')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cta_url1" className="text-xs font-medium text-muted-foreground">CTA URL 1</label>
                                    <Input 
                                        id="cta_url1"
                                        type="url"
                                        placeholder="https://www.example.com"
                                        {...register('cta_url1', urlValidation)}
                                        className={errors.cta_url1 ? 'border-red-500' : ''}
                                    />
                                    {errors.cta_url1 && (
                                        <p className="text-sm text-red-500">{errors.cta_url1.message as string}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cta_label2" className="text-xs font-medium text-muted-foreground">CTA Label 2</label>
                                    <Input 
                                        id="cta_label2"
                                        type="text"
                                        placeholder="Enter CTA label 2"
                                        {...register('cta_label2')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cta_url2" className="text-xs font-medium text-muted-foreground">CTA URL 2</label>
                                    <Input 
                                        id="cta_url2"
                                        type="url"
                                        placeholder="https://www.example.com"
                                        {...register('cta_url2', urlValidation)}
                                        className={errors.cta_url2 ? 'border-red-500' : ''}
                                    />
                                    {errors.cta_url2 && (
                                        <p className="text-sm text-red-500">{errors.cta_url2.message as string}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="reverse_label" className="text-xs font-medium text-muted-foreground">Reverse Label</label>
                                    <Input 
                                        id="reverse_label"
                                        type="text"
                                        placeholder="Enter reverse label"
                                        {...register('reverse_label')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cta_url3" className="text-xs font-medium text-muted-foreground">CTA URL 3</label>
                                    <Input 
                                        id="cta_url3"
                                        type="url"
                                        placeholder="https://www.example.com"
                                        {...register('cta_url3', urlValidation)}
                                        className={errors.cta_url3 ? 'border-red-500' : ''}
                                    />
                                    {errors.cta_url3 && (
                                        <p className="text-sm text-red-500">{errors.cta_url3.message as string}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="hashtags" className="text-xs font-medium text-muted-foreground">Hashtags</label>
                                    <Input 
                                        id="hashtags"
                                        type="text"
                                        placeholder="Enter hashtags (comma separated)"
                                        {...register('hashtags')}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                </CardContent>
            </Card>
        </form>
    )
}

export default CallToAction;