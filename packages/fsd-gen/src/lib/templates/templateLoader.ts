import { readFile } from 'fs/promises';
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

export async function loadTemplate(layer: string, type: string = 'ui'): Promise<{ component: string; styles: string }> {
    // TODO: Make this robust to find project root or use configured path
    // consistently.

    // For now, assume we can find 'templates' directory up from here.
    // dist/lib/templates -> ../../../templates
    const templatesDir = join(__dirname, '../../../templates');

    // Structure: templates/layer/type/Component.tsx.hbs (or similar)
    // Spec: templates/entity, templates/feature etc.

    // Let's try basic structure:
    // templates/entity/ui-basic/Component.tsx
    // templates/entity/ui-basic/Component.styles.ts

    // Default to 'ui-basic' if not specified? 
    // Spec 7: "entity: model-ui-basic" is one template?
    // Let's assume 'type' corresponds to the template name.

    // If layer is empty, use type as the path relative to templates root
    const templateDir = layer
        ? join(templatesDir, layer, type)
        : join(templatesDir, type);

    // We expect Component.tsx and Component.styles.ts
    // We will read them as strings.

    try {
        const componentPath = join(templateDir, 'Component.tsx');
        const stylesPath = join(templateDir, 'Component.styles.ts');

        const component = await readFile(componentPath, 'utf-8');
        let styles = '';
        try {
            styles = await readFile(stylesPath, 'utf-8');
        } catch (e) {
            // Styles are optional, return empty string
            styles = '';
        }

        return { component, styles };
    } catch (e) {
        // If not found, fallback or error.
        console.warn(`Template not found: ${layer}/${type}. Using fallback.`);
        // Return empty or throw?
        // Let's throw to let user know.
        // Or maybe we haven't implemented all templates yet. 
        throw new Error(`Template not found: ${layer}/${type}`);
    }
}

export function processTemplate(content: string, variables: Record<string, string>): string {
    return content.replace(/{{(\w+)}}/g, (_, key) => variables[key] || '');
}
