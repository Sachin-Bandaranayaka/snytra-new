/**
 * Vitest configuration
 */
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
      ],
    },
    testTimeout: 10000,
    mockReset: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 