# Customer Email Templates Integration

## Overview
Successfully integrated the CustomerEmailTemplate API into the frontend, allowing customers to create, manage, and send their own email templates.

## What Was Implemented

### 1. Updated API Service (`src/services/emailService.ts`)
Enhanced the email service with comprehensive API functions:

#### System Templates
- `getSystemTemplates()` - Fetch available system templates
- `getSystemTemplateById(id)` - Get specific system template

#### Customer Templates
- `getCustomerEmailTemplates(filters?)` - List customer templates with optional filters
- `getCustomerEmailTemplate(id)` - Get specific customer template
- `createCustomerEmailTemplate(details)` - Create new template
- `updateCustomerEmailTemplate(id, details)` - Update existing template
- `deleteCustomerEmailTemplate(id)` - Delete template
- `copySystemTemplate(data)` - Copy a system template for customization

#### Attachments
- `getAttachments(emailTemplateId)` - Get template attachments
- `uploadAttachment(emailTemplateId, file)` - Upload attachment
- `deleteAttachment(attachmentId)` - Delete attachment

#### Send Email
- `sendEmail(data)` - Send email to contacts using a template

### 2. New Pages Created

#### `/my-email-templates` (Main List Page)
- **File**: `src/pages/MyEmailTemplates/index.tsx`
- **Features**:
  - View all customer templates in a card grid
  - Search templates by name/subject
  - Quick actions: Edit, Duplicate, Send, Delete
  - Empty state with call-to-action buttons
  - Delete confirmation dialog

#### `/my-email-templates/create` (Create Template)
- **File**: `src/pages/MyEmailTemplates/CreateTemplate.tsx`
- **Features**:
  - Template name and subject input
  - Email type selection (Holiday, Birthday, Newsletter, Custom)
  - Unlayer email editor integration
  - File attachment support
  - Save design as JSON for future editing
  - Auto-save HTML content

#### `/my-email-templates/edit/:id` (Edit Template)
- **File**: Uses `CreateTemplate.tsx` with id parameter
- **Features**:
  - Load existing template data
  - Edit all template fields
  - Manage existing attachments
  - Preview and update design

#### `/my-email-templates/browse` (Browse System Templates)
- **File**: `src/pages/MyEmailTemplates/BrowseTemplates.tsx`
- **Features**:
  - View all available system templates
  - Preview template before copying
  - Copy system template with custom name
  - Categorized by type

### 3. Routes Added (App.tsx)
```typescript
<Route path="my-email-templates" element={<MyEmailTemplates />} />
<Route path="my-email-templates/create" element={<CreateCustomerTemplate />} />
<Route path="my-email-templates/edit/:id" element={<CreateCustomerTemplate />} />
<Route path="my-email-templates/duplicate/:id" element={<CreateCustomerTemplate />} />
<Route path="my-email-templates/browse" element={<BrowseTemplates />} />
<Route path="send-email/:templateId" element={<SendEmail />} />
```

### 4. Navigation Updated
Added "My Email Templates" to the user sidebar navigation with Mail icon.

## TypeScript Interfaces

### CustomerEmailTemplate
```typescript
interface CustomerEmailTemplate {
  email_id?: number;
  company_id?: number;
  rep?: number;
  template?: number; // Reference to system template
  email_type?: number; // 1-13: Holiday ecards, 14: Birthday, 15: Newsletter, 99: Custom
  email_name?: string;
  email_subject?: string;
  email_html?: string;
  html_content?: string;
  design_json?: string | object;
  send_ecard?: boolean;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  attachments?: EmailAttachment[];
}
```

