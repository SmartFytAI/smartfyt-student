# SmartFyt Logger System

A configurable logging system for the SmartFyt Student application with different log levels and global control.

## Features

- **Configurable Log Levels**: error, warn, info, debug
- **Global Control**: Enable/disable via `window.ENABLE_DEBUG(level)`
- **Specialized Loggers**: PWA, API, Auth-specific loggers
- **TanStack DevTools**: Automatically shows/hides with debug flag
- **Production Ready**: Logs are disabled by default in production

## Usage

### Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Different log levels
logger.error('Critical error occurred');
logger.warn('Warning message');
logger.info('Information message');
logger.debug('Debug information');
```

### Specialized Loggers

```typescript
import { pwaLogger, apiLogger, authLogger } from '@/lib/logger';

// PWA-specific logging
pwaLogger.info('Service worker registered');

// API-specific logging
apiLogger.debug('API request sent');

// Auth-specific logging
authLogger.warn('Authentication failed');
```

### Global Debug Control

#### Enable Debug Logging

```javascript
// In browser console
window.ENABLE_DEBUG('debug');  // Enable all levels
window.ENABLE_DEBUG('info');   // Enable info, warn, error
window.ENABLE_DEBUG('warn');   // Enable warn, error
window.ENABLE_DEBUG('error');  // Enable error only
```

#### Programmatic Control

```typescript
import { enableDebug, disableDebug, isDebugEnabled } from '@/lib/logger';

// Enable debug logging
enableDebug('debug');

// Check if debug is enabled
if (isDebugEnabled()) {
  console.log('Debug logging is active');
}

// Disable debug logging
disableDebug();
```

## Log Levels

| Level | Priority | Description |
|-------|----------|-------------|
| error | 0 | Critical errors that need immediate attention |
| warn | 1 | Warnings that should be investigated |
| info | 2 | General information about application state |
| debug | 3 | Detailed debugging information |

## Configuration

The logger is configured via a global `window.__LOGGER_CONFIG__` object:

```typescript
interface LoggerConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
}
```

## Best Practices

1. **Use Appropriate Levels**:
   - `error`: For critical failures
   - `warn`: For recoverable issues
   - `info`: For important state changes
   - `debug`: For detailed troubleshooting

2. **Include Context**:
   ```typescript
   logger.error('API request failed', { endpoint: '/users', status: 500 });
   ```

3. **Use Specialized Loggers**:
   ```typescript
   // Instead of generic logger
   logger.debug('PWA: Service worker updated');
   
   // Use specialized logger
   pwaLogger.debug('Service worker updated');
   ```

4. **Disable in Production**:
   - Logs are disabled by default
   - Only enable when needed for debugging

## Examples

### PWA Service Worker

```typescript
import { pwaLogger } from '@/lib/logger';

navigator.serviceWorker.register('/sw.js')
  .then(registration => {
    pwaLogger.info('Service worker registered successfully', registration);
  })
  .catch(error => {
    pwaLogger.error('Service worker registration failed', error);
  });
```

### API Requests

```typescript
import { apiLogger } from '@/lib/logger';

const response = await fetch('/api/users');
if (!response.ok) {
  apiLogger.error('API request failed', { 
    status: response.status, 
    url: response.url 
  });
}
```

### Authentication

```typescript
import { authLogger } from '@/lib/logger';

if (!user) {
  authLogger.warn('User not authenticated');
  return;
}

authLogger.debug('User authenticated successfully', { userId: user.id });
```

## TanStack DevTools

The TanStack Query DevTools panel is automatically controlled by the debug flag:

```javascript
// Enable DevTools panel
window.ENABLE_DEBUG('debug');

// Disable DevTools panel
window.__LOGGER_CONFIG__ = { enabled: false, level: 'error' };
```

The DevTools will:
- Show when debug is enabled
- Hide when debug is disabled
- Update automatically when debug status changes
- Provide query inspection and debugging tools

## Testing

Visit `/test-page` to see the Logger Demo component that allows you to:
- Enable/disable debug logging
- Test different log levels
- See real-time logging in action
- Control TanStack DevTools visibility

## Browser Console

You can also control logging directly from the browser console:

```javascript
// Enable all debug logs
window.ENABLE_DEBUG('debug');

// Enable only warnings and errors
window.ENABLE_DEBUG('warn');

// Disable all debug logs
window.__LOGGER_CONFIG__ = { enabled: false, level: 'error' };
``` 