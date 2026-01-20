import { describe, it, expect } from 'vitest';
import { resolveFsdPaths } from '../../src/lib/naming/resolvePaths.js';

describe('resolveFsdPaths', () => {
    it('should resolve paths for a UI component in a feature slice', () => {
        const paths = resolveFsdPaths('src', 'feature', 'ManageUser', 'CreateUserButton');

        expect(paths).toEqual({
            layerPath: 'src/features',
            slicePath: 'src/features/ManageUser',
            uiPath: 'src/features/ManageUser/ui',
            componentPath: 'src/features/ManageUser/ui/CreateUserButton',
        });
    });

    it('should resolve paths for an entity component', () => {
        const paths = resolveFsdPaths('src', 'entity', 'User', 'UserCard');

        expect(paths).toEqual({
            layerPath: 'src/entities',
            slicePath: 'src/entities/User',
            uiPath: 'src/entities/User/ui',
            componentPath: 'src/entities/User/ui/UserCard',
        });
    });

    it('should resolve paths for a shared component', () => {
        const paths = resolveFsdPaths('src', 'shared', 'ui', 'Button');

        expect(paths).toEqual({
            layerPath: 'src/shared',
            slicePath: 'src/shared/ui',
            uiPath: 'src/shared/ui',
            componentPath: 'src/shared/ui/Button',
        });
    });

    it('should resolve paths for a widget', () => {
        const paths = resolveFsdPaths('src', 'widget', 'UserTable', 'UserTable');

        expect(paths).toEqual({
            layerPath: 'src/widgets',
            slicePath: 'src/widgets/UserTable',
            uiPath: 'src/widgets/UserTable/ui',
            componentPath: 'src/widgets/UserTable/ui/UserTable',
        });
    });

    it('should resolve paths for a page', () => {
        const paths = resolveFsdPaths('src', 'page', 'HomePage', 'HomePage');

        expect(paths).toEqual({
            layerPath: 'src/pages',
            slicePath: 'src/pages/HomePage',
            uiPath: 'src/pages/HomePage/ui',
            componentPath: 'src/pages/HomePage/ui/HomePage',
        });
    });
});
