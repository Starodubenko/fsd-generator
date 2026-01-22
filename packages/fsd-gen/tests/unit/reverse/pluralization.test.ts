import { describe, it, expect } from 'vitest';
import { pluralize, singularize, generateVariations } from '../../../src/lib/reverse/analyzeHelpers.js';

describe('Pluralization and Singularization', () => {
    describe('pluralize', () => {
        it('should add s to regular words', () => {
            expect(pluralize('User')).toBe('Users');
            expect(pluralize('Product')).toBe('Products');
        });

        it('should handle words ending in y', () => {
            expect(pluralize('Category')).toBe('Categories');
            expect(pluralize('Company')).toBe('Companies');
        });

        it('should not change y after vowels', () => {
            expect(pluralize('Day')).toBe('Days');
            expect(pluralize('Key')).toBe('Keys');
        });

        it('should add es to words ending in x, ch, sh, ss', () => {
            expect(pluralize('Box')).toBe('Boxes');
            expect(pluralize('Batch')).toBe('Batches');
            expect(pluralize('Brush')).toBe('Brushes');
        });

        it('should not change already plural words', () => {
            expect(pluralize('Users')).toBe('Users');
            expect(pluralize('Products')).toBe('Products');
        });
    });

    describe('singularize', () => {
        it('should remove s from regular words', () => {
            expect(singularize('Users')).toBe('User');
            expect(singularize('Products')).toBe('Product');
        });

        it('should handle words ending in ies', () => {
            expect(singularize('Categories')).toBe('Category');
            expect(singularize('Companies')).toBe('Company');
        });

        it('should handle words ending in xes, ches, shes, sses', () => {
            expect(singularize('Boxes')).toBe('Box');
            expect(singularize('Batches')).toBe('Batch');
            expect(singularize('Brushes')).toBe('Brush');
            expect(singularize('Classes')).toBe('Class');
        });

        it('should not change already singular words', () => {
            expect(singularize('User')).toBe('User');
            expect(singularize('Product')).toBe('Product');
        });

        it('should not remove s from words ending in ss', () => {
            expect(singularize('Class')).toBe('Class');
        });
    });

    describe('generateVariations with plural/singular', () => {
        it('should include plural variations for singular input', () => {
            const variations = generateVariations('User');

            expect(variations.pascal).toBe('User');
            expect(variations.plural).toBe('Users');
            expect(variations.pluralCamel).toBe('users');
            expect(variations.pluralLower).toBe('users');
            expect(variations.pluralUpper).toBe('USERS');
            expect(variations.pluralKebab).toBe('users');
        });

        it('should include singular variations for plural input', () => {
            const variations = generateVariations('Users');

            expect(variations.pascal).toBe('Users');
            expect(variations.singular).toBe('User');
            expect(variations.singularCamel).toBe('user');
            expect(variations.singularLower).toBe('user');
            expect(variations.singularUpper).toBe('USER');
            expect(variations.singularKebab).toBe('user');
        });

        it('should handle Category/Categories', () => {
            const variations = generateVariations('Category');

            expect(variations.plural).toBe('Categories');
            expect(variations.pluralCamel).toBe('categories');
            expect(variations.pluralKebab).toBe('categories');
        });

        it('should handle Box/Boxes', () => {
            const variations = generateVariations('Box');

            expect(variations.plural).toBe('Boxes');
            expect(variations.pluralCamel).toBe('boxes');
        });
    });
});
