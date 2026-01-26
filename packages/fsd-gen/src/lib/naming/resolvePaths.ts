/**
 * FSD path resolution logic.
 * 
 * Determines the correct file system paths for entities based on their layer, slice,
 * and name. Handles the structural rules of Feature-Sliced Design (e.g. shared vs page vs entity).
 */
import { join } from 'path';
import { LAYER_PLURALS, FSD_SEGMENTS, FSD_LAYERS } from '../constants.js';

export interface FsdPaths {
    layerPath: string;
    slicePath: string;
    uiPath: string;
    componentPath: string;
}

/**
 * Map layer name to plural directory name
 */
export function getLayerPlural(layer: string): string {
    return LAYER_PLURALS[layer] || layer;
}

/**
 * Build the full path to the layer directory
 */
export function buildLayerPath(rootDir: string, layer: string): string {
    const layerDir = getLayerPlural(layer);
    return join(rootDir, layerDir);
}

/**
 * Build the path to the slice directory
 */
export function buildSlicePath(layerPath: string, slice: string): string {
    return join(layerPath, slice);
}

/**
 * Build the path to the UI directory
 * Handles special case for shared layer (no extra ui folder)
 */
export function buildUiPath(slicePath: string, layer: string): string {
    const isShared = layer === FSD_LAYERS.SHARED;
    return isShared ? slicePath : join(slicePath, FSD_SEGMENTS.UI);
}

/**
 * Build the path to the component directory
 */
export function buildComponentPath(uiPath: string, componentName: string): string {
    return join(uiPath, componentName);
}

/**
 * Resolve all FSD paths for a component
 * Orchestrates building individual path segments
 */
export function resolveFsdPaths(
    rootDir: string = 'src',
    layer: string,
    slice: string,
    componentName: string
): FsdPaths {
    const finalRootDir = rootDir ?? 'src';
    const layerPath = buildLayerPath(finalRootDir, layer);
    const slicePath = buildSlicePath(layerPath, slice);
    const uiPath = buildUiPath(slicePath, layer);
    const componentPath = buildComponentPath(uiPath, componentName);

    console.log('ResolvePaths:', { layer, slice, componentName, isShared: layer === FSD_LAYERS.SHARED, uiPath, componentPath });

    return {
        layerPath,
        slicePath,
        uiPath,
        componentPath,
    };
}
