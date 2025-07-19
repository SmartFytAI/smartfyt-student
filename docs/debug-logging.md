# Debug Logging Guide

## 🔧 Auto-Enabled in Development

Debug logging is **automatically enabled** when `NODE_ENV=development`. You'll see this message in the console:
```
🔧 Debug logging auto-enabled in development mode
```

## 🎛️ Manual Control (Optional)

### Enable Debug Logging
```javascript
window.ENABLE_DEBUG('debug');
```

### Disable Debug Logging
```javascript
window.DISABLE_DEBUG();
```

### Programmatic Control
```javascript
import { enableDebug, disableDebug } from '@/lib/logger';

enableDebug('debug');   // Enable
disableDebug();         // Disable
```

## 🚫 Disable Hot Reload (Optional)

To prevent hot reloads during development, use the static dev mode:

```bash
cd smartfyt-student && flox activate -- npm run dev:static
```

This runs Next.js with `FAST_REFRESH=false` to prevent automatic page refreshes.

## 📊 Log Levels

- `error` - Only error messages
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors
- `debug` - All messages (most verbose) **[AUTO-ENABLED IN DEV]**

## 🎯 Specialized Loggers

```javascript
import { logger, pwaLogger, apiLogger, authLogger } from '@/lib/logger';

// General logging
logger.debug('General message');

// PWA-specific logging
pwaLogger.debug('PWA message');

// API-specific logging  
apiLogger.debug('API message');

// Auth-specific logging
authLogger.debug('Auth message');
```

## 🔍 Auth Debugging (Auto-Active in Dev)

In development mode, you'll automatically see detailed auth logs:

```
🔧 Debug logging auto-enabled in development mode
🔑 Header Sign In button clicked
🔓 Login modal opened { mode: 'login' }
🌐 Social login button clicked { provider: 'google' }
🚀 Starting user creation flow
👤 Authenticated user in creation flow: {...}
✅ User created/updated in API: {...}
🏠 Redirecting to dashboard: {...}
🏠 Dashboard auth effect: {...}
✅ Dashboard: Rendering for authenticated user {...}
```

## 💡 Tips

- **Development Mode**: Debug logging is automatic - just start coding!
- **Production Mode**: Debug logging is disabled by default for performance
- **Manual Override**: Use `window.ENABLE_DEBUG()` or `window.DISABLE_DEBUG()` to override
- **Static Dev Mode**: Use `npm run dev:static` to prevent hot reloads
- **Specialized Loggers**: Use specific loggers for better organization 