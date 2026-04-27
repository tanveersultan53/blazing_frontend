import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getDefaultEmail, previewEcardHtml } from '@/services/ecardService';
import { useState, useEffect } from 'react';

export default function EcardPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: { user: { currentUser: { id: number | string } } }) => state.user.currentUser);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Fetch ecard data
  const { data, isLoading } = useQuery({
    queryKey: ['default-email', id],
    queryFn: () => getDefaultEmail(Number(id)),
    enabled: !!id,
  });

  const ecard = data?.data;

  // Fetch filled preview HTML when ecard data is loaded
  useEffect(() => {
    const fetchPreview = async () => {
      if (ecard && (ecard.email_html || ecard.ecard_text)) {
        try {
          const previewUserId = Number(currentUser?.id) || 1;
          const response = await previewEcardHtml(previewUserId, {
            email_html: ecard.email_html || '',
            ecard_text: ecard.ecard_text || '',
            email_preheader: ecard.email_preheader || '',
            greeting: ecard.greeting || '',
            ecard_image: typeof ecard.ecard_image === 'string' ? ecard.ecard_image : '',
            first_name: 'John',
            last_name: 'Doe',
          });

          if (response.data.success && response.data.html_content) {
            setPreviewHtml(response.data.html_content);
          }
        } catch (error) {
          console.error('Failed to fetch preview:', error);
        }
      }
    };

    fetchPreview();
  }, [ecard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ecard) {
    return (
      <PageHeader
        title="Ecard Not Found"
        description="The requested ecard could not be found"
        actions={[
          {
            label: 'Back to List',
            onClick: () => navigate('/ecards'),
            variant: 'outline',
            icon: ArrowLeft,
          },
        ]}
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">No ecard found with this ID</p>
        </div>
      </PageHeader>
    );
  }

  return (
    <PageHeader
      title={`Preview: ${ecard.email_name}`}
      description={`Subject: ${ecard.email_subject}`}
      actions={[
        {
          label: 'Back to List',
          onClick: () => navigate('/ecards'),
          variant: 'outline',
          icon: ArrowLeft,
        },
        {
          label: 'Edit',
          onClick: () => navigate(`/ecards/edit/${id}`),
          variant: 'default',
        },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Email Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {previewHtml ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[600px] bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Preview with user data merged in
              </p>
            </div>
          ) : ecard.ecard_image && typeof ecard.ecard_image === 'string' ? (
            <div className="border rounded-lg overflow-hidden">
              <img
                src={ecard.ecard_image}
                alt={ecard.email_name}
                className="w-full h-auto"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading preview...
            </div>
          )}

          {/* Email Details */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Email Type:</span>{' '}
              <span className="capitalize">{ecard.email_type}</span>
            </div>
            {ecard.ecard_date && (
              <div>
                <span className="font-semibold">Ecard Date:</span>{' '}
                {new Date(ecard.ecard_date).toLocaleDateString()}
              </div>
            )}
            {ecard.greeting && (
              <div>
                <span className="font-semibold">Greeting:</span>{' '}
                {ecard.greeting}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageHeader>
  );
}
