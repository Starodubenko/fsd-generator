import { describe, it, expect } from 'vitest';
import {
    EntityToken,
    EntityTokenValue,
    isEntityToken,
    FsdLayer,
    FsdLayerValue,
    isFsdLayer
} from '../../../src/lib/reverse/constants.js';

describe('EntityToken', () => {
    it('should have all required token types', () => {
        expect(EntityToken.NAME).toBe('{{name}}');
        expect(EntityToken.ENTITY_NAME).toBe('{{entityName}}');
        expect(EntityToken.ENTITY_NAME_CAMEL).toBe('{{entityNameCamel}}');
        expect(EntityToken.ENTITY_NAME_LOWER).toBe('{{entityNameLower}}');
        expect(EntityToken.ENTITY_NAME_UPPER).toBe('{{entityNameUpper}}');
        expect(EntityToken.ENTITY_NAME_KEBAB).toBe('{{entityNameKebab}}');
    });

    it('should have correct number of tokens', () => {
        const tokenCount = Object.keys(EntityToken).length;
        expect(tokenCount).toBe(6);
    });

    it('should have unique values', () => {
        const values = Object.values(EntityToken);
        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBe(values.length);
    });

    describe('isEntityToken', () => {
        it('should return true for valid entity token values', () => {
            expect(isEntityToken(EntityToken.NAME)).toBe(true);
            expect(isEntityToken(EntityToken.ENTITY_NAME)).toBe(true);
            expect(isEntityToken(EntityToken.ENTITY_NAME_CAMEL)).toBe(true);
            expect(isEntityToken(EntityToken.ENTITY_NAME_LOWER)).toBe(true);
            expect(isEntityToken(EntityToken.ENTITY_NAME_UPPER)).toBe(true);
            expect(isEntityToken(EntityToken.ENTITY_NAME_KEBAB)).toBe(true);
        });

        it('should return false for invalid tokens', () => {
            expect(isEntityToken('{{invalid}}')).toBe(false);
            expect(isEntityToken('name')).toBe(false);
            expect(isEntityToken('')).toBe(false);
            expect(isEntityToken('{{entityNameSnake}}')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(isEntityToken('{name}')).toBe(false);
            expect(isEntityToken('{{ name }}')).toBe(false);
            expect(isEntityToken('{{NAME}}')).toBe(false);
        });
    });
});

describe('FsdLayer', () => {
    it('should have all FSD layer types', () => {
        expect(FsdLayer.ENTITY).toBe('entity');
        expect(FsdLayer.FEATURE).toBe('feature');
        expect(FsdLayer.WIDGET).toBe('widget');
        expect(FsdLayer.PAGE).toBe('page');
        expect(FsdLayer.SHARED).toBe('shared');
    });

    it('should have correct number of layers', () => {
        const layerCount = Object.keys(FsdLayer).length;
        expect(layerCount).toBe(5);
    });

    it('should match FSD architecture layers', () => {
        const layers = Object.values(FsdLayer);
        expect(layers).toContain('entity');
        expect(layers).toContain('feature');
        expect(layers).toContain('widget');
        expect(layers).toContain('page');
        expect(layers).toContain('shared');
    });

    it('should have unique values', () => {
        const values = Object.values(FsdLayer);
        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBe(values.length);
    });

    describe('isFsdLayer', () => {
        it('should return true for valid FSD layer values', () => {
            expect(isFsdLayer(FsdLayer.ENTITY)).toBe(true);
            expect(isFsdLayer(FsdLayer.FEATURE)).toBe(true);
            expect(isFsdLayer(FsdLayer.WIDGET)).toBe(true);
            expect(isFsdLayer(FsdLayer.PAGE)).toBe(true);
            expect(isFsdLayer(FsdLayer.SHARED)).toBe(true);
        });

        it('should return false for invalid layers', () => {
            expect(isFsdLayer('invalid')).toBe(false);
            expect(isFsdLayer('component')).toBe(false);
            expect(isFsdLayer('')).toBe(false);
            expect(isFsdLayer('ENTITY')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(isFsdLayer('entities')).toBe(false);
            expect(isFsdLayer('features')).toBe(false);
            expect(isFsdLayer(' entity ')).toBe(false);
        });
    });
});

describe('Type safety', () => {
    it('EntityTokenValue should accept all EntityToken values', () => {
        const tokens: EntityTokenValue[] = [
            EntityToken.NAME,
            EntityToken.ENTITY_NAME,
            EntityToken.ENTITY_NAME_CAMEL,
            EntityToken.ENTITY_NAME_LOWER,
            EntityToken.ENTITY_NAME_UPPER,
            EntityToken.ENTITY_NAME_KEBAB
        ];

        expect(tokens).toHaveLength(6);
    });

    it('FsdLayerValue should accept all FsdLayer values', () => {
        const layers: FsdLayerValue[] = [
            FsdLayer.ENTITY,
            FsdLayer.FEATURE,
            FsdLayer.WIDGET,
            FsdLayer.PAGE,
            FsdLayer.SHARED
        ];

        expect(layers).toHaveLength(5);
    });
});

describe('Integration', () => {
    it('should work together in preset config', () => {
        const config = {
            files: [{
                path: 'index.ts',
                targetLayer: FsdLayer.ENTITY,
                tokens: {
                    'User': EntityToken.NAME
                }
            }]
        };

        expect(config.files[0].targetLayer).toBe('entity');
        expect(config.files[0].tokens['User']).toBe('{{name}}');
    });

    it('should validate config values', () => {
        const layer = FsdLayer.FEATURE;
        const token = EntityToken.ENTITY_NAME_CAMEL;

        expect(isFsdLayer(layer)).toBe(true);
        expect(isEntityToken(token)).toBe(true);
    });

    it('should support all combinations', () => {
        const layers = Object.values(FsdLayer);
        const tokens = Object.values(EntityToken);

        layers.forEach(layer => {
            expect(isFsdLayer(layer)).toBe(true);
        });

        tokens.forEach(token => {
            expect(isEntityToken(token)).toBe(true);
        });
    });
});
