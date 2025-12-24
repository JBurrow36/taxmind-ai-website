# Security Monitor & Killswitch - Quick Setup

## ✅ What's Been Created

A comprehensive security monitoring system with automatic killswitch that:

- ✅ Monitors for security threats **every minute**
- ✅ Detects **SQL injection, XSS, brute force, DDoS, and more**
- ✅ Automatically **activates killswitch** if threats detected
- ✅ **Disables site access** until threat is resolved
- ✅ Shows **maintenance message** to users
- ✅ Logs all security events for analysis

## 🚀 Quick Start

### 1. Start Security Monitor

```bash
cd backend
node start-security-monitor.js
```

### 2. Verify It's Running

You should see:
```
🔒 Starting Security Monitor...
   Check interval: 60 seconds
   Killswitch: ENABLED
✅ Security Monitor started successfully
```

### 3. Test Killswitch (Optional)

Activate killswitch manually to test:

```bash
cd backend
node -e "const Killswitch = require('./killswitch'); const k = new Killswitch(); k.activate({reason: 'Test'});"
```

Visit your site - you should see the maintenance message.

Deactivate:

```bash
node -e "const Killswitch = require('./killswitch'); const k = new Killswitch(); k.deactivate('Test complete');"
```

## 📁 Files Created

**Backend:**
- `security-monitor.js` - Main monitoring service
- `security-detector.js` - Threat detection
- `killswitch.js` - Killswitch mechanism
- `security-config.js` - Configuration
- `start-security-monitor.js` - Service starter

**Frontend:**
- `frontend-security-check.js` - Killswitch checker (added to HTML pages)

## 🔒 How It Works

1. **Monitor runs every minute** checking for:
   - Attack patterns (SQL injection, XSS, etc.)
   - Brute force attempts
   - Suspicious activity
   - Resource abuse (DDoS)
   - Unauthorized access
   - Firewall breaches

2. **If threat detected:**
   - Killswitch activates
   - `killswitch.json` created
   - Frontend checks this file
   - Site shows maintenance message
   - Access disabled

3. **To restore access:**
   - Manually deactivate killswitch
   - Or delete `killswitch.json`

## ⚙️ Configuration

Edit `backend/security-config.js`:

- `checkInterval`: How often to check (default: 60000ms = 1 minute)
- `enableKillswitch`: Enable/disable killswitch
- `thresholds`: Threat level thresholds

## 📊 Monitoring

View security logs:

```bash
cd backend/security_logs
ls -la
cat security-check-$(date +%Y-%m-%d).json
```

## 🛡️ Integration

The frontend automatically checks killswitch status on:
- ✅ `index.html`
- ✅ `login.html`
- ✅ `signup.html`

Add to other pages by including:

```html
<script src="frontend-security-check.js" defer></script>
```

## ⚠️ Important Notes

1. **Keep Monitor Running**: Run continuously in production
2. **Manual Review**: Always review threats before deactivating killswitch
3. **Log Analysis**: Review logs regularly for patterns
4. **Thresholds**: Adjust based on your traffic patterns

## 📖 Full Documentation

See `backend/KILLSWITCH_GUIDE.md` for detailed documentation.

