

import { EntityTokenValue, FsdLayerValue } from './constants.js';

export interface PresetSourceItem {
    /**
     * Root directory or array of root directories to analyze.
     * If array is provided and folder names conflict, indices will be appended.
     * Example: ['src/entities/User', 'src/features/User'] -> User, User1
     */
    root: string | string[];
    targetLayer: FsdLayerValue;
    /**
     * Resolved name for this source (used when multiple roots have conflicting names)
     * If not set, basename of root is used
     */
    resolvedName?: string;
}

/**
 * Normalized version of PresetSourceItem where root is always a string.
 * This is returned by normalizeLayers() after expanding array roots.
 */
export interface NormalizedPresetSourceItem {
    root: string;
    targetLayer: FsdLayerValue;
    resolvedName?: string;
}

export interface PresetSourceConfig {
    /**
     * Optional global root path. If set, layer roots are relative to this path.
     * If not set, layer roots are relative to this file.
     */
    globalRoot?: string;
    mode?: 'short' | 'ejected';

    /**
     * The root path of the reference code (etalon).
     * Can be a single path or array of paths.
     * If array is provided and folder names conflict, indices will be appended.
     * Example: ['src/entities/User', 'src/features/User'] -> User, User1
     * @deprecated Use layers for multiple sources or simpler specific config
     */
    root?: string | string[];

    /**
     * The target layer for the preset (default: 'entity')
     */
    targetLayer?: FsdLayerValue;

    /**
     * Multiple sources for different layers
     */
    layers?: PresetSourceItem[];

    /**
     * Additional options
     */
    options?: {
        language?: 'typescript' | 'javascript';
        /**
         * Names to ignore/exclude from tokenization
         */
        ignore?: string[];
    };
}

/**
 * Maps original strings found in source code to entity tokens
 * Example: { "User": "{{entityName}}", "user": "{{entityNameCamel}}" }
 */
export interface PresetConfigTokenMap {
    [original: string]: EntityTokenValue | string; // Allow string for backward compatibility
}

export interface PresetConfigFile {
    path: string;
    targetLayer: FsdLayerValue | string; // Store which layer this file belongs to, allow string for backward compatibility
    tokens: PresetConfigTokenMap;
    // We might add imports later if needed for complex resolving
}

export interface PresetConfig {
    files: PresetConfigFile[];
}
