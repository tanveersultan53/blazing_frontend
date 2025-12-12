import type { ColumnDef } from "@tanstack/react-table";
import { useState, useCallback } from "react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { ITemplate } from "./interface";
import { format } from "date-fns";

const useTemplateManagement = () => {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [globalSearch, setGlobalSearch] = useState<string>("");

    // Mock data - replace with actual API call
    const mockTemplates: ITemplate[] = [
        {
            id: 1,
            name: "Welcome Email Template",
            assigned_user: "John Doe",
            assigned_user_id: 1,
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-20T14:45:00Z",
        },
        {
            id: 2,
            name: "Newsletter Template",
            assigned_user: "Jane Smith",
            assigned_user_id: 2,
            created_at: "2024-02-10T09:15:00Z",
        },
        {
            id: 3,
            name: "Promotion Email",
            assigned_user: "Mike Johnson",
            assigned_user_id: 3,
            created_at: "2024-03-05T16:20:00Z",
        },
    ];

    const columns: ColumnDef<ITemplate>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Template Name" />
            ),
            enableColumnFilter: true,
        },
        {
            accessorKey: "assigned_user",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Assigned User" />
            ),
            enableColumnFilter: true,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created Date" />
            ),
            cell: ({ row }) => {
                const date = row.getValue("created_at") as string;
                return <div>{format(new Date(date), "MMM dd, yyyy")}</div>;
            },
            enableColumnFilter: true,
        },
    ];

    // Filter update function
    const updateFilter = useCallback((key: string, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };

            if (value && value.trim() !== '') {
                newFilters[key] = value;
            } else {
                delete newFilters[key];
            }

            return newFilters;
        });
    }, []);

    const clearFilter = (key: string) => {
        setFilters(prev => {
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

    // Filter templates based on filters and global search
    const filteredTemplates = mockTemplates.filter(template => {
        // Apply global search
        if (globalSearch) {
            const searchLower = globalSearch.toLowerCase();
            const matchesGlobalSearch =
                template.name.toLowerCase().includes(searchLower) ||
                template.assigned_user.toLowerCase().includes(searchLower);
            if (!matchesGlobalSearch) return false;
        }

        // Apply column filters
        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                const templateValue = template[key as keyof ITemplate];
                if (typeof templateValue === 'string') {
                    if (!templateValue.toLowerCase().includes(value.toLowerCase())) {
                        return false;
                    }
                }
            }
        }

        return true;
    });

    return {
        columns,
        data: filteredTemplates,
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

export default useTemplateManagement;
