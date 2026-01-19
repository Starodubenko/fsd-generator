/**
 * Preset loading logic.
 * 
 * Responsible for loading preset configurations from either TypeScript files (preset.ts)
 * or JSON files (preset.json). Handles module resolution and parsing.
 */
import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import { createJiti } from 'jiti';
import { PresetConfig, PresetConfigArgs, PresetConfigFn, FsdGenConfig } from '../../config/types.js';

/**
 * Load preset configuration from preset.ts file
 * @returns The preset config or null if not found
 */
export async function loadPresetTs(presetDir: string): Promise<PresetConfig | PresetConfigFn | null> {
    const presetTsPath = join(presetDir, 'preset.ts');

    try {
        await stat(presetTsPath);
        console.log(`Loading preset configuration from ${presetTsPath}...`);

        const jiti = createJiti(import.meta.url);
        const imported = await jiti.import(presetTsPath, { default: true }) as any;
        return imported.default || imported;
    } catch (error) {
        console.error(`Failed to load preset content from ${presetTsPath}:`, error);
        return null;
    }
}

/**
 * Load preset configuration from preset.json file
 * @returns The preset config or null if not found
 */
export async function loadPresetJson(presetDir: string): Promise<PresetConfig | null> {
    const presetJsonPath = join(presetDir, 'preset.json');

    try {
        const content = await readFile(presetJsonPath, 'utf-8');
        console.log(`Found preset.json at ${presetJsonPath}...`);
        return JSON.parse(content);
    } catch {
        return null;
    }
}

/**
 * Evaluate preset config if it's a function
 */
export function evaluatePresetConfig(
    config: PresetConfig | PresetConfigFn,
    args: PresetConfigArgs
): PresetConfig {
    if (typeof config === 'function') {
        return (config as PresetConfigFn)(args);
    }
    return config;
}

/**
 * Load preset configuration from a preset directory
 * Tries preset.ts first, then preset.json
 * Orchestrates the entire preset config loading process
 */
export async function loadPresetConfig(
    presetDir: string,
    name: string,
    config: FsdGenConfig
): Promise<PresetConfig | null> {
    // Try preset.ts first
    let presetConfig = await loadPresetTs(presetDir);

    // Fall back to preset.json
    if (!presetConfig) {
        presetConfig = await loadPresetJson(presetDir);
    }

    if (!presetConfig) {
        return null;
    }

    // Evaluate if function
    const args: PresetConfigArgs = { name, config };
    return evaluatePresetConfig(presetConfig, args);
}
