# OAuth Setup Guide for Google and Microsoft Sign-In

This guide will help you set up Google and Microsoft OAuth authentication for your TaxMind AI application.

## 🚀 Quick Start (Demo Mode)

**Good news!** OAuth is already set up with **Demo Mode** enabled, so you can test it immediately without any configuration!

1. Open `signup.html` or `login.html` in your browser
2. Click the **Google** or **Microsoft** button
3. It will simulate authentication and create a demo account
4. You'll be redirected to the dashboard or subscription page

**To use real OAuth authentication**, follow the setup steps below and update the credentials in `oauth-handler.js`.

## ✅ Configuration Checker

The system includes an automatic configuration checker that runs when you load the signup/login pages. Check your browser console (F12) to see:
- ✅ What's configured correctly
- ⚠️ What needs attention
- ❌ Any issues that need fixing

You can also manually run the checker by typing `checkOAuthConfig()` in the browser console.

## Prerequisites

- A Google account (for Google OAuth)
- A Microsoft/Azure account (for Microsoft OAuth)

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required information (App name, User support email, etc.)
   - Add your email to test users
   - Save and continue through the scopes and test users steps
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: TaxMind AI
   - Authorized JavaScript origins: 
     - `http://localhost:8000` (for local development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:8000` (for local development)
     - `https://yourdomain.com` (for production)
7. Copy the **Client ID** (it looks like: `123456789-abc.apps.googleusercontent.com`)

### Step 2: Update Configuration

Open `oauth-handler.js` and replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID:

```javascript
google: {
    clientId: '123456789-abc.apps.googleusercontent.com', // Your actual Client ID
}
```

## Microsoft OAuth Setup

### Step 1: Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - Name: TaxMind AI
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI:
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:8000` (for local development)
     - Add another: `https://yourdomain.com` (for production)
5. Click **Register**
6. Copy the **Application (client) ID** from the Overview page

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**
3. Add the following permissions:
   - `User.Read` (to read user profile)
4. Click **Add permissions**
5. **Important**: For production, you may need to grant admin consent

### Step 3: Update Configuration

Open `oauth-handler.js` and replace `YOUR_MICROSOFT_CLIENT_ID` with your actual Microsoft Application (client) ID:

```javascript
microsoft: {
    clientId: 'your-microsoft-client-id-here',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
}
```

## Testing

1. Make sure your local server is running on `http://localhost:8000`
2. Open `signup.html` or `login.html`
3. Click the **Google** or **Microsoft** button
4. You should be redirected to the provider's login page
5. After successful authentication, you'll be redirected back and logged in

## Troubleshooting

### Google Sign-In Issues

- **"Error 400: redirect_uri_mismatch"**: Make sure your redirect URI in Google Cloud Console exactly matches your current URL (including http/https and port)
- **"Error 403: access_denied"**: Check that your OAuth consent screen is properly configured
- **Script not loading**: Check browser console for errors, ensure you have internet connection

### Microsoft Sign-In Issues

- **Popup blocked**: Make sure popups are allowed for your site
- **"AADSTS50011: Redirect URI mismatch"**: Verify the redirect URI in Azure Portal matches exactly
- **"AADSTS70011: Invalid scope"**: Make sure `User.Read` permission is added and granted

## Production Deployment

When deploying to production:

1. Update authorized redirect URIs in both Google Cloud Console and Azure Portal
2. Update the `redirectUri` in `oauth-handler.js` to match your production domain
3. Ensure your site is served over HTTPS (required for OAuth)
4. Test the OAuth flow on your production domain

## Security Notes

- Never commit your OAuth credentials to public repositories
- Use environment variables or a secure configuration file for production
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in both Google Cloud Console and Azure Portal

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all configuration steps were completed correctly
3. Ensure your OAuth apps are properly configured in both providers' consoles
4. Test with a different browser or in incognito mode

