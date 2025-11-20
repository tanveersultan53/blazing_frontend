import { useMemo, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { EmailTemplateList } from './interface';

interface ViewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplateList | null;
}

export const ViewTemplateModal = ({
  isOpen,
  onClose,
  template,
}: ViewTemplateModalProps) => {
  const blobUrlRef = useRef<string | null>(null);

  // Generate iframe source - prefer html_content over html_file
  const iframeSrc = useMemo(() => {
    // Clean up previous blob URL if exists
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (!template) return '';

    // If html_content is available, use it with a blob URL
    if (template.html_content) {
      const blob = new Blob([template.html_content], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;
      return blobUrl;
    }

    // Otherwise, use html_file URL if available
    if (template.html_file) {
      return template.html_file;
    }

    return '';
  }, [template]);

  // Clean up blob URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template?.name || template?.email_name || 'Template Preview'}
          </DialogTitle>
          <DialogDescription>
            {(template?.subject || template?.email_subject) && `Subject: ${template.subject || template.email_subject}`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden min-h-0">
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              className="w-full h-full border rounded-md"
              title="Email Template Preview"
              style={{ minHeight: '600px' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No template content available for preview
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
