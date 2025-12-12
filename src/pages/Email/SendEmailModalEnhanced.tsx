import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { EmailTemplateList } from './interface';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Users, UserCheck, Globe, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getContacts } from '@/services/contactService';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_type: string;
  send_status: string;
  optout: boolean;
}

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplateList | null;
  onSend: (recipientType: string, customEmails?: string[]) => Promise<void> | void;
}

export const SendEmailModalEnhanced = ({
  isOpen,
  onClose,
  template,
  onSend,
}: SendEmailModalProps) => {
  const [selectionMode, setSelectionMode] = useState<'all' | 'select'>('all');
  const [recipientType, setRecipientType] = useState<'contacts' | 'partners' | 'all'>('all');
  const [isSending, setIsSending] = useState(false);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    enabled: isOpen && selectionMode === 'select',
  });

  // Handle both paginated and non-paginated responses
  const contacts: Contact[] = contactsData?.data?.results || contactsData?.data || [];

  // Filter contacts based on recipient type and search
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
    // Filter out opted-out contacts and those marked as don't send
    // Use loose checking to handle undefined/null values
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

  const handleSend = async () => {
    if (!template) {
      toast.error('No template selected');
      return;
    }

    setIsSending(true);

    try {
      if (selectionMode === 'select') {
        // Send to selected contacts only
        if (selectedContacts.length === 0) {
          toast.error('Please select at least one contact');
          setIsSending(false);
          return;
        }

        const selectedEmails = contacts
          .filter(c => selectedContacts.includes(c.id))
          .map(c => c.email)
          .filter(email => email);

        await onSend('custom', selectedEmails);
      } else {
        // Send to all of selected type
        await onSend(recipientType);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectionMode('all');
    setRecipientType('all');
    setIncludeAttachments(true);
    setSelectedContacts([]);
    setSearchQuery('');
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send "{template?.name || template?.email_name}" to selected recipients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-sm mb-2">Template Details</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {template?.name || template?.email_name}</p>
              <p><strong>Subject:</strong> {template?.subject || template?.email_subject}</p>
              {template?.attachments && template.attachments.length > 0 && (
                <p><strong>Attachments:</strong> {template.attachments.length} file(s)</p>
              )}
            </div>
          </div>

          {/* Selection Mode */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">How would you like to send?</Label>
            <RadioGroup value={selectionMode} onValueChange={(value: any) => {
              setSelectionMode(value);
              setSelectedContacts([]);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="all" id="mode-all" />
                  <Label htmlFor="mode-all" className="cursor-pointer flex-1">
                    <div className="font-medium">Send to All</div>
                    <div className="text-xs text-muted-foreground">Send to all contacts/partners based on type</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="select" id="mode-select" />
                  <Label htmlFor="mode-select" className="cursor-pointer flex-1">
                    <div className="font-medium">Select Specific</div>
                    <div className="text-xs text-muted-foreground">Choose specific contacts from list</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Recipient Type Selection for "Send to All" mode */}
          {selectionMode === 'all' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Recipient Type</Label>
              {loadingContacts ? (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="animate-pulse">Loading contact counts...</div>
                </div>
              ) : (
                <RadioGroup value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="all" id="type-all" />
                      <Label htmlFor="type-all" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Globe className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-medium">All ({contactsByType.all.length})</div>
                          <div className="text-xs text-muted-foreground">Send to all contacts and partners</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="contacts" id="type-contacts" />
                      <Label htmlFor="type-contacts" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Contacts ({contactsByType.contacts.length})</div>
                          <div className="text-xs text-muted-foreground">Send to all contacts only</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
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
            </div>
          )}

          {/* Contact Selection List for "Select Specific" mode */}
          {selectionMode === 'select' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Select Contacts</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

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
                      <div className="border rounded-lg max-h-[300px] overflow-y-auto">
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
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Options</Label>
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
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border rounded-md p-3">
            <p className="text-sm">
              <strong>Ready to send to:</strong> {getRecipientCount()}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
