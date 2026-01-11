import { describe, it, expect } from 'vitest';
import { processTemplate } from '../../src/lib/templates/templateLoader.js';
import { prepareActionVariables } from '../../src/lib/preset/actionExecution.js';
import { createSharedAction } from '../../src/lib/preset/presetDiscovery.js';
import * as path from 'path';

// We need to mock fs for discovery tests or at least verify the resulting actions
describe('Integration: Logic Gaps Fixes', () => {
    describe('Multi-Route and Dynamic Path Support', () => {
        it('should simulate injecting multiple routes with dynamic paths', () => {
            const name = 'User';
            const globalVars = { theme: 'dark' };

            const actions = [
                {
                    type: 'component' as const,
                    layer: 'page' as const,
                    slice: 'UserList',
                    name: 'UserListPage',
                    variables: { role: 'admin' }
                },
                {
                    type: 'component' as const,
                    layer: 'page' as const,
                    slice: 'UserDetail',
                    name: 'UserDetailPage',
                    variables: { role: 'user' }
                }
            ];

            const routingConfig = {
                path: '/{{role}}/{{nameLower}}',
            };

            // Simulation of handleRouteInjection logic
            const injectedRoutes = actions.map(action => {
                const variables = {
                    name,
                    componentName: name,
                    nameLower: name.toLowerCase(),
                    ...globalVars,
                    ...action.variables
                };
                const routePath = processTemplate(routingConfig.path, variables);
                const componentName = action.name;
                return { routePath, componentName };
            });

            expect(injectedRoutes).toHaveLength(2);
            expect(injectedRoutes[0].routePath).toBe('/admin/user');
            expect(injectedRoutes[0].componentName).toBe('UserListPage');
            expect(injectedRoutes[1].routePath).toBe('/user/user');
            expect(injectedRoutes[1].componentName).toBe('UserDetailPage');
        });
    });

    describe('Shared Layer Auto-Discovery', () => {
        it('should correctly create shared actions during discovery', () => {
            // Note: We are testing the helper function used by discovery
            // Since we can't easily mock readdir here without complex setup

            const action1 = createSharedAction('Button', 'User', 'my-preset');
            expect(action1.layer).toBe('shared');
            expect(action1.slice).toBe('Button');
            expect(action1.template).toBe('preset/my-preset/shared/Button');

            const action2 = createSharedAction('shared', 'User', 'my-preset');
            expect(action2.layer).toBe('shared');
            expect(action2.slice).toBe('User'); // Falls back to entity name if dir is literally 'shared'
            expect(action2.template).toBe('preset/my-preset/shared/shared');
        });
    });

    describe('File Action Barrel Updates', () => {
        it('should simulate path resolution and variable prep for file actions', () => {
            const action = {
                type: 'file' as const,
                path: 'entities/{{name}}/model/types.ts',
                template: 'preset/my-preset/entity/types.ts',
                variables: { suffix: 'DTO' }
            };

            const variables = prepareActionVariables(action, 'User', { global: 'val' });
            const targetPath = processTemplate(action.path, variables);

            expect(targetPath).toBe('entities/User/model/types.ts');
            expect(variables.suffix).toBe('DTO');

            // The barrel update logic uses the basename of targetPath
            const dir = path.dirname(targetPath);
            const fileName = path.basename(targetPath, '.ts');

            expect(dir).toBe('entities/User/model');
            expect(fileName).toBe('types');
        });
    });

    it('should simulate injecting route into a custom file', () => {
        const name = 'User';
        const routingConfig = {
            path: '/{{nameLower}}',
            appFile: 'Router.tsx'
        };

        const actions = [
            {
                type: 'component' as const,
                layer: 'page' as const,
                slice: 'UserList',
                name: 'UserListPage'
            }
        ];

        // Simulation of handleRouteInjection logic with appFile
        const injectedRoutes = actions.map(_action => {
            const variables = {
                name,
                nameLower: name.toLowerCase()
            };
            const routePath = processTemplate(routingConfig.path, variables);
            const appFile = routingConfig.appFile || 'App.tsx';
            return { routePath, appFile };
        });

        expect(injectedRoutes[0].appFile).toBe('Router.tsx');
    });
});
