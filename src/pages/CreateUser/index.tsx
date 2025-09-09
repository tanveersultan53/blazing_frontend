import React, { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  
  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [
    { label: 'Users', path: '/' },
    { label: 'Create User' }
  ], []);
  
  useBreadcrumbs(breadcrumbs);

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <PageHeader
      title="Create New User"
      description="Add a new user to your application with their details, role, and permissions."
      actions={[
        {
          label: "Back to Users",
          onClick: handleGoBack,
          variant: "outline",
          icon: ArrowLeft,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Empty container for future form implementation */}
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              User Creation Form
            </h3>
            <p className="text-gray-500">
              This is where the user creation form will be implemented.
            </p>
          </div>
        </div>
      </div>
    </PageHeader>
  );
};

export default CreateUser;
