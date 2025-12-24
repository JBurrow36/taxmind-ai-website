# Email Notification Setup Instructions

This guide will help you set up email notifications so that every time someone signs up, you'll receive an email at **tax-mind@outlook.com** to monitor for bots and suspicious activity.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. The free plan includes 200 emails per month, which should be plenty for monitoring signups

## Step 2: Add Email Service

1. After logging in, go to **Email Services** in the left sidebar
2. Click **Add New Service**
3. Choose **Outlook.com** (or Gmail if you prefer)
4. Follow the connection instructions:
   - For Outlook.com: You'll need to authorize EmailJS to access your Outlook account
   - Click "Connect Account" and sign in with your Outlook credentials
5. Give your service a name (e.g., "TaxMind Notifications")
6. Copy the **Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to **Email Templates** in the left sidebar
2. Click **Create New Template**
3. Set up the template as follows:

### Template Settings:
- **Template Name**: Signup Notification
- **Subject**: `New TaxMind AI Signup - {{user_email}}`
- **To Email**: `tax-mind@outlook.com` (or your monitoring email)
- **From Name**: TaxMind AI
- **From Email**: Your EmailJS service email

### Email Content:

```
🚨 NEW SIGNUP DETECTED 🚨

A new user has signed up for TaxMind AI. Please review this signup to ensure it's legitimate and not a bot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email Address: {{user_email}}
Full Name: {{user_name}}
Account Type: {{account_type}}
Signup Date: {{signup_date}}
Signup Time: {{timestamp}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Browser: {{user_agent}}
IP Address: {{user_ip}}
Referrer: {{referrer}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ACTION REQUIRED: Review this signup for potential bot activity or suspicious behavior.

If this looks suspicious, you may want to:
- Check the IP address for known bot networks
- Verify the email domain
- Review the signup pattern (time of day, frequency, etc.)

TaxMind AI Security System
```

4. Click **Save**
5. Copy the **Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to **Account** → **General** in the left sidebar
2. Find your **Public Key** in the API Keys section
3. Copy the Public Key (you'll need this later)

## Step 5: Configure Your Website

1. Open the file `email-config.js` in your project
2. Replace the placeholder values with your actual credentials:

```javascript
const EmailConfig = {
    // Paste your Public Key here
    publicKey: 'YOUR_ACTUAL_PUBLIC_KEY_HERE',
    
    // Paste your Service ID here
    serviceId: 'YOUR_ACTUAL_SERVICE_ID_HERE',
    
    // Paste your Template ID here
    templateId: 'YOUR_ACTUAL_TEMPLATE_ID_HERE',
    
    // Recipient email (already set to tax-mind@outlook.com)
    notificationEmail: 'tax-mind@outlook.com',
    
    // IMPORTANT: Set this to true to enable notifications
    enabled: true
};
```

3. Save the file

## Step 6: Test the Setup

1. Open your website in a browser
2. Go to the signup page
3. Create a test account with a real email address
4. Check your email at **tax-mind@outlook.com**
5. You should receive a notification email with the signup details

## Troubleshooting

### Email not sending?
- Check browser console (F12) for error messages
- Verify all three IDs (Public Key, Service ID, Template ID) are correct
- Make sure `enabled: true` in email-config.js
- Check that your EmailJS service is properly connected
- Verify your EmailJS account hasn't exceeded the free tier limit

### EmailJS not loading?
- Check your internet connection
- Verify the CDN link is accessible
- Check browser console for script loading errors

### Template variables not working?
- Make sure variable names match exactly: `{{user_email}}`, `{{user_name}}`, etc.
- Variable names are case-sensitive
- Check that variables are wrapped in double curly braces

## Security Notes

⚠️ **Important Security Considerations:**

1. **EmailJS credentials are visible in the browser** - This is normal for EmailJS, but be aware that anyone can view your configuration
2. **Rate limiting** - EmailJS free tier has limits (200 emails/month). Consider upgrading if you get a lot of signups
3. **EmailJS is for notifications only** - Never use it for sensitive operations like password resets
4. **Monitor for abuse** - If someone discovers your EmailJS credentials, they could spam your inbox. Monitor your email for unusual activity

## Alternative: Backend Solution

For better security, consider implementing a backend server that:
- Receives signup requests
- Sends emails server-side (more secure)
- Validates signups before storing them
- Implements rate limiting and bot detection

However, for a quick solution to monitor signups, EmailJS works perfectly!

## Support

If you need help:
- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: Check their support page
- Your configuration file: `email-config.js`

---

**Remember**: Set `enabled: true` in `email-config.js` after configuring everything, or the emails won't send!
