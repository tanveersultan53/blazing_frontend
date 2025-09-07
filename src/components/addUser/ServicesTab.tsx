import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface ServicesTabProps {
  formData: {
    // Service Charges and Royalties
    email_service_amt: string;
    email_service_cost: string;
    bs_service_amt: string;
    bs_service_cost: string;
    send_post_amt: string;
    send_post_cost: string;
    send_cominghome_amt: string;
    send_news_cost: string;
    send_news_amt: string;
    send_cominghome_cost: string;
    // Service Checkboxes
    send_post_service: boolean;
    send_weekly_newsletter: boolean;
    send_coming_home_file: boolean;
    has_coming_home: boolean;
    no_branding: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Service Setting</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left font-medium">Service</th>
              <th className="border border-gray-200 px-4 py-2 text-left font-medium">Service Charges</th>
              <th className="border border-gray-200 px-4 py-2 text-left font-medium">Service Royalties</th>
            </tr>
          </thead>
          <tbody>
            {/* Email Service */}
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-medium">email_service</td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.email_service_amt}
                  onChange={(e) => handleInputChange('email_service_amt', e.target.value)}
                  placeholder="Enter amount"
                  className="w-full"
                />
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.email_service_cost}
                  onChange={(e) => handleInputChange('email_service_cost', e.target.value)}
                  placeholder="Enter cost"
                  className="w-full"
                />
              </td>
            </tr>

            {/* BS Service */}
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-medium">BS_service</td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.bs_service_amt}
                  onChange={(e) => handleInputChange('bs_service_amt', e.target.value)}
                  placeholder="Enter amount"
                  className="w-full"
                />
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.bs_service_cost}
                  onChange={(e) => handleInputChange('bs_service_cost', e.target.value)}
                  placeholder="Enter cost"
                  className="w-full"
                />
              </td>
            </tr>

            {/* Send Post Service */}
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_post_service"
                    checked={formData.send_post_service}
                    onCheckedChange={(checked) => handleInputChange('send_post_service', checked as boolean)}
                  />
                  <Label htmlFor="send_post_service" className="font-medium">
                    send_post_service
                  </Label>
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.send_post_amt}
                  onChange={(e) => handleInputChange('send_post_amt', e.target.value)}
                  placeholder="Enter amount"
                  className="w-full"
                  disabled={!formData.send_post_service}
                />
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.send_post_cost}
                  onChange={(e) => handleInputChange('send_post_cost', e.target.value)}
                  placeholder="Enter cost"
                  className="w-full"
                  disabled={!formData.send_post_service}
                />
              </td>
            </tr>

            {/* Send Weekly Newsletter */}
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_weekly_newsletter"
                    checked={formData.send_weekly_newsletter}
                    onCheckedChange={(checked) => handleInputChange('send_weekly_newsletter', checked as boolean)}
                  />
                  <Label htmlFor="send_weekly_newsletter" className="font-medium">
                    Send_Weekly_Newsletter
                  </Label>
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.send_cominghome_amt}
                  onChange={(e) => handleInputChange('send_cominghome_amt', e.target.value)}
                  placeholder="Enter amount"
                  className="w-full"
                  disabled={!formData.send_weekly_newsletter}
                />
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.send_news_cost}
                  onChange={(e) => handleInputChange('send_news_cost', e.target.value)}
                  placeholder="Enter cost"
                  className="w-full"
                  disabled={!formData.send_weekly_newsletter}
                />
              </td>
            </tr>

            {/* Send Coming Home File */}
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_coming_home_file"
                    checked={formData.send_coming_home_file}
                    onCheckedChange={(checked) => handleInputChange('send_coming_home_file', checked as boolean)}
                  />
                  <Label htmlFor="send_coming_home_file" className="font-medium">
                    Send_Coming_Home_file
                  </Label>
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.send_news_amt}
                  onChange={(e) => handleInputChange('send_news_amt', e.target.value)}
                  placeholder="Enter amount"
                  className="w-full"
                  disabled={!formData.send_coming_home_file}
                />
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Input
                  value={formData.send_cominghome_cost}
                  onChange={(e) => handleInputChange('send_cominghome_cost', e.target.value)}
                  placeholder="Enter cost"
                  className="w-full"
                  disabled={!formData.send_coming_home_file}
                />
              </td>
            </tr>

            {/* Has Coming Home */}
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_coming_home"
                    checked={formData.has_coming_home}
                    onCheckedChange={(checked) => handleInputChange('has_coming_home', checked as boolean)}
                  />
                  <Label htmlFor="has_coming_home" className="font-medium">
                    has_coming_home
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Has Coming Home Newsletter</p>
              </td>
              <td className="border border-gray-200 px-4 py-2 bg-gray-50"></td>
              <td className="border border-gray-200 px-4 py-2 bg-gray-50"></td>
            </tr>

            {/* No Branding */}
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no_branding"
                    checked={formData.no_branding}
                    onCheckedChange={(checked) => handleInputChange('no_branding', checked as boolean)}
                  />
                  <Label htmlFor="no_branding" className="font-medium">
                    no_branding
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Don't use photo and logo</p>
              </td>
              <td className="border border-gray-200 px-4 py-2 bg-gray-50"></td>
              <td className="border border-gray-200 px-4 py-2 bg-gray-50"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesTab;
