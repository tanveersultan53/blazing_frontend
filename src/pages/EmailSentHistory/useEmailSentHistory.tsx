import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { IEmailSentHistory, EmailSentHistoryFilters } from "./interface";
import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";

// Dummy data for email sent history
const dummyEmailHistory: IEmailSentHistory[] = [
  {
    id: 1,
    email_name: "Welcome Campaign",
    subject: "Welcome to Blazing Social!",
    recipient_email: "john.doe@example.com",
    date_sent: "2024-12-08T10:30:00",
    status: "sent",
    template_name: "Welcome Template",
  },
  {
    id: 2,
    email_name: "Monthly Newsletter",
    subject: "December Newsletter - Top Updates",
    recipient_email: "jane.smith@example.com",
    date_sent: "2024-12-07T14:15:00",
    status: "sent",
    template_name: "Newsletter Template",
  },
  {
    id: 3,
    email_name: "Product Announcement",
    subject: "New Feature Launch!",
    recipient_email: "bob.johnson@example.com",
    date_sent: "2024-12-06T09:00:00",
    status: "failed",
    template_name: "Announcement Template",
  },
  {
    id: 4,
    email_name: "Customer Follow-up",
    subject: "Thank you for your purchase",
    recipient_email: "alice.williams@example.com",
    date_sent: "2024-12-05T16:45:00",
    status: "sent",
    template_name: "Follow-up Template",
  },
  {
    id: 5,
    email_name: "Event Invitation",
    subject: "You're invited to our Webinar!",
    recipient_email: "charlie.brown@example.com",
    date_sent: "2024-12-04T11:20:00",
    status: "sent",
    template_name: "Event Template",
  },
  {
    id: 6,
    email_name: "Password Reset",
    subject: "Reset your password",
    recipient_email: "david.miller@example.com",
    date_sent: "2024-12-03T08:30:00",
    status: "pending",
    template_name: "Security Template",
  },
  {
    id: 7,
    email_name: "Survey Request",
    subject: "We'd love your feedback!",
    recipient_email: "emma.davis@example.com",
    date_sent: "2024-12-02T13:10:00",
    status: "sent",
    template_name: "Survey Template",
  },
  {
    id: 8,
    email_name: "Promotional Campaign",
    subject: "Special Offer - 50% Off!",
    recipient_email: "frank.wilson@example.com",
    date_sent: "2024-12-01T15:00:00",
    status: "sent",
    template_name: "Promotional Template",
  },
];

const useEmailSentHistory = () => {
  const [filters, setFilters] = useState<EmailSentHistoryFilters>({});
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<EmailSentHistoryFilters>({});
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const columns: ColumnDef<IEmailSentHistory>[] = [
    {
      accessorKey: "email_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email Name" />
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "recipient_email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipient Email" />
      ),
      cell: ({ row }) => (
        <div className="text-blue-600">{row.getValue("recipient_email")}</div>
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
        return (
          <div className="text-sm">
            {format(new Date(date), "MMM dd, yyyy hh:mm a")}
          </div>
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
        const status = row.getValue("status") as string;
        return (
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
        );
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "template_name",
      header: "Template",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {row.getValue("template_name") || "N/A"}
        </div>
      ),
      enableColumnFilter: false,
    },
  ];

  // Filter data based on debounced filters and global search
  const filteredData = dummyEmailHistory.filter((item) => {
    // Apply column-specific filters
    const matchesFilters = Object.entries(debouncedFilters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key as keyof IEmailSentHistory]?.toString().toLowerCase() || "";
      return itemValue.includes(value.toLowerCase());
    });

    // Apply global search
    const matchesGlobalSearch = !debouncedGlobalSearch ||
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(debouncedGlobalSearch.toLowerCase())
      );

    return matchesFilters && matchesGlobalSearch;
  });

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
    isLoading: false,
    isFetching: false,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
  };
};

export default useEmailSentHistory;
