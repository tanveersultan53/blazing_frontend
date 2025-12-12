import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Send } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { toast } from 'sonner';
import type { EmailTemplate, EmailTemplateList } from './interface';
import { createEmailTemplate, getDefaultEmailTemplate, getEmailTemplates, updateEmailTemplate, deleteEmailTemplate, sendEmail } from '@/services/emailService';
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

interface UseEmailProps {
  isAdmin?: boolean;
}

const useEmail = ({ isAdmin = false }: UseEmailProps = {}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateList | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplateList | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState<EmailTemplateList | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
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

  const updateEmailTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmailTemplate> }) =>
      updateEmailTemplate(id, data),
    onSuccess: () => {
      toast.success('Email template updated successfully');
      getEmailTemplatesQuery.refetch();
    },
    onError: () => {
      toast.error('Failed to update email template');
    },
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

  const sendEmailMutation = useMutation({
    mutationFn: sendEmail,
    onSuccess: (response) => {
      const message = response?.data?.message || 'Email sent successfully';
      const count = response?.data?.recipients_count || 0;
      toast.success(`${message} (${count} recipient${count !== 1 ? 's' : ''})`);
      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setIsSendModalOpen(false);
        setSendingTemplate(null);
      }, 500);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to send email';
      toast.error(errorMessage);
      // Don't close modal on error so user can try again
    },
  });

  // Get templates from API and transform to frontend format
  const templates: EmailTemplateList[] = useMemo(() => {
    const backendTemplates = getEmailTemplatesQuery.data?.data?.results || [];
    console.log('Raw backend templates:', backendTemplates);
    // Transform backend field names to frontend format
    const transformed = backendTemplates.map(template => ({
      ...template,
      id: template.email_id, // Map email_id to id for compatibility
      name: template.email_name, // Map email_name to name
      subject: template.email_subject, // Map email_subject to subject
      customer: template.rep, // Map rep to customer
    }));
    console.log('Transformed templates:', transformed);
    return transformed;
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
      html_content: template.html_content,
      html_file: template.html_file,
      design_json: template.design_json,
      is_active: template.is_active,
    });
  }

  // Update template
  const updateTemplate = useCallback((templateId: number, template: Partial<EmailTemplate>) => {
    updateEmailTemplateMutation.mutate({ id: templateId, data: template });
    setIsEditModalOpen(false);
    setEditingTemplate(null);
  }, [updateEmailTemplateMutation]);

  // Open edit modal
  const openEditModal = useCallback((template: EmailTemplateList) => {
    setEditingTemplate(template);
    setIsEditModalOpen(true);
  }, []);

  // Close edit modal
  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingTemplate(null);
  }, []);

  // Open view modal (using editor modal in view mode)
  const openViewModal = useCallback((template: EmailTemplateList) => {
    setViewingTemplate(template);
    setEditingTemplate(template); // Use editingTemplate for view mode
    setModalMode('view');
    setIsViewModalOpen(true);
  }, []);

  // Close view modal
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingTemplate(null);
    setEditingTemplate(null);
    setModalMode('create');
  }, []);

  // Open send modal
  const openSendModal = useCallback((template: EmailTemplateList) => {
    setSendingTemplate(template);
    setIsSendModalOpen(true);
  }, []);

  // Close send modal
  const closeSendModal = useCallback(() => {
    setIsSendModalOpen(false);
    setSendingTemplate(null);
  }, []);

  // Send email handler
  const handleSendEmail = useCallback(async (recipientType: string, customEmails?: string[]) => {
    if (!sendingTemplate?.id) {
      toast.error('No template selected');
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        template_id: sendingTemplate.id,
        recipient_type: recipientType,
        custom_emails: customEmails,
        include_attachments: true,
      });
    } catch (error) {
      // Error is already handled by mutation's onError
      console.error('Failed to send email:', error);
    }
  }, [sendingTemplate, sendEmailMutation]);

  // Delete template
  const deleteTemplate = useCallback((templateId: number) => {
    deleteEmailTemplateMutation.mutate(templateId);
  }, [deleteEmailTemplateMutation]);

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
        template.name?.toLowerCase().includes(debouncedFilters.name!.toLowerCase())
      );
    }

    if (debouncedFilters.subject) {
      filtered = filtered.filter(template =>
        template.subject?.toLowerCase().includes(debouncedFilters.subject!.toLowerCase())
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
        template.name?.toLowerCase().includes(searchTerm) ||
        template.subject?.toLowerCase().includes(searchTerm)
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
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("created_at");
        if (!dateValue) return <div className="text-sm text-muted-foreground">-</div>;
        const date = new Date(dateValue as string);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("updated_at");
        if (!dateValue) return <div className="text-sm text-muted-foreground">-</div>;
        const date = new Date(dateValue as string);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
      enableColumnFilter: true,
    },
  ], []);

  // Action items for bulk operations - filtered based on admin permissions
  const actionItems = useMemo(() => {
    const allActions = [
      {
        label: 'View',
        onClick: (row: EmailTemplateList) => openViewModal(row),
        icon: Eye,
        className: 'text-gray-600',
      },
      {
        label: 'Edit',
        onClick: (row: EmailTemplateList) => openEditModal(row),
        icon: Edit,
        className: 'text-blue-600',
        adminOnly: true, // Only admins can edit
      },
      {
        label: 'Send',
        onClick: (row: EmailTemplateList) => openSendModal(row),
        icon: Send,
        className: 'text-green-600',
      },
      {
        label: 'Delete',
        onClick: (row: EmailTemplateList) => {
          if (row.id) deleteTemplate(row.id);
        },
        icon: Trash2,
        className: 'text-red-600',
        disabled: (row: EmailTemplateList) => row.is_default || false,
        adminOnly: true, // Only admins can delete
      },
    ];

    // Filter actions based on admin status
    return allActions.filter(action => !action.adminOnly || isAdmin);
  }, [isAdmin, openViewModal, openEditModal, openSendModal, deleteTemplate]);

  return {
    templates: filteredTemplates,
    columns,
    actionItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    isSendModalOpen,
    editingTemplate,
    viewingTemplate,
    sendingTemplate,
    modalMode,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    openSendModal,
    closeSendModal,
    handleSendEmail,
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