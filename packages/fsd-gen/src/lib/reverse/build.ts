
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

    // Group files by their destination template path to merge tokens
    // Key: targetLayer + '|' + destRelativePath
    const groupedFiles = new Map<string, {
        targetLayer: string;
        destRelativePath: string;
        files: typeof presetConfig.files;
    }>();

    for (const file of presetConfig.files) {
        const destRelativePath = applyTokens(file.path, file.tokens);
        const key = `${file.targetLayer}|${destRelativePath}`;

        if (!groupedFiles.has(key)) {
            groupedFiles.set(key, {
                targetLayer: String(file.targetLayer),
                destRelativePath,
                files: []
            });
        }
        groupedFiles.get(key)!.files.push(file);
    }

    // Step 2: Process individual files and generate templates
    for (const group of groupedFiles.values()) {
        const { targetLayer, destRelativePath, files } = group;

        // Merge all tokens for this destination file
        const mergedTokens = {};
        for (const file of files) {
            Object.assign(mergedTokens, file.tokens);
        }

        // Use the first file in group to resolve source root
        const primaryFile = files[0];

        // Find the specific layer config match
        // 1. Try exact match with targetLayer AND sourceRoot
        // 2. Fall back to just targetLayer
        let layerConfig = layers.find(l =>
            l.targetLayer === targetLayer &&
            primaryFile.sourceRoot && l.root === primaryFile.sourceRoot
        );

        if (!layerConfig) {
            layerConfig = layers.find(l => l.targetLayer === targetLayer);
        }

        if (!layerConfig) {
            console.warn(`No source config found for layer "${targetLayer}" (skipping ${primaryFile.path})`);
            continue;
        }

        // Resolve absolute source path
        let basePath = presetDir;
        if (sourceConfig.globalRoot) {
            basePath = resolve(presetDir, sourceConfig.globalRoot);
        }
        const rootPath = resolve(basePath, layerConfig.root);
        const originalFilePath = join(rootPath, primaryFile.path);

        if (!existsSync(originalFilePath)) {
            console.warn(`Source file not found (skipping): ${originalFilePath}`);
            continue;
        }

        // Apply transformations using MERGED tokens
        const rawContent = await readFile(originalFilePath, 'utf-8');
        const content = applyTokens(rawContent, mergedTokens);

        // Save generated template
        const destPath = join(presetDir, targetLayer, destRelativePath);
        await mkdir(dirname(destPath), { recursive: true });
        await writeFile(destPath, content, 'utf-8');

        console.log(`Generated: ${targetLayer}/${destRelativePath} (merged ${files.length} entries)`);
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
