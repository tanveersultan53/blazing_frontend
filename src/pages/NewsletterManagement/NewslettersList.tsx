import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { getNewsletters } from '@/services/newsletterService';
import type { INewsletter } from './interface';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function NewslettersList() {
  const navigate = useNavigate();

  // Fetch newsletters
  const { data, isLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => getNewsletters(),
  });

  const newsletters = data?.data?.results || [];

  // Memoize breadcrumbs
  const breadcrumbs = useMemo(() => [{ label: 'Newsletters' }], []);
  useBreadcrumbs(breadcrumbs);

  // Define columns
  const columns = useMemo<ColumnDef<INewsletter>[]>(
    () => [
      {
        accessorKey: 'newsletter_label',
        header: 'Newsletter Label',
        cell: ({ row }) => (
          <div className="font-medium">{row.original.newsletter_label}</div>
        ),
      },
      {
        accessorKey: 'scheduled_date',
        header: 'Scheduled Date',
        cell: ({ row }) => {
          const date = row.original.scheduled_date;
          const time = row.original.scheduled_time;
          if (!date) return <span className="text-muted-foreground">Not scheduled</span>;

          try {
            const formattedDate = format(new Date(date), 'MMM dd, yyyy');
            return (
              <div>
                <div>{formattedDate}</div>
                {time && <div className="text-xs text-muted-foreground">{time}</div>}
              </div>
            );
          } catch {
            return <span>{date}</span>;
          }
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'created',
        header: 'Created',
        cell: ({ row }) => {
          const created = row.original.created;
          if (!created) return <span className="text-muted-foreground">—</span>;

          try {
            return format(new Date(created), 'MMM dd, yyyy');
          } catch {
            return <span>{created}</span>;
          }
        },
      },
    ],
    []
  );

  const handleCreateNewsletter = () => {
    navigate('/newsletters/create');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageHeader
      title="Newsletter Management"
      description="Create and manage your newsletters, schedule sends, and track performance."
      actions={[
        {
          label: 'Create Newsletter',
          onClick: handleCreateNewsletter,
          variant: 'default',
          icon: Plus,
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={newsletters}
        searchColumns={['newsletter_label', 'scheduled_date', 'status']}
        showActionsColumn
        onViewDetails={(row: INewsletter) => navigate(`/newsletters/${row.id}`)}
        actionItems={[
          {
            label: 'View',
            icon: Eye,
            onClick: (row: INewsletter) => navigate(`/newsletters/${row.id}`),
          },
          {
            label: 'Edit',
            icon: Edit,
            onClick: (row: INewsletter) => navigate(`/newsletters/edit/${row.id}`),
          },
          {
            label: 'Delete',
            icon: Trash2,
            className: 'text-red-600',
            onClick: (row: INewsletter) => console.log('Delete', row.id),
          },
        ]}
      />
    </PageHeader>
  );
}
