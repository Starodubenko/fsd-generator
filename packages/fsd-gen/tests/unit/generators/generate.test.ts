import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveTemplateType, generateHook, generateStyles } from '../../../src/lib/generators/generate.js';
import { DEFAULT_TEMPLATE, FSD_LAYERS, ACTION_TYPES } from '../../../src/lib/constants.js';
import * as fs from 'fs/promises';
import * as templateLoader from '../../../src/lib/templates/templateLoader.js';
import * as updateBarrels from '../../../src/lib/barrels/updateBarrels.js';

vi.mock('fs/promises');
vi.mock('../../../src/lib/templates/templateLoader.js');
vi.mock('../../../src/lib/barrels/updateBarrels.js');
vi.mock('../../../src/lib/config/configLoader.js', () => ({
    loadConfig: vi.fn().mockResolvedValue({ templatesDir: '.fsd-templates' })
}));

describe('generate', () => {
    describe('resolveTemplateType', () => {
        it('should return correct template for shared layer', () => {
            const result = resolveTemplateType(FSD_LAYERS.SHARED);
            expect(result).toEqual({
                templatePath: 'ui-basic',
                layerArg: FSD_LAYERS.SHARED,
            });
        });

        it('should return correct template for entity layer', () => {
            const result = resolveTemplateType(FSD_LAYERS.ENTITY);
            expect(result).toEqual({
                templatePath: 'model-ui-basic',
                layerArg: FSD_LAYERS.ENTITY,
            });
        });

        it('should return correct template for feature layer', () => {
            const result = resolveTemplateType(FSD_LAYERS.FEATURE);
            expect(result).toEqual({
                templatePath: 'ui-model-basic',
                layerArg: FSD_LAYERS.FEATURE,
            });
        });

        it('should return correct template for widget layer', () => {
            const result = resolveTemplateType(FSD_LAYERS.WIDGET);
            expect(result).toEqual({
                templatePath: 'ui-basic',
                layerArg: FSD_LAYERS.WIDGET,
            });
        });

        it('should return correct template for page layer', () => {
            const result = resolveTemplateType(FSD_LAYERS.PAGE);
            expect(result).toEqual({
                templatePath: 'ui-basic',
                layerArg: FSD_LAYERS.PAGE,
            });
        });

        it('should use template override when provided', () => {
            const result = resolveTemplateType('entity', 'custom/template');
            expect(result).toEqual({
                templatePath: 'custom/template',
                layerArg: '',
            });
        });

        it('should fall back to default template for unknown layer', () => {
            const result = resolveTemplateType('unknown');
            expect(result).toEqual({
                templatePath: DEFAULT_TEMPLATE,
                layerArg: 'unknown',
            });
        });

        // P0: Critical edge cases
        it('should handle empty string layer', () => {
            const result = resolveTemplateType('');
            expect(result).toEqual({
                templatePath: DEFAULT_TEMPLATE,
                layerArg: '',
            });
        });

        it('should treat empty string as falsy (no override)', () => {
            // Empty string is falsy, so it falls back to default template
            const result = resolveTemplateType('entity', '');
            expect(result).toEqual({
                templatePath: 'model-ui-basic', // Uses entity default
                layerArg: 'entity', // Layer is set
            });
        });

        it('should handle undefined template override', () => {
            const result = resolveTemplateType('entity', undefined);
            expect(result).toEqual({
                templatePath: 'model-ui-basic',
                layerArg: 'entity',
            });
        });

        // P1: Security - path traversal
        it('should allow path traversal in template override (no sanitization)', () => {
            // This documents current behavior - no path sanitization
            const result = resolveTemplateType('entity', '../../malicious/template');
            expect(result).toEqual({
                templatePath: '../../malicious/template',
                layerArg: '',
            });
        });

        it('should allow absolute paths in template override', () => {
            const result = resolveTemplateType('entity', '/absolute/path/template');
            expect(result).toEqual({
                templatePath: '/absolute/path/template',
                layerArg: '',
            });
        });

        // P1: Case sensitivity
        it('should be case-sensitive for layer names', () => {
            const result1 = resolveTemplateType('Entity'); // Capitalized
            expect(result1.templatePath).toBe(DEFAULT_TEMPLATE); // Falls back

            const result2 = resolveTemplateType('ENTITY'); // All caps
            expect(result2.templatePath).toBe(DEFAULT_TEMPLATE); // Falls back
        });

        // P1: Special characters
        it('should handle special characters in layer name', () => {
            const result = resolveTemplateType('my-layer');
            expect(result).toEqual({
                templatePath: DEFAULT_TEMPLATE,
                layerArg: 'my-layer',
            });
        });
        describe('generateHook', () => {
            beforeEach(() => {
                vi.clearAllMocks();
            });

            it('should generate a hook file and update barrels', async () => {
                const paths = {
                    slicePath: 'src/entities/User',
                    uiPath: 'src/entities/User/ui',
                    uiPublicPath: 'src/entities/User/ui',
                    componentPath: 'src/entities/User/ui/useUser',
                    modelPath: 'src/entities/User/model',
                    apiPath: 'src/entities/User/api'
                };
                const context = { componentName: 'useUser', sliceName: 'User', layer: 'entity' };
                const templatePath = 'api/get';

                vi.mocked(templateLoader.loadTemplate).mockResolvedValue({ component: 'hook content', styles: '' });
                vi.mocked(templateLoader.processTemplate).mockReturnValue('processed hook content');

                await generateHook(paths as any, context as any, templatePath);

                expect(fs.writeFile).toHaveBeenCalledWith('src/entities/User/ui/useUser.ts', 'processed hook content');
                expect(updateBarrels.updateBarrel).toHaveBeenCalledWith('src/entities/User/ui', 'useUser', 'useUser');
                expect(updateBarrels.updateBarrel).toHaveBeenCalledWith('src/entities/User', 'ui', 'ui');
            });
        });

        describe('generateStyles', () => {
            beforeEach(() => {
                vi.clearAllMocks();
            });

            it('should generate a styles file and update barrels', async () => {
                const paths = {
                    slicePath: 'src/features/Auth',
                    uiPath: 'src/features/Auth/ui',
                    uiPublicPath: 'src/features/Auth/ui',
                    componentPath: 'src/features/Auth/ui/LoginForm',
                    modelPath: 'src/features/Auth/model',
                    apiPath: 'src/features/Auth/api'
                };
                const context = { componentName: 'LoginForm', sliceName: 'Auth', layer: 'feature' };
                const templatePath = 'ui/styles';

                vi.mocked(templateLoader.loadTemplate).mockResolvedValue({ component: '', styles: 'styles content' });
                vi.mocked(templateLoader.processTemplate).mockReturnValue('processed styles content');

                await generateStyles(paths as any, context as any, templatePath);

                expect(fs.writeFile).toHaveBeenCalledWith('src/features/Auth/ui/LoginForm.styles.ts', 'processed styles content');
                expect(updateBarrels.updateBarrel).toHaveBeenCalledWith('src/features/Auth/ui', 'LoginForm', 'LoginForm');
                expect(updateBarrels.updateBarrel).toHaveBeenCalledWith('src/features/Auth', 'ui', 'ui');
            });
        });
    });
});
