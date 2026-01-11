/**
 * FSD Layer names and their plural forms
 */
export const FSD_LAYERS = {
    ENTITY: 'entity',
    FEATURE: 'feature',
    WIDGET: 'widget',
    PAGE: 'page',
    SHARED: 'shared',
} as const;

export const LAYER_PLURALS: Record<string, string> = {
    [FSD_LAYERS.ENTITY]: 'entities',
    [FSD_LAYERS.FEATURE]: 'features',
    [FSD_LAYERS.WIDGET]: 'widgets',
    [FSD_LAYERS.PAGE]: 'pages',
    [FSD_LAYERS.SHARED]: 'shared',
};

/**
 * FSD segment names (directories within slices)
 */
export const FSD_SEGMENTS = {
    UI: 'ui',
    MODEL: 'model',
    API: 'api',
    LIB: 'lib',
    CONFIG: 'config',
} as const;

/**
 * Template types for different layers
 */
export const DEFAULT_TEMPLATES: Record<string, string> = {
    [FSD_LAYERS.SHARED]: 'ui-basic',
    [FSD_LAYERS.ENTITY]: 'model-ui-basic',
    [FSD_LAYERS.FEATURE]: 'ui-model-basic',
    [FSD_LAYERS.WIDGET]: 'ui-basic',
    [FSD_LAYERS.PAGE]: 'ui-basic',
};

/**
 * File extensions
 */
export const FILE_EXTENSIONS = {
    TYPESCRIPT: '.ts',
    TSX: '.tsx',
    STYLES: '.styles.ts',
    JSON: '.json',
    CONFIG: 'config.ts',
    INDEX: 'index.ts',
} as const;

/**
 * Configuration file names
 */
export const CONFIG_FILES = {
    FSD_GEN: 'fsdgen.config.ts',
    PRESET_TS: 'preset.ts',
    PRESET_JSON: 'preset.json',
} as const;

/**
 * Preset directory names
 */
export const PRESET_DIRS = {
    ROOT: 'preset',
    BUTTONS: 'buttons',
    TABLE: 'table',
} as const;

/**
 * API hook operation names
 */
export const API_OPERATIONS = {
    GET: 'get',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
} as const;

/**
 * API hook name prefixes
 */
export const API_HOOK_PREFIXES: Record<string, string> = {
    [API_OPERATIONS.GET]: 'useGet',
    [API_OPERATIONS.CREATE]: 'useCreate',
    [API_OPERATIONS.UPDATE]: 'useUpdate',
    [API_OPERATIONS.DELETE]: 'useDelete',
};

/**
 * Default fallback template
 */
export const DEFAULT_TEMPLATE = 'ui-basic';

/**
 * Default root directory
 */
export const DEFAULT_ROOT_DIR = 'src';

/**
 * Preset action types
 */
export const ACTION_TYPES = {
    COMPONENT: 'component',
    FILE: 'file',
    HOOK: 'hook',
    STYLES: 'styles',
} as const;

/**
 * Discovery modes
 */
export const DISCOVERY_MODES = {
    AUTO: 'auto',
    MANUAL: 'manual',
} as const;

/**
 * Naming convention modes
 */
export const NAMING_MODES = {
    ERROR: 'error',
    WARN: 'warn',
    AUTO_FIX: 'autoFix',
} as const;

/**
 * Routing configuration constants
 */
export const ROUTING = {
    MARKER: '{/* ROUTES_INJECTION_POINT */}',
    IMPORTS_REGEX: /^(?:import|export)\s/m,
    APP_FILE: 'App.tsx',
} as const;

/**
 * Template file names
 */
export const TEMPLATE_FILES = {
    COMPONENT: 'Component.tsx',
    STYLES: 'Component.styles.ts',
} as const;
