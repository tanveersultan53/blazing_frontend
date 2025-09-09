import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "@/services/userManagementService";
import { queryKeys } from "@/helpers/constants";
import { useParams } from "react-router-dom";
import { useState } from "react";

const useUserDetails = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState<'personal' | 'socials' | 'messaging' | 'compliance' | 'branding' | 'preferences' | 'autooptions'>('personal');

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [queryKeys.getUserDetails, id],
        queryFn: () => getUserDetails(id as string | number),
    })

    return {
        user: data?.data,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        refetch,
    }
}

export default useUserDetails;