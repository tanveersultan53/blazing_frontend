import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Send } from 'lucide-react';
import type { EmailTemplateList } from './interface';
import { Input } from '@/components/ui/input';

interface SelectTemplateForSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: EmailTemplateList[];
  onSelectTemplate: (template: EmailTemplateList) => void;
}

export const SelectTemplateForSendModal = ({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: SelectTemplateForSendModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateList | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter active templates
  const activeTemplates = templates.filter(t => t.is_active);

  // Filter by search
  const filteredTemplates = activeTemplates.filter(template => {
    const searchLower = searchQuery.toLowerCase();
    const name = template.name || template.email_name || '';
    const subject = template.subject || template.email_subject || '';

    return name.toLowerCase().includes(searchLower) ||
           subject.toLowerCase().includes(searchLower);
  });

  const handleContinue = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Select Email Template
          </DialogTitle>
          <DialogDescription>
            Choose a template to send to your contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Templates List */}
          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No templates found matching your search' : 'No active templates available'}
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card
                  key={template.id || template.email_id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id ||
                    selectedTemplate?.email_id === template.email_id
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {template.name || template.email_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.subject || template.email_subject}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {template.is_default && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                        <Badge
                          variant={template.is_active ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {template.attachments?.length || 0} attachment(s)
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
          >
            <Send className="w-4 h-4 mr-2" />
            Continue to Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
