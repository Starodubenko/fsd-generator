
import { describe, it, expect } from 'vitest';
import { toPascalCase, toCamelCase, toKebabCase } from '../../../src/lib/naming/names.js';

describe('Naming Utils', () => {
    describe('toPascalCase', () => {
        it('should convert kebab to Pascal', () => {
            expect(toPascalCase('user-profile')).toBe('UserProfile');
        });
        it('should convert string to Pascal', () => {
            expect(toPascalCase('user')).toBe('User');
        });
    });

    describe('toCamelCase', () => {
        it('should convert kebab to camel', () => {
            expect(toCamelCase('user-profile')).toBe('userProfile');
        });
    });

    describe('toKebabCase', () => {
        it('should convert Pascal to kebab', () => {
            expect(toKebabCase('UserProfile')).toBe('user-profile');
        });
        it('should convert camel to kebab', () => {
            expect(toKebabCase('userProfile')).toBe('user-profile');
        });
    });
});
