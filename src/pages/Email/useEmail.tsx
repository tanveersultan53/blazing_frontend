import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { toast } from 'sonner';
import type { EmailTemplate } from './interface';
import { getDefaultEmailTemplate } from '@/services/emailService';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/helpers/constants';

// Dummy data for email templates
const dummyTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to Our Platform!',
    isDefault: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    content: 'Welcome to our platform! We are excited to have you on board...'
  },
  {
    id: '2',
    name: 'Newsletter Template',
    subject: 'Monthly Newsletter - January 2024',
    isDefault: false,
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    content: 'Here is your monthly newsletter with the latest updates...'
  },
  {
    id: '3',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    isDefault: false,
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-05T16:45:00Z',
    content: 'Click the link below to reset your password...'
  },
  {
    id: '4',
    name: 'Promotional Offer',
    subject: 'Special Offer - 50% Off!',
    isDefault: false,
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-18T13:30:00Z',
    content: 'Don\'t miss out on our special promotional offer...'
  },
  {
    id: '5',
    name: 'Account Verification',
    subject: 'Verify Your Email Address',
    isDefault: false,
    createdAt: '2024-01-08T08:15:00Z',
    updatedAt: '2024-01-08T08:15:00Z',
    content: 'Please verify your email address by clicking the link below...'
  }
];

// Define filter interface for email templates
export interface EmailTemplateFilters {
  name?: string;
  subject?: string;
  createdAt?: string;
  updatedAt?: string;
}

const useEmail = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(dummyTemplates);
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
    console.log(template);
  }

  // Delete template
  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => {
      const template = prev.find(t => t.id === templateId);
      if (template?.isDefault) {
        toast.error('Cannot delete the default template');
        return prev;
      }
      return prev.filter(t => t.id !== templateId);
    });
    toast.success('Email template deleted successfully');
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

    if (debouncedFilters.createdAt) {
      filtered = filtered.filter(template => {
        const templateDate = new Date(template.createdAt).toLocaleDateString();
        return templateDate.includes(debouncedFilters.createdAt!);
      });
    }

    if (debouncedFilters.updatedAt) {
      filtered = filtered.filter(template => {
        const templateDate = new Date(template.updatedAt).toLocaleDateString();
        return templateDate.includes(debouncedFilters.updatedAt!);
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
  const columns: ColumnDef<EmailTemplate>[] = useMemo(() => [
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
            {template.isDefault && (
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
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt"));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
      enableColumnFilter: true,
    },
  ], [deleteTemplate]);

  // Action items for bulk operations
  const actionItems = [
    {
      label: 'Delete',
      onClick: (row: EmailTemplate) => deleteTemplate(row.id),
      icon: Trash2,
      className: 'text-red-600',
      disabled: (row: EmailTemplate) => row.isDefault || false,
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
  };
};

export default useEmail;