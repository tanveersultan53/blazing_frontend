import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Select } from '../ui/select';

interface EmailSetupTabProps {
  formData: {
    email_active: boolean;
    // Birthday Options
    main_birthday_enabled: boolean;
    birthdaystatus: string;
    whobday: string;
    main_birthday_recipients: string;
    spouse_birthday_enabled: boolean;
    spouse_birthday_status: string;
    spouse_birthday_recipients: string;
    // Holiday Options
    holidays: {
      new_years: boolean;
      st_patricks: boolean;
      fourth_july: boolean;
      halloween: boolean;
      summer: boolean;
      thanksgiving: boolean;
      veterans_day: boolean;
      spring: boolean;
      labor_day: boolean;
      december_holidays: boolean;
      fall: boolean;
      valentines_day: boolean;
      memorial_day: boolean;
    };
    ecardstatus: string;
    whoecards: string;
    // Newsletter Options
    newsletterstatus: string;
    newsletterdefault: string;
    frequency: string;
    newsletterdate: string;
    newsletter_enabled: boolean;
    newsletterstatus2: string;
    newsletterdefault2: string;
    frequency2: string;
    newsletterdate2: string;
    newsletter_enabled2: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

const EmailSetupTab: React.FC<EmailSetupTabProps> = ({ formData, handleInputChange }) => {
  const holidays = [
    { key: 'new_years', label: 'New Years' },
    { key: 'st_patricks', label: "St. Patrick's Day" },
    { key: 'fourth_july', label: '4th of July' },
    { key: 'halloween', label: 'Halloween' },
    { key: 'summer', label: 'Summer' },
    { key: 'thanksgiving', label: 'Thanksgiving' },
    { key: 'veterans_day', label: "Veteran's Day" },
    { key: 'spring', label: 'Spring' },
    { key: 'labor_day', label: 'Labor Day' },
    { key: 'december_holidays', label: 'December Holidays' },
    { key: 'fall', label: 'Fall' },
    { key: 'valentines_day', label: "Valentine's Day" },
    { key: 'memorial_day', label: 'Memorial Day' },
  ];

  const handleHolidayChange = (holidayKey: string, checked: boolean) => {
    handleInputChange(`holidays.${holidayKey}`, checked);
  };

  const setAllHolidays = () => {
    holidays.forEach(holiday => {
      handleInputChange(`holidays.${holiday.key}`, true);
    });
  };

  const setNoneHolidays = () => {
    holidays.forEach(holiday => {
      handleInputChange(`holidays.${holiday.key}`, false);
    });
  };

  return (
    <div className="space-y-8">
      {/* Active Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="email_active"
          checked={formData.email_active}
          onCheckedChange={(checked) => handleInputChange('email_active', checked as boolean)}
        />
        <Label htmlFor="email_active" className="text-sm font-medium">
          Active
        </Label>
      </div>

      {/* Birthday Options */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Birthday Options</h3>
        
        {/* Main Birthday */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="main_birthday_enabled"
              checked={formData.main_birthday_enabled}
              onCheckedChange={(checked) => handleInputChange('main_birthday_enabled', checked as boolean)}
            />
            <Label htmlFor="main_birthday_enabled" className="text-sm font-medium">
              Main Birthday
            </Label>
          </div>
          
          {formData.main_birthday_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="birthdaystatus">Send Status</Label>
                <Select 
                  value={formData.birthdaystatus} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('birthdaystatus', e.target.value)}
                  placeholder="Select status"
                >
                  <option value="send">Send</option>
                  <option value="dont_send">Don't Send</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whobday">Recipients</Label>
                <Select 
                  value={formData.whobday} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('whobday', e.target.value)}
                  placeholder="Select recipients"
                >
                  <option value="both">Both</option>
                  <option value="contacts_only">Contacts Only</option>
                  <option value="partners_only">Partners Only</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="main_birthday_recipients">Recipients</Label>
                <Input
                  id="main_birthday_recipients"
                  value={formData.main_birthday_recipients}
                  onChange={(e) => handleInputChange('main_birthday_recipients', e.target.value)}
                  placeholder="Enter recipients"
                />
              </div>
            </div>
          )}
        </div>

        {/* Spouse Birthday */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="spouse_birthday_enabled"
              checked={formData.spouse_birthday_enabled}
              onCheckedChange={(checked) => handleInputChange('spouse_birthday_enabled', checked as boolean)}
            />
            <Label htmlFor="spouse_birthday_enabled" className="text-sm font-medium">
              Spouse Birthday
            </Label>
          </div>
          
          {formData.spouse_birthday_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="spouse_birthday_status">Send Status</Label>
                <Input
                  id="spouse_birthday_status"
                  value={formData.spouse_birthday_status}
                  onChange={(e) => handleInputChange('spouse_birthday_status', e.target.value)}
                  placeholder="Enter send status"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="spouse_birthday_recipients">Recipients</Label>
                <Input
                  id="spouse_birthday_recipients"
                  value={formData.spouse_birthday_recipients}
                  onChange={(e) => handleInputChange('spouse_birthday_recipients', e.target.value)}
                  placeholder="Enter recipients"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Holiday Options */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Holiday Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {holidays.map((holiday) => (
            <div key={holiday.key} className="flex items-center space-x-2">
              <Checkbox
                id={holiday.key}
                checked={formData.holidays[holiday.key as keyof typeof formData.holidays]}
                onCheckedChange={(checked) => handleHolidayChange(holiday.key, checked as boolean)}
              />
              <Label htmlFor={holiday.key} className="text-sm">
                {holiday.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ecardstatus">Send Status</Label>
            <Input
              id="ecardstatus"
              value={formData.ecardstatus}
              onChange={(e) => handleInputChange('ecardstatus', e.target.value)}
              placeholder="Enter send status"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whoecards">Recipients</Label>
            <Input
              id="whoecards"
              value={formData.whoecards}
              onChange={(e) => handleInputChange('whoecards', e.target.value)}
              placeholder="Enter recipients"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={setAllHolidays}>
            Set All
          </Button>
          <Button type="button" variant="outline" onClick={setNoneHolidays}>
            Set None
          </Button>
        </div>
      </div>

      {/* Newsletter Options */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Newsletter Options</h3>
        
        {/* Contacts Row */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Contacts</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newsletterstatus">Send Status</Label>
              <Input
                id="newsletterstatus"
                value={formData.newsletterstatus}
                onChange={(e) => handleInputChange('newsletterstatus', e.target.value)}
                placeholder="Enter send status"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newsletterdefault">Default</Label>
              <Select 
                value={formData.newsletterdefault} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('newsletterdefault', e.target.value)}
                placeholder="Select default"
              >
                <option value="long_version">Long Version</option>
                <option value="short_version">Short Version</option>
                <option value="none">None</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={formData.frequency} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('frequency', e.target.value)}
                placeholder="Select frequency"
              >
                <option value="weekly">Weekly</option>
                <option value="every_2_weeks">Every 2 weeks</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="newsletterdate">Send Next Date</Label>
                <Checkbox
                  id="newsletter_enabled"
                  checked={formData.newsletter_enabled}
                  onCheckedChange={(checked) => handleInputChange('newsletter_enabled', checked as boolean)}
                />
              </div>
              <Input
                id="newsletterdate"
                type="date"
                value={formData.newsletterdate}
                onChange={(e) => handleInputChange('newsletterdate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Partners Row */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Partners</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newsletterstatus2">Send Status</Label>
              <Input
                id="newsletterstatus2"
                value={formData.newsletterstatus2}
                onChange={(e) => handleInputChange('newsletterstatus2', e.target.value)}
                placeholder="Enter send status"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newsletterdefault2">Default</Label>
              <Select 
                value={formData.newsletterdefault2} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('newsletterdefault2', e.target.value)}
                placeholder="Select default"
              >
                <option value="long_version">Long Version</option>
                <option value="short_version">Short Version</option>
                <option value="none">None</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency2">Frequency</Label>
              <Select 
                value={formData.frequency2} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('frequency2', e.target.value)}
                placeholder="Select frequency"
              >
                <option value="weekly">Weekly</option>
                <option value="every_2_weeks">Every 2 weeks</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="newsletterdate2">Send Next Date</Label>
                <Checkbox
                  id="newsletter_enabled2"
                  checked={formData.newsletter_enabled2}
                  onCheckedChange={(checked) => handleInputChange('newsletter_enabled2', checked as boolean)}
                />
              </div>
              <Input
                id="newsletterdate2"
                type="date"
                value={formData.newsletterdate2}
                onChange={(e) => handleInputChange('newsletterdate2', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSetupTab;
