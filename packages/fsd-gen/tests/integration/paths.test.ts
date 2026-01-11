import { describe, it, expect } from 'vitest';
import { resolveFsdPaths } from '../../src/lib/naming/resolvePaths.js';

describe('Integration: Path Resolution Scenarios', () => {
    it('should build paths for all standard FSD layers correctly', () => {
        const rootDir = 'src';
        const layers = ['entity', 'feature', 'widget', 'page', 'shared'];

        const results = layers.map(layer => ({
            layer,
            paths: resolveFsdPaths(rootDir, layer, `My${layer}`, 'Component'),
        }));

        expect(results[0].paths.layerPath).toBe('src/entities');
        expect(results[0].paths.uiPath).toBe('src/entities/Myentity/ui');

        expect(results[1].paths.layerPath).toBe('src/features');
        expect(results[1].paths.uiPath).toBe('src/features/Myfeature/ui');

        expect(results[4].paths.layerPath).toBe('src/shared');
        expect(results[4].paths.uiPath).toBe('src/shared/Myshared'); // No ui subdir for shared
    });

    it('should handle realistic monorepo and scoped package paths', () => {
        const paths = resolveFsdPaths(
            'packages/@company/my-app/src',
            'entity',
            'user-profile',
            'UserProfileCard'
        );

        expect(paths.layerPath).toBe('packages/@company/my-app/src/entities');
        expect(paths.slicePath).toBe('packages/@company/my-app/src/entities/user-profile');
        expect(paths.componentPath).toBe('packages/@company/my-app/src/entities/user-profile/ui/UserProfileCard');
    });

    it('should generate correct paths for various monorepo app types', () => {
        const scenarios = [
            {
                desc: 'Admin app',
                root: 'apps/admin/src',
                layer: 'feature',
                slice: 'UserManagement',
                component: 'UserTable',
                expected: 'apps/admin/src/features/UserManagement/ui/UserTable',
            },
            {
                desc: 'Mobile app',
                root: 'apps/mobile/src',
                layer: 'widget',
                slice: 'Header',
                component: 'MobileHeader',
                expected: 'apps/mobile/src/widgets/Header/ui/MobileHeader',
            },
            {
                desc: 'Shared library',
                root: 'packages/shared-ui/src',
                layer: 'shared',
                slice: 'Button',
                component: 'PrimaryButton',
                expected: 'packages/shared-ui/src/shared/Button/PrimaryButton',
            },
        ];

        scenarios.forEach(({ root, layer, slice, component, expected }) => {
            const paths = resolveFsdPaths(root, layer, slice, component);
            expect(paths.componentPath).toBe(expected);
        });
    });

    it('should handle features with slice names containing slashes', () => {
        const paths = resolveFsdPaths('src', 'feature', 'Auth/LoginForm', 'LoginButton');

        expect(paths.layerPath).toBe('src/features');
        expect(paths.slicePath).toBe('src/features/Auth/LoginForm');
        expect(paths.uiPath).toBe('src/features/Auth/LoginForm/ui');
        expect(paths.componentPath).toBe('src/features/Auth/LoginForm/ui/LoginButton');
    });

    it('should pluralize non-standard but custom layers gracefully', () => {
        const rootDir = 'src';
        const customLayer = 'api';
        const paths = resolveFsdPaths(rootDir, customLayer, 'auth', 'client');

        expect(paths.layerPath).toBe('src/api');
        expect(paths.uiPath).toBe('src/api/auth/ui');
    });

    it('should handle empty strings in path resolution', () => {
        const paths = resolveFsdPaths('', 'entity', 'User', '');

        expect(paths.layerPath).toBe('entities');
        expect(paths.slicePath).toBe('entities/User');
        expect(paths.uiPath).toBe('entities/User/ui');
        expect(paths.componentPath).toBe('entities/User/ui');
    });
});
