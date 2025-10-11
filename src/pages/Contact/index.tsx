import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactDetails, updateContact } from "@/services/contactService";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, User, Users, FileText, Save, X, Mail, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Loading from "@/components/Loading";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useBreadcrumbs } from "@/hooks/usePageTitle";
import PageHeader from "@/components/PageHeader";

// Choice constants matching the backend
const CUSTOMER_TYPE_CHOICES = [
    { value: 'contact', label: 'Contact' },
    { value: 'partner', label: 'Partner' },
    { value: 'both', label: 'Both' },
];

const SEND_CHOICES = [
    { value: 'send', label: 'Send' },
    { value: 'dont_send', label: "Don't Send" },
];

const NEWSLETTER_VERSION_CHOICES = [
    { value: 'long', label: 'Long' },
    { value: 'short', label: 'Short' },
    { value: 'none', label: 'None' },
];

const LOAN_STATUS_CHOICES = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Denied', label: 'Denied' },
];

const LOAN_TYPE_CHOICES = [
    { value: 'Purchase', label: 'Purchase' },
    { value: 'Refinance', label: 'Refinance' },
    { value: 'HELOC', label: 'HELOC' },
    { value: 'Reverse', label: 'Reverse' },
];

const PROPERTY_TYPE_CHOICES = [
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Construction', label: 'Construction' },
];

const BOOLEAN_CHOICES = [
    { value: 'true', label: 'True' },
    { value: 'false', label: 'False' },
];

