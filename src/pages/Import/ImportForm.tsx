import { useState, useMemo } from 'react';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Map, Settings, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import MapFieldsModal from './MapFieldsModal';
import ImportOptionsModal from './ImportOptionsModal';
import PreviewTable from './PreviewTable';
import type { ImportTemplate, ImportPreviewRow } from './types';

interface ImportFormProps {
    template: ImportTemplate | null;
    isNew: boolean;
    onBack: () => void;
}

const ImportForm = ({ template, isNew, onBack }: ImportFormProps) => {
    const [formData, setFormData] = useState<ImportTemplate>(template || {
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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importHeaders, setImportHeaders] = useState<string[]>([]);
    const [showMapFields, setShowMapFields] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [previewData] = useState<ImportPreviewRow[]>([]);
    const [showPreview] = useState(false);

    const breadcrumbs = useMemo(() => [
        { label: 'Import Contacts', onClick: onBack },
        { label: isNew ? 'New Import' : 'Edit Template' }
    ], [isNew, onBack]);

    useBreadcrumbs(breadcrumbs);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a CSV or Excel file');
            return;
        }

        setSelectedFile(file);

        // TODO: Parse file to get headers
        // For now, mock headers
        setImportHeaders(['First Name', 'Last Name', 'Email', 'Phone', 'Company']);

        toast.success('File uploaded successfully');
    };

    const canImport = () => {
        return (
            formData.template_name.trim() !== '' &&
            selectedFile !== null &&
            formData.field_mappings && formData.field_mappings.length > 0
        );
    };

    const handleImport = () => {
        if (!canImport()) {
            toast.error('Please complete all required fields');
            return;
        }

        // TODO: Process import
        toast.success('Import started...');
    };

    return (
        <PageHeader
            title={isNew ? 'New Import' : 'Edit Import Template'}
            description="Configure your import settings and map fields"
            actions={[
                {
                    label: 'Back',
                    onClick: onBack,
                    variant: 'outline' as const,
                    icon: ArrowLeft,
                }
            ]}
        >
            <div className="space-y-6">
                {/* Basic Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Template Name */}
                            <div className="space-y-2">
                                <Label htmlFor="template_name">Template Name *</Label>
                                <Input
                                    id="template_name"
                                    placeholder="My Import Template"
                                    value={formData.template_name}
                                    onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                                />
                            </div>

                            {/* Import Type */}
                            <div className="space-y-2">
                                <Label htmlFor="import_type">Type *</Label>
                                <Select
                                    value={formData.import_type}
                                    onValueChange={(value: 'contact' | 'partner') =>
                                        setFormData({ ...formData, import_type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contact">Contacts</SelectItem>
                                        <SelectItem value="partner">Referral Partners</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Import Status */}
                            <div className="space-y-2">
                                <Label htmlFor="import_status">Status *</Label>
                                <Select
                                    value={formData.import_status}
                                    onValueChange={(value: 'prospect' | 'client') =>
                                        setFormData({ ...formData, import_status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="prospect">Prospect</SelectItem>
                                        <SelectItem value="client">Client</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* File Upload Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload File</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-sm font-medium mb-2">
                                        {selectedFile ? selectedFile.name : 'Click to upload CSV or Excel file'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Supported formats: .csv, .xlsx, .xls
                                    </p>
                                </label>
                            </div>

                            {selectedFile && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-900">{selectedFile.name}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Field Mapping & Options */}
                {selectedFile && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => setShowMapFields(true)}
                                >
                                    <Map className="w-6 h-6" />
                                    <span>Map Fields</span>
                                    {formData.field_mappings && formData.field_mappings.length > 0 && (
                                        <span className="text-xs text-green-600">
                                            {formData.field_mappings.length} fields mapped
                                        </span>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => setShowOptions(true)}
                                >
                                    <Settings className="w-6 h-6" />
                                    <span>Import Options</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Import Button */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onBack}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!canImport()}
                    >
                        Start Import
                    </Button>
                </div>

                {/* Preview Table */}
                {showPreview && previewData.length > 0 && (
                    <PreviewTable
                        data={previewData}
                        onImport={() => {}}
                    />
                )}
            </div>

            {/* Modals */}
            <MapFieldsModal
                open={showMapFields}
                onClose={() => setShowMapFields(false)}
                importHeaders={importHeaders}
                importType={formData.import_type}
                existingMappings={formData.field_mappings || []}
                onSave={(mappings) => {
                    setFormData({ ...formData, field_mappings: mappings });
                    setShowMapFields(false);
                    toast.success('Field mappings saved');
                }}
            />

            <ImportOptionsModal
                open={showOptions}
                onClose={() => setShowOptions(false)}
                options={formData}
                onSave={(options) => {
                    setFormData({ ...formData, ...options });
                    setShowOptions(false);
                    toast.success('Import options saved');
                }}
            />
        </PageHeader>
    );
};

export default ImportForm;
