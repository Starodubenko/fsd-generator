import { readdir, stat } from 'fs/promises';
import type { Dirent } from 'fs';
import { join } from 'path';
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
export async function createFeatureButtonActions(
    buttonsDir: string,
    entityName: string,
    presetName: string,
    conventions: ConventionConfig
): Promise<PresetAction[]> {
    const actions: PresetAction[] = [];
    const featurePrefix = conventions.featureSlicePrefix ?? 'Manage';
    const buttonEntries = await readdir(buttonsDir, { withFileTypes: true });

    for (const buttonEntry of buttonEntries) {
        if (buttonEntry.isDirectory()) {
            const buttonType = buttonEntry.name; // create, edit, delete
            const capitalizedType = buttonType.charAt(0).toUpperCase() + buttonType.slice(1);
            actions.push({
                type: ACTION_TYPES.COMPONENT,
                layer: FSD_LAYERS.FEATURE,
                slice: `${featurePrefix}${entityName}`,
                name: `${capitalizedType}${entityName}Button`,
                template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.FEATURE}/${PRESET_DIRS.BUTTONS}/${buttonEntry.name}`
            });
        }
    }

    return actions;
}

/**
 * Create component action for widget table
 */
export function createWidgetTableAction(
    entityName: string,
    presetName: string,
    conventions: ConventionConfig
): PresetComponentAction {
    const widgetSuffix = conventions.widgetSliceSuffix ?? 'Table';

    return {
        type: ACTION_TYPES.COMPONENT,
        layer: FSD_LAYERS.WIDGET,
        slice: `${entityName}${widgetSuffix}`,
        name: `${entityName}${widgetSuffix}`,
        template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.WIDGET}/${PRESET_DIRS.TABLE}`
    };
}

/**
 * Create component action for page
 */
export function createPageAction(
    entityName: string,
    presetName: string,
    conventions: ConventionConfig
): PresetComponentAction {
    const pageSuffix = conventions.pageSliceSuffix ?? 'Page';

    return {
        type: ACTION_TYPES.COMPONENT,
        layer: FSD_LAYERS.PAGE,
        slice: `${entityName}${pageSuffix}`,
        name: `${entityName}${pageSuffix}`,
        template: `${PRESET_DIRS.ROOT}/${presetName}/${FSD_LAYERS.PAGE}/${FSD_LAYERS.PAGE}`
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
        const entries = await scanLayerDirectory(presetDir, layer);

        for (const entry of entries) {
            const fullPath = join(presetDir, layer, entry.name);

            // Check for .ts files (file actions)
            if (entry.isFile() && entry.name.endsWith(FILE_EXTENSIONS.TYPESCRIPT)) {
                actions.push(createFileAction(entry, layer, entityName, presetName));
            }

            // Check for directories (component actions)
            if (entry.isDirectory()) {

                // Entity layer
                if (layer === FSD_LAYERS.ENTITY) {
                    if (entry.name === FSD_SEGMENTS.UI) {
                        actions.push(createEntityUiAction(entityName, presetName));
                    } else if (entry.name === FSD_SEGMENTS.API) {
                        const apiActions = await createEntityApiActions(fullPath, entityName, presetName);
                        actions.push(...apiActions);
                    }
                }

                // Feature layer
                else if (layer === FSD_LAYERS.FEATURE && entry.name === PRESET_DIRS.BUTTONS) {
                    const buttonActions = await createFeatureButtonActions(fullPath, entityName, presetName, conventions);
                    actions.push(...buttonActions);
                }

                // Widget layer
                else if (layer === FSD_LAYERS.WIDGET && entry.name === PRESET_DIRS.TABLE) {
                    actions.push(createWidgetTableAction(entityName, presetName, conventions));
                }

                // Page layer
                else if (layer === FSD_LAYERS.PAGE && entry.name === FSD_LAYERS.PAGE) {
                    actions.push(createPageAction(entityName, presetName, conventions));
                }

                // Shared layer
                else if (layer === FSD_LAYERS.SHARED) {
                    actions.push(createSharedAction(entry.name, entityName, presetName));
                }
            }
        }
    }

    return actions;
}
