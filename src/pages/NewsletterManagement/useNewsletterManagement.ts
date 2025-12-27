import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { createNewsletter } from '@/services/newsletterService';
import { getTemplates } from '@/services/templateManagementService';
import type { INewsletter } from './interface';
import type { User as UserType } from '@/redux/features/userSlice';

export const useNewsletterManagement = () => {
  //@ts-ignore
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: { user: { currentUser: UserType } }) => state.user.currentUser);

  const [formData, setFormData] = useState<INewsletter>({
    template_type: 'existing',
    template_id: undefined,
    html_file: null,
    economic_news_text: '',
    interest_rate_text: '',
    real_estate_news_text: '',
    article_1: '',
    article_2: '',
    schedule_date: '',
    schedule_time: '',
  });
  const [scheduleDate, setScheduleDate] = useState<Date>();

  // Fetch newsletter templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => getTemplates({ }),
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
      setFormData({
        template_type: 'existing',
        template_id: undefined,
        html_file: null,
        economic_news_text: '',
        interest_rate_text: '',
        real_estate_news_text: '',
        article_1: '',
        article_2: '',
        schedule_date: '',
        schedule_time: '',
      });
      setScheduleDate(undefined);
    },
    onError: (error: any) => {
      console.error('Create newsletter error:', error);
      toast.error(error.response?.data?.error || 'Failed to create newsletter');
    },
  });

  // Update schedule date when calendar date changes
  useEffect(() => {
    if (scheduleDate) {
      setFormData(prev => ({
        ...prev,
        schedule_date: format(scheduleDate, 'yyyy-MM-dd HH:mm:ss'),
      }));
    }
  }, [scheduleDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.template_type === 'existing' && !formData.template_id) {
      toast.error('Please select a template');
      return;
    }
    if (formData.template_type === 'upload' && !formData.html_file) {
      toast.error('Please upload an HTML template file');
      return;
    }
    if (!formData.economic_news_text.trim()) {
      toast.error('Please enter Economic News Text');
      return;
    }
    if (!formData.interest_rate_text.trim()) {
      toast.error('Please enter Interest Rate Text');
      return;
    }
    if (!formData.real_estate_news_text.trim()) {
      toast.error('Please enter Real Estate News Text');
      return;
    }
    if (!formData.article_1.trim()) {
      toast.error('Please enter Article 1');
      return;
    }
    if (!formData.article_2.trim()) {
      toast.error('Please enter Article 2');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof INewsletter, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      html_file: file,
    }));
  };

  const handleTemplateTypeChange = (type: 'existing' | 'upload') => {
    setFormData(prev => ({
      ...prev,
      template_type: type,
      template_id: type === 'existing' ? prev.template_id : undefined,
      html_file: type === 'upload' ? prev.html_file : null,
    }));
  };

  const handleTemplateSelect = (templateId: number) => {
    setFormData(prev => ({
      ...prev,
      template_id: templateId,
    }));
  };

  return {
    currentUser,
    formData,
    scheduleDate,
    setScheduleDate,
    createMutation,
    handleSubmit,
    handleInputChange,
    handleFileUpload,
    handleTemplateTypeChange,
    handleTemplateSelect,
    newsletterTemplates,
    isLoadingTemplates,
  };
};
