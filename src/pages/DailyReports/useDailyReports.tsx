import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { IDailyReport, DailyReportFilters } from "./interface";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getDailyReports } from "@/services/dailyReportService";

const useDailyReports = () => {
  const [filters, setFilters] = useState<DailyReportFilters>({});
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<DailyReportFilters>({});
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["daily-reports", debouncedGlobalSearch],
    queryFn: () => getDailyReports({ search: debouncedGlobalSearch }),
  });

  const reports = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.results || []);

  // Debounce filters
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [filters]);

  // Debounce global search
  useEffect(() => {
    if (globalSearchTimeoutRef.current) {
      clearTimeout(globalSearchTimeoutRef.current);
    }
    globalSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearch);
    }, 500);
    return () => {
      if (globalSearchTimeoutRef.current) clearTimeout(globalSearchTimeoutRef.current);
    };
  }, [globalSearch]);

  const columns: ColumnDef<IDailyReport>[] = useMemo(
    () => [
      {
        accessorKey: "rep_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rep Name" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("rep_name") || "N/A"}</div>
        ),
        enableColumnFilter: true,
      },
      {
        accessorKey: "report_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Report Date" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("report_date") as string;
          return date ? (
            <div className="text-sm">
              {format(new Date(date + "T00:00:00"), "MMM dd, yyyy")}
            </div>
          ) : (
            <div className="text-sm text-gray-400">N/A</div>
          );
        },
        enableColumnFilter: false,
      },
      {
        accessorKey: "birthday_ecards_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Birthday" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("birthday_ecards_count")}</div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "holiday_ecards_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Holiday" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("holiday_ecards_count")}</div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "newsletter_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Newsletter" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("newsletter_count")}</div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "newsletter_monthly_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Coming Home" />
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("newsletter_monthly_count")}
          </div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "total_emails_sent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => (
          <div className="text-center font-bold">
            {row.getValue("total_emails_sent")}
          </div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "email_sent_successfully",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email Sent" />
        ),
        cell: ({ row }) => {
          const sent = row.getValue("email_sent_successfully") as boolean;
          return sent ? (
            <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
              Sent
            </Badge>
          ) : (
            <Badge variant="destructive">Failed</Badge>
          );
        },
        enableColumnFilter: false,
      },
    ],
    []
  );

  // Client-side filtering
  const filteredData = useMemo(() => {
    return reports.filter((item: IDailyReport) => {
      return Object.entries(debouncedFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue =
          item[key as keyof IDailyReport]?.toString().toLowerCase() || "";
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [reports, debouncedFilters]);

  const updateFilter = useCallback(
    (key: keyof DailyReportFilters, value: string) => {
      setFilters((prev) => {
        const newFilters = { ...prev };
        if (value && value.trim() !== "") {
          newFilters[key] = value;
        } else {
          delete newFilters[key];
        }
        return newFilters;
      });
    },
    []
  );

  const clearFilter = (key: keyof DailyReportFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setGlobalSearch("");
  };

  const updateGlobalSearch = useCallback((value: string) => {
    setGlobalSearch(value);
  }, []);

  return {
    columns,
    data: filteredData,
    isLoading,
    isFetching,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
  };
};

export default useDailyReports;
