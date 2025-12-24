# Running TaxMind AI Website on Localhost

## Quick Start

The server should now be running! Open your web browser and navigate to:

**http://localhost:8080**

## Starting the Server Manually

If you need to start the server again, you have two options:

### Option 1: Using the Batch File (Easiest)
Double-click `start-server.bat`

### Option 2: Using PowerShell
Open PowerShell in this directory and run:
```powershell
.\server.ps1
```

## Missing Files Summary

Based on the HTML files, the following JavaScript files are **missing** and need to be created/restored:

### Core Files:
- ✅ `styles.css` - **EXISTS**
- ❌ `script.js` - **MISSING** (used by: index.html, demo.html, tutorial.html, terms-of-service.html, privacy-policy.html)

### Page-Specific Files:
- ❌ `upload-documents.js` - **MISSING** (used by: upload-documents.html)
- ❌ `view-report.js` - **MISSING** (used by: view-report.html)
- ❌ `subscription.js` - **MISSING** (used by: subscription.html)
- ❌ `signup.js` - **MISSING** (used by: signup.html)
- ❌ `login.js` - **MISSING** (used by: login.html)
- ❌ `file-taxes.js` - **MISSING** (used by: file-taxes.html)
- ❌ `ai-analysis.js` - **MISSING** (used by: ai-analysis.html)
- ❌ `dashboard.js` - **MISSING** (used by: dashboard.html)
- ❌ `payment-processor.js` - **MISSING** (used by: dashboard.html)

### Configuration Files:
- ❌ `email-config.js` - **MISSING** (used by: signup.html)
- ❌ `oauth-handler.js` - **MISSING** (used by: signup.html, login.html)
- ❌ `oauth-config-checker.js` - **MISSING** (used by: signup.html, login.html)

## Checking What's Missing

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab to see JavaScript errors
3. Go to the Network tab to see 404 errors for missing files
4. Navigate through the site to see which pages work and which have missing dependencies

## Next Steps

1. **Check your other laptop** for the missing JavaScript files
2. **Transfer the missing files** to this directory
3. **Refresh the browser** to see the updated site

## Stopping the Server

Press `Ctrl+C` in the PowerShell window running the server, or simply close the window.

