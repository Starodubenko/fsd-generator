import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as actionExecutionModule from '../../../src/lib/preset/actionExecution.js';
import { executeComponentAction, executeHookAction, executeStylesAction, executeFileAction } from '../../../src/lib/preset/actionExecution.js';
import { FsdGenConfig, PresetComponentAction, GeneratorContext, PresetHookAction, PresetStylesAction, PresetFileAction } from '../../../src/config/types.js';
import { ACTION_TYPES, FSD_LAYERS } from '../../../src/lib/constants.js';
import * as generateModule from '../../../src/lib/generators/generate.js';
import * as templateLoader from '../../../src/lib/templates/templateLoader.js';
import * as resolvePaths from '../../../src/lib/naming/resolvePaths.js';

// Mock dependencies
// Mock dependencies
vi.mock('../../../src/lib/generators/generate.js');
vi.mock('../../../src/lib/templates/templateLoader.js');
vi.mock('../../../src/lib/naming/resolvePaths.js');
vi.mock('../../../src/lib/barrels/updateBarrels.js'); // Mock updateBarrel to prevent FS operations
vi.mock('node:fs/promises'); // Add fs mock

describe('actionExecution', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mocks
        vi.spyOn(templateLoader, 'processTemplate').mockImplementation((tmpl) => tmpl as string);
        vi.spyOn(resolvePaths, 'resolveFsdPaths').mockReturnValue({
            layerPath: '/mock/entities',
            slicePath: '/mock/entities/User',
            uiPath: '/mock/entities/User/ui',
            componentPath: '/mock/entities/User/ui/UserCard'
        });
    });

    describe('executeComponentAction', () => {
        it('should pass a complete GeneratorContext to generateComponent', async () => {
            const config: FsdGenConfig = { rootDir: 'src', templatesDir: '.templates' };
            const action: PresetComponentAction = {
                type: ACTION_TYPES.COMPONENT,
                layer: FSD_LAYERS.ENTITY,
                slice: 'User',
                name: 'UserCard',
                template: 'user-card.tsx'
            };

            // Mimic variables object populated by createPresetHelpers + globalVars
            const variables = {
                base: {
                    baseName: 'User',
                    name: 'User',
                },
                layer: {
                    entity: {
                        importPath: '@entities/User',
                        apiPath: '@entities/User/ui',
                    },
                    features: {
                        slice: 'ManageUser',
                        importPath: '@features/ManageUser',
                    },
                    widget: {
                        slice: 'UserTable',
                        importPath: '@widgets/UserTable',
                    },
                    page: {
                        slice: 'UserPage',
                        importPath: '@pages/UserPage',
                    },
                },
                extraGlobal: 'something'
            };

            await executeComponentAction(action, variables, config);

            // Assert generateComponent was called
            expect(generateModule.generateComponent).toHaveBeenCalled();

            // Capture the context passed to generateComponent
            const callArgs = vi.mocked(generateModule.generateComponent).mock.calls[0];
            const context = callArgs[1] as unknown as GeneratorContext;

            // Verify template keys
            expect(context.template.componentName).toBe('UserCard');
            expect(context.template.sliceName).toBe('User');
            expect(context.template.layer).toBe(FSD_LAYERS.ENTITY);

            // Verify keys from PresetHelpers (passed in via variables)
            expect(context.base.name).toBe('User');
            expect(context.layer.entity.apiPath).toBe('@entities/User/ui');

            // Verify it retains other variables
            expect(context).toHaveProperty('extraGlobal', 'something');
        });
    });

    // Shared variables for all tests
    const commonVariables = {
        base: {
            baseName: 'User',
            name: 'User',
        },
        layer: {
            entity: {
                importPath: '@entities/User',
                apiPath: '@entities/User/ui',
            },
            features: {
                slice: 'ManageUser',
                importPath: '@features/ManageUser',
            },
            widget: {
                slice: 'UserTable',
                importPath: '@widgets/UserTable',
            },
            page: {
                slice: 'UserPage',
                importPath: '@pages/UserPage',
            },
        },
        extraGlobal: 'something'
    };

    const commonConfig: FsdGenConfig = { rootDir: 'src', templatesDir: '.templates' };

    describe('executeHookAction', () => {
        it('should pass a complete GeneratorContext to generateHook', async () => {
            const action: PresetHookAction = {
                type: ACTION_TYPES.HOOK,
                layer: FSD_LAYERS.ENTITY,
                slice: 'User',
                name: 'useUser',
                template: 'use-user.ts'
            };

            await executeHookAction(action, commonVariables, commonConfig);

            expect(generateModule.generateHook).toHaveBeenCalled();
            const callArgs = vi.mocked(generateModule.generateHook).mock.calls[0];
            const context = callArgs[1] as unknown as GeneratorContext;

            // Verify template keys
            expect(context.template.componentName).toBe('useUser');
            expect(context.template.sliceName).toBe('User');
            expect(context.template.layer).toBe(FSD_LAYERS.ENTITY);

            // Verify keys from PresetHelpers
            expect(context.base.name).toBe('User');
            expect(context.layer.entity.apiPath).toBe('@entities/User/ui');
        });
    });

    describe('executeStylesAction', () => {
        it('should pass a complete GeneratorContext to generateStyles', async () => {
            const action: PresetStylesAction = {
                type: ACTION_TYPES.STYLES,
                layer: FSD_LAYERS.ENTITY,
                slice: 'User',
                name: 'UserCard',
                template: 'user-card.module.css'
            };

            await executeStylesAction(action, commonVariables, commonConfig);

            expect(generateModule.generateStyles).toHaveBeenCalled();
            const callArgs = vi.mocked(generateModule.generateStyles).mock.calls[0];
            const context = callArgs[1] as unknown as GeneratorContext;

            // Verify template keys (name falls back to slice if not provided, but here we provide it)
            expect(context.template.componentName).toBe('UserCard');
            expect(context.template.sliceName).toBe('User');
            expect(context.template.layer).toBe(FSD_LAYERS.ENTITY);

            // Verify keys from PresetHelpers
            expect(context.base.name).toBe('User');
        });
    });

    describe('executeFileAction', () => {
        it('should pass a complete GeneratorContext to template processing', async () => {
            const action: PresetFileAction = {
                type: ACTION_TYPES.FILE,
                path: 'model/types.ts',
                template: 'types.ts'
            };

            // loadFileTemplate mock to return a string template
            vi.spyOn(actionExecutionModule, 'loadFileTemplate').mockResolvedValue('template content');

            // Mock mkDir and writeFile
            const fsMock = await import('node:fs/promises');
            vi.mocked(fsMock.mkdir).mockResolvedValue(undefined);
            vi.mocked(fsMock.writeFile).mockResolvedValue(undefined);


            // executeFileAction uses processTemplate to resolve the path AND the content
            // We want to capture the context used when processing the CONTENT
            // The first call is for path resolution, second for content
            await executeFileAction(action, { ...commonVariables, componentName: 'User', sliceName: 'User' }, commonConfig);

            expect(templateLoader.processTemplate).toHaveBeenCalledTimes(2);

            // The second call to processTemplate should receive the context
            const contentCallArgs = vi.mocked(templateLoader.processTemplate).mock.calls[1];
            const context = contentCallArgs[1] as GeneratorContext;

            // Verify template keys
            expect(context.template).toBeDefined();
            expect(context.template.componentName).toBe('User');
            expect(context.template.sliceName).toBe('User');
            // Layer might be empty string for generic files if not provided in variables
            expect(context.template.layer).toBeDefined();

            // Verify keys from PresetHelpers
            expect(context.base.name).toBe('User');
            expect(context.layer.entity.apiPath).toBe('@entities/User/ui');
        });
    });

    describe('executeActions', () => {
        it('should dispatch all action types correctly', async () => {
            const actions = [
                { type: ACTION_TYPES.COMPONENT, layer: 'entity', slice: 'User', name: 'UserCard', template: 't' },
                { type: ACTION_TYPES.HOOK, layer: 'entity', slice: 'User', name: 'useUser', template: 'h' },
                { type: ACTION_TYPES.STYLES, layer: 'entity', slice: 'User', name: 'UserStyles', template: 's' },
                { type: ACTION_TYPES.FILE, path: 'src/f', template: 'ft' }
            ];

            // Mock the individual execution functions
            // Since we are inside the same module testing file, we need to make sure we are spying on the exports correctly
            // But executeActions imports them from the same file. 
            // In ESM, internal calls within the same module are hard to mock without namespace import usage.
            // Wait, executeActions calls executeComponentAction etc which are exported functions in the same file.
            // But in actionExecution.ts: `import { ... } from './generate.js'` etc.
            // `executeActions` calls `executeComponentAction(action, ...)`
            // If they are strictly local function calls, spying on the export won't work easily.
            // However, looking at actionExecution.ts source (lines 228+), it calls `await executeComponentAction(...)`.

            // Actually, I can spy on the functions if I exported them and the module uses them via `exports` or if I verify the side effects.
            // `executeComponentAction` calls `generateComponent`.
            // `executeHookAction` calls `generateHook`.
            // `executeFileAction` calls `writeFile`.

            // So checking if the UNDERLYING generators are called is sufficient to verify dispatch!

            await actionExecutionModule.executeActions(actions as any, 'User', { global: 'var' }, commonConfig);

            expect(generateModule.generateComponent).toHaveBeenCalled();
            expect(generateModule.generateHook).toHaveBeenCalled();
            expect(generateModule.generateStyles).toHaveBeenCalled();
            expect(generateModule.generateStyles).toHaveBeenCalled();

            const fsMock = await import('node:fs/promises');
            expect(fsMock.writeFile).toHaveBeenCalled();
        });
    });
});
