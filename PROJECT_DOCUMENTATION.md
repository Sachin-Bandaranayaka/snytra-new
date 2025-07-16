# Restaurant Management System - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [API Documentation](#api-documentation)
6. [Frontend Components](#frontend-components)
7. [Testing Strategy](#testing-strategy)
8. [Deployment & Configuration](#deployment--configuration)
9. [Development Workflow](#development-workflow)
10. [Security Implementation](#security-implementation)
11. [Performance Optimization](#performance-optimization)
12. [Maintenance & Monitoring](#maintenance--monitoring)

## 🎯 Project Overview

### Purpose
The Restaurant Management System is a comprehensive full-stack solution designed to streamline restaurant operations, including customer-facing interfaces, staff management, order processing, and administrative functions.

### Key Features
- **Customer Interface**: Menu browsing, online ordering, table reservations
- **Staff Dashboard**: Order management, kitchen operations, table management
- **Admin Panel**: User management, analytics, system configuration
- **Payment Processing**: Integrated Stripe payment system
- **Real-time Updates**: Socket.io for live order status updates
- **Email Notifications**: Automated notifications for orders and reservations
- **Maintenance Mode**: System-wide maintenance mode with admin bypass

### Project Status
- **Current Phase**: Phase 4 - Customer Interface completion
- **Development Stage**: Production-ready with ongoing enhancements
- **Last Major Update**: User registration system fix and validation improvements

## 🏗️ Architecture & Technology Stack

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: 
  - Material-UI (MUI) for complex components
  - Radix UI for accessible primitives
  - Lucide React for icons
- **State Management**: React Context API with custom hooks
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: TipTap editor for content management

### Backend Stack
- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL (NeonDB) with connection pooling
- **ORM**: Prisma with custom SQL queries
- **Authentication**: NextAuth.js with custom credentials provider
- **File Uploads**: UploadThing integration
- **Email**: Nodemailer with SMTP configuration
- **Payments**: Stripe integration with webhooks
- **Real-time**: Socket.io for live updates

### Infrastructure
- **Hosting**: Vercel (recommended) or any Node.js hosting
- **Database**: Neon PostgreSQL (serverless)
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in logging system
- **Environment**: Development, staging, and production configurations

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  subscription_plan VARCHAR(100),
  subscription_status VARCHAR(50),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_current_period_start TIMESTAMP,
  subscription_current_period_end TIMESTAMP,
  profile_image VARCHAR(500),
  username VARCHAR(100),
  phone VARCHAR(20),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  remember_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Company Info Table
```sql
CREATE TABLE company_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  business_size VARCHAR(50),
  num_locations INTEGER DEFAULT 1,
  tax_id VARCHAR(100),
  business_registration VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Menu & Orders Schema
- **menu_items**: Product catalog with categories
- **categories**: Menu categorization
- **orders**: Order management with status tracking
- **order_items**: Individual items within orders
- **tables**: Table management for reservations
- **reservations**: Customer reservation system

### Database Connection
- **Primary**: Neon PostgreSQL with connection pooling
- **ORM**: Prisma for type-safe database operations
- **Raw Queries**: Custom SQL for complex operations
- **Migrations**: Prisma migration system

## 🔐 Authentication System

### Authentication Flow
1. **Registration**: Dual-path registration (simple/complex)
2. **Login**: Credential-based with NextAuth.js
3. **Session Management**: JWT tokens with secure cookies
4. **Role-based Access**: User, admin, super_admin roles
5. **Password Security**: bcrypt hashing with salt

### Implementation Details

#### Registration Types
```typescript
// Simple Registration (CustomSignUp)
interface SimpleRegistration {
  name: string;
  email: string;
  password: string;
}

// Complex Registration (RegisterForm)
interface ComplexRegistration {
  companyInfo: CompanyInfo;
  contactDetails: ContactDetails;
  accountCredentials: AccountCredentials;
  legalCompliance: LegalCompliance;
}
```

#### Authentication Middleware
- **Route Protection**: Middleware-based route protection
- **Role Validation**: Dynamic role checking
- **Session Refresh**: Automatic session renewal
- **Maintenance Mode**: Admin bypass during maintenance

### Security Features
- **Password Hashing**: bcrypt with configurable salt rounds
- **Input Validation**: Zod schemas for all inputs
- **CSRF Protection**: Built-in NextAuth.js protection
- **Rate Limiting**: API route rate limiting
- **Secure Headers**: Security headers configuration

## 📡 API Documentation

### API Structure
All API routes follow RESTful conventions with standardized responses:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Core API Routes

#### Authentication APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

#### Menu Management APIs
- `GET /api/menu` - Fetch menu items
- `POST /api/menu` - Create menu item (admin)
- `PUT /api/menu/[id]` - Update menu item (admin)
- `DELETE /api/menu/[id]` - Delete menu item (admin)

#### Order Management APIs
- `GET /api/orders` - Fetch orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get specific order
- `PUT /api/orders/[id]/status` - Update order status

#### Kitchen APIs
- `GET /api/kitchen/orders` - Kitchen order queue
- `PUT /api/kitchen/orders/[id]/status` - Update order status
- `PUT /api/kitchen/orders/[id]/priority` - Set order priority

#### Reservation APIs
- `GET /api/reservations` - Fetch reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/[id]` - Update reservation
- `DELETE /api/reservations/[id]` - Cancel reservation

### API Features
- **Validation**: Zod schema validation for all inputs
- **Error Handling**: Standardized error responses
- **Authentication**: Protected routes with role checking
- **Rate Limiting**: Request throttling for security
- **Logging**: Comprehensive request/response logging

## 🎨 Frontend Components

### Component Architecture
```
src/components/
├── admin/           # Admin-specific components
│   ├── Dashboard/   # Dashboard widgets
│   ├── Orders/      # Order management
│   └── Menu/        # Menu management
├── auth/            # Authentication components
│   ├── CustomSignIn.tsx
│   ├── CustomSignUp.tsx
│   └── RegisterForm.tsx
├── shared/          # Reusable components
│   ├── Layout/      # Layout components
│   ├── UI/          # UI primitives
│   └── Forms/       # Form components
└── providers/       # Context providers
    ├── AuthProvider.tsx
    └── AppWrapper.tsx
```

### Key Components

#### Authentication Components
- **CustomSignIn**: Simple login form
- **CustomSignUp**: Basic registration form
- **RegisterForm**: Multi-step complex registration
- **AuthProvider**: Authentication context management

#### Dashboard Components
- **DashboardLayout**: Main dashboard layout
- **MetricsCards**: Key performance indicators
- **OrdersTable**: Order management interface
- **MenuManager**: Menu item management

#### Customer Components
- **MenuDisplay**: Customer menu browsing
- **OrderCart**: Shopping cart functionality
- **ReservationForm**: Table reservation interface

### Styling System
- **Design Tokens**: Consistent color palette and spacing
- **Component Variants**: Class Variance Authority (CVA)
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching capability

## 🧪 Testing Strategy

### Testing Framework
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Environment**: jsdom for DOM simulation
- **Coverage**: Istanbul coverage reporting

### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 10000,
  },
});
```

### Test Categories

#### Unit Tests
- Component rendering tests
- Utility function tests
- Hook behavior tests
- API route handler tests

#### Integration Tests
- Authentication flow tests
- Database operation tests
- API endpoint tests
- Form submission tests

#### End-to-End Tests
- User registration and login flow
- Order placement workflow
- Admin dashboard operations
- Payment processing flow

### Testing Scripts
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ui       # Visual test interface
```

## 🚀 Deployment & Configuration

### Environment Configuration

#### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."
NEON_API_KEY="napi_..."

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret"
JWT_SECRET="your-jwt-secret"

# Payments
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
EMAIL_USER="your-email@domain.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Restaurant <noreply@domain.com>"

# File Uploads
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="your-app-id"
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Deploy automatically on push

#### Alternative Platforms
- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment
- **AWS**: Enterprise deployment

### Database Setup
1. Create Neon PostgreSQL database
2. Run Prisma migrations: `npx prisma migrate deploy`
3. Generate Prisma client: `npx prisma generate`
4. Seed initial data (optional)

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Database setup
npm run setup-db
```

## 🔧 Development Workflow

### Getting Started
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd snytra-new
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Database Setup**
   ```bash
   npm run setup-db
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

### Development Scripts
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Lint code
npm run type-check    # TypeScript checking
npm run format        # Format code
npm run validate      # Lint + type check
```

### Code Quality
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks for quality checks

### Git Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run quality checks: `npm run validate`
4. Submit pull request
5. Code review and merge

## 🛡️ Security Implementation

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token generation
- **Session Management**: Secure cookie handling
- **Role-based Access**: Granular permission system

### API Security
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin setup
- **Rate Limiting**: Request throttling

### Data Protection
- **Environment Variables**: Secure configuration
- **Database Encryption**: Connection encryption
- **File Upload Security**: Type and size validation
- **Error Handling**: No sensitive data exposure

### Security Headers
```typescript
// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

## ⚡ Performance Optimization

### Frontend Optimization
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Google Fonts with display swap
- **Bundle Analysis**: Webpack bundle analyzer

### Backend Optimization
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Caching Strategy**: Redis for session storage
- **API Response Caching**: Strategic caching implementation

### Monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging
- **Database Monitoring**: Query performance tracking
- **User Analytics**: Usage pattern analysis

## 🔧 Maintenance & Monitoring

### Maintenance Mode
- **System-wide Maintenance**: Configurable maintenance mode
- **Admin Bypass**: Administrators can access during maintenance
- **Custom Maintenance Page**: User-friendly maintenance interface
- **API Endpoint Control**: Selective API availability

### Logging System
```typescript
// Logging configuration
const logger = {
  info: (message: string, meta?: object) => void,
  error: (message: string, error?: Error) => void,
  warn: (message: string, meta?: object) => void,
  debug: (message: string, meta?: object) => void
};
```

### Health Checks
- **Database Connectivity**: Regular connection testing
- **API Endpoint Status**: Automated endpoint monitoring
- **External Service Health**: Third-party service monitoring
- **Performance Metrics**: Response time tracking

### Backup Strategy
- **Database Backups**: Automated daily backups
- **File Storage Backups**: Asset backup procedures
- **Configuration Backups**: Environment and settings backup
- **Recovery Procedures**: Documented recovery processes

## 📈 Future Enhancements

### Planned Features
1. **Mobile Application**: React Native mobile app
2. **Advanced Analytics**: Business intelligence dashboard
3. **Multi-location Support**: Chain restaurant management
4. **Inventory Management**: Stock tracking and alerts
5. **Staff Scheduling**: Employee schedule management
6. **Customer Loyalty**: Rewards and loyalty program
7. **Integration APIs**: Third-party service integrations
8. **Advanced Reporting**: Custom report generation

### Technical Improvements
1. **Microservices Architecture**: Service decomposition
2. **GraphQL API**: Alternative API layer
3. **Real-time Features**: Enhanced WebSocket implementation
4. **Progressive Web App**: PWA capabilities
5. **Offline Support**: Offline-first architecture
6. **Advanced Caching**: Redis implementation
7. **Container Deployment**: Docker containerization
8. **CI/CD Pipeline**: Automated deployment pipeline

---

## 📞 Support & Contact

For technical support, feature requests, or contributions:

- **Documentation**: This file and inline code comments
- **Issue Tracking**: GitHub Issues
- **Code Review**: Pull Request process
- **Development Team**: Internal development team

---

*Last Updated: December 2024*
*Version: 1.0.0*
*Status: Production Ready*