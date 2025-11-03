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

interface CreateEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: EmailTemplate) => void;
  defaultTemplate: DefaultEmailTemplate[];
}

export const CreateEmailTemplateModal = ({
  isOpen,
  onClose,
  onCreateTemplate,
  defaultTemplate,
}: CreateEmailTemplateModalProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    isDefault: boolean;
    isActive: boolean;
    customer: number | undefined;
    template: number | undefined;
  }>({
    name: '',
    subject: '',
    isDefault: false,
    isActive: true,
    customer: undefined,
    template: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewTemplateOpen, setIsViewTemplateOpen] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.subject.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    onCreateTemplate({
      name: formData.name,
      subject: formData.subject,
      is_default: formData.isDefault,
      customer: formData.customer,
      template: formData.template,
      is_active: formData.isActive,
    });
  };

  const handleClose = () => {
    setFormData({ 
      name: '', 
      subject: '', 
      isDefault: false, 
      isActive: true, 
      customer: undefined, 
      template: undefined 
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      template: undefined,
    }));
  };

  // Get the selected template details
  const selectedTemplate = useMemo(() => {
    if (!formData.template) return null;
    return defaultTemplate.find(t => t.id === formData.template);
  }, [formData.template, defaultTemplate]);

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
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a new email template with a name and subject. You can also set it as the default template.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="template-name" className="text-sm font-medium mb-2 block">Template Name *</label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="template-subject" className="text-sm font-medium mb-2 block">Subject *</label>
                <Input
                  id="template-subject"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="default-template" className="text-sm font-medium mb-2 block">
                  Default Template
                </label>
                <div className="relative">
                  <Select 
                    {...(formData.template ? { value: formData.template.toString() } : {})}
                    onValueChange={(value) => handleInputChange('template', parseInt(value, 10))}
                    key={formData.template || 'empty'}
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
                  {formData.template && (
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
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium mb-2 block">Preview</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleViewTemplate}
                  disabled={!formData.template}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Template
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is-default"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleInputChange('isDefault', checked as boolean)}
                />
                <label htmlFor="is-default" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set as default template
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                />
                <label htmlFor="is-active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Make this template active by default
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Template'}
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
