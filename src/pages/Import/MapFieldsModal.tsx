import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CONTACT_FIELDS, PARTNER_FIELDS, type FieldMapping, type ImportType } from './types';

interface MapFieldsModalProps {
    open: boolean;
    onClose: () => void;
    importHeaders: string[];
    importType: ImportType;
    existingMappings: FieldMapping[];
    onSave: (mappings: FieldMapping[]) => void;
}

const MapFieldsModal = ({
    open,
    onClose,
    importHeaders,
    importType,
    existingMappings,
    onSave
}: MapFieldsModalProps) => {
    const [mappings, setMappings] = useState<FieldMapping[]>([]);

    const blazingFields = importType === 'contact' ? CONTACT_FIELDS : PARTNER_FIELDS;

    // Auto-match fields when modal opens
    useEffect(() => {
        if (open && existingMappings.length === 0) {
            autoMatchFields();
        } else if (open && existingMappings.length > 0) {
            setMappings(existingMappings);
        }
    }, [open, importHeaders]);

    const autoMatchFields = () => {
        const autoMappings: FieldMapping[] = [];

        blazingFields.forEach(blazingField => {
            // Try to find exact match (case-insensitive)
            const exactMatch = importHeaders.find(
                header => header.toLowerCase().replace(/\s+/g, '_') === blazingField.value.toLowerCase()
            );

            if (exactMatch) {
                autoMappings.push({
                    import_field: exactMatch,
                    blazing_field: blazingField.value
                });
                return;
            }

            // Try to find partial match
            const partialMatch = importHeaders.find(header => {
                const headerLower = header.toLowerCase();
                const fieldLower = blazingField.label.toLowerCase();
                return headerLower.includes(fieldLower) || fieldLower.includes(headerLower);
            });

            if (partialMatch) {
                autoMappings.push({
                    import_field: partialMatch,
                    blazing_field: blazingField.value
                });
            }
        });

        setMappings(autoMappings);
    };

    const handleMappingChange = (blazingField: string, importField: string) => {
        const existingIndex = mappings.findIndex(m => m.blazing_field === blazingField);

        if (importField === 'none') {
            // Remove mapping
            if (existingIndex > -1) {
                setMappings(mappings.filter((_, i) => i !== existingIndex));
            }
        } else {
            // Add or update mapping
            const newMapping: FieldMapping = {
                import_field: importField,
                blazing_field: blazingField
            };

            if (existingIndex > -1) {
                const newMappings = [...mappings];
                newMappings[existingIndex] = newMapping;
                setMappings(newMappings);
            } else {
                setMappings([...mappings, newMapping]);
            }
        }
    };

    const getMappingForField = (blazingField: string): string => {
        const mapping = mappings.find(m => m.blazing_field === blazingField);
        return mapping?.import_field || 'none';
    };

    const handleSave = () => {
        onSave(mappings);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Map Fields</DialogTitle>
                    <DialogDescription>
                        Map your import file fields to BlazingSocial fields. Auto-matched fields are highlighted.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-medium text-blue-900">
                            {mappings.length} of {blazingFields.length} fields mapped
                        </span>
                        <Button variant="link" onClick={autoMatchFields} size="sm">
                            Auto-Match Fields
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {blazingFields.map(field => {
                            const currentMapping = getMappingForField(field.value);
                            const isMapped = currentMapping !== 'none';

                            return (
                                <div
                                    key={field.value}
                                    className="flex items-center gap-4 p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {isMapped ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium">{field.label}</Label>
                                            <p className="text-xs text-gray-500">{field.value}</p>
                                        </div>
                                    </div>

                                    <div className="w-64">
                                        <Select
                                            value={currentMapping}
                                            onValueChange={(value) => handleMappingChange(field.value, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select field..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    <span className="text-gray-500">Do not map</span>
                                                </SelectItem>
                                                {importHeaders.map(header => (
                                                    <SelectItem key={header} value={header}>
                                                        {header}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Mappings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MapFieldsModal;
