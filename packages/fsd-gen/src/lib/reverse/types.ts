
export interface PresetSourceItem {
    root: string;
    targetLayer: 'entity' | 'feature' | 'widget' | 'page' | 'shared';
}

export interface PresetSourceConfig {
    /**
     * Optional global root path. If set, layer roots are relative to this path.
     * If not set, layer roots are relative to this file.
     */
    globalRoot?: string;
    mode?: 'short' | 'ejected';

    /**
     * The root path of the reference code (etalon)
     * @deprecated Use layers for multiple sources or simpler specific config
     */
    root?: string;

    /**
     * The target layer for the preset (default: 'entity')
     */
    targetLayer?: 'entity' | 'feature' | 'widget' | 'page' | 'shared';

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

export interface PresetConfigTokenMap {
    [original: string]: string;
}

export interface PresetConfigFile {
    path: string;
    targetLayer: string; // Store which layer this file belongs to
    tokens: PresetConfigTokenMap;
    // We might add imports later if needed for complex resolving
}

export interface PresetConfig {
    files: PresetConfigFile[];
}
