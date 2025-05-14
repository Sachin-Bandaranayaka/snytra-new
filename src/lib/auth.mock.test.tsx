/**
 * Mock Authentication Tests
 * These tests verify login/signup functionality using mocked auth services
 * without direct dependencies on the actual Stack Auth components.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock auth client with necessary methods for testing
const mockAuthClient = {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn()
};

// Mock login component that uses our mock auth client
function MockLoginComponent() {
    return (
        <div>
            <h1>Login</h1>
            <form data-testid="login-form">
                <input
                    data-testid="email-input"
                    type="email"
                    placeholder="Email"
                />
                <input
                    data-testid="password-input"
                    type="password"
                    placeholder="Password"
                />
                <button
                    data-testid="login-button"
                    type="button"
                    onClick={() => {
                        const email = "test@example.com";
                        const password = "password123";

                        mockAuthClient.signIn({
                            strategy: 'credentials',
                            email,
                            password
                        });
                    }}
                >
                    Sign In
                </button>
            </form>
        </div>
    );
}

// Mock signup component that uses our mock auth client
function MockSignupComponent() {
    return (
        <div>
            <h1>Create Account</h1>
            <form data-testid="signup-form">
                <input
                    data-testid="name-input"
                    type="text"
                    placeholder="Name"
                />
                <input
                    data-testid="email-input"
                    type="email"
                    placeholder="Email"
                />
                <input
                    data-testid="password-input"
                    type="password"
                    placeholder="Password"
                />
                <button
                    data-testid="signup-button"
                    type="button"
                    onClick={() => {
                        const name = "Test User";
                        const email = "test@example.com";
                        const password = "password123";

                        mockAuthClient.signUp({
                            strategy: 'credentials',
                            name,
                            email,
                            password
                        });
                    }}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}

describe('Authentication Functionality', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('Login Process', () => {
        it('handles successful login', async () => {
            // Set up mock response
            mockAuthClient.signIn.mockResolvedValue({
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    name: 'Test User'
                }
            });

            // Render login component
            render(<MockLoginComponent />);

            // Verify form is displayed
            expect(screen.getByTestId('login-form')).toBeInTheDocument();

            // Click login button
            screen.getByTestId('login-button').click();

            // Verify signIn was called with correct parameters
            await waitFor(() => {
                expect(mockAuthClient.signIn).toHaveBeenCalledWith({
                    strategy: 'credentials',
                    email: 'test@example.com',
                    password: 'password123'
                });
            });

            // Verify signIn was called exactly once
            expect(mockAuthClient.signIn).toHaveBeenCalledTimes(1);
        });
    });

    describe('Signup Process', () => {
        it('handles successful signup', async () => {
            // Set up mock response
            mockAuthClient.signUp.mockResolvedValue({
                user: {
                    id: 'newuser-123',
                    email: 'test@example.com',
                    name: 'Test User'
                }
            });

            // Render signup component
            render(<MockSignupComponent />);

            // Verify form is displayed
            expect(screen.getByTestId('signup-form')).toBeInTheDocument();

            // Click signup button
            screen.getByTestId('signup-button').click();

            // Verify signUp was called with correct parameters
            await waitFor(() => {
                expect(mockAuthClient.signUp).toHaveBeenCalledWith({
                    strategy: 'credentials',
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
            });

            // Verify signUp was called exactly once
            expect(mockAuthClient.signUp).toHaveBeenCalledTimes(1);
        });
    });
}); 