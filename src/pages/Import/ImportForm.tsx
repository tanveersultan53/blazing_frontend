import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Map, Settings, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { queryKeys } from '@/helpers/constants';
import { parseHeaders, previewImport, executeImport, createTemplate, updateTemplate } from '@/services/importService';
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
    const queryClient = useQueryClient();

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
    const [previewData, setPreviewData] = useState<ImportPreviewRow[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const breadcrumbs = useMemo(() => [
        { label: 'Import Contacts', onClick: onBack },
        { label: isNew ? 'New Import' : 'Edit Template' }
    ], [isNew, onBack]);

    useBreadcrumbs(breadcrumbs);

    // --- Mutations ---

    const parseHeadersMutation = useMutation({
        mutationFn: (file: File) => parseHeaders(file),
        onSuccess: (res) => {
            setImportHeaders(res.data.headers);
            toast.success('File headers parsed');
        },
        onError: () => {
            toast.error('Failed to parse file headers');
        },
    });

    const previewMutation = useMutation({
        mutationFn: () => {
            const options: Record<string, boolean> = {
                add_optout: formData.add_optout,
                email_only: formData.email_only,
                force_add: formData.force_add,
                dont_contact: formData.dont_contact,
                fixname1: formData.fixname1,
                fixname2: formData.fixname2,
                fixname3: formData.fixname3,
                fixaddress1: formData.fixaddress1,
                fixaddress2: formData.fixaddress2,
                fixaddress3: formData.fixaddress3,
            };
            return previewImport(
                selectedFile!,
                formData.field_mappings || [],
                options,
                formData.import_type
            );
        },
        onSuccess: (res) => {
            setPreviewData(res.data.preview);
            setShowPreview(true);
            toast.success(`Preview generated: ${res.data.preview.length} rows`);
        },
        onError: () => {
            toast.error('Failed to generate preview');
        },
    });

    const executeMutation = useMutation({
        mutationFn: async (selectedRows: ImportPreviewRow[]) => {
            // Save/create template first
            let templateId = formData.id;
            const templatePayload = {
                template_name: formData.template_name,
                import_type: formData.import_type,
                import_status: formData.import_status,
                add_optout: formData.add_optout,
                email_only: formData.email_only,
                force_add: formData.force_add,
                dont_contact: formData.dont_contact,
                fixname1: formData.fixname1,
                fixname2: formData.fixname2,
                fixname3: formData.fixname3,
                fixaddress1: formData.fixaddress1,
                fixaddress2: formData.fixaddress2,
                fixaddress3: formData.fixaddress3,
                field_mappings: formData.field_mappings?.map(m => ({
                    import_field: m.import_field,
                    blazing_field: m.blazing_field,
                })),
            };

            if (templateId) {
                await updateTemplate(templateId, templatePayload);
            } else {
                const res = await createTemplate(templatePayload);
                templateId = res.data.id;
                setFormData(prev => ({ ...prev, id: templateId }));
            }

            return executeImport(
                templateId!,
                selectedRows,
                formData.import_type,
                formData.import_status
            );
        },
        onSuccess: (res) => {
            const { added, updated, skipped } = res.data;
            toast.success(`Import complete: ${added} added, ${updated} updated, ${skipped} skipped`);
            queryClient.invalidateQueries({ queryKey: [queryKeys.contacts] });
            queryClient.invalidateQueries({ queryKey: [queryKeys.importTemplates] });
            setShowPreview(false);
            setPreviewData([]);
        },
        onError: () => {
            toast.error('Import failed');
        },
    });

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
        setShowPreview(false);
        setPreviewData([]);
        parseHeadersMutation.mutate(file);
    };

    const canPreview = () => {
        return (
            formData.template_name.trim() !== '' &&
            selectedFile !== null &&
            formData.field_mappings && formData.field_mappings.length > 0
        );
    };

    const handlePreview = () => {
        if (!canPreview()) {
            toast.error('Please complete all required fields');
            return;
        }
        previewMutation.mutate();
    };

    const handleExecuteImport = (selectedRows: ImportPreviewRow[]) => {
        executeMutation.mutate(selectedRows);
    };

    const isLoading = parseHeadersMutation.isPending || previewMutation.isPending || executeMutation.isPending;

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
                                    {parseHeadersMutation.isPending ? (
                                        <Loader2 className="w-12 h-12 text-gray-400 mb-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                    )}
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
                                    {importHeaders.length > 0 && (
                                        <span className="text-xs text-green-600 ml-auto">
                                            {importHeaders.length} columns detected
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Field Mapping & Options */}
                {selectedFile && importHeaders.length > 0 && (
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

                {/* Preview / Import Buttons */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onBack}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePreview}
                        disabled={!canPreview() || isLoading}
                    >
                        {previewMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Preview...
                            </>
                        ) : (
                            'Preview Import'
                        )}
                    </Button>
                </div>

                {/* Preview Table */}
                {showPreview && previewData.length > 0 && (
                    <PreviewTable
                        data={previewData}
                        onImport={handleExecuteImport}
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
