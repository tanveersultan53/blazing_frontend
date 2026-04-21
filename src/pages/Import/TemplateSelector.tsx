import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Loader2 } from 'lucide-react';
import { queryKeys } from '@/helpers/constants';
import { listTemplates } from '@/services/importService';
import type { ImportTemplate } from './types';

interface TemplateSelectorProps {
    onSelect: (template: ImportTemplate) => void;
}

const TemplateSelector = ({ onSelect }: TemplateSelectorProps) => {
    const { data, isLoading } = useQuery({
        queryKey: [queryKeys.importTemplates],
        queryFn: () => listTemplates().then(res => res.data),
    });

    const templates = data || [];

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No saved templates found</p>
                <p className="text-sm mt-2">Create a new import to save a template</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {templates.map((template) => (
                <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-4 flex-1">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <h4 className="font-medium">{template.template_name}</h4>
                            <div className="flex items-center gap-4 mt-1">
                                <Badge variant={template.import_type === 'contact' ? 'default' : 'secondary'}>
                                    {template.import_type === 'contact' ? 'Contacts' : 'Partners'}
                                </Badge>
                                {(template as any).created && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date((template as any).created).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => onSelect(template)}>
                        Select
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default TemplateSelector;
