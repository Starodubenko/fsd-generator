import { join } from 'path';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { generateComponent } from './generate.js';
import { loadConfig } from '../config/loadConfig.js';
import { resolveFsdPaths } from '../naming/resolvePaths.js';
import { processTemplate } from '../templates/templateLoader.js';

export async function generatePreset(presetName: string, name: string) {
    console.log(`Generating preset '${presetName}' for '${name}'...`);
    const config = await loadConfig();

    if (presetName === 'table') {
        // 1. Entity Model (Manual)
        const entityPaths = resolveFsdPaths(config.rootDir!, 'entity', name, name);
        const modelDir = join(entityPaths.slicePath, 'model');
        await mkdir(modelDir, { recursive: true });

        const modelTemplate = `export interface {{componentName}} {
  id: string;
  name: string;
}

export const mock{{componentName}}Data: {{componentName}}[] = [
  { id: '1', name: 'Test {{componentName}} 1' },
  { id: '2', name: 'Test {{componentName}} 2' },
];
`;
        const modelContent = processTemplate(modelTemplate, { componentName: name });
        await writeFile(join(modelDir, 'types.ts'), modelContent);
        console.log(`Created ${join(modelDir, 'types.ts')}`);

        // 1b. Entity UI
        await generateComponent({
            ...entityPaths
        }, {
            componentName: name,
            sliceName: name,
            layer: 'entity',
        }, 'preset/table/entity/ui');

        // 1c. Entity API (Hooks)
        const hooks = [
            { type: 'get', entry: 'useGet', suffix: 's' },
            { type: 'create', entry: 'useCreate', suffix: '' },
            { type: 'update', entry: 'useUpdate', suffix: '' },
            { type: 'delete', entry: 'useDelete', suffix: '' }
        ];

        for (const hook of hooks) {
            const hookName = `${hook.entry}${name}${hook.suffix}`;
            const apiPaths = {
                ...entityPaths,
                uiPath: join(entityPaths.slicePath, 'api'),
                componentPath: join(entityPaths.slicePath, 'api', hookName)
            };
            await generateComponent(apiPaths, {
                componentName: name,
                sliceName: name,
                layer: 'entity',
            }, `preset/table/entity/api/${hook.type}`);
        }

        // Update Entity index.ts to export api
        const entityIndex = join(entityPaths.slicePath, 'index.ts');
        try {
            let indexContent = await readFile(entityIndex, 'utf-8');
            if (!indexContent.includes(`export * from './api`)) {
                indexContent += `export * from './api';\n`;
                await writeFile(entityIndex, indexContent);
            }
        } catch (e) {
            // Ignore if index doesn't exist yet (generateComponent should create it but maybe race condition)
            await writeFile(entityIndex, `export * from './api';\n`);
        }

        // 2. Feature (Manage<Name> Buttons)
        const featureName = `Manage${name}`;
        const buttons = [
            { type: 'create', prefix: 'Create', suffix: 'Button' },
            { type: 'edit', prefix: 'Edit', suffix: 'Button' },
            { type: 'delete', prefix: 'Delete', suffix: 'Button' }
        ];

        // Entity alias already calculated above or here
        const entAlias = config.aliases && config.aliases['@entities'];
        const apiImportPath = entAlias ? `@entities/${name}/api` : `../../../entities/${name}/api`;

        for (const btn of buttons) {
            const btnName = `${btn.prefix}${name}${btn.suffix}`;
            await generateComponent({
                ...resolveFsdPaths(config.rootDir!, 'feature', featureName, btnName),
            }, {
                componentName: name,
                sliceName: featureName,
                layer: 'feature',
                /* @ts-ignore */
                apiImportPath
            }, `preset/table/feature/buttons/${btn.type}`);
        }

        // 3. Widget (<Name>Table)
        const widgetName = `${name}Table`;

        // Calculate import paths based on aliases
        const entityAlias = config.aliases && config.aliases['@entities'];
        const featureAlias = config.aliases && config.aliases['@features'];

        const entityImportPath = entityAlias ? `@entities/${name}` : `../../../entities/${name}`;
        const featureImportPath = featureAlias ? `@features/${featureName}` : `../../../features/${featureName}`;

        await generateComponent({
            ...resolveFsdPaths(config.rootDir!, 'widget', widgetName, widgetName),
        }, {
            componentName: name,
            sliceName: widgetName,
            layer: 'widget',
            // Pass extra variables
            /* @ts-ignore */
            entityImportPath,
            /* @ts-ignore */
            featureImportPath
        }, 'preset/table/widget/table');

        // 4. Page (<Name>Page)
        const pageName = `${name}Page`;
        const widgetAlias = config.aliases && config.aliases['@widgets'];
        const widgetImportPath = widgetAlias ? `@widgets/${widgetName}` : `../../../widgets/${widgetName}`;

        await generateComponent({
            ...resolveFsdPaths(config.rootDir!, 'page', pageName, pageName),
        }, {
            componentName: name,
            sliceName: pageName,
            layer: 'page',
            /* @ts-ignore */
            widgetImportPath
        }, 'preset/table/page/page');

        // 5. Routing
        const appPath = join(process.cwd(), config.rootDir!, 'App.tsx');
        try {
            let appContent = await readFile(appPath, 'utf-8');

            // Add import
            const importStatement = `import { ${pageName} } from './pages/${pageName}/ui/${pageName}';`;
            if (!appContent.includes(importStatement)) {
                appContent = importStatement + '\n' + appContent;
            }

            // Add Route
            const routeElement = `<Route path="/${name.toLowerCase()}" element={<${pageName} />} />`;

            if (!appContent.includes(routeElement)) {
                // Check for explicit injection point including JSX braces
                if (appContent.includes('{/* ROUTES_INJECTION_POINT */}')) {
                    appContent = appContent.replace(
                        '{/* ROUTES_INJECTION_POINT */}',
                        `${routeElement}\n            {/* ROUTES_INJECTION_POINT */}`
                    );
                } else if (appContent.includes('</Routes>')) {
                    appContent = appContent.replace(
                        '</Routes>',
                        `${routeElement}\n          </Routes>`
                    );
                } else {
                    console.warn('Could not find suitable location to inject route in App.tsx');
                }
            }

            await writeFile(appPath, appContent);
            console.log(`Updated App.tsx with route /${name.toLowerCase()}`);

        } catch (e) {
            console.warn('App.tsx not found or could not be updated for routing.', e);
        }

        console.log('Preset generation complete.');
    } else {
        console.error(`Unknown preset: ${presetName}`);
    }
}
