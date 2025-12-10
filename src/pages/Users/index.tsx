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
import { SendEmailToContactsModal } from "@/pages/UserDashboard/SendEmailToContactsModal";
import type { PersonData } from "@/pages/UserDashboard/useUserDashboard";

const Users = () => {
  const {
    columns,
    data,
    isLoading,
    isFetching,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    globalSearch,
    updateGlobalSearch,
    isEmailModalOpen,
    selectedUsers,
    templates,
    isLoadingTemplates,
    openEmailModal,
    closeEmailModal,
    handleSendEmail,
  } = useUsers();
  const navigate = useNavigate();
  const currentUser = useSelector(
    (state: { user: { currentUser: User } }) => state.user.currentUser
  );

  // Handle bulk delete
  const handleDeleteSelected = (selectedRows: IUserList[]) => {
    console.log("Delete selected users:", selectedRows);
    // TODO: Implement bulk delete logic
  };

  // Handle bulk send email - Map IUserList to PersonData format
  const handleSendEmailSelected = (selectedRows: IUserList[]) => {
    openEmailModal(selectedRows);
  };

  // Map IUserList to PersonData format for the modal
  const mappedSelectedUsers: PersonData[] = selectedUsers.map(user => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    title: user.title || '',
    company: user.company || '',
    customer_type: '',
    send_status: '',
    newsletter_version: '',
    status: user.is_active ? 'Active' : 'Inactive',
    optout: false,
    created: '',
    modified: '',
    cell: user.cellphone || '',
    work_phone: user.work_phone || '',
    work_ext: user.work_ext || '',
  }));

  // Memoize breadcrumbs to prevent infinite loops
  const breadcrumbs = useMemo(() => [{ label: "Users" }], []);

  useBreadcrumbs(breadcrumbs);

  const handleCreateUser = () => {
    navigate("/users/create");
  };

  // Column titles mapping for filter placeholders
  const columnTitles = {
    name: "Name",
    email: "Email",
    company: "Company",
    title: "Title",
    work_phone: "Work Phone",
    cellphone: "Cell Phone",
    location: "Location",
    status: "Status",
    role: "Role",
  };

  if (!currentUser?.is_superuser) {
    navigate("/user-dashboard?tab=contact");
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
          searchColumns={[
            "name",
            "email",
            "company",
            "title",
            "location",
            "status",
            "role",
          ]}
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
          filters={filters as Record<string, string | undefined>}
          onFilterChange={(key: string, value: string) =>
            updateFilter(key as keyof typeof filters, value)
          }
          onClearFilter={(key: string) =>
            clearFilter(key as keyof typeof filters)
          }
          onClearAllFilters={clearAllFilters}
          columnTitles={columnTitles}
          isFetching={isFetching}
          isLoading={isLoading}
          globalSearch={globalSearch}
          onGlobalSearchChange={updateGlobalSearch}
          enableRowSelection={true}
          onDeleteSelected={handleDeleteSelected}
          onSendEmailSelected={handleSendEmailSelected}
        />
      </PageHeader>

      <SendEmailToContactsModal
        isOpen={isEmailModalOpen}
        onClose={closeEmailModal}
        selectedContacts={mappedSelectedUsers}
        templates={templates}
        onSend={handleSendEmail}
        isLoadingTemplates={isLoadingTemplates}
      />
    </>
  );
};

export default Users;
