import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Save, CheckCircle, RefreshCw } from 'lucide-react';
import { SocialMediaData, getUserSocialMedia } from '../../services/authService';

interface SocialMediaTabProps {
  formData: {
    facebook_url: string;
    linkedin_url: string;
    google_url: string;
    instagram_url: string;
    twitter_url: string;
    yelp_url: string;
    blog_url: string;
    youtube_url: string;
    vimeo_url: string;
    custom_app_url: string;
    moneylogo_url: string;
    custom_label_url: string;
    custom_call_url: string;
    qrcode_url: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  userId?: string | null;
  onUpdateSocialMedia?: (data: SocialMediaData) => Promise<void>;
}

const SocialMediaTab: React.FC<SocialMediaTabProps> = ({ 
  formData, 
  handleInputChange, 
  userId,
  onUpdateSocialMedia 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData | null>(null);

  // Fetch social media data when component mounts or userId changes
  useEffect(() => {
    const fetchSocialMediaData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const response = await getUserSocialMedia(userId);
        setSocialMediaData(response.data);
      } catch (error) {
        // Handle error silently - social media data might not exist yet
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialMediaData();
  }, [userId]);

  // Helper function to get value from fetched data or form data
  const getFieldValue = (fieldName: string) => {
    if (socialMediaData && socialMediaData[fieldName as keyof SocialMediaData]) {
      return socialMediaData[fieldName as keyof SocialMediaData] || '';
    }
    return formData[fieldName as keyof typeof formData] || '';
  };

  const handleUpdateSocialMedia = async () => {
    if (!userId || !onUpdateSocialMedia) return;

    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      // Map form data to API structure
      const socialMediaData = {
        facebook: formData.facebook_url,
        twitter: formData.twitter_url,
        linkedin: formData.linkedin_url,
        instagram: formData.instagram_url,
        youtube: formData.youtube_url,
        vimeo: formData.vimeo_url,
        yelp: formData.yelp_url,
        google: formData.google_url,
        blogr: formData.blog_url,
        customapp: formData.custom_app_url,
        socialapp: formData.custom_app_url, // Using custom_app_url for socialapp
        moneyapp: formData.moneylogo_url
        // Note: qrcode, customlabel, customcall are not in the new API structure
      };

      await onUpdateSocialMedia(socialMediaData);
      setUpdateSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      // Handle error silently or show a toast notification instead
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Social Media URLs</h3>
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span>Loading social media data...</span>
            </div>
          )}
        </div>
        {userId && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleUpdateSocialMedia}
              disabled={isUpdating || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : updateSuccess ? (
                <div className="flex items-center space-x-2 text-green-100">
                  <CheckCircle className="h-4 w-4" />
                  <span>Updated!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Update Social Media</span>
                </div>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Row 1: Major Social Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facebook_url">Facebook</Label>
          <Input
            id="facebook_url"
            name="facebook_url"
            value={getFieldValue('facebook')}
            onChange={handleInputChange}
            placeholder="https://facebook.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter_url">Twitter</Label>
          <Input
            id="twitter_url"
            name="twitter_url"
            value={getFieldValue('twitter')}
            onChange={handleInputChange}
            placeholder="https://twitter.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn</Label>
          <Input
            id="linkedin_url"
            name="linkedin_url"
            value={getFieldValue('linkedin')}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      {/* Row 2: Visual & Video Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram_url">Instagram</Label>
          <Input
            id="instagram_url"
            name="instagram_url"
            value={getFieldValue('instagram')}
            onChange={handleInputChange}
            placeholder="https://instagram.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube_url">YouTube</Label>
          <Input
            id="youtube_url"
            name="youtube_url"
            value={getFieldValue('youtube')}
            onChange={handleInputChange}
            placeholder="https://youtube.com/channel/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vimeo_url">Vimeo</Label>
          <Input
            id="vimeo_url"
            name="vimeo_url"
            value={getFieldValue('vimeo')}
            onChange={handleInputChange}
            placeholder="https://vimeo.com/username"
          />
        </div>
      </div>

      {/* Row 3: Business & Review Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yelp_url">Yelp</Label>
          <Input
            id="yelp_url"
            name="yelp_url"
            value={getFieldValue('yelp')}
            onChange={handleInputChange}
            placeholder="https://yelp.com/biz/business-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="google_url">Google</Label>
          <Input
            id="google_url"
            name="google_url"
            value={getFieldValue('google')}
            onChange={handleInputChange}
            placeholder="https://google.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog_url">Blog</Label>
          <Input
            id="blog_url"
            name="blog_url"
            value={getFieldValue('blogr')}
            onChange={handleInputChange}
            placeholder="https://blog.com/username"
          />
        </div>
      </div>

      {/* Row 4: Custom & Specialized Apps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="custom_app_url">Custom App</Label>
          <Input
            id="custom_app_url"
            name="custom_app_url"
            value={getFieldValue('customapp')}
            onChange={handleInputChange}
            placeholder="https://customapp.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moneylogo_url">Money App</Label>
          <Input
            id="moneylogo_url"
            name="moneylogo_url"
            value={getFieldValue('moneyapp')}
            onChange={handleInputChange}
            placeholder="https://moneyapp.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qrcode_url">QR Code</Label>
          <Input
            id="qrcode_url"
            name="qrcode_url"
            value={formData.qrcode_url}
            onChange={handleInputChange}
            placeholder="https://qrcode.com/username"
          />
        </div>
      </div>

      {/* Row 5: Custom Labels & Calls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="custom_label_url">Custom Label</Label>
          <Input
            id="custom_label_url"
            name="custom_label_url"
            value={formData.custom_label_url}
            onChange={handleInputChange}
            placeholder="https://customlabel.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom_call_url">Custom Call</Label>
          <Input
            id="custom_call_url"
            name="custom_call_url"
            value={formData.custom_call_url}
            onChange={handleInputChange}
            placeholder="https://customcall.com/username"
          />
        </div>
        <div className="space-y-2">
          {/* Empty space for consistent 3-column layout */}
        </div>
      </div>

      {updateSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Social media URLs updated successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTab;
