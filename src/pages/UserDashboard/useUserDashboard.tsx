import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

export interface PersonData {
  id: string;
  type: 'contact' | 'referal_partner';
  first_name: string;
  last_name: string;
  title?: string;
  company?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cellphone: string;
  work_phone?: string;
  birthday?: string;
  age?: number;
  group?: string;
  status?: string;
  optout?: string;
  newsletter_version?: string;
  spouse_first?: string;
  spouse_last?: string;
  spouse_email?: string;
  sbirthday?: string;
  sage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Dummy data for contacts
const dummyContacts: PersonData[] = [
  {
    id: '1',
    type: 'contact',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    cellphone: '+1234567890',
    work_phone: '+1234567891',
    birthday: '1990-05-15',
    age: 34,
    group: 'family',
    status: 'send',
    optout: 'send',
    newsletter_version: 'long_version',
    spouse_first: 'Jane',
    spouse_last: 'Doe',
    spouse_email: 'jane.doe@email.com',
    sbirthday: '1992-08-20',
    sage: 32,
    notes: 'Regular customer, prefers email communication',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'contact',
    first_name: 'Sarah',
    last_name: 'Smith',
    email: 'sarah.smith@email.com',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
    cellphone: '+1987654321',
    birthday: '1985-12-03',
    age: 39,
    group: 'friends',
    status: 'send',
    optout: 'dont_send',
    newsletter_version: 'short_version',
    notes: 'Prefers text messages over calls',
    created_at: '2024-01-20T14:15:00Z',
    updated_at: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    type: 'contact',
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.j@email.com',
    address: '789 Pine St',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    cellphone: '+1555123456',
    work_phone: '+1555123457',
    birthday: '1988-03-22',
    age: 36,
    group: 'business',
    status: 'dont_send',
    optout: 'send',
    newsletter_version: 'none',
    spouse_first: 'Lisa',
    spouse_last: 'Johnson',
    spouse_email: 'lisa.j@email.com',
    sbirthday: '1990-07-10',
    sage: 34,
    notes: 'Business contact, very responsive',
    created_at: '2024-02-01T09:45:00Z',
    updated_at: '2024-02-01T09:45:00Z'
  }
];

// Dummy data for referral partners
const dummyReferralPartners: PersonData[] = [
  {
    id: '4',
    type: 'referal_partner',
    first_name: 'David',
    last_name: 'Wilson',
    title: 'Senior Partner',
    company: 'Wilson & Associates',
    email: 'david.wilson@wilsonassoc.com',
    address: '321 Business Blvd',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    cellphone: '+1305123456',
    work_phone: '+1305123457',
    birthday: '1982-11-18',
    age: 42,
    group: 'business',
    status: 'send',
    optout: 'send',
    newsletter_version: 'long_version',
    notes: 'High-value referral partner, excellent track record',
    created_at: '2024-01-10T08:20:00Z',
    updated_at: '2024-01-10T08:20:00Z'
  },
  {
    id: '5',
    type: 'referal_partner',
    first_name: 'Emily',
    last_name: 'Brown',
    title: 'Managing Director',
    company: 'Brown Enterprises',
    email: 'emily.brown@brownent.com',
    address: '654 Corporate Dr',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    cellphone: '+1206123456',
    work_phone: '+1206123457',
    birthday: '1979-04-25',
    age: 45,
    group: 'business',
    status: 'send',
    optout: 'send',
    newsletter_version: 'short_version',
    notes: 'Strategic partner, quarterly meetings scheduled',
    created_at: '2024-01-25T16:30:00Z',
    updated_at: '2024-01-25T16:30:00Z'
  },
  {
    id: '6',
    type: 'referal_partner',
    first_name: 'Robert',
    last_name: 'Davis',
    title: 'CEO',
    company: 'Davis Solutions',
    email: 'robert.davis@davissolutions.com',
    address: '987 Executive Way',
    city: 'Austin',
    state: 'TX',
    zip: '73301',
    cellphone: '+1512123456',
    work_phone: '+1512123457',
    birthday: '1975-09-12',
    age: 49,
    group: 'business',
    status: 'dont_send',
    optout: 'send',
    newsletter_version: 'long_version',
    notes: 'New partnership, initial meeting completed',
    created_at: '2024-02-05T11:00:00Z',
    updated_at: '2024-02-05T11:00:00Z'
  }
];

export const useUserDashboard = (activeTab: 'contact' | 'referal_partner' | 'all') => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Get data based on active tab
  const data = useMemo(() => {
    switch (activeTab) {
      case 'contact':
        return dummyContacts;
      case 'referal_partner':
        return dummyReferralPartners;
      case 'all':
        return [...dummyContacts, ...dummyReferralPartners];
      default:
        return [];
    }
  }, [activeTab]);

