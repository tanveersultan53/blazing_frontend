import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Mail, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EmailTemplateList } from '@/pages/Email/interface';
import type { PersonData } from './useUserDashboard';

interface SendEmailToContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: PersonData[];
  templates: EmailTemplateList[];
  onSend: (templateId: number, contactEmails: string[]) => Promise<void>;
  isLoadingTemplates: boolean;
}

export const SendEmailToContactsModal = ({
  isOpen,
  onClose,
  selectedContacts,
  templates,
  onSend,
  isLoadingTemplates,
}: SendEmailToContactsModalProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select an email template');
      return;
    }

    // Extract valid email addresses from selected contacts
    const contactEmails = selectedContacts
      .map(contact => contact.email)
      .filter(email => email && email.trim() !== '');

    if (contactEmails.length === 0) {
      toast.error('No valid email addresses found in selected contacts');
      return;
    }

    setIsSending(true);
    try {
      await onSend(Number(selectedTemplateId), contactEmails);
      handleClose();
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplateId('');
    onClose();
  };

  const validContactsCount = selectedContacts.filter(
    contact => contact.email && contact.email.trim() !== ''
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email to Selected Contacts
          </DialogTitle>
          <DialogDescription>
            Select an email template to send to {selectedContacts.length} selected contact{selectedContacts.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selected Contacts Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Selected Recipients
            </h4>
            <div className="space-y-1 text-sm">
              <p><strong>Total Selected:</strong> {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}</p>
              <p><strong>Valid Emails:</strong> {validContactsCount} contact{validContactsCount !== 1 ? 's' : ''}</p>
              {validContactsCount !== selectedContacts.length && (
                <p className="text-orange-600">
                  <strong>Note:</strong> {selectedContacts.length - validContactsCount} contact{selectedContacts.length - validContactsCount !== 1 ? 's have' : ' has'} no email address
                </p>
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label htmlFor="template-select" className="text-base font-semibold">
              Select Email Template
            </Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={isLoadingTemplates}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Choose a template"} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id || template.email_id} value={String(template.id || template.email_id)}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name || template.email_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.subject || template.email_subject}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {templates.length === 0 && !isLoadingTemplates && (
                  <SelectItem value="no-templates" disabled>
                    No templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedTemplateId && (
              <p className="text-sm text-muted-foreground">
                Selected template will be sent to {validContactsCount} recipient{validContactsCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Contact List Preview */}
          {selectedContacts.length > 0 && selectedContacts.length <= 10 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recipients:</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {selectedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`text-xs p-1 rounded ${contact.email ? 'bg-gray-50' : 'bg-orange-50'}`}
                  >
                    <strong>{contact.first_name} {contact.last_name}</strong>
                    {contact.email ? (
                      <span className="text-muted-foreground"> - {contact.email}</span>
                    ) : (
                      <span className="text-orange-600"> - No email</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !selectedTemplateId || validContactsCount === 0 || isLoadingTemplates}
          >
            {isSending ? 'Sending...' : `Send Email to ${validContactsCount} Contact${validContactsCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
