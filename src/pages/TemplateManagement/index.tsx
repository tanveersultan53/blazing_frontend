import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import type { User } from '@/redux/features/userSlice';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/data-table';
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
import useTemplateManagement from './useTemplateManagement';
import type { ITemplate } from './interface';

const TemplateManagement = () => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ITemplate | null>(null);

  // Check if user is admin (staff or superuser)
  const isAdmin = currentUser?.is_staff || currentUser?.is_superuser;

  const {
    columns,
    data,
    isLoading,
    isFetching,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
  } = useTemplateManagement();

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: currentUser?.is_superuser ? '/' : '/user-dashboard' },
    { label: 'Template Management' }
  ], [currentUser?.is_superuser]);

  useBreadcrumbs(breadcrumbs);

  const handleCreateTemplate = () => {
    navigate('/template-management/create');
  };

  const handleViewTemplate = (template: ITemplate) => {
    navigate(`/template-management/view/${template.id}`, {
      state: { template }
    });
  };

  const handleEditTemplate = (template: ITemplate) => {
    navigate(`/template-management/edit/${template.id}`, {
      state: { template }
    });
  };

  const handleDeleteTemplate = (template: ITemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      console.log('Delete template:', templateToDelete);
      // TODO: Implement delete template functionality
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  // Action items for each row
  const actionItems = [
    {
      label: 'Edit template',
      icon: Pencil,
      onClick: (row: ITemplate) => handleEditTemplate(row),
    },
    {
      label: 'Delete template',
      icon: Trash2,
      className: 'text-red-600',
      onClick: (row: ITemplate) => handleDeleteTemplate(row),
    },
  ];

  // Column titles mapping for filter placeholders
  const columnTitles = {
    'name': 'Template Name',
    'assigned_user': 'Assigned User',
    'created_at': 'Created Date',
  };

  // Redirect non-admin users
  if (!isAdmin) {
    navigate('/user-dashboard');
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Management"
        description="Manage your templates and their assignments."
        actions={[
          {
            label: 'Create Template',
            onClick: handleCreateTemplate,
            variant: 'default',
            icon: Plus,
          },
        ]}
      />

      <div className="pb-3">
        <DataTable
          columns={columns}
          data={data}
          searchColumns={['name', 'assigned_user']}
          showActionsColumn={true}
          actionItems={actionItems}
          columnTitles={columnTitles}
          enableRowSelection={false}
          filters={filters as Record<string, string | undefined>}
          onFilterChange={(key: string, value: string) => updateFilter(key, value)}
          onClearFilter={(key: string) => clearFilter(key)}
          onClearAllFilters={clearAllFilters}
          globalSearch={globalSearch}
          onGlobalSearchChange={updateGlobalSearch}
          isLoading={isLoading}
          isFetching={isFetching}
          onViewDetails={(row: ITemplate) => handleViewTemplate(row)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template "{templateToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplateManagement;
