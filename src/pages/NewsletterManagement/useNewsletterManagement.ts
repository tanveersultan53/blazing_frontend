import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createNewsletter, updateNewsletter, getNewsletter, verifyNewsletter, sendTestEmail } from "@/services/newsletterService";
import { getUsers } from "@/services/userManagementService";
import type { INewsletter } from "./interface";
import type { User as UserType } from "@/redux/features/userSlice";

export const useNewsletterManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const currentUser = useSelector(
    (state: { user: { currentUser: UserType } }) => state.user.currentUser
  );

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
      newsletter_label: "",
      news_text: "",
      rate_text: "",
      econ_text: "",
      article1_text: "",
      article2_text: "",
      news_image: null,
      rate_image: null,
      econ_image: null,
      article1_image: null,
      article2_image: null,
      scheduled_date: "",
      scheduled_time: "",
      is_active: true,
      // Branding fields
      companylogo: null,
      photo: null,
      logo: null,
      qrcode: null,
      personaltext: "",
      disclosure: "",
      hlogo: undefined,
      wlogo: undefined,
      hphoto: undefined,
      wphoto: undefined,
      custom: false,
      // Social media
      fb: "",
      ig: "",
      li: "",
      tw: "",
      yt: "",
      tk: "",
      vo: "",
      yp: "",
      gg: "",
      bg: "",
    },
    mode: "onChange",
  });

  // Image preview states
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [econImagePreview, setEconImagePreview] = useState<string | null>(null);
  const [rateImagePreview, setRateImagePreview] = useState<string | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const [article1ImagePreview, setArticle1ImagePreview] = useState<
    string | null
  >(null);
  const [article2ImagePreview, setArticle2ImagePreview] = useState<
    string | null
  >(null);

  // Branding image preview states
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrcodePreview, setQrcodePreview] = useState<string | null>(null);

  // Verify dialog states
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newsletterUrls, setNewsletterUrls] = useState<{
    short_newsletter_url: string;
    long_newsletter_url: string;
  } | null>(null);

  // Test email states
  const [testEmail, setTestEmail] = useState("");
  const [newsletterVersion, setNewsletterVersion] = useState<"long" | "short">("long");


  // Fetch users for verify dialog
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({}),
  });

  const users = usersData?.data?.results || [];

  // Fetch newsletter data if editing
  const { data: newsletterData, isLoading: isLoadingNewsletter } = useQuery({
    queryKey: ['newsletter', id],
    queryFn: () => getNewsletter(Number(id)),
    enabled: isEditMode,
  });

  // Populate form when newsletter data loads
  useEffect(() => {
    if (newsletterData?.data && isEditMode) {
      const data = newsletterData.data;

      // Reset form with newsletter data
      reset({
        newsletter_label: data.newsletter_label || '',
        econ_text: data.econ_text || '',
        rate_text: data.rate_text || '',
        news_text: data.news_text || '',
        article1_text: data.article1_text || '',
        article2_text: data.article2_text || '',
        scheduled_date: data.scheduled_date || '',
        scheduled_time: data.scheduled_time || '',
        is_active: data.is_active ?? true,
        // Keep existing defaults for other fields
        news_image: null,
        rate_image: null,
        econ_image: null,
        article1_image: null,
        article2_image: null,
        companylogo: null,
        photo: null,
        logo: null,
        qrcode: null,
        personaltext: data.personaltext || '',
        disclosure: data.disclosure || '',
        hlogo: data.hlogo,
        wlogo: data.wlogo,
        hphoto: data.hphoto,
        wphoto: data.wphoto,
        custom: data.custom || false,
        fb: data.fb || '',
        ig: data.ig || '',
        li: data.li || '',
        tw: data.tw || '',
        yt: data.yt || '',
        tk: data.tk || '',
        vo: data.vo || '',
        yp: data.yp || '',
        gg: data.gg || '',
        bg: data.bg || '',
      });

      // Set schedule date
      if (data.scheduled_date) {
        setScheduleDate(new Date(data.scheduled_date));
      }

      // Set image previews if URLs exist
      if (data.econ_image && typeof data.econ_image === 'string') {
        setEconImagePreview(data.econ_image);
      }
      if (data.rate_image && typeof data.rate_image === 'string') {
        setRateImagePreview(data.rate_image);
      }
      if (data.news_image && typeof data.news_image === 'string') {
        setNewsImagePreview(data.news_image);
      }
      if (data.article1_image && typeof data.article1_image === 'string') {
        setArticle1ImagePreview(data.article1_image);
      }
      if (data.article2_image && typeof data.article2_image === 'string') {
        setArticle2ImagePreview(data.article2_image);
      }
    }
  }, [newsletterData, isEditMode, reset]);

  // Verify newsletter mutation
  const verifyMutation = useMutation({
    mutationFn: ({ userId, formData }: { userId: number; formData: FormData }) =>
      verifyNewsletter(userId, formData),
    onSuccess: (response) => {
      setNewsletterUrls(response.data);
      toast.success("Newsletter verified successfully!");
    },
    onError: (error: any) => {
      console.error("Verify newsletter error:", error);
      toast.error(error.response?.data?.error || "Failed to verify newsletter");
    },
  });

  // Send test email mutation (first verifies to get URLs, then sends test email)
  const sendTestMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId || !testEmail) {
        throw new Error("User ID and test email are required");
      }

      // Step 1: Get the newsletter data
      const verifyFormData = new FormData();
      const currentValues = watch();

      Object.entries(currentValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (value instanceof File || value instanceof FileList) {
            if (value instanceof FileList && value.length > 0) {
              verifyFormData.append(key, value[0]);
            } else if (value instanceof File) {
              verifyFormData.append(key, value);
            }
          } else {
            verifyFormData.append(key, String(value));
          }
        }
      });

      // Step 2: Call verify endpoint to get template URLs
      const verifyResponse = await verifyNewsletter(selectedUserId, verifyFormData);
      const { short_newsletter_url, long_newsletter_url } = verifyResponse.data;

      // Step 3: Send test email with the URLs
      const testEmailFormData = new FormData();
      testEmailFormData.append("test_email", testEmail);
      testEmailFormData.append("newsletter_version", newsletterVersion);
      testEmailFormData.append("short_newsletter_url", short_newsletter_url);
      testEmailFormData.append("long_newsletter_url", long_newsletter_url);

      return sendTestEmail(selectedUserId, testEmailFormData);
    },
    onSuccess: (response) => {
      toast.success(response.data.message || "Test email sent successfully!");
      // Close the verify dialog and reset
      setIsVerifyDialogOpen(false);
      setSelectedUserId(null);
      setTestEmail("");
    },
    onError: (error: any) => {
      console.error("Send test email error:", error);
      toast.error(error.response?.data?.error || "Failed to send test email");
    },
  });

  // Create/Update newsletter mutation
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (isEditMode && id) {
        return updateNewsletter(Number(id), formData);
      }
      return createNewsletter(formData);
    },
    onSuccess: () => {
      toast.success(`Newsletter ${isEditMode ? 'updated' : 'saved'} successfully!`);

      if (isEditMode) {
        // Navigate back to list after update
        navigate('/newsletters');
      } else {
        // Reset form after create
        reset();
        setScheduleDate(undefined);
        setEconImagePreview(null);
        setRateImagePreview(null);
        setNewsImagePreview(null);
        setArticle1ImagePreview(null);
        setArticle2ImagePreview(null);
        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input: any) => {
          input.value = '';
        });
      }
    },
    onError: (error: any) => {
      console.error(`${isEditMode ? 'Update' : 'Create'} newsletter error:`, error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'save'} newsletter`);
    },
  });

  const onSubmit = (data: INewsletter) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      // ✅ File
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // ✅ FileList (take first file)
      if (value instanceof FileList) {
        if (value.length > 0) {
          formData.append(key, value[0]);
        }
        return;
      }

      // ✅ string / number
      formData.append(key, String(value));
    });

    createMutation.mutate(formData);
  };

  const handleEconImageUpload = (file: File | null) => {
    setValue("econ_image", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEconImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEconImagePreview(null);
    }
  };

  const handleRateImageUpload = (file: File | null) => {
    setValue("rate_image", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRateImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setRateImagePreview(null);
    }
  };

  const handleNewsImageUpload = (file: File | null) => {
    setValue("news_image", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewsImagePreview(null);
    }
  };

  const handleArticle1ImageUpload = (file: File | null) => {
    setValue("article1_image", file);

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
    setValue("article2_image", file);

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

  const handleCompanyLogoUpload = (file: File | null) => {
    setValue("companylogo", file);

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

  const handlePhotoUpload = (file: File | null) => {
    setValue("photo", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleLogoUpload = (file: File | null) => {
    setValue("logo", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleQrcodeUpload = (file: File | null) => {
    setValue("qrcode", file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrcodePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setQrcodePreview(null);
    }
  };

  const handleClear = () => {
    reset();
    setScheduleDate(undefined);
    setEconImagePreview(null);
    setRateImagePreview(null);
    setNewsImagePreview(null);
    setArticle1ImagePreview(null);
    setArticle2ImagePreview(null);
    setCompanyLogoPreview(null);
    setPhotoPreview(null);
    setLogoPreview(null);
    setQrcodePreview(null);
    // Clear file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input: any) => {
      input.value = '';
    });
    toast.success("Form cleared successfully");
  };

  const handleSave = () => {
    const data = watch();

    // Validate required fields
    const requiredFields = [
      { field: 'econ_text', label: 'Economic News Text' },
      { field: 'rate_text', label: 'Interest Rate Text' },
      { field: 'news_text', label: 'Real Estate News Text' },
      { field: 'article1_text', label: 'Article 1' },
      { field: 'newsletter_label', label: 'Newsletter Label' },
    ];

    for (const { field, label } of requiredFields) {
      const value = data[field as keyof INewsletter];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        toast.error(`${label} is required`);
        return;
      }
      if (typeof value === 'string' && value.trim().length < 10) {
        toast.error(`${label} must be at least 10 characters`);
        return;
      }
    }

    // Validate Article 2 if provided
    if (data.article2_text && typeof data.article2_text === 'string' && data.article2_text.trim().length > 0 && data.article2_text.trim().length < 10) {
      toast.error('Article 2 must be at least 10 characters if provided');
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      if (value instanceof FileList) {
        if (value.length > 0) {
          formData.append(key, value[0]);
        }
        return;
      }

      formData.append(key, String(value));
    });

    createMutation.mutate(formData);
  };

  const handleVerify = () => {
    setIsVerifyDialogOpen(true);
  };

  const handleVerifySubmit = () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    const data = watch();

    const formData = new FormData();

    // Add all form fields to FormData (except user_id, it's in the URL)
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      // Handle File objects
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // Handle FileList objects
      if (value instanceof FileList) {
        if (value.length > 0) {
          formData.append(key, value[0]);
        }
        return;
      }

      // Handle string/number values
      formData.append(key, String(value));
    });

    verifyMutation.mutate({ userId: selectedUserId, formData });
  };

  const handleCloseVerifyDialog = () => {
    setIsVerifyDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleClosePreview = () => {
    setNewsletterUrls(null);
  };

  const handleSendTestEmail = () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }
    sendTestMutation.mutate();
  };


  const handleAddHtmlCodes = () => {
    // HTML code replacements mapping
    const htmlCodeReplacements: { [key: string]: string } = {
      '*1': '<strong>',
      '*2': '</strong>',
      '*3': '<em>',
      '*4': '</em>',
      '*5': '<br><br>',
      '*6': '<br>',
      '*7': '<u>',
      '*8': '</u>',
    };

    // Get current form values
    const currentData = watch();

    // Fields to process
    const textFields = [
      'econ_text',
      'rate_text',
      'news_text',
      'article1_text',
      'article2_text',
    ] as const;

    let replacedCount = 0;

    // Replace codes in each text field
    textFields.forEach((field) => {
      let text = currentData[field] || '';

      // Replace each code
      Object.entries(htmlCodeReplacements).forEach(([code, html]) => {
        const regex = new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = text.match(regex);
        if (matches) {
          replacedCount += matches.length;
          text = text.replace(regex, html);
        }
      });

      // Update the field value
      setValue(field, text);
    });

    if (replacedCount > 0) {
      toast.success(`Replaced ${replacedCount} HTML code(s) successfully!`);
    } else {
      toast.info('No HTML codes found to replace');
    }
  };

  const handleDistribute = () => {
    const newsletterLabel = watch("newsletter_label");
    if (!newsletterLabel) {
      toast.error("Please enter a Newsletter Label before distributing");
      return;
    }

    // TODO: Backend API to distribute newsletter to all users
    toast.info("Distributing newsletter to all users...");
  };

  const handleSchedule = () => {
    const data = watch();

    // Validate required fields
    const requiredFields = [
      { field: 'econ_text', label: 'Economic News Text' },
      { field: 'rate_text', label: 'Interest Rate Text' },
      { field: 'news_text', label: 'Real Estate News Text' },
      { field: 'article1_text', label: 'Article 1' },
      { field: 'newsletter_label', label: 'Newsletter Label' },
    ];

    for (const { field, label } of requiredFields) {
      const value = data[field as keyof INewsletter];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        toast.error(`${label} is required`);
        return;
      }
    }

    // Check if schedule date and time are set
    if (!data.scheduled_date) {
      toast.error("Please select a schedule date");
      return;
    }

    if (!data.scheduled_time) {
      toast.error("Please select a schedule time");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      if (value instanceof FileList) {
        if (value.length > 0) {
          formData.append(key, value[0]);
        }
        return;
      }

      formData.append(key, String(value));
    });

    createMutation.mutate(formData);
  };

  return {
    currentUser,
    register,
    handleSubmit: hookFormSubmit(onSubmit),
    watch,
    setValue,
    errors,
    scheduleDate,
    setScheduleDate,
    createMutation,
    handleEconImageUpload,
    handleRateImageUpload,
    handleNewsImageUpload,
    handleArticle1ImageUpload,
    handleArticle2ImageUpload,
    handleClear,
    handleSave,
    handleVerify,
    handleAddHtmlCodes,
    handleDistribute,
    handleSchedule,
    econImagePreview,
    rateImagePreview,
    newsImagePreview,
    article1ImagePreview,
    article2ImagePreview,
    // Branding
    handleCompanyLogoUpload,
    handlePhotoUpload,
    handleLogoUpload,
    handleQrcodeUpload,
    companyLogoPreview,
    photoPreview,
    logoPreview,
    qrcodePreview,
    // Verify dialog
    isVerifyDialogOpen,
    selectedUserId,
    setSelectedUserId,
    handleVerifySubmit,
    handleCloseVerifyDialog,
    users,
    isLoadingUsers,
    verifyMutation,
    // Test email
    testEmail,
    setTestEmail,
    newsletterVersion,
    setNewsletterVersion,
    sendTestMutation,
    handleSendTestEmail,
    // Preview
    newsletterUrls,
    handleClosePreview,
    // Edit mode
    isEditMode,
    isLoadingNewsletter,
  };
};
