import { useState } from 'react';
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

interface CreateEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: { name: string; subject: string; isDefault: boolean }) => void;
}

export const CreateEmailTemplateModal = ({
  isOpen,
  onClose,
  onCreateTemplate,
}: CreateEmailTemplateModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subject.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onCreateTemplate(formData);
      toast.success('Email template created successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to create email template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', subject: '', isDefault: false });
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Email Template</DialogTitle>
          <DialogDescription>
            Create a new email template with a name and subject. You can also set it as the default template.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="template-name" className="text-sm font-medium mb-2">Template Name *</label>
            <Input
              id="template-name"
              placeholder="Enter template name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="template-subject" className="text-sm font-medium mb-2">Subject *</label>
            <Input
              id="template-subject"
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
            />
          </div>
          
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
  );
};
