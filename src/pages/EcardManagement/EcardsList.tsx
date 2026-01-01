import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import { Plus, Eye, Edit, Trash2, Send } from 'lucide-react';
import { getDefaultEmails, deleteDefaultEmail, distributeEcard } from '@/services/ecardService';
import type { IEcard } from './interface';
import { EMAIL_CATEGORIES } from './interface';
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

export default function EcardsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch default emails/ecards
  const { data, isLoading } = useQuery({
    queryKey: ['default-emails'],
    queryFn: () => getDefaultEmails(),
  });

  const ecards = data?.data?.results || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDefaultEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-emails'] });
      toast.success('Ecard deleted successfully!');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Delete ecard error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete ecard');
      setDeleteId(null);
    },
  });

  // Distribute mutation
  const distributeMutation = useMutation({
    mutationFn: (id: number) => distributeEcard(id),
    onSuccess: (response) => {
      const count = response.data?.users_count || 0;
      toast.success(`Ecard distributed to ${count} users successfully!`);
    },
    onError: (error: any) => {
      console.error('Distribute ecard error:', error);
      toast.error(error.response?.data?.error || 'Failed to distribute ecard');
    },
  });

  // Memoize breadcrumbs
  const breadcrumbs = useMemo(() => [{ label: 'Ecard Management' }], []);
  useBreadcrumbs(breadcrumbs);

  // Get category label
  const getCategoryLabel = (categoryValue: number) => {
    const category = EMAIL_CATEGORIES.find(cat => cat.value === categoryValue);
    return category?.label || 'Unknown';
  };

  // Define columns
  const columns = useMemo<ColumnDef<IEcard>[]>(
    () => [
      {
        accessorKey: 'email_name',
        header: 'Email Name',
        cell: ({ row }) => (
          <div className="font-medium">{row.original.email_name}</div>
        ),
      },
      {
        accessorKey: 'email_subject',
        header: 'Subject',
        cell: ({ row }) => (
          <div className="max-w-xs truncate">{row.original.email_subject}</div>
        ),
      },
      {
        accessorKey: 'email_type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant={row.original.email_type === 'ecard' ? 'default' : 'secondary'}>
            {row.original.email_type === 'ecard' ? 'Ecard' : 'Email'}
          </Badge>
        ),
      },
      {
        accessorKey: 'email_category',
        header: 'Category',
        cell: ({ row }) => (
          <div>{getCategoryLabel(row.original.email_category)}</div>
        ),
      },
      {
        accessorKey: 'ecard_date',
        header: 'Ecard Date',
        cell: ({ row }) => {
          const date = row.original.ecard_date;
          if (!date) return <span className="text-muted-foreground">—</span>;

          try {
            return format(new Date(date), 'MMM dd, yyyy');
          } catch {
            return <span>{date}</span>;
          }
        },
      },
      {
        accessorKey: 'custom_email',
        header: 'Custom',
        cell: ({ row }) => (
          <Badge variant={row.original.custom_email ? 'outline' : 'secondary'}>
            {row.original.custom_email ? 'Yes' : 'No'}
          </Badge>
        ),
      },
    ],
    []
  );

  const handleCreateEcard = () => {
    navigate('/ecards/create');
  };

  const handleDelete = (row: IEcard) => {
    setDeleteId(row.id!);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleDistribute = (row: IEcard) => {
    if (row.id) {
      distributeMutation.mutate(row.id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader
        title="Ecard Management"
        description="Create and manage default emails and ecards that will be distributed to all users."
        actions={[
          {
            label: 'Create Ecard',
            onClick: handleCreateEcard,
            variant: 'default',
            icon: Plus,
          },
        ]}
      >
        <DataTable
          columns={columns}
          data={ecards}
          searchColumns={['email_name', 'email_subject', 'email_type', 'email_category']}
          showActionsColumn
          onViewDetails={(row: IEcard) => navigate(`/ecards/preview/${row.id}`)}
          actionItems={[
            {
              label: 'Preview',
              icon: Eye,
              onClick: (row: IEcard) => navigate(`/ecards/preview/${row.id}`),
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: (row: IEcard) => navigate(`/ecards/edit/${row.id}`),
            },
            {
              label: 'Distribute',
              icon: Send,
              onClick: handleDistribute,
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
              This action cannot be undone. This will permanently delete the ecard/email
              from the default email list.
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
