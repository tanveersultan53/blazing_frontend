import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  createDefaultEmail,
  updateDefaultEmail,
  getDefaultEmail,
  deleteDefaultEmail,
  distributeEcard,
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
    custom_email: false,
  });

  const [ecardImagePreview, setEcardImagePreview] = useState<string | null>(
    null
  );
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditListDialog, setShowEditListDialog] = useState(false);
  const [showDeleteListDialog, setShowDeleteListDialog] = useState(false);
  const [showPreviewListDialog, setShowPreviewListDialog] = useState(false);
  const [ecardsList, setEcardsList] = useState<IEcard[]>([]);
  const [selectedEcard, setSelectedEcard] = useState<IEcard | null>(null);

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
  };

  const handleHtmlFileUpload = async (file: File | null) => {
    if (file) {
      setUploadedHtmlFile(file);
      // Read HTML file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData((prev) => ({ ...prev, email_html: content }));
        setEcardImagePreview(content); // Show HTML preview
      };
      reader.readAsText(file);
    } else {
      setUploadedHtmlFile(null);
      setFormData((prev) => ({ ...prev, email_html: "" }));
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
    if (formData.ecard_image instanceof File) {
      submitData.append("ecard_image", formData.ecard_image);
    }

    saveMutation.mutate(submitData);
  };

  // Fetch all ecards for Edit/Delete/Preview lists
  const { data: ecardsData } = useQuery({
    queryKey: ["default-emails"],
    queryFn: async () => {
      const { getDefaultEmails } = await import("@/services/ecardService");
      return getDefaultEmails();
    },
    enabled:
      showEditListDialog || showDeleteListDialog || showPreviewListDialog,
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
      custom_email: false,
    });
    setEcardImagePreview(null);
    setUploadedHtmlFile(null);
  };

  const handleEdit = () => {
    setShowEditListDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteListDialog(true);
  };

  const handlePreview = () => {
    setShowPreviewListDialog(true);
  };

  const handleDistribute = () => {
    if (id) {
      distributeMutation.mutate(Number(id));
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

  const handleSelectEcardForPreview = (ecard: IEcard) => {
    setSelectedEcard(ecard);
    setShowPreviewListDialog(false);
    setShowPreviewDialog(true);
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
                      <Input
                        id="ecard_date"
                        type="date"
                        value={formData.ecard_date}
                        onChange={(e) =>
                          handleInputChange("ecard_date", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        The date when the ecard should be sent (e.g., 7/4/2026
                        for 4th of July)
                      </p>
                    </div>
                  )}

                {/* Ecard Text - Only for creating ecards */}
                {formData.email_type === "ecard" && !uploadedHtmlFile && (
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
                <Label htmlFor="email_name">Email Preview</Label>
                <div className="bg-accent h-full w-full rounded-2xl">
                  {/* HTML Preview - Full Width */}
                  {formData.email_html ? (
                    <iframe
                      srcDoc={formData.email_html}
                      className="w-full h-full bg-white"
                      title="Email Preview"
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
                disabled={saveMutation.isPending}
              >
                Preview
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

      {/* Preview List Dialog */}
      <Dialog
        open={showPreviewListDialog}
        onOpenChange={setShowPreviewListDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Ecard to Preview</DialogTitle>
            <DialogDescription>
              Choose an ecard from the list to preview
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {ecardsList.map((ecard) => (
              <div
                key={ecard.id}
                className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleSelectEcardForPreview(ecard)}
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

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedEcard?.email_name}</DialogTitle>
            <DialogDescription>
              Subject: {selectedEcard?.email_subject}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] rounded-lg border-2">
            {selectedEcard?.email_html ? (
              <iframe
                srcDoc={selectedEcard.email_html}
                className="w-full h-[65vh] bg-white"
                title="Ecard Preview"
                sandbox="allow-same-origin"
              />
            ) : selectedEcard?.ecard_image &&
              typeof selectedEcard.ecard_image === "string" ? (
              <img
                src={selectedEcard.ecard_image}
                alt={selectedEcard.email_name}
                className="w-full h-auto"
              />
            ) : selectedEcard?.ecard_text ? (
              <div className="p-6">
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedEcard.ecard_text.replace(/<BR>/gi, "<br>"),
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p>No preview available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
