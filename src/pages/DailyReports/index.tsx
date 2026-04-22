import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/PageHeader";
import useDailyReports from "./useDailyReports";
import Loading from "@/components/Loading";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import { Eye, RefreshCw, Trash2 } from "lucide-react";
import type { IDailyReport } from "./interface";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getDailyReportById, purgeDailyReports } from "@/services/dailyReportService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DailyReports = () => {
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
  } = useDailyReports();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useSelector(
    (state: { user: { currentUser: User } }) => state.user.currentUser
  );

  const [selectedReportHtml, setSelectedReportHtml] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const breadcrumbs = useMemo(() => [{ label: "Daily Reports" }], []);
  useBreadcrumbs(breadcrumbs);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
  };

  const handlePurge = async () => {
    if (!confirm("Delete all reports older than 30 days? This cannot be undone.")) return;
    setIsPurging(true);
    try {
      const res = await purgeDailyReports(30);
      toast.success(`Purged ${res.data.deleted_count} report(s) older than ${res.data.cutoff_date}`);
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
    } catch {
      toast.error("Failed to purge reports");
    } finally {
      setIsPurging(false);
    }
  };

  const handleViewReport = async (row: IDailyReport) => {
    setLoadingReport(true);
    setDialogOpen(true);
    try {
      const response = await getDailyReportById(row.id);
      setSelectedReportHtml(response.data.report_html || "<p>No report HTML available.</p>");
    } catch {
      setSelectedReportHtml("<p>Error loading report.</p>");
    } finally {
      setLoadingReport(false);
    }
  };

  const columnTitles = {
    rep_name: "Rep Name",
  };

  if (!currentUser?.is_superuser) {
    navigate("/user-dashboard");
    return <></>;
  }

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <PageHeader
        title="Daily Reports"
        description="View daily email report summaries for each representative."
        actions={[
          {
            label: isPurging ? "Purging..." : "Purge 30+ Days",
            onClick: handlePurge,
            variant: "destructive" as const,
            icon: Trash2,
            disabled: isPurging,
          },
          {
            label: "Refresh",
            onClick: handleRefresh,
            variant: "outline",
            icon: RefreshCw,
          },
        ]}
      >
        <DataTable
          columns={columns}
          data={data}
          searchColumns={["rep_name"]}
          showActionsColumn
          actionItems={[
            {
              label: "View Report",
              icon: Eye,
              className: "text-blue-600",
              onClick: (row: IDailyReport) => handleViewReport(row),
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Daily Email Report</DialogTitle>
          </DialogHeader>
          {loadingReport ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : (
            <div
              className="mt-4"
              dangerouslySetInnerHTML={{
                __html: selectedReportHtml || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyReports;
