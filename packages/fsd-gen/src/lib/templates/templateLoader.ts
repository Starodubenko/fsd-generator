import { readFile, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolve the list of directories to search for templates
 * Custom directory is checked first, then internal templates
 */
export function resolveTemplateDirs(customTemplatesDir?: string): string[] {
    const internalTemplatesDir = join(__dirname, '../../../templates');

    if (customTemplatesDir) {
        return [customTemplatesDir, internalTemplatesDir];
    }

    return [internalTemplatesDir];
}

/**
 * Find the template directory in the search directories
 * @returns The path to the template directory or null if not found
 */
export async function findTemplateDir(
    layer: string,
    type: string,
    searchDirs: string[]
): Promise<string | null> {
    for (const templatesDir of searchDirs) {
        const templateDir = layer
            ? join(templatesDir, layer, type)
            : join(templatesDir, type);

        try {
            await stat(templateDir);
            return templateDir;
        } catch {
            // Not found in this dir, continue
        }
    }

    return null;
}

/**
 * Read the component template file
 */
export async function readComponentTemplate(templateDir: string): Promise<string> {
    const componentPath = join(templateDir, 'Component.tsx');
    return await readFile(componentPath, 'utf-8');
}

/**
 * Read the styles template file (optional)
 * @returns The styles content or empty string if not found
 */
export async function readStylesTemplate(templateDir: string): Promise<string> {
    const stylesPath = join(templateDir, 'Component.styles.ts');
    try {
        return await readFile(stylesPath, 'utf-8');
    } catch {
        return '';
    }
}

/**
 * Load a template for a given layer and type
 * Orchestrates finding and reading template files
 */
export async function loadTemplate(
    layer: string,
    type: string = 'ui',
    customTemplatesDir?: string
): Promise<{ component: string; styles: string }> {
    const searchDirs = resolveTemplateDirs(customTemplatesDir);
    const templateDir = await findTemplateDir(layer, type, searchDirs);

    if (!templateDir) {
        console.warn(`Template not found: ${layer}/${type} in paths: ${searchDirs.join(', ')}`);
        throw new Error(`Template not found: ${layer}/${type}`);
    }

    const component = await readComponentTemplate(templateDir);
    const styles = await readStylesTemplate(templateDir);

    console.log(`Loaded template from: ${templateDir}`);
    return { component, styles };
}

export function processTemplate(content: string, variables: Record<string, string>): string {
    return content.replace(/\{\s*\{\s*(\w+)\s*\}\s*\}/g, (_, key) => variables[key] || '');
}

export async function listPresets(customTemplatesDir?: string): Promise<string[]> {
    const internalTemplatesDir = join(__dirname, '../../../templates');
    const presets = new Set<string>();

    const dirsToCheck = [internalTemplatesDir];
    if (customTemplatesDir) {
        dirsToCheck.unshift(customTemplatesDir);
    }

    for (const dir of dirsToCheck) {
        const presetDir = join(dir, 'preset');
        try {
            const entries = await readdir(presetDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    presets.add(entry.name);
                }
            }
        } catch (e) {
            // Ignore if directory doesn't exist
        }
    }

    return Array.from(presets);
}

export async function resolvePresetDir(presetName: string, customTemplatesDir?: string): Promise<string | null> {
    const internalTemplatesDir = join(__dirname, '../../../templates');
    const dirsToCheck = [internalTemplatesDir];
    if (customTemplatesDir) {
        dirsToCheck.unshift(customTemplatesDir);
    }

    for (const dir of dirsToCheck) {
        const presetDir = join(dir, 'preset', presetName);
        try {
            await stat(presetDir);
            return presetDir;
        } catch {
            // Check next
        }
    }
    return null;
}
