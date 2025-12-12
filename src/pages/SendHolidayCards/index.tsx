import { useState, useMemo } from 'react';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import PageHeader from '@/components/PageHeader';
import { Send, Gift, Users, Calendar, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const SendHolidayCards = () => {
  const [cardType, setCardType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<string>('all');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Memoize breadcrumbs
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: '/' },
    { label: 'Send Holiday eCards' }
  ], []);

  useBreadcrumbs(breadcrumbs);

  const cardTypes = [
    { value: 'christmas', label: '🎄 Christmas' },
    { value: 'new_year', label: '🎊 New Year' },
    { value: 'thanksgiving', label: '🦃 Thanksgiving' },
    { value: 'easter', label: '🐰 Easter' },
    { value: 'halloween', label: '🎃 Halloween' },
    { value: 'valentines', label: '💝 Valentine\'s Day' },
    { value: 'birthday', label: '🎂 Birthday' },
    { value: 'thank_you', label: '🙏 Thank You' },
  ];

  const recipientTypes = [
    { value: 'all', label: 'All Contacts' },
    { value: 'contacts', label: 'Contacts Only' },
    { value: 'partners', label: 'Partners Only' },
    { value: 'vip', label: 'VIP Clients' },
  ];

  const presetMessages = {
    christmas: 'Wishing you a Merry Christmas and a Happy New Year! May your holidays be filled with joy and prosperity.',
    new_year: 'Happy New Year! Wishing you success and happiness in the year ahead.',
    thanksgiving: 'Happy Thanksgiving! We are grateful for your continued partnership and trust.',
    easter: 'Wishing you a joyful Easter filled with hope and happiness!',
    halloween: 'Happy Halloween! Hope you have a spooktacular day!',
    valentines: 'Happy Valentine\'s Day! Sending you warm wishes and appreciation.',
    birthday: 'Happy Birthday! Wishing you a wonderful day filled with happiness.',
    thank_you: 'Thank you for your continued support and partnership. We truly appreciate you!',
  };

  const handleCardTypeChange = (value: string) => {
    setCardType(value);
    // Auto-fill message with preset
    if (value && presetMessages[value as keyof typeof presetMessages]) {
      setMessage(presetMessages[value as keyof typeof presetMessages]);
    }
  };

  const handleSendCards = async () => {
    if (!cardType) {
      toast.error('Please select a card type');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (scheduleDate) {
        toast.success(`eCards scheduled for ${new Date(scheduleDate).toLocaleDateString()}`);
      } else {
        toast.success('Holiday eCards sent successfully!');
      }

      // Reset form
      setCardType('');
      setMessage('');
      setRecipientType('all');
      setScheduleDate('');
    } catch (error) {
      console.error('Error sending cards:', error);
      toast.error('Failed to send eCards. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    setCardType('');
    setMessage('');
    setRecipientType('all');
    setScheduleDate('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Holiday eCards"
        description="Send personalized holiday greetings to your contacts"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Create eCard
              </CardTitle>
              <CardDescription>
                Choose a card design and personalize your message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Card Type */}
              <div className="space-y-2">
                <Label htmlFor="card-type">Card Type</Label>
                <Select value={cardType} onValueChange={handleCardTypeChange}>
                  <SelectTrigger id="card-type">
                    <SelectValue placeholder="Select holiday or occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Area */}
              {cardType && (
                <div className="p-6 border-2 border-dashed rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {cardTypes.find(t => t.value === cardType)?.label} Card Preview
                    </p>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your holiday message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} characters
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

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSendCards}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                'Sending...'
              ) : scheduleDate ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule eCards
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
          <CardTitle className="text-base">eCard Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Send holiday cards in advance to ensure timely delivery</li>
            <li>• Personalize your message to make it more meaningful</li>
            <li>• Schedule cards for major holidays ahead of time</li>
            <li>• Preview your card before sending to all recipients</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendHolidayCards;
