
import { Project } from 'ts-morph';
import { join, resolve, basename, relative } from 'path';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createJiti } from 'jiti';
import type { PresetSourceConfig, PresetConfig, PresetConfigFile } from './types.js';

// Helper to generate variations
function generateVariations(subject: string) {
    const pascal = subject.charAt(0).toUpperCase() + subject.slice(1);
    const camel = subject.charAt(0).toLowerCase() + subject.slice(1);
    const lower = subject.toLowerCase();
    const upper = subject.toUpperCase();

    // Simple kebab conversion (UserProfile -> user-profile)
    const kebab = camel.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

    return { pascal, camel, lower, upper, kebab };
}

export async function analyzeReversePreset(presetName: string, templatesDir: string) {
    const presetDir = resolve(process.cwd(), templatesDir, 'preset', presetName);
    const sourcePath = join(presetDir, 'preset.source.ts');

    if (!existsSync(sourcePath)) {
        throw new Error(`Preset source config not found at ${sourcePath}. Did you run reverse:init?`);
    }

    // Load config using jiti
    const jiti = createJiti(import.meta.url);
    const configModule = await jiti.import(sourcePath, { default: true }) as { default: PresetSourceConfig };
    const sourceConfig = configModule.default || configModule; // Try fallback



    // Normalize layers
    const layers: { root: string; targetLayer: string }[] = [];
    if (sourceConfig.layers) {
        layers.push(...sourceConfig.layers);
    } else if (sourceConfig.root) {
        layers.push({
            root: sourceConfig.root,
            targetLayer: sourceConfig.targetLayer || 'entity'
        });
    } else {
        throw new Error('Invalid preset.source.ts: define "root" or "layers".');
    }

    const resultFiles: PresetConfigFile[] = [];

    // Initialize ts-morph
    const project = new Project({
        skipFileDependencyResolution: true,
    });

    for (const layer of layers) {
        // Resolve root path
        // 1. If globalRoot is set, resolves relative to globalRoot
        // 2. Otherwise relative to config file (presetDir)
        let basePath = presetDir;
        if (sourceConfig.globalRoot) {
            basePath = resolve(presetDir, sourceConfig.globalRoot);
        }

        const rootPath = resolve(basePath, layer.root);

        if (!existsSync(rootPath)) {
            throw new Error(`Source root path does not exist: ${rootPath}`);
        }

        console.log(`Analyzing source at: ${rootPath} (Layer: ${layer.targetLayer})`);

        // Guess the "Subject" name from the folder name
        const subjectName = basename(rootPath);
        console.log(`Guessed subject name: "${subjectName}"`);

        const variations = generateVariations(subjectName);
        console.log('Search patterns:', variations);

        // Add files to project
        project.addSourceFilesAtPaths(join(rootPath, '**', '*.{ts,tsx}'));
        project.addSourceFilesAtPaths(join(rootPath, '**', '*.{css,scss,less,sass}'));

        const sourceFiles = project.getSourceFiles();

        for (const sourceFile of sourceFiles) {
            const filePath = sourceFile.getFilePath();

            // Only process files that belong to this root
            if (!filePath.startsWith(rootPath)) continue;

            const relPath = relative(rootPath, filePath);
            const fileContent = sourceFile.getFullText();

            const tokens: Record<string, string> = {};

            if (fileContent.includes(variations.pascal)) tokens[variations.pascal] = '{{entityName}}';
            if (variations.camel !== variations.pascal && fileContent.includes(variations.camel)) {
                tokens[variations.camel] = '{{entityNameCamel}}';
            }

            resultFiles.push({
                path: relPath,
                targetLayer: layer.targetLayer,
                tokens
            });
        }

        // Clear source files for next iteration to avoid mixing if roots overlap (unlikely but safer)
        // Actually ts-morph keeps them, but we filter by startWith(rootPath) above so it's okay.
        // But better to remove to keep memory low if huge repo.
        sourceFiles.forEach(f => project.removeSourceFile(f));
    }

    const outputConfig: PresetConfig = {
        files: resultFiles
    };

    const outputPath = join(presetDir, 'preset.config.json');
    await writeFile(outputPath, JSON.stringify(outputConfig, null, 2), 'utf-8');

    console.log(`Analysis complete. Config written to: ${outputPath}`);
    console.log('Please review and edit preset.config.json to refine replacements.');
}
