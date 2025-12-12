import { useState, useMemo } from 'react';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import PageHeader from '@/components/PageHeader';
import { Send, Mail, Users, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const SendNewsletters = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientType, setRecipientType] = useState<string>('all');
  const [scheduleDate, setScheduleDate] = useState('');
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Memoize breadcrumbs
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: '/' },
    { label: 'Send Newsletters' }
  ], []);

  useBreadcrumbs(breadcrumbs);

  const recipientTypes = [
    { value: 'all', label: 'All Contacts' },
    { value: 'contacts', label: 'Contacts Only' },
    { value: 'partners', label: 'Partners Only' },
    { value: 'subscribers', label: 'Newsletter Subscribers' },
  ];

  const handleSendNewsletter = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter newsletter content');
      return;
    }

    setIsSending(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (scheduleDate) {
        toast.success(`Newsletter scheduled for ${new Date(scheduleDate).toLocaleDateString()}`);
      } else {
        toast.success('Newsletter sent successfully!');
      }

      // Reset form
      setSubject('');
      setContent('');
      setRecipientType('all');
      setScheduleDate('');
      setIncludeAttachments(false);
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Failed to send newsletter. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    setSubject('');
    setContent('');
    setRecipientType('all');
    setScheduleDate('');
    setIncludeAttachments(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Newsletters"
        description="Create and send newsletters to your contacts"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Newsletter Content
              </CardTitle>
              <CardDescription>
                Compose your newsletter message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Enter newsletter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Newsletter Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your newsletter content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {content.length} characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">Send To</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger id="recipients">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">Send Date (Optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send immediately
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attachments"
                  checked={includeAttachments}
                  onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
                />
                <Label htmlFor="attachments" className="text-sm cursor-pointer">
                  Include attachments
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSendNewsletter}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                'Sending...'
              ) : scheduleDate ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Newsletter
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isSending}
              className="w-full"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Newsletter Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Write a compelling subject line to increase open rates</li>
            <li>• Keep content concise and focused on one main topic</li>
            <li>• Include a clear call-to-action</li>
            <li>• Test your newsletter before sending to all recipients</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendNewsletters;
