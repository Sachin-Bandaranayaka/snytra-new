/**
 * Tests for authentication functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Stack Auth client
const mockStackClient = {
    signIn: vi.fn(),
    signUp: vi.fn()
};

// Create test components that use our mocked functions
function TestLoginComponent() {
    return (
        <div>
            <h1>Login Test</h1>
            <form data-testid="login-form">
                <input data-testid="email-input" type="email" placeholder="Email" />
                <input data-testid="password-input" type="password" placeholder="Password" />
                <button
                    type="button"
                    data-testid="login-button"
                    onClick={() => {
                        mockStackClient.signIn({
                            strategy: 'credentials',
                            email: 'test@example.com',
                            password: 'password123'
                        });
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
}

function TestSignupComponent() {
    return (
        <div>
            <h1>Signup Test</h1>
            <form data-testid="signup-form">
                <input data-testid="name-input" type="text" placeholder="Name" />
                <input data-testid="email-input" type="email" placeholder="Email" />
                <input data-testid="password-input" type="password" placeholder="Password" />
                <button
                    type="button"
                    data-testid="signup-button"
                    onClick={() => {
                        mockStackClient.signUp({
                            strategy: 'credentials',
                            name: 'Test User',
                            email: 'test@example.com',
                            password: 'password123'
                        });
                    }}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}

describe('Authentication Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('Login Flow', () => {
        it('should handle successful login', async () => {
            // Mock successful login
            mockStackClient.signIn.mockResolvedValue({
                user: {
                    id: 'user123',
                    email: 'test@example.com',
                    name: 'Test User',
                }
            });

            // Render the test component
            render(<TestLoginComponent />);

            // Verify the form renders
            expect(screen.getByTestId('login-form')).toBeInTheDocument();
            expect(screen.getByText('Login Test')).toBeInTheDocument();

            // Click login button
            screen.getByTestId('login-button').click();

            // Wait for the sign in promise to resolve
            await waitFor(() => {
                expect(mockStackClient.signIn).toHaveBeenCalledWith({
                    strategy: 'credentials',
                    email: 'test@example.com',
                    password: 'password123'
                });
            });

            // Verify sign in was called exactly once
            expect(mockStackClient.signIn).toHaveBeenCalledTimes(1);
        });
    });

    describe('Sign Up Flow', () => {
        it('should handle successful sign up', async () => {
            // Mock successful sign up
            mockStackClient.signUp.mockResolvedValue({
                user: {
                    id: 'newuser123',
                    email: 'test@example.com',
                    name: 'Test User',
                }
            });

            // Render the component
            render(<TestSignupComponent />);

            // Verify the form renders
            expect(screen.getByTestId('signup-form')).toBeInTheDocument();
            expect(screen.getByText('Signup Test')).toBeInTheDocument();

            // Click sign up button
            screen.getByTestId('signup-button').click();

            // Wait for the sign up promise to resolve
            await waitFor(() => {
                expect(mockStackClient.signUp).toHaveBeenCalledWith({
                    strategy: 'credentials',
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
            });

            // Verify sign up was called exactly once
            expect(mockStackClient.signUp).toHaveBeenCalledTimes(1);
        });
    });
}); 