import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { toast } from 'sonner';
import type { EmailTemplate } from './interface';
import { createEmailTemplate, deleteEmailTemplate, getDefaultEmailTemplate, getEmailTemplates, updateEmailTemplate } from '@/services/emailService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/helpers/constants';

// Define filter interface for email templates
export interface EmailTemplateFilters {
  email_name: string;
  email_subject: string;
  send_ecard: boolean;
}

const useEmail = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<EmailTemplate | null>(null);
  const [filters, setFilters] = useState<EmailTemplateFilters>({ email_name: '', email_subject: '', send_ecard: false });
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<EmailTemplateFilters>({ email_name: '', email_subject: '', send_ecard: false });
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

  const deleteEmailTemplateMutation = useMutation({
    mutationFn: deleteEmailTemplate,
    onSuccess: () => {
      toast.success('Email template deleted successfully');
      getEmailTemplatesQuery.refetch();
    },
    onError: () => {
      toast.error('Failed to delete email template');
    },
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

  const updateEmailTemplateMutation = useMutation({
    mutationFn: ({ id, template }: { id: number; template: EmailTemplate }) => updateEmailTemplate(id, template),
    onSuccess: () => {
      toast.success('Email template updated successfully');
      setIsCreateModalOpen(false);
      setTemplateToEdit(null);
      getEmailTemplatesQuery.refetch();
    },
    onError: () => {
      toast.error('Failed to update email template');
      setIsCreateModalOpen(false);
    },
  });

  // Get templates from API
  const templates: EmailTemplate[] = useMemo(() => {
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
    createEmailTemplateMutation.mutate(template);
  }

  // Update template
  const updateTemplate = (template: EmailTemplate) => {
    if (template.email_id) {
      updateEmailTemplateMutation.mutate({ id: template.email_id, template });
    }
  }

  // Open edit modal
  const openEditModal = (template: EmailTemplate) => {
    setTemplateToEdit(template);
    setIsCreateModalOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  // Delete template (called after confirmation)
  const deleteTemplate = () => {
    if (templateToDelete) {
      deleteEmailTemplateMutation.mutate(templateToDelete.email_id as number);
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  // Filter update function
  const updateFilter = useCallback((key: keyof EmailTemplateFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };

      if (value && typeof value === 'string' && value.trim() !== '') {
        //@ts-ignore
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
    setFilters({ email_name: '', email_subject: '', send_ecard: false });
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
    if (debouncedFilters.email_name) {
      filtered = filtered.filter(template =>
        template.email_name?.toLowerCase().includes(debouncedFilters.email_name!.toLowerCase())
      );
    }

    if (debouncedFilters.email_subject) {
      filtered = filtered.filter(template =>
        template.email_subject?.toLowerCase().includes(debouncedFilters.email_subject!.toLowerCase())
      );
    }

    if (debouncedFilters.send_ecard) {
      filtered = filtered.filter(template => template.send_ecard === debouncedFilters.send_ecard);
    }

    // Apply global search
    if (debouncedGlobalSearch) {
      const searchTerm = debouncedGlobalSearch.toLowerCase();
      filtered = filtered.filter(template =>
        template.email_name?.toLowerCase().includes(searchTerm) ||
        template.email_subject?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [templates, debouncedFilters, debouncedGlobalSearch]);

  // Table columns
  const columns: ColumnDef<EmailTemplate>[] = useMemo(() => [
    {
      accessorKey: "email_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "email_subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "email_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email Type" />
      ),
      cell: ({ row }) => {
        const emailTypeId = row.getValue("email_type") as number;
        return <div className="text-sm">{`ECard ${emailTypeId}`}</div>;
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "send_ecard",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="E-Card Status" />
      ),
      cell: ({ row }) => {
        const isSendEcard = row.getValue("send_ecard") as boolean;
        return (
          <Badge variant={isSendEcard ? "default" : "secondary"}>
            {isSendEcard ? "Send" : "Don't Send"}
          </Badge>
        );
      },
      enableColumnFilter: false,
    },

  ], []);

  // Action items for bulk operations
  const actionItems = [
    {
      label: 'Edit',
      onClick: (row: EmailTemplate) => openEditModal(row),
      icon: Pencil,
      className: 'text-blue-600',   
    },
    {
      label: 'Delete',
      onClick: (row: EmailTemplate) => openDeleteDialog(row),
      icon: Trash2,
      className: 'text-red-600',   
    },
  ];

  return {
    templates: filteredTemplates,
    columns,
    actionItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isDeleteDialogOpen,
    templateToDelete,
    closeDeleteDialog,
    templateToEdit,
    setTemplateToEdit,
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