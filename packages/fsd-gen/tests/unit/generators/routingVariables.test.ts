
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRouteInjection } from '../../../src/lib/generators/presetExecutionHelpers.js';
import * as injectRouteModule from '../../../src/lib/routing/injectRoute.js';
import { ACTION_TYPES, FSD_LAYERS } from '../../../src/lib/constants.js';

vi.mock('../../../src/lib/routing/injectRoute.js');

describe('handleRouteInjection variables', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should resolve variables in routing configuration', async () => {
        const presetConfig: any = {
            routing: {
                path: '/{{entityNameLower}}s',
                componentName: '{{entityName}}List',
                importPath: '@/pages/{{entityName}}'
            }
        };

        const actions: any[] = [
            {
                type: ACTION_TYPES.COMPONENT,
                layer: FSD_LAYERS.PAGE,
                slice: '{{entityName}}Page',
                template: 'ui'
            }
        ];

        const config: any = { targetDir: 'custom-target', rootDir: 'src' };
        const globalVars = {};

        await handleRouteInjection(presetConfig, actions, 'User', globalVars, config);

        expect(injectRouteModule.injectRoute).toHaveBeenCalledWith(expect.objectContaining({
            targetDir: 'custom-target',
            path: '/users',
            componentName: 'UserList',
            importPath: '@/pages/User'
        }));
    });
});
