/**
 * Helper types and interfaces for defining and using presets.
 * 
 * Provides utility functions for creating preset helpers that standardize naming conventions,
 * path resolution, and variable generation for preset authors.
 */
import type { FsdGenConfig, PresetHelpers, PresetHelperOptions } from '../../config/types.js';

/**
 * Helper function to resolve import paths and slice names for presets.
 * Automatically handles FSD layer aliases if configured.
 * 
 * @param name - The entity name (e.g., 'User', 'Product')
 * @param config - The loaded FSD generator configuration
 * @param options - Optional naming conventions
 * @returns Object with computed import paths and slice names
 * 
 * @example
 * ```ts
 * export default definePreset(({ name, config }) => {
 *   const helpers = createPresetHelpers(name, config);
 *   return {
 *     variables: { ...helpers },
 *     // ...
 *   };
 * });
 * ```
 */
export function createPresetHelpers(
    name: string,
    config: FsdGenConfig,
    options: PresetHelperOptions = {}
): PresetHelpers {
    const {
        featurePrefix = 'Manage',
        widgetSuffix = '',
        pageSuffix = 'Page'
    } = options;

    const aliases = config.aliases || {};
    const hasEntAlias = !!aliases['@entities'];
    const hasFeatAlias = !!aliases['@features'];
    const hasWidgetAlias = !!aliases['@widgets'];
    const hasPageAlias = !!aliases['@pages'];

    const entityImportPath = hasEntAlias
        ? `@entities/${name}`
        : `../../../entities/${name}`;

    const apiImportPath = `${entityImportPath}/ui`;

    const featureSlice = `${featurePrefix}${name}`;
    const featureImportPath = hasFeatAlias
        ? `@features/${featureSlice}`
        : `../../../features/${featureSlice}`;

    const widgetSlice = `${name}${widgetSuffix}`;
    const widgetImportPath = hasWidgetAlias
        ? `@widgets/${widgetSlice}`
        : `../../../widgets/${widgetSlice}`;

    const pageSlice = `${name}${pageSuffix}`;
    const pageImportPath = hasPageAlias
        ? `@pages/${pageSlice}`
        : `../../../pages/${pageSlice}`;

    return {
        base: {
            baseName: name,
            name,
        },
        layer: {
            entity: {
                importPath: entityImportPath,
                apiPath: apiImportPath,
            },
            features: {
                slice: featureSlice,
                importPath: featureImportPath,
            },
            widget: {
                slice: widgetSlice,
                importPath: widgetImportPath,
            },
            page: {
                slice: pageSlice,
                importPath: pageImportPath,
            },
        },
    };
}
