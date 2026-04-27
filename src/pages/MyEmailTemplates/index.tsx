import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  getMyLibrary,
  deleteCustomerEmailTemplate,
  type UnifiedEmailTemplate,
} from '@/services/emailService';
import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function MyEmailTemplates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<UnifiedEmailTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<UnifiedEmailTemplate | null>(null);

  // Fetch unified email library (both CustomerEmailTemplate + EmailTemplate)
  const { data, isLoading } = useQuery({
    queryKey: ['my-email-library'],
    queryFn: () => getMyLibrary(),
  });

  const templates = data?.data || [];

  // Delete mutation (only works for customer-source templates)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCustomerEmailTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-email-library'] });
      toast.success('Template deleted successfully');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const handleDelete = (template: UnifiedEmailTemplate) => {
    if (template.source !== 'customer') {
      toast.error('Standard library templates cannot be deleted');
      return;
    }
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete?.id) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };

  const handlePreview = (template: UnifiedEmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
  };

  // Type badge color helper
  const getTypeBadgeClass = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('holiday')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    if (lower.includes('birthday')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    if (lower.includes('newsletter')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (lower === 'standard') return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
    return '';
  };

  // Define table columns
  const columns: ColumnDef<UnifiedEmailTemplate>[] = useMemo(() => [
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
        return <div className="max-w-[300px] truncate">{subject || '-'}</div>;
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="secondary" className={getTypeBadgeClass(type)}>
            {type}
          </Badge>
        );
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => {
        const source = row.getValue("source") as string;
        return (
          <Badge variant="outline" className={
            source === 'library'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
          }>
            {source === 'library' ? 'Library Template' : 'My Email'}
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
  ], []);

  // Action items for each row
  const actionItems = [
    {
      label: 'Preview',
      icon: Eye,
      onClick: (row: UnifiedEmailTemplate) => handlePreview(row),
    },
    {
      label: 'Send Email',
      icon: Send,
      onClick: (row: UnifiedEmailTemplate) => {
        if (row.source === 'customer') {
          navigate(`/send-email/${row.id}`);
        } else {
          toast.info('Send functionality is available for your own templates');
        }
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      className: 'text-red-600',
      onClick: (row: UnifiedEmailTemplate) => handleDelete(row),
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
            These are your email templates including standard library templates and templates assigned to you.
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
              {previewTemplate?.email_subject ? `Subject: ${previewTemplate.email_subject}` : `Type: ${previewTemplate?.type}`}
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
