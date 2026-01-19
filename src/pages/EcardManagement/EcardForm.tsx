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
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  createDefaultEmail,
  updateDefaultEmail,
  getDefaultEmail,
  deleteDefaultEmail,
  distributeEcard,
  previewEcardHtml,
  sendEcard,
  getUsersList,
} from "@/services/ecardService";
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

  // Fetch ecard data if editing
  const { data: ecardData, isLoading: isLoadingEcard } = useQuery({
    queryKey: ["default-email", id],
    queryFn: () => getDefaultEmail(Number(id)),
    enabled: isEditMode,
  });

  // Handle ecard data when it changes
  useEffect(() => {
    if (ecardData?.data) {
      const data = ecardData.data;
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

  // Distribute mutation
  const distributeMutation = useMutation({
    mutationFn: (ecardId: number) => distributeEcard(ecardId),
    onSuccess: (response) => {
      const count = response.data?.users_count || 0;
      toast.success(`Ecard distributed to ${count} users successfully!`);
    },
    onError: (error: any) => {
      console.error("Distribute ecard error:", error);
      toast.error(error.response?.data?.error || "Failed to distribute ecard");
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
      const response = await previewEcardHtml(1, {
        email_html: formData.email_html,
        ecard_text: formData.ecard_text || "",
        email_preheader: formData.email_preheader || "",
        greeting: formData.greeting || "",
        ecard_image: ecardImagePreview || "",
        first_name: "John",
        last_name: "Doe",
      });

      if (response.data.success && response.data.html_content) {
        setPreviewHtml(response.data.html_content);
        toast.success("Preview updated with filled placeholders");
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

  const handleDistribute = () => {
    if (id) {
      distributeMutation.mutate(Number(id));
    }
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

    if (recipientType === 'custom') {
      const emails = customEmails.split(',').map(email => email.trim()).filter(email => email);
      if (emails.length === 0) {
        toast.error("Please enter at least one email address");
        return;
      }
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

    if (recipientType === 'custom') {
      const emails = customEmails.split(',').map(email => email.trim()).filter(email => email);
      if (emails.length === 0) {
        toast.error("Please enter at least one email address");
        return;
      }
      sendMutation.mutate({
        ecardId: Number(id),
        recipient_type: recipientType,
        custom_emails: emails,
        user_id: selectedUserId
      });
    } else {
      sendMutation.mutate({
        ecardId: Number(id),
        recipient_type: recipientType,
        user_id: selectedUserId
      });
    }
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
                  {ecardImagePreview && !formData.email_html && (
                    <div className="mt-2 p-4 border rounded-lg">
                      <img
                        src={ecardImagePreview}
                        alt="Ecard Preview"
                        className="max-w-full h-auto"
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
                ? "Review the ecard preview below and confirm to send to recipients"
                : "Select recipients and preview the ecard before sending"}
            </DialogDescription>
          </DialogHeader>

          {!showSendPreview ? (
            // Step 1: Select Recipients
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user_select">Select User (Whose Data to Fill)</Label>
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
                  <p className="text-xs text-muted-foreground">
                    This user's data (photo, logo, address, etc.) will be used to fill the ecard placeholders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_type">Recipient Type</Label>
                  <Select
                    value={recipientType}
                    onValueChange={(value: 'contacts' | 'partners' | 'all' | 'custom') => setRecipientType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts & Partners</SelectItem>
                      <SelectItem value="contacts">Contacts Only</SelectItem>
                      <SelectItem value="partners">Partners Only</SelectItem>
                      <SelectItem value="custom">Custom Email Addresses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recipientType === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom_emails">Email Addresses</Label>
                    <Textarea
                      id="custom_emails"
                      placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)"
                      value={customEmails}
                      onChange={(e) => setCustomEmails(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple email addresses with commas
                    </p>
                  </div>
                )}
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
                  onClick={handlePreviewBeforeSend}
                  disabled={isLoadingPreview}
                >
                  {isLoadingPreview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Preview...
                    </>
                  ) : (
                    "Next: Preview"
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
                    Email Preview (with sample data: John Doe)
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
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Ready to Send
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Filled with data from: <span className="font-medium">
                      {usersList.find(u => u.id === selectedUserId)?.name || 'Selected User'}
                    </span>
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Recipients: <span className="font-medium">
                      {recipientType === 'all' ? 'All Contacts & Partners' :
                       recipientType === 'contacts' ? 'Contacts Only' :
                       recipientType === 'partners' ? 'Partners Only' :
                       'Custom Email Addresses'}
                    </span>
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    Each recipient will receive a personalized version with their own name but with the selected user's branding/contact info.
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

    </PageHeader>
  );
}
