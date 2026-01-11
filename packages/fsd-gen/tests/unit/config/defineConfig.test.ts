import { describe, it, expect } from 'vitest';
import { defineConfig } from '../../../src/config/defineConfig.js';

describe('defineConfig', () => {
    it('should return the config object passed to it', () => {
        const config = { rootDir: 'src', naming: 'error' as const };
        expect(defineConfig(config)).toBe(config);
    });
});
