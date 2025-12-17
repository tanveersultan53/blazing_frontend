import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAvailableTemplates,
  createCustomerEmailTemplate,
  type SystemEmailTemplate,
  type CustomerEmailTemplate
} from '@/services/emailService';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Copy, Eye, Loader2, FileText, Settings, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EMAIL_TYPES = [
  { value: 1, label: 'Holiday Ecard 1' },
  { value: 2, label: 'Holiday Ecard 2' },
  { value: 3, label: 'Holiday Ecard 3' },
  { value: 4, label: 'Holiday Ecard 4' },
  { value: 5, label: 'Holiday Ecard 5' },
  { value: 6, label: 'Holiday Ecard 6' },
  { value: 7, label: 'Holiday Ecard 7' },
  { value: 8, label: 'Holiday Ecard 8' },
  { value: 9, label: 'Holiday Ecard 9' },
  { value: 10, label: 'Holiday Ecard 10' },
  { value: 11, label: 'Holiday Ecard 11' },
  { value: 12, label: 'Holiday Ecard 12' },
  { value: 13, label: 'Holiday Ecard 13' },
  { value: 14, label: 'Birthday Ecard' },
  { value: 15, label: 'Newsletter' },
  { value: 99, label: 'Custom Email' },
];

export default function BrowseTemplates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewTemplate, setPreviewTemplate] = useState<SystemEmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copyingTemplateId, setCopyingTemplateId] = useState<number | null>(null);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<SystemEmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailType, setEmailType] = useState<number>(99);
  const [isActive, setIsActive] = useState(true);
  const [sendEcard, setSendEcard] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  // Fetch available templates for Email Library
  const { data, isLoading } = useQuery({
    queryKey: ['available-email-templates'],
    queryFn: () => getAvailableTemplates({ is_active: true }),
  });

  // Handle both array response and paginated response formats
  const templates = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.results || []);

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (data: CustomerEmailTemplate) => createCustomerEmailTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['available-email-templates'] });
      toast.success(`Email template "${templateName}" created successfully! You can now send emails using this template.`);
      setCopyingTemplateId(null);
      setTemplateName('');
      setEmailSubject('');
      setEmailType(99);
      setIsActive(true);
      setSendEcard(true);
      setIsDefault(false);
      setSelectedTemplate(null);
      navigate('/my-email-templates');
    },
    onError: (error: any) => {
      console.error('Create template error:', error);
      toast.error(error.response?.data?.error || 'Failed to create template');
      setCopyingTemplateId(null);
    },
  });

  const handleCreateTemplate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template from the library');
      return;
    }

    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    setCopyingTemplateId(selectedTemplate.id);

    const payload: CustomerEmailTemplate = {
      template: selectedTemplate.id,
      email_name: templateName,
      email_subject: emailSubject,
      email_type: emailType,
      html_content: selectedTemplate.html_content || '',
      send_ecard: sendEcard,
      is_default: isDefault,
      is_active: isActive,
    };

    createMutation.mutate(payload);
  };

  const handlePreview = (template: SystemEmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <PageHeader
      title="Create Email Template"
      description="Choose a template from the library dropdown and customize the details to create your email template."
      actions={[
        {
          label: 'Back to Templates',
          onClick: () => navigate('/my-email-templates'),
          variant: 'outline',
          icon: ArrowLeft,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Create Template Form */}
        <Card className="border-2">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Create Email Template</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to create your custom email template
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Section 1: Template Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Template Source
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-select" className="text-base">
                  Select Template from Library <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedTemplate ? String(selectedTemplate.id) : ''}
                    onValueChange={(value) => {
                      const template = templates.find((t: SystemEmailTemplate) => t.id === Number(value));
                      if (template) {
                        setSelectedTemplate(template);
                        setTemplateName(template.name);
                        setEmailSubject(template.name);
                      }
                    }}
                  >
                    <SelectTrigger id="template-select" className="flex-1 h-11">
                      <SelectValue placeholder="Choose a professional template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                      ) : templates.length === 0 ? (
                        <SelectItem value="empty" disabled>No templates available</SelectItem>
                      ) : (
                        templates.map((template: SystemEmailTemplate) => (
                          <SelectItem key={template.id} value={String(template.id)}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {template.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      onClick={() => handlePreview(selectedTemplate)}
                      title="Preview Template"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedTemplate && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Selected: {selectedTemplate.name}</p>
                      <p className="text-xs text-muted-foreground">Type: {selectedTemplate.type}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Basic Information
                </h3>
              </div>

              {/* Template Name and Email Type in one row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Template Name */}
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="template-name" className="text-sm">
                    Template Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Monthly Newsletter"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>

                {/* Email Type Dropdown */}
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="email-type" className="text-sm">Email Type</Label>
                  <Select
                    value={String(emailType)}
                    onValueChange={(value) => setEmailType(Number(value))}
                  >
                    <SelectTrigger id="email-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={String(type.value)}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Subject */}
                <div className="space-y-2 md:col-span-6">
                  <Label htmlFor="email-subject" className="text-sm">
                    Email Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email-subject"
                    placeholder="e.g., Your Monthly Update"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Template Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Template Options
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Active Status */}
                <div className="flex items-center justify-between rounded-lg border-2 p-4 bg-card hover:border-primary/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-active" className="text-sm font-semibold cursor-pointer">
                      Active Status
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>

                {/* Send as Ecard */}
                <div className="flex items-center justify-between rounded-lg border-2 p-4 bg-card hover:border-primary/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="send-ecard" className="text-sm font-semibold cursor-pointer">
                      Send as Ecard
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {sendEcard ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Switch
                    id="send-ecard"
                    checked={sendEcard}
                    onCheckedChange={setSendEcard}
                  />
                </div>

                {/* Set as Default */}
                <div className="flex items-center justify-between rounded-lg border-2 p-4 bg-card hover:border-primary/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-default" className="text-sm font-semibold cursor-pointer">
                      Set as Default
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isDefault ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Switch
                    id="is-default"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/my-email-templates')}
                disabled={copyingTemplateId !== null}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={copyingTemplateId !== null || !selectedTemplate}
                size="lg"
                className="min-w-[180px]"
              >
                {copyingTemplateId !== null ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Create Template
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh]">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl">{previewTemplate?.name}</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Preview of the email template design
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] rounded-lg border-2">
            {previewTemplate?.html_content ? (
              <iframe
                srcDoc={previewTemplate.html_content}
                className="w-full h-[65vh] bg-white"
                title="Template Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No preview available</p>
                <p className="text-sm">This template doesn't have preview content</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} size="lg">
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
