import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest Configuration
 * 
 * Unit and integration testing configuration for Kwami Playground
 */

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global test APIs
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.config.{js,ts}',
        '**/*.d.ts'
      ]
    },
    
    // Test match patterns
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'tests/e2e'
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hooks timeout
    hookTimeout: 10000
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'kwami': resolve(__dirname, '../kwami/index.ts')
    }
  }
});
