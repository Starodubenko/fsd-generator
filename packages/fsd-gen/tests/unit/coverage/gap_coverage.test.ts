import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { injectRoute } from '../../../src/lib/routing/injectRoute.js';
import { loadFileTemplate, executeHookAction, executeStylesAction } from '../../../src/lib/preset/actionExecution.js';
import { generatePreset } from '../../../src/lib/generators/generatePreset.js';
import { ROUTING } from '../../../src/lib/constants.js';
import * as fs from 'fs/promises';

const { mockJitiImport } = vi.hoisted(() => ({
    mockJitiImport: vi.fn()
}));

vi.mock('fs/promises');
vi.mock('jiti', () => ({
    createJiti: vi.fn(() => ({
        import: mockJitiImport
    }))
}));
vi.mock('../../../src/lib/generators/generate.js', () => ({
    generateComponent: vi.fn(),
    generateHook: vi.fn(),
    generateStyles: vi.fn()
}));
vi.mock('../../../src/lib/config/loadConfig.js');
vi.mock('../../../src/lib/templates/templateLoader.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        resolvePresetDir: vi.fn(),
        processTemplate: (str: any) => str, // Simple pass-through for easier testing
    };
});
vi.mock('../../../src/lib/preset/presetLoading.js');
vi.mock('../../../src/lib/preset/presetDiscovery.js');
vi.mock('../../../src/lib/preset/actionExecution.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        executeActions: vi.fn() // Spy on this
    };
});
vi.mock('../../../src/lib/naming/resolvePaths.js', () => ({
    resolveFsdPaths: vi.fn(() => ({}))
}));
vi.mock('../../../src/lib/barrels/updateBarrels.js');

