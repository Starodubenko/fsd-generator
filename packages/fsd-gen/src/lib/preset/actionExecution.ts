/**
 * Action execution engine for presets.
 * 
 * Responsible for executing the individual actions defined in a preset (e.g., creating files,
 * updating barrels, generating components). Handles variable substitution and logic execution.
 */
import { join, resolve, dirname, basename } from 'path';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { createJiti } from 'jiti';
import { updateBarrel } from '../barrels/updateBarrels.js';
import { ACTION_TYPES, FILE_EXTENSIONS } from '../constants.js';
import { generateComponent, generateHook, generateStyles } from '../generators/generate.js';
import { resolveFsdPaths } from '../naming/resolvePaths.js';
import { prepareTemplateVariables } from '../generators/presetExecutionHelpers.js';
import { processTemplate } from '../templates/templateLoader.js';
import { PresetAction, PresetComponentAction, PresetFileAction, FsdGenConfig, TemplateContext } from '../../config/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const jiti = createJiti(__filename);

/**
 * Prepare variables for an action by merging global and action-specific variables
 */
export function prepareActionVariables(
    action: PresetAction,
    name: string,
    globalVars: Record<string, any>
): Record<string, any> {
    const baseVars = prepareTemplateVariables(name, globalVars);
    const actionVars: Record<string, any> = {};

    // Resolve variables within action.variables if they contain tokens
    if (action.variables) {
        for (const [key, value] of Object.entries(action.variables)) {
            actionVars[key] = typeof value === 'string' ? processTemplate(value, baseVars) : value;
        }
    }

    return { ...baseVars, ...actionVars };
}

/**
 * Helper to resolve and load templates, supporting both literal and resolved paths
 */
async function getEffectiveTemplate(
    templatePath: string,
    variables: Record<string, any>,
    templatesDir?: string
): Promise<string> {
    // We try to resolve variables in the template path, but we also want to support
    // literal template paths that contain tokens (e.g. {{entityName}}.tsx)
    // The physical file might be named with tokens!

    // In current implementation, generateComponent etc expect a template name/path.
    // If we resolve it here, we might miss the physical file.
    // However, if we don't resolve it, we might miss the dynamic selection.

    // For now, we will return the resolved path BUT if a literal match is found later by 
    // loadTemplate/loadFileTemplate it should take precedence.
    // Actually, the loaders already check multiple paths.

    // Let's refine the logic: we want to try literal first, then resolved.
    return processTemplate(templatePath, variables);
}

/**
 * Execute a component action (generate a component)
 */
export async function executeComponentAction(
    action: PresetComponentAction,
    variables: Record<string, any>,
    config: FsdGenConfig
): Promise<void> {
    const componentName = processTemplate(action.name || action.slice, variables);
    const sliceName = processTemplate(action.slice, variables);

    const paths = resolveFsdPaths(
        config.rootDir!,
        action.layer,
        sliceName,
        componentName
    );

    const context = {
        ...variables,
        componentName,
        sliceName,
        template: {
            componentName,
            sliceName,
            layer: action.layer,
        },
    };

    // We try to find the template by literal name first in generateComponent (indirectly via loadTemplate)
    // But generateComponent takes a single templateOverride string.
    // To support the "literal first" requirement, we could modify generateComponent, 
    // or we can just pass the path and have generateComponent/loadTemplate handle the fallback.

    // Actually, let's keep it simple: the user wants to use variables in config.
    // If action.template is "ui/{{name}}.tsx", and a file "ui/{{name}}.tsx" exists, we use it.
    // if not, and "ui/User.tsx" exists, we use it.

    // I will modify loadFileTemplate and loadTemplate to try BOTH if tokens are present.
    await generateComponent(paths, context, action.template, config.templatesDir);
}

/**
 * Execute a hook action
 */
export async function executeHookAction(
    action: any, // Using any for now to avoid complexity with union types in loop
    variables: Record<string, any>,
    config: FsdGenConfig
): Promise<void> {
    const componentName = processTemplate(action.name || action.slice, variables);
    const sliceName = processTemplate(action.slice, variables);

    const paths = resolveFsdPaths(
        config.rootDir!,
        action.layer,
        sliceName,
        componentName
    );

    const context = {
        ...variables,
        componentName,
        sliceName,
        template: {
            componentName,
            sliceName,
            layer: action.layer,
        },
    };

    await generateHook(paths, context, action.template, config.templatesDir);
}

/**
 * Execute a styles action
 */
