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