describe('Coverage Gap Filling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('injectRoute Edge Cases', () => {
        const defaultOptions = {
            rootDir: 'src',
            path: '/test',
            importPath: '@pages/Test',
            componentName: 'TestPage'
        };

        it('should handle App.tsx not found (ENOENT)', async () => {
            const error = new Error('File not found');
            (error as any).code = 'ENOENT';
            vi.mocked(fs.readFile).mockRejectedValue(error);

            await injectRoute(defaultOptions);

            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Routing target file not found: src/App.tsx'));
        });

        it('should rethrow non-ENOENT errors', async () => {
            const error = new Error('Permission denied');
            (error as any).code = 'EACCES';
            vi.mocked(fs.readFile).mockRejectedValue(error);

            await expect(injectRoute(defaultOptions)).rejects.toThrow('Permission denied');
        });

        it('should warn if routing marker is missing', async () => {
            vi.mocked(fs.readFile).mockResolvedValue('const App = () => <div></div>;');

            await injectRoute(defaultOptions);

            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('comment not found'));
            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it('should skip import if already exists', async () => {
            const content = `import { TestPage } from '@pages/Test';
${ROUTING.MARKER}`;
            vi.mocked(fs.readFile).mockResolvedValue(content);

            await injectRoute(defaultOptions);

            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Import for TestPage already exists'));
            expect(fs.writeFile).toHaveBeenCalled();
        });

        it('should skip route if already exists', async () => {
            const content = `${ROUTING.MARKER}
<Route path="/test" element={<TestPage />} />`;
            vi.mocked(fs.readFile).mockResolvedValue(content);

            await injectRoute(defaultOptions);

            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Route for path "/test" already exists'));
            expect(fs.writeFile).not.toHaveBeenCalled();
        });
    });

    describe('loadFileTemplate Edge Cases', () => {
        it('should fallback to reading file as string if module load fails', async () => {
            const templatePath = 'template.ts';
            mockJitiImport.mockRejectedValue(new Error('Failed to load'));
            vi.mocked(fs.readFile).mockResolvedValue('template content');

            const result = await loadFileTemplate(templatePath);

            expect(result).toBe('template content');
            expect(fs.readFile).toHaveBeenCalled();
        });

        it('should throw error if both module load and readFile fail', async () => {
            const templatePath = 'template.ts';
            mockJitiImport.mockRejectedValue(new Error('Failed to load module'));
            vi.mocked(fs.readFile).mockRejectedValue(new Error('Failed to read file'));

            await expect(loadFileTemplate(templatePath)).rejects.toThrow('Could not find file template');
        });

        it('should throw error if template file does not exist (non-TS)', async () => {
            const templatePath = 'template.txt';
            vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

            await expect(loadFileTemplate(templatePath)).rejects.toThrow('Could not find file template');
        });

        it('should load template as module if valid', async () => {
            const templatePath = 'template.ts';
            const mockTemplateFn = () => 'module content';
            mockJitiImport.mockResolvedValue({ default: mockTemplateFn });

            const result = await loadFileTemplate(templatePath);

            expect(result).toBe(mockTemplateFn);
        });
    });

    describe('Global Variable Handling', () => {
        it('should use provided global variables from preset config', async () => {
            const { prepareActionVariables } = await import('../../../src/lib/preset/actionExecution.js');
            const variables = prepareActionVariables(
                { type: 'component', layer: 'entity', slice: 'User', variables: { local: 'val' } } as any,
                'User',
                { global: 'var' }
            );
            expect(variables.global).toBe('var');
            expect(variables.local).toBe('val');
        });

        it('should handle undefined global variables', async () => {
            const { executeActions } = await import('../../../src/lib/preset/actionExecution.js');
            const { loadPresetConfig } = await import('../../../src/lib/preset/presetLoading.js');
            const { loadConfig } = await import('../../../src/lib/config/loadConfig.js');
            const { resolvePresetDir } = await import('../../../src/lib/templates/templateLoader.js');

            vi.mocked(loadConfig).mockResolvedValue({ templatesDir: 'tpl' });
            vi.mocked(resolvePresetDir).mockResolvedValue('/abs/tpl/preset');
            vi.mocked(loadPresetConfig).mockResolvedValue({
                variables: undefined,
                discoveryMode: 'manual',
                actions: [{ type: 'file', path: 'dummy', template: 'tpl' }]
            } as any);

            await generatePreset('presetName', 'EntityName');
            expect(executeActions).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                {},
                expect.anything()
            );
        });

        it('should pass global variables from preset config to executeActions', async () => {
            const { loadConfig } = await import('../../../src/lib/config/loadConfig.js');
            const { resolvePresetDir } = await import('../../../src/lib/templates/templateLoader.js');
            const { loadPresetConfig } = await import('../../../src/lib/preset/presetLoading.js');
            const { executeActions } = await import('../../../src/lib/preset/actionExecution.js');
            const { discoverTemplates } = await import('../../../src/lib/preset/presetDiscovery.js');

            vi.mocked(loadConfig).mockResolvedValue({ templatesDir: 'tpl' });
            vi.mocked(resolvePresetDir).mockResolvedValue('/abs/tpl/preset');
            vi.mocked(loadPresetConfig).mockResolvedValue({
                variables: { globalVar: 'exists' },
                discoveryMode: 'auto'
            } as any);
            vi.mocked(discoverTemplates).mockResolvedValue([{ type: 'component', layer: 'entity' }] as any);

            await generatePreset('presetName', 'EntityName');

            expect(executeActions).toHaveBeenCalledWith(
                expect.any(Array),
                'EntityName',
                expect.objectContaining({ globalVar: 'exists' }),
                expect.anything()
            );
        });
    });

    describe('Action Execution Types', () => {
        it('should execute hook action', async () => {
            const action = {
                type: 'hook',
                layer: 'entity',
                slice: 'User',
                name: 'useUser',
                template: 'hook-template'
            };
            const variables = { base: 'var' };
            const config = { rootDir: 'src', templatesDir: 'templates' };

            await executeHookAction(action as any, variables, config as any);

            const { generateHook } = await import('../../../src/lib/generators/generate.js');
            expect(generateHook).toHaveBeenCalled();
        });

        it('should execute styles action', async () => {
            const action = {
                type: 'styles',
                layer: 'entity',
                slice: 'User',
                name: 'UserStyles',
                template: 'styles-template'
            };
            const variables = { base: 'var' };
            const config = { rootDir: 'src', templatesDir: 'templates' };

            await executeStylesAction(action as any, variables, config as any);

            const { generateStyles } = await import('../../../src/lib/generators/generate.js');
            expect(generateStyles).toHaveBeenCalled();
        });

        it('should fallback to slice name if action.name is missing (Component)', async () => {
            const { executeComponentAction } = await import('../../../src/lib/preset/actionExecution.js');
            const action = {
                type: 'component',
                layer: 'entity',
                slice: 'User',
                template: 'tpl'
            };
            const variables = { base: 'var' };
            const config = { rootDir: 'src' };

            await executeComponentAction(action as any, variables, config as any);

            const { generateComponent } = await import('../../../src/lib/generators/generate.js');
            const callArgs = vi.mocked(generateComponent).mock.calls[0];
            const context: any = callArgs[1];
            expect(context.componentName).toBe('User');
        });

        it('should fallback to slice name if action.name is missing (Hook)', async () => {
            const { executeHookAction } = await import('../../../src/lib/preset/actionExecution.js');
            const action = {
                type: 'hook',
                layer: 'entity',
                slice: 'User',
                template: 'tpl'
            };
            await executeHookAction(action as any, {}, {} as any);
            const { generateHook } = await import('../../../src/lib/generators/generate.js');
            const callContext: any = vi.mocked(generateHook).mock.calls[0][1];
            expect(callContext.componentName).toBe('User');
        });

        it('should fallback to slice name if action.name is missing (Styles)', async () => {
            const { executeStylesAction } = await import('../../../src/lib/preset/actionExecution.js');
            const action = {
                type: 'styles',
                layer: 'entity',
                slice: 'User',
                template: 'tpl'
            };
            await executeStylesAction(action as any, {}, {} as any);
            const { generateStyles } = await import('../../../src/lib/generators/generate.js');
            const callContext: any = vi.mocked(generateStyles).mock.calls[0][1];
            expect(callContext.componentName).toBe('User');
        });
    });

    describe('TemplateLoader Dynamic Imports', () => {
        it('should return default export function from module template (Component)', async () => {
            const { readComponentTemplate } = await import('../../../src/lib/templates/templateLoader.js');
            const mockFn = () => 'content';
            mockJitiImport.mockResolvedValue({ default: mockFn });
            vi.mocked(fs.stat).mockResolvedValue({} as any);

            const res = await readComponentTemplate('/path/to/template');
            expect(res).toBe(mockFn);
        });

        it('should return default export function from module template (Styles)', async () => {
            const { readStylesTemplate } = await import('../../../src/lib/templates/templateLoader.js');
            const mockFn = () => 'styles';
            mockJitiImport.mockResolvedValue({ default: mockFn });
            vi.mocked(fs.stat).mockResolvedValue({} as any);

            const res = await readStylesTemplate('/path/to/template');
            expect(res).toBe(mockFn);
        });

        it('should fallback to static file if dynamic component not found', async () => {
            const { readComponentTemplate } = await import('../../../src/lib/templates/templateLoader.js');
            vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'));
            vi.mocked(fs.readFile).mockResolvedValue('static content');
            vi.mocked(fs.readdir).mockResolvedValue(['Component.tsx'] as any);

            const res = await readComponentTemplate('/path/to/template');
            expect(res).toBe('static content');
        });

        it('should fallback to empty string if style not found', async () => {
            const { readStylesTemplate } = await import('../../../src/lib/templates/templateLoader.js');
            vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'));
            vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

            const res = await readStylesTemplate('/path/to/template');
            expect(res).toBe('');
        });

        it('should ignore dynamic module if default export is not function', async () => {
            const { readComponentTemplate } = await import('../../../src/lib/templates/templateLoader.js');
            mockJitiImport.mockResolvedValue({ default: 'not a function' });
            vi.mocked(fs.stat).mockResolvedValue({} as any);
            vi.mocked(fs.readFile).mockResolvedValue('static fallback');
            vi.mocked(fs.readdir).mockResolvedValue(['Component.tsx'] as any);

            const res = await readComponentTemplate('/path/to/template');
            expect(res).toBe('static fallback');
        });
    });
});