export async function executeStylesAction(
    action: any,
    variables: Record<string, any>,
    config: FsdGenConfig
): Promise<void> {
    const componentName = processTemplate(action.name || action.slice, variables);
    const sliceName = processTemplate(action.slice, variables);

    const paths = resolveFsdPaths(
        config.rootDir!,
        action.layer,
        sliceName,
        componentName
    );

    const context = {
        ...variables,
        componentName,
        sliceName,
        template: {
            componentName,
            sliceName,
            layer: action.layer,
        },
    };

    await generateStyles(paths, context, action.template, config.templatesDir);
}

/**
 * Load a file template from the templates directory
 */
export async function loadFileTemplate(
    templatePath: string,
    customTemplatesDir?: string,
    variables?: Record<string, any>
): Promise<string | ((context: TemplateContext) => string)> {
    const internalTemplatesDir = join(__dirname, '../../../templates');
    const pathsToCheck = [];

    // Prioritize literal paths with tokens if they exist on disk
    if (customTemplatesDir) {
        pathsToCheck.push(join(resolve(process.cwd(), customTemplatesDir), templatePath));
    }
    pathsToCheck.push(join(internalTemplatesDir, templatePath));

    // If template contains tokens, also check the resolved path
    if (variables && templatePath.includes('{{')) {
        const resolvedPath = processTemplate(templatePath, variables);
        if (resolvedPath !== templatePath) {
            if (customTemplatesDir) {
                pathsToCheck.push(join(resolve(process.cwd(), customTemplatesDir), resolvedPath));
            }
            pathsToCheck.push(join(internalTemplatesDir, resolvedPath));
        }
    }


    for (const p of pathsToCheck) {
        try {
            // Try loading as a module first if it's a TS/JS file
            if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js')) {
                try {
                    const module = await jiti.import(p) as { default: (context: TemplateContext) => string };
                    if (typeof module.default === 'function') {
                        console.log(`Loaded file template (module) from: ${p}`);
                        return module.default;
                    }
                } catch {
                    // Not a module or failed to load, fall back to string read
                }
            }

            const content = await readFile(p, 'utf-8');
            console.log(`Loaded file template from: ${p}`);
            return content;
        } catch {
            // Try next path
        }
    }

    throw new Error(`Could not find file template: ${templatePath}`);
}

/**
 * Execute a file action (create a file from template)
 */
export async function executeFileAction(
    action: PresetFileAction,
    variables: Record<string, any>,
    config: FsdGenConfig
): Promise<void> {
    const targetPath = join(
        process.cwd(),
        config.targetDir || config.rootDir!,
        processTemplate(action.path, variables)
    );

    await mkdir(dirname(targetPath), { recursive: true });

    if (action.template) {
        const context = {
            ...variables,
            template: {
                componentName: variables.componentName,
                sliceName: variables.sliceName || '',
                layer: typeof variables.layer === 'string' ? variables.layer : '',
            },
        };

        const content = await loadFileTemplate(action.template, config.templatesDir, variables);
        const processed = processTemplate(content, context);
        await writeFile(targetPath, processed);
        console.log(`Created ${targetPath}`);

        // Update barrel for the file (only for TypeScript files, except index)
        if ((targetPath.endsWith(FILE_EXTENSIONS.TYPESCRIPT) || targetPath.endsWith(FILE_EXTENSIONS.TSX)) && !targetPath.endsWith('index.ts')) {
            const dir = dirname(targetPath);
            const ext = targetPath.endsWith(FILE_EXTENSIONS.TSX) ? FILE_EXTENSIONS.TSX : FILE_EXTENSIONS.TYPESCRIPT;
            const fileName = basename(targetPath, ext); // Remove extension for export
            updateBarrel(dir, fileName, fileName);
        }
    }
}

/**
 * Execute all preset actions
 * Orchestrates executing component and file actions
 */
export async function executeActions(
    actions: PresetAction[],
    name: string,
    globalVars: Record<string, any>,
    config: FsdGenConfig
): Promise<void> {
    for (const action of actions) {
        const variables = prepareActionVariables(action, name, globalVars);

        switch (action.type) {
            case ACTION_TYPES.COMPONENT:
                await executeComponentAction(action, variables, config);
                break;
            case ACTION_TYPES.FILE:
                await executeFileAction(action, variables, config);
                break;
            case ACTION_TYPES.HOOK:
                await executeHookAction(action, variables, config);
                break;
            case ACTION_TYPES.STYLES:
                await executeStylesAction(action, variables, config);
                break;
        }
    }

    console.log('Preset generation complete (declarative).');
}
