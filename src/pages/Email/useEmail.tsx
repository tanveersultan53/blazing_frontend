import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { toast } from 'sonner';
import type { EmailTemplate, EmailTemplateList } from './interface';
import { createEmailTemplate, getDefaultEmailTemplate, getEmailTemplates } from '@/services/emailService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/helpers/constants';

// Define filter interface for email templates
export interface EmailTemplateFilters {
  name?: string;
  subject?: string;
  is_default?: string;
  is_active?: string;
  created_at?: string;
  updated_at?: string;
}

const useEmail = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<EmailTemplateFilters>({});
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<EmailTemplateFilters>({});
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDefaultTemplateQuery = useQuery({
    queryKey: [queryKeys.getDefaultEmailTemplate as string],
    queryFn: getDefaultEmailTemplate,
  });

  const getEmailTemplatesQuery = useQuery({
    queryKey: [queryKeys.getEmailTemplates as string],
    queryFn: getEmailTemplates,
  });

  const createEmailTemplateMutation = useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => {
      toast.success('Email template created successfully');
      setIsCreateModalOpen(false);
      getEmailTemplatesQuery.refetch();
    },
    onError: () => {
      toast.error('Failed to create email template');
      setIsCreateModalOpen(false);
    },
  });

  // Get templates from API
  const templates: EmailTemplateList[] = useMemo(() => {
    return getEmailTemplatesQuery.data?.data?.results || [];
  }, [getEmailTemplatesQuery.data]);

  // Debounce filters to prevent too many operations
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters]);

  // Debounce global search to prevent too many operations
  useEffect(() => {
    if (globalSearchTimeoutRef.current) {
      clearTimeout(globalSearchTimeoutRef.current);
    }

    globalSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearch);
    }, 500);

    return () => {
      if (globalSearchTimeoutRef.current) {
        clearTimeout(globalSearchTimeoutRef.current);
      }
    };
  }, [globalSearch]);

  // Create new template
  const createTemplate = (template: EmailTemplate) => {
    createEmailTemplateMutation.mutate({
      name: template.name,
      subject: template.subject,
      is_default: template.is_default,
      customer: template.customer,
      template: template.template,
      is_active: template.is_active,
    });
  }

  // Delete template
  const deleteTemplate = useCallback((templateId: number) => {
    // TODO: Implement delete API call
    toast.success(`Email template ${templateId} deleted successfully`);
  }, []);

  // Filter update function
  const updateFilter = useCallback((key: keyof EmailTemplateFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value && value.trim() !== '') {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      
      return newFilters;
    });
  }, []);

  const clearFilter = (key: keyof EmailTemplateFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setGlobalSearch("");
  };

  // Global search functions
  const updateGlobalSearch = useCallback((value: string) => {
    setGlobalSearch(value);
  }, []);

  // Filter templates based on filters and global search
  const filteredTemplates = useMemo(() => {
    let filtered = [...templates];

    // Apply column filters
    if (debouncedFilters.name) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(debouncedFilters.name!.toLowerCase())
      );
    }

    if (debouncedFilters.subject) {
      filtered = filtered.filter(template =>
        template.subject.toLowerCase().includes(debouncedFilters.subject!.toLowerCase())
      );
    }

    if (debouncedFilters.is_default) {
      const isDefaultValue = debouncedFilters.is_default.toLowerCase() === 'true' || debouncedFilters.is_default.toLowerCase() === 'yes';
      filtered = filtered.filter(template => template.is_default === isDefaultValue);
    }

    if (debouncedFilters.is_active) {
      const isActiveValue = debouncedFilters.is_active.toLowerCase() === 'true' || debouncedFilters.is_active.toLowerCase() === 'yes';
      filtered = filtered.filter(template => template.is_active === isActiveValue);
    }

    if (debouncedFilters.created_at) {
      filtered = filtered.filter(template => {
        const templateDate = new Date(template.created_at).toLocaleDateString();
        return templateDate.includes(debouncedFilters.created_at!);
      });
    }

    if (debouncedFilters.updated_at) {
      filtered = filtered.filter(template => {
        const templateDate = new Date(template.updated_at).toLocaleDateString();
        return templateDate.includes(debouncedFilters.updated_at!);
      });
    }

    // Apply global search
    if (debouncedGlobalSearch) {
      const searchTerm = debouncedGlobalSearch.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.subject.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [templates, debouncedFilters, debouncedGlobalSearch]);

  // Table columns
  const columns: ColumnDef<EmailTemplateList>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{template.name}</span>
            {template.is_default && (
              <Badge variant="default" className="text-xs">
                Default
              </Badge>
            )}
          </div>
        );
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue("subject")}>
          {row.getValue("subject")}
        </div>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "is_default",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Default" />
      ),
      cell: ({ row }) => {
        const isDefault = row.getValue("is_default") as boolean;
        return (
          <Badge variant={isDefault ? "default" : "secondary"}>
            {isDefault ? "Yes" : "No"}
          </Badge>
        );
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "template",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template" />
      ),
      cell: ({ row }) => {
        const templateId = row.getValue("template") as number;
        return <div className="text-sm">{templateId}</div>;
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at"));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
      enableColumnFilter: true,
    },
  ], []);

  // Action items for bulk operations
  const actionItems = [
    {
      label: 'Delete',
      onClick: (row: EmailTemplateList) => deleteTemplate(row.id),
      icon: Trash2,
      className: 'text-red-600',
      disabled: (row: EmailTemplateList) => row.is_default || false,
    },
  ];

  return {
    templates: filteredTemplates,
    columns,
    actionItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTemplate,
    deleteTemplate,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
    defaultTemplate: getDefaultTemplateQuery.data?.data?.results || [],
    isLoading: getEmailTemplatesQuery.isLoading,
  };
};

export default useEmail;