  // Define columns based on the AddPerson form fields
  const columns: ColumnDef<PersonData>[] = useMemo(() => {
    const baseColumns: ColumnDef<PersonData>[] = [
      {
        accessorKey: 'first_name',
        header: 'First Name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('first_name')}</div>
        ),
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('last_name')}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="text-blue-600">{row.getValue('email')}</div>
        ),
      },
      {
        accessorKey: 'cellphone',
        header: 'Phone',
        cell: ({ row }) => (
          <div>{row.getValue('cellphone')}</div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ row }) => (
          <div>{row.getValue('city')}</div>
        ),
      },
      {
        accessorKey: 'state',
        header: 'State',
        cell: ({ row }) => (
          <div>{row.getValue('state')}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.getValue('type') as string;
          return (
            <Badge variant={type === 'contact' ? 'default' : 'secondary'}>
              {type === 'contact' ? 'Contact' : 'Referral Partner'}
            </Badge>
          );
        },
      },
    ];

    // Add conditional columns based on type
    if (activeTab === 'referal_partner' || activeTab === 'all') {
      baseColumns.splice(2, 0, {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div>{row.getValue('title') || '-'}</div>
        ),
      });
      baseColumns.splice(3, 0, {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('company') || '-'}</div>
        ),
      });
    }

    // Add additional columns that can be toggled
    const additionalColumns: ColumnDef<PersonData>[] = [
      {
        accessorKey: 'address',
        header: 'Address',
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">{row.getValue('address')}</div>
        ),
      },
      {
        accessorKey: 'zip',
        header: 'ZIP',
        cell: ({ row }) => (
          <div>{row.getValue('zip')}</div>
        ),
      },
      {
        accessorKey: 'work_phone',
        header: 'Work Phone',
        cell: ({ row }) => (
          <div>{row.getValue('work_phone') || '-'}</div>
        ),
      },
      {
        accessorKey: 'group',
        header: 'Group',
        cell: ({ row }) => {
          const group = row.getValue('group') as string;
          return (
            <Badge variant="outline" className="capitalize">
              {group || '-'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge variant={status === 'send' ? 'default' : 'secondary'}>
              {status === 'send' ? 'Send' : "Don't Send"}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'optout',
        header: 'Opt-out',
        cell: ({ row }) => {
          const optout = row.getValue('optout') as string;
          return (
            <Badge variant={optout === 'send' ? 'default' : 'destructive'}>
              {optout === 'send' ? 'Send' : "Don't Send"}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'newsletter_version',
        header: 'Newsletter',
        cell: ({ row }) => {
          const version = row.getValue('newsletter_version') as string;
          const versionMap: Record<string, string> = {
            'long_version': 'Long',
            'short_version': 'Short',
            'none': 'None'
          };
          return (
            <Badge variant="outline">
              {versionMap[version] || '-'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string;
          return (
            <div>{new Date(date).toLocaleDateString()}</div>
          );
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated',
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string;
          return (
            <div>{new Date(date).toLocaleDateString()}</div>
          );
        },
      },
    ];

    return [...baseColumns, ...additionalColumns];
  }, [activeTab]);

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
        console.log('Delete:', row);
        // Show confirmation and delete
      },
      icon: Trash2,
      className: 'text-red-600',
    },
  ];

  const handleViewDetails = (row: PersonData) => {
    console.log('View details for:', row);
    // Implement navigation to details page
  };

  return {
    data,
    columns,
    actionItems,
    selectedRows,
    setSelectedRows,
    handleViewDetails,
  };
};
