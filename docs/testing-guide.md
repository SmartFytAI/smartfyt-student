# 🧪 SmartFyt Student Testing Guide

## Overview

This project uses **Vitest + React Testing Library + TanStack Query** for comprehensive unit testing. The setup is optimized for Next.js 15, TypeScript, and modern React patterns.

## 🚀 Quick Start

### Install Dependencies
```bash
cd smartfyt-student && flox activate -- npm install
```

### Run Tests
```bash
# Run all tests
flox activate -- npm test

# Run tests in watch mode
flox activate -- npm run test:watch

# Run tests with UI
flox activate -- npm run test:ui

# Run tests with coverage
flox activate -- npm run test:coverage

# Run tests once (CI mode)
flox activate -- npm run test:run
```

## 🏗️ Testing Architecture

### Core Testing Stack
- **Vitest** - Fast test runner with native TypeScript support
- **React Testing Library** - Component testing with user-centric approach
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation
- **TanStack Query Testing** - Built-in utilities for testing React Query

### Test Structure
```
src/
├── test/
│   ├── setup.ts              # Global test configuration
│   └── utils/
│       └── test-utils.tsx    # Custom render with providers
├── components/
│   └── __tests__/           # Component tests
├── hooks/
│   └── __tests__/           # Hook tests
└── lib/
    └── __tests__/           # Utility tests
```

## 📝 Testing Patterns

### 1. Component Testing

```typescript
// src/components/ui/__tests__/button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    await button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Hook Testing (TanStack Query)

```typescript
// src/hooks/__tests__/use-api.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHealthCheck } from '@/hooks/use-api';

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    healthCheck: vi.fn(),
  },
}));

describe('useHealthCheck', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('fetches data successfully', async () => {
    const mockData = { status: 'healthy' };
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      data: mockData,
      status: 200,
    });

    const { result } = renderHook(() => useHealthCheck(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });
});
```

### 3. Integration Testing

```typescript
// src/components/__tests__/dashboard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { Dashboard } from '@/components/dashboard';

// Mock hooks
vi.mock('@/hooks/use-api', () => ({
  useHealthCheck: () => ({
    data: { status: 'healthy' },
    isLoading: false,
  }),
  useSports: () => ({
    data: [{ id: 1, name: 'Football' }],
    isLoading: false,
  }),
}));

describe('Dashboard Integration', () => {
  it('renders dashboard with data', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Football')).toBeInTheDocument();
    });
  });
});
```

## 🎯 Testing Best Practices

### 1. Test Organization
- **Group related tests** in `describe` blocks
- **Use descriptive test names** that explain the behavior
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests focused** - one assertion per test when possible

### 2. Component Testing
- **Test user interactions**, not implementation details
- **Use semantic queries** (`getByRole`, `getByLabelText`)
- **Avoid testing props** - test behavior instead
- **Test accessibility** with screen readers in mind

### 3. Hook Testing
- **Mock external dependencies** (API calls, browser APIs)
- **Test loading, success, and error states**
- **Verify side effects** (caching, invalidation)
- **Use `waitFor`** for async operations

### 4. API Testing
- **Mock API responses** with realistic data
- **Test error handling** and edge cases
- **Verify request parameters** and headers
- **Test retry logic** and timeouts

## 🔧 Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Extend expect with custom matchers
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router and other globals
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));
```

## 📊 Coverage Goals

### Target Coverage
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Critical Areas
- **API hooks** - 90%+ (data fetching logic)
- **Authentication** - 90%+ (security critical)
- **Error boundaries** - 100% (user experience)
- **PWA features** - 80%+ (offline functionality)

## 🚨 Common Testing Patterns

### 1. Testing Async Operations
```typescript
it('handles async data loading', async () => {
  render(<AsyncComponent />);
  
  // Show loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 2. Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event';

it('handles form submission', async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 3. Testing Error States
```typescript
it('shows error message on API failure', async () => {
  vi.mocked(apiClient.getData).mockRejectedValue(new Error('API Error'));
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
```

## 🔍 Debugging Tests

### 1. Using Vitest UI
```bash
npm run test:ui
```
- Interactive test runner
- Real-time feedback
- Debug mode support

### 2. Debug Mode
```typescript
it('debug test', () => {
  debugger; // Will pause execution in debug mode
  render(<Component />);
});
```

### 3. Screen Debugging
```typescript
import { screen } from '@testing-library/react';

it('debug rendering', () => {
  render(<Component />);
  screen.debug(); // Prints current DOM
});
```

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run type-check
```

## 🎯 Next Steps

1. **Install dependencies** and run initial tests
2. **Start with component tests** for UI components
3. **Add hook tests** for API integration
4. **Implement integration tests** for user flows
5. **Set up CI/CD** with coverage reporting
6. **Add E2E tests** with Playwright (optional)

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Remember**: Good tests are like good documentation - they help you understand how your code should work and catch regressions before they reach users! 🧪✨ 