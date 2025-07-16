# User Registration Fix - Detailed User Stories

## Epic: User Registration Fix - Brownfield Enhancement

---

## Story 1.1: Fix Database Schema and API Compatibility

### Status
Draft

### Story
**As a** new user,  
**I want** to successfully register using either the simple signup form or complex multi-step registration form,  
**so that** I can create an account and access the platform without encountering database errors.

### Acceptance Criteria
1. CustomSignUp component can successfully register users with simple data (name, email, password)
2. RegisterForm component can successfully register users with complete company information
3. Registration API handles both simple and complex data structures without errors
4. Database operations complete successfully for both registration flows
5. No "company_info table does not exist" errors occur during registration
6. User data is properly stored and retrievable after registration
7. NextAuth authentication works immediately after successful registration
8. Existing user data and authentication functionality remains intact

### Tasks / Subtasks
- [ ] **Database Schema Analysis and Fix** (AC: 5, 6)
  - [ ] Analyze current database schema in prisma/schema.prisma
  - [ ] Determine if company_info table should be created or made optional
  - [ ] Create database migration for company_info table if needed
  - [ ] Update Prisma schema to include company_info model
  - [ ] Test database migration in development environment

- [ ] **API Route Compatibility Enhancement** (AC: 1, 2, 3, 4)
  - [ ] Modify /api/auth/register route to handle both simple and complex payloads
  - [ ] Create flexible validation schema that supports optional company data
  - [ ] Implement conditional database insertion logic
  - [ ] Add proper error handling and rollback mechanisms
  - [ ] Ensure backward compatibility with existing API consumers

- [ ] **CustomSignUp Integration Fix** (AC: 1, 7)
  - [ ] Update CustomSignUp to send data in compatible format
  - [ ] Add proper error handling and user feedback
  - [ ] Test registration flow from CustomSignUp to NextAuth login
  - [ ] Verify session creation and user authentication

- [ ] **Data Integrity and Testing** (AC: 6, 8)
  - [ ] Create comprehensive tests for both registration flows
  - [ ] Test database transaction rollback scenarios
  - [ ] Verify existing user data remains intact
  - [ ] Test NextAuth integration with new registration data

### Dev Notes

**Current System Architecture:**
- Technology Stack: Next.js 14, NextAuth.js, PostgreSQL, Prisma ORM, TypeScript
- Database Connection: Uses @/db/postgres with sql template literals
- Authentication: NextAuth.js with credentials provider
- Validation: Zod schemas for API validation

**Key Issues Identified:**
1. **Schema Mismatch**: API expects company_info table that doesn't exist in prisma/schema.prisma
2. **Data Structure Conflict**: 
   - CustomSignUp sends: `{ name, email, password }`
   - API expects: `{ companyInfo: {...}, contactDetails: {...}, accountCredentials: {...}, legalCompliance: {...} }`
3. **Missing Table**: company_info table referenced in API but not defined in schema

**Relevant Source Tree:**
- Registration API: `/src/app/api/auth/register/route.ts`
- Simple Form: `/src/components/auth/CustomSignUp.tsx`
- Complex Form: `/src/app/register/RegisterForm.tsx`
- Database Schema: `/prisma/schema.prisma`
- Database Connection: `/src/db/postgres.ts`

**Integration Points:**
- NextAuth configuration for post-registration authentication
- PostgreSQL database operations with transaction support
- Stripe integration for subscription-based registrations
- Form validation and error handling patterns

**Critical Compatibility Requirements:**
- Maintain existing NextAuth session structure
- Preserve current user table schema and data
- Ensure registration-to-login flow works seamlessly
- Support both simple and complex registration workflows

#### Testing
**Testing Standards:**
- Test files location: `/src/test/` and `/src/__tests__/`
- Testing framework: Vitest with React Testing Library
- Test both registration flows independently
- Test database transaction rollback scenarios
- Test NextAuth integration post-registration
- Verify no regression in existing authentication features

---

## Story 1.2: Standardize Registration Form Validation

### Status
Draft

### Story
**As a** user attempting to register,  
**I want** to receive clear, consistent validation feedback across all registration forms,  
**so that** I understand exactly what information is required and can successfully complete my registration.

### Acceptance Criteria
1. Frontend validation rules match backend API validation requirements
2. Error messages are clear, specific, and actionable
3. Form state management prevents submission of invalid data
4. Loading states provide appropriate user feedback during submission
5. Validation errors are displayed in real-time as users type
6. Both CustomSignUp and RegisterForm use consistent validation patterns
7. Password strength requirements are clearly communicated
8. Email format validation works consistently across forms

### Tasks / Subtasks
- [ ] **Validation Schema Alignment** (AC: 1, 6)
  - [ ] Extract common validation rules into shared utilities
  - [ ] Create unified Zod schemas for frontend and backend
  - [ ] Implement consistent email and password validation
  - [ ] Ensure field requirements match between forms and API

- [ ] **Error Handling Enhancement** (AC: 2, 5)
  - [ ] Implement real-time validation feedback
  - [ ] Create standardized error message components
  - [ ] Add field-specific error display
  - [ ] Improve API error message parsing and display

- [ ] **Form State Management** (AC: 3, 4)
  - [ ] Add proper loading states during form submission
  - [ ] Implement form disable/enable logic during processing
  - [ ] Add progress indicators for multi-step registration
  - [ ] Prevent double-submission with proper state management

