import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  CalendarIcon,
  Info,
  ExternalLink,
  Loader2,
  Mail,
} from "lucide-react";
import { useNewsletterManagement } from "./useNewsletterManagement";
import Loading from "@/components/Loading";

export default function NewsletterManagement() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    scheduleDate,
    setScheduleDate,
    createMutation,
    handleEconImageUpload,
    handleRateImageUpload,
    handleNewsImageUpload,
    handleArticle1ImageUpload,
    handleArticle2ImageUpload,
    handleClear,
    handleSave,
    handleVerify,
    handleAddHtmlCodes,
    handleDistribute,
    handleSchedule,
    econImagePreview,
    rateImagePreview,
    newsImagePreview,
    article1ImagePreview,
    article2ImagePreview,
    // Verify dialog
    isVerifyDialogOpen,
    selectedUserId,
    setSelectedUserId,
    handleVerifySubmit,
    handleCloseVerifyDialog,
    users,
    isLoadingUsers,
    verifyMutation,
    // Test email
    testEmail,
    setTestEmail,
    newsletterVersion,
    setNewsletterVersion,
    sendTestMutation,
    handleSendTestEmail,
    // Preview
    newsletterUrls,
    handleClosePreview,
    // Edit mode
    isEditMode,
    isLoadingNewsletter,
  } = useNewsletterManagement();

  const econImage = watch("econ_image");
  const rateImage = watch("rate_image");
  const newsImage = watch("news_image");
  const article1Image = watch("article1_image");
  const article2Image = watch("article2_image");
  const scheduleTime = watch("scheduled_time");

  if (isEditMode && isLoadingNewsletter) {
    return <Loading />;
  }

  return (
    <PageHeader
      title={isEditMode ? "Edit Newsletter" : "Newsletter Management"}
      description={isEditMode ? "Update newsletter information" : "Create and schedule newsletters for your subscribers"}
    >
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <CardTitle>{isEditMode ? "Edit Newsletter" : "Create Newsletter"}</CardTitle>
            </div>
            <CardDescription>
              {isEditMode ? "Update the newsletter content and schedule" : "Fill in the newsletter content and schedule for delivery"}
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
                    All fields marked with * are required. The newsletter will
                    be sent to all active subscribers on the scheduled date.
                  </AlertDescription>
                </Alert>

                {/* HTML Codes Info Alert */}
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <Info className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm space-y-2">
                    <div className="font-semibold">HTML Codes - Quick Formatting Guide:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*1</code> = Start bold</div>
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*2</code> = End bold</div>
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*3</code> = Start italic</div>
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*4</code> = End italic</div>
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*5</code> = Paragraph break</div>
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*6</code> = Line break</div>
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*7</code> = Start underline</div>
                      <div><code className="bg-white dark:bg-gray-800 px-1 rounded">*8</code> = End underline</div>
                    </div>
                    <div className="text-xs mt-2 italic">
                      Example: <code className="bg-white dark:bg-gray-800 px-1 rounded">*1This text will be bold*2</code> → Click "Add HTML Codes" to convert
                    </div>
                  </AlertDescription>
                </Alert>
                {/* Row 1: Economic News Text & Interest Rate Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Economic News Text */}
                  <div className="space-y-2">
                    <Label htmlFor="econ_text">
                      Economic News Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="econ_text"
                      placeholder="Enter economic news content..."
                      {...register("econ_text", {
                        required: "Economic News Text is required",
                        minLength: {
                          value: 10,
                          message: "Minimum 10 characters required",
                        },
                      })}
                      rows={4}
                      className={cn(
                        "resize-none",
                        errors.econ_text && "border-red-500"
                      )}
                    />
                    {errors.econ_text && (
                      <p className="text-sm text-red-500">
                        {errors.econ_text.message}
                      </p>
                    )}
                  </div>

                  {/* Interest Rate Text */}
                  <div className="space-y-2">
                    <Label htmlFor="rate_text">
                      Interest Rate Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="rate_text"
                      placeholder="Enter interest rate information..."
                      {...register("rate_text", {
                        required: "Interest Rate Text is required",
                        minLength: {
                          value: 10,
                          message: "Minimum 10 characters required",
                        },
                      })}
                      rows={4}
                      className={cn(
                        "resize-none",
                        errors.rate_text && "border-red-500"
                      )}
                    />
                    {errors.rate_text && (
                      <p className="text-sm text-red-500">
                        {errors.rate_text.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Real Estate News Text & Article 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real Estate News Text */}
                  <div className="space-y-2">
                    <Label htmlFor="news_text">
                      Real Estate News Text{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="news_text"
                      placeholder="Enter real estate news..."
                      {...register("news_text", {
                        required: "Real Estate News Text is required",
                        minLength: {
                          value: 10,
                          message: "Minimum 10 characters required",
                        },
                      })}
                      rows={4}
                      className={cn(
                        "resize-none",
                        errors.news_text && "border-red-500"
                      )}
                    />
                    {errors.news_text && (
                      <p className="text-sm text-red-500">
                        {errors.news_text.message}
                      </p>
                    )}
                  </div>

                  {/* Article 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="article1_text">
                      Article 1 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="article1_text"
                      placeholder="Enter first article content..."
                      {...register("article1_text", {
                        required: "Article 1 is required",
                        minLength: {
                          value: 10,
                          message: "Minimum 10 characters required",
                        },
                      })}
                      rows={4}
                      className={cn(
                        "resize-none",
                        errors.article1_text && "border-red-500"
                      )}
                    />
                    {errors.article1_text && (
                      <p className="text-sm text-red-500">
                        {errors.article1_text.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Article 2 (Full Width) */}
                <div className="space-y-2">
                  <Label htmlFor="article2_text">
                    Article 2
                  </Label>
                    <Textarea
                      id="article2_text"
                      placeholder="Enter second article content..."
                      {...register("article2_text", {
                        // optional field
                        validate: value => {
                          if (value && value.length < 10) {
                            return "Minimum 10 characters required";
                          }
                          return true; // valid if empty
                        }
                      })}
                      rows={4}
                      className={cn(
                        "resize-none",
                        errors.article2_text && "border-red-500"
                      )}
                    />
                  {errors.article2_text && (
                    <p className="text-sm text-red-500">
                      {errors.article2_text.message}
                    </p>
                  )}
                </div>

                {/* Row 4: Newsletter Label */}
                <div className="space-y-2">
                  <Label htmlFor="newsletter_label">
                    Newsletter Label <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="newsletter_label"
                    placeholder="e.g., December 29, 2025 Real Estate Report"
                    {...register("newsletter_label", {
                      required: "Newsletter Label is required",
                    })}
                    className={cn(
                      errors.newsletter_label && "border-red-500"
                    )}
                  />
                  {errors.newsletter_label && (
                    <p className="text-sm text-red-500">
                      {errors.newsletter_label.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This will be used to name the email files (e.g., "december 29 2025 real estate report.htm")
                  </p>
                </div>

                {/* Row 5: Schedule Date & Schedule Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Schedule Date */}
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Schedule Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduleDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDate
                            ? format(scheduleDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={(date) => {
                            setScheduleDate(date);
                            if (date) {
                              setValue(
                                "scheduled_date",
                                format(date, "yyyy-MM-dd")
                              );
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {scheduleDate && (
                      <p className="text-xs text-muted-foreground">
                        Scheduled for: {format(scheduleDate, "MMMM dd, yyyy")}
                      </p>
                    )}
                  </div>

                  {/* Schedule Time */}
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time">Schedule Time</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      {...register("scheduled_time")}
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
                <div className="space-y-3 pt-4">
                  {/* First Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      disabled={createMutation.isPending}
                    >
                      Clear
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSave}
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Saving...'}
                        </>
                      ) : (
                        isEditMode ? 'Update' : 'Save'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddHtmlCodes}
                      disabled={createMutation.isPending}
                    >
                      Add HTML Codes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSchedule}
                      disabled={createMutation.isPending}
                    >
                      Schedule
                    </Button>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerify}
                      disabled={createMutation.isPending}
                    >
                      Verify
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDistribute}
                      disabled={createMutation.isPending}
                    >
                      Distribute
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side - User & Company + Images (4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Newsletter Images */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold">Newsletter Images</h3>
                  <p className="text-sm text-muted-foreground">
                    5 images for each section
                  </p>

                  {/* Image 1 - Economic News */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Economic News Image
                    </Label>
                    <Input
                      id="econ_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleEconImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {econImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={econImagePreview}
                          alt="Economic News Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {econImage?.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image 2 - Interest Rate */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Interest Rate Image
                    </Label>
                    <Input
                      id="rate_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleRateImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {rateImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={rateImagePreview}
                          alt="Interest Rate Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {rateImage?.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image 3 - Real Estate News */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Real Estate News Image
                    </Label>
                    <Input
                      id="news_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleNewsImageUpload(file);
                      }}
                      className="cursor-pointer"
                    />
                    {newsImagePreview && (
                      <div className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <img
                          src={newsImagePreview}
                          alt="Real Estate News Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {newsImage?.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image 4 - Article 1 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Article 1 Image
                    </Label>
                    <Input
                      id="article1_image"
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
                        <p className="text-xs text-muted-foreground mt-2">
                          {article1Image?.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image 5 - Article 2 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Article 2 Image
                    </Label>
                    <Input
                      id="article2_image"
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
                        <p className="text-xs text-muted-foreground mt-2">
                          {article2Image?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* User Selection Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={handleCloseVerifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Newsletter</DialogTitle>
            <DialogDescription>
              Select a user to generate newsletter preview or send test email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select
                value={selectedUserId?.toString()}
                onValueChange={(value) => setSelectedUserId(Number(value))}
              >
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>
                      Loading users...
                    </SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="no-users" disabled>
                      No users found
                    </SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Test Email Section */}
            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-3 block">Test Email Settings</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletter-version">Newsletter Version</Label>
                  <Select value={newsletterVersion} onValueChange={(value) => setNewsletterVersion(value as "long" | "short")}>
                    <SelectTrigger id="newsletter-version">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long Newsletter</SelectItem>
                      <SelectItem value="short">Short Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseVerifyDialog}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendTestEmail}
              disabled={!selectedUserId || !testEmail || sendTestMutation.isPending || verifyMutation.isPending}
              className="sm:flex-1"
            >
              {sendTestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Test Email
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleVerifySubmit}
              disabled={!selectedUserId || verifyMutation.isPending || sendTestMutation.isPending}
              className="sm:flex-1"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Newsletter Preview Dialog */}
      <Dialog open={!!newsletterUrls} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Newsletter Preview</DialogTitle>
            <DialogDescription>
              View your newsletter preview URLs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {newsletterUrls && (
              <>
                <div className="space-y-2">
                  <Label>Short Newsletter</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newsletterUrls.short_newsletter_url}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        window.open(newsletterUrls.short_newsletter_url, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Long Newsletter</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newsletterUrls.long_newsletter_url}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        window.open(newsletterUrls.long_newsletter_url, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleClosePreview}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
