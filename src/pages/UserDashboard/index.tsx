import { useMemo } from "react";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";
import { FileDown, UserPlus, Mail, FileText, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/data-table";
import { useUserDashboard } from "./useUserDashboard";
import { SendEmailToContactsModal } from "./SendEmailToContactsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCustomerEmailTemplates } from "@/services/emailService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserDashboard = () => {
    const navigate = useNavigate();

    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Dashboard' }
    ], []);

    useBreadcrumbs(breadcrumbs);

    // Fetch user's email templates
    const { data: templatesData } = useQuery({
        queryKey: ['customer-email-templates'],
        queryFn: () => getCustomerEmailTemplates({}),
    });

    const userTemplates = templatesData?.data?.results || [];
    const activeTemplates = userTemplates.filter(t => t.is_active);


    // Use the dashboard hook
    const {
        data,
        columns,
        actionItems,
        handleViewDetails,
        activeTab,
        setActiveTab,
        isLoading,
        isFetching,
        deleteDialogOpen,
        contactToDelete,
        handleConfirmDelete,
        handleCancelDelete,
        isDeleting,
        filters,
        updateFilter,
        clearFilter,
        clearAllFilters,
        globalSearch,
        updateGlobalSearch,
        handleDeleteSelected,
        handleSendEmailSelected,
        sendEmailModalOpen,
        selectedContactsForEmail,
        handleSendEmail,
        closeSendEmailModal,
        emailTemplates,
        isLoadingTemplates,
    } = useUserDashboard();

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'contact' | 'referal_partner' | 'all');
        navigate(`/user-dashboard?tab=${value}`);
    };

    const getButtonName = () => {
        if (activeTab === 'contact') {
            return 'Add Contact';
        } else if (activeTab === 'referal_partner') {
            return 'Add Referal Partner';
        }
        return '';
    }

    // Column titles mapping for filter placeholders
    const columnTitles = {
        'name': 'Name',
        'email': 'Email',
        'cell': 'Cell Phone',
        'work_phone': 'Work Phone',
        'company': 'Company',
        'title': 'Title',
        'send_status': 'Status',
        'created': 'Created Date',
        'modified': 'Modified Date',
    };

    return <PageHeader
        title="Dashboard"
        description="Manage your contacts and browse email templates from the library"
        actions={[
            ...(getButtonName() ? [{
                label: getButtonName() as string,
                onClick: () => navigate('/add-person?type=' + activeTab),
                variant: "default" as const,
                icon: UserPlus,
            }] : []),
            {
                label: "Export Users",
                onClick: () => console.log("Export clicked"),
                variant: "outline" as const,
                icon: FileDown,
            },
        ]}
    >
        <div className="flex w-full flex-col gap-6">
            {/* Email Templates Section */}
           

            {/* Contacts Section */}
            <Card>
                <CardHeader>
                    <CardTitle>My Contacts</CardTitle>
                    <CardDescription>Manage your contacts and referral partners</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="px-6 pt-6">
                        <TabsList>
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="referal_partner">Referal Partner</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="px-6 pb-6">
                        <DataTable
                            columns={columns}
                            data={data}
                            searchColumns={[ 'name', 'email', 'company', 'title', 'cell', 'work_phone']}
                            showActionsColumn={true}
                            onViewDetails={handleViewDetails}
                            actionItems={actionItems}
                            filters={filters as Record<string, string | undefined>}
                            onFilterChange={(key: string, value: string) => updateFilter(key as keyof typeof filters, value)}
                            onClearFilter={(key: string) => clearFilter(key as keyof typeof filters)}
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
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
            if (!open) {
                handleCancelDelete();
            }
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the contact{" "}
                        <strong>
                            {contactToDelete ? `${contactToDelete.first_name} ${contactToDelete.last_name}` : ''}
                        </strong>{" "}
                        from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Send Email Modal */}
        <SendEmailToContactsModal
            isOpen={sendEmailModalOpen}
            onClose={closeSendEmailModal}
            selectedContacts={selectedContactsForEmail}
            templates={emailTemplates}
            onSend={handleSendEmail}
            isLoadingTemplates={isLoadingTemplates}
        />

    </PageHeader>;
};

export default UserDashboard;