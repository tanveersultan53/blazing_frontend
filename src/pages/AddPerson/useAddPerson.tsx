import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AxiosError, AxiosResponse } from 'axios';
import type { AddPersonFormData, AddPersonHookReturn } from './interface';
import { createContact } from '@/services/contactService';
import { cleanPhoneNumber } from '@/lib/phoneFormatter';

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
      send_status: 'send',
      optout: 'send',
      newsletter_version: 'none',

      // Secondary Contact
      secondary_first_name: '',
      secondary_last_name: '',
      secondary_email: '',
      secondary_birthday: '',
      secondary_age: '',

      // Notes
      notes: '',

      // Type
      customer_type: type === 'contact' ? 'contact' : 'partner',

       //Loan Information
      loan_status: '',
      interest_rate: '',
      sales_price: '',
      loan_amount: '',
      percent_down: '',
      ltv: '',
      close_date: '',
      loan_program: '',
      loan_type: '',
      property_type: '',
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

    // Helper function to convert empty strings to null
    const cleanValue = (value: any) => {
      if (value === '' || value === undefined) return null;
      return value;
    };

    const cleanedData: any = {
      first_name: cleanValue(data.first_name),
      last_name: cleanValue(data.last_name),
      email: cleanValue(data.email),
      title: cleanValue(data.title),
      company: cleanValue(data.company),
      address: cleanValue(data.address),
      city: cleanValue(data.city),
      state: cleanValue(data.state),
      zip_code: cleanValue(data.zip_code),
      cell: cleanPhoneNumber(data.cell) || null,
      work_phone: cleanPhoneNumber(data.work_phone) || null,
      birthday: cleanValue(data.birthday),
      age: data.age ? parseInt(data.age as string) : null,
      group: cleanValue(data.group),
      send_status: data.send_status || 'send',
      optout: data.optout === 'send' ? false : true,
      newsletter_version: data.newsletter_version || 'none',
      customer_type: data.customer_type,
      note: cleanValue(data.notes),
    };

    // Only include secondary contact fields for contacts, not partners
    if (data.customer_type === 'contact') {
      cleanedData.secondary_first_name = cleanValue(data.secondary_first_name);
      cleanedData.secondary_last_name = cleanValue(data.secondary_last_name);
      cleanedData.secondary_email = cleanValue(data.secondary_email);
      cleanedData.secondary_birthday = cleanValue(data.secondary_birthday);
      cleanedData.secondary_age = data.secondary_age ? parseInt(data.secondary_age as string) : null;

      // Only include loan fields for contacts
      cleanedData.loan_status = cleanValue(data.loan_status);
      cleanedData.interest_rate = cleanValue(data.interest_rate);
      cleanedData.sales_price = cleanValue(data.sales_price);
      cleanedData.loan_amount = cleanValue(data.loan_amount);
      cleanedData.percent_down = cleanValue(data.percent_down);
      cleanedData.ltv = cleanValue(data.ltv);
      cleanedData.close_date = cleanValue(data.close_date);
      cleanedData.loan_program = cleanValue(data.loan_program);
      cleanedData.loan_type = cleanValue(data.loan_type);
      cleanedData.property_type = cleanValue(data.property_type);
    }

    addContactMutation(cleanedData);
  };



  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
  };
};

export default useAddPerson;
