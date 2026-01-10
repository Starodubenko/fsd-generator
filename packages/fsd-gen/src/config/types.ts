export type Layer = 'entity' | 'feature' | 'widget' | 'page' | 'shared';

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
    naming?: 'error' | 'warn' | 'autoFix';
}

export const defaultConfig: FsdGenConfig = {
    rootDir: 'src',
    aliases: { '@': './src' },
    naming: 'warn',
};

export type PresetActionType = 'component' | 'file';

export interface PresetActionBase {
    type: PresetActionType;
    variables?: Record<string, string>;
}

export interface PresetComponentAction extends PresetActionBase {
    type: 'component';
    layer: 'entity' | 'feature' | 'widget' | 'page' | 'shared';
    slice: string;
    name: string;
    template: string;
}

export interface PresetFileAction extends PresetActionBase {
    type: 'file';
    path: string;
    template: string;
}

export type PresetAction = PresetComponentAction | PresetFileAction;

export interface PresetConfig {
    variables?: Record<string, string>;
    actions: PresetAction[];
}


export type PresetConfigFn = (args: { name: string; config: FsdGenConfig }) => PresetConfig;

export function definePreset(config: PresetConfig | PresetConfigFn): PresetConfig | PresetConfigFn {
    return config;
}


