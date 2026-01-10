import { join, resolve, dirname } from 'path';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { generateComponent } from '../generators/generate.js';
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
    const paths = resolveFsdPaths(
        config.rootDir!,
        action.layer,
        processTemplate(action.slice, variables),
        processTemplate(action.name || action.slice, variables)
    );

    const context = {
        ...variables,
        componentName: processTemplate(action.name || action.slice, variables),
        sliceName: processTemplate(action.slice, variables),
        layer: action.layer,
    };

    await generateComponent(paths, context, action.template, config.templatesDir);
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

        if (action.type === 'component') {
            await executeComponentAction(action, variables, config);
        } else if (action.type === 'file') {
            await executeFileAction(action, variables, config);
        }
    }

    console.log('Preset generation complete (declarative).');
}
