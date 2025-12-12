import { useState, useMemo } from 'react';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import PageHeader from '@/components/PageHeader';
import { Sparkles, Send, RefreshCw, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const GenerateSocialPosts = () => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState<string>('all');
  const [category, setCategory] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [copied, setCopied] = useState(false);

  // Memoize breadcrumbs
  const breadcrumbs = useMemo(() => [
    { label: 'Dashboard', path: '/' },
    { label: 'Generate Social Posts' }
  ], []);

  useBreadcrumbs(breadcrumbs);

  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
  ];

  const categories = [
    { value: 'mortgage', label: 'Mortgage Tips' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'tips', label: 'Financial Tips' },
    { value: 'market_update', label: 'Market Updates' },
    { value: 'customer_story', label: 'Customer Stories' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'educational', label: 'Educational' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // TODO: Replace with actual API call
      // For now, simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock generated content
      const mockContent = `🏡 ${prompt}\n\nLooking to make your dream of homeownership a reality? Our team is here to guide you through every step of the mortgage process!\n\n✨ What we offer:\n• Competitive rates\n• Personalized service\n• Fast approval process\n• Expert guidance\n\nReady to take the next step? Contact us today!`;

      const mockHashtags = '#Mortgage #HomeLoans #RealEstate #DreamHome #FirstTimeHomeBuyer #MortgageTips';

      setGeneratedContent(mockContent);
      setHashtags(mockHashtags);
      setTitle(prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''));

      toast.success('Social media post generated successfully!');
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error('Failed to generate post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedContent.trim()) {
      toast.error('No content to save');
      return;
    }

    // TODO: Save to backend
    toast.success('Post saved as draft!');

    // Reset form
    setPrompt('');
    setGeneratedContent('');
    setHashtags('');
    setTitle('');
    setCategory('');
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedContent('');
    setHashtags('');
    setTitle('');
    setCategory('');
  };

  const handleCopy = () => {
    const fullContent = `${generatedContent}\n\n${hashtags}`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    toast.success('Content copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getPlatformLimit = () => {
    switch (platform) {
      case 'twitter':
        return 280;
      case 'facebook':
        return 63206;
      case 'instagram':
        return 2200;
      case 'linkedin':
        return 3000;
      default:
        return null;
    }
  };

  const characterCount = getCharacterCount(generatedContent);
  const platformLimit = getPlatformLimit();
  const isOverLimit = platformLimit && characterCount > platformLimit;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Social Media Posts"
        description="Use AI to create engaging social media content"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Post
            </CardTitle>
            <CardDescription>
              Describe what you want to post about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">What would you like to post about?</Label>
              <Textarea
                id="prompt"
                placeholder="E.g., Tips for first-time homebuyers, Benefits of refinancing, Current mortgage rates..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Review and edit your post
                </CardDescription>
              </div>
              {generatedContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                placeholder="Give your post a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Generated Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="generated-content">Content</Label>
                <span className="text-xs text-muted-foreground">
                  {characterCount} {platformLimit && `/ ${platformLimit}`} characters
                </span>
              </div>
              <Textarea
                id="generated-content"
                placeholder="Generated content will appear here..."
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={10}
                className="resize-none"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Textarea
                id="hashtags"
                placeholder="Generated hashtags..."
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!generatedContent.trim()}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be specific about your target audience and message</li>
            <li>• Include key points or statistics you want highlighted</li>
            <li>• Mention the desired tone (professional, friendly, etc.)</li>
            <li>• Review and edit to match your brand voice</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateSocialPosts;
