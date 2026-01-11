/**
 * Helper types and interfaces for defining and using presets.
 * 
 * Provides utility functions for creating preset helpers that standardize naming conventions,
 * path resolution, and variable generation for preset authors.
 */
import { FsdGenConfig } from '../../config/types.js';

export interface PresetHelpers {
    /** Base name (same as input name) */
    baseName: string;
    /** Import path for entity layer (with or without alias) */
    entityImportPath: string;
    /** Feature slice name (e.g., 'ManageUser') */
    featureSlice: string;
    /** Import path for feature layer */
    featureImportPath: string;
    /** Widget slice name (e.g., 'UserTable') */
    widgetSlice: string;
    /** Import path for widget layer */
    widgetImportPath: string;
    /** Page slice name (e.g., 'UserPage') */
    pageSlice: string;
    /** Import path for page layer */
    pageImportPath: string;
}

export interface PresetHelperOptions {
    /** Prefix for feature slice names (default: 'Manage') */
    featurePrefix?: string;
    /** Suffix for widget slice names (default: 'Table') */
    widgetSuffix?: string;
    /** Suffix for page slice names (default: 'Page') */
    pageSuffix?: string;
}

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
        widgetSuffix = 'Table',
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
        baseName: name,
        entityImportPath,
        featureSlice,
        featureImportPath,
        widgetSlice,
        widgetImportPath,
        pageSlice,
        pageImportPath
    };
}
