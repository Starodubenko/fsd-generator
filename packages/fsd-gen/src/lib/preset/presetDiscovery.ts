/**
 * Preset discovery mechanism.
 * 
 * Scans the preset directory structure to automatically discover and register template actions.
 * Converts the file system structure of a preset into a list of executable generator actions.
 */
/**
 * Preset discovery mechanism.
 * 
 * Scans the preset directory structure to automatically discover and register template actions.
 * Converts the file system structure of a preset into a list of executable generator actions.
 */
import { readdir, stat } from 'fs/promises';
import { existsSync, Dirent } from 'fs';
import { join, basename } from 'path';
import { PresetAction, PresetComponentAction, PresetFileAction, ConventionConfig } from '../../config/types.js';
import {
    LAYER_PLURALS,
    FSD_LAYERS,
    FSD_SEGMENTS,
    FILE_EXTENSIONS,
    PRESET_DIRS,
    API_HOOK_PREFIXES,
    API_OPERATIONS,
    ACTION_TYPES
} from '../constants.js';

/**
 * Scan a layer directory for entries
 */
export async function scanLayerDirectory(presetDir: string, layer: string): Promise<Dirent[]> {
    const layerDir = join(presetDir, layer);

    try {
        const layerStat = await stat(layerDir);
        if (!layerStat.isDirectory()) return [];

        return await readdir(layerDir, { withFileTypes: true });
    } catch {
        return [];
    }
}

/**
 * Create a file action from a .ts file entry
 */
export function createFileAction(
    entry: Dirent,
    layer: string,
    entityName: string,
    presetName: string
): PresetFileAction {
    const baseName = entry.name.replace(FILE_EXTENSIONS.TYPESCRIPT, '');
    const layerPlural = LAYER_PLURALS[layer] || 'pages';

    return {
        type: ACTION_TYPES.FILE,
        path: `${layerPlural}/${entityName}/${FSD_SEGMENTS.MODEL}/${baseName}${FILE_EXTENSIONS.TYPESCRIPT}`,
        template: `${PRESET_DIRS.ROOT}/${presetName}/${layer}/${entry.name}`
    };
}

/**
 * Create component action for entity UI
 */
export function createEntityUiAction(
    entityName: string,
    presetName: string
): PresetComponentAction {
    return {
        type: ACTION_TYPES.COMPONENT,
        layer: FSD_LAYERS.ENTITY,
        slice: entityName,
        name: entityName,
        template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.ENTITY}/${FSD_SEGMENTS.UI}`
    };
}

/**
 * Create component actions for entity API hooks
 */
export async function createEntityApiActions(
    apiDir: string,
    entityName: string,
    presetName: string
): Promise<PresetAction[]> {
    const actions: PresetAction[] = [];
    const apiEntries = await readdir(apiDir, { withFileTypes: true });

    for (const apiEntry of apiEntries) {
        if (apiEntry.isDirectory()) {
            const hookName = apiEntry.name;
            const hookPrefix = API_HOOK_PREFIXES[hookName];
            const name = hookPrefix
                ? `${hookPrefix}${entityName}${hookName === API_OPERATIONS.GET ? 's' : ''}`
                : `use${hookName.charAt(0).toUpperCase() + hookName.slice(1)}${entityName}`;

            actions.push({
                type: ACTION_TYPES.HOOK,
                layer: FSD_LAYERS.ENTITY,
                slice: entityName,
                name,
                template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.ENTITY}/${FSD_SEGMENTS.API}/${apiEntry.name}`
            });
        }
    }

    return actions;
}

/**
 * Create component actions for feature buttons
 */
/**
 * Create component actions for feature sub-components (grouped by directory)
 */
