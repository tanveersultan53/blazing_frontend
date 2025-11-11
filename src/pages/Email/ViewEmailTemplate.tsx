import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Edit } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import Loading from '@/components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEmailTemplateById } from '@/services/emailService';
import type { User } from '@/redux/features/userSlice';
import type { EmailTemplate } from './interface';

const ViewEmailTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);

  const { data, isLoading, error } = useQuery({
    queryKey: ['emailTemplate', id],
    queryFn: () => getEmailTemplateById(id as string | number),
    enabled: !!id,
  });

  const template: EmailTemplate | undefined = data?.data;

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: currentUser?.is_superuser ? '/' : '/user-dashboard' },
    { label: 'Email Management', path: '/email' },
    { label: template?.email_name || 'Template Details' }
  ], [currentUser?.is_superuser, template?.email_name]);

  useBreadcrumbs(breadcrumbs);

  const handleEdit = () => {
   
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Template Not Found"
          description="The email template you're looking for doesn't exist."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.email_name || 'Email Template'}
        description={template.email_subject || 'View email template details'}
        actions={[
          {
            label: 'Edit',
            onClick: handleEdit,
            variant: 'default',
            icon: Edit,
          },
        ]}
      >
        <div className="flex w-full flex-col gap-6">
          {/* Template Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Template Name</label>
                  <p className="text-sm font-semibold mt-1">{template.email_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <p className="text-sm font-semibold mt-1">{template.email_subject || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Type</label>
                  <p className="text-sm font-semibold mt-1">
                    {template.email_type ? `ECard ${template.email_type}` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">E-Card Status</label>
                  <div className="mt-1">
                    <Badge variant={template.send_ecard ? "default" : "secondary"}>
                      {template.send_ecard ? "Send" : "Don't Send"}
                    </Badge>
                  </div>
                </div>
                {template.email_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Template ID</label>
                    <p className="text-sm font-semibold mt-1">{template.email_id}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* HTML Content Card */}
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">HTML Content</label>
                  {template.email_html ? (
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50 max-h-96 overflow-auto">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: template.email_html }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No HTML content available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHeader>
    </div>
  );
};

export default ViewEmailTemplate;

