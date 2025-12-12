import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  FileText,
  Eye,
  Paperclip,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import type { User } from "@/redux/features/userSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmailEditor from "react-email-editor";
import useCreateTemplate from "./useCreateTemplate";

const CreateTemplate = () => {
  const currentUser = useSelector(
    (state: { user: { currentUser: User } }) => state.user.currentUser
  );
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const templateData = location.state?.template;

  // Determine if we're in edit mode
  const isEditMode = !!id;

  const {
    form,
    onSubmit,
    isSubmitting,
    users,
    isLoadingUsers,
    emailEditorRef,
    handleHtmlFileUpload,
    handleAttachmentUpload,
    removeAttachment,
    attachmentFiles,
    uploadedHtmlFile,
    htmlPreview,
    loadHtmlIntoEditor,
  } = useCreateTemplate();

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Check if user is admin
  const isAdmin = currentUser?.is_staff || currentUser?.is_superuser;

  // Breadcrumbs
  const breadcrumbs = useMemo(
    () => [
      {
        label: "Dashboard",
        path: currentUser?.is_superuser ? "/" : "/user-dashboard",
      },
      { label: "Template Management", path: "/template-management" },
      { label: isEditMode ? "Edit Template" : "Create Template" },
    ],
    [currentUser?.is_superuser, isEditMode]
  );

  useBreadcrumbs(breadcrumbs);

  // Redirect non-admin users
  if (!isAdmin) {
    navigate("/user-dashboard");
    return null;
  }

  const selectedUserId = watch("assigned_user_id");

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Template" : "Create Template"}
        description={
          isEditMode
            ? `Edit the email template: ${templateData?.name || ""}`
            : "Create a new email template with custom HTML and attachments."
        }
        actions={[
          {
            label: "Back",
            onClick: () => navigate("/template-management"),
            variant: "outline",
            icon: ArrowLeft,
          },
        ]}
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter template name"
                  {...register("name", {
                    required: "Template name is required",
                  })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Assigned User Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="assigned_user_id">
                  Assign to User <span className="text-red-500">*</span>
                </Label>
                {isLoadingUsers ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading users...
                  </div>
                ) : (
                  <Select
                    value={selectedUserId?.toString() || ""}
                    onValueChange={(value) =>
                      setValue("assigned_user_id", parseInt(value))
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.assigned_user_id
                          ? "border-red-500 w-full"
                          : "w-full"
                      }
                    >
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.first_name} {user.last_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.assigned_user_id && (
                  <p className="text-sm text-red-500">
                    {errors.assigned_user_id.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HTML Template Upload */}
        <Card>
          <CardHeader>
            <CardTitle>HTML Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="html_file">Upload HTML File</Label>
              <div className="relative">
                <Input
                  id="html_file"
                  type="file"
                  accept=".html,.htm"
                  onChange={handleHtmlFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {uploadedHtmlFile
                        ? uploadedHtmlFile.name
                        : "No file chosen"}
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Choose File
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Upload an HTML file for your email template
              </p>
            </div>

            {/* Preview and Load Buttons */}
            {uploadedHtmlFile && htmlPreview && (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview HTML
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="!max-w-[98vw] w-[98vw] max-h-[95vh] sm:!max-w-[98vw]">
                    <DialogHeader>
                      <DialogTitle>HTML Preview</DialogTitle>
                    </DialogHeader>
                    <iframe
                      srcDoc={htmlPreview}
                      className="w-full h-[calc(100vh-150px)] border rounded"
                      title="HTML Preview"
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadHtmlIntoEditor}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Load into Editor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attachments">Upload Attachments</Label>
              <div className="relative">
                <Input
                  id="attachments"
                  type="file"
                  accept=".png,.jpeg,.jpg,.pdf,.doc,.docx"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {attachmentFiles.length > 0
                        ? `${attachmentFiles.length} file(s) selected`
                        : "No files chosen"}
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Choose Files
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: .png, .jpeg, .pdf, .doc, .docx
              </p>
            </div>

            {/* List of Uploaded Files */}
            {attachmentFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {attachmentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Preview Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Email Template Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <EmailEditor ref={emailEditorRef} minHeight="600px" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Design your email template using the editor above. You can also
              load the uploaded HTML file into this editor.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pb-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/template-management")}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {isEditMode ? "Saving Changes..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {isEditMode ? "Save Changes" : "Save Template"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplate;
