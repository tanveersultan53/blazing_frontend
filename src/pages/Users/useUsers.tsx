import type { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/helpers/constants";
import { getUsers, type UserFilters } from "@/services/userManagementService";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { IUserList } from "./interface";
import { formatCellPhone, formatWorkPhone } from "@/lib/phoneFormatter";
import { useState, useEffect, useRef, useCallback } from "react";

const useUsers = () => {
    const [filters, setFilters] = useState<UserFilters>({});
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [debouncedFilters, setDebouncedFilters] = useState<UserFilters>({});
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

    // Debounce global search to prevent too many API calls
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

    const columns: ColumnDef<IUserList>[] = [
        {
            id: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),            
            accessorFn: (row) => `${row.first_name} ${row.last_name}`,
            enableColumnFilter: true,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="text-blue-600">{row.getValue("email")}</div>,
            enableColumnFilter: true,
        },
        {
            accessorKey: "company",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Company" />
            ),
            enableColumnFilter: true,
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Title" />
            ),
            enableColumnFilter: true,
        },
        {
            accessorKey: "work_phone",
            header: "Work Phone",
            cell: ({ row }) => {
                const phoneNumber = row.getValue("work_phone") as string;
                const extension = row.original.work_ext;
                return <div className="text-sm">{formatWorkPhone(phoneNumber, extension)}</div>;
            },
            enableColumnFilter: true,
        },
        {
            accessorKey: "cellphone",
            header: "Cell Phone",
            cell: ({ row }) => {
                const phoneNumber = row.getValue("cellphone") as string;
                return <div className="text-sm">{formatCellPhone(phoneNumber)}</div>;
            },
            enableColumnFilter: true,
        },
        {
            id: "location",
            header: "Location",
            accessorFn: (row) => `${row.city}, ${row.state}`,
            enableColumnFilter: true,
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("is_active") as boolean;
                return (
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                );
            },
            enableColumnFilter: false,
        },
        {
            accessorKey: "is_superuser",
            header: "Role",
            cell: ({ row }) => {
                const isSuperuser = row.getValue("is_superuser") as boolean;
                return (
                    <Badge variant={isSuperuser ? "destructive" : "outline"}>
                        {isSuperuser ? "Admin" : "User"}
                    </Badge>
                );
            },
            enableColumnFilter: false,
        },
    ]


    const { data: users, isLoading, isFetching, error } = useQuery({
        queryKey: [queryKeys.usersList, JSON.stringify(debouncedFilters), debouncedGlobalSearch],
        queryFn: () => getUsers({ 
            ...debouncedFilters,
            search: debouncedGlobalSearch || undefined
        }),
        staleTime: 30000, // Consider data fresh for 30 seconds
    });

    if (error instanceof AxiosError && error.response) {
        toast.error(error.response?.data?.detail ?? "Error fetching users");
    }

    // Filter update function
    const updateFilter = useCallback((key: keyof UserFilters, value: string) => {
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

    const clearFilter = (key: keyof UserFilters) => {
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
        data: users?.data?.results || [],
        users,
        isLoading,
        isFetching,
        error,
        filters,
        updateFilter,
        clearFilter,
        clearAllFilters,
        globalSearch,
        updateGlobalSearch,
    };
};

export default useUsers;