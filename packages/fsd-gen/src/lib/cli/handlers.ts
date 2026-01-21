
import { basename } from 'path';
import { loadConfig } from '../config/loadConfig.js';
import { validateConfig } from '../config/validateConfig.js';
import { resolveFsdPaths } from '../naming/resolvePaths.js';
import { toPascalCase } from '../naming/names.js';
import { generateComponent } from '../generators/generate.js';
import { createPresetHelpers } from '../helpers/presetHelpers.js';
import { generatePreset } from '../generators/generatePreset.js';
import { initReversePreset } from '../reverse/init.js';
import { analyzeReversePreset } from '../reverse/analyze.js';
import { buildReversePreset } from '../reverse/build.js';
import { listPresets } from '../templates/templateLoader.js';
import {
    promptLayer,
    promptSlice,
    promptPresetName,
    promptName
} from './prompts.js';

/**
 * Handler for 'generate' command
 */
export async function handleGenerate(layer?: string, slice?: string, name?: string) {
    if (!layer) layer = await promptLayer();
    if (!slice) slice = await promptSlice();

    const finalLayer = layer!;
    const finalSlice = slice!;

    console.log('Loading configuration...');
    const config = await loadConfig();
    const validation = validateConfig(config);

    if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.error}`);
    }

    if (!validation.config || !validation.config.rootDir) {
        throw new Error('Invalid config: rootDir missing');
    }

    console.log(`Generating ${finalLayer}/${finalSlice}/${name || ''}...`);

    const derivedName = name || basename(finalSlice);
    const componentName = toPascalCase(derivedName);
    const paths = resolveFsdPaths(validation.config.rootDir, finalLayer, finalSlice, componentName);
    const helpers = createPresetHelpers(finalSlice, config);

    await generateComponent(paths, {
        ...helpers,
        componentName,
        sliceName: finalSlice,
        layer: finalLayer,
        template: { componentName, sliceName: finalSlice, layer: finalLayer }
    });
}

/**
 * Handler for 'preset' command
 */
export async function handlePreset(presetName?: string, name?: string) {
    const config = await loadConfig();
    const templatesDir = config.templatesDir || 'templates';

    if (!presetName) presetName = await promptPresetName(templatesDir);
    if (!name) name = await promptName();

    await generatePreset(presetName!, name!);
}

/**
 * Handler for 'reverse:init' command
 */
export async function handleReverseInit(presetName?: string, options: { mode?: 'short' | 'ejected' } = {}) {
    const config = await loadConfig();
    const templatesDir = config.templatesDir || 'templates';
    if (!presetName) presetName = await promptName('Enter the name for the new preset:');

    await initReversePreset(presetName!, templatesDir, options.mode || 'ejected');
}

/**
 * Handler for 'reverse:analyze' command
 */
export async function handleReverseAnalyze(presetName?: string) {
    const config = await loadConfig();
    const templatesDir = config.templatesDir || 'templates';

    if (!presetName) {
        const availablePresets = await listPresets(templatesDir);
        if (availablePresets.length === 0) {
            throw new Error('No presets found. Run "fsd-gen reverse:init <name>" first.');
        }
        presetName = await promptPresetName(templatesDir);
    }

    await analyzeReversePreset(presetName!, templatesDir);
}

/**
 * Handler for 'reverse:build' command
 */
export async function handleReverseBuild(presetName?: string, options: { mode?: 'short' | 'ejected' } = {}) {
    const config = await loadConfig();
    const templatesDir = config.templatesDir || 'templates';

    if (!presetName) {
        const availablePresets = await listPresets(templatesDir);
        if (availablePresets.length === 0) {
            throw new Error('No presets found.');
        }
        presetName = await promptPresetName(templatesDir);
    }

    await buildReversePreset(presetName!, templatesDir, options.mode);
}
