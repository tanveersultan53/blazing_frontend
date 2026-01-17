import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckIcon, PencilIcon, XIcon, Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AxiosResponse } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNewsletter, updateNewsletter } from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import type { INewsletterInfo, IUserDetails } from "./interface";
import Loading from "@/components/Loading";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const NewsLetterInformation = ({ user }: { user: IUserDetails | undefined, }) => {
    const { id } = useParams();

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, isLoading, refetch } = useQuery<AxiosResponse<INewsletterInfo>>({
        queryKey: [queryKeys.getNewsletter, id],
        queryFn: () => getNewsletter(id as string | number),
    });

    const initialValues = {
        id: data?.data?.id || 0,
        bbb: data?.data?.bbb || false,
        bbba: data?.data?.bbba || false,
        EHL: data?.data?.EHL || false,
        EHO: data?.data?.EHO || false,
        fdic: data?.data?.fdic || false,
        ncua: data?.data?.ncua || false,
        realtor: data?.data?.realtor || false,
        hud: data?.data?.hud || false,
        industry: data?.data?.industry || 0,
        no_rate_post: data?.data?.no_rate_post || false,
        custom: data?.data?.custom || false,
        company: data?.data?.company || '',
        discloure: data?.data?.discloure || '',
    }

    const form = useForm<INewsletterInfo>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const { register, formState: { errors }, watch, setValue } = form;

    // Watch for file changes to show previews
    const photoFile = watch('photo' as any);
    const logoFile = watch('logo' as any);
    const photoPreviewRef = useRef<string | null>(null);
    const logoPreviewRef = useRef<string | null>(null);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (photoPreviewRef.current) {
                URL.revokeObjectURL(photoPreviewRef.current);
            }
            if (logoPreviewRef.current) {
                URL.revokeObjectURL(logoPreviewRef.current);
            }
        };
    }, []);

    // Function to clear file selection
    const clearFile = (fieldName: 'photo' | 'logo') => {
        setValue(fieldName as any, undefined as any);
        if (fieldName === 'photo' && photoPreviewRef.current) {
            URL.revokeObjectURL(photoPreviewRef.current);
            photoPreviewRef.current = null;
        }
        if (fieldName === 'logo' && logoPreviewRef.current) {
            URL.revokeObjectURL(logoPreviewRef.current);
            logoPreviewRef.current = null;
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        form.reset(initialValues);
    };

    const { mutate: updateNewsletterMutation } = useMutation({
        mutationFn: updateNewsletter,
        onSuccess: () => {
            toast.success("Newsletter information updated successfully");
            setIsEditMode(false);
            setIsSubmitting(false);
            refetch();
        },
        onError: () => {
            setIsSubmitting(false);
            toast.error("Failed to update newsletter information");
        }
    });

    const onSubmit = (data: INewsletterInfo) => {
        setIsSubmitting(true);
        updateNewsletterMutation({ id: id as string | number, newsletter: data });
    };

    return isLoading ? <Loading /> : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-12">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Newsletter Information</CardTitle>
                        <CardDescription>You can also update newsletter information here by clicking the update button. </CardDescription>
                    </div>
                    {!isEditMode &&
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditMode(!isEditMode)}>
                            <PencilIcon className="w-4 h-4" />
                            Update Newsletter Info
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
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Company</label>
                                    <p className="text-sm font-semibold">{user?.company || '-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Discloure</label>
                                    <p className="text-sm font-semibold">{'-'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">EHL</label>
                                    <p className="text-sm font-semibold">{data?.data?.EHL ? 'Yes' : 'No'}</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">MFDIC</label>
                                    <p className="text-sm font-semibold">{data?.data?.fdic ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">EHO</label>
                                    <p className="text-sm font-semibold">{data?.data?.EHO ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">BBB</label>
                                    <p className="text-sm font-semibold">{data?.data?.bbb ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">HUD</label>
                                    <p className="text-sm font-semibold">{data?.data?.hud ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">NCUA</label>
                                    <p className="text-sm font-semibold">{data?.data?.ncua ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">BBB-A</label>
                                    <p className="text-sm font-semibold">{data?.data?.bbba ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">No Rate Post</label>
                                    <p className="text-sm font-semibold">{data?.data?.no_rate_post ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Realtor Symbol</label>
                                    <p className="text-sm font-semibold">{data?.data?.realtor ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Custom Symbol</label>
                                    <p className="text-sm font-semibold">{data?.data?.custom ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            {/* Media Information Section */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4">Media Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">User Photo</label>
                                        <div className="flex items-center gap-4">
                                            {user?.photo ? (
                                                <img
                                                    src={user.photo}
                                                    alt="User photo"
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">User Logo</label>
                                        <div className="flex items-center gap-4">
                                            {user?.logo ? (
                                                <img
                                                    src={user.logo}
                                                    alt="User logo"
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {user?.disclaimer && (
                                    <div className="mt-6 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Disclaimer Text</label>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm">{user.disclaimer}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    {isEditMode &&
                        (<div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="bbb"
                                        checked={watch('bbb')}
                                        onCheckedChange={(checked) => setValue('bbb', checked as boolean)}
                                    />
                                    <label htmlFor="bbb" className="text-sm font-medium">BBB</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="bbba"
                                        checked={watch('bbba')}
                                        onCheckedChange={(checked) => setValue('bbba', checked as boolean)}
                                    />
                                    <label htmlFor="bbba" className="text-sm font-medium">BBB-A</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="EHL"
                                        checked={watch('EHL')}
                                        onCheckedChange={(checked) => setValue('EHL', checked as boolean)}
                                    />
                                    <label htmlFor="EHL" className="text-sm font-medium">EHL</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="EHO"
                                        checked={watch('EHO')}
                                        onCheckedChange={(checked) => setValue('EHO', checked as boolean)}
                                    />
                                    <label htmlFor="EHO" className="text-sm font-medium">EHO</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="fdic"
                                        checked={watch('fdic')}
                                        onCheckedChange={(checked) => setValue('fdic', checked as boolean)}
                                    />
                                    <label htmlFor="fdic" className="text-sm font-medium">FDIC</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ncua"
                                        checked={watch('ncua')}
                                        onCheckedChange={(checked) => setValue('ncua', checked as boolean)}
                                    />
                                    <label htmlFor="ncua" className="text-sm font-medium">NCUA</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="realtor"
                                        checked={watch('realtor')}
                                        onCheckedChange={(checked) => setValue('realtor', checked as boolean)}
                                    />
                                    <label htmlFor="realtor" className="text-sm font-medium">Realtor</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hud"
                                        checked={watch('hud')}
                                        onCheckedChange={(checked) => setValue('hud', checked as boolean)}
                                    />
                                    <label htmlFor="hud" className="text-sm font-medium">HUD</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="no_rate_post"
                                        checked={watch('no_rate_post')}
                                        onCheckedChange={(checked) => setValue('no_rate_post', checked as boolean)}
                                    />
                                    <label htmlFor="no_rate_post" className="text-sm font-medium">No Rate Post</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="custom"
                                        checked={watch('custom')}
                                        onCheckedChange={(checked) => setValue('custom', checked as boolean)}
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
                                        {...register('discloure')}
                                        className={errors.discloure ? 'border-red-500' : ''}
                                        rows={3}
                                    />
                                    {errors.discloure && (
                                        <p className="text-sm text-red-500">{errors.discloure.message as string}</p>
                                    )}
                                </div>
                            </div>

                            {/* Media Information Section */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4">Media Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="photo" className="text-sm font-medium">
                                            User Photo
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="photo"
                                                type="file"
                                                accept="image/*"
                                                {...register('photo' as any)}
                                                onChange={(e) => {
                                                    register('photo' as any).onChange(e);
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {photoFile && photoFile[0] ? photoFile[0].name : 'No file chosen'}
                                                    </span>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" className="ml-2">
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Choose File
                                                </Button>
                                            </div>
                                        </div>
                                        {photoFile && photoFile[0] && (
                                            <div className="mt-2">
                                                <div className="relative inline-block">
                                                    <img
                                                        src={(() => {
                                                            if (photoPreviewRef.current) {
                                                                URL.revokeObjectURL(photoPreviewRef.current);
                                                            }
                                                            photoPreviewRef.current = URL.createObjectURL(photoFile[0]);
                                                            return photoPreviewRef.current;
                                                        })()}
                                                        alt="Photo preview"
                                                        className="w-20 h-20 object-cover rounded-md border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                        onClick={() => clearFile('photo')}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Preview</p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">Upload a profile photo (JPG, PNG, GIF)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="logo" className="text-sm font-medium">
                                            User Logo
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                {...register('logo' as any)}
                                                onChange={(e) => {
                                                    register('logo' as any).onChange(e);
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {logoFile && logoFile[0] ? logoFile[0].name : 'No file chosen'}
                                                    </span>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" className="ml-2">
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Choose File
                                                </Button>
                                            </div>
                                        </div>
                                        {logoFile && logoFile[0] && (
                                            <div className="mt-2">
                                                <div className="relative inline-block">
                                                    <img
                                                        src={(() => {
                                                            if (logoPreviewRef.current) {
                                                                URL.revokeObjectURL(logoPreviewRef.current);
                                                            }
                                                            logoPreviewRef.current = URL.createObjectURL(logoFile[0]);
                                                            return logoPreviewRef.current;
                                                        })()}
                                                        alt="Logo preview"
                                                        className="w-20 h-20 object-cover rounded-md border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                        onClick={() => clearFile('logo')}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Preview</p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">Upload a company/user logo (JPG, PNG, GIF)</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label htmlFor="disclaimer" className="text-sm font-medium">
                                        Disclaimer Text
                                    </label>
                                    <Textarea
                                        id="disclaimer"
                                        placeholder="Enter disclaimer text (optional)"
                                        {...register('disclaimer' as any)}
                                        className={(errors as any).disclaimer ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-gray-500">Add any disclaimer or additional information about the user</p>
                                </div>
                            </div>
                        </div>)
                    }
                </CardContent>
            </Card>
        </form>
    )
}

export default NewsLetterInformation;