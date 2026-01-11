/**
 * Action execution engine for presets.
 * 
 * Responsible for executing the individual actions defined in a preset (e.g., creating files,
 * updating barrels, generating components). Handles variable substitution and logic execution.
 */
import { join, resolve, dirname, basename } from 'path';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { updateBarrel } from '../barrels/updateBarrels.js';
import { ACTION_TYPES, FILE_EXTENSIONS } from '../constants.js';
import { generateComponent, generateHook, generateStyles } from '../generators/generate.js';
import { resolveFsdPaths } from '../naming/resolvePaths.js';
import { processTemplate } from '../templates/templateLoader.js';
import { PresetAction, PresetComponentAction, PresetFileAction, FsdGenConfig } from '../../config/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Prepare variables for an action by merging global and action-specific variables
 */
export function prepareActionVariables(
    action: PresetAction,
    name: string,
    globalVars: Record<string, any>
): Record<string, any> {
    return {
        name,
        componentName: name,
        ...globalVars,
        ...action.variables
    };
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
        layer: action.layer,
    };

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
        layer: action.layer,
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
        layer: action.layer,
    };

    await generateStyles(paths, context, action.template, config.templatesDir);
}

/**
 * Load a file template from the templates directory
 */
export async function loadFileTemplate(
    templatePath: string,
    customTemplatesDir?: string
): Promise<string> {
    const internalTemplatesDir = join(__dirname, '../../../templates');
    const pathsToCheck = [];

    if (customTemplatesDir) {
        pathsToCheck.push(join(resolve(process.cwd(), customTemplatesDir), templatePath));
    }
    pathsToCheck.push(join(internalTemplatesDir, templatePath));

    for (const p of pathsToCheck) {
        try {
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
        config.rootDir!,
        processTemplate(action.path, variables)
    );

    await mkdir(dirname(targetPath), { recursive: true });

    if (action.template) {
        const content = await loadFileTemplate(action.template, config.templatesDir);
        const processed = processTemplate(content, variables);
        await writeFile(targetPath, processed);
        console.log(`Created ${targetPath}`);

        // Update barrel for the file (only for TypeScript files)
        if (targetPath.endsWith(FILE_EXTENSIONS.TYPESCRIPT) || targetPath.endsWith(FILE_EXTENSIONS.TSX)) {
            const dir = dirname(targetPath);
            const fileName = basename(targetPath, FILE_EXTENSIONS.TYPESCRIPT); // Remove .ts for export
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
