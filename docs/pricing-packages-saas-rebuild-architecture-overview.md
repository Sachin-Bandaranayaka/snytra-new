# Snytra SaaS Pricing Packages - Architecture Overview

## Introduction

This document provides a high-level overview of the architectural approach for enhancing Snytra Restaurant Management System with a complete SaaS pricing packages rebuild. This is part of a sharded architecture documentation set.

## Related Documents

- **Architecture Overview** (this document) - High-level approach and integration strategy
- **Data Models and Schema** - Database design and schema changes
- **API Design and Integration** - API endpoints and external integrations
- **Component Architecture** - Component design and interaction patterns
- **Infrastructure and Deployment** - Deployment strategy and infrastructure changes
- **Testing and Security** - Testing strategy and security requirements

## Enhancement Scope and Integration Strategy

**Enhancement Type:** Major Feature Modification + New Feature Addition + Integration Enhancement
**Scope:** Complete SaaS subscription system with access control, Stripe integration, and admin management
**Integration Impact:** Significant - requires architectural changes for access control while maintaining existing functionality

### Existing Project Analysis

**Current Project State:**
- **Primary Purpose:** Restaurant management system with incomplete SaaS subscription functionality
- **Current Tech Stack:** Next.js 15 (App Router), React 18, TypeScript, PostgreSQL (NeonDB), Prisma 6.6.0, NextAuth 4.24.11, Stripe 14.25.0
- **Architecture Style:** Full-stack monorepo with API routes, dual database access (Prisma + direct SQL)
- **Deployment Method:** Vercel deployment with NeonDB PostgreSQL hosting

**Available Documentation:**
- ✓ Comprehensive brownfield architecture document
- ✓ Complete PRD for SaaS pricing packages rebuild
- ✓ Existing Prisma schema with subscription fields
- ✓ Current subscription API endpoints and components
- ✓ Stripe integration foundation

**Identified Constraints:**
- Dual database access pattern (Prisma + direct SQL) must be maintained
- Existing user accounts and data must remain intact
- Current restaurant management features must continue functioning identically
- NextAuth + custom staff auth system complexity
- Technical debt including hardcoded admin credentials
- Build process skips linting (--no-lint flag)

### Integration Approach

**Code Integration Strategy:** Extend existing API routes in `/src/app/api/subscription-plans/`, enhance existing components in `/src/components/`, add new subscription utilities in `/src/lib/subscription/`, maintain existing file structure and naming conventions

**Database Integration Strategy:** Extend existing Prisma schema with enhanced subscription fields, implement migrations for new tables, maintain dual access pattern (Prisma + direct SQL), ensure referential integrity with existing user and company data

**API Integration Strategy:** Enhance existing `/api/subscription-plans` endpoints, add new Stripe webhook handlers at `/api/webhooks/stripe`, implement middleware for subscription verification, maintain existing API response format `{ success: boolean, data?: any, error?: string }`

**UI Integration Strategy:** Extend existing React components with subscription-aware logic, implement new subscription management components using existing design patterns (orange primary color, card-based layouts), add subscription status context throughout application

### Compatibility Requirements

- **Existing API Compatibility:** All current API endpoints must maintain backward compatibility while adding subscription checks
- **Database Schema Compatibility:** New subscription fields must not break existing queries, maintain existing user and company relationships
- **UI/UX Consistency:** Follow existing Tailwind CSS design system, maintain current responsive breakpoints and component patterns
- **Performance Impact:** Subscription verification must complete within 200ms, database queries optimized for sub-100ms response times

## Tech Stack Alignment

### Existing Technology Stack

| Category | Current Technology | Version | Usage in Enhancement | Notes |
|----------|-------------------|---------|---------------------|-------|
| Runtime | Node.js | Latest | Maintain for Next.js 15 | Required for App Router |
| Framework | Next.js | 15.3.1 | Extend with new subscription routes | App Router architecture |
| Database | PostgreSQL | Latest | Extend schema for subscriptions | NeonDB hosted |
| ORM | Prisma | 6.6.0 | Enhance schema, maintain dual access | Generated client in src/generated/prisma |
| Authentication | NextAuth | 4.24.11 | Integrate subscription checks | Maintain existing providers |
| Payments | Stripe | 14.25.0 | Enhance for complete SaaS integration | Existing foundation present |
| UI Framework | React | 18.2.0 | Extend with subscription components | With TypeScript |
| Styling | Tailwind CSS | 3.4.1 | Maintain existing design system | With Material-UI components |
| Testing | Vitest | 1.5.0 | Add subscription flow tests | With Testing Library |
| Email | Nodemailer | 6.9.12 | Enhance for subscription notifications | SMTP integration |

### New Technology Additions

No new technologies required - enhancement will use existing stack with expanded functionality.

## Next Steps

### Story Manager Handoff

**Prompt for Story Manager:**

"Please implement the SaaS Pricing Packages Rebuild epic using this brownfield architecture document as the foundation. Key requirements:

- **Reference Document:** Use this architecture document for all technical decisions and integration requirements
- **Integration Requirements:** All changes must maintain existing restaurant management functionality while adding subscription verification layers. Ensure backward compatibility with existing user accounts and preserve all current data.
- **Existing System Constraints:** The system uses dual database access (Prisma + direct SQL), has hardcoded admin credentials, and skips linting in builds. Work within these constraints while implementing the subscription system.
- **First Story Priority:** Begin with Story 1.1 (Enhanced Database Schema and Migration) to establish the foundation, then proceed sequentially through the 8 stories.
- **Integration Checkpoints:** After each story, verify that existing functionality remains intact and new subscription features integrate properly with current patterns.
- **System Integrity:** Throughout implementation, maintain the existing Next.js App Router structure, API response formats, and component patterns while adding subscription capabilities."

### Developer Handoff

**Prompt for Developers:**

"Begin implementing the SaaS subscription system using this architecture document and the existing codebase patterns. Critical guidelines:

- **Architecture Reference:** Follow this document for all technical decisions, component design, and integration approaches
- **Integration Requirements:** Extend existing API routes in `/src/app/api/subscription-plans/`, enhance existing components, maintain dual database access pattern (Prisma + direct SQL)
- **Technical Decisions:** Use existing tech stack (Next.js 15, TypeScript, Prisma 6.6.0, Stripe 14.25.0), follow established coding standards, maintain existing error handling patterns
- **Compatibility Requirements:** Ensure all existing restaurant management features continue working identically, maintain API response format `{ success: boolean, data?: any, error?: string }`, preserve existing user authentication flows
- **Implementation Sequence:** Start with database schema enhancements, then Stripe integration, followed by access control middleware, and finally UI components. Test existing functionality after each major change.
- **Verification Steps:** After each component, verify existing user workflows remain unchanged, test subscription functionality in isolation, ensure performance requirements are met (subscription checks <200ms)."