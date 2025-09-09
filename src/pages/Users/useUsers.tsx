import type { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/helpers/constants";
import { getUsers } from "@/services/userManagementService";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { IUserList } from "./interface";

const useUsers = () => {
    const columns: ColumnDef<IUserList>[] = [
        {
            id: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),            
            accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="text-blue-600">{row.getValue("email")}</div>,
        },
        {
            accessorKey: "company",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Company" />
            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Title" />
            ),
        },
        {
            accessorKey: "work_phone",
            header: "Work Phone",
        },
        {
            accessorKey: "cellphone",
            header: "Cell Phone",
        },
        {
            id: "location",
            header: "Location",
            accessorFn: (row) => `${row.city}, ${row.state}`,
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
        },
    ]


    const { data: users, isLoading, error } = useQuery({
        queryKey: [queryKeys.usersList],
        queryFn: getUsers,
    });

    if (error instanceof AxiosError && error.response) {
        toast.error(error.response?.data?.detail ?? "Error fetching users");
    }
    
    return {
        columns,
        data: users?.data?.results || [],
        users,
        isLoading,
        error,
    };
};

export default useUsers;