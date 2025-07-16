# Snytra Restaurant Management System - Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Snytra Restaurant Management System codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements.

### Document Scope

Comprehensive documentation of the entire restaurant management system, covering customer-facing features, admin dashboard, payment processing, and staff management.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-19 | 1.0 | Initial brownfield analysis | Architect |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/app/layout.tsx` - Root layout with metadata and site configuration
- **Home Page**: `src/app/page.tsx` - Landing page with hero section and features
- **Configuration**: `next.config.ts`, `package.json`, `prisma/schema.prisma`
- **Database Connection**: `src/db/postgres.ts` - Direct PostgreSQL connection using postgres library
- **Authentication**: `src/lib/auth.ts` - NextAuth configuration with credentials and Google providers
- **API Handler**: `src/lib/api-handler.ts` - Standardized API route handler with validation
- **Middleware**: `src/middleware.ts` - Maintenance mode and admin access control
- **Database Schema**: `prisma/schema.prisma` - Prisma models for all entities

### Key Business Logic Areas

- **User Management**: `src/app/api/auth/` - Registration, login, password reset
- **Restaurant Operations**: `src/app/api/dashboard/` - Orders, reservations, menu management
- **Payment Processing**: `src/app/api/payment/` - Stripe integration for subscriptions and payments
- **Staff Management**: `src/app/api/staff/` - Staff authentication and role management
- **Admin Features**: `src/app/api/admin/` - System administration and analytics

## High Level Architecture

### Technical Summary

Snytra is a full-stack restaurant management system built with Next.js 15, using the App Router architecture. The system provides both customer-facing features (menu browsing, reservations, ordering) and comprehensive admin dashboard for restaurant operations management.

### Actual Tech Stack (from package.json)

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| Runtime | Node.js | Latest | Next.js 15 requirement |
| Framework | Next.js | 15.3.1 | App Router architecture |
| Database | PostgreSQL | Latest | NeonDB hosted, direct connection |
| ORM | Prisma | 6.6.0 | Schema in prisma/schema.prisma |
| Authentication | NextAuth | 4.24.11 | Custom credentials + Google OAuth |
| Payments | Stripe | 14.25.0 | Subscriptions and one-time payments |
| UI Framework | React | 18.2.0 | With TypeScript |
| Styling | Tailwind CSS | 3.4.1 | With Material-UI components |
| Testing | Vitest | 1.5.0 | With Testing Library |
| Email | Nodemailer | 6.9.12 | SMTP email sending |
| File Uploads | Uploadthing | 7.6.0 | Image and file management |

### Repository Structure Reality Check

- Type: Monorepo (single Next.js application)
- Package Manager: npm
- Notable: Uses App Router with API routes, Prisma for database, direct PostgreSQL connection alongside Prisma

## Source Tree and Module Organization

### Project Structure (Actual)

```text
snytra-new/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (extensive)
│   │   ├── dashboard/          # Admin dashboard pages
│   │   ├── login/              # Authentication pages
│   │   ├── register/           # User registration
│   │   ├── reservations/       # Customer reservations
│   │   ├── menu/               # Menu browsing
│   │   └── [various pages]/    # Other customer pages
│   ├── components/             # React components
│   ├── lib/                    # Core utilities and services
│   ├── db/                     # Database connection
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Utility functions
│   └── middleware.ts           # Request middleware
├── prisma/
│   └── schema.prisma           # Database schema
├── scripts/                    # Database and utility scripts
├── public/                     # Static assets
└── .bmad-core/                 # BMAD methodology framework
```

### Key Modules and Their Purpose

- **Authentication System**: `src/lib/auth.ts` - NextAuth with custom credentials provider
- **Database Layer**: `src/db/postgres.ts` + Prisma client - Dual database access pattern
- **API Infrastructure**: `src/lib/api-handler.ts` - Standardized API route handling
- **Payment Processing**: `src/lib/stripe.ts` - Stripe integration for subscriptions
- **Email Service**: `src/lib/nodemailer.ts` - SMTP email notifications
- **File Uploads**: `src/lib/uploadthing.ts` - Image and file management
- **Middleware**: `src/middleware.ts` - Maintenance mode and access control

## Data Models and APIs

### Data Models

See `prisma/schema.prisma` for complete schema. Key models:

- **User Model**: Users table with subscription management
- **CompanyInfo Model**: Business information linked to users
- **Page Model**: CMS-style page management with JSON content
- **StaffMember Model**: Staff authentication and management
- **Job Model**: Job postings and career management
- **SlideShow Model**: Homepage slideshow management

### Database Access Patterns

**CRITICAL**: The system uses TWO different database access methods:
1. **Prisma Client**: Generated client in `src/generated/prisma`
2. **Direct SQL**: `src/db/postgres.ts` using postgres library

**Inconsistency Warning**: Some parts use Prisma, others use direct SQL queries. This creates maintenance complexity.

### API Specifications

- **Standardized Handler**: All API routes should use `src/lib/api-handler.ts`
- **Response Format**: `{ success: boolean, data?: any, error?: string }`
- **Authentication**: NextAuth session-based with role checking
- **Validation**: Zod schemas for request validation

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Dual Database Access**: System uses both Prisma and direct SQL, creating inconsistency
2. **Authentication Bypass**: Hardcoded admin credentials in `src/lib/auth.ts` (admin@snytra.com/admin123)
3. **Database URL Handling**: Complex string manipulation in `src/db/postgres.ts` for connection string
4. **Mixed Authentication**: NextAuth + custom staff auth system creates complexity
5. **Incomplete Testing**: Only 60% test coverage mentioned in README

### Workarounds and Gotchas

- **Database Connection**: Uses fallback connection string if env var is malformed
- **Admin Bypass**: Special case authentication for admin@snytra.com
- **Maintenance Mode**: Cookie-based maintenance mode with API fallback
- **SSL Configuration**: `rejectUnauthorized: false` for database SSL
- **Build Process**: `--no-lint` flag in build script to bypass linting errors

### Areas Needing Attention

- **Error Handling**: Inconsistent error handling across API routes
- **Type Safety**: Some areas use `any` types instead of proper TypeScript
- **Database Migrations**: Manual migration scripts in `scripts/` directory
- **Environment Variables**: Complex env var handling with string manipulation

## Integration Points and External Dependencies

### External Services

| Service | Purpose | Integration Type | Key Files |
|---------|---------|------------------|-----------||
| NeonDB | PostgreSQL Database | Direct connection | `src/db/postgres.ts` |
| Stripe | Payment Processing | REST API + Webhooks | `src/lib/stripe.ts`, `src/app/api/payment/` |
| Google OAuth | Authentication | NextAuth Provider | `src/lib/auth.ts` |
| Uploadthing | File Uploads | SDK | `src/lib/uploadthing.ts` |
| SMTP Email | Notifications | Nodemailer | `src/lib/nodemailer.ts` |

### Internal Integration Points

- **Frontend-Backend**: Next.js API routes with standardized responses
- **Authentication Flow**: NextAuth sessions + custom staff auth
- **Database Layer**: Prisma ORM + direct SQL queries
- **File Storage**: Uploadthing for images and documents
- **Real-time Features**: Socket.io integration (partial implementation)

## Development and Deployment

### Local Development Setup

1. **Environment Setup**: Copy `.env.example` to `.env.local`
2. **Database**: Requires NeonDB connection string
3. **Dependencies**: `npm install` (includes Prisma generation)
4. **Database Setup**: `npm run setup-db` for initial schema
5. **Development Server**: `npm run dev`

### Build and Deployment Process

- **Build Command**: `npm run build` (includes Prisma generation, skips linting)
- **Production**: `npm run start`
- **Database**: Prisma migrations via `prisma generate`
- **Environment**: Requires production environment variables

### Known Development Issues

- **Linting**: Build process skips linting (`--no-lint` flag)
- **Database Setup**: Manual schema application required
- **Environment Variables**: Complex parsing logic may fail with malformed strings

## Testing Reality

### Current Test Coverage

- **Unit Tests**: Vitest with Testing Library
- **Coverage**: Mentioned as 60% in README (needs verification)
- **Test Files**: Limited test files found in codebase
- **Integration Tests**: Minimal integration testing
- **E2E Tests**: No end-to-end testing framework

### Running Tests

```bash
npm test              # Run unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
npm run test:ui       # Vitest UI
```

## Security Considerations

### Authentication Security

- **Password Hashing**: bcryptjs for password hashing
- **Session Management**: NextAuth JWT tokens
- **Role-Based Access**: Admin, staff, and user roles
- **API Protection**: Middleware for route protection

### Known Security Issues

- **Hardcoded Credentials**: Admin bypass in authentication
- **SSL Configuration**: `rejectUnauthorized: false` for database
- **Environment Exposure**: Potential env var leakage in client-side code

## Performance Considerations

### Database Performance

- **Connection Pooling**: Configured in postgres client
- **Query Optimization**: Direct SQL for performance-critical queries
- **Prisma Overhead**: ORM overhead for complex queries

### Frontend Performance

- **Next.js Optimization**: App Router with automatic optimizations
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Caching**: Next.js built-in caching strategies

## Maintenance and Monitoring

### Maintenance Mode

- **Implementation**: Middleware-based with cookie/API fallback
- **Admin Access**: Admins can access during maintenance
- **Configuration**: Database-driven maintenance status

### Logging and Monitoring

- **Logger**: Custom logger in `src/lib/logger.ts`
- **Error Handling**: Standardized error handler
- **Activity Logging**: Activity logger for user actions

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm run dev           # Start development server
npm run build         # Production build (skips linting)
npm run start         # Start production server
npm run setup-db      # Initialize database schema
npm run type-check    # TypeScript type checking
npm run validate      # Lint and type check
npm run format        # Format code with Prettier
```

### Database Management

```bash
npx prisma generate   # Generate Prisma client
npx prisma studio     # Open Prisma Studio
npx prisma migrate    # Run migrations
```

### Debugging and Troubleshooting

- **Database Issues**: Check connection string parsing in `src/db/postgres.ts`
- **Authentication Issues**: Verify NextAuth configuration and session handling
- **Build Issues**: Check for TypeScript errors (build skips linting)
- **API Issues**: Use standardized error handler responses

### Development Scripts

Various utility scripts in `scripts/` directory for:
- Database cleanup and setup
- Authentication testing
- Stripe integration testing
- Environment validation

## Conclusion

The Snytra Restaurant Management System is a comprehensive Next.js application with significant functionality but also notable technical debt. Key areas for improvement include:

1. **Standardizing Database Access**: Choose either Prisma or direct SQL consistently
2. **Improving Authentication**: Remove hardcoded credentials and unify auth systems
3. **Enhancing Testing**: Increase test coverage and add integration tests
4. **Cleaning Up Build Process**: Address linting issues and remove build workarounds
5. **Security Hardening**: Address SSL and credential management issues

The system provides a solid foundation for restaurant management with room for architectural improvements and feature enhancements.