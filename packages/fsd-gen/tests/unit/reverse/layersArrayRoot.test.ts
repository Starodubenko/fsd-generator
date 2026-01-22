import { describe, it, expect } from 'vitest';
import { normalizeLayers } from '../../../src/lib/reverse/buildHelpers.js';
import type { PresetSourceConfig } from '../../../src/lib/reverse/types.js';

describe('normalizeLayers - Array Root in Layers', () => {
    it('should handle single root in layers (backward compatible)', () => {
        const config: PresetSourceConfig = {
            layers: [
                { root: 'src/entities/User', targetLayer: 'entity' }
            ]
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(1);
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[0].targetLayer).toBe('entity');
        expect(layers[0].resolvedName).toBeUndefined();
    });

    it('should expand array root in layers into multiple items', () => {
        const config: PresetSourceConfig = {
            layers: [
                {
                    root: ['src/entities/User', 'src/features/Product'],
                    targetLayer: 'entity'
                }
            ]
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(2);
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[0].targetLayer).toBe('entity');
        expect(layers[1].root).toBe('src/features/Product');
        expect(layers[1].targetLayer).toBe('entity');
    });

    it('should resolve conflicts in array root with numeric suffixes', () => {
        const config: PresetSourceConfig = {
            layers: [
                {
                    root: [
                        'src/entities/User',
                        'src/features/User',
                        'src/widgets/User'
                    ],
                    targetLayer: 'entity'
                }
            ]
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(3);

        // First occurrence keeps original name
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[0].resolvedName).toBe('User');

        // Second occurrence gets suffix "1"
        expect(layers[1].root).toBe('src/features/User');
        expect(layers[1].resolvedName).toBe('User1');

        // Third occurrence gets suffix "2"
        expect(layers[2].root).toBe('src/widgets/User');
        expect(layers[2].resolvedName).toBe('User2');
    });

    it('should handle multiple layers with mixed root types', () => {
        const config: PresetSourceConfig = {
            layers: [
                { root: 'src/entities/User', targetLayer: 'entity' },
                { root: ['src/features/Auth', 'src/features/Payment'], targetLayer: 'feature' }
            ]
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(3);
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[0].targetLayer).toBe('entity');
        expect(layers[1].root).toBe('src/features/Auth');
        expect(layers[1].targetLayer).toBe('feature');
        expect(layers[2].root).toBe('src/features/Payment');
        expect(layers[2].targetLayer).toBe('feature');
    });

    it('should work with top-level root array (backward compatible)', () => {
        const config: PresetSourceConfig = {
            root: ['src/entities/User', 'src/features/User'],
            targetLayer: 'entity'
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(2);
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[0].resolvedName).toBe('User');
        expect(layers[1].root).toBe('src/features/User');
        expect(layers[1].resolvedName).toBe('User1');
    });

    it('should return empty array when no root or layers', () => {
        const config: PresetSourceConfig = {};

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(0);
    });
});
