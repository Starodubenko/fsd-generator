import { readFile, readdir, stat } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createJiti } from 'jiti';
import { TEMPLATE_FILES, PRESET_DIRS } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jiti = createJiti(__filename);

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
 * Supports .tsx, .ts, .js for dynamic templates, falls back to static string reading
 */
export async function readComponentTemplate(templateDir: string): Promise<string | ((context: any) => string)> {
    // Try to find dynamic template files
    const extensions = ['.tsx', '.ts', '.js'];
    const baseName = TEMPLATE_FILES.COMPONENT.replace('.tsx', ''); // Removing extension if present in constant to try different ones

    // Check for Component.tsx, Component.ts, Component.js that are modules
    for (const ext of extensions) {
        try {
            const modulePath = resolve(templateDir, `Component${ext}`);
            await stat(modulePath);
            // Found a module file, load it with jiti
            const module = await jiti.import(modulePath) as { default: (context: any) => string };
            if (typeof module.default === 'function') {
                return module.default;
            }
        } catch {
            // Continue
        }
    }

    // Fallback to reading as text (original behavior)
    const componentPath = join(templateDir, TEMPLATE_FILES.COMPONENT);
    return await readFile(componentPath, 'utf-8');
}

/**
 * Read the styles template file (optional)
 * @returns The styles content or empty string if not found
 */
export async function readStylesTemplate(templateDir: string): Promise<string | ((context: any) => string)> {
    // Try to find dynamic template files
    const extensions = ['.ts', '.js'];

    // Check for Component.styles.ts, Component.styles.js
    for (const ext of extensions) {
        try {
            // Adjust this if TEMPLATE_FILES.STYLES differs
            const modulePath = join(templateDir, `Component.styles${ext}`);
            await stat(modulePath);
            // Found a module file, load it with jiti
            const module = await jiti.import(modulePath) as { default: (context: any) => string };
            if (typeof module.default === 'function') {
                return module.default;
            }
        } catch {
            // Continue
        }
    }

    const stylesPath = join(templateDir, TEMPLATE_FILES.STYLES);
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
): Promise<{ component: string | ((context: any) => string); styles: string | ((context: any) => string) }> {
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

export function processTemplate(content: string | ((context: any) => string), variables: Record<string, any>): string {
    if (typeof content === 'function') {
        return content(variables);
    }
    return content.replace(/\{\s*\{\s*(\w+)\s*\}\s*\}/g, (_, key) => String(variables[key] ?? ''));
}

export async function listPresets(customTemplatesDir?: string): Promise<string[]> {
    const internalTemplatesDir = join(__dirname, '../../../templates');
    const presets = new Set<string>();

    const dirsToCheck = [internalTemplatesDir];
    if (customTemplatesDir) {
        dirsToCheck.unshift(customTemplatesDir);
    }

    for (const dir of dirsToCheck) {
        const presetDir = join(dir, PRESET_DIRS.ROOT);
        try {
            const entries = await readdir(presetDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    presets.add(entry.name);
                }
            }
        } catch {
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
        const presetDir = join(dir, PRESET_DIRS.ROOT, presetName);
        try {
            await stat(presetDir);
            return presetDir;
        } catch {
            // Check next
        }
    }
    return null;
}
