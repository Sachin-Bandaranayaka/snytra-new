'use client';

import { useEffect } from 'react';

export default function InitMaintenanceMode() {
    useEffect(() => {
        // Check maintenance mode status on load
        const checkMaintenanceMode = async () => {
            try {
                await fetch('/api/maintenance-status');
            } catch (error) {
                console.error('Failed to initialize maintenance mode:', error);
            }
        };

        checkMaintenanceMode();
    }, []);

    return null; // This component doesn't render anything
} 