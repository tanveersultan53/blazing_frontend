import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface CallToActionsTabProps {
  formData: {
    cta_label1: string;
    cta_url1: string;
    cta_label2: string;
    cta_url2: string;
    reverse_label: string;
    reverse_url: string;
    hashtags: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const CallToActionsTab: React.FC<CallToActionsTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center space-x-4">
          <Label htmlFor="cta_label1" className="w-20 text-sm font-medium">
            Label1
          </Label>
          <Input
            id="cta_label1"
            placeholder="cta_label1"
            value={formData.cta_label1}
            onChange={(e) => handleInputChange('cta_label1', e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="cta_url1" className="w-20 text-sm font-medium">
            CTA 1
          </Label>
          <Input
            id="cta_url1"
            placeholder="cta_url1"
            value={formData.cta_url1}
            onChange={(e) => handleInputChange('cta_url1', e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="cta_label2" className="w-20 text-sm font-medium">
            Label2
          </Label>
          <Input
            id="cta_label2"
            placeholder="cta_label2"
            value={formData.cta_label2}
            onChange={(e) => handleInputChange('cta_label2', e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="cta_url2" className="w-20 text-sm font-medium">
            CTA 2
          </Label>
          <Input
            id="cta_url2"
            placeholder="cta_url2"
            value={formData.cta_url2}
            onChange={(e) => handleInputChange('cta_url2', e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="reverse_label" className="w-20 text-sm font-medium">
            Reverse
          </Label>
          <Input
            id="reverse_label"
            placeholder="reverse_label"
            value={formData.reverse_label}
            onChange={(e) => handleInputChange('reverse_label', e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="reverse_url" className="w-20 text-sm font-medium">
            Rev URL
          </Label>
          <Input
            id="reverse_url"
            placeholder="reverse_url"
            value={formData.reverse_url}
            onChange={(e) => handleInputChange('reverse_url', e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="hashtags" className="w-20 text-sm font-medium">
            Hashtags
          </Label>
          <Input
            id="hashtags"
            placeholder="hashtags"
            value={formData.hashtags}
            onChange={(e) => handleInputChange('hashtags', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default CallToActionsTab;
