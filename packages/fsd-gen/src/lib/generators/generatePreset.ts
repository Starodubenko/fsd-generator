
import { resolve } from 'path';
import { loadConfig } from '../config/loadConfig.js';
import { resolvePresetDir } from '../templates/templateLoader.js';
import { loadPresetConfig } from '../preset/presetLoading.js';
import { executeActions } from '../preset/actionExecution.js';
import {
    resolvePresetActions,
    handleRouteInjection
} from './presetExecutionHelpers.js';

/**
 * Generate files from a preset.
 * Standardized pipeline for vertical slice generation.
 */
export async function generatePreset(presetName: string, name: string): Promise<void> {
    console.log(`Generating preset '${presetName}' for '${name}'...`);

    // Step 1: Load and initialize environment
    const config = await loadConfig();
    const templatesDir = config.templatesDir ? resolve(process.cwd(), config.templatesDir) : undefined;

    // Step 2: Locate preset
    const presetDir = await resolvePresetDir(presetName, templatesDir);
    if (!presetDir) {
        throw new Error(`Preset '${presetName}' not found`);
    }

    // Step 3: Load preset configuration logic
    const presetConfig = await loadPresetConfig(presetDir, name, config);
    if (!presetConfig) {
        throw new Error(`No preset configuration found in ${presetDir}`);
    }

    // Step 4: Determine implementation steps (actions)
    const actions = await resolvePresetActions(presetConfig, presetDir, presetName, name);
    if (!actions || actions.length === 0) {
        console.warn('No actions found in preset configuration');
        return;
    }

    // Step 5: Materialize components and files
    const globalVars = presetConfig.variables || {};
    await executeActions(actions, name, globalVars, config);

    // Step 6: Side-effects (Routing, etc.)
    await handleRouteInjection(presetConfig, actions, name, globalVars, config);

    console.log('Preset generation complete.');
}
