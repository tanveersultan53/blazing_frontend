import PageHeader from '@/components/PageHeader';
import { Download, Save } from 'lucide-react';
import { useRef } from 'react';
import EmailEditor, { type EditorRef } from 'react-email-editor';
import { sampleTemplate } from './sampleTemplate';

// Define the shape of the data from exportHtml
interface ExportData {
    design: object;
    html: string;
}

const EmailTemplateCreator = () => {
    // Type the ref with the component's exported EditorRef type
    const emailEditorRef = useRef<EditorRef>(null);

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

    const onLoad = () => {
        emailEditorRef.current?.editor?.loadDesign(sampleTemplate);
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
            <div className="mb-6">
                <EmailEditor
                    ref={emailEditorRef}
                    onLoad={onLoad}
                    minHeight={`calc(100vh - 185px)`}
                />
            </div>
        </PageHeader>
    );
};

export default EmailTemplateCreator;