import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/auth/register/route';
import { sql } from '@/db/postgres';

// Mock NextResponse for testing environment
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: (data: any, init?: ResponseInit) => {
        const response = new Response(JSON.stringify(data), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });
        return response;
      },
    },
  };
});

// Mock data for testing
const simpleRegistrationData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'securePassword123'
};

const complexRegistrationData = {
  companyInfo: {
    name: 'Test Company Inc',
    industry: 'Technology',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
    businessSize: 'Small',
    numLocations: 1
  },
  contactDetails: {
    name: 'Jane Smith',
    jobTitle: 'CEO',
    email: 'jane.smith@testcompany.com',
    phone: '+1-555-0123'
  },
  accountCredentials: {
    username: 'janesmith',
    password: 'securePassword123',
    enableTwoFactor: false
  },
  legalCompliance: {
    acceptTerms: true,
    acceptPrivacyPolicy: true,
    taxId: '12-3456789',
    businessRegistration: 'REG123456'
  }
};

// Helper function to create mock NextRequest
function createMockRequest(data: any): NextRequest {
  return {
    json: async () => data,
  } as NextRequest;
}

// Helper function to clean up test data
async function cleanupTestUser(email: string) {
  try {
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (users.length > 0) {
      const userId = users[0].id;
      // Delete company_info first due to foreign key constraint
      await sql`DELETE FROM company_info WHERE user_id = ${userId}`;
      // Then delete user
      await sql`DELETE FROM users WHERE id = ${userId}`;
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

describe('Registration API', () => {
  // Increase timeout for database operations
  vi.setConfig({ testTimeout: 30000 });
  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestUser(simpleRegistrationData.email);
    await cleanupTestUser(complexRegistrationData.contactDetails.email);
  });

  describe('Simple Registration (CustomSignUp)', () => {
    it('should successfully register a user with simple data', async () => {
      const request = createMockRequest(simpleRegistrationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.message).toBe('User registered successfully');
      expect(responseData.user).toMatchObject({
        name: simpleRegistrationData.name,
        email: simpleRegistrationData.email,
        role: 'user'
      });

      // Verify user was created in database
      const users = await sql`SELECT * FROM users WHERE email = ${simpleRegistrationData.email}`;
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe(simpleRegistrationData.name);
      expect(users[0].password_hash).toBeTruthy();

      // Verify no company_info was created for simple registration
      const companyInfo = await sql`SELECT * FROM company_info WHERE user_id = ${users[0].id}`;
      expect(companyInfo).toHaveLength(0);
    }, 30000);

    it('should reject registration with missing fields', async () => {
      const incompleteData = {
        name: 'John Doe',
        email: 'john@example.com'
        // missing password
      };

      const request = createMockRequest(incompleteData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Validation failed');
      expect(responseData.errors).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const invalidData = {
        ...simpleRegistrationData,
        email: 'invalid-email'
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Validation failed');
    });

    it('should reject registration with short password', async () => {
      const invalidData = {
        ...simpleRegistrationData,
        password: '123' // too short
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Validation failed');
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      const request1 = createMockRequest(simpleRegistrationData);
      await POST(request1);

      // Attempt duplicate registration
      const request2 = createMockRequest(simpleRegistrationData);
      const response = await POST(request2);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.message).toBe('User with this email already exists');
    });
  });

  describe('Complex Registration (RegisterForm)', () => {
    it('should successfully register a user with complex data', async () => {
      const request = createMockRequest(complexRegistrationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.message).toBe('User registered successfully');
      expect(responseData.user).toMatchObject({
        name: complexRegistrationData.contactDetails.name,
        email: complexRegistrationData.contactDetails.email,
        role: 'user'
      });

      // Verify user was created in database
      const users = await sql`SELECT * FROM users WHERE email = ${complexRegistrationData.contactDetails.email}`;
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe(complexRegistrationData.contactDetails.name);
      expect(users[0].username).toBe(complexRegistrationData.accountCredentials.username);
      expect(users[0].phone).toBe(complexRegistrationData.contactDetails.phone);

      // Verify company_info was created
      const companyInfo = await sql`SELECT * FROM company_info WHERE user_id = ${users[0].id}`;
      expect(companyInfo).toHaveLength(1);
      expect(companyInfo[0].company_name).toBe(complexRegistrationData.companyInfo.name);
      expect(companyInfo[0].industry).toBe(complexRegistrationData.companyInfo.industry);
      expect(companyInfo[0].tax_id).toBe(complexRegistrationData.legalCompliance.taxId);
    });

    it('should reject complex registration with missing required fields', async () => {
      const incompleteData = {
        ...complexRegistrationData,
        companyInfo: {
          ...complexRegistrationData.companyInfo,
          name: '', // empty company name
        }
      };

      const request = createMockRequest(incompleteData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Validation failed');
    });

    it('should reject complex registration without accepting terms', async () => {
      const invalidData = {
        ...complexRegistrationData,
        legalCompliance: {
          ...complexRegistrationData.legalCompliance,
          acceptTerms: false
        }
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Validation failed');
    });

    it('should reject duplicate email or username registration', async () => {
      // First registration
      const request1 = createMockRequest(complexRegistrationData);
      await POST(request1);

      // Attempt duplicate registration with same email
      const duplicateEmailData = {
        ...complexRegistrationData,
        accountCredentials: {
          ...complexRegistrationData.accountCredentials,
          username: 'differentusername'
        }
      };
      const request2 = createMockRequest(duplicateEmailData);
      const response = await POST(request2);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.message).toBe('User with this email or username already exists');
    });
  });

  describe('Registration Type Detection', () => {
    it('should correctly identify simple registration format', async () => {
      const request = createMockRequest(simpleRegistrationData);
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      
      // Verify it was processed as simple registration (no company_info created)
      const users = await sql`SELECT * FROM users WHERE email = ${simpleRegistrationData.email}`;
      const companyInfo = await sql`SELECT * FROM company_info WHERE user_id = ${users[0].id}`;
      expect(companyInfo).toHaveLength(0);
    });

    it('should correctly identify complex registration format', async () => {
      const request = createMockRequest(complexRegistrationData);
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      
      // Verify it was processed as complex registration (company_info created)
      const users = await sql`SELECT * FROM users WHERE email = ${complexRegistrationData.contactDetails.email}`;
      const companyInfo = await sql`SELECT * FROM company_info WHERE user_id = ${users[0].id}`;
      expect(companyInfo).toHaveLength(1);
    });
  });
});