/**
 * A very simple test file without any React or external dependencies
 */
import { describe, it, expect } from 'vitest';

// Simple function to test
function add(a: number, b: number): number {
    return a + b;
}

describe('Simple Math Functions', () => {
    it('adds two numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
        expect(add(0, 0)).toBe(0);
    });
}); 