### SystemEmailTemplate
```typescript
interface SystemEmailTemplate {
  id: number;
  name: string;
  type: string;
  html_file: string;
  html_content?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### EmailAttachment
```typescript
interface EmailAttachment {
  id: number;
  email_template: number;
  email_template_name?: string;
  file: string;
  uploaded_at: string;
}
```

## User Workflow

### Creating a Template from Scratch
1. Customer logs in and navigates to "My Email Templates"
2. Clicks "Create Template"
3. Enters template name, subject, and selects email type
4. Designs email using Unlayer editor
5. Optionally adds attachments
6. Clicks "Save Template"
7. Template is saved and can be used to send emails

### Copying a System Template
1. Navigate to "My Email Templates"
2. Click "Browse System Templates"
3. Preview available templates
4. Click "Use Template" on desired template
5. Enter a custom name
6. Template is copied to customer's templates
7. Customer can now edit and customize it

### Sending an Email
1. From template list, click menu (⋮) on a template
2. Select "Send Email"
3. Choose recipients (contacts, partners, all, or custom)
4. Select whether to include attachments
5. Click "Send"
6. Email is sent to selected recipients

## API Endpoints Used

Base URL: `/email/`

### System Templates
- `GET /email/templates` - List system templates
- `GET /email/templates/:id` - Get system template details

### Customer Templates
- `GET /email/customer-templates` - List customer templates
- `GET /email/customer-templates/:id` - Get customer template
- `POST /email/customer-templates` - Create customer template
- `PATCH /email/customer-templates/:id` - Update customer template
- `DELETE /email/customer-templates/:id` - Delete customer template
- `POST /email/customer-templates/copy-template` - Copy system template

### Attachments
- `GET /email/attachments?email_template=:id` - List attachments
- `POST /email/attachments` - Upload attachment
- `DELETE /email/attachments/:id` - Delete attachment

### Send Email
- `POST /email/customer-templates/send` - Send email using template

## Features

### Template Management
- ✅ Create new templates from scratch
- ✅ Copy and customize system templates
- ✅ Edit existing templates
- ✅ Delete templates
- ✅ Search templates
- ✅ View template details

### Email Editor
- ✅ Unlayer drag-and-drop email editor
- ✅ Save design as JSON for editing
- ✅ Export HTML for sending
- ✅ Template preview

### Attachments
- ✅ Upload multiple files
- ✅ View existing attachments
- ✅ Delete attachments
- ✅ Include/exclude attachments when sending

### Email Sending
- ✅ Send to all contacts
- ✅ Send to partners only
- ✅ Send to contacts only
- ✅ Send to custom email list
- ✅ Integration with existing SendEmail page

## Security & Permissions
- All customer templates are automatically filtered by the logged-in user (rep field)
- Customers can only see and manage their own templates
- System templates are read-only for customers
- Only admin users can create/edit system templates

## Next Steps

### Testing
1. Start the backend: `cd /Users/muhammad/Documents/blazing_backend && .venv/bin/python manage.py runserver`
2. Start the frontend: `cd /Users/muhammad/Documents/blazing/blazing_frontend && npm run dev`
3. Login as a customer user
4. Navigate to "My Email Templates" in the sidebar
5. Test creating, editing, and deleting templates
6. Test copying system templates
7. Test sending emails with templates

### Backend Migration
Make sure to run the migration on your backend:
```bash
cd /Users/muhammad/Documents/blazing_backend
.venv/bin/python manage.py migrate email_manager
```

## Technologies Used
- React Query (TanStack Query) for data fetching
- React Router for navigation
- Unlayer Email Editor for template design
- shadcn/ui components for UI
- Lucide React for icons
- Sonner for toast notifications

## Files Modified/Created

### Backend
- `email_manager/models.py` - Updated CustomerEmailTemplate model
- `email_manager/serializers.py` - Already had serializers
- `email_manager/views.py` - Already had views
- `email_manager/migrations/0013_*.py` - New migration

### Frontend
- `src/services/emailService.ts` - Enhanced with complete API
- `src/pages/MyEmailTemplates/index.tsx` - New page
- `src/pages/MyEmailTemplates/CreateTemplate.tsx` - New page
- `src/pages/MyEmailTemplates/BrowseTemplates.tsx` - New page
- `src/App.tsx` - Added routes
- `src/components/app-sidebar.tsx` - Added navigation

## Support
For any issues or questions, please refer to the backend API documentation at `/api/schema/swagger-ui/` or contact the development team.
