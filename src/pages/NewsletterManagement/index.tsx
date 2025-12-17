import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Newspaper,
  Send,
  CalendarIcon,
  RefreshCw,
  Info,
  User,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { createNewsletter } from '@/services/newsletterService';
import type { INewsletter } from './interface';
import type { User as UserType } from '@/redux/features/userSlice';
import BlazingIcon from '@/assets/blazing-icon.png';

export default function NewsletterManagement() {
    //@ts-ignore
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: { user: { currentUser: UserType } }) => state.user.currentUser);

  const [formData, setFormData] = useState<INewsletter>({
    economic_news_text: '',
    interest_rate_text: '',
    real_estate_news_text: '',
    article_1: '',
    article_2: '',
    schedule_date: '',
  });
  const [scheduleDate, setScheduleDate] = useState<Date>();

  // Create newsletter mutation
  const createMutation = useMutation({
    mutationFn: createNewsletter,
    onSuccess: () => {
      toast.success('Newsletter scheduled successfully!');
      // Reset form
      setFormData({
        economic_news_text: '',
        interest_rate_text: '',
        real_estate_news_text: '',
        article_1: '',
        article_2: '',
        schedule_date: '',
      });
      setScheduleDate(undefined);
    },
    onError: (error: any) => {
      console.error('Create newsletter error:', error);
      toast.error(error.response?.data?.error || 'Failed to create newsletter');
    },
  });

  // Update schedule date when calendar date changes
  useEffect(() => {
    if (scheduleDate) {
      setFormData(prev => ({
        ...prev,
        schedule_date: format(scheduleDate, 'yyyy-MM-dd HH:mm:ss'),
      }));
    }
  }, [scheduleDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.economic_news_text.trim()) {
      toast.error('Please enter Economic News Text');
      return;
    }
    if (!formData.interest_rate_text.trim()) {
      toast.error('Please enter Interest Rate Text');
      return;
    }
    if (!formData.real_estate_news_text.trim()) {
      toast.error('Please enter Real Estate News Text');
      return;
    }
    if (!formData.article_1.trim()) {
      toast.error('Please enter Article 1');
      return;
    }
    if (!formData.article_2.trim()) {
      toast.error('Please enter Article 2');
      return;
    }
    if (!formData.schedule_date) {
      toast.error('Please select a schedule date');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof INewsletter, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <PageHeader
      title="Newsletter Management"
      description="Create and schedule newsletters for your subscribers"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side - Newsletter Form (8 columns) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit}>
            <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                <CardTitle>Create Newsletter</CardTitle>
              </div>
              <CardDescription>
                Fill in the newsletter content and schedule for delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Info Alert */}
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    All fields are required. The newsletter will be sent to all active subscribers on the scheduled date.
                  </AlertDescription>
                </Alert>

                {/* Economic News Text */}
                <div className="space-y-2">
                  <Label htmlFor="economic_news_text">
                    Economic News Text <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="economic_news_text"
                    placeholder="Enter economic news content..."
                    value={formData.economic_news_text}
                    onChange={(e) => handleInputChange('economic_news_text', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Interest Rate Text */}
                <div className="space-y-2">
                  <Label htmlFor="interest_rate_text">
                    Interest Rate Text <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="interest_rate_text"
                    placeholder="Enter interest rate information..."
                    value={formData.interest_rate_text}
                    onChange={(e) => handleInputChange('interest_rate_text', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Real Estate News Text */}
                <div className="space-y-2">
                  <Label htmlFor="real_estate_news_text">
                    Real Estate News Text <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="real_estate_news_text"
                    placeholder="Enter real estate news..."
                    value={formData.real_estate_news_text}
                    onChange={(e) => handleInputChange('real_estate_news_text', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Article 1 */}
                <div className="space-y-2">
                  <Label htmlFor="article_1">
                    Article 1 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="article_1"
                    placeholder="Enter first article content..."
                    value={formData.article_1}
                    onChange={(e) => handleInputChange('article_1', e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {/* Article 2 */}
                <div className="space-y-2">
                  <Label htmlFor="article_2">
                    Article 2 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="article_2"
                    placeholder="Enter second article content..."
                    value={formData.article_2}
                    onChange={(e) => handleInputChange('article_2', e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {/* Schedule Date */}
                <div className="space-y-2">
                  <Label htmlFor="schedule_date">
                    Schedule Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !scheduleDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {scheduleDate && (
                    <p className="text-xs text-muted-foreground">
                      Scheduled for: {format(scheduleDate, 'MMMM dd, yyyy')}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createMutation.isPending}
                  >
                    Save Process
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createMutation.isPending}
                  >
                    Verify Clear
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createMutation.isPending}
                  >
                    Distribute
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Schedule Newsletter
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right Side - Images (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Photo and Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User & Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Photo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Photo
                </Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://www.tadpole.co.nz/wp-content/uploads/2021/02/team-1.jpg" alt={`${currentUser?.first_name} ${currentUser?.last_name}`} />
                    <AvatarFallback className="text-2xl">
                      {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{currentUser?.first_name} {currentUser?.last_name}</p>
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </div>
              </div>

              {/* Company Logo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Logo
                </Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                  <img
                    src={BlazingIcon}
                    alt="Blazing Social Logo"
                    className="h-16 w-16 object-contain"
                  />
                  <div>
                    <p className="font-semibold">Blazing Social</p>
                    <p className="text-sm text-muted-foreground">Digital Mortgage Marketing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Newsletter Images</CardTitle>
              <CardDescription>5 images for each section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image 1 - Economic News */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Economic News Image</Label>
                <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-4xl shadow-md">
                  📈
                </div>
              </div>

              {/* Image 2 - Interest Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Interest Rate Image</Label>
                <div className="w-full h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-4xl shadow-md">
                  💹
                </div>
              </div>

              {/* Image 3 - Real Estate News */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Real Estate News Image</Label>
                <div className="w-full h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-4xl shadow-md">
                  🏘️
                </div>
              </div>

              {/* Image 4 - Article 1 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Article 1 Image</Label>
                <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-4xl shadow-md">
                  📰
                </div>
              </div>

              {/* Image 5 - Article 2 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Article 2 Image</Label>
                <div className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-4xl shadow-md">
                  📄
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageHeader>
  );
}
