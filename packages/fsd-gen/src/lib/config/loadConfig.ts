/**
 * Configuration loading logic.
 * 
 * Responsible for finding, reading, parsing, and merging the fsd-gen configuration
 * file (fsdgen.config.ts/js). Handles JIT compilation of TypeScript configs.
 */
import { join } from 'path';
import { existsSync } from 'fs';
import { createJiti } from 'jiti';
import { FsdGenConfig, defaultConfig } from '../../config/types.js';
import { CONFIG_FILES } from '../constants.js';

/**
 * Find the config file in the given directory
 * @returns The config file path or null if not found
 */
export function findConfigFile(cwd: string): string | null {
    const configPath = join(cwd, CONFIG_FILES.FSD_GEN);
    return existsSync(configPath) ? configPath : null;
}

/**
 * Read and parse the config file
 * @returns The parsed config object
 */
export async function readConfigFile(configPath: string): Promise<Partial<FsdGenConfig>> {
    try {
        const jiti = createJiti(import.meta.url);
        const imported = await jiti.import(configPath, { default: true }) as Partial<FsdGenConfig>;
        return imported;
    } catch (error) {
        console.error('Failed to load config:', error);
        throw error;
    }
}

/**
 * Merge user config with default config
 */
export function mergeWithDefaults(config: Partial<FsdGenConfig>): FsdGenConfig {
    return {
        ...defaultConfig,
        ...config,
    };
}

/**
 * Load the FSD generator configuration
 * Orchestrates finding, reading, and merging config
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<FsdGenConfig> {
    const configPath = findConfigFile(cwd);

    if (!configPath) {
        return defaultConfig;
    }

    try {
        const userConfig = await readConfigFile(configPath);
        return mergeWithDefaults(userConfig);
    } catch {
        console.error('Failed to load config, using defaults');
        return defaultConfig;
    }
}
