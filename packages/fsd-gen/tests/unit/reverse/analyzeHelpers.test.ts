
import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import {
    generateVariations,
    identifyTokens,
    resolveSourceRoot
} from '../../../src/lib/reverse/analyzeHelpers.js';
import { EntityToken } from '../../../src/lib/reverse/constants.js';

describe('analyzeHelpers', () => {
    describe('generateVariations', () => {
        it('should generate all variations for a given string', () => {
            const variations = generateVariations('UserProfile');
            expect(variations.pascal).toBe('UserProfile');
            expect(variations.camel).toBe('userProfile');
            expect(variations.lower).toBe('userprofile');
            expect(variations.upper).toBe('USERPROFILE');
            expect(variations.kebab).toBe('user-profile');
        });
    });

    describe('identifyTokens', () => {
        it('should find pascal token', () => {
            const variations = generateVariations('User');
            const tokens = identifyTokens('class User {}', variations);
            expect(tokens['User']).toBe(EntityToken.ENTITY_NAME);
        });

        it('should find camel token if different', () => {
            const variations = generateVariations('User');
            const tokens = identifyTokens('const user = new User()', variations);
            expect(tokens['User']).toBe(EntityToken.ENTITY_NAME);
            expect(tokens['user']).toBe(EntityToken.ENTITY_NAME_CAMEL);
        });

        it('should find lower token', () => {
            const variations = generateVariations('UserProfile');
            const tokens = identifyTokens('const path = "/userprofile"', variations);
            expect(tokens['userprofile']).toBe(EntityToken.ENTITY_NAME_LOWER);
        });

        it('should find upper token', () => {
            const variations = generateVariations('UserProfile');
            const tokens = identifyTokens('const TYPE = "USERPROFILE"', variations);
            expect(tokens['USERPROFILE']).toBe(EntityToken.ENTITY_NAME_UPPER);
        });

        it('should find kebab token', () => {
            const variations = generateVariations('UserProfile');
            const tokens = identifyTokens('div.user-profile {}', variations);
            expect(tokens['user-profile']).toBe(EntityToken.ENTITY_NAME_KEBAB);
        });

        it('should not add camel token if same as pascal', () => {
            const variations = generateVariations('user'); // Already lowercase
            const tokens = identifyTokens('user', variations);
            // pascal will be 'User', camel will be 'user'
            expect(tokens['user']).toBe(EntityToken.ENTITY_NAME_CAMEL);
            expect(tokens['User']).toBeUndefined();
        });

        it('should handle single word subject correctly (matching camel/lower/kebab)', () => {
            const variations = generateVariations('User');
            // User: pascal: User, camel: user, lower: user, upper: USER, kebab: user
            const tokens = identifyTokens('user USER', variations);
            expect(tokens['user']).toBe(EntityToken.ENTITY_NAME_CAMEL); // First one wins in our implementation logic
            expect(tokens['USER']).toBe(EntityToken.ENTITY_NAME_UPPER);
            expect(Object.keys(tokens)).toHaveLength(2);
        });
    });

    describe('resolveSourceRoot', () => {
        it('should resolve relative to presetDir if no globalRoot', () => {
            const presetDir = '/app/preset/table';
            const resolved = resolveSourceRoot(presetDir, undefined, 'src');
            expect(resolved).toBe(resolve(presetDir, 'src'));
        });

        it('should resolve relative to globalRoot if provided', () => {
            const presetDir = '/app/preset/table';
            const globalRoot = '../../'; // Resolves to /app/
            const resolved = resolveSourceRoot(presetDir, globalRoot, 'src');
            expect(resolved).toBe(resolve(presetDir, globalRoot, 'src'));
        });
    });
});
