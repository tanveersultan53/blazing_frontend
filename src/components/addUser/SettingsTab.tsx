import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface SettingsTabProps {
  formData: {
    // Input Fields
    settings_name: string;
    sendgrid_password: string;
    // Checkbox Settings
    ehl: boolean;
    eho: boolean;
    realtor: boolean;
    no_rate_post: boolean;
    use_first_name: boolean;
    noemailreport: boolean;
    // Other Settings
    change_phone_labels: boolean;
    custom_newsletter: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
  handleCheckboxChange: (checked: boolean) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ formData, handleInputChange, handleCheckboxChange }) => {
  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Settings</h3>
      
      {/* Input Fields Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="settings_name">Name</Label>
            <Input
              id="settings_name"
              value={formData.settings_name}
              onChange={(e) => handleInputChange('settings_name', e.target.value)}
              placeholder="Enter name from register table"
            />
            <p className="text-xs text-gray-500">Content from register table</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sendgrid_password">sendgrid_password</Label>
            <Input
              id="sendgrid_password"
              type="password"
              value={formData.sendgrid_password}
              onChange={(e) => handleInputChange('sendgrid_password', e.target.value)}
              placeholder="Enter SendGrid password"
            />
          </div>
        </div>
      </div>

      {/* Checkbox Settings Section */}
      <div className="space-y-6">
        <h4 className="text-md font-medium">Settings Options</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ehl"
                checked={formData.ehl}
                onCheckedChange={(checked) => handleInputChange('ehl', checked as boolean)}
              />
              <Label htmlFor="ehl" className="text-sm font-medium">
                Equal Housing Lender
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eho"
                checked={formData.eho}
                onCheckedChange={(checked) => handleInputChange('eho', checked as boolean)}
              />
              <Label htmlFor="eho" className="text-sm font-medium">
                Equal Housing Opportunity
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="realtor"
                checked={formData.realtor}
                onCheckedChange={(checked) => handleInputChange('realtor', checked as boolean)}
              />
              <Label htmlFor="realtor" className="text-sm font-medium">
                Realtor Logo
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="no_rate_post"
                checked={formData.no_rate_post}
                onCheckedChange={(checked) => handleInputChange('no_rate_post', checked as boolean)}
              />
              <Label htmlFor="no_rate_post" className="text-sm font-medium">
                No Rate Post
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use_first_name"
                checked={formData.use_first_name}
                onCheckedChange={(checked) => handleInputChange('use_first_name', checked as boolean)}
              />
              <Label htmlFor="use_first_name" className="text-sm font-medium">
                First Name in Subject
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noemailreport"
                checked={formData.noemailreport}
                onCheckedChange={(checked) => handleInputChange('noemailreport', checked as boolean)}
              />
              <Label htmlFor="noemailreport" className="text-sm font-medium">
                noemailreport
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="change_phone_labels"
                checked={formData.change_phone_labels}
                onCheckedChange={(checked) => handleInputChange('change_phone_labels', checked as boolean)}
              />
              <Label htmlFor="change_phone_labels" className="text-sm font-medium">
                Change Phone Labels
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="custom_newsletter"
                checked={formData.custom_newsletter}
                onCheckedChange={(checked) => handleInputChange('custom_newsletter', checked as boolean)}
              />
              <Label htmlFor="custom_newsletter" className="text-sm font-medium">
                Custom Newsletter
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
