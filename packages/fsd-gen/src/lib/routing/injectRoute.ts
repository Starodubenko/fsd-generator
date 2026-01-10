import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export interface RouteInjectionOptions {
    /** Root directory where App.tsx is located */
    rootDir: string;
    /** Route path (e.g., '/test') */
    path: string;
    /** Import path for the page component (e.g., '@pages/TestPage') */
    importPath: string;
    /** Component name (e.g., 'TestPage') */
    componentName: string;
}

const ROUTES_INJECTION_MARKER = '{/* ROUTES_INJECTION_POINT */}';
const IMPORTS_SECTION_END_MARKER = /^(?:import|export)\s/m;

/**
 * Inject a route into App.tsx
 */
export async function injectRoute(options: RouteInjectionOptions): Promise<void> {
    const { rootDir, path, importPath, componentName } = options;
    const appFilePath = join(rootDir, 'App.tsx');

    try {
        // Read App.tsx
        let content = await readFile(appFilePath, 'utf-8');

        // Check if route injection point exists
        if (!content.includes(ROUTES_INJECTION_MARKER)) {
            console.warn('⚠️  Warning: ROUTES_INJECTION_POINT comment not found in App.tsx');
            console.warn('   Route was not injected automatically.');
            return;
        }

        // Generate import statement
        const importStatement = `import { ${componentName} } from '${importPath}';\n`;

        // Check if import already exists
        if (content.includes(importStatement.trim())) {
            console.log(`ℹ️  Import for ${componentName} already exists, skipping...`);
        } else {
            // Find where to insert import (after last import statement)
            const lines = content.split('\n');
            let lastImportIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/^import\s/)) {
                    lastImportIndex = i;
                }
            }

            if (lastImportIndex >= 0) {
                lines.splice(lastImportIndex + 1, 0, importStatement.trimEnd());
                content = lines.join('\n');
            }
        }

        // Generate route element
        const routeElement = `            <Route path="${path}" element={<${componentName} />} />`;

        // Check if route already exists
        if (content.includes(`path="${path}"`)) {
            console.log(`ℹ️  Route for path "${path}" already exists, skipping...`);
            return;
        }

        // Insert route at injection point
        content = content.replace(
            ROUTES_INJECTION_MARKER,
            `${routeElement}\n            ${ROUTES_INJECTION_MARKER}`
        );

        // Write back to file
        await writeFile(appFilePath, content, 'utf-8');
        console.log(`✅ Injected route "${path}" -> ${componentName}`);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.warn('⚠️  Warning: App.tsx not found, route injection skipped');
        } else {
            throw error;
        }
    }
}
