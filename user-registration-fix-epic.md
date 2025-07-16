# User Registration Fix - Brownfield Enhancement

## Epic Goal

Fix the broken user registration system to enable successful user account creation through both the simple signup form and complex multi-step registration form.

## Epic Description

**Existing System Context:**

- Current relevant functionality: Two registration flows exist - CustomSignUp (simple) and RegisterForm (complex multi-step)
- Technology stack: Next.js 14, NextAuth.js, PostgreSQL, Prisma ORM, TypeScript
- Integration points: NextAuth authentication, PostgreSQL database, Stripe integration for subscriptions

**Enhancement Details:**

- What's being added/changed: Fix database schema mismatch, API validation issues, and form submission errors
- How it integrates: Maintains existing NextAuth flow while ensuring database operations succeed
- Success criteria: Users can successfully register through both forms, data persists correctly, authentication works post-registration

**Key Issues Identified:**

1. **Missing Database Table**: Registration API tries to insert into `company_info` table that doesn't exist in schema
2. **API Schema Mismatch**: CustomSignUp sends simple data structure but API expects complex company/contact structure
3. **Validation Inconsistency**: Different validation rules between frontend forms and backend API
4. **Error Handling**: Poor error feedback when registration fails

## Stories

1. **Story 1: Fix Database Schema and API Compatibility**
   - Create missing `company_info` table or modify API to handle optional company data
   - Update API validation to support both simple and complex registration flows
   - Ensure backward compatibility with existing user data

2. **Story 2: Standardize Registration Form Validation**
   - Align frontend validation with backend API requirements
   - Improve error messaging and user feedback
   - Add proper form state management and loading indicators

3. **Story 3: Test and Verify Registration Flows**
   - Create comprehensive tests for both registration paths
   - Verify NextAuth integration works correctly after registration
   - Test database transactions and rollback scenarios

## Compatibility Requirements

- [x] Existing APIs remain unchanged (NextAuth endpoints)
- [x] Database schema changes are backward compatible
- [x] UI changes follow existing patterns
- [x] Performance impact is minimal

## Risk Mitigation

- **Primary Risk:** Breaking existing user authentication or data corruption
- **Mitigation:** Use database transactions, maintain existing user table structure, thorough testing
- **Rollback Plan:** Database migration rollback scripts, revert API changes, restore previous form components

## Definition of Done

- [x] All stories completed with acceptance criteria met
- [x] Both CustomSignUp and RegisterForm work correctly
- [x] Users can authenticate immediately after registration
- [x] Database integrity maintained with proper constraints
- [x] Error handling provides clear user feedback
- [x] No regression in existing authentication features
- [x] Registration tests pass in CI/CD pipeline

## Technical Notes

**Current Registration Flow Issues:**

```typescript
// CustomSignUp sends:
{ name, email, password }

// But API expects:
{
  companyInfo: { name, industry, ... },
  contactDetails: { name, email, ... },
  accountCredentials: { username, password, ... },
  legalCompliance: { acceptTerms, ... }
}
```

**Database Schema Gap:**
- `users` table exists in schema.sql
- `company_info` table referenced in API but not defined
- Need to either create table or make it optional

**Integration Points:**
- NextAuth credential provider
- PostgreSQL connection via @/db/postgres
- Stripe customer creation (for paid plans)
- Email verification (if implemented)

---

**Story Manager Handoff:**

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running Next.js 14 with NextAuth.js and PostgreSQL
- Integration points: NextAuth authentication flow, PostgreSQL database operations, Stripe payment processing
- Existing patterns to follow: Current API route structure, Zod validation schemas, database transaction patterns
- Critical compatibility requirements: Maintain NextAuth session compatibility, preserve existing user data, ensure registration-to-login flow works seamlessly
- Each story must include verification that existing authentication functionality remains intact

The epic should maintain system integrity while delivering a working user registration system that supports both simple and complex signup flows."