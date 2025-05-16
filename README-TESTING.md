# Subscription Flow Testing

This document provides guidance on using and extending the automated tests for the subscription flow in our restaurant management system.

## Overview

We've implemented two types of tests:

1. **Unit Tests** (`subscription-flow.test.ts`): Tests the individual components and API endpoints of the subscription system.
2. **End-to-End Tests** (`subscription-e2e.test.ts`): Tests the full user journey through the frontend.

## Running the Tests

To run all tests:

```bash
npm test
```

To run just the subscription tests:

```bash
npm test -- src/tests/subscription-flow.test.ts
npm test -- src/tests/subscription-e2e.test.ts
```

To run tests with coverage:

```bash
npm run test:coverage
```

## Test Structure

### Unit Tests (`subscription-flow.test.ts`)

These tests verify the individual API endpoints and functions related to subscriptions:

- **Plan Selection and Checkout**: Tests the creation of a Stripe checkout session
- **Subscription Creation and Verification**: Tests the webhook handling and subscription verification
- **Subscription Management**: Tests subscription cancellation and plan changes

### End-to-End Tests (`subscription-e2e.test.ts`)

These tests simulate a user interacting with the pricing page:

- **Guest User Journey**: Tests what happens when a non-logged-in user selects a plan
- **Logged-in User Journey**: Tests the checkout flow for authenticated users
- **Subscription Required Alert**: Tests the alert shown when users need a subscription
- **Subscription Success Flow**: Tests the verification of successful subscriptions

## Mocking Strategy

We use Vitest's mocking capabilities to simulate:

1. Database interactions using `executeQuery`
2. Stripe API interactions
3. HTTP requests using the `fetch` API
4. Next.js router and local storage

## Extending the Tests

When adding new features to the subscription system, you should:

1. Add unit tests for any new API endpoints
2. Add E2E tests for any new user interactions
3. Update existing tests if you modify the behavior of existing components

### Example: Adding a Test for a New API Endpoint

```typescript
it('should handle subscription pausing', async () => {
  // Mock the pause API
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  );

  const userId = 1;
  const subscriptionId = 'sub_test123';

  const response = await fetch('/api/subscriptions/pause', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      subscriptionId
    }),
  });

  const data = await response.json();

  // Verify the pause was successful
  expect(response.ok).toBe(true);
  expect(data).toHaveProperty('success', true);
});
```

## Troubleshooting

### Common Issues

1. **Mock Not Being Called**: Make sure your code is actually calling the dependency you're mocking.
   
2. **Test Intermittently Fails**: May be due to asynchronous code not being properly awaited.

3. **Mocked Function Returns Undefined**: Check that the mock implementation returns appropriate values.

### Debug Tips

- Use `console.log` within your test to see what's happening
- Inspect mock calls using `console.log(executeQuery.mock.calls)`
- Add `vi.restoreAllMocks()` in the `afterEach` if tests interfere with each other

## Continuous Integration

These tests run automatically in our CI pipeline. If they fail in CI but pass locally, it could be due to:

1. Environment differences
2. Timing issues with asynchronous code
3. Random test execution order

## Future Improvements

1. Add actual browser-based E2E tests using Playwright
2. Implement database seeding for more comprehensive tests
3. Add snapshot testing for UI components
4. Create more isolated tests by using a test database 