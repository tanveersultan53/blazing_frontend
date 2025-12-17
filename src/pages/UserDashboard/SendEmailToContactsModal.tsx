import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, Users, Paperclip, X, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PersonData } from "./useUserDashboard";

interface SendEmailToContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: PersonData[];
  templates: any[];
  onSend: (
    templateId: number,
    contactEmails: string[],
    emailName: string,
    emailSubject: string,
    attachments: File[]
  ) => Promise<void>;
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [emailName, setEmailName] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewRecipient, setPreviewRecipient] = useState<PersonData | null>(
    null
  );

  // Update email name and subject when template is selected
  useEffect(() => {
    if (selectedTemplateId) {
      const selectedTemplate = templates.find(
        (t) => String(t.id || t.email_id) === selectedTemplateId
      );
      if (selectedTemplate) {
        setEmailName(
          selectedTemplate.name || selectedTemplate.email_name || ""
        );
        setEmailSubject(
          selectedTemplate.subject || selectedTemplate.email_subject || ""
        );
      }
    } else {
      setEmailName("");
      setEmailSubject("");
    }
  }, [selectedTemplateId, templates]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // Limit file size to 10MB per file
      const validFiles = fileArray.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
          return false;
        }
        return true;
      });
      setAttachments((prev) => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreviewClick = (contact: PersonData) => {
    setPreviewRecipient(contact);
    setIsPreviewOpen(true);
  };


  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select an email template");
      return;
    }

    if (!emailName.trim()) {
      toast.error("Please enter an email name");
      return;
    }

    if (!emailSubject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    // Extract valid email addresses from selected contacts
    const contactEmails = selectedContacts
      .map((contact) => contact.email)
      .filter((email) => email && email.trim() !== "");

    if (contactEmails.length === 0) {
      toast.error("No valid email addresses found in selected contacts");
      return;
    }

    setIsSending(true);
    try {
      await onSend(
        Number(selectedTemplateId),
        contactEmails,
        emailName,
        emailSubject,
        attachments
      );
      handleClose();
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplateId("");
    setEmailName("");
    setEmailSubject("");
    setAttachments([]);
    onClose();
  };

  const validContactsCount = selectedContacts.filter(
    (contact) => contact.email && contact.email.trim() !== ""
  ).length;

  const selectedTemplate = templates.find(
    (t) => String(t.id || t.email_id) === selectedTemplateId
  );

  // Replace placeholders in HTML content with recipient information
  const getPersonalizedHtmlContent = () => {
    const htmlContent = selectedTemplate?.html_content || '';

    if (!htmlContent || !previewRecipient) {
      return htmlContent;
    }

    const recipientName = `${previewRecipient.first_name} ${previewRecipient.last_name}`;
    const recipientEmail = previewRecipient.email || '';

    return htmlContent
      .replace(/\*title1\*/g, recipientName)
      .replace(/\*email1\*/g, recipientEmail);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email to Selected Contacts
          </DialogTitle>
          <DialogDescription>
            Select an email template to send to {selectedContacts.length}{" "}
            selected contact{selectedContacts.length !== 1 ? "s" : ""}
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
              <p>
                <strong>Total Selected:</strong> {selectedContacts.length}{" "}
                contact{selectedContacts.length !== 1 ? "s" : ""}
              </p>
              <p>
                <strong>Valid Emails:</strong> {validContactsCount} contact
                {validContactsCount !== 1 ? "s" : ""}
              </p>
              {validContactsCount !== selectedContacts.length && (
                <p className="text-orange-600">
                  <strong>Note:</strong>{" "}
                  {selectedContacts.length - validContactsCount} contact
                  {selectedContacts.length - validContactsCount !== 1
                    ? "s have"
                    : " has"}{" "}
                  no email address
                </p>
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="template-select"
              className="text-base font-semibold"
            >
              Select Email Template
            </Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={isLoadingTemplates}
            >
              <SelectTrigger id="template-select" className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingTemplates
                      ? "Loading templates..."
                      : "Choose a template"
                  }
                >
                  {selectedTemplateId && selectedTemplate ? (
                    <span className="font-medium">
                      {selectedTemplate.name || selectedTemplate.email_name}
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem
                    key={template.id || template.email_id}
                    value={String(template.id || template.email_id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {template.name || template.email_name}
                      </span>
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
                Selected template will be sent to {validContactsCount} recipient
                {validContactsCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Email Name and Subject Fields in One Row */}
          {selectedTemplateId && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-name" className="text-base font-semibold">
                  Email Name
                </Label>
                <Input
                  id="email-name"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                  placeholder="Enter email name"
                  disabled={isSending}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email-subject"
                  className="text-base font-semibold"
                >
                  Email Subject
                </Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  disabled={isSending}
                />
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {selectedTemplateId && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Attachments (Optional)
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isSending}
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    disabled={isSending}
                    className="w-full"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Add Attachments
                  </Button>
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-1">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 border rounded-md p-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          disabled={isSending}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 10MB per file
                </p>
              </div>
            </div>
          )}

          {/* Contact List Preview */}
          {selectedContacts.length > 0 && selectedContacts.length <= 10 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recipients:</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {selectedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`text-xs p-2 rounded flex items-center justify-between ${
                      contact.email ? "bg-gray-50" : "bg-orange-50"
                    }`}
                  >
                    <div className="flex-1">
                      <strong>
                        {contact.first_name} {contact.last_name}
                      </strong>
                      {contact.email ? (
                        <span className="text-muted-foreground">
                          {" "}
                          - {contact.email}
                        </span>
                      ) : (
                        <span className="text-orange-600"> - No email</span>
                      )}
                    </div>
                    {contact.email && selectedTemplateId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewClick(contact)}
                        className="h-6 w-6 p-0 ml-2 hover:bg-blue-100"
                        title="Preview email"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              isSending ||
              !selectedTemplateId ||
              validContactsCount === 0 ||
              isLoadingTemplates
            }
          >
            {isSending
              ? "Sending..."
              : `Send Email to ${validContactsCount} Contact${
                  validContactsCount !== 1 ? "s" : ""
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Email Preview
            </DialogTitle>
            {previewRecipient && (
              <DialogDescription>
                Preview for:{" "}
                <strong>
                  {previewRecipient.first_name} {previewRecipient.last_name}
                </strong>{" "}
                ({previewRecipient.email})
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Template Content Preview */}
            {(selectedTemplate && (selectedTemplate.html_content || selectedTemplate.html_file)) ? (
              <div className="border rounded-md p-4 bg-white h-full overflow-y-auto">
                {selectedTemplate?.html_content ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getPersonalizedHtmlContent(),
                    }}
                  />
                ) : selectedTemplate?.html_file ? (
                  <div className="text-center p-8">
                    <p className="text-sm text-gray-600 mb-4">
                      Template is stored as a file
                    </p>
                    <a
                      href={selectedTemplate.html_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Template in New Tab
                    </a>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="border rounded-md p-8 bg-gray-50 text-center">
                <p className="text-gray-600">No template preview available</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
