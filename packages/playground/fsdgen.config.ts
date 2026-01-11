/**
 * FSD Generator Configuration
 */
import { defineConfig } from '@starodubenko/fsd-gen';

export default defineConfig({
    /**
     * The root directory where your source code is located.
     * All FSD layers (entities, features, etc.) will be looked up relative to this path.
     * @default "src"
     */
    rootDir: 'src',

    /**
     * Path aliases used in your project.
     * These help the generator understand how to resolve imports if needed.
     * Key: alias (e.g. "@"), Value: path relative to root (e.g. "./src")
     */
    aliases: {
        '@': './src',
        '@app': './src/app',
        '@pages': './src/pages',
        '@widgets': './src/widgets',
        '@features': './src/features',
        '@entities': './src/entities',
        '@shared': './src/shared',
    },

    templatesDir: './.fsd-templates',

    /**
     * How strict the generator should be about enforcing FSD naming conventions.
     * - 'error': Fail if naming is incorrect.
     * - 'warn': Log a warning but proceed.
     * - 'autoFix': Automatically correct the name (e.g. user -> User).
     * @default "warn"
     */
    naming: 'warn',
});
