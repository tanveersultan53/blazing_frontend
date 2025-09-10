import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { getNewsletter } from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import type { INewsletterInfo, IUserDetails } from "./interface";
import Loading from "@/components/Loading";

const NewsLetterInformation = ({ user }: { user: IUserDetails | undefined, }) => {
    const { id } = useParams();

    const [isEditMode, setIsEditMode] = useState(false);
    const isSubmitting:boolean = false;

    const { data, isLoading } = useQuery<AxiosResponse<INewsletterInfo>>({
        queryKey: [queryKeys.getNewsletter, id],
        queryFn: () => getNewsletter(id as string | number),
    });

    const handleCancel = () => {
        setIsEditMode(false);
    };

    return isLoading ? <Loading /> : (
        <>
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
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">FDIC</label>
                                    <p className="text-sm font-semibold">{data?.data?.fdic ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">BBB-A</label>
                                    <p className="text-sm font-semibold">{data?.data?.bbba ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Relator Symbol</label>
                                    <p className="text-sm font-semibold">{data?.data?.no_rate_post ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">Custom Symbol</label>
                                    <p className="text-sm font-semibold">{data?.data?.custom ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </div>
                    }
                </CardContent>
            </Card>
        </>
    )
}

export default NewsLetterInformation;