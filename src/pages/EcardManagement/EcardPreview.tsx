import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getDefaultEmail } from '@/services/ecardService';

export default function EcardPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch ecard data
  const { data, isLoading } = useQuery({
    queryKey: ['default-email', id],
    queryFn: () => getDefaultEmail(Number(id)),
    enabled: !!id,
  });

  const ecard = data?.data;

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
          {/* Show HTML content if available */}
          {ecard.email_html ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={ecard.email_html}
                className="w-full h-[600px] bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            /* Show image if available */
            ecard.ecard_image && typeof ecard.ecard_image === 'string' ? (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={ecard.ecard_image}
                  alt={ecard.email_name}
                  className="w-full h-auto"
                />
              </div>
            ) : (
              /* Show text content */
              <div className="p-6 border rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold mb-4">{ecard.email_subject}</h3>
                {ecard.email_preheader && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {ecard.email_preheader}
                  </p>
                )}
                {ecard.ecard_text && (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: ecard.ecard_text.replace(/<BR>/gi, '<br>') }}
                  />
                )}
              </div>
            )
          )}

          {/* Email Details */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Email Type:</span>{' '}
              <span className="capitalize">{ecard.email_type}</span>
            </div>
            <div>
              <span className="font-semibold">Custom Email:</span>{' '}
              {ecard.custom_email ? 'Yes' : 'No'}
            </div>
            {ecard.ecard_date && (
              <div>
                <span className="font-semibold">Ecard Date:</span>{' '}
                {new Date(ecard.ecard_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageHeader>
  );
}
