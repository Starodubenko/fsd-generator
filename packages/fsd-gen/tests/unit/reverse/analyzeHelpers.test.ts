
import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import {
    generateVariations,
    identifyTokens,
    resolveSourceRoot
} from '../../../src/lib/reverse/analyzeHelpers.js';

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
            expect(tokens['User']).toBe('{{entityName}}');
        });

        it('should find camel token if different', () => {
            const variations = generateVariations('User');
            const tokens = identifyTokens('const user = new User()', variations);
            expect(tokens['User']).toBe('{{entityName}}');
            expect(tokens['user']).toBe('{{entityNameCamel}}');
        });

        it('should not add camel token if same as pascal', () => {
            const variations = generateVariations('user'); // Already lowercase
            const tokens = identifyTokens('user', variations);
            // pascal will be 'User', camel will be 'user'
            expect(tokens['user']).toBe('{{entityNameCamel}}');
            expect(tokens['User']).toBeUndefined();
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
