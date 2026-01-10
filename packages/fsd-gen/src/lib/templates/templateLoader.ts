import { readFile, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Assuming templates are in root/templates
// Code is in dist/lib/templates/loadTemplate.js (compiled)
// Root is ../../../
// Or ../../../../ if we are in dist/lib/templates
// Let's resolve relative to package root.

// NOTE: When running locally, __dirname is .../dist/lib/templates
// templates dir is .../templates (in root)

export async function loadTemplate(
    layer: string,
    type: string = 'ui',
    customTemplatesDir?: string
): Promise<{ component: string; styles: string }> {
    const internalTemplatesDir = join(__dirname, '../../../templates');

    // Default search path: just the internal one
    let searchDirs = [internalTemplatesDir];

    // If custom directory provided, check it FIRST
    if (customTemplatesDir) {
        // Resolve absolute path if needed, but assuming caller passes absolute or correct relative
        // For CLI generic usage, best if caller resolves it to absolute keying off config location.
        // Let's assume absolute path passed for safety, or we resolve relative to cwd?
        // generate.ts -> will likely pass resolved path.
        searchDirs = [customTemplatesDir, internalTemplatesDir];
    }

    // Attempt to find template in searchDirs
    for (const templatesDir of searchDirs) {
        const templateDir = layer
            ? join(templatesDir, layer, type)
            : join(templatesDir, type);

        const componentPath = join(templateDir, 'Component.tsx');

        // Check existence quickly? readFile throws if not found
        // We can just try/catch
        try {
            const component = await readFile(componentPath, 'utf-8');

            // If component found, try styles
            const stylesPath = join(templateDir, 'Component.styles.ts');
            let styles = '';
            try {
                styles = await readFile(stylesPath, 'utf-8');
            } catch {
                styles = '';
            }

            console.log(`Loaded template from: ${templateDir}`);
            return { component, styles };

        } catch (e) {
            // Not found in this dir, continue
        }
    }

    // If we reach here, found nothing
    console.warn(`Template not found: ${layer}/${type} in paths: ${searchDirs.join(', ')}`);
    throw new Error(`Template not found: ${layer}/${type}`);
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
