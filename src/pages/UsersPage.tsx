import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { usePageTitle } from '@/hooks/usePageTitle';
import PageHeader from '@/components/PageHeader';

const UsersPage: React.FC = () => {
  // Set the page title for breadcrumb
  usePageTitle('Users');

  type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
  }

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
  ]

  const data: Payment[] = [
    {
      id: "729cbf67-ccdc-4a27-82f0-eaca045d5bcb",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "729cbf67-ccdc-4a27-82f0-eaca045d5bcb",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "729cbf67-ccdc-4a27-82f0-eaca045d5bcb",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "729cbf67-ccdc-4a27-82f0-eaca045d5bcb",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ]


  return (
    <PageHeader 
      title="User Management" 
      description="Manage your application users, their roles, permissions, and account settings. View user activity, update profiles, and control access to different features of your application."
    >
      <DataTable columns={columns} data={data} />
    </PageHeader>
  );
};

export default UsersPage;
