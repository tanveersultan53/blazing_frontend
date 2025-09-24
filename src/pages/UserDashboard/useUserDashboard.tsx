import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, deleteContact } from '@/services/contactService';
import { queryKeys } from '@/helpers/constants';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

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
}

export const useUserDashboard = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<PersonData | null>(null);

  const [activeTab, setActiveTab] = useState<'contact' | 'referal_partner' | 'all'>(tab as 'contact' | 'referal_partner' | 'all' || 'contact');
  const queryClient = useQueryClient();


  const { data: contacts, isLoading } = useQuery({
    queryKey: [queryKeys.contacts, activeTab],
    queryFn: ()=>getContacts(activeTab as string),
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

  // Define columns based on the AddPerson form fields
  const columns: ColumnDef<PersonData>[] = useMemo(() => {
    const baseColumns: ColumnDef<PersonData>[] = [
      {
        id: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-blue-600">{row.getValue("email")}</div>,
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
        },
        {
          accessorKey: "title",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
          ),
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
      },
      {
        header: 'Created',
        accessorKey: 'created',
        cell: ({ row }) => {
          const date = new Date(row.getValue("created"));
          return <div >{date.toLocaleDateString()}</div>;
        },
      },
      {
        header: 'Modified',
        accessorKey: 'modified',
        cell: ({ row }) => {
          const date = new Date(row.getValue("modified"));
          return <div>{date.toLocaleDateString()}</div>;
        },
      }
    );

    return baseColumns;
  }, [contacts?.data, activeTab]);

  // Action items for the table
  const actionItems = [
    {
      label: 'Edit',
      onClick: (row: PersonData) => {
        console.log('Edit:', row);
        // Navigate to edit page
      },
      icon: Edit,
    },
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
    console.log('View details for:', row);
    // Implement navigation to details page
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

  return {
    data: contacts?.data?.results || [],
    isLoading,
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
  };
};
