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
import { Switch } from "@/components/ui/switch";
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

  // Check if user is admin
  const isAdmin = currentUser?.is_staff || currentUser?.is_superuser;

  const {
    form,
    onSubmit,
    isSubmitting,
    users,
    isLoadingUsers,
    isLoadingTemplate,
    emailEditorRef,
    handleHtmlFileUpload,
    uploadedHtmlFile,
    htmlPreview,
    loadHtmlIntoEditor,
    template,
  } = useCreateTemplate({
    templateId: id,
    templateData: templateData,
    isAdmin: isAdmin,
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Breadcrumbs
  const breadcrumbs = useMemo(
    () => [
      {
        label: "Dashboard",
        path: currentUser?.is_superuser ? "/" : "/user-dashboard",
      },
      { label: "Email Library", path: "/template-management" },
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
  const selectedType = watch("type");
  const isActive = watch("is_active");

  // Show loading state while fetching template data in edit mode
  if (isEditMode && isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Template" : "Create Template"}
        description={
          isEditMode
            ? `Edit the email template: ${template?.name || ""}`
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

              {/* Template Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Template Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedType || "newsletter"}
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectTrigger
                    className={
                      errors.type ? "border-red-500 w-full" : "w-full"
                    }
                  >
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Is Active Toggle */}
              <div className="space-y-2">
                <Label htmlFor="is_active">Active Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue("is_active", checked)}
                  />
                  <Label htmlFor="is_active" className="font-normal cursor-pointer">
                    {isActive ? "Template is active" : "Template is inactive"}
                  </Label>
                </div>
              </div>

              {/* HTML File Upload */}
              <div className="space-y-2 md:col-span-2">
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
                <div className="md:col-span-2">
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
                </div>
              )}
            </div>
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
