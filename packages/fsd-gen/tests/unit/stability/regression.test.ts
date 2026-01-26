import { describe, it, expect, vi } from 'vitest';
import { resolveFsdPaths } from '../../../src/lib/naming/resolvePaths.js';
import { processTemplate } from '../../../src/lib/templates/templateLoader.js';
import { injectRoute } from '../../../src/lib/routing/injectRoute.js';
import { handleRouteInjection } from '../../../src/lib/generators/presetExecutionHelpers.js';
import { ACTION_TYPES, FSD_LAYERS, ROUTING } from '../../../src/lib/constants.js';
import * as fs from 'fs/promises';

vi.mock('fs/promises', () => ({
    readFile: vi.fn(),
    writeFile: vi.fn(),
    stat: vi.fn(),
    readdir: vi.fn(),
}));

describe('Regression Tests: Found Bugs & Stability', () => {

    describe('Path Resolution (resolveFsdPaths)', () => {
        it('should throw clear error if layer is missing (Fix: Received undefined error)', () => {
            // @ts-ignore
            expect(() => resolveFsdPaths('src', undefined, 'Slice', 'Comp'))
                .toThrow('Layer is required');
        });

        it('should respect targetDir over rootDir priority', () => {
            const paths = resolveFsdPaths('custom-target', 'entity', 'User', 'UserCard');
            expect(paths.layerPath).toContain('custom-target/entities');
        });

        it('should fallback to src if both targetDir and rootDir are nullish', () => {
            // @ts-ignore
            const paths = resolveFsdPaths(undefined, 'entity', 'User', 'UserCard');
            expect(paths.layerPath).toContain('src/entities');
        });
    });

    describe('Template Processing (processTemplate)', () => {
        it('should handle null/undefined content gracefully (Fix: Cannot read properties of undefined (reading \'replace\'))', () => {
            // @ts-ignore
            expect(processTemplate(undefined, {})).toBe('');
            // @ts-ignore
            expect(processTemplate(null, {})).toBe('');
        });
    });

    describe('Routing Injection (injectRoute & handleRouteInjection)', () => {
        it('should throw descriptive error if critical routing options are missing', async () => {
            await expect(injectRoute({
                // @ts-ignore
                targetDir: undefined,
                path: '/test',
                importPath: '@p/T'
            })).rejects.toThrow('Missing required routing options');
        });

        it('should provide safe fallbacks in handleRouteInjection for partial config', async () => {
            const presetConfig = {
                routing: { path: '/test' } // Missing componentName, importPath
            };
            const actions = [
                { type: ACTION_TYPES.COMPONENT, layer: FSD_LAYERS.PAGE, slice: 'User' }
            ];
            const config = { rootDir: 'src' };

            vi.mocked(fs.readFile).mockResolvedValue(`const App = () => <div>${ROUTING.MARKER}</div>;`);

            await expect(handleRouteInjection(presetConfig as any, actions as any, 'User', {}, config as any))
                .resolves.not.toThrow();
        });
    });
    describe('Action Execution (Custom Paths)', () => {
        it('should support custom path in executeComponentAction bypassing FSD validation', async () => {
            const { executeComponentAction } = await import('../../../src/lib/preset/actionExecution.js');
            const generateModule = await import('../../../src/lib/generators/generate.js');
            const spy = vi.spyOn(generateModule, 'generateComponent').mockResolvedValue(undefined as any);

            const action = {
                type: ACTION_TYPES.COMPONENT,
                path: 'custom/path/{{name}}.tsx',
                template: 't'
            };
            const config = { targetDir: 'out' };
            const variables = { name: 'Test' };

            await executeComponentAction(action as any, variables, config as any);

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    componentPath: expect.stringContaining('out/custom/path/Test')
                }),
                expect.any(Object),
                't',
                undefined
            );
        });

        it('should support custom path in executeComponentAction bypassing FSD validation even with missing slice/name', async () => {
            const { executeComponentAction } = await import('../../../src/lib/preset/actionExecution.js');
            const generateModule = await import('../../../src/lib/generators/generate.js');
            const spy = vi.spyOn(generateModule, 'generateComponent').mockResolvedValue(undefined as any);

            const action = {
                type: ACTION_TYPES.COMPONENT,
                path: 'pages/{{name}}Page/{{name}}.tsx',
                template: 't',
                layer: 'page'
            };
            const config = { targetDir: 'out' };
            const variables = { name: 'User' };

            await expect(executeComponentAction(action as any, variables, config as any))
                .resolves.not.toThrow();

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    componentPath: expect.stringContaining('out/pages/UserPage/User')
                }),
                expect.any(Object),
                't',
                undefined
            );
        });

        it('should support custom path in executeHookAction bypassing FSD validation', async () => {
            const { executeHookAction } = await import('../../../src/lib/preset/actionExecution.js');
            const generateModule = await import('../../../src/lib/generators/generate.js');
            const spy = vi.spyOn(generateModule, 'generateHook').mockResolvedValue(undefined as any);

            const action = {
                type: ACTION_TYPES.HOOK,
                path: 'hooks/{{name}}.ts',
                template: 't'
            };
            const config = { targetDir: 'out' };
            const variables = { name: 'useData' };

            await executeHookAction(action as any, variables, config as any);

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    componentPath: expect.stringContaining('out/hooks/useData')
                }),
                expect.any(Object),
                't',
                undefined
            );
        });
    });
});
