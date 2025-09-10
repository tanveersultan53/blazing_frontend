export interface IUserDetails {
    id: number
    socials: Socials
    messaging: Messaging
    compliance: Compliance
    branding: Branding
    autooptions: Autooptions
    preferences: Preferences
    password: any
    is_superuser: boolean
    is_staff: boolean
    is_active: boolean
    date_joined: string
    rep_id: string
    rep_name: string
    company: string
    company_id: number
    address: string
    address2: string
    city: string
    state: string
    zip_code: string
    email: string
    work_phone: string
    work_ext: string
    cellphone: string
    first_name: string
    last_name: string
    title: string
    mid: string
    website: string
    account_folder: any
    branch_id: string
    groups: any[]
    user_permissions: any[]
    personal_licence?: string
  }
  
  export interface Socials {
    id: number
    facebook: any
    linkedin: any
    twitter: any
    instagram: any
    youtube: any
    blogr: any
    google: any
    yelp: any
    vimeo: any
    moneyapp: any
    socialapp: any
    customapp: any
  }
  
  export interface Messaging {
    id: number
    use_first_name: any
    change_phone_label: any
    no_emal_report: any
    last_sendgrid_download: any
  }
  
  export interface Compliance {
    id: number
    bbb: any
    bbba: any
    EHL: any
    EHO: any
    fdic: any
    ncua: any
    realtor: any
    hud: any
    industry: any
    no_rate_post: any
    custom: any
  }
  
  export interface Branding {
    id: number
    companylogo: any
    photo: any
    logo: any
    qrcode: any
    personaltext: any
    disclosure: any
    hlogo: any
    wlogo: any
    hphoto: any
    wphoto: any
    custom: any
  }
  
  export interface Autooptions {
    birthday: boolean
    spouse_birthday: boolean
    birthday_status: any
    whobday: any
    ecard_status: any
    whoecards: any
    newyears: boolean
    stpatrick: boolean
    july4: boolean
    halloween: boolean
    summer: boolean
    thanksgiving: boolean
    veteransday: boolean
    spring: boolean
    laborday: boolean
    december: boolean
    fall: boolean
    valentine: boolean
    memorialday: boolean
    newsletter_status: any
    newsletter_default: any
    frequency: any
    newsletter_date: any
    newsletter_status2: any
    newsletter_default2: any
    frequency2: any
    newsletter_date2: any
    autooptionscol: any
  }
  
  export interface Preferences {
    authentication: boolean
    authmode: any
    domain: any
    mailserver: any
    password: any
    port: any
    readsendgrid: any
    smtptimeout: any
    usernameinsubject: any
    username: any
    usedeargreeting: boolean
  }
  
  export interface ISocials {
    id: number
    facebook: any
    linkedin: any
    twitter: any
    instagram: any
    youtube: any
    blogr: any
    google: any
    yelp: any
    vimeo: any
    moneyapp: any
    socialapp: any
    customapp: any
  }
  
  export interface INewsletterInfo {
    id:           number;
    bbb:          boolean;
    bbba:         boolean;
    EHL:          boolean;
    EHO:          boolean;
    fdic:         boolean;
    ncua:         boolean;
    realtor:      boolean;
    hud:          boolean;
    industry:     number;
    no_rate_post: boolean;
    custom:       boolean;
    company?:      string;
    discloure?:    string;
}

export interface ICallToAction {
    cta_label1:    string;
    cta_url1:      string;
    cta_label2:    string;
    cta_url2:      string;
    reverse_label: string;
    cta_url3:      string;
    hashtags:      string;
}
