import { describe, it, expect } from 'vitest';
import {
    getLayerPlural,
    buildLayerPath,
    buildSlicePath,
    buildUiPath,
    buildComponentPath,
    resolveFsdPaths
} from '../../../src/lib/naming/resolvePaths.js';
import { FSD_LAYERS } from '../../../src/lib/constants.js';

describe('resolvePaths', () => {
    describe('getLayerPlural', () => {
        it('should map entity to entities', () => {
            expect(getLayerPlural('entity')).toBe('entities');
        });

        it('should map feature to features', () => {
            expect(getLayerPlural('feature')).toBe('features');
        });

        it('should map widget to widgets', () => {
            expect(getLayerPlural('widget')).toBe('widgets');
        });

        it('should map page to pages', () => {
            expect(getLayerPlural('page')).toBe('pages');
        });

        it('should keep shared as shared', () => {
            expect(getLayerPlural('shared')).toBe('shared');
        });

        it('should return input for unknown layer', () => {
            expect(getLayerPlural('unknown')).toBe('unknown');
        });

        // P0: Critical edge cases
        it('should handle empty string', () => {
            expect(getLayerPlural('')).toBe('');
        });

        it('should handle whitespace input', () => {
            expect(getLayerPlural('  ')).toBe('  ');
        });

        // P1: Case sensitivity
        it('should be case-sensitive (Entity vs entity)', () => {
            expect(getLayerPlural('Entity')).toBe('Entity');
            expect(getLayerPlural('ENTITY')).toBe('ENTITY');
        });

        // P1: Special characters
        it('should handle special characters in layer name', () => {
            expect(getLayerPlural('entity@123')).toBe('entity@123');
            expect(getLayerPlural('my-layer')).toBe('my-layer');
        });
    });

    describe('buildLayerPath', () => {
        it('should build path for entity layer', () => {
            const result = buildLayerPath('src', 'entity');
            expect(result).toBe('src/entities');
        });

        it('should build path for shared layer', () => {
            const result = buildLayerPath('src', 'shared');
            expect(result).toBe('src/shared');
        });

        // P0: Empty inputs
        it('should handle empty rootDir', () => {
            const result = buildLayerPath('', 'entity');
            expect(result).toBe('entities');
        });

        // P1: Trailing slashes
        it('should handle rootDir with trailing slash', () => {
            const result = buildLayerPath('src/', 'entity');
            expect(result).toBe('src/entities');
        });

        // P1: Special characters in path
        it('should handle paths with spaces', () => {
            const result = buildLayerPath('my project/src', 'entity');
            expect(result).toBe('my project/src/entities');
        });

        it('should handle paths with special characters', () => {
            const result = buildLayerPath('src@v2', 'entity');
            expect(result).toBe('src@v2/entities');
        });

        // P1: Relative paths
        it('should handle relative paths (path.join normalizes)', () => {
            // path.join() normalizes './src' to 'src'
            const result = buildLayerPath('./src', 'entity');
            expect(result).toBe('src/entities'); // Normalized
        });

        it('should handle parent directory paths', () => {
            const result = buildLayerPath('../src', 'entity');
            expect(result).toBe('../src/entities');
        });
    });

    describe('buildSlicePath', () => {
        it('should join layer path with slice name', () => {
            const result = buildSlicePath('src/entities', 'User');
            expect(result).toBe('src/entities/User');
        });

        // P0: Empty slice name
        it('should handle empty slice name', () => {
            const result = buildSlicePath('src/entities', '');
            expect(result).toBe('src/entities');
        });

        // P1: Special characters
        it('should handle slice names with special characters', () => {
            const result = buildSlicePath('src/entities', 'User-Profile');
            expect(result).toBe('src/entities/User-Profile');
        });

        it('should handle slice names with spaces', () => {
            const result = buildSlicePath('src/entities', 'User Profile');
            expect(result).toBe('src/entities/User Profile');
        });
    });

    describe('buildUiPath', () => {
        it('should not add ui subdirectory for shared layer', () => {
            const result = buildUiPath('src/shared/Button', FSD_LAYERS.SHARED);
            expect(result).toBe('src/shared/Button');
        });

        it('should add ui subdirectory for entity layer', () => {
            const result = buildUiPath('src/entities/User', 'entity');
            expect(result).toBe('src/entities/User/ui');
        });

        it('should add ui subdirectory for feature layer', () => {
            const result = buildUiPath('src/features/Auth', 'feature');
            expect(result).toBe('src/features/Auth/ui');
        });

        // P1: Case sensitivity for shared layer
        it('should be case-sensitive for shared layer check', () => {
            // Only lowercase 'shared' is recognized
            const result1 = buildUiPath('src/shared/Button', 'Shared');
            expect(result1).toBe('src/shared/Button/ui'); // Adds ui because 'Shared' !== 'shared'

            const result2 = buildUiPath('src/shared/Button', 'SHARED');
            expect(result2).toBe('src/shared/Button/ui'); // Adds ui because 'SHARED' !== 'shared'
        });
    });

    describe('buildComponentPath', () => {
        it('should join ui path with component name', () => {
            const result = buildComponentPath('src/entities/User/ui', 'UserCard');
            expect(result).toBe('src/entities/User/ui/UserCard');
        });

        // P0: Empty component name
        it('should handle empty component name', () => {
            const result = buildComponentPath('src/entities/User/ui', '');
            expect(result).toBe('src/entities/User/ui');
        });

        // P1: Special characters
        it('should handle component names with hyphens', () => {
            const result = buildComponentPath('src/entities/User/ui', 'User-Card');
            expect(result).toBe('src/entities/User/ui/User-Card');
        });
    });

    describe('resolveFsdPaths', () => {
        it('should build complete path structure for entity', () => {
            const paths = resolveFsdPaths('src', 'entity', 'User', 'UserCard');

            expect(paths.layerPath).toBe('src/entities');
            expect(paths.slicePath).toBe('src/entities/User');
            expect(paths.uiPath).toBe('src/entities/User/ui');
            expect(paths.componentPath).toBe('src/entities/User/ui/UserCard');
        });

        it('should build complete path structure for shared', () => {
            const paths = resolveFsdPaths('src', 'shared', 'Button', 'Button');

            expect(paths.layerPath).toBe('src/shared');
            expect(paths.slicePath).toBe('src/shared/Button');
            expect(paths.uiPath).toBe('src/shared/Button');
            expect(paths.componentPath).toBe('src/shared/Button/Button');
        });

        it('should build complete path structure for page', () => {
            const paths = resolveFsdPaths('src', 'page', 'Home', 'HomePage');

            expect(paths.layerPath).toBe('src/pages');
            expect(paths.slicePath).toBe('src/pages/Home');
            expect(paths.uiPath).toBe('src/pages/Home/ui');
            expect(paths.componentPath).toBe('src/pages/Home/ui/HomePage');
        });

        // P0: Edge cases with empty strings
        it('should handle empty rootDir', () => {
            const paths = resolveFsdPaths('', 'entity', 'User', 'UserCard');
            expect(paths.layerPath).toBe('entities');
            expect(paths.slicePath).toBe('entities/User');
        });

        // P1: Complex real-world scenarios
        it('should handle relative paths in rootDir (path.join normalizes)', () => {
            // path.join() normalizes './src' to 'src'
            const paths = resolveFsdPaths('./src', 'entity', 'User', 'UserCard');
            expect(paths.layerPath).toBe('src/entities'); // Normalized
            expect(paths.componentPath).toBe('src/entities/User/ui/UserCard'); // Normalized
        });

        it('should handle paths with special characters', () => {
            const paths = resolveFsdPaths('my-app/src', 'entity', 'User-Profile', 'ProfileCard');
            expect(paths.layerPath).toBe('my-app/src/entities');
            expect(paths.slicePath).toBe('my-app/src/entities/User-Profile');
            expect(paths.componentPath).toBe('my-app/src/entities/User-Profile/ui/ProfileCard');
        });
    });
});
