
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { PresetAction, ConventionConfig } from '../../config/types.js';
import {
    LAYER_PLURALS,
    FSD_LAYERS,
    PRESET_DIRS,
    ACTION_TYPES
} from '../constants.js';

/**
 * Resolves the slice name for a given layer based on conventions
 */
export function resolveLayerSliceName(
    layer: string,
    entityName: string,
    conventions: ConventionConfig = {}
): string {
    if (layer === FSD_LAYERS.WIDGET) {
        return `${entityName}${conventions.widgetSliceSuffix ?? 'Widget'}`;
    }
    if (layer === FSD_LAYERS.PAGE) {
        return `${entityName}${conventions.pageSliceSuffix ?? 'Page'}`;
    }
    if (layer === FSD_LAYERS.FEATURE) {
        return `${conventions.featureSlicePrefix ?? 'Manage'}${entityName}`;
    }
    return entityName;
}

/**
 * Auto-discover templates in a preset directory based on conventions.
 * Scans the preset directory structure to automatically discover and register template actions.
 * Converts the file system structure of a preset into a list of executable generator actions.
 */
export async function discoverTemplates(
    presetDir: string,
    presetName: string,
    entityName: string,
    conventions: ConventionConfig = {}
): Promise<PresetAction[]> {
    const actions: PresetAction[] = [];
    const layers = [
        FSD_LAYERS.ENTITY,
        FSD_LAYERS.FEATURE,
        FSD_LAYERS.WIDGET,
        FSD_LAYERS.PAGE,
        FSD_LAYERS.SHARED
    ];

    for (const layer of layers) {
        const layerDir = join(presetDir, layer);
        if (!existsSync(layerDir)) continue;

        const layerPlural = LAYER_PLURALS[layer] || 'pages';
        const layerSliceName = resolveLayerSliceName(layer, entityName, conventions);

        const scanRecursive = async (currentDir: string, relPath: string = '') => {
            const entries = await readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const entryRelPath = join(relPath, entry.name);
                const fullPath = join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    await scanRecursive(fullPath, entryRelPath);
                } else if (entry.isFile()) {
                    actions.push({
                        type: ACTION_TYPES.FILE as any,
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
