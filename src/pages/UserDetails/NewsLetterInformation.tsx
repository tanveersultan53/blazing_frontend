import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { getNewsletter } from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import type { INewsletterInfo } from "./interface";
import Loading from "@/components/Loading";

const NewsLetterInformation = () => {
    const { id } = useParams();

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, isLoading, refetch } = useQuery<AxiosResponse<INewsletterInfo>>({
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
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">BBB</label>
                                    <p className="text-sm font-semibold">{data?.data?.bbb}</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">BBB</label>
                                    <p className="text-sm font-semibold">{data?.data?.bbb}</p>
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