const Contact = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['contactDetails', id],
        queryFn: () => getContactDetails(id as string | number),
    });

    const contact = data?.data;

    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Dashboard', path: '/user-dashboard' },
        { label: contact ? `${contact.first_name} ${contact.last_name}` : 'Contact Details' }
    ], [contact]);

    useBreadcrumbs(breadcrumbs);

    const updateContactMutation = useMutation({
        mutationFn: ({ field, value }: { field: string; value: string }) => {
            const updateData: any = {};
            
            // Handle boolean fields
            if (field === 'optout') {
                updateData[field] = value === 'true';
            }
            // Handle number fields
            else if (['age', 'interest_rate', 'sales_price', 'loan_amount', 'percent_down', 'ltv'].includes(field)) {
                updateData[field] = value ? parseFloat(value) : null;
            }
            // Handle all other fields as strings
            else {
                updateData[field] = value;
            }
            
            return updateContact(id as string | number, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactDetails', id] });
            toast.success('Contact updated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to update contact');
            console.error('Update error:', error);
        },
    });

    const handleEditField = (fieldName: string, currentValue: string | boolean) => {
        setEditingField(fieldName);
        
        // Handle boolean fields
        if (fieldName === 'optout') {
            if (currentValue === 'true' || currentValue === true) {
                setEditValue('true');
            } else if (currentValue === 'false' || currentValue === false) {
                setEditValue('false');
            } else {
                setEditValue('false'); // default to false
            }
        } else {
            setEditValue(String(currentValue) || '');
        }
    };

    const handleSaveField = () => {
        if (editingField && editValue !== undefined) {
            updateContactMutation.mutate({
                field: editingField,
                value: editValue
            });
            setEditingField(null);
            setEditValue('');
            
            // If customer_type is being changed, navigate to dashboard with filter
            if (editingField === 'customer_type') {
                // Map customer_type values to tab values
                let tabValue = 'all';
                if (editValue === 'contact') {
                    tabValue = 'contact';
                } else if (editValue === 'partner') {
                    tabValue = 'referal_partner';
                }
                navigate(`/user-dashboard?tab=${tabValue}`);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const renderEditableField = (fieldName: string, value: string, label: string, type: string = 'text') => {
        if (editingField === fieldName) {
            return (
                <div className="flex items-center gap-2">
                    <Input
                        type={type}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                        autoFocus
                        disabled={updateContactMutation.isPending}
                    />
                    <Button 
                        size="sm" 
                        onClick={handleSaveField}
                        disabled={updateContactMutation.isPending}
                    >
                        <Save className="w-3 h-3" />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={updateContactMutation.isPending}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            );
        }

        return (
            <div 
                className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                onClick={() => handleEditField(fieldName, value)}
            >
                <label className="text-sm font-medium text-gray-500">{label}</label>
                <p className="text-sm">{value || 'Not specified'}</p>
            </div>
        );
    };

    const renderDropdownField = (fieldName: string, value: string | boolean, label: string, choices: { value: string; label: string }[]) => {
        if (editingField === fieldName) {
            return (
                <div className="flex items-center gap-2">
                    <Select
                        value={editValue}
                        onValueChange={setEditValue}
                        disabled={updateContactMutation.isPending}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {choices.map((choice) => (
                                <SelectItem key={choice.value} value={choice.value}>
                                    {choice.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        size="sm" 
                        onClick={handleSaveField}
                        disabled={updateContactMutation.isPending}
                    >
                        <Save className="w-3 h-3" />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={updateContactMutation.isPending}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            );
        }

        const selectedChoice = choices.find(choice => choice.value === value);
        let displayValue = selectedChoice ? selectedChoice.label : value || 'Not specified';
        
        // Special handling for boolean fields
        if (fieldName === 'optout') {
            if (value === 'true' || value === true) displayValue = 'True';
            else if (value === 'false' || value === false) displayValue = 'False';
        }

        return (
            <div 
                className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                onClick={() => handleEditField(fieldName, value)}
            >
                <label className="text-sm font-medium text-gray-500">{label}</label>
                <p className="text-sm">{displayValue}</p>
            </div>
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error || !contact) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Contact Not Found</h1>
                    <p className="text-gray-600 mb-4">The contact you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => navigate('/user-dashboard')} variant="outline">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <PageHeader
            title={`${contact.first_name} ${contact.last_name}`}
            description={`Contact details for ${contact.first_name} ${contact.last_name}`}
            actions={[]}
        >
            <div className="space-y-4 mb-10">
                {/* Primary Contact Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderEditableField('first_name', contact.first_name, 'First Name')}
                            {renderEditableField('last_name', contact.last_name, 'Last Name')}
                            {renderEditableField('email', contact.email, 'Email', 'email')}
                            {renderEditableField('title', contact.title, 'Title')}
                            {renderEditableField('birthday', contact.birthday, 'Birthday', 'date')}
                            {renderEditableField('age', contact.age?.toString(), 'Age', 'number')}
                            {renderEditableField('status', contact.status, 'Status')}
                            {renderEditableField('cell', contact.cell, 'Cell Phone', 'tel')}
                            {renderEditableField('work_phone', contact.work_phone, 'Work Phone', 'tel')}
                            {renderEditableField('address', contact.address, 'Address')}
                            {renderEditableField('city', contact.city, 'City')}
                            {renderEditableField('state', contact.state, 'State')}
                            {renderEditableField('zip_code', contact.zip_code, 'Zip Code')}
                            {renderEditableField('company', contact.company, 'Company')}
                            {renderDropdownField('customer_type', contact.customer_type, 'Customer Type', CUSTOMER_TYPE_CHOICES)}
                            {renderEditableField('group', contact.group, 'Group')}
                            {renderDropdownField('send_status', contact.send_status, 'Send Status', SEND_CHOICES)}
                            {renderDropdownField('newsletter_version', contact.newsletter_version, 'Newsletter', NEWSLETTER_VERSION_CHOICES)}
                            {renderDropdownField('optout', contact.optout, 'Opt-out Status', BOOLEAN_CHOICES)}
                        </div>
                    </CardContent>
                </Card>

                {/* Secondary Contact Information Card - Only show for contacts, not partners */}
                {contact.customer_type !== 'partner' && (contact.secondary_first_name || contact.secondary_email) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Secondary Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {contact.secondary_first_name && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Secondary Name</label>
                                        <p>{contact.secondary_first_name} {contact.secondary_last_name}</p>
                                    </div>
                                )}
                                {contact.secondary_email && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Secondary Email</label>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            <a href={`mailto:${contact.secondary_email}`} className="text-blue-600 hover:underline">
                                                {contact.secondary_email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {contact.secondary_birthday && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Secondary Birthday</label>
                                        <div className="flex items-center">
                                            <Gift className="w-4 h-4 mr-2 text-gray-400" />
                                            <p>{new Date(contact.secondary_birthday).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}
                                {contact.secondary_age && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Secondary Age</label>
                                        <p>{contact.secondary_age} years old</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loan Information Card - Only show for contacts, not partners */}
                {contact.customer_type !== 'partner' && contact.loan_status && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Loan Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {renderDropdownField('loan_status', contact.loan_status, 'Loan Status', LOAN_STATUS_CHOICES)}
                                {renderEditableField('interest_rate', contact.interest_rate, 'Interest Rate', 'number')}
                                {renderEditableField('sales_price', contact.sales_price, 'Sales Price', 'number')}
                                {renderEditableField('loan_amount', contact.loan_amount, 'Loan Amount', 'number')}
                                {renderEditableField('percent_down', contact.percent_down, 'Percent Down', 'number')}
                                {renderEditableField('ltv', contact.ltv, 'LTV', 'number')}
                                {renderEditableField('close_date', contact.close_date, 'Close Date', 'date')}
                                {renderEditableField('loan_program', contact.loan_program, 'Loan Program')}
                                {renderDropdownField('loan_type', contact.loan_type, 'Loan Type', LOAN_TYPE_CHOICES)}
                                {renderDropdownField('property_type', contact.property_type, 'Property Type', PROPERTY_TYPE_CHOICES)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes and System Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Notes & System Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Notes Section */}
                            <div>
                                <h4 className="font-medium text-sm text-gray-700 border-b pb-2 mb-4">Notes</h4>
                                {renderEditableField('note', contact.note, 'Notes')}
                            </div>

                            <Separator />

                            {/* System Information Section */}
                            <div>
                                <h4 className="font-medium text-sm text-gray-700 border-b pb-2 mb-4">System Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Created</label>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            <p>{new Date(contact.created).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Modified</label>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            <p>{new Date(contact.modified).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageHeader>
    );
};

export default Contact;
