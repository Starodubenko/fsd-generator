import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],

    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'dist/**',
                'tests/**',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
            ],
        },
        include: ['tests/**/*.test.ts'],
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    resolve: {
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
});
