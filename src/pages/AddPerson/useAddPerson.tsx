import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { AxiosError, AxiosResponse } from 'axios';
import type { AddPersonFormData, AddPersonHookReturn } from './interface';

const useAddPerson = (): AddPersonHookReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
      zip: '',
      cellphone: '',
      work_phone: '',
      birthday: '',
      age: '',
      group: 'family',
      status: 'dont_send',
      optout: 'dont_send',
      newsletter_version: 'none',

      // Secondary Contact
      spouse_first: '',
      spouse_last: '',
      spouse_email: '',
      sbirthday: '',
      sage: '',

      // Notes
      notes: ''
    },
    mode: 'onChange'
  });

  // Mock mutation - replace with actual API call
  const { mutate: addPersonMutation } = useMutation({
    mutationFn: async (data: AddPersonFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Adding person:', data);
      return data;
    },
    onSuccess: () => {
      toast.success("Person added successfully");
      setIsSubmitting(false);
      navigate('/users'); // Navigate to users list
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
            type: 'server',
            message: fieldErrors[0]
          });
        }
      });

      toast.error("Please fix the validation errors below");
    } else {
      // Handle other types of errors
      toast.error("Failed to add person. Please try again.");
    }
  }

  const onSubmit = (data: AddPersonFormData) => {
    setIsSubmitting(true);
    addPersonMutation(data);
  };



  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
  };
};

export default useAddPerson;
