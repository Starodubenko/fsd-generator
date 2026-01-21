
import { Project } from 'ts-morph';
import { join, resolve, basename, relative } from 'path';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
    loadSourceConfig,
    normalizeLayers
} from './buildHelpers.js';
import {
    generateVariations,
    identifyTokens,
    resolveSourceRoot
} from './analyzeHelpers.js';
import type { PresetConfig, PresetConfigFile } from './types.js';

/**
 * Analyzes source code and generates a preset configuration.
 * Orchestrates the discovery of tokens and mapping of files to layers.
 */
export async function analyzeReversePreset(presetName: string, templatesDir: string) {
    const presetDir = resolve(process.cwd(), templatesDir, 'preset', presetName);

    // Step 1: Load environment
    const sourceConfig = await loadSourceConfig(presetDir);
    const layers = normalizeLayers(sourceConfig);

    if (layers.length === 0) {
        throw new Error('Invalid preset.source.ts: define "root" or "layers".');
    }

    const resultFiles: PresetConfigFile[] = [];
    const project = new Project({ skipFileDependencyResolution: true });

    // Step 2: Iterate through layers and analyze files
    for (const layer of layers) {
        const rootPath = resolveSourceRoot(presetDir, sourceConfig.globalRoot, layer.root);

        if (!existsSync(rootPath)) {
            throw new Error(`Source root path does not exist: ${rootPath}`);
        }

        console.log(`Analyzing source at: ${rootPath} (Layer: ${layer.targetLayer})`);

        const subjectName = basename(rootPath);
        const variations = generateVariations(subjectName);

        // Discovery
        project.addSourceFilesAtPaths(join(rootPath, '**', '*.{ts,tsx,css,scss,less,sass}'));
        const sourceFiles = project.getSourceFiles();

        for (const sourceFile of sourceFiles) {
            const filePath = sourceFile.getFilePath();
            if (!filePath.startsWith(rootPath)) continue;

            const relPath = relative(rootPath, filePath);
            const fileContent = sourceFile.getFullText();

            // Automatic token discovery
            const tokens = identifyTokens(fileContent, variations);

            resultFiles.push({
                path: relPath,
                targetLayer: layer.targetLayer,
                tokens
            });
        }

        // Cleanup project for next layer
        sourceFiles.forEach(f => project.removeSourceFile(f));
    }

    // Step 3: Save results
    const outputConfig: PresetConfig = { files: resultFiles };
    const outputPath = join(presetDir, 'preset.config.json');

    await writeFile(outputPath, JSON.stringify(outputConfig, null, 2), 'utf-8');

    console.log(`Analysis complete. Config written to: ${outputPath}`);
}
