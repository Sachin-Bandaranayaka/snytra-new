# Maintenance Mode Testing Guide

This document provides information about testing the maintenance mode feature in the restaurant management system.

## Overview

The maintenance mode feature allows administrators to put the site into maintenance mode, which prevents regular users from accessing the site while maintenance is being performed. When maintenance mode is enabled, non-admin users are redirected to a maintenance page.

## Test Files

The maintenance mode feature is covered by the following test files:

- `src/app/api/maintenance-status/__tests__/route.test.ts`: Tests for the maintenance status API
- `src/__tests__/middleware.test.ts`: Tests for the middleware that redirects users to the maintenance page
- `src/app/__tests__/InitMaintenanceMode.test.tsx`: Tests for the component that initializes the maintenance mode
- `src/app/maintenance/__tests__/page.test.tsx`: Tests for the maintenance page

## Running the Tests

### Running All Maintenance Mode Tests

To run all maintenance mode tests at once, use the following command:

```bash
npm run test:maintenance
```

This will execute the test script that runs all maintenance mode-related tests and provides a summary of the results.

### Running Individual Test Files

To run individual test files, use the following commands:

```bash
# Test the maintenance status API
npx vitest run src/app/api/maintenance-status/__tests__/route.test.ts

# Test the middleware
npx vitest run src/__tests__/middleware.test.ts

# Test the initialization component
npx vitest run src/app/__tests__/InitMaintenanceMode.test.tsx

# Test the maintenance page
npx vitest run src/app/maintenance/__tests__/page.test.tsx
```

## Manual Testing

In addition to the automated tests, you can manually test the maintenance mode feature:

1. Log in as an administrator and navigate to the Settings page
2. Go to the "Advanced" tab
3. Toggle the "Enable maintenance mode" checkbox and click "Save Settings"
4. Open an incognito window or use a different browser where you're not logged in
5. Try to access any page on the site
6. You should be redirected to the maintenance page
7. Return to the admin browser and disable maintenance mode
8. The site should now be accessible to all users again

## Key Implementation Files

- `src/app/api/maintenance-status/route.ts`: API endpoint for checking and updating maintenance mode
- `src/middleware.ts`: Middleware that handles maintenance mode redirection
- `src/app/admin/settings/page.tsx`: Admin interface for toggling maintenance mode
- `src/app/maintenance/page.tsx`: The maintenance page shown to users
- `src/app/InitMaintenanceMode.tsx`: Component that initializes maintenance mode on app load

## Edge Runtime Considerations

The application uses Next.js Edge Runtime for middleware, which has certain limitations:

1. Direct database access is not supported in middleware
2. Instead, we use cookies to communicate maintenance mode status between the server and middleware
3. The `/api/maintenance-status` endpoint manages both the database state and the cookie state

## Troubleshooting

If you encounter issues with maintenance mode:

1. Check that the maintenance_mode cookie is being set correctly
2. Verify that the settings table in the database has the correct maintenance mode value
3. Ensure the middleware is correctly checking the cookie
4. Confirm that the admin detection logic is working as expected 