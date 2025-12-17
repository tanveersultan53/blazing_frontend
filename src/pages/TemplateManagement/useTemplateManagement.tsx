import type { ColumnDef } from "@tanstack/react-table";
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { ITemplate } from "./interface";
import { getTemplates } from "@/services/templateManagementService";
import { format } from "date-fns";

const useTemplateManagement = () => {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [globalSearch, setGlobalSearch] = useState<string>("");

    // Fetch templates from API
    const { data: templatesData, isLoading, isFetching } = useQuery({
        queryKey: ["templates", filters, globalSearch],
        queryFn: () => getTemplates({ ...filters, search: globalSearch }),
    });

    const templates = templatesData?.data?.results || [];

    const columns: ColumnDef<ITemplate>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Template Name" />
            ),
            enableColumnFilter: true,
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                const getTypeColor = (type: string) => {
                    switch (type) {
                        case "newsletter":
                            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                        case "promotional":
                            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                        case "transactional":
                            return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
                        case "announcement":
                            return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
                        default:
                            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
                    }
                };
                return (
                    <Badge variant="outline" className={getTypeColor(type)}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                );
            },
            enableColumnFilter: true,
        },
        {
            accessorKey: "is_active",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const isActive = row.getValue("is_active") as boolean;
                return (
                    <Badge
                        variant="outline"
                        className={
                            isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }
                    >
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                );
            },
            enableColumnFilter: false,
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

    return {
        columns,
        data: templates,
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

export default useTemplateManagement;
