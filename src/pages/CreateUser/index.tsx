import React, { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import UserForm from './UserForm';

const CreateUser: React.FC = () => {

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [
    { label: 'Users', path: '/' },
    { label: 'Create User' }
  ], []);

  useBreadcrumbs(breadcrumbs);

  return (
    <PageHeader
      title="Create New User"
      description="Add a new user to your application with their details, role, and permissions."

    >
      <div className="space-y-6 mb-6">
        <UserForm />
      </div>
    </PageHeader>
  );
};

export default CreateUser;
