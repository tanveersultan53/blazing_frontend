import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/PageHeader";
import useUsers from "./useUsers";
import Loading from "@/components/Loading";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import { UserPlus } from "lucide-react";
import { FileDown } from "lucide-react";
import { Edit, Trash2 } from "lucide-react";
import type { IUserList } from "./interface";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const Users = () => {
    const { columns, data, isLoading } = useUsers();
    const navigate = useNavigate();
    
    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Users' }
    ], []);
    
    useBreadcrumbs(breadcrumbs);

    const handleCreateUser = () => {
        navigate('/users/create');
    };

    return isLoading ? (
        <Loading />
    ) : (
        <>
            <PageHeader
                title="User Management"
                description="Manage your application users, their roles, permissions, and account settings."
                actions={[
                    {
                        label: "Create User",
                        onClick: handleCreateUser,
                        variant: "default",
                        icon: UserPlus,
                    },
                    {
                        label: "Export Users",
                        onClick: () => console.log("Export clicked"),
                        variant: "outline",
                        icon: FileDown,
                    },
                ]}
            >
                <DataTable
                    columns={columns}
                    data={data}
                    searchColumns={["name", "email", "company", "title", "location", "status", "role"]}
                    showActionsColumn
                    onViewDetails={(row: IUserList) => console.log("View Details", row.id)}
                    actionItems={[
                        {
                            label: "Edit user",
                            icon: Edit,
                            onClick: (row: IUserList) => console.log("Edit", row.id),
                        },
                        {
                            label: "Delete user",
                            icon: Trash2,
                            className: "text-red-600",
                            onClick: (row: IUserList) => console.log("Delete", row.id),
                        },
                    ]}
                />
            </PageHeader>
        </>);
};

export default Users;