export async function createFeatureActions(
    featureDir: string,
    entityName: string,
    presetName: string,
    conventions: ConventionConfig
): Promise<PresetAction[]> {
    const actions: PresetAction[] = [];
    const featurePrefix = conventions.featureSlicePrefix ?? 'Manage';
    const featureEntries = await readdir(featureDir, { withFileTypes: true });

    for (const featureEntry of featureEntries) {
        if (featureEntry.isDirectory()) {
            const featureName = featureEntry.name;
            const capitalizedName = featureName.charAt(0).toUpperCase() + featureName.slice(1);
            actions.push({
                type: ACTION_TYPES.COMPONENT,
                layer: FSD_LAYERS.FEATURE,
                slice: `${featurePrefix}${entityName}`,
                name: `${capitalizedName}${entityName}`,
                template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.FEATURE}/${basename(featureDir)}/${featureEntry.name}`
            });
        }
    }

    return actions;
}

/**
 * Create component action for widget
 */
export function createWidgetAction(
    entityName: string,
    presetName: string,
    conventions: ConventionConfig,
    templateDir: string
): PresetComponentAction {
    const widgetSuffix = conventions.widgetSliceSuffix ?? 'Table';

    return {
        type: ACTION_TYPES.COMPONENT,
        layer: FSD_LAYERS.WIDGET,
        slice: `${entityName}${widgetSuffix}`,
        name: `${entityName}${widgetSuffix}`,
        template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.WIDGET}/${templateDir}`
    };
}

/**
 * Create component action for page
 */
/**
 * Create component action for page
 */
export function createPageAction(
    entityName: string,
    presetName: string,
    conventions: ConventionConfig,
    templateDir: string
): PresetComponentAction {
    const pageSuffix = conventions.pageSliceSuffix ?? 'Page';

    return {
        type: ACTION_TYPES.COMPONENT,
        layer: FSD_LAYERS.PAGE,
        slice: `${entityName}${pageSuffix}`,
        name: `${entityName}${pageSuffix}`,
        template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.PAGE}/${templateDir}`
    };
}

/**
 * Create component action for shared
 */
export function createSharedAction(
    entryName: string,
    entityName: string,
    presetName: string
): PresetComponentAction {
    // Shared components often don't follow entity naming directly,
    // but in discovery mode we treat existing dirs as components.
    return {
        type: ACTION_TYPES.COMPONENT,
        layer: FSD_LAYERS.SHARED,
        slice: entryName === FSD_LAYERS.SHARED ? entityName : entryName,
        name: entryName === FSD_LAYERS.SHARED ? entityName : entryName,
        template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.SHARED}/${entryName}`
    };
}

/**
 * Discover extra files in a component directory (like hooks, styles, etc.)
 */
async function discoverExtraFiles(
    dir: string,
    layer: string,
    sliceName: string,
    segment: string,
    presetName: string,
    mainComponentFile?: string
): Promise<PresetAction[]> {
    const actions: PresetAction[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    const layerPlural = LAYER_PLURALS[layer] || 'pages';

    const componentPatterns = [
        'Component.tsx',
        '{{name}}.tsx',
        '{{entityName}}.tsx',
        '{{name}}Widget.tsx',
        '{{name}}Page.tsx',
        '{{name}}Feature.tsx'
    ];

    for (const entry of entries) {
        if (entry.isFile()) {
            if (entry.name === mainComponentFile) continue;
            if (componentPatterns.includes(entry.name)) continue;

            // Ignore styles if they are likely handled by COMPONENT action
            if (entry.name === 'Component.styles.ts' || entry.name.includes('.styles.ts')) continue;

            actions.push({
                type: ACTION_TYPES.FILE,
                path: `${layerPlural}/${sliceName}/${segment}/${entry.name}`,
                template: `${PRESET_DIRS.ROOT}/${presetName}/${layer}/${segment}/${entry.name}`
            });
        }
    }
    return actions;
}

/**
 * Auto-discover templates in a preset directory based on conventions
 * Orchestrates scanning all layers and creating appropriate actions
 */
export async function discoverTemplates(
    presetDir: string,
    presetName: string,
    entityName: string,
    conventions: ConventionConfig = {}
): Promise<PresetAction[]> {
    const actions: PresetAction[] = [];
    const layers = ['entity', 'feature', 'widget', 'page', 'shared'] as const;

    for (const layer of layers) {
        const layerDir = join(presetDir, layer);
        if (!existsSync(layerDir)) continue;

        const layerPlural = LAYER_PLURALS[layer] || 'pages';

        // Determine slice name pattern for this layer
        let layerSliceName = entityName;
        if (layer === FSD_LAYERS.WIDGET) layerSliceName = `${entityName}${conventions.widgetSliceSuffix ?? 'Widget'}`;
        else if (layer === FSD_LAYERS.PAGE) layerSliceName = `${entityName}${conventions.pageSliceSuffix ?? 'Page'}`;
        else if (layer === FSD_LAYERS.FEATURE) layerSliceName = `${conventions.featureSlicePrefix ?? 'Manage'}${entityName}`;

        const scanRecursive = async (currentDir: string, relPath: string = '') => {
            const entries = await readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const entryRelPath = join(relPath, entry.name);
                const fullPath = join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    await scanRecursive(fullPath, entryRelPath);
                } else if (entry.isFile()) {
                    actions.push({
                        type: ACTION_TYPES.FILE,
                        path: `${layerPlural}/${layerSliceName}/${entryRelPath}`,
                        template: `${PRESET_DIRS.ROOT}/${presetName}/${layer}/${entryRelPath}`
                    });
                }
            }
        };

        await scanRecursive(layerDir);
    }

    return actions;
}
