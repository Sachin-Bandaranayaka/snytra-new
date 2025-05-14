# Blog Admin Testing Documentation

This document outlines the testing strategy and instructions for the blog administration section of the restaurant system.

## Test Coverage

The testing suite for the blog admin section includes:

1. **Unit Tests** - Testing React components in isolation
   - `src/app/admin/blog/__tests__/page.test.tsx`: Tests for the BlogPostsManagement component

2. **API Tests** - Testing the backend API endpoints
   - `src/app/api/blog/posts/__tests__/route.test.ts`: Tests for the blog posts API endpoints

3. **End-to-End Tests** - Testing the full system behavior with Playwright
   - `src/app/admin/blog/__tests__/blog-admin.e2e.test.ts`: E2E tests for blog admin functionality

## Running the Tests

### Unit Tests

To run the unit tests for the blog admin page:

```bash
npx vitest run src/app/admin/blog/__tests__/page.test.tsx
```

To run the unit tests with watch mode:

```bash
npx vitest watch src/app/admin/blog/__tests__/page.test.tsx
```

### API Tests

To run the API tests (note: these require additional setup):

```bash
npx vitest run src/app/api/blog/posts/__tests__/route.test.ts
```

### End-to-End Tests

To run the end-to-end tests with Playwright:

```bash
npx playwright test src/app/admin/blog/__tests__/blog-admin.e2e.test.ts
```

## Test Strategy

### Unit Tests

The unit tests focus on isolated component functionality, including:

- Rendering the blog posts management page
- Filtering posts by search query, publish status, and featured status
- Handling user interactions like delete, publish/unpublish, and feature/unfeature
- Displaying appropriate error messages

These tests use Jest and React Testing Library with mock data and mock API calls to test components in isolation.

### API Tests

The API tests verify the server-side functionality:

- Fetching blog posts with various filters
- Creating new blog posts
- Handling validation errors
- Error handling during database operations
- CORS headers for the OPTIONS request

### End-to-End Tests

The E2E tests with Playwright verify the complete user experience:

- Navigation between blog admin pages
- Filtering and displaying blog posts
- Confirming delete operations
- Toggling publish and featured status
- Editing blog posts

These tests interact with the application through a real browser to ensure all components work together properly.

## Test Data

All tests use mock data rather than real production data, following our company guidelines. The mock data is defined within the test files.

## CI Integration

These tests are automatically run in the CI pipeline when changes are pushed to the repository. Failing tests will block merges to the main branch.

## Future Improvements

Future improvements to the testing suite could include:

1. More comprehensive API tests with proper mocking of NextResponse
2. Integration with a test database for more realistic API testing
3. More comprehensive E2E test scenarios
4. Visual regression testing for the admin UI

## Troubleshooting

If tests are failing, check:

1. Mock data setup - Ensure mock data matches expected schema
2. API mocking - Ensure fetch mock responses match component expectations
3. CSS classes - Tests rely on specific class names and attributes for selection
4. Test runner configuration - Ensure Vitest and Playwright are properly configured 