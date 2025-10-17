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

const Email = () => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);
  
  const {
    templates,
    columns,
    actionItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTemplate,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
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

  const handleCreateTemplateSubmit = (templateData: { name: string; subject: string; isDefault: boolean }) => {
    createTemplate(templateData);
    setIsCreateModalOpen(false);
  };

  // Column titles mapping for filter placeholders
  const columnTitles = {
    'name': 'Template Name',
    'subject': 'Subject',
    'createdAt': 'Created Date',
    'updatedAt': 'Updated Date',
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
            searchColumns={['name', 'subject']}
            showActionsColumn={true}
            actionItems={actionItems}
            columnTitles={columnTitles}
            enableRowSelection={false}
            filters={filters as Record<string, string | undefined>}
            onFilterChange={(key: string, value: string) => updateFilter(key as keyof typeof filters, value)}
            onClearFilter={(key: string) => clearFilter(key as keyof typeof filters)}
            onClearAllFilters={clearAllFilters}
            globalSearch={globalSearch}
            onGlobalSearchChange={updateGlobalSearch}
            onViewDetails={() => navigate('/email-template-editor')}
          />
        </div>
      </PageHeader>

      {/* Create Template Modal */}
      <CreateEmailTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTemplate={handleCreateTemplateSubmit}
      />

    </div>
  );
};

export default Email;