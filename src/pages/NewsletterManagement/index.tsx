import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Newspaper,
  Send,
  CalendarIcon,
  RefreshCw,
  Info,
  User,
  Building2,
  Upload,
  FileText
} from 'lucide-react';
import { useNewsletterManagement } from './useNewsletterManagement';

export default function NewsletterManagement() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    templateError,
    htmlFileError,
    scheduleDate,
    setScheduleDate,
    createMutation,
    handleTemplateTypeChange,
    handleTemplateSelect,
    handleFileUpload,
    handleUserPhotoUpload,
    handleCompanyLogoUpload,
    handleEconomicNewsImageUpload,
    handleInterestRateImageUpload,
    handleRealEstateNewsImageUpload,
    handleArticle1ImageUpload,
    handleArticle2ImageUpload,
    userPhotoPreview,
    companyLogoPreview,
    economicNewsImagePreview,
    interestRateImagePreview,
    realEstateNewsImagePreview,
    article1ImagePreview,
    article2ImagePreview,
    newsletterTemplates,
    isLoadingTemplates,
  } = useNewsletterManagement();

  const templateType = watch('template_type');
  const templateId = watch('template_id');
  const htmlFile = watch('html_file');
  const userPhoto = watch('user_photo');
  const companyLogo = watch('company_logo');
  const economicNewsImage = watch('economic_news_image');
  const interestRateImage = watch('interest_rate_image');
  const realEstateNewsImage = watch('real_estate_news_image');
  const article1Image = watch('article_1_image');
  const article2Image = watch('article_2_image');
  const scheduleTime = watch('schedule_time');

  return (
    <PageHeader
      title="Newsletter Management"
      description="Create and schedule newsletters for your subscribers"
    >
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
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side - Newsletter Form (8 columns) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Info Alert */}
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    All fields marked with * are required. The newsletter will be sent to all active subscribers on the scheduled date.
                  </AlertDescription>
                </Alert>

                {/* Template Selection */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <Label className="text-base font-semibold">
                    Newsletter Template <span className="text-red-500">*</span>
                  </Label>

                  <RadioGroup
                    value={templateType}
                    onValueChange={(value) => handleTemplateTypeChange(value as 'existing' | 'upload')}
                    className="flex gap-4 mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="existing" />
                      <Label htmlFor="existing" className="font-normal cursor-pointer">
                        Choose Existing Template
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload" />
                      <Label htmlFor="upload" className="font-normal cursor-pointer">
                        Upload HTML Template
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Existing Template Selection */}
                  {templateType === 'existing' && (
                    <div className="space-y-2 w-full">
                      <Label htmlFor="template_select">Select Template <span className="text-red-500">*</span></Label>
                      <Select
                        value={templateId?.toString()}
                        onValueChange={(value) => handleTemplateSelect(parseInt(value))}
                        disabled={isLoadingTemplates}
                      >
                        <SelectTrigger
                          id="template_select"
                          className={cn("w-full", templateError && "border-red-500")}
                        >
                          <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a newsletter template"} />
                        </SelectTrigger>
                        <SelectContent>
                          {newsletterTemplates.length > 0 ? (
                            newsletterTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  {template.name}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-templates" disabled>
                              No newsletter templates available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {templateError && (
                        <p className="text-sm text-red-500">{templateError}</p>
                      )}
                    </div>
                  )}

                  {/* Upload Template */}
                  {templateType === 'upload' && (
                    <div className="space-y-2">
                      <Label htmlFor="html_file">Upload HTML File <span className="text-red-500">*</span></Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="html_file"
                          type="file"
                          accept=".html,.htm"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload(file);
                          }}
                          className={cn("cursor-pointer", htmlFileError && "border-red-500")}
                        />
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {htmlFile && (
                        <p className="text-xs text-muted-foreground">
                          Selected file: {htmlFile.name}
                        </p>
                      )}
                      {htmlFileError && (
                        <p className="text-sm text-red-500">{htmlFileError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Row 1: Economic News Text & Interest Rate Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Economic News Text */}
                  <div className="space-y-2">
                    <Label htmlFor="economic_news_text">
                      Economic News Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="economic_news_text"
                      placeholder="Enter economic news content..."
                      {...register('economic_news_text', {
                        required: 'Economic News Text is required',
                        minLength: { value: 10, message: 'Minimum 10 characters required' }
                      })}
                      rows={4}
                      className={cn("resize-none", errors.economic_news_text && "border-red-500")}
                    />
                    {errors.economic_news_text && (
                      <p className="text-sm text-red-500">{errors.economic_news_text.message}</p>
                    )}
                  </div>

                  {/* Interest Rate Text */}
                  <div className="space-y-2">
                    <Label htmlFor="interest_rate_text">
                      Interest Rate Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="interest_rate_text"
                      placeholder="Enter interest rate information..."
                      {...register('interest_rate_text', {
                        required: 'Interest Rate Text is required',
                        minLength: { value: 10, message: 'Minimum 10 characters required' }
                      })}
                      rows={4}
                      className={cn("resize-none", errors.interest_rate_text && "border-red-500")}
                    />
                    {errors.interest_rate_text && (
                      <p className="text-sm text-red-500">{errors.interest_rate_text.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Real Estate News Text & Article 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real Estate News Text */}
                  <div className="space-y-2">
                    <Label htmlFor="real_estate_news_text">
                      Real Estate News Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="real_estate_news_text"
                      placeholder="Enter real estate news..."
                      {...register('real_estate_news_text', {
                        required: 'Real Estate News Text is required',
                        minLength: { value: 10, message: 'Minimum 10 characters required' }
                      })}
                      rows={4}
                      className={cn("resize-none", errors.real_estate_news_text && "border-red-500")}
                    />
                    {errors.real_estate_news_text && (
                      <p className="text-sm text-red-500">{errors.real_estate_news_text.message}</p>
                    )}
                  </div>

                  {/* Article 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="article_1">
                      Article 1 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="article_1"
                      placeholder="Enter first article content..."
                      {...register('article_1', {
                        required: 'Article 1 is required',
                        minLength: { value: 10, message: 'Minimum 10 characters required' }
                      })}
                      rows={4}
                      className={cn("resize-none", errors.article_1 && "border-red-500")}
                    />
                    {errors.article_1 && (
                      <p className="text-sm text-red-500">{errors.article_1.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Article 2 (Full Width) */}
                <div className="space-y-2">
                  <Label htmlFor="article_2">
                    Article 2 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="article_2"
                    placeholder="Enter second article content..."
                    {...register('article_2', {
                      required: 'Article 2 is required',
                      minLength: { value: 10, message: 'Minimum 10 characters required' }
                    })}
                    rows={4}
                    className={cn("resize-none", errors.article_2 && "border-red-500")}
                  />
                  {errors.article_2 && (
                    <p className="text-sm text-red-500">{errors.article_2.message}</p>
                  )}
                </div>

                {/* Row 4: Schedule Date & Schedule Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Schedule Date */}
                  <div className="space-y-2">
                    <Label htmlFor="schedule_date">
                      Schedule Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
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
                          onSelect={(date) => {
                            setScheduleDate(date);
                            if (date) {
                              setValue('schedule_date', format(date, 'yyyy-MM-dd HH:mm:ss'));
                            }
                          }}
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

                  {/* Schedule Time */}
                  <div className="space-y-2">
                    <Label htmlFor="schedule_time">
                      Schedule Time
                    </Label>
                    <Input
                      id="schedule_time"
                      type="time"
                      {...register('schedule_time')}
                      className="w-full"
                    />
                    {scheduleTime && (
                      <p className="text-xs text-muted-foreground">
                        Time: {scheduleTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createMutation.isPending}
                  >
                    Save
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
              </div>

              {/* Right Side - User & Company + Images (4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                {/* User Photo and Logo */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold">User & Company</h3>

                  {/* User Photo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User Photo
                    </Label>
                    <div className="space-y-3">
                      <Input
                        id="user_photo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleUserPhotoUpload(file);
                        }}
                        className="cursor-pointer"
                      />
                      {userPhotoPreview && (
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
                          <img
                            src={userPhotoPreview}
                            alt="User Photo Preview"
                            className="h-16 w-16 object-cover rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-sm">Preview</p>
                            <p className="text-xs text-muted-foreground">{userPhoto?.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Logo
                    </Label>
                    <div className="space-y-3">
                      <Input
                        id="company_logo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleCompanyLogoUpload(file);
                        }}
                        className="cursor-pointer"
                      />
                      {companyLogoPreview && (
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
                          <img
                            src={companyLogoPreview}
                            alt="Company Logo Preview"
                            className="h-12 w-12 object-contain"
                          />
                          <div>
                            <p className="font-semibold text-sm">Preview</p>
                            <p className="text-xs text-muted-foreground">{companyLogo?.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Newsletter Images */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold">Newsletter Images</h3>
                  <p className="text-sm text-muted-foreground">5 images for each section</p>

                  {/* Image 1 - Economic News */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Economic News Image</Label>
                    <Input
                      id="economic_news_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleEconomicNewsImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {economicNewsImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={economicNewsImagePreview}
                          alt="Economic News Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{economicNewsImage?.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Image 2 - Interest Rate */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Interest Rate Image</Label>
                    <Input
                      id="interest_rate_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleInterestRateImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {interestRateImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={interestRateImagePreview}
                          alt="Interest Rate Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{interestRateImage?.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Image 3 - Real Estate News */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Real Estate News Image</Label>
                    <Input
                      id="real_estate_news_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleRealEstateNewsImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {realEstateNewsImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={realEstateNewsImagePreview}
                          alt="Real Estate News Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{realEstateNewsImage?.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Image 4 - Article 1 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Article 1 Image</Label>
                    <Input
                      id="article_1_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleArticle1ImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {article1ImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={article1ImagePreview}
                          alt="Article 1 Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{article1Image?.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Image 5 - Article 2 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Article 2 Image</Label>
                    <Input
                      id="article_2_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleArticle2ImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {article2ImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={article2ImagePreview}
                          alt="Article 2 Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{article2Image?.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageHeader>
  );
}
