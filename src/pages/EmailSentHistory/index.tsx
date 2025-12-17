import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/PageHeader";
import useEmailSentHistory from "./useEmailSentHistory";
import Loading from "@/components/Loading";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import { Mail, FileDown, RefreshCw } from "lucide-react";
import type { IEmailSentHistory } from "./interface";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const EmailSentHistory = () => {
  const {
    columns,
    data,
    isLoading,
    isFetching,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
  } = useEmailSentHistory();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useSelector(
    (state: { user: { currentUser: User } }) => state.user.currentUser
  );

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [{ label: "Email Sent History" }], []);

  useBreadcrumbs(breadcrumbs);

  // Handle export functionality
  const handleExport = () => {
    console.log("Export email history clicked");
    // TODO: Implement export logic
  };

  // Handle refresh functionality
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['sent-emails'] });
  };

  // Column titles mapping for filter placeholders
  const columnTitles = {
    contact_name: "Contact Name",
    email: "Recipient Email",
    template_name: "Template Name",
    rep_name: "Sent By",
  };

  // Redirect non-admin users
  if (!currentUser?.is_superuser) {
    navigate("/user-dashboard");
    return <></>;
  }

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <PageHeader
        title="Email Sent History"
        description="View and manage the history of all sent emails including recipients, subjects, and delivery status."
        actions={[
          {
            label: "Refresh",
            onClick: handleRefresh,
            variant: "outline",
            icon: RefreshCw,
          },
          {
            label: "Export History",
            onClick: handleExport,
            variant: "outline",
            icon: FileDown,
          },
        ]}
      >
        <DataTable
          columns={columns}
          data={data}
          searchColumns={["contact_name", "email", "template_name", "rep_name"]}
          showActionsColumn
          onViewDetails={(row: IEmailSentHistory) =>
            console.log("View email details:", row.id)
          }
          actionItems={[
            {
              label: "View Details",
              icon: Mail,
              className: "text-blue-600",
              onClick: (row: IEmailSentHistory) =>
                console.log("View details:", row.id),
            },
          ]}
          filters={filters as Record<string, string | undefined>}
          onFilterChange={(key: string, value: string) =>
            updateFilter(key as keyof typeof filters, value)
          }
          onClearFilter={(key: string) =>
            clearFilter(key as keyof typeof filters)
          }
          onClearAllFilters={clearAllFilters}
          columnTitles={columnTitles}
          isFetching={isFetching}
          isLoading={isLoading}
          globalSearch={globalSearch}
          onGlobalSearchChange={updateGlobalSearch}
          enableRowSelection={false}
        />
      </PageHeader>
    </>
  );
};

export default EmailSentHistory;