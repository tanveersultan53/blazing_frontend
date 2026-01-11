import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { getNewsletters, deleteNewsletter } from '@/services/newsletterService';
import type { INewsletter } from './interface';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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

export default function NewslettersList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch newsletters
  const { data, isLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => getNewsletters(),
  });

  const newsletters = data?.data?.results || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNewsletter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Newsletter deleted successfully!');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Delete newsletter error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete newsletter');
      setDeleteId(null);
    },
  });

  // Memoize breadcrumbs
  const breadcrumbs = useMemo(() => [{ label: 'Newsletters' }], []);
  useBreadcrumbs(breadcrumbs);

  // Define columns
  const columns = useMemo<ColumnDef<INewsletter>[]>(
    () => [
      {
        accessorKey: 'newsletter_label',
        header: 'Newsletter Label',
        cell: ({ row }) => (
          <div className="font-medium">{row.original.newsletter_label}</div>
        ),
      },
      {
        accessorKey: 'scheduled_date',
        header: 'Scheduled Date',
        cell: ({ row }) => {
          const date = row.original.scheduled_date;
          const time = row.original.scheduled_time;
          if (!date) return <span className="text-muted-foreground">Not scheduled</span>;

          try {
            const formattedDate = format(new Date(date), 'MMM dd, yyyy');
            return (
              <div>
                <div>{formattedDate}</div>
                {time && <div className="text-xs text-muted-foreground">{time}</div>}
              </div>
            );
          } catch {
            return <span>{date}</span>;
          }
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'created',
        header: 'Created',
        cell: ({ row }) => {
          const created = row.original.created;
          if (!created) return <span className="text-muted-foreground">—</span>;

          try {
            return format(new Date(created), 'MMM dd, yyyy');
          } catch {
            return <span>{created}</span>;
          }
        },
      },
    ],
    []
  );

  const handleCreateNewsletter = () => {
    navigate('/newsletters/create');
  };

  const handleDelete = (row: INewsletter) => {
    setDeleteId(row.id!);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader
        title="Newsletter Management"
        description="Create and manage your newsletters, schedule sends, and track performance."
        actions={[
          {
            label: 'Create Newsletter',
            onClick: handleCreateNewsletter,
            variant: 'default',
            icon: Plus,
          },
        ]}
      >
        <DataTable
          columns={columns}
          data={newsletters}
          searchColumns={['newsletter_label', 'scheduled_date', 'status']}
          showActionsColumn
          onViewDetails={(row: INewsletter) => navigate(`/newsletters/${row.id}`)}
          actionItems={[
            {
              label: 'View',
              icon: Eye,
              onClick: (row: INewsletter) => navigate(`/newsletters/${row.id}`),
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: (row: INewsletter) => navigate(`/newsletters/edit/${row.id}`),
            },
            {
              label: 'Delete',
              icon: Trash2,
              className: 'text-red-600',
              onClick: handleDelete,
            },
          ]}
        />
      </PageHeader>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the newsletter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
