import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AxiosError, AxiosResponse } from 'axios';
import type { AddPersonFormData, AddPersonHookReturn } from './interface';
import { createContact } from '@/services/contactService';

const useAddPerson = (): AddPersonHookReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const form = useForm<AddPersonFormData>({
    defaultValues: {
      // Primary Contact
      first_name: '',
      last_name: '',
      title: '',
      company: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      cell: '',
      work_phone: '',
      birthday: '',
      age: '',
      group: '',
      send_status: 'dont_send',
      optout: 'dont_send',
      newsletter_version: 'none',

      // Secondary Contact
      spouse_first: '',
      spouse_last: '',
      spouse_email: '',
      sbirthday: '',
      sage: '',

      // Notes
      notes: '',

      // Type
      customer_type: type === 'contact' ? 'contact' : 'referal_partner',
    },
    mode: 'onChange'
  });

  // Mock mutation - replace with actual API call
  const { mutate: addContactMutation } = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      toast.success(type === 'contact' ? 'Contact added successfully' : 'Referal partner added successfully');
      setIsSubmitting(false);
      navigate('/user-dashboard?tab=' + type);
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
                form.setError(fieldName as keyof AddPersonFormData, {
                    type: 'error',
                    message: fieldErrors[0]
                });
            }
        });

        toast.error("Please fix the validation errors below");
    } else {
        // Handle other types of errors
        toast.error(type === 'contact' ? 'Failed to add contact. Please try again.' : 'Failed to add referal partner. Please try again.');
    }
  }

  const onSubmit = (data: AddPersonFormData) => {
    // Clear any existing server errors before submitting
    form.clearErrors();
    setIsSubmitting(true);
    addContactMutation({...data, optout: data.optout === 'send' ? false : true as any});
  };



  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
  };
};

export default useAddPerson;
