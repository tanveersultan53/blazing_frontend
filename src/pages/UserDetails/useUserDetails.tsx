import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "@/services/userManagementService";
import { getContactDetails } from "@/services/contactService";
import { queryKeys } from "@/helpers/constants";
import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";

const useUserDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'personal' | 'social' | 'branding' | 'settings' | 'services' | 'newsletters' | 'email' | 'call'>('personal');

    // Check if this is a contact details page or user details page
    const isContactDetails = location.pathname.startsWith('/contacts/');
    
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [isContactDetails ? 'contactDetails' : queryKeys.getUserDetails, id],
        queryFn: () => isContactDetails ? getContactDetails(id as string | number) : getUserDetails(id as string | number),
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