import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EmailEditor, { type EditorRef } from 'react-email-editor';
import {
  getCustomerEmailTemplate,
  createCustomerEmailTemplate,
  updateCustomerEmailTemplate,
  uploadAttachment,
  deleteAttachment,
  getAttachments,
  getSystemTemplateById,
  type CustomerEmailTemplate
} from '@/services/emailService';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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

interface ExportData {
  design: object;
  html: string;
}

export default function CreateTemplate() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const emailEditorRef = useRef<EditorRef>(null);

  const [templateName, setTemplateName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailType, setEmailType] = useState<number>(99);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const isEditMode = !!id;
  const baseTemplateId = searchParams.get('templateId');

  // Fetch existing customer template if in edit mode
  const { data: templateData, isLoading: loadingTemplate } = useQuery({
    queryKey: ['customer-email-template', id],
    queryFn: () => getCustomerEmailTemplate(Number(id)),
    enabled: isEditMode,
  });

  // Fetch system template if creating from base template
  const { data: baseTemplateData } = useQuery({
    queryKey: ['system-template', baseTemplateId],
    queryFn: () => getSystemTemplateById(Number(baseTemplateId)),
    enabled: !!baseTemplateId && !isEditMode,
  });

  const template = templateData?.data;
  const baseTemplate = baseTemplateData?.data;

  // Fetch attachments if in edit mode
  const { data: attachmentsData } = useQuery({
    queryKey: ['template-attachments', id],
    queryFn: () => getAttachments(Number(id)),
    enabled: isEditMode,
  });

  const attachments = attachmentsData?.data || [];

  // Load customer template data when fetched (edit mode)
  useEffect(() => {
    if (template) {
      setTemplateName(template.email_name || '');
      setEmailSubject(template.email_subject || '');
      setEmailType(template.email_type || 99);
      setIsActive(template.is_active ?? true);

      // Load design into editor
      if (template.design_json && emailEditorRef.current?.editor) {
        try {
          const design = typeof template.design_json === 'string'
            ? JSON.parse(template.design_json)
            : template.design_json;
          emailEditorRef.current.editor.loadDesign(design);
        } catch (error) {
          console.error('Failed to load design:', error);
        }
      }
    }
  }, [template]);

  // Load base system template data when creating from template
  useEffect(() => {
    if (baseTemplate && !isEditMode) {
      setTemplateName(`${baseTemplate.name} (Copy)`);
      setEmailSubject(baseTemplate.name);
      setEmailType(99); // Default to Custom Email
      setIsActive(true);

      // Load HTML content into editor
      if (baseTemplate.html_content && emailEditorRef.current?.editor) {
        try {
          // Convert HTML to email editor design format
          const basicDesign: any = {
            counters: {},
            body: {
              rows: [
                {
                  cells: [1],
                  columns: [
                    {
                      contents: [
                        {
                          type: "html",
                          values: {
                            html: baseTemplate.html_content,
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          };
          emailEditorRef.current.editor.loadDesign(basicDesign);
          toast.success('Base template loaded! Customize it and save.');
        } catch (error) {
          console.error('Failed to load base template:', error);
          toast.error('Failed to load template design');
        }
      }
    }
  }, [baseTemplate, isEditMode]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CustomerEmailTemplate) => {
      if (isEditMode && id) {
        return updateCustomerEmailTemplate(Number(id), data);
      }
      return createCustomerEmailTemplate(data);
    },
    onSuccess: async (response) => {
      const templateId = response.data.email_id;

      // Upload attachments if any
      if (selectedFiles.length > 0 && templateId) {
        for (const file of selectedFiles) {
          try {
            await uploadAttachment(templateId, file);
          } catch (error) {
            console.error('Failed to upload attachment:', error);
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['customer-email-templates'] });
      toast.success(isEditMode ? 'Template updated successfully' : 'Template created successfully');
      navigate('/my-email-templates');
    },
    onError: () => {
      toast.error(isEditMode ? 'Failed to update template' : 'Failed to create template');
      setIsSaving(false);
    },
  });

  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-attachments', id] });
      toast.success('Attachment deleted');
    },
    onError: () => {
      toast.error('Failed to delete attachment');
    },
  });

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    setIsSaving(true);

    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) {
      toast.error('Editor not loaded');
      setIsSaving(false);
      return;
    }

    unlayer.exportHtml((data: ExportData) => {
      const { design, html } = data;

      const templateData: CustomerEmailTemplate = {
        email_name: templateName,
        email_subject: emailSubject,
        email_type: emailType,
        html_content: html,
        design_json: JSON.stringify(design),
        is_active: isActive,
      };

      saveMutation.mutate(templateData);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  if (isEditMode && loadingTemplate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Dynamic page header based on context
  const pageTitle = isEditMode
    ? 'Edit My Template'
    : baseTemplateId
    ? 'Create My Copy'
    : 'Create Template';

  const pageDescription = isEditMode
    ? 'Update your personal email template'
    : baseTemplateId
    ? `Creating your own copy from: ${baseTemplate?.name || 'Email Library'}. You can fully customize this template.`
    : 'Create a new email template from scratch';

  return (
    <PageHeader
      title={pageTitle}
      description={pageDescription}
      actions={[
        {
          label: 'Cancel',
          onClick: () => navigate('/my-email-templates'),
          variant: 'outline',
          icon: ArrowLeft,
        },
        {
          label: isSaving ? 'Saving...' : 'Save Template',
          onClick: handleSave,
          variant: 'default',
          icon: Save,
          disabled: isSaving,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Template Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Monthly Newsletter"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject *</Label>
                <Input
                  id="email-subject"
                  placeholder="e.g., Your Monthly Update"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email-type">Email Type</Label>
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

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="flex gap-2">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>New Attachments</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {file.name}
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Attachments */}
            {isEditMode && attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Current Attachments</Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <Badge key={attachment.id} variant="outline" className="px-3 py-1">
                      {attachment.file.split('/').pop()}
                      <button
                        onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailEditor
              ref={emailEditorRef}
              minHeight="600px"
            />
          </CardContent>
        </Card>
      </div>
    </PageHeader>
  );
}
