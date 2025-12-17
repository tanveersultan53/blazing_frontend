import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { IEmailSentHistory, EmailSentHistoryFilters } from "./interface";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getSentEmails } from "@/services/emailService";

const useEmailSentHistory = () => {
  const [filters, setFilters] = useState<EmailSentHistoryFilters>({});
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<EmailSentHistoryFilters>({});
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch sent email history from API
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['sent-emails', debouncedGlobalSearch],
    queryFn: () => getSentEmails({ search: debouncedGlobalSearch }),
  });

  // Debug logging
  useEffect(() => {
    console.log('Sent Emails API Response:', data);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);
  }, [data, isLoading, error]);

  // Handle both array response and paginated response formats
  const sentEmails = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.results || []);

  console.log('Processed sentEmails:', sentEmails);

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

  // Debounce global search
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

  const columns: ColumnDef<IEmailSentHistory>[] = useMemo(() => [
    {
      accessorKey: "contact_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("contact_name") || "N/A"}</div>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipient Email" />
      ),
      cell: ({ row }) => (
        <div className="text-blue-600">{row.getValue("email")}</div>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "template_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("template_name") || "N/A"}</div>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "rep_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent By" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">{row.getValue("rep_name") || "N/A"}</div>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "date_sent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Sent" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("date_sent") as string;
        return date ? (
          <div className="text-sm">
            {format(new Date(date), "MMM dd, yyyy hh:mm a")}
          </div>
        ) : (
          <div className="text-sm text-gray-400">N/A</div>
        );
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string | undefined;
        return status ? (
          <Badge
            variant={
              status === "sent"
                ? "default"
                : status === "failed"
                ? "destructive"
                : "secondary"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        ) : (
          <Badge variant="default">Sent</Badge>
        );
      },
      enableColumnFilter: false,
    },
  ], []);

  // Filter data based on debounced filters (client-side filtering)
  const filteredData = useMemo(() => {
    return sentEmails.filter((item) => {
      // Apply column-specific filters
      const matchesFilters = Object.entries(debouncedFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof IEmailSentHistory]?.toString().toLowerCase() || "";
        return itemValue.includes(value.toLowerCase());
      });

      return matchesFilters;
    });
  }, [sentEmails, debouncedFilters]);

  // Filter update function
  const updateFilter = useCallback((key: keyof EmailSentHistoryFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (value && value.trim() !== "") {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }

      return newFilters;
    });
  }, []);

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

  // Global search functions
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
