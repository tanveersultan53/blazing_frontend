import PageHeader from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Save } from "lucide-react";
import { useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getTemplates, loadTemplate, type Template } from "@/services/templateService";

const Font = Quill.import("formats/font");
Font.whitelist = ["sans-serif", "arial", "poppins", "times-new-roman", "roboto"];
Quill.register(Font, true);

const ReactQuillEditor = () => {
    const [value, setValue] = useState("<p>Hello <strong>World!</strong></p>");
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [templates] = useState<Template[]>(getTemplates());


    const handleChange = (content: string) => {
        setValue(content);
    };

    const exportHtml = () => {
        console.log(value);
    };

    const saveDesign = () => {
        console.log(value);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': Font.whitelist }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],

            // Alignment
            [{ 'align': [] }],

            // Lists and indentation
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],

            // Text effects
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],

            // Links and media
            ['link', 'image', 'video'],

            // Tables
            [{ 'table': [] }],

            // Clean and undo/redo
            ['clean'],

            // Custom buttons
            ['undo', 'redo']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'color', 'background',
        'link', 'image',
    ];

    const handleTemplateSelect = async (templateId: string) => {
        if (!templateId) return;
        const htmlContent = await loadTemplate(templateId);
        setValue(htmlContent);
        setSelectedTemplate(templateId);
    };

    return (
        <PageHeader
            title="React Quill Editor"
            description="Create your email template using the React Quill editor below."
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
            <div className="mb-10">
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg mb-5">
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
                </div>
                
                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-300px)]">
                    {/* Left Column - ReactQuill Editor */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                            <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Editor</span>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                            <ReactQuill
                                value={value}
                                onChange={handleChange}
                                theme="snow"
                                modules={modules}
                                formats={formats}
                                style={{ height: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Right Column - Runtime Preview */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                            <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Email Preview</span>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <div 
                                className="h-full w-full overflow-auto p-4"
                                dangerouslySetInnerHTML={{ __html: value }}
                                style={{ 
                                    minHeight: '100%',
                                    fontFamily: 'system-ui, -apple-system, sans-serif'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PageHeader>
    );
}

export default ReactQuillEditor;