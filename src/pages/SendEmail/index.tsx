import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Users, UserCheck, Globe, Search, User, ArrowLeft, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getContacts } from '@/services/contactService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomerEmailTemplate, getCustomerEmailTemplates, sendEmail } from '@/services/emailService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_type: string;
  send_status: string;
  optout: boolean;
}

export default function SendEmailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [selectionMode, setSelectionMode] = useState<'all' | 'select'>('all');
  const [recipientType, setRecipientType] = useState<'contacts' | 'partners' | 'all'>('all');
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templateId || '');

  // Fetch all customer templates
  const { data: templatesData, isLoading: loadingTemplates } = useQuery({
    queryKey: ['customer-email-templates'],
    queryFn: () => getCustomerEmailTemplates({ is_active: true }),
  });

  const templates = Array.isArray(templatesData?.data)
    ? templatesData.data
    : (templatesData?.data?.results || []);

  // Fetch selected template details
  const { data: templateData, isLoading: loadingTemplate, error: templateError } = useQuery({
    queryKey: ['email-template', selectedTemplateId],
    queryFn: () => getCustomerEmailTemplate(Number(selectedTemplateId)),
    enabled: !!selectedTemplateId,
  });

  const template = templateData?.data;

  // Fetch contacts only when in "Select Specific" mode
  const { data: contactsData, isLoading: loadingContacts, error: contactsError } = useQuery({
    queryKey: ['contacts-for-email', selectionMode, recipientType],
    queryFn: () => {
      // Map recipientType to customer_type for API
      let customerType = undefined;
      if (selectionMode === 'select') {
        if (recipientType === 'contacts') {
          customerType = 'contact';
        } else if (recipientType === 'partners') {
          customerType = 'partner';
        }
        // For 'all', don't pass customer_type filter
      }

      return getContacts({
        customer_type: customerType,
      });
    },
    enabled: selectionMode === 'select',
  });

  // Handle both paginated and non-paginated responses
  const contacts: Contact[] = contactsData?.data?.results || contactsData?.data || [];

  // Filter contacts based on recipient type and search
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Filter out opted-out contacts and those marked as don't send
      if (contact.optout === true) return false;
      if (contact.send_status === 'dont_send') return false;

      // Filter by search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        contact.first_name?.toLowerCase().includes(searchLower) ||
        contact.last_name?.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filter by recipient type - only when in "Send to All" mode
      if (selectionMode === 'all') {
        if (recipientType === 'contacts') {
          return contact.customer_type === 'contact' || contact.customer_type === 'both';
        } else if (recipientType === 'partners') {
          return contact.customer_type === 'partner' || contact.customer_type === 'both';
        }
      }

      // For "Select Specific" mode or "all" type, show everyone
      return true;
    });
  }, [contacts, selectionMode, recipientType, searchQuery]);

  // Get contacts by type for tabs
  const contactsByType = useMemo(() => ({
    all: filteredContacts,
    contacts: filteredContacts.filter(c => c.customer_type === 'contact' || c.customer_type === 'both'),
    partners: filteredContacts.filter(c => c.customer_type === 'partner' || c.customer_type === 'both'),
  }), [filteredContacts]);

  useEffect(() => {
    if (contactsError) {
      console.error('Error loading contacts:', contactsError);
      toast.error('Failed to load contacts');
    }
  }, [contactsError]);

  useEffect(() => {
    if (templateError) {
      console.error('Error loading template:', templateError);
      toast.error('Failed to load email template');
      navigate('/my-email-templates');
    }
  }, [templateError, navigate]);

  const handleSelectAll = (type: 'all' | 'contacts' | 'partners') => {
    const contactIds = contactsByType[type].map(c => c.id);
    setSelectedContacts(contactIds);
  };

  const handleDeselectAll = () => {
    setSelectedContacts([]);
  };

  const handleToggleContact = (contactId: number) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: { template_id: number; recipient_type: 'contacts' | 'partners' | 'all' | 'custom'; custom_emails?: string[]; include_attachments?: boolean }) =>
      sendEmail(data),
    onSuccess: (response) => {
      const message = response?.data?.message || 'Email sent successfully';
      const count = response?.data?.recipients_count || 0;
      toast.success(`${message} (${count} recipient${count !== 1 ? 's' : ''})`);
      navigate('/my-email-templates');
    },
    onError: (error: any) => {
      console.error('Send email error:', error);
      toast.error(error.response?.data?.error || 'Failed to send email');
    },
  });

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template');
      return;
    }

    if (!template) {
      toast.error('Template not loaded');
      return;
    }

    try {
      if (selectionMode === 'select') {
        // Send to selected contacts only
        if (selectedContacts.length === 0) {
          toast.error('Please select at least one contact');
          return;
        }

        const selectedEmails = contacts
          .filter(c => selectedContacts.includes(c.id))
          .map(c => c.email)
          .filter(email => email);

        await sendEmailMutation.mutateAsync({
          template_id: Number(selectedTemplateId),
          recipient_type: 'custom',
          custom_emails: selectedEmails,
          include_attachments: includeAttachments,
        });
      } else {
        // Send to all of selected type
        await sendEmailMutation.mutateAsync({
          template_id: Number(selectedTemplateId),
          recipient_type: recipientType,
          include_attachments: includeAttachments,
        });
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getRecipientCount = () => {
    if (selectionMode === 'select') {
      return `${selectedContacts.length} selected contact${selectedContacts.length !== 1 ? 's' : ''}`;
    }

    switch (recipientType) {
      case 'contacts':
        return `${contactsByType.contacts.length} contact${contactsByType.contacts.length !== 1 ? 's' : ''}`;
      case 'partners':
        return `${contactsByType.partners.length} partner${contactsByType.partners.length !== 1 ? 's' : ''}`;
      case 'all':
        return `${contactsByType.all.length} contact${contactsByType.all.length !== 1 ? 's' : ''} and partner${contactsByType.all.length !== 1 ? 's' : ''}`;
      default:
        return '';
    }
  };

  if (loadingTemplate) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading template...</div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 font-semibold mb-2">Template not found</p>
            <Button onClick={() => navigate('/my-email-templates')}>Back to My Templates</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/my-email-templates">My Email Templates</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Send Email</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/my-email-templates')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="w-8 h-8" />
              Send Email
            </h1>
            <p className="text-muted-foreground mt-1">
              Select a template and configure your email recipients
            </p>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={sendEmailMutation.isPending}
          size="lg"
        >
          <Send className="w-4 h-4 mr-2" />
          {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Select Email Template</CardTitle>
              <CardDescription>Choose the email template you want to send</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="template-select">Email Template</Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingTemplates ? (
                      <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                    ) : templates.length === 0 ? (
                      <SelectItem value="empty" disabled>No templates available</SelectItem>
                    ) : (
                      templates.map((tmpl: any) => (
                        <SelectItem key={tmpl.email_id} value={String(tmpl.email_id)}>
                          {tmpl.email_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {template && (
                  <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium">{template.email_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Subject: {template.email_subject}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selection Mode Card */}
          <Card>
            <CardHeader>
              <CardTitle>How would you like to send?</CardTitle>
              <CardDescription>Choose between sending to all recipients or selecting specific contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectionMode} onValueChange={(value: any) => {
                setSelectionMode(value);
                setSelectedContacts([]);
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="all" id="mode-all" />
                    <Label htmlFor="mode-all" className="cursor-pointer flex-1">
                      <div className="font-medium">Send to All</div>
                      <div className="text-xs text-muted-foreground">Send to all contacts/partners based on type</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="select" id="mode-select" />
                    <Label htmlFor="mode-select" className="cursor-pointer flex-1">
                      <div className="font-medium">Select Specific</div>
                      <div className="text-xs text-muted-foreground">Choose specific contacts from list</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Recipient Type Selection for "Send to All" mode */}
          {selectionMode === 'all' && (
            <Card>
              <CardHeader>
                <CardTitle>Recipient Type</CardTitle>
                <CardDescription>Select which type of recipients to send to</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingContacts ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <div className="animate-pulse">Loading contact counts...</div>
                  </div>
                ) : (
                  <RadioGroup value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                    <div className="grid gap-3">
                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="all" id="type-all" />
                        <Label htmlFor="type-all" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Globe className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className="font-medium">All ({contactsByType.all.length})</div>
                            <div className="text-xs text-muted-foreground">Send to all contacts and partners</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="contacts" id="type-contacts" />
                        <Label htmlFor="type-contacts" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">Contacts ({contactsByType.contacts.length})</div>
                            <div className="text-xs text-muted-foreground">Send to all contacts only</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="partners" id="type-partners" />
                        <Label htmlFor="type-partners" className="flex items-center gap-2 cursor-pointer flex-1">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="font-medium">Partners ({contactsByType.partners.length})</div>
                            <div className="text-xs text-muted-foreground">Send to all partners only</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Selection List for "Select Specific" mode */}
          {selectionMode === 'select' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Select Contacts</CardTitle>
                    <CardDescription>Choose specific contacts to send the email to</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search contacts by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tabs for contact types */}
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all" onClick={() => setRecipientType('all')}>
                      All ({contactsByType.all.length})
                    </TabsTrigger>
                    <TabsTrigger value="contacts" onClick={() => setRecipientType('contacts')}>
                      Contacts ({contactsByType.contacts.length})
                    </TabsTrigger>
                    <TabsTrigger value="partners" onClick={() => setRecipientType('partners')}>
                      Partners ({contactsByType.partners.length})
                    </TabsTrigger>
                  </TabsList>

                  {(['all', 'contacts', 'partners'] as const).map((type) => (
                    <TabsContent key={type} value={type} className="space-y-2">
                      <div className="flex justify-end mb-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSelectAll(type)}
                        >
                          Select All {type === 'all' ? '' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      </div>

                      {loadingContacts ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="animate-pulse">Loading contacts...</div>
                        </div>
                      ) : contactsError ? (
                        <div className="text-center py-8 text-red-500">
                          <p>Failed to load contacts</p>
                          <p className="text-sm mt-2">Please try again or contact support</p>
                        </div>
                      ) : contacts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="font-medium">No contacts found in your account</p>
                          <p className="text-sm mt-2">Add contacts first before sending emails</p>
                        </div>
                      ) : contactsByType[type].length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No {type === 'all' ? 'contacts' : type} found</p>
                          {searchQuery && <p className="text-sm mt-2">Try adjusting your search</p>}
                        </div>
                      ) : (
                        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                          {contactsByType[type].map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                              onClick={() => handleToggleContact(contact.id)}
                            >
                              <Checkbox
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={() => handleToggleContact(contact.id)}
                              />
                              <User className="w-4 h-4 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {contact.first_name} {contact.last_name}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {contact.email}
                                </div>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {contact.customer_type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{template?.email_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Subject</p>
                <p className="font-medium">{template?.email_subject}</p>
              </div>
              {template?.attachments && template.attachments.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Attachments</p>
                  <p className="font-medium">{template.attachments.length} file(s)</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-attachments"
                  checked={includeAttachments}
                  onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
                  disabled={!template?.attachments || template.attachments.length === 0}
                />
                <Label
                  htmlFor="include-attachments"
                  className="text-sm font-normal cursor-pointer"
                >
                  Include attachments ({template?.attachments?.length || 0} file(s))
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Ready to Send</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <strong>Recipients:</strong> {getRecipientCount()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
