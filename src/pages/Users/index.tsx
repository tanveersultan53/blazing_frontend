import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/PageHeader";
import useUsers from "./useUsers";
import Loading from "@/components/Loading";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import { UserPlus } from "lucide-react";
import { FileDown } from "lucide-react";
import { Trash2 } from "lucide-react";
import type { IUserList } from "./interface";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";

const Users = () => {
    const { columns, data, isLoading } = useUsers();
    const navigate = useNavigate();
    const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);


    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Users' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    const handleCreateUser = () => {
        navigate('/users/create');
    };

    if (!currentUser?.is_superuser) {
        navigate('/user-dashboard?tab=contact');
        return <></>;
    }

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
                    onViewDetails={(row: IUserList) => navigate(`/users/${row.rep_id}`)}
                    actionItems={[
                        {
                            label: "Delete user",
                            icon: Trash2,
                            className: "text-red-600",
                            onClick: (row: IUserList) => console.log("Delete", row.rep_id),
                        },
                    ]}
                />
            </PageHeader>
        </>);
};

export default Users;
