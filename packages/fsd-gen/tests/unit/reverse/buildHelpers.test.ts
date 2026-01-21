
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    normalizeLayers,
    detectEntityToken,
    applyTokens,
    guessConventions,
    generateShortPresetContent,
    generateEjectedPresetContent
} from '../../../src/lib/reverse/buildHelpers.js';

describe('buildHelpers', () => {
    describe('normalizeLayers', () => {
        it('should return layers from config if present', () => {
            const config = { layers: [{ root: 'src', targetLayer: 'entity' }] } as any;
            expect(normalizeLayers(config)).toEqual(config.layers);
        });

        it('should return normalized root if layers missing', () => {
            const config = { root: 'src', targetLayer: 'feature' } as any;
            expect(normalizeLayers(config)).toEqual([{ root: 'src', targetLayer: 'feature' }]);
        });

        it('should default to entity if targetLayer missing', () => {
            const config = { root: 'src' } as any;
            expect(normalizeLayers(config)).toEqual([{ root: 'src', targetLayer: 'entity' }]);
        });
    });

    describe('detectEntityToken', () => {
        it('should return the token mapping to {{name}}', () => {
            const config = {
                files: [
                    { tokens: { 'User': '{{name}}' } }
                ]
            } as any;
            expect(detectEntityToken(config)).toBe('User');
        });

        it('should return the token mapping to {{entityName}}', () => {
            const config = {
                files: [
                    { tokens: { 'Product': '{{entityName}}' } }
                ]
            } as any;
            expect(detectEntityToken(config)).toBe('Product');
        });

        it('should return empty string if no entity token found', () => {
            const config = {
                files: [{ tokens: { 'Other': '{{other}}' } }]
            } as any;
            expect(detectEntityToken(config)).toBe('');
        });
    });

    describe('applyTokens', () => {
        it('should replace tokens correctly', () => {
            const content = 'Hello User';
            const tokens = { 'User': '{{name}}' };
            expect(applyTokens(content, tokens)).toBe('Hello {{name}}');
        });

        it('should prioritize longer tokens', () => {
            const content = 'UserProfile';
            const tokens = { 'User': '{{name}}', 'UserProfile': '{{name}}Profile' };
            expect(applyTokens(content, tokens)).toBe('{{name}}Profile');
        });

        it('should handle special regex characters in tokens', () => {
            const content = 'My(Token)';
            const tokens = { 'My(Token)': '{{token}}' };
            expect(applyTokens(content, tokens)).toBe('{{token}}');
        });
    });

    describe('guessConventions', () => {
        it('should detect prefixes and suffixes', () => {
            const layers = [
                { root: 'src/features/ManageUser', targetLayer: 'feature' },
                { root: 'src/widgets/UserTable', targetLayer: 'widget' },
                { root: 'src/pages/UserPage', targetLayer: 'page' }
            ] as any;
            const conventions = guessConventions(layers, 'User');
            expect(conventions).toEqual({
                featurePrefix: 'Manage',
                widgetSuffix: 'Table',
                pageSuffix: 'Page'
            });
        });

        it('should use default token if none detected', () => {
            const layers = [{ root: 'src/features/ManageUser', targetLayer: 'feature' }] as any;
            const conventions = guessConventions(layers, ''); // Detects via 'User' fallback
            expect(conventions.featurePrefix).toBe('Manage');
        });
    });

    describe('generateShortPresetContent', () => {
        it('should generate valid preset script', () => {
            const helpers = { featurePrefix: 'Manage' };
            const content = generateShortPresetContent(helpers);
            expect(content).toContain("discoveryMode: 'auto'");
            expect(content).toContain("featureSlicePrefix: 'Manage'");
        });
    });

    describe('generateEjectedPresetContent', () => {
        it('should generate valid ejected preset script', () => {
            const files = [{ path: 'User.tsx', targetLayer: 'entity', tokens: { 'User': '{{name}}' } }];
            const layers = [{ root: 'src/entities/User', targetLayer: 'entity' }];
            const content = generateEjectedPresetContent('test-preset', files, layers as any, 'User');
            expect(content).toContain('actions: [');
            expect(content).toContain('entities/{{name}}/{{name}}.tsx');
        });

        it('should handle different layers in ejected mode', () => {
            const files = [
                { path: 'f.ts', targetLayer: 'feature', tokens: {} },
                { path: 'w.ts', targetLayer: 'widget', tokens: {} },
                { root: 'p.ts', targetLayer: 'page', tokens: {} },
                { root: 's.ts', targetLayer: 'shared', tokens: {} }
            ];
            const content = generateEjectedPresetContent('test', files as any, [], '');
            expect(content).toContain('features/');
            expect(content).toContain('widgets/');
            expect(content).toContain('pages/');
            expect(content).toContain('shared/');
        });
    });
});
