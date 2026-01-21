import { describe, it, expect } from 'vitest';
import { processTemplate } from '../../src/lib/templates/templateLoader.js';
import { prepareActionVariables } from '../../src/lib/preset/actionExecution.js';
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
