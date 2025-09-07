import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';

interface NewsletterTabProps {
  formData: {
    // User Information
    newsletter_name: string;
    newsletter_company: string;
    newsletter_disclosure: string;
    // Newsletter Options
    newsletter_options: {
      ehl: boolean;
      eho: boolean;
      hud: boolean;
      fdic: boolean;
      realtor: boolean;
      mfdic: boolean;
      bbb: boolean;
      ncua: boolean;
      bbb_a: boolean;
      custom: boolean;
    };
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

const NewsletterTab: React.FC<NewsletterTabProps> = ({ formData, handleInputChange }) => {
  const handleNewsletterOptionChange = (optionKey: string, checked: boolean) => {
    handleInputChange(`newsletter_options.${optionKey}`, checked);
  };

  return (
    <div className="space-y-8">
      {/* User Information Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Newsletter Info</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newsletter_name">Name</Label>
            <Input
              id="newsletter_name"
              value={formData.newsletter_name}
              onChange={(e) => handleInputChange('newsletter_name', e.target.value)}
              placeholder="Enter name"
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Read Only</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newsletter_company">Company</Label>
            <Input
              id="newsletter_company"
              value={formData.newsletter_company}
              onChange={(e) => handleInputChange('newsletter_company', e.target.value)}
              placeholder="Enter company"
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Read Only</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newsletter_disclosure">Disclosure</Label>
          <Textarea
            id="newsletter_disclosure"
            value={formData.newsletter_disclosure}
            onChange={(e) => handleInputChange('newsletter_disclosure', e.target.value)}
            placeholder="Enter disclosure content from register table"
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">Use register table</p>
        </div>
      </div>

      {/* Newsletter Options Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Newsletter Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ehl"
                checked={formData.newsletter_options.ehl}
                onCheckedChange={(checked) => handleNewsletterOptionChange('ehl', checked as boolean)}
              />
              <Label htmlFor="ehl" className="text-sm font-medium">
                EHL
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eho"
                checked={formData.newsletter_options.eho}
                onCheckedChange={(checked) => handleNewsletterOptionChange('eho', checked as boolean)}
              />
              <Label htmlFor="eho" className="text-sm font-medium">
                EHO
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hud"
                checked={formData.newsletter_options.hud}
                onCheckedChange={(checked) => handleNewsletterOptionChange('hud', checked as boolean)}
              />
              <Label htmlFor="hud" className="text-sm font-medium">
                HUD
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fdic"
                checked={formData.newsletter_options.fdic}
                onCheckedChange={(checked) => handleNewsletterOptionChange('fdic', checked as boolean)}
              />
              <Label htmlFor="fdic" className="text-sm font-medium">
                FDIC
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="realtor"
                checked={formData.newsletter_options.realtor}
                onCheckedChange={(checked) => handleNewsletterOptionChange('realtor', checked as boolean)}
              />
              <Label htmlFor="realtor" className="text-sm font-medium">
                Realtor
              </Label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mfdic"
                checked={formData.newsletter_options.mfdic}
                onCheckedChange={(checked) => handleNewsletterOptionChange('mfdic', checked as boolean)}
              />
              <Label htmlFor="mfdic" className="text-sm font-medium">
                MFDIC
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bbb"
                checked={formData.newsletter_options.bbb}
                onCheckedChange={(checked) => handleNewsletterOptionChange('bbb', checked as boolean)}
              />
              <Label htmlFor="bbb" className="text-sm font-medium">
                BBB
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ncua"
                checked={formData.newsletter_options.ncua}
                onCheckedChange={(checked) => handleNewsletterOptionChange('ncua', checked as boolean)}
              />
              <Label htmlFor="ncua" className="text-sm font-medium">
                NCUA
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bbb_a"
                checked={formData.newsletter_options.bbb_a}
                onCheckedChange={(checked) => handleNewsletterOptionChange('bbb_a', checked as boolean)}
              />
              <Label htmlFor="bbb_a" className="text-sm font-medium">
                BBB-A
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="custom"
                checked={formData.newsletter_options.custom}
                onCheckedChange={(checked) => handleNewsletterOptionChange('custom', checked as boolean)}
              />
              <Label htmlFor="custom" className="text-sm font-medium">
                Custom
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Not many people use this, but rename graphic to custom.jpg and put into ecards/accountid/ folder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterTab;
