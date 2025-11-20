import { useRef, useState, useEffect } from 'react';
import EmailEditor, { type EditorRef } from 'react-email-editor';
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
import type { DefaultEmailTemplate, EmailTemplate, EmailTemplateList } from './interface';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { X, Upload, Paperclip, FileText, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { User } from '@/redux/features/userSlice';
import { htmlToUnlayerTextContent } from '@/lib/htmlToUnlayer';
import { uploadAttachment, deleteAttachment } from '@/services/emailService';

interface ExportData {
  design: object;
  html: string;
}

interface EmailTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (template: EmailTemplate) => void;
  defaultTemplates: DefaultEmailTemplate[];
  editTemplate?: EmailTemplateList | null; // For editing/viewing existing template
  mode?: 'create' | 'edit' | 'view';
}

export const EmailTemplateEditorModal = ({
  isOpen,
  onClose,
  onSaveTemplate,
  defaultTemplates,
  editTemplate = null,
  mode = 'create',
}: EmailTemplateEditorModalProps) => {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);
  const emailEditorRef = useRef<EditorRef>(null);

  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    isDefault: boolean;
    isActive: boolean;
    customer: number | undefined;
    selectedDefaultTemplate: number | undefined;
  }>({
    name: '',
    subject: '',
    isDefault: false,
    isActive: true,
    customer: currentUser?.id as number,
    selectedDefaultTemplate: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing template data when editing or viewing
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && editTemplate && editorLoaded) {
      console.log('Loading template for', mode, 'mode:', editTemplate);
      console.log('Template has design_json:', !!editTemplate.design_json);
      console.log('Template has html_content:', !!editTemplate.html_content);

      setFormData({
        name: editTemplate.name || editTemplate.email_name,
        subject: editTemplate.subject || editTemplate.email_subject,
        isDefault: editTemplate.is_default,
        isActive: editTemplate.is_active,
        customer: editTemplate.customer || editTemplate.rep,
        selectedDefaultTemplate: editTemplate.template,
      });

      // Load existing attachments
      if (editTemplate.attachments && Array.isArray(editTemplate.attachments)) {
        setAttachments(editTemplate.attachments);
      }

      // Small delay to ensure editor is fully ready
      setTimeout(() => {
        // Load the design into editor
        // Priority: design_json > html_content
        if (editTemplate.design_json) {
          // If we have design JSON, use it (best for editing)
          try {
            const design = JSON.parse(editTemplate.design_json);
            console.log('Parsed design JSON:', design);
            emailEditorRef.current?.editor?.loadDesign(design);
            console.log('Loaded template from design_json');
            toast.success('Template loaded successfully');
          } catch (error) {
            console.error('Failed to load design from design_json:', error);
            toast.error('Failed to load template design');
          }
        } else if (editTemplate.html_content) {
          // If we only have HTML content, convert it to Unlayer format
          try {
            console.log('Converting HTML content to Unlayer format');
            const unlayerDesign = htmlToUnlayerTextContent(editTemplate.html_content);
            console.log('Converted design:', unlayerDesign);
            emailEditorRef.current?.editor?.loadDesign(unlayerDesign);
            console.log('Loaded template from html_content');
            toast.info('Template loaded from HTML. Design features may be limited.');
          } catch (error) {
            console.error('Failed to load design from html_content:', error);
            toast.error('Failed to load template from HTML');
          }
        } else {
          console.warn('No design_json or html_content available for template');
          console.log('Template data:', editTemplate);
          toast.warning('No template content found to load');
        }
      }, 500);
    }
  }, [mode, editTemplate, editorLoaded]);

  // Auto-load template when selected from dropdown
  useEffect(() => {
    if (mode === 'create' && formData.selectedDefaultTemplate && editorLoaded && !isLoadingTemplate) {
      // Automatically load the selected template
      handleLoadDefaultTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.selectedDefaultTemplate, editorLoaded, mode]);

  // Handle loading a default template as starting point
  const handleLoadDefaultTemplate = async () => {
    if (!formData.selectedDefaultTemplate) {
      toast.error('Please select a default template first');
      return;
    }

    const selectedTemplate = defaultTemplates.find(t => t.id === formData.selectedDefaultTemplate);
    if (!selectedTemplate) return;

    if (!editorLoaded) {
      toast.error('Email editor is not ready yet');
      return;
    }

    setIsLoadingTemplate(true);

    try {
      toast.info('Loading default template...');

      let htmlContent = '';

      // Try to get HTML content from the template
      if (selectedTemplate.html_content) {
        htmlContent = selectedTemplate.html_content;
      } else if (selectedTemplate.html_file) {
        // Fetch the HTML file content
        const response = await fetch(selectedTemplate.html_file);
        if (response.ok) {
          htmlContent = await response.text();
        } else {
          throw new Error('Failed to fetch template file');
        }
      }

      if (htmlContent) {
        // Convert HTML to Unlayer design format
        const unlayerDesign = htmlToUnlayerTextContent(htmlContent);

        // Load the design into the editor
        emailEditorRef.current?.editor?.loadDesign(unlayerDesign);

        toast.success('Template loaded successfully');
      } else {
        toast.error('No content available in the selected template');
      }
    } catch (error) {
      console.error('Failed to load default template:', error);
      toast.error('Failed to load default template');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.subject.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const unlayer = emailEditorRef.current?.editor;

      if (!unlayer) {
        toast.error('Email editor not loaded');
        setIsSubmitting(false);
        return;
      }

      // Export both HTML and design JSON
      unlayer.exportHtml((data: ExportData) => {
        const { design, html } = data;

        onSaveTemplate({
          name: formData.name,
          subject: formData.subject,
          is_default: formData.isDefault,
          customer: formData.customer,
          html_content: html,
          design_json: JSON.stringify(design),
          is_active: formData.isActive,
          // Only include template reference if a default template was selected
          ...(formData.selectedDefaultTemplate && { template: formData.selectedDefaultTemplate }),
        });

        setIsSubmitting(false);
      });
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      subject: '',
      isDefault: false,
      isActive: true,
      customer: currentUser?.id as number,
      selectedDefaultTemplate: undefined
    });
    setEditorLoaded(false);
    setAttachments([]);
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if template is saved (has ID)
    if (!editTemplate?.email_id && !editTemplate?.id) {
      toast.error('Please save the template first before uploading attachments');
      return;
    }

    const file = files[0];

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, CSV, Excel, PowerPoint, Word, Images');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const templateId = editTemplate.email_id || editTemplate.id;
      const response = await uploadAttachment(templateId!, file);

      setAttachments(prev => [...prev, response.data]);
      toast.success('Attachment uploaded successfully');

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      toast.error('Failed to upload attachment');
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file extension
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const handleClearTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      selectedDefaultTemplate: undefined,
    }));
  };

  const onEditorLoad = () => {
    setEditorLoaded(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[95vw] max-w-[1400px] h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {mode === 'view' ? 'View Email Template' : mode === 'edit' ? 'Edit Email Template' : 'Create Email Template'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'view'
                ? 'Preview your email template. Switch to edit mode to make changes.'
                : mode === 'edit'
                ? 'Update your email template using the editor below.'
                : 'Create a new email template with a custom design. Select a default template to auto-load it, or start from scratch.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* View Mode Banner */}
            {mode === 'view' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                <strong>View Mode:</strong> You are viewing this template in read-only mode. Click "Edit" from the template list to make changes.
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="template-name" className="text-sm font-medium">Template Name {mode !== 'view' && '*'}</label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required={mode !== 'view'}
                  disabled={mode === 'view'}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="template-subject" className="text-sm font-medium">Subject {mode !== 'view' && '*'}</label>
                <Input
                  id="template-subject"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  required={mode !== 'view'}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            {/* Template Selection - Only show in create mode */}
            {mode === 'create' && (
              <div className="space-y-2">
                <label htmlFor="default-template" className="text-sm font-medium">
                  Start from Default Template {isLoadingTemplate && <span className="text-xs text-muted-foreground">(Loading...)</span>}
                </label>
                <div className="relative">
                  <Select
                    {...(formData.selectedDefaultTemplate ? { value: formData.selectedDefaultTemplate.toString() } : {})}
                    onValueChange={(value) => handleInputChange('selectedDefaultTemplate', parseInt(value, 10))}
                    key={formData.selectedDefaultTemplate || 'empty'}
                    disabled={isLoadingTemplate}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select default template to auto-load" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.selectedDefaultTemplate && (
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
            )}

            {/* Checkboxes - Disabled in view mode */}
            {mode !== 'view' && (
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-default"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => handleInputChange('isDefault', checked as boolean)}
                  />
                  <label htmlFor="is-default" className="text-sm font-medium leading-none">
                    Set as default template
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                  />
                  <label htmlFor="is-active" className="text-sm font-medium leading-none">
                    Make this template active
                  </label>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            {(mode === 'edit' || mode === 'view') && (
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-600" />
                    <label className="text-sm font-medium">Attachments</label>
                    <span className="text-xs text-muted-foreground">({attachments.length})</span>
                  </div>
                  {mode === 'edit' && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.csv,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingFile ? 'Uploading...' : 'Upload File'}
                      </Button>
                    </>
                  )}
                </div>

                {/* Attachments List */}
                {attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-2 bg-white border rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment.file?.split('/').pop() || 'Unknown file'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getFileExtension(attachment.file || '')}
                              {attachment.size && ` • ${formatFileSize(attachment.size)}`}
                            </p>
                          </div>
                        </div>
                        {mode === 'edit' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No attachments yet. {mode === 'edit' && 'Upload files to attach them to this email template.'}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, CSV, Excel, PowerPoint, Word, Images (max 10MB)
                </p>
              </div>
            )}

            {/* Email Editor */}
            <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
              <EmailEditor
                ref={emailEditorRef}
                onReady={onEditorLoad}
                minHeight="100%"
                options={{
                  displayMode: mode === 'view' ? 'web' : 'email',
                }}
              />
            </div>

            <DialogFooter>
              {mode === 'view' ? (
                <Button type="button" onClick={handleClose}>
                  Close
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Template' : 'Save Template'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
