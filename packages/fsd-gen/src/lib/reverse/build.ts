
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { existsSync } from 'fs';
import {
    loadReverseEnvironment,
    normalizeLayers,
    detectEntityToken,
    applyTokens,
    guessConventions,
    generateShortPresetContent,
    generateEjectedPresetContent
} from './buildHelpers.js';

/**
 * Generates the final preset templates from configuration.
 * Step-by-step pipeline for reverse-engineering a preset.
 */
export async function buildReversePreset(presetName: string, templatesDir: string, mode?: 'short' | 'ejected') {
    const presetDir = resolve(process.cwd(), templatesDir, 'preset', presetName);

    // Step 1: Initialize environment and configuration
    const { sourceConfig, presetConfig } = await loadReverseEnvironment(presetDir);
    const layers = normalizeLayers(sourceConfig);
    const entityToken = detectEntityToken(presetConfig);

    console.log(`Building preset "${presetName}"...`);

    // Step 2: Process individual files and generate templates
    for (const file of presetConfig.files) {
        const layerConfig = layers.find(l => l.targetLayer === file.targetLayer);

        if (!layerConfig) {
            console.warn(`No source config found for layer "${file.targetLayer}" (skipping ${file.path})`);
            continue;
        }

        // Resolve absolute source path
        let basePath = presetDir;
        if (sourceConfig.globalRoot) {
            basePath = resolve(presetDir, sourceConfig.globalRoot);
        }
        const rootPath = resolve(basePath, layerConfig.root);
        const originalFilePath = join(rootPath, file.path);

        if (!existsSync(originalFilePath)) {
            console.warn(`Source file not found (skipping): ${originalFilePath}`);
            continue;
        }

        // Apply transformations
        const rawContent = await readFile(originalFilePath, 'utf-8');
        const content = applyTokens(rawContent, file.tokens);
        const destRelativePath = applyTokens(file.path, file.tokens);

        // Save generated template
        const destPath = join(presetDir, file.targetLayer, destRelativePath);
        await mkdir(dirname(destPath), { recursive: true });
        await writeFile(destPath, content, 'utf-8');

        console.log(`Generated: ${file.targetLayer}/${destRelativePath}`);
    }

    // Step 3: Generate the final preset.ts configuration
    const finalMode = mode || sourceConfig.mode || 'ejected';
    let presetConfigContent = '';

    if (finalMode === 'short') {
        const conventions = guessConventions(layers, entityToken);
        presetConfigContent = generateShortPresetContent(conventions);
    } else {
        presetConfigContent = generateEjectedPresetContent(presetName, presetConfig.files, layers, entityToken);
    }

    await writeFile(join(presetDir, 'preset.ts'), presetConfigContent, 'utf-8');

    console.log(`Generated: preset.ts (Mode: ${finalMode})`);
    console.log(`\nBuild complete! Preset "${presetName}" is ready.`);
}
