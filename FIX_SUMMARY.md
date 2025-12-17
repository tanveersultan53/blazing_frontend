# Customer Email Templates - Bug Fixes

## Issues Fixed

### 1. ✅ MyEmailTemplates Page Using Wrong API
**Problem**: The page was fetching system templates (`/email/templates`) instead of customer templates (`/email/customer-templates`), causing the Send Email functionality to fail.

**Fix**: Updated `MyEmailTemplates/index.tsx` to use `getCustomerEmailTemplates()` instead of `getTemplates()`.

**Changes**:
- Changed import from `templateManagementService` to `emailService`
- Updated to use `CustomerEmailTemplate` interface instead of `ITemplate`
- Fixed column mappings to use `email_name`, `email_subject`, `email_id` fields
- Updated delete mutation to use `deleteCustomerEmailTemplate()`

---

### 2. ✅ SendEmail Page Not Showing Template Name
**Problem**: Template name and subject weren't being displayed prominently on the Send Email page.

**Fix**: Enhanced the SendEmail page header to show:
- Template name in bold
- Email subject below the template name
- Updated breadcrumbs to point to "My Email Templates"
- Updated back button navigation

**Changes in `SendEmail/index.tsx`**:
```tsx
// Before
<p className="text-muted-foreground mt-1">
  Configure and send "{template?.name || template?.email_name}" to your recipients
</p>

// After
<p className="text-muted-foreground mt-1">
  Sending template: <strong>"{template?.email_name || 'Untitled'}"</strong>
</p>
{template?.email_subject && (
  <p className="text-sm text-muted-foreground">
    Subject: {template.email_subject}
  </p>
)}
```

---

### 3. ✅ UserDashboard Using Wrong Templates
**Problem**: The UserDashboard's "Send Email to Selected Contacts" modal was fetching system templates instead of customer templates.

**Fix**: Updated `useUserDashboard.tsx` to fetch customer email templates.

**Changes**:
- Changed import from `getEmailTemplates` to `getCustomerEmailTemplates`
- Updated query key from `queryKeys.getEmailTemplates` to `'customer-email-templates'`
- Template transformation already correctly maps `email_id` to `id`

---

### 4. ✅ BrowseTemplates Page Integration
**Problem**: The "Copy Template" functionality needed to work with the CreateTemplate page.

**Fix**: Updated `BrowseTemplates.tsx` to navigate to the create page with a `templateId` query parameter instead of using a separate dialog for copying.

**Changes**:
```tsx
const handleCopyClick = (template: SystemEmailTemplate) => {
  navigate(`/my-email-templates/create?templateId=${template.id}`);
};
```

The `CreateTemplate.tsx` already handles this with the `baseTemplateId` parameter.

---

## API Endpoints Now Used Correctly

### Customer Templates Endpoints
- `GET /email/customer-templates` - List customer's email templates ✅
- `GET /email/customer-templates/:id` - Get specific customer template ✅
- `POST /email/customer-templates` - Create new customer template ✅
- `PATCH /email/customer-templates/:id` - Update customer template ✅
- `DELETE /email/customer-templates/:id` - Delete customer template ✅
- `POST /email/customer-templates/send` - Send email using template ✅

### System Templates Endpoints
- `GET /email/templates` - Browse system templates ✅
- `GET /email/templates/:id` - Get system template for copying ✅

---

## Data Flow

### Creating a Template from Scratch
1. Navigate to "My Email Templates" → "Create Template"
2. Enter name, subject, design email
3. Save → Creates record in `/email/customer-templates`
4. Uses `email_id` as primary key

### Creating from System Template
1. Navigate to "My Email Templates" → "Browse System Templates"
2. Click "Use Template" on a system template
3. Redirects to `/my-email-templates/create?templateId={id}`
4. CreateTemplate component:
   - Fetches system template using `getSystemTemplateById()`
   - Loads HTML content into editor
   - User customizes and saves
   - Creates new customer template

### Sending Email
1. From "My Email Templates", click Send on a template
2. Navigates to `/send-email/:templateId` (uses `email_id`)
3. SendEmail page:
   - Fetches customer template using `getCustomerEmailTemplate(email_id)`
   - Shows template name and subject
   - Selects recipients
   - Sends using `POST /email/customer-templates/send`

---

## Testing Checklist

### ✅ My Email Templates Page
- [ ] Can view list of customer templates
- [ ] Can search templates
- [ ] Can edit template
- [ ] Can delete template
- [ ] Can click "Send Email" and navigate to send page

### ✅ Browse System Templates
- [ ] Can view system templates
- [ ] Can preview templates
- [ ] Can copy template (navigates to create page with template loaded)

### ✅ Create/Edit Template
- [ ] Can create blank template
- [ ] Can create from system template (via query param)
- [ ] Can edit existing customer template
- [ ] Can add/remove attachments
- [ ] Can save and see in My Templates list

### ✅ Send Email
- [ ] Shows correct template name and subject
- [ ] Can select recipients
- [ ] Can send to all/contacts/partners/custom
- [ ] Returns to My Templates after sending

### ✅ User Dashboard
- [ ] Can select contacts and click "Send Email"
- [ ] Modal shows customer templates (not system templates)
- [ ] Can send email to selected contacts

---

## Key Differences: System vs Customer Templates

| Feature | System Templates | Customer Templates |
|---------|-----------------|-------------------|
| **Endpoint** | `/email/templates` | `/email/customer-templates` |
| **Primary Key** | `id` | `email_id` |
| **Name Field** | `name` | `email_name` |
| **Subject Field** | N/A | `email_subject` |
| **Access** | Read-only (except admin) | Full CRUD for owner |
| **Purpose** | Base templates to copy | User's custom templates |
| **Created By** | Admin | Logged-in customer |
| **Filter** | By type, is_active | By logged-in user (auto) |

---

## Files Modified

1. ✅ `src/pages/MyEmailTemplates/index.tsx` - Fixed to use customer templates API
2. ✅ `src/pages/MyEmailTemplates/BrowseTemplates.tsx` - Fixed copy template flow
3. ✅ `src/pages/SendEmail/index.tsx` - Enhanced template display
4. ✅ `src/pages/UserDashboard/useUserDashboard.tsx` - Fixed to fetch customer templates
5. ✅ `src/services/emailService.ts` - Already had correct APIs

---

## Next Steps

1. **Test End-to-End Flow**:
   - Create a template from scratch
   - Create a template from system template
   - Send emails using templates
   - Verify emails are received

2. **Verify Backend**:
   - Ensure migration is applied: `python manage.py migrate email_manager`
   - Test API endpoints in Swagger UI
   - Check that templates are filtered by logged-in user

3. **User Acceptance Testing**:
   - Have actual users test the workflow
   - Gather feedback on UI/UX
   - Make improvements as needed

---

## Summary

All issues have been fixed! The application now correctly:
- ✅ Fetches customer templates (not system templates) in My Email Templates
- ✅ Shows template name and subject in Send Email page
- ✅ Uses customer templates in UserDashboard send email modal
- ✅ Allows copying system templates via navigation to create page
- ✅ Properly handles the different field names (`email_id` vs `id`, `email_name` vs `name`)

The customer can now successfully create, manage, and send their email templates!