- [ ] **User Experience Improvements** (AC: 7, 8)
  - [ ] Add password strength indicator
  - [ ] Implement email format validation with helpful hints
  - [ ] Create consistent styling for validation states
  - [ ] Add accessibility features for form validation

### Dev Notes

**Current Validation Issues:**
- CustomSignUp has basic client-side validation
- RegisterForm has complex multi-step validation
- API validation schema doesn't match frontend expectations
- Error messages are inconsistent between forms

**Relevant Source Tree:**
- Validation utilities: `/src/lib/validation.ts` (to be created)
- Form components: `/src/components/auth/` and `/src/app/register/`
- UI components: `/src/components/ui/`
- Error handling: `/src/components/ui/alert.tsx`

**Validation Requirements:**
- Email: Valid email format, uniqueness check
- Password: Minimum 8 characters, complexity requirements
- Name: Minimum 2 characters, no special characters
- Company info: Required for complex registration, optional for simple

#### Testing
**Testing Standards:**
- Test validation rules with various input combinations
- Test error message display and clearing
- Test form submission prevention with invalid data
- Test accessibility features for validation feedback
- Verify consistent behavior across both registration forms

---

## Story 1.3: Test and Verify Registration Flows

### Status
Draft

### Story
**As a** development team member,  
**I want** comprehensive automated tests covering all registration scenarios,  
**so that** we can confidently deploy registration fixes without breaking existing functionality.

### Acceptance Criteria
1. Unit tests cover all registration API endpoints and validation logic
2. Integration tests verify complete registration-to-authentication flow
3. Database transaction tests ensure data integrity
4. Error scenario tests validate proper error handling and rollback
5. Performance tests ensure registration doesn't impact system performance
6. Regression tests verify existing authentication features remain intact
7. End-to-end tests cover both CustomSignUp and RegisterForm workflows
8. Test coverage meets project standards (minimum 80%)

### Tasks / Subtasks
- [ ] **API Endpoint Testing** (AC: 1, 4)
  - [ ] Create unit tests for /api/auth/register route
  - [ ] Test validation schema with various input combinations
  - [ ] Test error handling for duplicate users, invalid data
  - [ ] Test database transaction rollback scenarios

- [ ] **Integration Testing** (AC: 2, 6)
  - [ ] Test complete registration-to-NextAuth-login flow
  - [ ] Verify session creation and user data persistence
  - [ ] Test both simple and complex registration paths
  - [ ] Ensure existing authentication features work unchanged

- [ ] **Database Testing** (AC: 3)
  - [ ] Test database schema changes and migrations
  - [ ] Verify data integrity constraints
  - [ ] Test concurrent registration scenarios
  - [ ] Test database connection handling and error recovery

- [ ] **End-to-End Testing** (AC: 7)
  - [ ] Create E2E tests for CustomSignUp component
  - [ ] Create E2E tests for RegisterForm multi-step flow
  - [ ] Test form validation and error display
  - [ ] Test successful registration and immediate login

- [ ] **Performance and Coverage** (AC: 5, 8)
  - [ ] Implement performance benchmarks for registration
  - [ ] Ensure test coverage meets project standards
  - [ ] Add load testing for registration endpoints
  - [ ] Monitor and optimize registration performance

### Dev Notes

**Testing Architecture:**
- Unit Tests: Vitest for API routes and utility functions
- Integration Tests: Vitest with database setup/teardown
- E2E Tests: Playwright or Cypress for full user workflows
- Database Tests: Test database with proper isolation

**Test Environment Setup:**
- Separate test database for isolation
- Mock Stripe integration for subscription tests
- Mock email services for verification tests
- Proper cleanup between test runs

**Critical Test Scenarios:**
1. Successful simple registration (CustomSignUp)
2. Successful complex registration (RegisterForm)
3. Duplicate email/username handling
4. Invalid data validation
5. Database transaction failures
6. NextAuth integration post-registration
7. Existing user authentication (regression)
8. Concurrent registration attempts

**Relevant Source Tree:**
- Test files: `/src/test/` and `/src/__tests__/`
- Test utilities: `/src/test/utils/`
- Test configuration: `vitest.config.ts`
- Database test setup: `/src/test/setup/`

#### Testing
**Testing Standards:**
- All tests must be isolated and repeatable
- Database tests require proper setup/teardown
- Mock external services (Stripe, email)
- Test both success and failure scenarios
- Maintain test performance and reliability
- Document test scenarios and expected outcomes

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-19 | 1.0 | Initial story creation based on epic analysis | SM Agent |

---

## Implementation Notes

**Priority Order:**
1. Story 1.1 (Database Schema and API Compatibility) - Critical foundation
2. Story 1.2 (Form Validation) - User experience improvement
3. Story 1.3 (Testing) - Quality assurance and deployment confidence

**Dependencies:**
- Story 1.2 depends on completion of Story 1.1
- Story 1.3 should be developed in parallel with Stories 1.1 and 1.2
- All stories must maintain backward compatibility with existing system

**Risk Mitigation:**
- Implement database changes with proper migration scripts
- Maintain existing API endpoints during transition
- Use feature flags if needed for gradual rollout
- Comprehensive testing before production deployment