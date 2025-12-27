import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  getCustomerEmailTemplates,
  deleteCustomerEmailTemplate,
  type CustomerEmailTemplate
} from '@/services/emailService';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trash2,
  Send,
  FileText,
  Info,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EMAIL_TYPE_LABELS: Record<number, string> = {
  1: 'Holiday Ecard 1', 2: 'Holiday Ecard 2', 3: 'Holiday Ecard 3',
  4: 'Holiday Ecard 4', 5: 'Holiday Ecard 5', 6: 'Holiday Ecard 6',
  7: 'Holiday Ecard 7', 8: 'Holiday Ecard 8', 9: 'Holiday Ecard 9',
  10: 'Holiday Ecard 10', 11: 'Holiday Ecard 11', 12: 'Holiday Ecard 12',
  13: 'Holiday Ecard 13', 14: 'Birthday Ecard', 15: 'Newsletter', 99: 'Custom Email'
};

export default function MyEmailTemplates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CustomerEmailTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CustomerEmailTemplate | null>(null);

  // Fetch customer email templates (created by the logged-in customer)
  const { data, isLoading } = useQuery({
    queryKey: ['customer-email-templates', searchQuery],
    queryFn: () => getCustomerEmailTemplates({ search: searchQuery }),
  });

  // Handle both array response and paginated response formats
  const templates = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.results || []);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCustomerEmailTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-email-templates'] });
      toast.success('Template deleted successfully');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const handleDelete = (template: CustomerEmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete?.email_id) {
      deleteMutation.mutate(templateToDelete.email_id);
    }
  };

  const handlePreview = (template: CustomerEmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
  };

  // Define table columns
  const columns: ColumnDef<CustomerEmailTemplate>[] = useMemo(() => [
    {
      accessorKey: "email_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("email_name") as string;
        return <div className="font-medium">{name || 'Untitled'}</div>;
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "email_subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => {
        const subject = row.getValue("email_subject") as string;
        return <div className="max-w-[300px] truncate">{subject || 'No subject'}</div>;
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "email_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("email_type") as number;
        return (
          <Badge variant="secondary">
            {EMAIL_TYPE_LABELS[type] || 'Custom'}
          </Badge>
        );
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge
            variant="outline"
            className={
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return date ? <div>{format(new Date(date), "MMM dd, yyyy")}</div> : <div>-</div>;
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updated_at") as string;
        return date ? <div>{format(new Date(date), "MMM dd, yyyy")}</div> : <div>-</div>;
      },
      enableColumnFilter: false,
    },
  ], []);

  // Action items for each row
  const actionItems = [
    {
      label: 'Preview',
      icon: Eye,
      onClick: (row: CustomerEmailTemplate) => handlePreview(row),
    },
    {
      label: 'Send Email',
      icon: Send,
      onClick: (row: CustomerEmailTemplate) => navigate(`/send-email/${row.email_id}`),
    },
    {
      label: 'Delete',
      icon: Trash2,
      className: 'text-red-600',
      onClick: (row: CustomerEmailTemplate) => handleDelete(row),
    },
  ];

  // Column titles for filter placeholders
  const columnTitles = {
    'email_name': 'Name',
    'email_subject': 'Subject',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Library"
        description="View and manage your email templates. Use these templates to send emails to your contacts."
        actions={[
          {
            label: 'Create Email',
            onClick: () => navigate('/my-email-templates/browse'),
            variant: 'default',
            icon: FileText,
          },
        ]}
      />

      {/* Info Alert */}
      {templates.length === 0 ? (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>Get Started:</strong> You don't have any templates yet. Click "Create Email Template" above to select from professional templates in our library.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            These are your email templates. You can send emails using them or delete them if no longer needed.
          </AlertDescription>
        </Alert>
      )}

      <div className="pb-3">
        <DataTable
          columns={columns}
          data={templates}
          searchColumns={['email_name', 'email_subject']}
          showActionsColumn={true}
          actionItems={actionItems}
          columnTitles={columnTitles}
          enableRowSelection={false}
          globalSearch={searchQuery}
          onGlobalSearchChange={setSearchQuery}
          isLoading={isLoading}
          isFetching={isLoading}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.email_name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh]">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl">{previewTemplate?.email_name}</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Subject: {previewTemplate?.email_subject}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] rounded-lg border-2">
            {previewTemplate?.html_content ? (
              <iframe
                srcDoc={previewTemplate.html_content}
                className="w-full h-[65vh] bg-white"
                title="Template Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No preview available</p>
                <p className="text-sm">This template doesn't have HTML content</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)} size="lg">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
