import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import SettingsForm from './SettingsForm.tsx';
import type { User } from '@/redux/features/userSlice';
import { XIcon, CheckIcon, Edit } from 'lucide-react';

const Settings = () => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: currentUser?.is_superuser ? '/' : '/user-dashboard' },
    { label: 'Settings' }
  ], [currentUser?.is_superuser]);

  useBreadcrumbs(breadcrumbs);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setIsSubmitting(false);
  };

  const handleSave = () => {
    // Trigger form submission by dispatching a custom event
    window.dispatchEvent(new CustomEvent('submitSettingsForm'));
  };

  const handleSaveComplete = () => {
    setIsEditMode(false);
    setIsSubmitting(false);
  };

  const handleSaveError = () => {
    setIsSubmitting(false);
  };

  const pageActions = isEditMode ? [
    {
      label: 'Cancel',
      onClick: handleCancel,
      variant: 'secondary' as const,
      size: 'sm' as const,
      icon: XIcon,
      disabled: isSubmitting
    },
    {
      label: isSubmitting ? 'Saving...' : 'Save Changes',
      onClick: handleSave,
      variant: 'default' as const,
      size: 'sm' as const,
      icon: CheckIcon,
      disabled: isSubmitting
    }
  ] : [
    {
      label: 'Edit Settings',
      onClick: handleEdit,
      variant: 'default' as const,
      size: 'sm' as const,
      icon: Edit
    }
  ];

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your application settings and preferences."
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your application settings and preferences."
        actions={pageActions}
      />
      <div className="pb-3">
        <SettingsForm 
          userId={currentUser.rep_id} 
          isEditMode={isEditMode}
          onSaveComplete={handleSaveComplete}
          onSaveError={handleSaveError}
        />
      </div>
    </div>
  );
};

export default Settings;
