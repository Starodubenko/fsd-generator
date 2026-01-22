import { describe, it, expect } from 'vitest';
import { normalizeLayers } from '../../../src/lib/reverse/buildHelpers.js';
import type { PresetSourceConfig } from '../../../src/lib/reverse/types.js';

describe('normalizeLayers - Multi-Root Support', () => {
    it('should handle single root (backward compatible)', () => {
        const config: PresetSourceConfig = {
            root: 'src/entities/User',
            targetLayer: 'entity'
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(1);
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[0].targetLayer).toBe('entity');
        expect(layers[0].resolvedName).toBeUndefined();
    });

    it('should handle array with unique names', () => {
        const config: PresetSourceConfig = {
            root: ['src/entities/User', 'src/features/Product'],
            targetLayer: 'entity'
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(2);
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[0].resolvedName).toBeUndefined(); // No conflict
        expect(layers[1].root).toBe('src/features/Product');
        expect(layers[1].resolvedName).toBeUndefined(); // No conflict
    });

    it('should resolve conflicts with numeric suffixes', () => {
        const config: PresetSourceConfig = {
            root: [
                'src/entities/User',
                'src/features/User',
                'src/widgets/User'
            ],
            targetLayer: 'entity'
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

    it('should handle mixed conflicts and unique names', () => {
        const config: PresetSourceConfig = {
            root: [
                'src/entities/User',
                'src/features/Product',
                'src/widgets/User',
                'src/pages/Dashboard'
            ],
            targetLayer: 'entity'
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(4);

        // User appears twice
        expect(layers[0].resolvedName).toBe('User');
        expect(layers[2].resolvedName).toBe('User1');

        // Product and Dashboard are unique
        expect(layers[1].resolvedName).toBeUndefined();
        expect(layers[3].resolvedName).toBeUndefined();
    });

    it('should work with layers config (no conflicts)', () => {
        const config: PresetSourceConfig = {
            layers: [
                { root: 'src/entities/User', targetLayer: 'entity' },
                { root: 'src/features/Auth', targetLayer: 'feature' }
            ]
        };

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(2);
        expect(layers[0].root).toBe('src/entities/User');
        expect(layers[1].root).toBe('src/features/Auth');
    });

    it('should return empty array when no root or layers', () => {
        const config: PresetSourceConfig = {};

        const layers = normalizeLayers(config);

        expect(layers).toHaveLength(0);
    });
});
