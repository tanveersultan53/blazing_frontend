import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { DefaultEmailTemplate, EmailTemplate } from './interface';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Eye, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { User } from '@/redux/features/userSlice';

// Dummy data for email types
const EMAIL_TYPES = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  name: `ECard ${i + 1}`,
}));

interface CreateEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: EmailTemplate) => void;
  defaultTemplate: DefaultEmailTemplate[];
  templateToEdit?: EmailTemplate | null;
}

export const CreateEmailTemplateModal = ({
  isOpen,
  onClose,
  onCreateTemplate,
  defaultTemplate,
  templateToEdit,
}: CreateEmailTemplateModalProps) => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);
  const [formData, setFormData] = useState<EmailTemplate | undefined>({
    company_id: currentUser?.company_id as number,
    rep: currentUser?.id as number,
    email_type: undefined,
    email_name: undefined,
    email_subject: undefined,
    email_html: undefined,
    send_ecard: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewTemplateOpen, setIsViewTemplateOpen] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  // Initialize form data when templateToEdit changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        // Populate form with template data (excluding email_html)
        setFormData({
          company_id: templateToEdit.company_id,
          rep: templateToEdit.rep,
          email_type: templateToEdit.email_type,
          email_name: templateToEdit.email_name,
          email_subject: templateToEdit.email_subject,
          email_html: undefined, // Don't populate email_html
          send_ecard: templateToEdit.send_ecard,
          email_id: templateToEdit.email_id,
        });
      } else {
        // Reset form for new template
        setFormData({
          company_id: currentUser?.company_id as number,
          rep: currentUser?.id as number,
          email_type: undefined,
          email_name: undefined,
          email_subject: undefined,
          email_html: undefined,
          send_ecard: false,
        });
      }
    }
  }, [isOpen, templateToEdit, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData?.email_name?.trim() || !formData?.email_subject?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    
    onCreateTemplate(formData as EmailTemplate);
  };

  const handleClose = () => {
    setFormData({
      company_id: currentUser?.company_id as number,
      rep: currentUser?.id as number,
      email_type: undefined,
      email_name: undefined,
      email_subject: undefined,
      email_html: undefined,
      send_ecard: false,
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData({
      ...formData as EmailTemplate,
      [field]: value as string | boolean,
    });
  };

  const handleClearTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      ...formData as EmailTemplate,
      email_html: undefined,
    });
  };

  // Get the selected template details
  const selectedTemplate = useMemo(() => {
    if (!formData?.email_html) return null;
    return defaultTemplate.find(t => t.id === Number(formData?.email_html));
  }, [formData?.email_html, defaultTemplate]);

  // Generate iframe source - prefer html_content over html_file
  const iframeSrc = useMemo(() => {
    // Clean up previous blob URL if exists
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (!selectedTemplate) return '';

    // If html_content is available, use it with a blob URL
    // if (selectedTemplate.html_content) {
    //   const blob = new Blob([selectedTemplate.html_content], { type: 'text/html' });
    //   const blobUrl = URL.createObjectURL(blob);
    //   blobUrlRef.current = blobUrl;
    //   return blobUrl;
    // }

    // Otherwise, use html_file URL
    if (selectedTemplate.html_file) {
      return selectedTemplate.html_file;
    }

    return '';
  }, [selectedTemplate]);

  const handleViewTemplate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    setIsViewTemplateOpen(true);
  };

  // Clean up blob URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleCloseViewTemplate = () => {
    setIsViewTemplateOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{templateToEdit ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
            <DialogDescription>
              {templateToEdit 
                ? 'Update the email template details. Note: The HTML template cannot be changed during edit.'
                : 'Create a new email template with a name and subject. You can also set it as the default template.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="template-name" className="text-sm font-medium mb-2 block">Template Name *</label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={formData?.email_name || ''}
                  onChange={(e) => handleInputChange('email_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="template-subject" className="text-sm font-medium mb-2 block">Subject *</label>
                <Input
                  id="template-subject"
                  placeholder="Enter email subject"
                  value={formData?.email_subject || ''}
                  onChange={(e) => handleInputChange('email_subject', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="default-template" className="text-sm font-medium mb-2 block">
                  Default Template
                </label>
                <div className="relative">
                  <Select
                    {...(formData?.email_html ? { value: formData?.email_html.toString() } : {})}
                    onValueChange={(value) => handleInputChange('email_html', parseInt(value, 10))}
                    key={formData?.email_html || 'empty'}
                    disabled={!!templateToEdit}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select default template" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultTemplate.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData?.email_html && !templateToEdit && (
                    <button
                      type="button"
                      onClick={handleClearTemplate}
                      className="absolute right-9 top-1/2 -translate-y-1/2 z-10 rounded-full p-1 hover:bg-muted transition-colors"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                {templateToEdit && (
                  <p className="text-xs text-muted-foreground">Template HTML cannot be changed during edit.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium mb-2 block">Preview</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleViewTemplate}
                  disabled={!formData?.email_html}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Template
                </Button>
              </div>
              <div className="space-y-2">
                <label htmlFor="email-type" className="text-sm font-medium mb-2 block">
                  Email Type
                </label>
                <div className="relative">
                  <Select
                    {...(formData?.email_type ? { value: formData?.email_type.toString() } : {})}
                    onValueChange={(value) => handleInputChange('email_type', parseInt(value, 10))}
                    key={formData?.email_type || 'empty'}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select email type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData?.email_type && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputChange('email_type', undefined);
                      }}
                      className="absolute right-9 top-1/2 -translate-y-1/2 z-10 rounded-full p-1 hover:bg-muted transition-colors"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="send-ecard"
                checked={formData?.send_ecard || false}
                onCheckedChange={(checked) => handleInputChange('send_ecard', checked as boolean)}
              />
              <label htmlFor="send-ecard" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Send e-card
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (templateToEdit ? 'Updating...' : 'Creating...') 
                  : (templateToEdit ? 'Update Template' : 'Create Template')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog open={isViewTemplateOpen} onOpenChange={handleCloseViewTemplate}>
        <DialogContent className="sm:max-w-[90vw] max-w-[1200px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.name || 'Template Preview'}
            </DialogTitle>
            <DialogDescription>
              Preview of the selected email template
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
                No template content available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
