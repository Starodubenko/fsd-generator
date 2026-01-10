import { join } from 'path';

export interface FsdPaths {
    layerPath: string;
    slicePath: string;
    uiPath: string;
    componentPath: string;
}

export function resolveFsdPaths(
    rootDir: string,
    layer: string,
    slice: string,
    componentName: string
): FsdPaths {
    const layerPlurals: Record<string, string> = {
        entity: 'entities',
        feature: 'features',
        widget: 'widgets',
        page: 'pages',
        shared: 'shared',
    };

    const layerDir = layerPlurals[layer] || layer;
    const layerPath = join(rootDir, layerDir);
    const slicePath = join(layerPath, slice);

    // For shared layer, the slice IS the path (e.g. "ui/Button"). 
    // We don't want another 'ui' folder inside.
    const isShared = layer === 'shared';
    const uiPath = isShared ? slicePath : join(slicePath, 'ui');

    const componentPath = join(uiPath, componentName);

    console.log('ResolvePaths:', { layer, slice, componentName, isShared, uiPath, componentPath });

    return {
        layerPath,
        slicePath,
        uiPath,
        componentPath,
    };
}
