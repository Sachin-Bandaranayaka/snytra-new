import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import InitMaintenanceMode from '../InitMaintenanceMode';
import '@testing-library/jest-dom/vitest';

// Mock global fetch
const mockFetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ maintenanceMode: false }),
    })
);

global.fetch = mockFetch;

describe('InitMaintenanceMode Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should render nothing', () => {
        const { container } = render(<InitMaintenanceMode />);
        expect(container.firstChild).toBeNull();
    });

    it('should fetch the maintenance status on mount', () => {
        render(<InitMaintenanceMode />);

        // Verify fetch was called
        expect(mockFetch).toHaveBeenCalledWith('/api/maintenance-status');
    });

    it('should handle fetch errors gracefully', async () => {
        // Mock console.error to prevent test output noise
        const originalConsoleError = console.error;
        console.error = vi.fn();

        // Make fetch throw an error
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        // Render the component
        render(<InitMaintenanceMode />);

        // Wait for the effect to run
        await new Promise(resolve => setTimeout(resolve, 0));

        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
            'Failed to initialize maintenance mode:',
            expect.any(Error)
        );

        // Restore console.error
        console.error = originalConsoleError;
    });
}); 