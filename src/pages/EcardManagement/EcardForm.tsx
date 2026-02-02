import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  FileImage,
  FileCode,
  Send,
  Mail,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  createDefaultEmail,
  updateDefaultEmail,
  getDefaultEmail,
  deleteDefaultEmail,
  previewEcardHtml,
  sendEcard,
  getUsersList,
} from "@/services/ecardService";
import {
  createEcardDistribution,
  type CreateEcardDistributionData,
} from "@/services/ecardDistributionService";
import { EMAIL_CATEGORIES } from "./interface";
import type { IEcard } from "./interface";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EcardForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<IEcard>({
    email_name: "",
    email_subject: "",
    email_type: "ecard",
    email_category: 0,
    ecard_date: "",
    ecard_text: "",
    email_html: "",
    email_preheader: "",
    greeting: "",
    custom_email: false,
    single_user_email: "",
  });

  const [ecardImagePreview, setEcardImagePreview] = useState<string | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditListDialog, setShowEditListDialog] = useState(false);
  const [showDeleteListDialog, setShowDeleteListDialog] = useState(false);
  const [ecardsList, setEcardsList] = useState<IEcard[]>([]);
  const [selectedEcard, setSelectedEcard] = useState<IEcard | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipientType, setRecipientType] = useState<'contacts' | 'partners' | 'all' | 'custom'>('all');
  const [customEmails, setCustomEmails] = useState<string>('');
  const [sendPreviewHtml, setSendPreviewHtml] = useState<string | null>(null);
  const [showSendPreview, setShowSendPreview] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [usersList, setUsersList] = useState<Array<{ id: number; name: string; email: string; company: string }>>([]);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);
  const [distributeToAllUsers, setDistributeToAllUsers] = useState(true);
  const [selectedDistributeUsers, setSelectedDistributeUsers] = useState<number[]>([]);
  const [distributeRecipientType, setDistributeRecipientType] = useState<'all' | 'contact' | 'partner'>('all');
  const [distributeDate, setDistributeDate] = useState<Date | undefined>(undefined);
  const [distributeTime, setDistributeTime] = useState<string>("");
  const [isLoadingDistributeUsers, setIsLoadingDistributeUsers] = useState(false);

  // Fetch ecard data if editing
  const { data: ecardData, isLoading: isLoadingEcard, error: ecardError } = useQuery({
    queryKey: ["default-email", id],
    queryFn: () => getDefaultEmail(Number(id)),
    enabled: isEditMode,
    retry: 1,
  });

  // Log any errors
  useEffect(() => {
    if (ecardError) {
      console.error("Error loading ecard:", ecardError);
      toast.error("Failed to load ecard data. Please try again.");
    }
  }, [ecardError]);

  // Handle ecard data when it changes
  useEffect(() => {
    if (ecardData?.data) {
      const data = ecardData.data;
      console.log("Loading ecard data:", data);
      setFormData(data);

      if (data.ecard_image && typeof data.ecard_image === "string") {
        setEcardImagePreview(data.ecard_image);
      }
    }
  }, [ecardData]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEditMode) {
        return updateDefaultEmail(Number(id), data);
      }
      return createDefaultEmail(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default-emails"] });
      toast.success(
        `Ecard ${isEditMode ? "updated" : "created"} successfully!`
      );
      navigate("/ecards");
    },
    onError: (error: any) => {
      console.error("Save ecard error:", error);
      toast.error(
        error.response?.data?.error ||
          `Failed to ${isEditMode ? "update" : "create"} ecard`
      );
    },
  });

  const handleInputChange = (field: keyof IEcard, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Reset preview when any field changes so user knows to click Preview again
    if (previewHtml) {
      setPreviewHtml(null);
    }
  };

  const handleImageUpload = (file: File | null) => {
    if (file) {
      setFormData((prev) => ({ ...prev, ecard_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setEcardImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, ecard_image: null }));
      setEcardImagePreview(null);
    }
    // Reset preview when image changes
    if (previewHtml) {
      setPreviewHtml(null);
    }
  };

  const handleHtmlFileUpload = async (file: File | null) => {
    if (file) {
      // Read HTML file content - keep it raw, no replacements
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData((prev) => ({ ...prev, email_html: content }));
      };
      reader.readAsText(file);
    } else {
      setFormData((prev) => ({ ...prev, email_html: "" }));
    }
    // Reset preview when HTML file changes
    if (previewHtml) {
      setPreviewHtml(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email_name.trim()) {
      toast.error("Please enter an email name");
      return;
    }
    if (!formData.email_subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    const submitData = new FormData();

    // Add form fields
    submitData.append("email_name", formData.email_name);
    submitData.append("email_subject", formData.email_subject);
    submitData.append("email_type", formData.email_type);
    submitData.append("email_category", String(formData.email_category));
    submitData.append("custom_email", String(formData.custom_email));

    if (formData.ecard_date) {
      submitData.append("ecard_date", formData.ecard_date);
    }
    if (formData.ecard_text) {
      submitData.append("ecard_text", formData.ecard_text);
    }
    if (formData.email_html) {
      submitData.append("email_html", formData.email_html);
    }
    if (formData.email_preheader) {
      submitData.append("email_preheader", formData.email_preheader);
    }
    if (formData.greeting) {
      submitData.append("greeting", formData.greeting);
    }
    if (formData.single_user_email) {
      submitData.append("single_user_email", formData.single_user_email);
    }
    if (formData.ecard_image instanceof File) {
      submitData.append("ecard_image", formData.ecard_image);
    }

    saveMutation.mutate(submitData);
  };

  // Fetch all ecards for Edit/Delete lists
  const { data: ecardsData } = useQuery({
    queryKey: ["default-emails"],
    queryFn: async () => {
      const { getDefaultEmails } = await import("@/services/ecardService");
      return getDefaultEmails();
    },
    enabled: showEditListDialog || showDeleteListDialog,
  });

  useEffect(() => {
    if (ecardsData?.data?.results) {
      setEcardsList(ecardsData.data.results);
    }
  }, [ecardsData]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (ecardId: number) => deleteDefaultEmail(ecardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default-emails"] });
      toast.success("Ecard deleted successfully!");
      setShowDeleteDialog(false);
      setShowDeleteListDialog(false);
      setSelectedEcard(null);
    },
    onError: (error: any) => {
      console.error("Delete ecard error:", error);
      toast.error(error.response?.data?.error || "Failed to delete ecard");
    },
  });

  // Distribute mutation - creates a distribution record
  const distributeMutation = useMutation({
    mutationFn: (data: CreateEcardDistributionData) => createEcardDistribution(data),
    onSuccess: (response) => {
      toast.success("Ecard distribution scheduled successfully!");
      setShowDistributeDialog(false);
      // Reset distribute dialog states
      setDistributeToAllUsers(true);
      setSelectedDistributeUsers([]);
      setDistributeRecipientType('all');
      setDistributeDate(undefined);
      setDistributeTime('');
    },
    onError: (error: any) => {
      console.error("Create distribution error:", error);
      toast.error(error.response?.data?.error || "Failed to schedule distribution");
    },
  });

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: (data: { ecardId: number; recipient_type: 'contacts' | 'partners' | 'all' | 'custom'; custom_emails?: string[]; user_id?: number }) =>
      sendEcard(data.ecardId, { recipient_type: data.recipient_type, custom_emails: data.custom_emails, user_id: data.user_id }),
    onSuccess: (response) => {
      const { sent_count, failed_count, total_recipients } = response.data;
      toast.success(`Ecard sent successfully! Sent: ${sent_count}, Failed: ${failed_count}, Total: ${total_recipients}`);
      setShowSendDialog(false);
      setShowSendPreview(false);
      setSendPreviewHtml(null);
      setCustomEmails('');
      setRecipientType('all');
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      console.error("Send ecard error:", error);
      toast.error(error.response?.data?.error || "Failed to send ecard");
    },
  });

  const handleClear = () => {
    setFormData({
      email_name: "",
      email_subject: "",
      email_type: "ecard",
      email_category: 0,
      ecard_date: "",
      ecard_text: "",
      email_html: "",
      email_preheader: "",
      greeting: "",
      custom_email: false,
      single_user_email: "",
    });
    setEcardImagePreview(null);
    setPreviewHtml(null);
  };

  const handleEdit = () => {
    setShowEditListDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteListDialog(true);
  };

  const handlePreview = async () => {
    // Validate that there's HTML content to preview
    if (!formData.email_html) {
      toast.error("Please upload an email HTML template first");
      return;
    }

    setIsLoadingPreview(true);
    try {
      // Call backend API to get filled HTML preview
      console.log("🔍 Calling preview API: /email/ecard-preview/1");
      console.log("📤 Request payload:", {
        email_html_length: formData.email_html?.length,
        ecard_text: formData.ecard_text?.substring(0, 50) + "...",
        email_preheader: formData.email_preheader,
        greeting: formData.greeting,
        ecard_image: ecardImagePreview,
      });

      const response = await previewEcardHtml(1, {
        email_html: formData.email_html,
        ecard_text: formData.ecard_text || "",
        email_preheader: formData.email_preheader || "",
        greeting: formData.greeting || "",
        ecard_image: ecardImagePreview || "",
        first_name: "John",
        last_name: "Doe",
      });

      console.log("✅ Preview response received:", response.data);

      if (response.data.success && response.data.html_content) {
        setPreviewHtml(response.data.html_content);
        toast.success("Preview updated with filled placeholders");
      } else {
        toast.error("Failed to generate preview");
      }
    } catch (error: any) {
      console.error("❌ Preview error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        `API Error: ${error.response?.status || 'Network Error'}`
      );
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDistribute = async () => {
    if (!id) {
      toast.error("Please save the ecard first before distributing");
      return;
    }
    // Reset states when opening
    setDistributeToAllUsers(true);
    setSelectedDistributeUsers([]);
    setDistributeRecipientType('all');
    setDistributeDate(undefined);
    setDistributeTime('');
    setShowDistributeDialog(true);

    // Fetch users list for dropdown
    setIsLoadingDistributeUsers(true);
    try {
      const response = await getUsersList();
      setUsersList(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users list:", error);
      toast.error("Failed to load users list");
    } finally {
      setIsLoadingDistributeUsers(false);
    }
  };

  const handleConfirmDistribute = () => {
    if (!id) {
      toast.error("Please save the ecard first");
      return;
    }

    // Validation
    if (!distributeToAllUsers && selectedDistributeUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (distributeDate && !distributeTime) {
      toast.error("Please select a time for scheduled distribution");
      return;
    }

    // Prepare scheduled_at datetime
    let scheduledAt: string;
    if (distributeDate && distributeTime) {
      // Combine date and time
      const [hours, minutes] = distributeTime.split(':');
      const scheduledDate = new Date(distributeDate);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      scheduledAt = scheduledDate.toISOString();
    } else {
      // Default to now
      scheduledAt = new Date().toISOString();
    }

    // Prepare distribution data
    const distributionData: CreateEcardDistributionData = {
      ecard: Number(id),
      status: "pending",
      users: distributeToAllUsers ? [] : selectedDistributeUsers,
      send_to_all: distributeToAllUsers,
      recipient_type: distributeRecipientType,
      scheduled_at: scheduledAt,
      is_active: true,
    };

    distributeMutation.mutate(distributionData);
  };

  const handleSend = async () => {
    setShowSendDialog(true);
    setShowSendPreview(false);
    setSendPreviewHtml(null);

    // Fetch users list for dropdown
    try {
      const response = await getUsersList();
      setUsersList(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users list:", error);
      toast.error("Failed to load users list");
    }
  };

  const handlePreviewBeforeSend = async () => {
    if (!id) {
      toast.error("Please save the ecard first before sending");
      return;
    }

    if (!selectedUserId) {
      toast.error("Please select a user to fill the ecard data");
      return;
    }

    if (!formData.email_html) {
      toast.error("Please upload an email HTML template first");
      return;
    }

    // Generate preview with selected user's data
    setIsLoadingPreview(true);
    try {
      const response = await previewEcardHtml(selectedUserId, {
        email_html: formData.email_html,
        ecard_text: formData.ecard_text || "",
        email_preheader: formData.email_preheader || "",
        greeting: formData.greeting || "",
        ecard_image: ecardImagePreview || "",
        first_name: "John",
        last_name: "Doe",
      });

      if (response.data.success && response.data.html_content) {
        setSendPreviewHtml(response.data.html_content);
        setShowSendPreview(true);
      } else {
        toast.error("Failed to generate preview");
      }
    } catch (error: any) {
      console.error("Preview error:", error);
      toast.error(error.response?.data?.error || "Failed to generate preview");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirmSend = () => {
    if (!id) {
      toast.error("Please save the ecard first before sending");
      return;
    }

    if (!selectedUserId) {
      toast.error("Please select a user to fill the ecard data");
      return;
    }

    // Find the selected user's email
    const selectedUser = usersList.find((user) => user.id === selectedUserId);
    if (!selectedUser) {
      toast.error("Selected user not found");
      return;
    }

    // Send to the selected user
    sendMutation.mutate({
      ecardId: Number(id),
      recipient_type: 'custom',
      custom_emails: [selectedUser.email],
      user_id: selectedUserId
    });
  };

  const handleSendTestEcard = () => {
    if (!id) {
      toast.error("Please save the ecard first before sending");
      return;
    }

    if (!selectedUserId) {
      toast.error("Please select a user to send test email");
      return;
    }

    // Find the selected user's email
    const selectedUser = usersList.find((user) => user.id === selectedUserId);
    if (!selectedUser) {
      toast.error("Selected user not found");
      return;
    }

    // Send test email to the selected user
    sendMutation.mutate({
      ecardId: Number(id),
      recipient_type: 'custom',
      custom_emails: [selectedUser.email],
      user_id: selectedUserId
    });
  };

  const handleSelectEcardForEdit = (ecard: IEcard) => {
    if (ecard.id) {
      navigate(`/ecards/edit/${ecard.id}`);
      setShowEditListDialog(false);
    }
  };

  const handleSelectEcardForDelete = (ecard: IEcard) => {
    setSelectedEcard(ecard);
    setShowDeleteListDialog(false);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedEcard?.id) {
      deleteMutation.mutate(selectedEcard.id);
    }
  };

  if (isEditMode && isLoadingEcard) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PageHeader
      title={isEditMode ? "Edit Ecard" : "Create Ecard"}
      description={
        isEditMode
          ? "Update ecard information"
          : "Create a new ecard or email template for all users"
      }
      actions={[
        {
          label: "Back to List",
          onClick: () => navigate("/ecards"),
          variant: "outline",
          icon: ArrowLeft,
        },
        ...(isEditMode && id
          ? [
              {
                label: "Send Ecard",
                onClick: handleSend,
                variant: "default" as const,
                icon: Send,
              },
            ]
          : []),
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Details</CardTitle>
            <CardDescription>
              Fill in the information for the ecard or email template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Type Selection */}
            <div className="flex items-center space-x-2">
              <Switch
                id="email_type"
                checked={formData.email_type === "ecard"}
                onCheckedChange={(checked) =>
                  handleInputChange("email_type", checked ? "ecard" : "email")
                }
              />
              <Label htmlFor="email_type" className="cursor-pointer">
                {formData.email_type === "ecard" ? "Ecard" : "Normal Email"}
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-4 w-full">
                {/* Email Name */}
                <div className="space-y-2">
                  <Label htmlFor="email_name">
                    Email Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email_name"
                    placeholder="e.g., New Years v 11"
                    value={formData.email_name}
                    onChange={(e) =>
                      handleInputChange("email_name", e.target.value)
                    }
                  />
                </div>

                {/* Email Subject */}
                <div className="space-y-2">
                  <Label htmlFor="email_subject">
                    Email Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email_subject"
                    placeholder="e.g., Happy 4th of July"
                    value={formData.email_subject}
                    onChange={(e) =>
                      handleInputChange("email_subject", e.target.value)
                    }
                  />
                </div>

                {/* Email Preheader */}
                <div className="space-y-2">
                  <Label htmlFor="email_preheader">Email Preheader</Label>
                  <Input
                    id="email_preheader"
                    placeholder="e.g., Have a safe holiday"
                    value={formData.email_preheader}
                    onChange={(e) =>
                      handleInputChange("email_preheader", e.target.value)
                    }
                  />
                </div>

                {/* Greeting */}
                <div className="space-y-2">
                  <Label htmlFor="greeting">Greeting</Label>
                  <Input
                    id="greeting"
                    placeholder="e.g., Hi {first_name}"
                    value={formData.greeting}
                    onChange={(e) =>
                      handleInputChange("greeting", e.target.value)
                    }
                  />
                </div>

                {/* Single User Email */}
                <div className="space-y-2">
                  <Label htmlFor="single_user_email">
                    Single User Email (Optional)
                  </Label>
                  <Input
                    id="single_user_email"
                    type="email"
                    placeholder="e.g., user@example.com"
                    value={formData.single_user_email}
                    onChange={(e) =>
                      handleInputChange("single_user_email", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to send to all users, or enter an email to send
                    to a single user only
                  </p>
                </div>

                {/* Email Category */}
                <div className="space-y-2">
                  <Label htmlFor="email_category">Email Category</Label>
                  <Select
                    value={String(formData.email_category)}
                    onValueChange={(value) =>
                      handleInputChange("email_category", Number(value))
                    }
                  >
                    <SelectTrigger id="email_category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_CATEGORIES.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={String(category.value)}
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ecard Date - Only show for ecards */}
                {formData.email_type === "ecard" &&
                  formData.email_category !== 1 &&
                  formData.email_category !== 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="ecard_date">Ecard Date</Label>
                      <div className="w-full">
                        <DatePicker
                          value={formData.ecard_date ? new Date(formData.ecard_date) : undefined}
                          onChange={(date: Date | undefined) =>
                            handleInputChange("ecard_date", date ? format(date, 'yyyy-MM-dd') : "")
                          }
                          placeholder="Select ecard date"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The date when the ecard should be sent (e.g., 7/4/2026
                        for 4th of July)
                      </p>
                    </div>
                  )}

                {/* Ecard Text - Only for creating ecards */}
                {formData.email_type === "ecard" && (
                  <div className="space-y-2">
                    <Label htmlFor="ecard_text">Ecard Text</Label>
                    <Textarea
                      id="ecard_text"
                      placeholder="Happy 4th of July! We honor the enduring spirit of liberty and unity that defines our nation.<BR>Please let me know if I can help you or anyone you know with my services.<BR> Thank You."
                      value={formData.ecard_text}
                      onChange={(e) =>
                        handleInputChange("ecard_text", e.target.value)
                      }
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use HTML codes like &lt;BR&gt; for line breaks
                    </p>
                  </div>
                )}

                {/* Upload Image */}
                <div className="space-y-2">
                  <Label htmlFor="ecard_image">
                    <FileImage className="inline h-4 w-4 mr-2" />
                    Upload Image (668x350)
                  </Label>
                  <Input
                    id="ecard_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files?.[0] || null)
                    }
                  />
                  {ecardImagePreview && (
                    <div className="mt-2 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                      <img
                        src={ecardImagePreview}
                        alt="Ecard Preview"
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Upload Email HTML */}
                <div className="space-y-2">
                  <Label htmlFor="upload_email">
                    <FileCode className="inline h-4 w-4 mr-2" />
                    Upload Email HTML
                  </Label>
                  <Input
                    id="upload_email"
                    type="file"
                    accept=".html,.htm"
                    onChange={(e) =>
                      handleHtmlFileUpload(e.target.files?.[0] || null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a complete HTML email file (optional)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_name">
                  Email Preview
                  {isLoadingPreview && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Loading...
                    </span>
                  )}
                  {previewHtml && !isLoadingPreview && (
                    <span className="ml-2 text-xs text-green-600">
                      (Filled from backend)
                    </span>
                  )}
                </Label>
                <div className="bg-accent h-full w-full rounded-2xl">
                  {/* Show filled preview from backend if available, otherwise show raw HTML */}
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-full bg-white"
                      title="Email Preview (Filled)"
                      sandbox="allow-same-origin"
                    />
                  ) : formData.email_html ? (
                    <iframe
                      srcDoc={formData.email_html}
                      className="w-full h-full bg-white"
                      title="Email Preview (Raw)"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="h-full flex justify-center items-center">
                      No Preview available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Email Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="custom_email"
                checked={formData.custom_email}
                onCheckedChange={(checked) =>
                  handleInputChange("custom_email", checked)
                }
              />
              <Label htmlFor="custom_email" className="cursor-pointer">
                Custom Email (Don't copy to new users)
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={saveMutation.isPending}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleEdit}
                disabled={saveMutation.isPending}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={saveMutation.isPending}
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={saveMutation.isPending || isLoadingPreview}
              >
                {isLoadingPreview ? "Loading..." : "Preview"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDistribute}
                disabled={saveMutation.isPending}
              >
                Distribute
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Edit List Dialog */}
      <Dialog open={showEditListDialog} onOpenChange={setShowEditListDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Ecard to Edit</DialogTitle>
            <DialogDescription>
              Choose an ecard from the list to edit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {ecardsList.map((ecard) => (
              <div
                key={ecard.id}
                className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleSelectEcardForEdit(ecard)}
              >
                <div className="font-medium">{ecard.email_name}</div>
                <div className="text-sm text-muted-foreground">
                  {ecard.email_subject}
                </div>
              </div>
            ))}
            {ecardsList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No ecards available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete List Dialog */}
      <Dialog
        open={showDeleteListDialog}
        onOpenChange={setShowDeleteListDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Ecard to Delete</DialogTitle>
            <DialogDescription>
              Choose an ecard from the list to delete
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {ecardsList.map((ecard) => (
              <div
                key={ecard.id}
                className="p-4 border rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                onClick={() => handleSelectEcardForDelete(ecard)}
              >
                <div className="font-medium">{ecard.email_name}</div>
                <div className="text-sm text-muted-foreground">
                  {ecard.email_subject}
                </div>
              </div>
            ))}
            {ecardsList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No ecards available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Ecard Dialog */}
      <Dialog
        open={showSendDialog}
        onOpenChange={(open) => {
          setShowSendDialog(open);
          if (!open) {
            // Reset all states when dialog is closed
            setShowSendPreview(false);
            setSendPreviewHtml(null);
            setSelectedUserId(null);
            setCustomEmails('');
            setRecipientType('all');
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showSendPreview ? "Preview & Confirm Send" : "Send Ecard"}
            </DialogTitle>
            <DialogDescription>
              {showSendPreview
                ? "Review the ecard preview below and confirm to send"
                : "Select a user and preview the ecard before sending"}
            </DialogDescription>
          </DialogHeader>

          {!showSendPreview ? (
            // Step 1: Select Recipients
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user_select">Select User</Label>
                  <Select
                    value={selectedUserId?.toString()}
                    onValueChange={(value) => setSelectedUserId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersList.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} {user.company && `(${user.company})`} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSendDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendTestEcard}
                  disabled={!selectedUserId || sendMutation.isPending}
                >
                  {sendMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handlePreviewBeforeSend}
                  disabled={isLoadingPreview || !selectedUserId}
                >
                  {isLoadingPreview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Preview...
                    </>
                  ) : (
                    "Verify & Preview"
                  )}
                </Button>
              </div>
            </>
          ) : (
            // Step 2: Preview & Confirm
            <>
              <div className="space-y-4 py-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 text-sm font-medium">
                    Email Preview
                  </div>
                  {sendPreviewHtml && (
                    <iframe
                      srcDoc={sendPreviewHtml}
                      className="w-full h-[400px] bg-white"
                      title="Ecard Preview Before Send"
                      sandbox="allow-same-origin"
                    />
                  )}
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm">
                  <p className="text-blue-700 dark:text-blue-300">
                    User: <span className="font-medium">
                      {usersList.find(u => u.id === selectedUserId)?.name || 'Selected User'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSendPreview(false)}
                  disabled={sendMutation.isPending}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSend}
                  disabled={sendMutation.isPending}
                >
                  {sendMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Confirm & Send
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ecard "{selectedEcard?.email_name}" from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Distribute Dialog */}
      <Dialog
        open={showDistributeDialog}
        onOpenChange={(open) => {
          setShowDistributeDialog(open);
          if (!open) {
            // Reset states when closing
            setDistributeToAllUsers(true);
            setSelectedDistributeUsers([]);
            setDistributeRecipientType('all');
            setDistributeDate(undefined);
            setDistributeTime('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Ecard Distribution</DialogTitle>
            <DialogDescription>
              Configure and schedule distribution for this ecard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label>Select Users</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="all-users"
                  checked={distributeToAllUsers}
                  onCheckedChange={setDistributeToAllUsers}
                />
                <Label htmlFor="all-users" className="font-normal cursor-pointer">
                  Send to all users
                </Label>
              </div>
            </div>

            {!distributeToAllUsers && (
              <div className="space-y-2">
                <Label htmlFor="select-users">Select Specific Users</Label>
                <Select
                  value={selectedDistributeUsers.length > 0 ? selectedDistributeUsers[0].toString() : ""}
                  onValueChange={(value) => {
                    const userId = Number(value);
                    if (!selectedDistributeUsers.includes(userId)) {
                      setSelectedDistributeUsers([...selectedDistributeUsers, userId]);
                    }
                  }}
                  disabled={isLoadingDistributeUsers}
                >
                  <SelectTrigger id="select-users">
                    <SelectValue placeholder={isLoadingDistributeUsers ? "Loading users..." : "Select users..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDistributeUsers ? (
                      <SelectItem value="loading" disabled>
                        Loading users...
                      </SelectItem>
                    ) : usersList.length === 0 ? (
                      <SelectItem value="no-users" disabled>
                        No users found
                      </SelectItem>
                    ) : (
                      usersList.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedDistributeUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDistributeUsers.map((userId) => {
                      const user = usersList.find((u) => u.id === userId);
                      return user ? (
                        <div
                          key={userId}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                        >
                          <span>{user.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDistributeUsers(
                                selectedDistributeUsers.filter((id) => id !== userId)
                              )
                            }
                            className="ml-1 hover:text-primary/70"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Recipient Type */}
            <div className="space-y-2">
              <Label htmlFor="recipient-type">Recipient Type</Label>
              <Select
                value={distributeRecipientType}
                onValueChange={(value: 'all' | 'contact' | 'partner') =>
                  setDistributeRecipientType(value)
                }
              >
                <SelectTrigger id="recipient-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts & Partners</SelectItem>
                  <SelectItem value="contact">Contacts Only</SelectItem>
                  <SelectItem value="partner">Partners Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Send Date */}
            <div className="space-y-2">
              <Label>Send Date (Optional)</Label>
              <DatePicker
                value={distributeDate}
                onChange={setDistributeDate}
                placeholder="Select a date"
              />
            </div>

            {/* Send Time */}
            {distributeDate && (
              <div className="space-y-2">
                <Label htmlFor="send-time">Send Time</Label>
                <Input
                  id="send-time"
                  type="time"
                  value={distributeTime}
                  onChange={(e) => setDistributeTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDistributeDialog(false)}
              disabled={distributeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDistribute}
              disabled={distributeMutation.isPending}
            >
              {distributeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Distribution"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </PageHeader>
  );
}
