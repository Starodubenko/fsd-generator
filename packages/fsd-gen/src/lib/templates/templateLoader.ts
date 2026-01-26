import { readFile, readdir, stat } from 'fs/promises';
import { createJiti } from 'jiti';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { TemplateContext } from '../../config/types.js';
import { PRESET_DIRS, TEMPLATE_FILES } from '../constants.js';
import { EntityToken } from '../reverse/constants.js';

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
    searchDirs: string[],
    variables?: Record<string, any>
): Promise<string | null> {
    for (const templatesDir of searchDirs) {
        const templateDir = layer
            ? join(templatesDir, layer, type)
            : join(templatesDir, type);

        try {
            await stat(templateDir);
            return templateDir;
        } catch {
            // Not found in this dir, try resolved if tokens are present
            if (variables && type.includes('{{')) {
                const resolvedType = processTemplate(type, variables);
                if (resolvedType !== type) {
                    const resolvedTemplateDir = layer
                        ? join(templatesDir, layer, resolvedType)
                        : join(templatesDir, resolvedType);
                    try {
                        await stat(resolvedTemplateDir);
                        return resolvedTemplateDir;
                    } catch {
                        // Continue
                    }
                }
            }
        }
    }

    return null;
}

/**
 * Read the component template file
 * Supports .tsx, .ts, .js for dynamic templates, falls back to static string reading
 */
export async function readComponentTemplate(templateDir: string): Promise<string | ((context: TemplateContext) => string)> {
    // Try to find dynamic template files
    const extensions = ['.tsx', '.ts', '.js'];

    // Check for Component.tsx or tokenized names like {{name}}.tsx
    const possibleNames = [
        'Component',
        EntityToken.NAME,
        EntityToken.ENTITY_NAME,
        EntityToken.ENTITY_NAME_CAMEL,
        EntityToken.ENTITY_NAME_LOWER,
        EntityToken.ENTITY_NAME_UPPER,
        EntityToken.ENTITY_NAME_KEBAB
    ];

    // Check for Component.tsx, {{name}}.tsx, etc. that are modules
    for (const name of possibleNames) {
        for (const ext of extensions) {
            try {
                const modulePath = resolve(templateDir, `${name}${ext}`);
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
    }

    // List all files in the template directory to find component candidates
    // This handles variants like {{name}}.tsx, {{name}}Widget.tsx, etc.
    let allFiles: any[] = [];
    try {
        allFiles = await readdir(templateDir) || [];
    } catch (e) {
        // Directory might not exist or readdir might fail
    }

    const componentCandidates = allFiles
        .map(f => typeof f === 'string' ? f : (f as any).name)
        .filter(f =>
            f && (
                f.includes(EntityToken.NAME) ||
                f.includes(EntityToken.ENTITY_NAME) ||
                f.includes(EntityToken.ENTITY_NAME_CAMEL) ||
                f.includes(EntityToken.ENTITY_NAME_LOWER) ||
                f.includes(EntityToken.ENTITY_NAME_UPPER) ||
                f.includes(EntityToken.ENTITY_NAME_KEBAB) ||
                (f.startsWith('Component') && (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.jsx')))
            )
        );

    for (const fileName of componentCandidates) {
        // Skip styles
        if (fileName.includes('.styles.ts')) continue;
        // Skip index
        if (fileName === 'index.ts' || fileName === 'index.tsx') continue;

        const baseName = fileName.replace(/\.tsx?$/, '');

        // Try module first
        for (const ext of extensions) {
            try {
                const modulePath = resolve(templateDir, `${baseName}${ext}`);
                await stat(modulePath);
                const module = await jiti.import(modulePath) as { default: (context: any) => string };
                if (typeof module.default === 'function') {
                    return module.default;
                }
            } catch {
                // Continue
            }
        }

        // Try text
        try {
            const componentPath = join(templateDir, fileName);
            return await readFile(componentPath, 'utf-8');
        } catch {
            // Continue
        }
    }

    throw new Error(`No component template found in ${templateDir}. Expected Component.tsx, {{name}}.tsx or similar in ${templateDir}`);
}

/**
 * Read the styles template file (optional)
 * @returns The styles content or empty string if not found
 */
export async function readStylesTemplate(templateDir: string): Promise<string | ((context: TemplateContext) => string)> {
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
    customTemplatesDir?: string,
    variables?: Record<string, any>
): Promise<{ component: string | ((context: TemplateContext) => string); styles: string | ((context: TemplateContext) => string) }> {
    const searchDirs = resolveTemplateDirs(customTemplatesDir);
    const templateDir = await findTemplateDir(layer, type, searchDirs, variables);

    if (!templateDir) {
        const errorMsg = `Template not found for ${layer}/${type}. Checked paths: ${searchDirs.join(', ')}`;
        console.warn(`⚠️  ${errorMsg}`);
        throw new Error(errorMsg);
    }

    const component = await readComponentTemplate(templateDir);
    const styles = await readStylesTemplate(templateDir);

    console.log(`Loaded template from: ${templateDir}`);
    return { component, styles };
}

export function processTemplate(content: string | ((context: TemplateContext) => string), variables: Record<string, any> | TemplateContext): string {
    if (!content) return '';
    if (typeof content === 'function') {
        return content(variables as TemplateContext);
    }
    return content.replace(/\{\s*\{\s*([\w.]+)\s*\}\s*\}/g, (_, key) => {
        // First try direct access (supports flat keys with dots like "user.name")
        if (key in variables) {
            return String((variables as any)[key] ?? '');
        }
        // Fall back to nested resolution
        const value = key.split('.').reduce((obj: any, k: string) => obj && obj[k], variables);
        return String(value ?? '');
    });
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
