import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Pencil, Eye, Download, Paperclip, User, Calendar, FileText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import type { User as UserType } from "@/redux/features/userSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const ViewTemplate = () => {
  const currentUser = useSelector(
    (state: { user: { currentUser: UserType } }) => state.user.currentUser
  );
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const templateData = location.state?.template;

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
      { label: "View Template" },
    ],
    [currentUser?.is_superuser]
  );

  useBreadcrumbs(breadcrumbs);

  // Redirect non-admin users
  if (!isAdmin) {
    navigate("/user-dashboard");
    return null;
  }

  // Dummy data for demonstration
  const dummyTemplate = {
    id: id || 1,
    name: templateData?.name || "Welcome Email Template",
    assigned_user: templateData?.assigned_user || "John Doe",
    assigned_user_id: templateData?.assigned_user_id || 1,
    created_at: templateData?.created_at || new Date().toISOString(),
    updated_at: templateData?.updated_at || new Date().toISOString(),
    html_content: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px; }
            .content { margin: 20px 0; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Our Platform!</h1>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>Thank you for joining us. We're excited to have you on board!</p>
            <p>Best regards,<br>The Team</p>
          </div>
        </body>
      </html>
    `,
  };

  // Dummy attachments
  const dummyAttachments = [
    { id: 1, name: "welcome-banner.png", size: 245.5, type: "image/png" },
    { id: 2, name: "terms-and-conditions.pdf", size: 1024.8, type: "application/pdf" },
    { id: 3, name: "user-guide.docx", size: 512.3, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  ];

  const handleEdit = () => {
    navigate(`/template-management/edit/${id}`, {
      state: { template: dummyTemplate },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="View Template"
        description={`Template details for: ${dummyTemplate.name}`}
        actions={[
          {
            label: "Edit",
            onClick: handleEdit,
            variant: "default",
            icon: Pencil,
          },
          {
            label: "Back",
            onClick: () => navigate("/template-management"),
            variant: "outline",
            icon: ArrowLeft,
          },
        ]}
      />

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Template Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Template Name</span>
              </div>
              <p className="text-lg font-semibold">{dummyTemplate.name}</p>
            </div>

            {/* Assigned User */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assigned User</span>
              </div>
              <p className="text-lg font-semibold">{dummyTemplate.assigned_user}</p>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created Date</span>
              </div>
              <p className="text-base">
                {format(new Date(dummyTemplate.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
              </p>
            </div>

            {/* Updated Date */}
            {dummyTemplate.updated_at && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated</span>
                </div>
                <p className="text-base">
                  {format(new Date(dummyTemplate.updated_at), "MMMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          {dummyAttachments.length > 0 ? (
            <div className="space-y-2">
              {dummyAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.size.toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attachments available</p>
          )}
        </CardContent>
      </Card>

      {/* HTML Template Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>HTML Template</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Full Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="!max-w-[98vw] w-[98vw] max-h-[95vh] sm:!max-w-[98vw]">
                <DialogHeader>
                  <DialogTitle>HTML Template Preview</DialogTitle>
                </DialogHeader>
                <iframe
                  srcDoc={dummyTemplate.html_content}
                  className="w-full h-[calc(100vh-150px)] border rounded"
                  title="Full HTML Preview"
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <iframe
              srcDoc={dummyTemplate.html_content}
              className="w-full h-[400px] border-0"
              title="HTML Preview"
            />
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">HTML Source Code</p>
            <div className="bg-muted/50 p-4 rounded-md overflow-x-auto">
              <pre className="text-xs">
                <code>{dummyTemplate.html_content}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Status */}
      <Card>
        <CardHeader>
          <CardTitle>Template Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-sm">Active</Badge>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">
              This template is currently active and can be used for email campaigns
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewTemplate;
