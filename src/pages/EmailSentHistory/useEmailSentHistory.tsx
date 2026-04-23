import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { IEmailSentHistory, EmailSentHistoryFilters } from "./interface";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getDailyReports } from "@/services/dailyReportService";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const ColumnHeaderWithInfo = ({
  column,
  title,
  info,
}: {
  column: any;
  title: string;
  info: string;
}) => (
  <div className="flex items-center gap-1">
    <DataTableColumnHeader column={column} title={title} />
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p>{info}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

const useEmailSentHistory = () => {
  const [filters, setFilters] = useState<EmailSentHistoryFilters>({});
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<EmailSentHistoryFilters>({});
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

  const columns: ColumnDef<IEmailSentHistory>[] = useMemo(
    () => [
      {
        accessorKey: "rep_name",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="User"
            info="The representative's name who sent the emails."
          />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("rep_name") || "N/A"}</div>
        ),
        enableColumnFilter: true,
      },
      {
        accessorKey: "report_date",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="Date"
            info="The date the emails were sent by the cron job."
          />
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
        accessorKey: "holiday_ecards_count",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="Holidays"
            info="Number of holiday ecards sent to contacts and partners."
          />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("holiday_ecards_count")}</div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "birthday_ecards_count",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="Birthdays"
            info="Number of birthday ecards sent to contacts and partners."
          />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("birthday_ecards_count")}</div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "newsletter_count",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="Weekly Newsletters"
            info="Number of weekly newsletters sent to contacts and partners."
          />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("newsletter_count")}</div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "coming_home_count",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="Coming Home"
            info="Number of Coming Home digital newsletters sent."
          />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("coming_home_count")}</div>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "next_due_contacts",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="Next Due - C"
            info="Next scheduled date for the weekly newsletter for Contacts (from autooptions.newsletter_date)."
          />
        ),
        cell: ({ row }) => {
          const date = row.getValue("next_due_contacts") as string | null;
          return date ? (
            <div className="text-sm text-center">
              {format(new Date(date + "T00:00:00"), "MMM dd, yyyy")}
            </div>
          ) : (
            <div className="text-sm text-center text-gray-400">-</div>
          );
        },
        enableColumnFilter: false,
      },
      {
        accessorKey: "next_due_partners",
        header: ({ column }) => (
          <ColumnHeaderWithInfo
            column={column}
            title="Next Due - R"
            info="Next scheduled date for the weekly newsletter for Referral Partners (from autooptions.newsletter_date2)."
          />
        ),
        cell: ({ row }) => {
          const date = row.getValue("next_due_partners") as string | null;
          return date ? (
            <div className="text-sm text-center">
              {format(new Date(date + "T00:00:00"), "MMM dd, yyyy")}
            </div>
          ) : (
            <div className="text-sm text-center text-gray-400">-</div>
          );
        },
        enableColumnFilter: false,
      },
    ],
    []
  );

  // Client-side filtering
  const filteredData = useMemo(() => {
    return reports.filter((item: IEmailSentHistory) => {
      return Object.entries(debouncedFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue =
          item[key as keyof IEmailSentHistory]?.toString().toLowerCase() || "";
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [reports, debouncedFilters]);

  const updateFilter = useCallback(
    (key: keyof EmailSentHistoryFilters, value: string) => {
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

  const clearFilter = (key: keyof EmailSentHistoryFilters) => {
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

export default useEmailSentHistory;
