import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { createNewsletter, verifyNewsletter } from "@/services/newsletterService";
import { getUsers } from "@/services/userManagementService";
import type { INewsletter } from "./interface";
import type { User as UserType } from "@/redux/features/userSlice";

export const useNewsletterManagement = () => {
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


  // Fetch users for verify dialog
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({}),
  });

  const users = usersData?.data?.results || [];

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

  // Create newsletter mutation
  const createMutation = useMutation({
    mutationFn: createNewsletter,
    onSuccess: () => {
      toast.success("Newsletter saved successfully!");
      // Reset form
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
    },
    onError: (error: any) => {
      console.error("Create newsletter error:", error);
      toast.error(error.response?.data?.error || "Failed to save newsletter");
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

  const handleProcess = () => {
    const newsletterLabel = watch("newsletter_label");
    if (!newsletterLabel) {
      toast.error("Please enter a Newsletter Label");
      return;
    }

    // TODO: Backend API to process newsletter with templates
    toast.info("Processing newsletter and generating HTML files...");
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
    handleProcess,
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
    // Preview
    newsletterUrls,
    handleClosePreview,
  };
};
