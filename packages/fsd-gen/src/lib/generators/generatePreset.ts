import { join, resolve, dirname } from 'path';
import { writeFile, mkdir, readFile, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import { createJiti } from 'jiti';
import { generateComponent } from './generate.js';
import { loadConfig } from '../config/loadConfig.js';
import { resolveFsdPaths } from '../naming/resolvePaths.js';
import { PresetConfig } from '../../config/types.js';

import { processTemplate } from '../templates/templateLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generatePreset(presetName: string, name: string) {
    console.log(`Generating preset '${presetName}' for '${name}'...`);
    const config = await loadConfig();
    const templatesDir = config.templatesDir ? resolve(process.cwd(), config.templatesDir) : undefined;

    const { resolvePresetDir, processTemplate } = await import('../templates/templateLoader.js');
    const presetDir = await resolvePresetDir(presetName, templatesDir);


    if (presetDir) {
        let presetConfig: PresetConfig | null = null;

        // 1. Try preset.ts
        const presetTsPath = join(presetDir, 'preset.ts');
        try {
            await stat(presetTsPath);
            console.log(`Loading preset configuration from ${presetTsPath}...`);
            const jiti = createJiti(import.meta.url);
            // When importing preset.ts, we need to handle potential default export
            const imported = await jiti.import(presetTsPath, { default: true }) as any;
            presetConfig = imported.default || imported;
        } catch (e) {
            console.error('Error loading preset.ts:', e);
        }

        // 2. Try preset.json if TS failed/missing
        if (!presetConfig) {
            const presetJsonPath = join(presetDir, 'preset.json');
            try {
                const presetConfigContent = await readFile(presetJsonPath, 'utf-8');
                presetConfig = JSON.parse(presetConfigContent);
                console.log(`Found preset.json at ${presetJsonPath}, executing actions...`);
            } catch (e) {
                // Ignore
            }
        }

        if (typeof presetConfig === 'function') {
            presetConfig = (presetConfig as any)({ name, config });
        }


        if (presetConfig) {
            // Execute actions
            if (presetConfig.actions && Array.isArray(presetConfig.actions)) {

                const globalVars = presetConfig.variables || {};

                for (const action of presetConfig.actions) {
                    const variables = { name, componentName: name, ...globalVars, ...action.variables };


                    if (action.type === 'component') {
                        await generateComponent({
                            ...resolveFsdPaths(config.rootDir!, action.layer, processTemplate(action.slice, variables), processTemplate(action.name || action.slice, variables)),
                        }, {
                            ...variables, // Pass all variables first
                            componentName: processTemplate(action.name || action.slice, variables),
                            sliceName: processTemplate(action.slice, variables),
                            layer: action.layer,
                        }, action.template, config.templatesDir);
                    } else if (action.type === 'file') {

                        // Handle raw file creation (e.g. model/types.ts)
                        const targetPath = join(process.cwd(), config.rootDir!, processTemplate(action.path, variables));
                        await mkdir(join(targetPath, '..'), { recursive: true });

                        // Resolve template path from templatesDir (consistent with component resolution)
                        if (action.template) {
                            const templatesDir = config.templatesDir ? resolve(process.cwd(), config.templatesDir) : undefined;
                            const pathsToCheck = [];

                            if (templatesDir) {
                                pathsToCheck.push(join(templatesDir, action.template));
                            }
                            // Fallback to internal templates if needed
                            const internalTemplatesDir = join(__dirname, '../../../templates');
                            pathsToCheck.push(join(internalTemplatesDir, action.template));

                            let content = '';
                            for (const p of pathsToCheck) {
                                try {
                                    content = await readFile(p, 'utf-8');
                                    console.log(`Loaded file template from: ${p}`);
                                    break;
                                } catch { }
                            }

                            if (!content) {
                                console.warn(`Could not find file template: ${action.template}`);
                                continue;
                            }

                            const processed = processTemplate(content, variables);
                            await writeFile(targetPath, processed);
                            console.log(`Created ${targetPath}`);
                        }
                    }
                }
                console.log('Preset generation complete (declarative).');
                return;
            }
        }
    }

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
        }, 'preset/table/entity/ui', config.templatesDir);

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
            }, `preset/table/entity/api/${hook.type}`, config.templatesDir);
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
            }, `preset/table/feature/buttons/${btn.type}`, config.templatesDir);
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
        }, 'preset/table/widget/table', config.templatesDir);

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
        }, 'preset/table/page/page', config.templatesDir);

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
