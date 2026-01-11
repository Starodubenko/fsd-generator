import { describe, it, expect } from 'vitest';
import { resolveFsdPaths } from '../../src/lib/naming/resolvePaths.js';

describe('Integration: Routing Side-Effects Scenarios', () => {
    it('should simulate page generation and variables for route injection', () => {
        const pageName = 'Profile';
        const rootDir = 'src';

        // 1. Resolve paths for the page
        const paths = resolveFsdPaths(rootDir, 'page', pageName, `${pageName}Page`);

        // 2. Mock route injection variables logic
        const routeOptions = {
            path: `/${pageName.toLowerCase()}`,
            importPath: `@pages/${pageName}/ui/${pageName}Page`,
            componentName: `${pageName}Page`,
        };

        // 3. Process hypothetical App.tsx content
        const appContent = `
import { Route, Routes } from 'react-router-dom';
{/* ROUTES_INJECTION_POINT */}
    `.trim();

        const routeElement = `            <Route path="${routeOptions.path}" element={<${routeOptions.componentName} />} />`;
        const updatedAppContent = appContent.replace(
            '{/* ROUTES_INJECTION_POINT */}',
            `${routeElement}\n            {/* ROUTES_INJECTION_POINT */}`
        );

        expect(updatedAppContent).toContain('<Route path="/profile" element={<ProfilePage />} />');
        expect(updatedAppContent).toContain('{/* ROUTES_INJECTION_POINT */}');
        expect(paths.componentPath).toBe('src/pages/Profile/ui/ProfilePage');
    });
});
