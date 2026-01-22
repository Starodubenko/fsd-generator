
import { describe, it, expect } from 'vitest';
import { normalizeLayers } from '../../../src/lib/reverse/buildHelpers.js';
import { resolveSourceRoot } from '../../../src/lib/reverse/analyzeHelpers.js';

describe('Reverse Engineering Robustness (Regression Tests)', () => {
    describe('normalizeLayers - Path Defense', () => {
        it('should handle nested arrays in layer root by flattening', () => {
            const config: any = {
                layers: [
                    {
                        root: [['src/entities/User']], // Nested array
                        targetLayer: 'entity'
                    }
                ]
            };

            const layers = normalizeLayers(config);
            expect(layers).toHaveLength(1);
            expect(typeof layers[0].root).toBe('string');
            expect(layers[0].root).toBe('src/entities/User');
        });

        it('should handle deeply nested arrays and non-string values', () => {
            const config: any = {
                root: [[['src/entities/User', 123]]],
                targetLayer: 'entity'
            };

            const layers = normalizeLayers(config);
            expect(layers).toHaveLength(2);
            expect(layers[0].root).toBe('src/entities/User');
            expect(layers[1].root).toBe('123'); // Should be cast to string
        });

        it('should handle empty or null roots gracefully', () => {
            const config: any = {
                layers: [
                    { root: null, targetLayer: 'entity' },
                    { root: undefined, targetLayer: 'feature' }
                ]
            };

            const layers = normalizeLayers(config);
            expect(layers).toHaveLength(0);
        });
    });

    describe('resolveSourceRoot - Path Defense', () => {
        const presetDir = '/abs/preset';

        it('should handle array-type globalRoot by taking first element', () => {
            const globalRoot: any = ['../src'];
            const result = resolveSourceRoot(presetDir, globalRoot, 'entities/User');

            // Should resolve to /abs/src/entities/User (or similar depending on resolution)
            expect(typeof result).toBe('string');
            expect(result).toContain('src');
            expect(result).toContain('entities/User');
        });

        it('should handle non-string globalRoot and layerRoot', () => {
            const globalRoot: any = 123;
            const layerRoot: any = 456;

            const result = resolveSourceRoot(presetDir, globalRoot, layerRoot);
            expect(typeof result).toBe('string');
            expect(result).toContain('123');
            expect(result).toContain('456');
        });
    });
});
