
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, resolve, dirname, basename } from 'path';
import { existsSync } from 'fs';
import { PresetConfig, PresetSourceConfig } from './types';
import { createJiti } from 'jiti';

export async function buildReversePreset(presetName: string, templatesDir: string, mode?: 'short' | 'ejected') {
    const presetDir = resolve(process.cwd(), templatesDir, 'preset', presetName);
    const configPath = join(presetDir, 'preset.config.json');
    const sourcePath = join(presetDir, 'preset.source.ts');

    if (!existsSync(sourcePath) || !existsSync(configPath)) {
        throw new Error(`Missing preset source or config files in ${presetDir}`);
    }

    const jiti = createJiti(import.meta.url);
    const configModule = await jiti.import(sourcePath);
    const sourceConfig = (configModule as { default: PresetSourceConfig }).default || (configModule as PresetSourceConfig);

    const presetConfigRaw = await readFile(configPath, 'utf-8');
    const presetConfig: PresetConfig = JSON.parse(presetConfigRaw);

    // Normalize layers
    const layers: { root: string; targetLayer: string }[] = [];
    if (sourceConfig.layers) {
        layers.push(...sourceConfig.layers);
    } else if (sourceConfig.root) {
        layers.push({
            root: sourceConfig.root,
            targetLayer: sourceConfig.targetLayer || 'entity'
        });
    }

    console.log(`Building preset "${presetName}"...`);

    // Identify the main entity token (mapping to {{name}}) for slice pattern detection
    let entityToken = '';
    for (const file of presetConfig.files) {
        for (const [token, replacement] of Object.entries(file.tokens)) {
            if (replacement === '{{name}}' || replacement === '{{entityName}}') {
                entityToken = token;
                break;
            }
        }
        if (entityToken) break;
    }

    for (const file of presetConfig.files) {
        // Find the source root configuration for this file's target layer
        const layerConfig = layers.find(l => l.targetLayer === file.targetLayer);

        if (!layerConfig) {
            console.warn(`No source config found for layer "${file.targetLayer}" (skipping ${file.path})`);
            continue;
        }

        let basePath = presetDir;
        if (sourceConfig.globalRoot) {
            basePath = resolve(presetDir, sourceConfig.globalRoot);
        }

        const rootPath = resolve(basePath, layerConfig.root);
        const originalFilePath = join(rootPath, file.path);

        // Read content
        if (!existsSync(originalFilePath)) {
            console.warn(`Source file not found (skipping): ${originalFilePath}`);
            continue;
        }

        let content = await readFile(originalFilePath, 'utf-8');

        // Apply tokens (Longest first to avoid partial replacements)
        const sortedTokens = Object.entries(file.tokens).sort((a, b) => b[0].length - a[0].length);

        for (const [token, replacement] of sortedTokens) {
            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedToken, 'g');
            content = content.replace(regex, replacement);
        }

        // Apply path tokens
        let destRelativePath = file.path;
        for (const [token, replacement] of sortedTokens) {
            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedToken, 'g');
            destRelativePath = destRelativePath.replace(regex, replacement);
        }

        // Construct final destination path
        const destPath = join(presetDir, file.targetLayer, destRelativePath);

        // Ensure directory exists
        await mkdir(dirname(destPath), { recursive: true });

        // Write file
        await writeFile(destPath, content, 'utf-8');
        console.log(`Generated: ${file.targetLayer}/${destRelativePath}`);
    }

    // Determine final mode (CLI argument > sourceConfig > default 'ejected')
    const finalMode = mode || sourceConfig.mode || 'ejected';

    // Generate preset.ts configuration
    let presetConfigContent = '';

    if (finalMode === 'short') {
        // Find prefixes/suffixes
        const helpers: Record<string, string> = {};
        for (const layer of layers) {
            const rootBasename = basename(layer.root);
            const token = entityToken || 'User'; // Fallback if not detected

            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedToken, 'g');

            if (rootBasename.match(regex)) {
                const pattern = rootBasename.replace(regex, '');
                if (pattern) {
                    // Try to guess if it's a prefix or suffix
                    // Logic: if it starts with the token, the rest is suffix.
                    // If it ends with the token, the start is prefix.
                    if (rootBasename.startsWith(token)) {
                        const suffix = rootBasename.slice(token.length);
                        if (layer.targetLayer === 'feature') helpers.featureSuffix = suffix;
                        if (layer.targetLayer === 'widget') helpers.widgetSuffix = suffix;
                        if (layer.targetLayer === 'page') helpers.pageSuffix = suffix;
                    } else if (rootBasename.endsWith(token)) {
                        const prefix = rootBasename.slice(0, rootBasename.length - token.length);
                        if (layer.targetLayer === 'feature') helpers.featurePrefix = prefix;
                        if (layer.targetLayer === 'widget') helpers.widgetPrefix = prefix;
                        if (layer.targetLayer === 'page') helpers.pagePrefix = prefix;
                    }
                }
            }
        }

        presetConfigContent = `import { definePreset, createPresetHelpers } from '@starodubenko/fsd-gen';

export default definePreset(({ name, config }) => {
    const helpers = createPresetHelpers(name, config, ${JSON.stringify(helpers, null, 8).replace(/\n\s*}/, '\n    }')});

    return {
        discoveryMode: 'auto',
        variables: {
            ...helpers,
        },
        conventions: {
${Object.entries(helpers).map(([k, v]) => `            ${k.replace('Prefix', 'SlicePrefix').replace('Suffix', 'SliceSuffix')}: '${v}'`).join(',\n')}
        }
    };
});
`;
    } else {
        // Ejected mode - explicit actions
        const actions = presetConfig.files.map(file => {
            // Determine the output path prefix based on layer
            let layerDir = 'entities';
            if (file.targetLayer === 'feature') layerDir = 'features';
            else if (file.targetLayer === 'widget') layerDir = 'widgets';
            else if (file.targetLayer === 'page') layerDir = 'pages';
            else if (file.targetLayer === 'shared') layerDir = 'shared';

            // Determine slice name pattern based on source root name
            let sliceNamePattern = '{{name}}';
            const layerConfig = layers.find(l => l.targetLayer === file.targetLayer);

            if (layerConfig && entityToken) {
                const rootBasename = basename(layerConfig.root);
                const escapedToken = entityToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedToken, 'g');

                if (rootBasename.match(regex)) {
                    sliceNamePattern = rootBasename.replace(regex, '{{name}}');
                }
            }

            let destRelativePath = file.path;
            const sortedTokens = Object.entries(file.tokens).sort((a, b) => b[0].length - a[0].length);
            for (const [token, replacement] of sortedTokens) {
                const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedToken, 'g');
                destRelativePath = destRelativePath.replace(regex, replacement);
            }

            const templatePath = `preset/${presetName}/${file.targetLayer}/${destRelativePath}`;

            return {
                type: 'file',
                path: `${layerDir}/${sliceNamePattern}/${destRelativePath}`,
                template: templatePath
            };
        });

        presetConfigContent = `import { definePreset } from '@starodubenko/fsd-gen';

export default definePreset({
    actions: ${JSON.stringify(actions, null, 4)}
});
`;
    }

    await writeFile(join(presetDir, 'preset.ts'), presetConfigContent, 'utf-8');
    console.log(`Generated: preset.ts (Mode: ${finalMode})`);

    console.log(`\nBuild complete! Preset "${presetName}" is ready.`);
}
