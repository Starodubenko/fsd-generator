import { describe, it, expect } from 'vitest';
import { validateConfig } from '../../../src/lib/config/validateConfig.js';

describe('validateConfig', () => {
    it('should return valid: true and the config for valid input', () => {
        const config = { rootDir: 'src', naming: 'error' };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
        expect(result.config).toEqual(config);
    });

    it('should return valid: false and an error message for invalid input', () => {
        const config = { naming: 'invalid-choice' };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
    });

    it('should handle optional fields correctly', () => {
        const config = {};
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
        expect(result.config).toEqual({});
    });
});
