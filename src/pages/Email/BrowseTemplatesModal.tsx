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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye } from 'lucide-react';
import type { DefaultEmailTemplate } from './interface';
import { toast } from 'sonner';

interface BrowseTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: DefaultEmailTemplate[];
  onCopyTemplate: (templateId: number, customName?: string) => void;
}

export const BrowseTemplatesModal = ({
  isOpen,
  onClose,
  templates,
  onCopyTemplate,
}: BrowseTemplatesModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DefaultEmailTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Group templates by type
  const templatesByType = templates.reduce((acc, template) => {
    const type = template.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(template);
    return acc;
  }, {} as Record<string, DefaultEmailTemplate[]>);

  const handlePreview = (template: DefaultEmailTemplate) => {
    setPreviewHtml(template.html_content || '');
    setShowPreview(true);
  };

  const handleCopy = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    onCopyTemplate(selectedTemplate.id, customName || undefined);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomName('');
    setPreviewHtml('');
    setShowPreview(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Browse Email Templates</DialogTitle>
          <DialogDescription>
            Select a template to copy and customize for your needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs defaultValue={Object.keys(templatesByType)[0] || 'all'}>
            <TabsList>
              {Object.keys(templatesByType).map((type) => (
                <TabsTrigger key={type} value={type} className="capitalize">
                  {type} ({templatesByType[type].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(templatesByType).map(([type, typeTemplates]) => (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typeTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {template.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {template.type}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={template.is_active ? 'default' : 'secondary'}
                          >
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(template);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(template);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Select
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {selectedTemplate && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">Customize Template</h3>
              <div className="space-y-2">
                <Label htmlFor="custom-name">
                  Custom Name (Optional)
                </Label>
                <Input
                  id="custom-name"
                  placeholder={`Copy of ${selectedTemplate.name}`}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use the original template name
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!selectedTemplate}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Template
          </Button>
        </DialogFooter>

        {/* Preview Dialog */}
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-5xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Template Preview</DialogTitle>
              </DialogHeader>
              <div className="overflow-auto max-h-[70vh] border rounded-lg">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px]"
                  title="Email Template Preview"
                  sandbox="allow-same-origin"
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setShowPreview(false)}>
                  Close Preview
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};
