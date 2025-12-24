# Quick Email Setup Guide - 5 Minutes

## Get Email Notifications Working Now!

### Step 1: Create EmailJS Account (2 minutes)
1. Go to: https://www.emailjs.com/
2. Click **"Sign Up"** (top right)
3. Sign up with your email (free account)

### Step 2: Add Email Service (1 minute)
1. After logging in, click **"Email Services"** in left sidebar
2. Click **"Add New Service"**
3. Choose **"Outlook.com"** (or Gmail if you prefer)
4. Click **"Connect Account"**
5. Sign in with your Outlook account (tax-mind@outlook.com)
6. Click **"Create Service"**
7. **Copy the Service ID** (you'll need this!)

### Step 3: Create Email Template (1 minute)
1. Click **"Email Templates"** in left sidebar
2. Click **"Create New Template"**
3. Set these settings:
   - **Template Name:** Signup Notification
   - **Subject:** `New TaxMind AI Signup - {{user_email}}`
   - **To Email:** `tax-mind@outlook.com`
   - **From Name:** TaxMind AI

4. **Email Content** (paste this):
```
🚨 NEW SIGNUP DETECTED 🚨

A new user has signed up for TaxMind AI.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email: {{user_email}}
Name: {{user_name}}
Account Type: {{account_type}}
Signup Date: {{signup_date}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Browser: {{user_agent}}
Referrer: {{referrer}}
Timestamp: {{timestamp}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Review this signup for potential bot activity.

TaxMind AI Security System
```

5. Click **"Save"**
6. **Copy the Template ID** (you'll need this!)

### Step 4: Get Your Public Key (30 seconds)
1. Click **"Account"** → **"General"** in left sidebar
2. Find **"Public Key"** in API Keys section
3. **Copy the Public Key** (you'll need this!)

### Step 5: Update Your Code (30 seconds)
1. Open `email-config.js` in your project
2. Replace these three values:

```javascript
const EmailConfig = {
    publicKey: 'PASTE_YOUR_PUBLIC_KEY_HERE',
    serviceId: 'PASTE_YOUR_SERVICE_ID_HERE',
    templateId: 'PASTE_YOUR_TEMPLATE_ID_HERE',
    notificationEmail: 'tax-mind@outlook.com',
    enabled: true  // ← Change this to true!
};
```

3. Save the file
4. Upload to your site

### Done! ✅

Now every time someone signs up, you'll automatically receive an email at **tax-mind@outlook.com**!

---

## Testing

1. Test by creating a test account on your site
2. Check your email at tax-mind@outlook.com
3. You should receive the notification email within seconds!

---

## Troubleshooting

**Email not sending?**
- Check browser console (F12) for errors
- Verify all three IDs are correct in email-config.js
- Make sure `enabled: true` in email-config.js
- Check EmailJS dashboard for any error messages

**Need help?**
- EmailJS Docs: https://www.emailjs.com/docs/
- Check the full guide: EMAIL_SETUP_INSTRUCTIONS.md

---

**Total Setup Time: ~5 minutes** ⏱️





