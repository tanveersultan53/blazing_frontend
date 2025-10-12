import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import SettingsForm from './SettingsForm.tsx';
import type { User } from '@/redux/features/userSlice';

const Settings = () => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);
  

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: currentUser?.is_superuser ? '/' : '/user-dashboard' },
    { label: 'Settings' }
  ], [currentUser?.is_superuser]);

  useBreadcrumbs(breadcrumbs);

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
        actions={[]}
      />
      <div className="pb-3">
        <SettingsForm 
          userId={currentUser.rep_id}
        />
      </div>
    </div>
  );
};

export default Settings;
