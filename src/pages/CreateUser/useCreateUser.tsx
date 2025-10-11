import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createUser } from '@/services/userManagementService';
import { useNavigate } from 'react-router-dom';
import type { AxiosError, AxiosResponse } from 'axios';
import { cleanPhoneNumber } from '@/lib/phoneFormatter';

export interface CreateUserFormData {
    password: string;
    is_active: boolean;
    rep_name: string;
    company: string;
    company_id: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip_code: string;
    email?: string;
    work_phone: string;
    work_ext: string;
    cellphone: string;
    first_name: string;
    last_name: string;
    title: string;
    mid: string;
    website: string;
    branch_id: string;
    personal_license: string;
    industry_type: string;
    // Media fields
    photo?: FileList;
    logo?: FileList;
    disclaimer?: string;
}

const useCreateUser = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const form = useForm<CreateUserFormData>({
        defaultValues: {
            password: '',
            is_active: true,
            rep_name: '',
            company: '',
            company_id: '',
            address: '',
            address2: '',
            city: '',
            state: '',
            zip_code: '',
            email: '',
            work_phone: '',
            work_ext: '',
            cellphone: '',
            first_name: '',
            last_name: '',
            title: '',
            mid: '',
            website: '',
            branch_id: '',
            personal_license: '',
            industry_type: '',
            // Media fields
            photo: undefined,
            logo: undefined,
            disclaimer: ''
        },
        mode: 'onChange'
    });

    const { mutate: createUserMutation } = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            toast.success("User created successfully");
            setIsSubmitting(false);
            navigate('/');
        },
        onError: (error: AxiosError) => {
            const response = error.response;
            response && handleApiError(response);
            setIsSubmitting(false);
        }
    });

    const handleApiError = (response: AxiosResponse) => {
        if (response.data) {
            // Handle validation errors from server
            const errorData = response.data as Record<string, string[]>;

            // Set field-specific errors
            Object.keys(errorData).forEach((fieldName) => {
                const fieldErrors = errorData[fieldName];
                if (fieldErrors && fieldErrors.length > 0) {
                    // Set the first error message for each field
                    form.setError(fieldName as keyof CreateUserFormData, {
                        type: 'server',
                        message: fieldErrors[0]
                    });
                }
            });

            toast.error("Please fix the validation errors below");
        } else {
            // Handle other types of errors
            toast.error("Failed to create user. Please try again.");
        }
    }

    const onSubmit = (data: CreateUserFormData) => {
        // Validate industry_type field
        if (!data.industry_type) {
            form.setError('industry_type', {
                type: 'required',
                message: 'Industry type is required'
            });
            return;
        }
        
        setIsSubmitting(true);
        
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Add all form fields to FormData
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof CreateUserFormData];
            if (key === 'photo' || key === 'logo') {
                // Handle file uploads
                if (value && (value as FileList).length > 0) {
                    formData.append(key, (value as FileList)[0]);
                }
            } else if (value !== undefined && value !== null && value !== '') {
                // Handle regular fields
                if (key === 'cellphone' || key === 'work_phone') {
                    formData.append(key, cleanPhoneNumber(value as string));
                } else {
                    formData.append(key, value as string);
                }
            }
        });
        
        createUserMutation(formData as any);
    };

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isSubmitting
    };
};

export default useCreateUser;