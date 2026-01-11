import { join } from 'path';
import { ROUTING } from '../constants.js';

export interface RouteInjectionOptions {
    /** Root directory where App.tsx is located */
    rootDir: string;
    /** Route path (e.g., '/test') */
    path: string;
    /** Import path for the page component (e.g., '@pages/TestPage') */
    importPath: string;
    /** Component name (e.g., 'TestPage') */
    componentName: string;
    /** Target file for route injection (e.g., 'App.tsx') @default "App.tsx" */
    appFile?: string;
}

import { readFile, writeFile } from 'fs/promises';


/**
 * Inject a route into App.tsx
 */
export async function injectRoute(options: RouteInjectionOptions): Promise<void> {
    const { rootDir, path, importPath, componentName, appFile = ROUTING.APP_FILE } = options;
    const appFilePath = join(rootDir, appFile);

    try {
        // Read App.tsx
        let content = await readFile(appFilePath, 'utf-8');

        // Check if route injection point exists
        if (!content.includes(ROUTING.MARKER)) {
            console.warn(`⚠️  Warning: ${ROUTING.MARKER} comment not found in ${ROUTING.APP_FILE}`);
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
            ROUTING.MARKER,
            `${routeElement}\n            ${ROUTING.MARKER}`
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
