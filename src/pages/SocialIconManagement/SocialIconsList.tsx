import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getSocialIcons, deleteSocialIcon } from '@/services/socialIconService';
import type { ISocialIcon } from '@/services/socialIconService';
import type { ColumnDef } from '@tanstack/react-table';
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

export default function SocialIconsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch social icons
  const { data, isLoading } = useQuery({
    queryKey: ['social-icons'],
    queryFn: () => getSocialIcons(),
  });

  const socialIcons = data?.data?.results || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSocialIcon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-icons'] });
      toast.success('Social icon deleted successfully!');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Delete social icon error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete social icon');
      setDeleteId(null);
    },
  });

  // Memoize breadcrumbs
  const breadcrumbs = useMemo(() => [{ label: 'Social Icons Management' }], []);
  useBreadcrumbs(breadcrumbs);

  // Define columns
  const columns = useMemo<ColumnDef<ISocialIcon>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'mapping_key',
        header: 'Mapping Key',
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.original.mapping_key}</div>
        ),
      },
      {
        accessorKey: 'image',
        header: 'Icon',
        cell: ({ row }) => {
          const imageUrl = typeof row.original.image === 'string' ? row.original.image : null;
          return imageUrl ? (
            <img
              src={imageUrl}
              alt={row.original.name}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
    ],
    []
  );

  const handleCreateSocialIcon = () => {
    navigate('/social-icons/create');
  };

  const handleDelete = (row: ISocialIcon) => {
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
        title="Social Icons Management"
        description="Manage social media icons and their mapping keys for integration."
        actions={[
          {
            label: 'Create Social Icon',
            onClick: handleCreateSocialIcon,
            variant: 'default',
            icon: Plus,
          },
        ]}
      >
        <DataTable
          columns={columns}
          data={socialIcons}
          searchColumns={['name', 'mapping_key']}
          showActionsColumn
          onViewDetails={(row: ISocialIcon) => navigate(`/social-icons/edit/${row.id}`)}
          actionItems={[
            {
              label: 'Edit',
              icon: Edit,
              onClick: (row: ISocialIcon) => navigate(`/social-icons/edit/${row.id}`),
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
              This action cannot be undone. This will permanently delete the social icon.
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
