import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, deleteContact, type ContactFilters } from '@/services/contactService';
import { getEmailTemplates, sendEmail } from '@/services/emailService';
import { queryKeys } from '@/helpers/constants';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatCellPhone, formatWorkPhone } from '@/lib/phoneFormatter';

export interface PersonData {
  id: number
  first_name: string
  last_name: string
  email: string
  title: string
  company: string
  customer_type: string
  send_status: string
  newsletter_version: string
  status: string
  optout: boolean
  created: string
  modified: string
  cell: string
  work_phone: string
  work_ext: string
}

export const useUserDashboard = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<PersonData | null>(null);
  const [sendEmailModalOpen, setSendEmailModalOpen] = useState(false);
  const [selectedContactsForEmail, setSelectedContactsForEmail] = useState<PersonData[]>([]);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<ContactFilters>({});
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeTab, setActiveTab] = useState<'contact' | 'referal_partner' | 'all'>(tab as 'contact' | 'referal_partner' | 'all' || 'contact');
  const queryClient = useQueryClient();


  // Debounce filters to prevent too many API calls
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

  // Debounce global search to prevent too many API calls
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

  const { data: contacts, isLoading, isFetching } = useQuery({
    queryKey: [queryKeys.contacts, activeTab, JSON.stringify(debouncedFilters), debouncedGlobalSearch],
    queryFn: () => {
      // Map tab values to customer_type values
      let customerType = undefined;
      if (activeTab === 'contact') {
        customerType = 'contact';
      } else if (activeTab === 'referal_partner') {
        customerType = 'partner';
      }
      // For 'all' tab, don't pass customer_type filter

      return getContacts({
        customer_type: customerType,
        ...debouncedFilters,
        search: debouncedGlobalSearch || undefined
      });
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Get email templates
  const { data: emailTemplatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: [queryKeys.getEmailTemplates as string],
    queryFn: getEmailTemplates,
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => deleteContact(contactId),
    onSuccess: () => {
      // Invalidate and refetch contacts data
      queryClient.invalidateQueries({ queryKey: [queryKeys.contacts, activeTab] });
      toast.success('Contact deleted successfully');
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: sendEmail,
    onSuccess: (response) => {
      const message = response?.data?.message || 'Email sent successfully';
      const count = response?.data?.recipients_count || 0;
      toast.success(`${message} (${count} recipient${count !== 1 ? 's' : ''})`);
      setSendEmailModalOpen(false);
      setSelectedContactsForEmail([]);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to send email';
      toast.error(errorMessage);
    },
  });

  // Define columns based on the AddPerson form fields
  const columns: ColumnDef<PersonData>[] = useMemo(() => {
    const baseColumns: ColumnDef<PersonData>[] = [
      {
        id: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        enableColumnFilter: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-blue-600">{row.getValue("email")}</div>,
        enableColumnFilter: true,
      },
      {
        accessorKey: "cell",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cell Phone" />
        ),
        cell: ({ row }) => {
          const phoneNumber = row.getValue("cell") as string;
          return <div className="text-sm">{formatCellPhone(phoneNumber)}</div>;
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "work_phone",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Work Phone" />
        ),
        cell: ({ row }) => {
          const phoneNumber = row.getValue("work_phone") as string;
          const extension = row.original.work_ext;
          return <div className="text-sm">{formatWorkPhone(phoneNumber, extension)}</div>;
        },
        enableColumnFilter: true,
      },
    ];

    // Add company and title columns only when activeTab is 'all' or 'referal_partner'
    if (activeTab === 'all' || activeTab === 'referal_partner') {
      baseColumns.push(
        {
          accessorKey: "company",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Company" />
          ),
          enableColumnFilter: true,
        },
        {
          accessorKey: "title",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
          ),
          enableColumnFilter: true,
        }
      );
    }

    // Add remaining columns
    baseColumns.push(
      {
        header: 'Status',
        accessorKey: 'send_status',
        cell: ({ row }) => {
          const sendStatus = row.getValue("send_status") as string;
          const variant = sendStatus === "send" ? "default" : "destructive";
          const displayText = sendStatus === "send" ? "Send" : "Don't Send";
          return (
            <Badge variant={variant}>
              {displayText}
            </Badge>
          );
        },
        enableColumnFilter: true,
      },
      {
        header: 'Created',
        accessorKey: 'created',
        cell: ({ row }) => {
          const date = new Date(row.getValue("created"));
          return <div >{date.toLocaleDateString()}</div>;
        },
        enableColumnFilter: true,
      },
      {
        header: 'Modified',
        accessorKey: 'modified',
        cell: ({ row }) => {
          const date = new Date(row.getValue("modified"));
          return <div>{date.toLocaleDateString()}</div>;
        },
        enableColumnFilter: true,
      }
    );

    return baseColumns;
  }, [activeTab]);

  // Action items for the table
  const actionItems = [
    {
      label: 'Delete',
      onClick: (row: PersonData) => {
        setContactToDelete(row);
        setDeleteDialogOpen(true);
      },
      icon: Trash2,
      className: 'text-red-600',
    },
  ];

  const handleViewDetails = (row: PersonData) => {
    // Navigate to the contact details page with the contact ID
    navigate(`/contacts/${row.id}`);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete.id.toString());
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  // Filter update function
  const updateFilter = useCallback((key: keyof ContactFilters, value: string) => {
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

  const clearFilter = (key: keyof ContactFilters) => {
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

  const handleDeleteSelected = (selectedRows: PersonData[]) => {
    console.log("Delete selected rows:", selectedRows);
  };

  const handleSendEmailSelected = (selectedRows: PersonData[]) => {
    setSelectedContactsForEmail(selectedRows);
    setSendEmailModalOpen(true);
  };

  const handleSendEmail = async (
    templateId: number,
    contactEmails: string[],
    _emailName: string,
    _emailSubject: string,
    _attachments: File[]
  ) => {
    if (!templateId || contactEmails.length === 0) {
      toast.error('Please select a template and ensure contacts have valid emails');
      return;
    }

    await sendEmailMutation.mutateAsync({
      template_id: templateId,
      recipient_type: 'custom',
      custom_emails: contactEmails,
      include_attachments: true,
    });
  };

  const closeSendEmailModal = () => {
    setSendEmailModalOpen(false);
    setSelectedContactsForEmail([]);
  };

  // Transform email templates to match the interface
  const emailTemplates = useMemo(() => {
    const backendTemplates = emailTemplatesData?.data?.results || [];
    return backendTemplates.map(template => ({
      ...template,
      id: template.email_id,
      name: template.email_name,
      subject: template.email_subject,
      customer: template.rep,
    }));
  }, [emailTemplatesData]);

  return {
    data: contacts?.data?.results || [],
    isLoading,
    isFetching,
    columns,
    actionItems,
    selectedRows,
    setSelectedRows,
    handleViewDetails,
    activeTab,
    setActiveTab,
    deleteDialogOpen,
    contactToDelete,
    handleConfirmDelete,
    handleCancelDelete,
    isDeleting: deleteContactMutation.isPending,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
    handleDeleteSelected,
    handleSendEmailSelected,
    sendEmailModalOpen,
    selectedContactsForEmail,
    handleSendEmail,
    closeSendEmailModal,
    emailTemplates,
    isLoadingTemplates,
  };
};
