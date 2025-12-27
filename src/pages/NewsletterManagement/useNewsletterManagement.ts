import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { createNewsletter } from '@/services/newsletterService';
import { getTemplates } from '@/services/templateManagementService';
import type { INewsletter } from './interface';
import type { User as UserType } from '@/redux/features/userSlice';

export const useNewsletterManagement = () => {
  const currentUser = useSelector((state: { user: { currentUser: UserType } }) => state.user.currentUser);

  // React Hook Form
  const {
    register,
    handleSubmit: hookFormSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<INewsletter>({
    defaultValues: {
      template_type: 'existing',
      template_id: undefined,
      html_file: null,
      user_photo: null,
      company_logo: null,
      economic_news_image: null,
      interest_rate_image: null,
      real_estate_news_image: null,
      article_1_image: null,
      article_2_image: null,
      economic_news_text: '',
      interest_rate_text: '',
      real_estate_news_text: '',
      article_1: '',
      article_2: '',
      schedule_date: '',
      schedule_time: '',
    },
    mode: 'onChange',
  });

  // Image preview states
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [economicNewsImagePreview, setEconomicNewsImagePreview] = useState<string | null>(null);
  const [interestRateImagePreview, setInterestRateImagePreview] = useState<string | null>(null);
  const [realEstateNewsImagePreview, setRealEstateNewsImagePreview] = useState<string | null>(null);
  const [article1ImagePreview, setArticle1ImagePreview] = useState<string | null>(null);
  const [article2ImagePreview, setArticle2ImagePreview] = useState<string | null>(null);

  // Conditional validation errors
  const [templateError, setTemplateError] = useState<string>('');
  const [htmlFileError, setHtmlFileError] = useState<string>('');

  // Fetch newsletter templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => getTemplates({}),
  });

  const newsletterTemplates = templatesData?.data?.results?.filter(
    (template) => template.type === 'newsletter' && template.is_active
  ) || [];

  // Create newsletter mutation
  const createMutation = useMutation({
    mutationFn: createNewsletter,
    onSuccess: () => {
      toast.success('Newsletter scheduled successfully!');
      // Reset form
      reset();
      setScheduleDate(undefined);
      setUserPhotoPreview(null);
      setCompanyLogoPreview(null);
      setEconomicNewsImagePreview(null);
      setInterestRateImagePreview(null);
      setRealEstateNewsImagePreview(null);
      setArticle1ImagePreview(null);
      setArticle2ImagePreview(null);
    },
    onError: (error: any) => {
      console.error('Create newsletter error:', error);
      toast.error(error.response?.data?.error || 'Failed to create newsletter');
    },
  });

  const onSubmit = (data: INewsletter) => {
    // Clear previous errors
    setTemplateError('');
    setHtmlFileError('');

    // Manual validation for conditional fields
    if (data.template_type === 'existing' && !data.template_id) {
      setTemplateError('Please select a template');
      toast.error('Please select a template');
      return;
    }
    if (data.template_type === 'upload' && !data.html_file) {
      setHtmlFileError('Please upload an HTML template file');
      toast.error('Please upload an HTML template file');
      return;
    }

    createMutation.mutate(data);
  };

  const handleTemplateTypeChange = (type: 'existing' | 'upload') => {
    setValue('template_type', type);
    setTemplateError('');
    setHtmlFileError('');
    if (type === 'existing') {
      setValue('html_file', null);
    } else {
      setValue('template_id', undefined);
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    setValue('template_id', templateId);
    setTemplateError('');
  };

  const handleFileUpload = (file: File | null) => {
    setValue('html_file', file);
    setHtmlFileError('');
  };

  const handleUserPhotoUpload = (file: File | null) => {
    setValue('user_photo', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUserPhotoPreview(null);
    }
  };

  const handleCompanyLogoUpload = (file: File | null) => {
    setValue('company_logo', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCompanyLogoPreview(null);
    }
  };

  const handleEconomicNewsImageUpload = (file: File | null) => {
    setValue('economic_news_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEconomicNewsImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEconomicNewsImagePreview(null);
    }
  };

  const handleInterestRateImageUpload = (file: File | null) => {
    setValue('interest_rate_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInterestRateImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setInterestRateImagePreview(null);
    }
  };

  const handleRealEstateNewsImageUpload = (file: File | null) => {
    setValue('real_estate_news_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRealEstateNewsImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setRealEstateNewsImagePreview(null);
    }
  };

  const handleArticle1ImageUpload = (file: File | null) => {
    setValue('article_1_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticle1ImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setArticle1ImagePreview(null);
    }
  };

  const handleArticle2ImageUpload = (file: File | null) => {
    setValue('article_2_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticle2ImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setArticle2ImagePreview(null);
    }
  };

  return {
    currentUser,
    register,
    handleSubmit: hookFormSubmit(onSubmit),
    watch,
    setValue,
    errors,
    templateError,
    htmlFileError,
    scheduleDate,
    setScheduleDate,
    createMutation,
    handleTemplateTypeChange,
    handleTemplateSelect,
    handleFileUpload,
    handleUserPhotoUpload,
    handleCompanyLogoUpload,
    handleEconomicNewsImageUpload,
    handleInterestRateImageUpload,
    handleRealEstateNewsImageUpload,
    handleArticle1ImageUpload,
    handleArticle2ImageUpload,
    userPhotoPreview,
    companyLogoPreview,
    economicNewsImagePreview,
    interestRateImagePreview,
    realEstateNewsImagePreview,
    article1ImagePreview,
    article2ImagePreview,
    newsletterTemplates,
    isLoadingTemplates,
  };
};
