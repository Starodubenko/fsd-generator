import { describe, it, expect } from 'vitest';
import { toPascalCase } from '../../../src/lib/reverse/analyzeHelpers.js';

describe('toPascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
        expect(toPascalCase('user-action')).toBe('UserAction');
        expect(toPascalCase('user-profile-settings')).toBe('UserProfileSettings');
        expect(toPascalCase('my-component')).toBe('MyComponent');
    });

    it('should convert snake_case to PascalCase', () => {
        expect(toPascalCase('user_action')).toBe('UserAction');
        expect(toPascalCase('user_profile_settings')).toBe('UserProfileSettings');
    });

    it('should convert space-separated to PascalCase', () => {
        expect(toPascalCase('user action')).toBe('UserAction');
        expect(toPascalCase('user profile settings')).toBe('UserProfileSettings');
    });

    it('should handle already PascalCase strings', () => {
        expect(toPascalCase('UserAction')).toBe('UserAction');
        expect(toPascalCase('User')).toBe('User');
    });

    it('should handle camelCase strings', () => {
        expect(toPascalCase('userAction')).toBe('UserAction');
        expect(toPascalCase('user')).toBe('User');
    });

    it('should handle mixed formats', () => {
        expect(toPascalCase('user-action_profile')).toBe('UserActionProfile');
    });

    it('should handle single words', () => {
        expect(toPascalCase('user')).toBe('User');
        expect(toPascalCase('USER')).toBe('USER');
    });

    it('should handle empty strings', () => {
        expect(toPascalCase('')).toBe('');
    });
});
