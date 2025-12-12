# Troubleshooting: Contacts Not Loading in Send Email Modal

## Quick Diagnosis Steps

### 1. Open Browser Console
Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools

### 2. Open Send Email Modal
Click "Send Email" button → Select a template → Check console

### 3. Look for Debug Output
You should see:
```
=== CONTACTS DEBUG ===
API Response: {data: {...}, status: 200, ...}
Extracted Contacts Count: XX
First Contact Sample: {id: 1, first_name: "John", ...}
Contact Structure: ["id", "first_name", "last_name", "email", ...]
```

### 4. Check Debug Panel (Yellow Box)
In the modal, scroll down to see debug info:
```
🐛 Debug Info:
Loading: ❌ No
Error: ❌ No
Raw Contacts Fetched: 45
After Filtering: 45
Selection Mode: select
...
```

---

## Common Issues & Fixes

### Issue 1: "Raw Contacts Fetched: 0"
**Problem**: API not returning contacts
**Fix**: Check if user has any contacts in database

**Test in browser console**:
```javascript
// Copy and paste this into console
fetch('http://your-api-url/customer/api/contacts?page_size=1000', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(d => console.log('Contacts:', d));
```

### Issue 2: "After Filtering: 0" (but Raw > 0)
**Problem**: All contacts being filtered out
**Possible causes**:
- All contacts have `optout: true`
- All contacts have `send_status: 'dont_send'`

**Fix**: Check a sample contact in debug panel:
```json
{
  "id": 1,
  "first_name": "John",
  "optout": true,        ← Should be false
  "send_status": "send"  ← Should be "send"
}
```

### Issue 3: "API Response Keys: undefined"
**Problem**: API call not executing
**Possible causes**:
- Auth token missing/expired
- API endpoint incorrect
- CORS issues

**Fix**:
1. Check Network tab in DevTools
2. Look for request to `/customer/api/contacts`
3. Check response status (should be 200)

---

## Manual API Test

### Test 1: Check API Endpoint
```bash
# Replace YOUR_TOKEN with actual token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/customer/api/contacts?page_size=1000"
```

Should return:
```json
{
  "count": 45,
  "results": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "customer_type": "contact",
      "optout": false,
      "send_status": "send"
    },
    ...
  ]
}
```

### Test 2: Add Test Contact via API
```bash
curl -X POST http://localhost:8000/customer/api/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "customer_type": "contact",
    "send_status": "send",
    "optout": false
  }'
```

---

## Debug Checklist

- [ ] Browser console shows API request
- [ ] Network tab shows 200 response
- [ ] Console shows "Raw Contacts Fetched: X" where X > 0
- [ ] Console shows "After Filtering: X" where X > 0
- [ ] Yellow debug box visible in modal
- [ ] Sample contact data shows in debug panel
- [ ] Contacts have valid email addresses
- [ ] Contacts have `optout: false`
- [ ] Contacts have `send_status: "send"`

---

## Contact Data Requirements

For contacts to appear, they MUST have:
```json
{
  "id": 123,                    // Required
  "first_name": "John",         // Required
  "last_name": "Doe",           // Required
  "email": "john@example.com",  // Required
  "customer_type": "contact",   // "contact", "partner", or "both"
  "optout": false,              // Must be false
  "send_status": "send"         // Must be "send" (not "dont_send")
}
```

---

## Still Not Working?

### Share This Info:
1. Browser console screenshot
2. Debug panel screenshot (yellow box)
3. Network tab showing `/customer/api/contacts` request/response
4. Sample contact data from database

### Check Backend:
```bash
cd /Users/muhammad/Documents/blazing_backend
.venv/bin/python manage.py shell

# Run in Django shell:
from customers.models import Contact
from accounts.models import User

user = User.objects.first()  # Or get specific user
contacts = Contact.objects.filter(customer=user)
print(f"Total contacts: {contacts.count()}")

# Print first contact
if contacts.exists():
    c = contacts.first()
    print(f"Sample: {c.first_name} {c.last_name} ({c.email})")
    print(f"Type: {c.customer_type}")
    print(f"Optout: {c.optout}")
    print(f"Send Status: {c.send_status}")
```
