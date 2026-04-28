import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  getMyLibrary,
  deleteCustomerEmailTemplate,
  updateCustomerEmailTemplate,
  previewCustomerTemplate,
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
  Eye,
  Edit,
  Loader2,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MyEmailTemplates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<UnifiedEmailTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<UnifiedEmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<UnifiedEmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editHtmlContent, setEditHtmlContent] = useState('');

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

  // Update mutation for editing
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { email_subject?: string; html_content?: string } }) =>
      updateCustomerEmailTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-email-library'] });
      toast.success('Email updated successfully');
      setEditDialogOpen(false);
      setEditTemplate(null);
    },
    onError: () => {
      toast.error('Failed to update email');
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

  const handlePreview = async (template: UnifiedEmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewHtml(null);
    setPreviewDialogOpen(true);

    // Fetch merged preview from backend
    if (template.source === 'customer') {
      setIsLoadingPreview(true);
      try {
        const response = await previewCustomerTemplate(template.id);
        if (response.data.success && response.data.html_content) {
          setPreviewHtml(response.data.html_content);
        } else {
          // Fallback to raw HTML
          setPreviewHtml(template.html_content || null);
        }
      } catch {
        // Fallback to raw HTML if preview endpoint fails
        setPreviewHtml(template.html_content || null);
      } finally {
        setIsLoadingPreview(false);
      }
    } else {
      // Library templates don't have user-specific merge codes
      setPreviewHtml(template.html_content || null);
    }
  };

  const handleEdit = (template: UnifiedEmailTemplate) => {
    if (template.source !== 'customer') {
      toast.error('Standard library templates cannot be edited. Create a copy first.');
      return;
    }
    setEditTemplate(template);
    setEditSubject(template.email_subject || '');
    setEditHtmlContent(template.html_content || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editTemplate) return;
    updateMutation.mutate({
      id: editTemplate.id,
      data: {
        email_subject: editSubject,
        html_content: editHtmlContent,
      },
    });
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline',
    'color', 'background',
    'align',
    'list', 'bullet',
    'link',
  ];

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
      label: 'Edit',
      icon: Edit,
      onClick: (row: UnifiedEmailTemplate) => handleEdit(row),
      disabled: (row: UnifiedEmailTemplate) => row.source !== 'customer',
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
      disabled: (row: UnifiedEmailTemplate) => row.source !== 'customer',
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
            <strong>Get Started:</strong> You don't have any templates yet. Click "Create Email" above to select from professional templates in our library.
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) { setDeleteDialogOpen(false); setTemplateToDelete(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.email_name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <p className="text-lg">Loading preview with your information...</p>
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditDialogOpen(false);
          setEditTemplate(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>Edit Email</DialogTitle>
            <DialogDescription>
              Edit the subject and content of your email template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-2">
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Email Subject</Label>
              <Input
                id="edit-subject"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>
            <div className="space-y-2">
              <Label>Email Content</Label>
              <div className="border rounded-md">
                <ReactQuill
                  theme="snow"
                  value={editHtmlContent}
                  onChange={setEditHtmlContent}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter the email content..."
                  style={{ minHeight: '300px' }}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setEditDialogOpen(false); setEditTemplate(null); }}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
