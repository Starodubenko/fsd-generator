import { describe, it, expect } from 'vitest';
import { definePreset } from '../../../src/config/types.js';

describe('definePreset', () => {
    it('should return the config object directly', () => {
        const config = { discoveryMode: 'auto' as const };
        const result = definePreset(config);
        expect(result).toBe(config);
    });

    it('should return the config function directly', () => {
        const configFn = () => ({ discoveryMode: 'auto' as const });
        const result = definePreset(configFn);
        expect(result).toBe(configFn);
    });
});
