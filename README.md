# 🎯 SmartFyt Student Experience

> **Modern, responsive student-athlete dashboard built with Next.js 15, TypeScript, and React Query**

## 🚀 **Overview**

The SmartFyt Student Experience is a cutting-edge web application designed specifically for student-athletes to track their performance, health metrics, and achieve their athletic and academic goals. Built as part of SmartFyt's multi-repository architecture, this app provides a clean, modern interface optimized for the student experience.

## ✨ **Features**

### **📊 Core Dashboard**
- Real-time API connectivity status
- Health tracking integration
- Performance metrics visualization
- Goal setting and progress tracking

### **📱 Student-Focused Features** *(Coming Soon)*
- **Health Tracking**: Monitor sleep, activity, and wellness metrics
- **Daily Journals**: AI-powered insights and reflection tools
- **Quest System**: Gamified challenges and achievements
- **Performance Analytics**: Comprehensive progress visualization
- **Goal Management**: Smart goal planning and tracking
- **Team Integration**: Collaborate with teammates and coaches

## 🏗️ **Technology Stack**

### **Frontend Framework**
- **Next.js 15** - App Router with React Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **React Query** - Powerful data fetching and caching

### **API Integration**
- **Custom API Client** - Type-safe HTTP client
- **React Hooks** - Optimized data fetching patterns
- **Real-time Updates** - Efficient cache management

### **Development Tools**
- **ESLint** - Code quality and consistency
- **Flox Environment** - Dependency isolation
- **TypeScript Strict Mode** - Maximum type safety

## 🎯 **Getting Started**

### **Prerequisites**
- Node.js 18+ (managed via Flox)
- SmartFyt API running on `localhost:3001`

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/SmartFytAI/smartfyt-student.git
cd smartfyt-student

# Activate flox environment
flox activate

# Install dependencies
npm install

# Start development server
npm run dev:local

# Open browser to http://localhost:3000
```

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run dev:local    # Start development server (alias)
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking
```

## 🔌 **API Integration**

### **Configuration**
The app connects to the SmartFyt API backend. Configure the API URL via environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### **API Client**
```typescript
import { apiClient } from '@/lib/api-client';

// Health check
const health = await apiClient.healthCheck();

// User data
const dashboard = await apiClient.getDashboard(userId);
```

### **React Query Hooks**
```typescript
import { useHealthCheck, useDashboard, useUserQuests } from '@/hooks/use-api';

function Dashboard() {
  const { data: health } = useHealthCheck();
  const { data: dashboard } = useDashboard(userId);
  const { data: quests } = useUserQuests(userId);
  
  // Component logic...
}
```

## 📁 **Project Structure**

```
smartfyt-student/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── auth/           # Authentication components
│   ├── hooks/              # Custom React hooks
│   │   └── use-api.ts      # API integration hooks
│   ├── lib/                # Utility libraries
│   │   ├── api-client.ts   # HTTP client
│   │   └── react-query.tsx # React Query configuration
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared types
│   └── utils/              # Helper functions
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── README.md             # This file
```

## 🎨 **Development Guidelines**

### **Code Standards**
- **TypeScript Strict Mode** - All code must be type-safe
- **Component Architecture** - Modular, reusable components
- **React Query Patterns** - Consistent data fetching
- **Tailwind CSS** - Utility-first styling

### **API Integration Patterns**
```typescript
// ✅ Good: Use React Query hooks
const { data, isLoading, error } = useUserDashboard(userId);

// ❌ Avoid: Direct fetch calls in components
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/dashboard').then(res => res.json()).then(setData);
}, []);
```

### **Error Handling**
```typescript
// ✅ Comprehensive error handling
const { data, error, isLoading } = useHealthData(userId);

if (error) {
  return <ErrorMessage error={error} />;
}

if (isLoading) {
  return <LoadingSpinner />;
}

return <HealthDashboard data={data} />;
```

## 🔧 **Environment Setup**

### **Flox Development**
All development must happen within the Flox environment:

```bash
# Start development
flox activate -- npm run dev:local

# Run any npm command
flox activate -- npm install <package>

# Build for production
flox activate -- npm run build
```

### **Environment Variables**
Create `.env.local` for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

## 📊 **Current Status**

### **✅ Completed**
- [x] Next.js 15 + TypeScript setup
- [x] Tailwind CSS configuration
- [x] React Query integration
- [x] API client architecture
- [x] TypeScript type definitions
- [x] Basic dashboard layout
- [x] Development environment (Flox)
- [x] Build and deployment config

### **🔄 In Progress**
- [ ] Authentication integration
- [ ] Student dashboard components
- [ ] Health tracking interface
- [ ] Journal entry system

### **📋 Planned Features**
- [ ] Quest system UI
- [ ] Performance analytics
- [ ] Goal management
- [ ] Team collaboration tools
- [ ] Mobile responsiveness
- [ ] PWA capabilities

## 🤝 **Contributing**

### **Development Workflow**
1. Create feature branch from `main`
2. Develop in Flox environment (`flox activate`)
3. Follow TypeScript strict mode
4. Test API integration
5. Ensure build passes (`npm run build`)
6. Submit PR with descriptive commit messages

### **Code Quality**
- All code must pass ESLint checks
- TypeScript compilation must succeed
- Components should be modular and reusable
- Follow established patterns for API integration

## 🚀 **Deployment**

### **Production Build**
```bash
flox activate -- npm run build
flox activate -- npm start
```

### **Environment Variables**
Production requires:
- `NEXT_PUBLIC_API_URL` - SmartFyt API endpoint
- `NODE_ENV=production`

## 📞 **Support & Resources**

- **API Documentation**: See `smartfyt-api` repository
- **Design System**: Tailwind CSS + custom components
- **Migration Plan**: See `~/Projects/smartfyt_flox/docs/README.md`
- **Issues**: GitHub Issues for bug reports and feature requests

## 📈 **Performance**

### **Bundle Analysis**
```bash
# Current build metrics
Route (app)                  Size     First Load JS
┌ ○ /                      5.53 kB    110 kB
└ ○ /_not-found             994 B     101 kB
+ First Load JS shared     99.6 kB
```

### **Optimization Features**
- **React Query Caching** - Efficient data management
- **Next.js App Router** - Optimized routing and rendering
- **TypeScript** - Compile-time optimizations
- **Tailwind CSS** - Minimal CSS bundle size

---

## 🎯 **Mission**

> **Build exceptional student-athlete experiences faster, prettier, and more developer-friendly while following best practices.**

**Version**: 1.0.0  
**Status**: Phase 3 - Student Experience Repository ✨  
**Next**: Authentication integration and core dashboard features
