import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import type { User } from '@/redux/features/userSlice';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EmailTemplateEditorModal } from './EmailTemplateEditorModal';
import { SendEmailModal } from './SendEmailModal';
import useEmail from './useEmail';
import { useNavigate } from 'react-router-dom';
import type { EmailTemplate } from './interface';

const Email = () => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);

  const {
    templates,
    columns,
    actionItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isSendModalOpen,
    editingTemplate,
    viewingTemplate,
    sendingTemplate,
    modalMode,
    createTemplate,
    updateTemplate,
    closeEditModal,
    closeViewModal,
    closeSendModal,
    handleSendEmail,
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
    createTemplate(templateData);
  };

  const handleUpdateTemplateSubmit = (templateData: EmailTemplate) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, templateData);
    }
  };

  // Column titles mapping for filter placeholders
  const columnTitles = {
    'name': 'Template Name',
    'subject': 'Subject',
    'is_default': 'Is Default',
    'is_active': 'Is Active',
    'created_at': 'Created At',
    'updated_at': 'Updated At',
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
      {isCreateModalOpen && (
        <EmailTemplateEditorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSaveTemplate={handleCreateTemplateSubmit}
          defaultTemplates={defaultTemplate}
          mode="create"
        />
      )}

      {/* Edit Template Modal */}
      {isEditModalOpen && editingTemplate && (
        <EmailTemplateEditorModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSaveTemplate={handleUpdateTemplateSubmit}
          defaultTemplates={defaultTemplate}
          editTemplate={editingTemplate}
          mode="edit"
        />
      )}

      {/* View Template Modal */}
      {isViewModalOpen && viewingTemplate && (
        <EmailTemplateEditorModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          onSaveTemplate={() => {}} // No-op since it's view mode
          defaultTemplates={defaultTemplate}
          editTemplate={viewingTemplate}
          mode="view"
        />
      )}

      {/* Send Email Modal */}
      {isSendModalOpen && sendingTemplate && (
        <SendEmailModal
          isOpen={isSendModalOpen}
          onClose={closeSendModal}
          template={sendingTemplate}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default Email;