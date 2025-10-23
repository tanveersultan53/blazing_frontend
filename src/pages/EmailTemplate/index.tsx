import PageHeader from '@/components/PageHeader';
import { Download, Save, FileText, Eye } from 'lucide-react';
import { useRef, useState } from 'react';
import EmailEditor, { type EditorRef } from 'react-email-editor';
import { getTemplates, loadTemplate, type Template } from '@/services/templateService';
import { htmlToUnlayerTextContent } from '@/lib/htmlToUnlayer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Define the shape of the data from exportHtml
interface ExportData {
    design: object;
    html: string;
}

const EmailTemplateCreator = () => {
    // Type the ref with the component's exported EditorRef type
    const emailEditorRef = useRef<EditorRef>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [templates] = useState<Template[]>(getTemplates());
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<string>('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const exportHtml = () => {
        const unlayer = emailEditorRef.current?.editor;

        if (unlayer) {
            unlayer.exportHtml((data: ExportData) => {
                const { design, html } = data;
                console.log('HTML:', html, 'Design:', design);
                // Now you can save this HTML to your server
            });
        }
    };

    const saveDesign = () => {
        const unlayer = emailEditorRef.current?.editor;

        if (unlayer) {
            unlayer.saveDesign((design: object) => {
                console.log('Design JSON:', design);
                // Save this JSON to your database to be loaded later
            });
        }
    };

    const handleTemplateSelect = async (templateId: string) => {
        if (!templateId) return;
        
        setIsLoadingTemplate(true);
        try {
            const htmlContent = await loadTemplate(templateId);
            const unlayerDesign = htmlToUnlayerTextContent(htmlContent);
            
            // Load the design into the editor
            emailEditorRef.current?.editor?.loadDesign(unlayerDesign);
            setSelectedTemplate(templateId);
            setPreviewTemplate(htmlContent);
        } catch (error) {
            console.error('Failed to load template:', error);
            // You might want to show a toast notification here
        } finally {
            setIsLoadingTemplate(false);
        }
    };

    return (
        <PageHeader
            title="Email Template Editor"
            description="Create your email template using the editor below."
            actions={[
                {
                    label: 'Export HTML',
                    onClick: exportHtml,
                    variant: 'default',
                    icon: Download,
                },
                {
                    label: 'Save Design',
                    onClick: saveDesign,
                    variant: 'default',
                    icon: Save,
                },
            ]}
        >
            <div className="space-y-4">
                {/* Template Selection */}
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Select Template:</span>
                    </div>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="w-80">
                            <SelectValue placeholder="Choose a template to start with...">
                                {selectedTemplate ? <span className="font-medium">{templates.find(t => t.id === selectedTemplate)?.name}</span> : "Choose a template to start with..."}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{template.name}</span>
                                        <span className="text-sm text-gray-500">{template.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isLoadingTemplate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            Loading template...
                        </div>
                    )}
                    {selectedTemplate && (
                        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="!max-w-[95vw] !max-h-[95vh] !w-[95vw] !h-[95vh] sm:!max-w-[95vw]">
                                <iframe
                                    srcDoc={previewTemplate}
                                    className="w-full h-[calc(100%-4rem)] border rounded"
                                    title="Template Preview"
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Email Editor */}
                <EmailEditor
                    ref={emailEditorRef}
                    minHeight={`calc(100vh - 230px)`}
                />
            </div>
        </PageHeader>
    );
};

export default EmailTemplateCreator;