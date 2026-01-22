
import { describe, it, expect } from 'vitest';
import { normalizeLayers } from '../../../src/lib/reverse/buildHelpers.js';
import { applyTokens } from '../../../src/lib/reverse/buildHelpers.js';
import { resolveSourceRoot } from '../../../src/lib/reverse/analyzeHelpers.js';

describe('Exhaustive Edge Case Testing', () => {

    describe('Path Normalization (normalizeLayers)', () => {
        it('should handle deeply nested arrays and flatten them completely', () => {
            const config: any = {
                root: [[[['src/entities/User']]]],
                targetLayer: 'entity'
            };
            const layers = normalizeLayers(config);
            expect(layers).toHaveLength(1);
            expect(layers[0].root).toBe('src/entities/User');
        });

        it('should handle empty or nullish roots in arrays', () => {
            const config: any = {
                layers: [
                    { root: [null, undefined, 'path1'], targetLayer: 'entity' }
                ]
            };
            // Note: Currently my implementation treats String(null) as "null" and String(undefined) as "undefined"
            // But if it's a single value it skips if falsy.
            // Let's see what happens with .flat(Infinity) and String()
            const layers = normalizeLayers(config);
            expect(layers.map(l => l.root)).toContain('path1');
            expect(layers.map(l => l.root)).toContain('null');
            expect(layers.map(l => l.root)).toContain('undefined');
        });

        it('should handle non-string roots by converting to string', () => {
            const config: any = {
                root: [123, true, { toString: () => 'custom' }],
                targetLayer: 'entity'
            };
            const layers = normalizeLayers(config);
            expect(layers[0].root).toBe('123');
            expect(layers[1].root).toBe('true');
            expect(layers[2].root).toBe('custom');
        });

        it('should handle empty root arrays gracefully', () => {
            const config: any = {
                root: [],
                targetLayer: 'entity'
            };
            const layers = normalizeLayers(config);
            expect(layers).toHaveLength(0);
        });
    });

    describe('Token Replacement (applyTokens)', () => {
        it('should prioritize longer tokens even if they are prefixes', () => {
            const content = 'The UserProfile is active.';
            const tokens = {
                'User': 'Customer',
                'UserProfile': 'ClientAccount'
            };
            // UserProfile contains User. 
            // ClientAccount should be chosen for UserProfile.
            const result = applyTokens(content, tokens);
            expect(result).toBe('The ClientAccount is active.');
        });

        it('should handle regex-sensitive characters in tokens', () => {
            const content = 'Value is $100.';
            const tokens = {
                '$100': 'one hundred dollars'
            };
            const result = applyTokens(content, tokens);
            expect(result).toBe('Value is one hundred dollars.');
        });

        it('should handle tokens that are substrings of each other in any order', () => {
            const content = 'AAA BBB CCC';
            const tokens = {
                'AA': '1',
                'AAA': '2'
            };
            // Should replace AAA first -> '2 BBB CCC'
            const result = applyTokens(content, tokens);
            expect(result).toBe('2 BBB CCC');
        });
    });

    describe('Root Resolution (resolveSourceRoot)', () => {
        it('should handle globalRoot as an array (defensively)', () => {
            const presetDir = '/abs/preset';
            const globalRoot: any = ['/abs/external', 'ignored'];
            const result = resolveSourceRoot(presetDir, globalRoot, 'sub/path');
            // Should take first element of array
            expect(result).toBe('/abs/external/sub/path');
        });

        it('should handle missing globalRoot', () => {
            const presetDir = '/abs/preset';
            const result = resolveSourceRoot(presetDir, undefined, 'sub/path');
            expect(result).toBe('/abs/preset/sub/path');
        });
    });
});
