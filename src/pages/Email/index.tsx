import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import type { User } from '@/redux/features/userSlice';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { CreateEmailTemplateModal } from './CreateEmailTemplateModal';
import useEmail from './useEmail';
import { useNavigate } from 'react-router-dom';
import type { EmailTemplate } from './interface';
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

const Email = () => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);

  const {
    templates,
    columns,
    actionItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isDeleteDialogOpen,
    templateToDelete,
    closeDeleteDialog,
    templateToEdit,
    setTemplateToEdit,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
    defaultTemplate,
  } = useEmail();

  const navigate = useNavigate();

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: currentUser?.is_superuser ? '/' : '/user-dashboard' },
    { label: 'Email Management' }
  ], [currentUser?.is_superuser]);

  useBreadcrumbs(breadcrumbs);

  const handleCreateTemplate = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateTemplateSubmit = (templateData: EmailTemplate) => {
    if (templateToEdit?.email_id) {
      // Update existing template
      updateTemplate({ ...templateData, email_id: templateToEdit.email_id });
    } else {
      // Create new template
      createTemplate(templateData);
    }
  };

  // Column titles mapping for filter placeholders
  const columnTitles = {
    'email_name': 'Template Name',  
    'email_subject': 'Subject',
    'email_type': 'Email Type',
    'send_ecard': 'E-Card Status',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Management"
        description="Manage your email templates and settings."
        actions={[
          {
            label: 'Create Template',
            onClick: handleCreateTemplate,
            variant: 'default',
            icon: Plus,
          },
        ]}
      >
        <div className="pb-3">
          <DataTable
            columns={columns}
            data={templates}
            searchColumns={['email_name', 'email_subject']}
            showActionsColumn={true}
            actionItems={actionItems}
            columnTitles={columnTitles}
            enableRowSelection={false}
            filters={filters as unknown as Record<string, string | undefined>}
            onFilterChange={(key: string, value: string) => updateFilter(key as keyof typeof filters, value)}
            onClearFilter={(key: string) => clearFilter(key as keyof typeof filters)}
            onClearAllFilters={clearAllFilters}
            globalSearch={globalSearch}
            onGlobalSearchChange={updateGlobalSearch}
            onViewDetails={(row: EmailTemplate) => navigate(`/email/${row.email_id}`)}
          />
        </div>
      </PageHeader>

      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <CreateEmailTemplateModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setTemplateToEdit(null);
          }}
          onCreateTemplate={handleCreateTemplateSubmit}
          defaultTemplate={defaultTemplate}
          templateToEdit={templateToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          closeDeleteDialog();
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template "{templateToDelete?.email_name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTemplate}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Email;