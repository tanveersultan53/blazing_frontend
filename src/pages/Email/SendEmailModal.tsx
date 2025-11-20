import { useState } from 'react';
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
import { Mail, Users, UserCheck, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplateList | null;
  onSend: (recipientType: string, customEmails?: string[]) => Promise<void> | void;
}

export const SendEmailModal = ({
  isOpen,
  onClose,
  template,
  onSend,
}: SendEmailModalProps) => {
  const [recipientType, setRecipientType] = useState<'contacts' | 'partners' | 'all' | 'custom'>('contacts');
  const [isSending, setIsSending] = useState(false);
  const [customEmails, setCustomEmails] = useState('');
  const [includeAttachments, setIncludeAttachments] = useState(true);

  const handleSend = async () => {
    if (!template) {
      toast.error('No template selected');
      return;
    }

    // Validate custom emails if selected
    if (recipientType === 'custom') {
      const emails = customEmails.split(',').map(e => e.trim()).filter(e => e);
      if (emails.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
        return;
      }

      setIsSending(true);
      await onSend(recipientType, emails);
      setIsSending(false);
    } else {
      setIsSending(true);
      await onSend(recipientType);
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setRecipientType('contacts');
    setCustomEmails('');
    setIncludeAttachments(true);
    onClose();
  };

  const getRecipientCount = () => {
    // This would come from actual data in a real app
    switch (recipientType) {
      case 'contacts':
        return 'All contacts';
      case 'partners':
        return 'All partners';
      case 'all':
        return 'All contacts and partners';
      case 'custom':
        const count = customEmails.split(',').filter(e => e.trim()).length;
        return `${count} recipient${count !== 1 ? 's' : ''}`;
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
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

          {/* Recipient Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Recipients</Label>
            <RadioGroup value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
              <div className="space-y-3">
                {/* Contacts */}
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="contacts" id="contacts" />
                  <Label htmlFor="contacts" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Contacts</div>
                      <div className="text-xs text-muted-foreground">Send to all contacts in your database</div>
                    </div>
                  </Label>
                </div>

                {/* Partners */}
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="partners" id="partners" />
                  <Label htmlFor="partners" className="flex items-center gap-2 cursor-pointer flex-1">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">Partners</div>
                      <div className="text-xs text-muted-foreground">Send to all partners only</div>
                    </div>
                  </Label>
                </div>

                {/* All */}
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium">All</div>
                      <div className="text-xs text-muted-foreground">Send to all contacts and partners</div>
                    </div>
                  </Label>
                </div>

                {/* Custom Emails */}
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Mail className="w-4 h-4 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-medium">Custom Email Addresses</div>
                      <div className="text-xs text-muted-foreground mb-2">Enter specific email addresses</div>
                      {recipientType === 'custom' && (
                        <Input
                          placeholder="email1@example.com, email2@example.com"
                          value={customEmails}
                          onChange={(e) => setCustomEmails(e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

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
              <strong>Ready to send:</strong> {getRecipientCount()}
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
