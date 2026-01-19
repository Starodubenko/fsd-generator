import { FSD_LAYERS, NAMING_MODES, ACTION_TYPES, DISCOVERY_MODES, DEFAULT_ROOT_DIR } from '../lib/constants.js';

export type Layer = (typeof FSD_LAYERS)[keyof typeof FSD_LAYERS];

export interface FsdGenConfig {
    /**
     * Root directory of the source code.
     * @default "src"
     */
    rootDir?: string;

    /**
     * Alias configuration.
     * Key is the alias (e.g., "@"), value is the path relative to root (e.g., "./src").
     */
    aliases?: Record<string, string>;

    /**
     * Directory containing custom templates.
     * Calculated relative to the config file or process.cwd().
     */
    templatesDir?: string;

    /**
     * Naming convention enforcement.
     * @default "warn"
     */
    naming?: (typeof NAMING_MODES)[keyof typeof NAMING_MODES];
}

export const defaultConfig: FsdGenConfig = {
    rootDir: DEFAULT_ROOT_DIR,
    aliases: { '@': './src' },
    naming: NAMING_MODES.WARN,
};

export type PresetActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

export interface PresetActionBase {
    type: PresetActionType;
    variables?: Record<string, string>;
}

export interface PresetComponentAction extends PresetActionBase {
    type: typeof ACTION_TYPES.COMPONENT;
    layer: Layer;
    slice: string;
    name?: string;
    template: string;
}

export interface PresetFileAction extends PresetActionBase {
    type: typeof ACTION_TYPES.FILE;
    path: string;
    template: string;
}

export interface PresetHookAction extends PresetActionBase {
    type: typeof ACTION_TYPES.HOOK;
    layer: Layer;
    slice: string;
    name?: string;
    template: string;
}

export interface PresetStylesAction extends PresetActionBase {
    type: typeof ACTION_TYPES.STYLES;
    layer: Layer;
    slice: string;
    name?: string;
    template: string;
}

export type PresetAction = PresetComponentAction | PresetFileAction | PresetHookAction | PresetStylesAction;

export interface ConventionConfig {
    /** Prefix for feature slice names (e.g., 'Manage' -> 'ManageUser') */
    featureSlicePrefix?: string;
    /** Suffix for widget slice names (e.g., 'Table' -> 'UserTable') */
    widgetSliceSuffix?: string;
    /** Suffix for page slice names (e.g., 'Page' -> 'UserPage') */
    pageSliceSuffix?: string;
}

export interface RouteConfig {
    /** Route path (e.g., '/users', '/products/:id') */
    path: string;
    /** Import path for the page component (will be auto-generated if not provided) */
    importPath?: string;
    /** Component name (will be auto-generated from entity name if not provided) */
    componentName?: string;
    /** Target file for route injection (e.g., 'Router.tsx') @default "App.tsx" */
    appFile?: string;
}

export interface PresetConfig {
    /** Optional discovery mode ('auto' = scan directories, 'manual' = use actions array) */
    discoveryMode?: (typeof DISCOVERY_MODES)[keyof typeof DISCOVERY_MODES];
    /** Global variables available in all templates */
    variables?: Record<string, string>;
    /** Manual action definitions (required when discoveryMode is 'manual' or undefined) */
    actions?: PresetAction[];
    /** Convention overrides for auto-discovery mode */
    conventions?: ConventionConfig;
    /** Route configuration for automatic route generation */
    routing?: RouteConfig;
}

/** Arguments passed to preset configuration function */
export interface PresetConfigArgs {
    /** The entity name provided by the user (e.g., 'User', 'Product') */
    name: string;
    /** The loaded FSD generator configuration */
    config: FsdGenConfig;
}

export type PresetConfigFn = (args: PresetConfigArgs) => PresetConfig;

// Overloaded signatures for better type inference
export function definePreset(config: PresetConfig): PresetConfig;
export function definePreset(config: PresetConfigFn): PresetConfigFn;
export function definePreset(config: PresetConfig | PresetConfigFn): PresetConfig | PresetConfigFn {
    return config;
}

export interface TemplateContext extends Record<string, any> {
    componentName: string;
    sliceName: string;
    layer: string;
}

