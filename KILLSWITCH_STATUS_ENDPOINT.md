# Killswitch Status Endpoint

## Endpoint

**URL:** `http://localhost:3003/api/security/killswitch-status`

**Method:** `GET`

**Port:** 3003 (configurable)

## What It Does

This endpoint provides a **JSON API** to check the current status of the killswitch. It returns information about whether the killswitch is active, when it was activated, the reason, and threat details.

## Response Format

### When Killswitch is INACTIVE:
```json
{
  "active": false
}
```

### When Killswitch is ACTIVE:
```json
{
  "active": true,
  "activatedAt": "2025-12-23T10:30:00.000Z",
  "reason": "Security threat detected: critical threat level",
  "threats": {
    "threatLevel": "critical",
    "attackPatterns": {
      "detected": true,
      "patterns": ["sqlInjection", "xss"]
    }
  },
  "requiresManualDisable": true
}
```

## Usage Examples

### Check Status with cURL:
```bash
curl http://localhost:3003/api/security/killswitch-status
```

### Check Status with PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3003/api/security/killswitch-status" | Select-Object -ExpandProperty Content
```

### Check Status in JavaScript (Frontend):
```javascript
fetch('http://localhost:3003/api/security/killswitch-status')
  .then(response => response.json())
  .then(status => {
    if (status.active) {
      console.log('Killswitch is ACTIVE');
      console.log('Reason:', status.reason);
    } else {
      console.log('Killswitch is INACTIVE - Site is operational');
    }
  });
```

## Starting the Status Server

To start the killswitch status server:

```bash
cd backend
node start-killswitch-server.js
```

Or integrate it into your security monitor.

## CORS

The endpoint includes CORS headers, so it can be accessed from any domain:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`

## Purpose

This endpoint is useful for:
1. **Monitoring** - Check killswitch status programmatically
2. **Frontend Checks** - Frontend can check if site should be disabled
3. **Status Dashboards** - Display killswitch status in admin panels
4. **Automation** - Scripts can monitor killswitch status

## Note

- The server runs independently from the main site server
- It's optional - the frontend can also check `killswitch.json` file directly
- Default port is 3003 (configurable in `killswitch.js`)

