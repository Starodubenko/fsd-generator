
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { basename, join, relative, resolve } from 'path';
import { Project } from 'ts-morph';
import {
    generateVariations,
    identifyTokens,
    resolveSourceRoot
} from './analyzeHelpers.js';
import {
    loadSourceConfig,
    normalizeLayers
} from './buildHelpers.js';
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

    // Step 3: Save results as TypeScript file with enum values
    const outputConfig: PresetConfig = { files: resultFiles };
    const outputPath = join(presetDir, 'preset.config.ts');

    // Helper to convert layer string to FsdLayer enum reference
    const layerToEnum = (layer: string): string => {
        const layerMap: Record<string, string> = {
            'entity': 'FsdLayer.ENTITY',
            'feature': 'FsdLayer.FEATURE',
            'widget': 'FsdLayer.WIDGET',
            'page': 'FsdLayer.PAGE',
            'shared': 'FsdLayer.SHARED'
        };
        return layerMap[layer] || `"${layer}"`;
    };

    // Generate TypeScript content with enum values
    const filesContent = resultFiles.map(file => {
        const tokensStr = Object.entries(file.tokens)
            .map(([key, value]) => `        "${key}": ${value.startsWith('{{') ? `EntityToken.${value.slice(2, -2).toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '')}` : `"${value}"`}`)
            .join(',\n');

        return `    {
        "path": "${file.path}",
        "targetLayer": ${layerToEnum(file.targetLayer)},
        "tokens": {
${tokensStr}
        }
    }`;
    }).join(',\n');

    const tsContent = `import type { ReversePresetConfig } from '@starodubenko/fsd-gen';
import { EntityToken, FsdLayer } from '@starodubenko/fsd-gen';

export default {
    "files": [
${filesContent}
    ]
} satisfies ReversePresetConfig;
`;

    await writeFile(outputPath, tsContent, 'utf-8');

    console.log(`Analysis complete. Config written to: ${outputPath}`);
}
