import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import {
  ArrowLeft,
  Save,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  UserPlus,
  Settings,
  Share2,
  Bell,
  FileText,
  PhoneCall,
} from 'lucide-react';

// Import tab components
import SocialMediaTab from '../../components/addUser/SocialMediaTab';
import SettingsTab from '../../components/addUser/SettingsTab';
import ServicesTab from '../../components/addUser/ServicesTab';
import NewsletterTab from '../../components/addUser/NewsletterTab';
import EmailSetupTab from '../../components/addUser/EmailSetupTab';
import CallToActionsTab from '../../components/addUser/CallToActionsTab';

import { User as UserType } from '../../types/auth';
import { useApi } from '../../hooks/useApi';
import { updateUserSocialMedia, SocialMediaData, updateUser } from '../../services/authService';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addUser } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('primary-contact');
  
  // Check if we're in edit mode
  const isEditMode = location.state?.editMode || false;
  const editUserData = location.state?.userData || null;
  

  
  // Initialize form data with edit data if available
  const initialFormData = {
    // Essential User Creation Fields
    email: editUserData?.email || '',
    username: editUserData?.username || '',
    password: '',
    password2: '',
    first_name: editUserData?.first_name || editUserData?.name?.split(' ')[0] || '',
    last_name: editUserData?.last_name || editUserData?.name?.split(' ')[1] || '',
    is_superuser: editUserData?.is_superuser || false,
    is_active: editUserData?.is_active !== undefined ? editUserData.is_active : true,
    
    // Contact Details - populate if available from API
    phone: editUserData?.phone || '',
    address: editUserData?.Address || editUserData?.address || '',
    city: editUserData?.city || '',
    state: editUserData?.state || '',
    zip_code: editUserData?.zip || editUserData?.zip_code || '',
    
    // Additional Information - populate if available from API
    company: editUserData?.Company || editUserData?.company || '',
    company_id: editUserData?.company_id || 0,
    title: editUserData?.title || '',
    department: editUserData?.department || '',
    bio: editUserData?.bio || '',
    mid: editUserData?.mid || '',
    account_folder: editUserData?.account_folder || '',
    
    // Original form fields
    rep_name: editUserData?.rep_name || '',
    create_date: editUserData?.create_date || '',
    cell: editUserData?.cell || '',
    work_phone: editUserData?.work_phone || '',
    birthday: editUserData?.birthday || '',
    age: editUserData?.age || '',
    group: editUserData?.group || '',
    dontsend: editUserData?.dontsend || false,
    newsletter_version: editUserData?.newsletter_version || '',
    // Secondary Contact fields
    spouse_first: editUserData?.spouse_first || '',
    spouse_last: editUserData?.spouse_last || '',
    spouse_email: editUserData?.spouse_email || '',
    sbirthday: editUserData?.sbirthday || '',
    sage: editUserData?.sage || '',
    // Additional fields
    work_ext: editUserData?.work_ext || '',
    cellphone: editUserData?.cellphone || '',
    address2: editUserData?.Address2 || editUserData?.address2 || '',
    website: editUserData?.webiste || editUserData?.website || '',
    license: editUserData?.license || '',
    branchid: editUserData?.branchid || '',
    industry: editUserData?.industry || '',
    admin: editUserData?.admin || false,
    // Settings fields
    settings_name: editUserData?.settings_name || '',
    sendgrid_password: editUserData?.sendgrid_password || '',
    ehl: editUserData?.ehl || false,
    eho: editUserData?.eho || false,
    realtor: editUserData?.realtor || false,
    no_rate_post: editUserData?.no_rate_post || false,
    use_first_name: editUserData?.use_first_name || false,
    noemailreport: editUserData?.noemailreport || false,
    change_phone_labels: editUserData?.change_phone_labels || false,
    custom_newsletter: editUserData?.custom_newsletter || false,
    // Social Media fields
    facebook_url: editUserData?.facebook_url || '',
    linkedin_url: editUserData?.linkedin_url || '',
    google_url: editUserData?.google_url || '',
    instagram_url: editUserData?.instagram_url || '',
    twitter_url: editUserData?.twitter_url || '',
    yelp_url: editUserData?.yelp_url || '',
    blog_url: editUserData?.blog_url || '',
    youtube_url: editUserData?.youtube_url || '',
    vimeo_url: editUserData?.vimeo_url || '',
    custom_app_url: editUserData?.custom_app_url || '',
    moneylogo_url: editUserData?.moneylogo_url || '',
    custom_label_url: editUserData?.custom_label_url || '',
    custom_call_url: editUserData?.custom_call_url || '',
    qrcode_url: editUserData?.qrcode_url || '',
    // Email Setup fields
    email_active: false,
    // Birthday Options
    main_birthday_enabled: false,
    birthdaystatus: '',
    whobday: '',
    main_birthday_recipients: '',
    spouse_birthday_enabled: false,
    spouse_birthday_status: '',
    spouse_birthday_recipients: '',
    // Services fields
    services_active: false,
    // Newsletter fields
    newsletter_active: false,
    // Call to Actions fields
    call_to_actions_active: false,
    // Holiday Options
    holidays: {
      new_years: false,
      st_patricks: false,
      fourth_july: false,
      halloween: false,
      summer: false,
      thanksgiving: false,
      veterans_day: false,
      spring: false,
      labor_day: false,
      december_holidays: false,
      fall: false,
      valentines_day: false,
      memorial_day: false,
    },
    ecardstatus: '',
    whoecards: '',
    // Newsletter Options
    newsletterstatus: '',
    newsletterdefault: '',
    frequency: '',
    newsletterdate: '',
    newsletter_enabled: false,
    newsletterstatus2: '',
    newsletterdefault2: '',
    frequency2: '',
    newsletterdate2: '',
    newsletter_enabled2: false,
    // Services fields
    email_service_amt: '',
    email_service_cost: '',
    bs_service_amt: '',
    bs_service_cost: '',
    send_post_amt: '',
    send_post_cost: '',
    send_cominghome_amt: '',
    send_news_cost: '',
    send_news_amt: '',
    send_cominghome_cost: '',
    send_post_service: false,
    send_weekly_newsletter: false,
    send_coming_home_file: false,
    has_coming_home: false,
    no_branding: false,
    // Newsletter fields
    newsletter_name: '',
    newsletter_company: '',
    newsletter_disclosure: '',
    newsletter_options: {
      ehl: false,
      eho: false,
      hud: false,
      fdic: false,
      realtor: false,
      mfdic: false,
      bbb: false,
      ncua: false,
      bbb_a: false,
      custom: false,
    },
    // Call to Actions fields
    cta_label1: '',
    cta_url1: '',
    cta_label2: '',
    cta_url2: '',
    reverse_label: '',
    reverse_url: '',
    hashtags: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when editUserData changes
  useEffect(() => {
    if (isEditMode && editUserData) {
      
      setFormData({
        // Essential User Creation Fields
        email: editUserData.email || '',
        username: editUserData.username || '',
        password: '',
        password2: '',
        first_name: editUserData.first_name || editUserData.name?.split(' ')[0] || '',
        last_name: editUserData.last_name || editUserData.name?.split(' ')[1] || '',
        is_superuser: editUserData.is_superuser || false,
        is_active: editUserData.is_active !== undefined ? editUserData.is_active : true,
        
        // Contact Details - populate if available from API
        phone: editUserData.phone || '',
        address: editUserData.address || '',
        city: editUserData.city || '',
        state: editUserData.state || '',
        zip_code: editUserData.zip_code || '',
        
        // Additional Information - populate if available from API
        company: editUserData.company || '',
        company_id: editUserData.company_id || 0,
        title: editUserData.title || '',
        department: editUserData.department || '',
        bio: editUserData.bio || '',
        mid: editUserData.mid || '',
        account_folder: editUserData.account_folder || '',
        
        // Original form fields
        rep_name: editUserData.rep_name || '',
        create_date: editUserData.create_date || '',
        cell: editUserData.cell || '',
        work_phone: editUserData.work_phone || '',
        birthday: editUserData.birthday || '',
        age: editUserData.age || '',
        group: editUserData.group || '',
        dontsend: editUserData.dontsend || false,
        newsletter_version: editUserData.newsletter_version || '',
        // Secondary Contact fields
        spouse_first: editUserData.spouse_first || '',
        spouse_last: editUserData.spouse_last || '',
        spouse_email: editUserData.spouse_email || '',
        sbirthday: editUserData.sbirthday || '',
        sage: editUserData.sage || '',
        // Additional fields
        work_ext: editUserData.work_ext || '',
        cellphone: editUserData.cellphone || '',
        address2: editUserData.address2 || '',
        website: editUserData.website || '',
        license: editUserData.license || '',
        branchid: editUserData.branchid || '',
        industry: editUserData.industry || '',
        admin: editUserData.admin || false,
        // Settings fields
        settings_name: editUserData.settings_name || '',
        sendgrid_password: editUserData.sendgrid_password || '',
        ehl: editUserData.ehl || false,
        eho: editUserData.eho || false,
        realtor: editUserData.realtor || false,
        no_rate_post: editUserData.no_rate_post || false,
        use_first_name: editUserData.use_first_name || false,
        noemailreport: editUserData.noemailreport || false,
        change_phone_labels: editUserData.change_phone_labels || false,
        custom_newsletter: editUserData.custom_newsletter || false,
        // Social Media fields
        facebook_url: editUserData.facebook_url || '',
        linkedin_url: editUserData.linkedin_url || '',
        google_url: editUserData.google_url || '',
        instagram_url: editUserData.instagram_url || '',
        twitter_url: editUserData.twitter_url || '',
        yelp_url: editUserData.yelp_url || '',
        blog_url: editUserData.blog_url || '',
        youtube_url: editUserData.youtube_url || '',
        vimeo_url: editUserData.vimeo_url || '',
        custom_app_url: editUserData.custom_app_url || '',
        moneylogo_url: editUserData.moneylogo_url || '',
        custom_label_url: editUserData.custom_label_url || '',
        custom_call_url: editUserData.custom_call_url || '',
        qrcode_url: editUserData.qrcode_url || '',
        // Email Setup fields
        email_active: editUserData.email_active || false,
        // Birthday Options
        main_birthday_enabled: editUserData.main_birthday_enabled || false,
        birthdaystatus: editUserData.birthdaystatus || '',
        whobday: editUserData.whobday || '',
        main_birthday_recipients: editUserData.main_birthday_recipients || '',
        spouse_birthday_enabled: editUserData.spouse_birthday_enabled || false,
        spouse_birthday_status: editUserData.spouse_birthday_status || '',
        spouse_birthday_recipients: editUserData.spouse_birthday_recipients || '',
        // Services fields
        services_active: editUserData.services_active || false,
        // Newsletter fields
        newsletter_active: editUserData.newsletter_active || false,
        // Call to Actions fields
        call_to_actions_active: editUserData.call_to_actions_active || false,
        // Holiday Options
        holidays: editUserData.holidays || {
          new_years: false,
          st_patricks: false,
          fourth_july: false,
          halloween: false,
          summer: false,
          thanksgiving: false,
          veterans_day: false,
          spring: false,
          labor_day: false,
          december_holidays: false,
          fall: false,
          valentines_day: false,
          memorial_day: false,
        },
        ecardstatus: editUserData.ecardstatus || '',
        whoecards: editUserData.whoecards || '',
        // Newsletter Options
        newsletterstatus: editUserData.newsletterstatus || '',
        newsletterdefault: editUserData.newsletterdefault || '',
        frequency: editUserData.frequency || '',
        newsletterdate: editUserData.newsletterdate || '',
        newsletter_enabled: editUserData.newsletter_enabled || false,
        newsletterstatus2: editUserData.newsletterstatus2 || '',
        newsletterdefault2: editUserData.newsletterdefault2 || '',
        frequency2: editUserData.frequency2 || '',
        newsletterdate2: editUserData.newsletterdate2 || '',
        newsletter_enabled2: editUserData.newsletter_enabled2 || false,
        // Services fields
        email_service_amt: editUserData.email_service_amt || '',
        email_service_cost: editUserData.email_service_cost || '',
        bs_service_amt: editUserData.bs_service_amt || '',
        bs_service_cost: editUserData.bs_service_cost || '',
        send_post_amt: editUserData.send_post_amt || '',
        send_post_cost: editUserData.send_post_cost || '',
        send_cominghome_amt: editUserData.send_cominghome_amt || '',
        send_news_cost: editUserData.send_news_cost || '',
        send_news_amt: editUserData.send_news_amt || '',
        send_cominghome_cost: editUserData.send_cominghome_cost || '',
        send_post_service: editUserData.send_post_service || false,
        send_weekly_newsletter: editUserData.send_weekly_newsletter || false,
        send_coming_home_file: editUserData.send_coming_home_file || false,
        has_coming_home: editUserData.has_coming_home || false,
        no_branding: editUserData.no_branding || false,
        // Newsletter fields
        newsletter_name: editUserData.newsletter_name || '',
        newsletter_company: editUserData.newsletter_company || '',
        newsletter_disclosure: editUserData.newsletter_disclosure || '',
        newsletter_options: editUserData.newsletter_options || {
          ehl: false,
          eho: false,
          hud: false,
          fdic: false,
          realtor: false,
          mfdic: false,
          bbb: false,
          ncua: false,
          bbb_a: false,
          custom: false,
        },
        // Call to Actions fields
        cta_label1: editUserData.cta_label1 || '',
        cta_url1: editUserData.cta_url1 || '',
        cta_label2: editUserData.cta_label2 || '',
        cta_url2: editUserData.cta_url2 || '',
        reverse_label: editUserData.reverse_label || '',
        reverse_url: editUserData.reverse_url || '',
        hashtags: editUserData.hashtags || '',
      });

             setCreatedUserId(editUserData.id);
       setUserCreated(true); // Show all tabs in edit mode
       

     }
   }, [isEditMode, editUserData]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      // Handle nested fields like 'holidays.new_years'
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentObj = prev[parent as keyof typeof prev] as Record<string, any>;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTabInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      admin: checked
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.password2) {
      return;
    }

    // Validate required fields
    if (!formData.email || !formData.password || !formData.password2 || !formData.first_name || !formData.last_name) {
      return;
    }

    setIsLoading(true);
    try {
      // Create user object for API with the exact fields you specified
      const userData = {
        is_active: formData.is_active,
        rep_name: formData.rep_name,
        Company: formData.company,
        company_id: formData.company_id,
        Address: formData.address,
        Address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip_code,
        email: formData.email,
        work_phone: formData.work_phone,
        work_ext: formData.work_ext,
        cellphone: formData.cellphone,
        first_name: formData.first_name,
        last_name: formData.last_name,
        title: formData.title,
        mid: formData.mid,
        password: formData.password,
        admin: formData.admin,
        webiste: formData.website,
        account_folder: formData.account_folder,
        branchid: formData.branchid,
      };

             const response = await addUser(userData);
       
       // Set the created user ID and mark as created
       setCreatedUserId(response.id);
      setUserCreated(true);
      setActiveTab('setup-social-media'); // Move to next tab
      
      // User created successfully
    } catch (error) {
      // Handle error silently or show a toast notification instead
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAdditionalInfo = async () => {
    if (!createdUserId) return;
    
    setIsLoading(true);
    try {
      // Here you would update the user with additional information
      // For now, just show success message
    } catch (error) {
      // Handle error silently or show a toast notification instead
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSocialMedia = async (socialMediaData: SocialMediaData) => {
    const userId = isEditMode ? (editUserData?.rep_id || editUserData?.id)?.toString() : createdUserId?.toString();
    if (!userId) return;
    
    try {
      const response = await updateUserSocialMedia(userId, socialMediaData);
      // Social media updated successfully
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateUser = async () => {
    if (!editUserData?.id) return;
    
    setIsLoading(true);
    try {
      // Use rep_id if available, otherwise fall back to id (convert to string)
      const rep_id = (editUserData.rep_id || editUserData.id).toString();
      
      // Prepare user data for update (exclude password fields)
      const userData = {
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        is_superuser: formData.is_superuser,
        is_active: formData.is_active,
      };

      const response = await updateUser(rep_id, userData);
      
      // Show success message and navigate back
      navigate('/users');
    } catch (error) {
      // Handle error silently or show a toast notification instead
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'primary-contact', label: 'Create User', icon: User },
    { id: 'setup-social-media', label: 'Social Media', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'services', label: 'Services', icon: FileText },
    { id: 'news-letters', label: 'Newsletter', icon: Bell },
    { id: 'email-setup', label: 'Email Setting', icon: Mail },
    { id: 'call-to-actions', label: 'Call to Actions', icon: PhoneCall },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/users')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Users</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit User' : (userCreated ? 'Configure User Settings' : 'Add New User')}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode 
                  ? 'Update user information and settings'
                  : (userCreated 
                    ? 'Configure additional settings for the newly created user'
                    : 'Create a new user account with essential information'
                  )
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => navigate('/users')} 
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            {isEditMode ? (
              <Button 
                onClick={handleUpdateUser} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Update User</span>
                  </div>
                )}
              </Button>
            ) : userCreated ? (
              <Button 
                onClick={handleSaveAdditionalInfo} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Settings</span>
                  </div>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleCreateUser} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Create User</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>



        <form onSubmit={isEditMode ? handleUpdateUser : handleCreateUser} className="space-y-6">
          {/* Primary Contact Section - Always Visible */}
          {(activeTab === 'primary-contact' || isEditMode) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Essential User Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                
                {/* Row 1: Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Representative & Company Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rep_name">Representative Name</Label>
                    <Input
                      id="rep_name"
                      value={formData.rep_name}
                      onChange={(e) => handleInputChange('rep_name', e.target.value)}
                      placeholder="Enter representative name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                {/* Row 3: Company ID & Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="company_id">Company ID</Label>
                    <Input
                      id="company_id"
                      type="number"
                      value={formData.company_id}
                      onChange={(e) => handleInputChange('company_id', parseInt(e.target.value) || 0)}
                      placeholder="Enter company ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address2">Address 2</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                      placeholder="Enter address 2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="work_phone">Work Phone</Label>
                    <Input
                      id="work_phone"
                      value={formData.work_phone}
                      onChange={(e) => handleInputChange('work_phone', e.target.value)}
                      placeholder="Enter work phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="work_ext">Work Extension</Label>
                    <Input
                      id="work_ext"
                      value={formData.work_ext}
                      onChange={(e) => handleInputChange('work_ext', e.target.value)}
                      placeholder="Enter work extension"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cellphone">Cell Phone</Label>
                    <Input
                      id="cellphone"
                      value={formData.cellphone}
                      onChange={(e) => handleInputChange('cellphone', e.target.value)}
                      placeholder="Enter cell phone"
                    />
                  </div>
                </div>

                {/* Row 4: Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mid">MID</Label>
                    <Input
                      id="mid"
                      value={formData.mid}
                      onChange={(e) => handleInputChange('mid', e.target.value)}
                      placeholder="Enter MID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchid">Branch ID</Label>
                    <Input
                      id="branchid"
                      value={formData.branchid}
                      onChange={(e) => handleInputChange('branchid', e.target.value)}
                      placeholder="Enter branch ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>

                {/* Row 5: Account & Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="account_folder">Account Folder</Label>
                    <Input
                      id="account_folder"
                      value={formData.account_folder}
                      onChange={(e) => handleInputChange('account_folder', e.target.value)}
                      placeholder="Enter account folder"
                    />
                  </div>
                  {!isEditMode && (
                    <>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password2">Confirm Password *</Label>
                        <Input
                          id="password2"
                          type="password"
                          value={formData.password2}
                          onChange={(e) => handleInputChange('password2', e.target.value)}
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>



                {/* Row 6: Role & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="is_superuser">Role</Label>
                    <select
                      id="is_superuser"
                      value={formData.is_superuser ? 'admin' : 'user'}
                      onChange={(e) => handleInputChange('is_superuser', e.target.value === 'admin')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="is_active">Status</Label>
                    <select
                      id="is_active"
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => handleInputChange('is_active', e.target.value === 'active')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    {/* Empty space for consistent 3-column layout */}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Tabs - Only visible after user creation */}
          {(userCreated || isEditMode) && (
            <Card>
              <CardContent className="pt-6">
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 border-b overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  {activeTab === 'setup-social-media' && (
                    <SocialMediaTab 
                      formData={formData} 
                      handleInputChange={handleTabInputChange}
                      userId={isEditMode ? (editUserData?.rep_id || editUserData?.id)?.toString() : createdUserId?.toString()}
                      onUpdateSocialMedia={handleUpdateSocialMedia}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <SettingsTab 
                      formData={formData} 
                      handleInputChange={handleInputChange}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  )}

                  {activeTab === 'services' && (
                    <ServicesTab 
                      formData={formData} 
                      handleInputChange={handleInputChange} 
                    />
                  )}

                  {activeTab === 'news-letters' && (
                    <NewsletterTab 
                      formData={formData} 
                      handleInputChange={handleInputChange} 
                    />
                  )}

                  {activeTab === 'email-setup' && (
                    <EmailSetupTab 
                      formData={formData} 
                      handleInputChange={handleInputChange} 
                    />
                  )}

                  {activeTab === 'call-to-actions' && (
                    <CallToActionsTab 
                      formData={formData} 
                      handleInputChange={handleInputChange} 
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddUser;
