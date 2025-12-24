# Site Shutdown & Killswitch Guide

## Overview

The security monitor can now **completely deactivate and shutdown the site** when a security breach is detected. This includes:

1. ✅ **Frontend Blocking** - All pages show maintenance message
2. ✅ **Server-Level Blocking** - Requests blocked at server level
3. ✅ **Process Termination** - Server processes automatically stopped
4. ✅ **Automatic Redirects** - All traffic redirected to maintenance page

## How It Works

### 1. Detection → Shutdown Flow

```
Security Threat Detected
    ↓
Killswitch Activated
    ↓
┌─────────────────────────────────────┐
│ 1. Killswitch file created          │
│ 2. Server processes terminated      │
│ 3. Maintenance page created         │
│ 4. Frontend blocks all content      │
│ 5. All requests redirected          │
└─────────────────────────────────────┘
    ↓
Site Completely Disabled
```

### 2. Shutdown Mechanisms

**A. Killswitch File (`killswitch.json`)**
- Created when threat detected
- Frontend checks this file on every page load
- Server middleware checks this file before processing requests

**B. Process Termination**
- Automatically attempts to stop Node.js server processes
- Kills processes on common ports (8080, 3000, 3001, etc.)
- Works on Windows, Linux, and Mac

**C. Maintenance Page**
- `maintenance.html` automatically created
- All requests redirected to this page
- Shows security maintenance message

**D. Frontend Blocking**
- All content hidden
- All forms/buttons disabled
- Network requests blocked
- Navigation prevented

## Implementation Methods

### Method 1: Frontend-Only (Current - Works Immediately)

The frontend check automatically:
- Hides all content
- Shows maintenance overlay
- Blocks all interactions
- Redirects to maintenance page

**Status:** ✅ Already implemented and active

### Method 2: Server-Level Middleware (Node.js/Express)

For Node.js servers, use the server killswitch middleware:

```javascript
const express = require('express');
const ServerKillswitch = require('./backend/server-killswitch');

const app = express();
const killswitch = new ServerKillswitch();

// Add killswitch middleware BEFORE other routes
app.use(killswitch.middleware());

// Your other routes...
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(3000);
```

**Status:** ✅ Available in `backend/server-killswitch.js`

### Method 3: Web Server Configuration

**Apache (.htaccess):**
- Use `backend/.htaccess-killswitch` configuration
- Automatically redirects when `killswitch.json` exists

**Nginx:**
- Use `backend/nginx-killswitch.conf` configuration
- Requires Lua module for JSON parsing
- Automatically serves maintenance page

**Status:** ✅ Configuration files provided

## Testing Site Shutdown

### Test Automatic Shutdown

1. **Start security monitor:**
   ```bash
   cd backend
   node start-security-monitor.js
   ```

2. **Manually trigger killswitch (test):**
   ```bash
   node -e "const Killswitch = require('./killswitch'); const k = new Killswitch(); k.activate({reason: 'Test shutdown'});"
   ```

3. **What happens:**
   - ✅ Killswitch file created
   - ✅ Server processes terminated (if running)
   - ✅ Maintenance page created
   - ✅ Frontend shows maintenance message
   - ✅ All site access blocked

4. **Verify shutdown:**
   - Visit any page - should show maintenance message
   - Try to interact - should be blocked
   - Check server - should be stopped

### Restore Site Access

1. **Deactivate killswitch:**
   ```bash
   cd backend
   node -e "const Killswitch = require('./killswitch'); const k = new Killswitch(); k.deactivate('Test complete');"
   ```

2. **Restart server** (if using server-level shutdown)

3. **Verify restoration:**
   - Visit site - should work normally
   - Maintenance message gone

## Configuration

### Adjust Shutdown Behavior

Edit `backend/security-config.js`:

```javascript
module.exports = {
    // When to activate killswitch
    thresholds: {
        critical: 10,  // Killswitch activates at 10+ threat points
        high: 6        // Killswitch activates at 6+ threat points
    },
    
    killswitch: {
        autoDisable: false,  // Don't auto-disable (manual required)
        // Set to true to auto-disable after threat clears
    }
};
```

### Customize Maintenance Page

Edit `maintenance.html` to customize the maintenance message.

## Security Levels

| Threat Level | Action |
|-------------|--------|
| **Critical (10+)** | ✅ Killswitch activates → Site shutdown |
| **High (6-9)** | ✅ Killswitch activates → Site shutdown |
| **Medium (3-5)** | ⚠️ Alert logged, monitored |
| **Low (0-2)** | ✅ All clear |

## Files Created

- `maintenance.html` - Maintenance page shown during shutdown
- `backend/server-killswitch.js` - Server middleware for Node.js
- `backend/.htaccess-killswitch` - Apache configuration
- `backend/nginx-killswitch.conf` - Nginx configuration

## Complete Shutdown Checklist

When killswitch activates, verify:

- [x] `killswitch.json` file exists with `activated: true`
- [x] `maintenance.html` file exists
- [x] Frontend shows maintenance message
- [x] Server processes stopped (if applicable)
- [x] All requests redirected to maintenance
- [x] No site functionality accessible

## Restore Checklist

To restore site:

- [x] Review security logs
- [x] Identify and resolve threat
- [x] Deactivate killswitch
- [x] Remove `maintenance.html` (optional)
- [x] Restart server (if applicable)
- [x] Verify site functionality

## Important Notes

1. **Server Processes**: The killswitch attempts to stop server processes, but you may need to manually verify they're stopped
2. **Web Server Config**: For Apache/Nginx, you need to configure the server with the provided config files
3. **Manual Review**: Always review security threats before deactivating killswitch
4. **Auto-Restore**: Killswitch does NOT auto-disable by default (requires manual intervention)

## Production Deployment

For production:

1. **Enable server-level middleware** (if using Node.js server)
2. **Configure web server** (Apache/Nginx) with killswitch config
3. **Run security monitor** continuously (use PM2, systemd, etc.)
4. **Monitor logs** regularly
5. **Test shutdown** procedure periodically

## Summary

✅ **Yes, the protection bot CAN and WILL deactivate the site itself** after detecting a security breach. The system:

- Automatically activates killswitch on threat detection
- Terminates server processes
- Blocks all frontend access
- Redirects all requests to maintenance page
- Completely disables site functionality

The site remains disabled until you manually review the threat and deactivate the killswitch.

