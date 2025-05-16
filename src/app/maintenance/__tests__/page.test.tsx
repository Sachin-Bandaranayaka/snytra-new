import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MaintenancePage from '../page';
import '@testing-library/jest-dom/vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => {
    return {
        default: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href} data-testid="link">
                {children}
            </a>
        ),
    };
});

// Mock next/image 
vi.mock('next/image', () => ({
    default: ({ src, alt, className }: any) => (
        <img src={src} alt={alt} className={className} />
    )
}));

describe('MaintenancePage', () => {
    it('should render the maintenance message', () => {
        render(<MaintenancePage />);

        // Check for main message
        expect(screen.getByText("We're under maintenance")).toBeInTheDocument();

        // Check for description
        expect(screen.getByText(/working hard to improve/i)).toBeInTheDocument();
    });

    it('should render the admin login link', () => {
        render(<MaintenancePage />);

        const adminLink = screen.getByText('Admin Login');
        expect(adminLink).toBeInTheDocument();
        expect(adminLink.closest('a')).toHaveAttribute('href', '/admin/login');
    });

    it('should render the try again button', () => {
        // Mock window.location.reload
        const reloadMock = vi.fn();
        Object.defineProperty(window, 'location', {
            value: { reload: reloadMock },
            writable: true,
        });

        render(<MaintenancePage />);

        const tryAgainButton = screen.getByText('Try Again');
        expect(tryAgainButton).toBeInTheDocument();

        // Test that clicking the button calls window.location.reload
        tryAgainButton.click();
        expect(reloadMock).toHaveBeenCalled();
    });
}); 