import { useState, useMemo } from 'react';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, Plus } from 'lucide-react';
import ImportForm from './ImportForm';
import TemplateSelector from './TemplateSelector';
import type { ImportTemplate } from './types';

type ImportMode = 'selection' | 'new' | 'existing';

const Import = () => {
    const [mode, setMode] = useState<ImportMode>('selection');
    const [selectedTemplate, setSelectedTemplate] = useState<ImportTemplate | null>(null);

    const breadcrumbs = useMemo(() => [
        { label: 'Import Contacts' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    const handleNewImport = () => {
        setSelectedTemplate({
            template_name: '',
            import_type: 'contact',
            import_status: 'prospect',
            import_file: null,
            add_optout: false,
            email_only: false,
            force_add: false,
            dont_contact: false,
            fixname1: false,
            fixname2: false,
            fixname3: false,
            fixaddress1: false,
            fixaddress2: false,
            fixaddress3: false,
            field_mappings: [],
        });
        setMode('new');
    };

    const handleSelectTemplate = (template: ImportTemplate) => {
        setSelectedTemplate(template);
        setMode('existing');
    };

    const handleBack = () => {
        setMode('selection');
        setSelectedTemplate(null);
    };

    if (mode === 'new' || mode === 'existing') {
        return (
            <ImportForm
                template={selectedTemplate}
                isNew={mode === 'new'}
                onBack={handleBack}
            />
        );
    }

    return (
        <PageHeader
            title="Import Contacts"
            description="Import contacts or referral partners from CSV or Excel files"
        >
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Choose Import Option</CardTitle>
                        <CardDescription>
                            Start a new import or select an existing template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* New Import Button */}
                            <button
                                onClick={handleNewImport}
                                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <Plus className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">New Import</h3>
                                <p className="text-sm text-gray-500 text-center">
                                    Start fresh with a new import configuration
                                </p>
                            </button>

                            {/* Select Template Button */}
                            <button
                                onClick={() => setMode('selection')}
                                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <FileUp className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Select Template</h3>
                                <p className="text-sm text-gray-500 text-center">
                                    Use a previously saved import template
                                </p>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {mode === 'selection' && (
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle>Select Import Template</CardTitle>
                            <CardDescription>
                                Choose from your saved import templates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TemplateSelector onSelect={handleSelectTemplate} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageHeader>
    );
};

export default Import;
