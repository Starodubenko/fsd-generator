
import { readFile } from 'fs/promises';
import { join, resolve, basename } from 'path';
import { existsSync } from 'fs';
import { createJiti } from 'jiti';
import { PresetConfig, PresetSourceConfig, PresetSourceItem, PresetConfigTokenMap, PresetConfigFile } from './types.js';

/**
 * Loads the reverse engineering source configuration (preset.source.ts)
 */
export async function loadSourceConfig(presetDir: string): Promise<PresetSourceConfig> {
    const sourcePath = join(presetDir, 'preset.source.ts');

    if (!existsSync(sourcePath)) {
        throw new Error(`Preset source config not found at ${sourcePath}. Did you run reverse:init?`);
    }

    const jiti = createJiti(import.meta.url);
    const configModule = await jiti.import(sourcePath);
    return (configModule as { default: PresetSourceConfig }).default || (configModule as PresetSourceConfig);
}

/**
 * Loads the reverse engineering preset configuration (preset.config.json)
 */
export async function loadPresetConfig(presetDir: string): Promise<PresetConfig> {
    const configPath = join(presetDir, 'preset.config.json');

    if (!existsSync(configPath)) {
        throw new Error(`Missing preset config file: ${configPath}`);
    }

    const presetConfigRaw = await readFile(configPath, 'utf-8');
    return JSON.parse(presetConfigRaw);
}

/**
 * Loads both source and preset configurations
 */
export async function loadReverseEnvironment(presetDir: string): Promise<{
    sourceConfig: PresetSourceConfig;
    presetConfig: PresetConfig;
}> {
    const sourceConfig = await loadSourceConfig(presetDir);
    const presetConfig = await loadPresetConfig(presetDir);
    return { sourceConfig, presetConfig };
}

/**
 * Normalizes layer definitions from source configuration
 */
export function normalizeLayers(sourceConfig: PresetSourceConfig): PresetSourceItem[] {
    const layers: PresetSourceItem[] = [];
    if (sourceConfig.layers) {
        layers.push(...sourceConfig.layers);
    } else if (sourceConfig.root) {
        layers.push({
            root: sourceConfig.root,
            targetLayer: sourceConfig.targetLayer || 'entity'
        });
    }
    return layers;
}

/**
 * Identifies the main entity token (mapping to {{name}} or {{entityName}})
 */
export function detectEntityToken(presetConfig: PresetConfig): string {
    for (const file of presetConfig.files) {
        for (const [token, replacement] of Object.entries(file.tokens)) {
            if (replacement === '{{name}}' || replacement === '{{entityName}}') {
                return token;
            }
        }
    }
    return '';
}

/**
 * Applies token replacements to content, prioritizing longer matches
 */
export function applyTokens(content: string, tokens: PresetConfigTokenMap): string {
    const sortedTokens = Object.entries(tokens).sort((a, b) => b[0].length - a[0].length);
    let result = content;

    for (const [token, replacement] of sortedTokens) {
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedToken, 'g');
        result = result.replace(regex, replacement);
    }
    return result;
}

/**
 * Guesses naming conventions (prefixes/suffixes) from source roots
 */
export function guessConventions(layers: PresetSourceItem[], entityToken: string): Record<string, string> {
    const helpers: Record<string, string> = {};
    const token = entityToken || 'User'; // Fallback

    for (const layer of layers) {
        const rootBasename = basename(layer.root);
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedToken, 'g');

        if (rootBasename.match(regex)) {
            const pattern = rootBasename.replace(regex, '');
            if (pattern) {
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
    return helpers;
}

/**
 * Generates preset.ts content for short mode
 */
export function generateShortPresetContent(helpers: Record<string, string>): string {
    return `import { definePreset, createPresetHelpers } from '@starodubenko/fsd-gen';

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
}

/**
 * Generates preset.ts content for ejected mode
 */
export function generateEjectedPresetContent(
    presetName: string,
    files: PresetConfigFile[],
    layers: PresetSourceItem[],
    entityToken: string
): string {
    const actions = files.map(file => {
        let layerDir = 'entities';
        if (file.targetLayer === 'feature') layerDir = 'features';
        else if (file.targetLayer === 'widget') layerDir = 'widgets';
        else if (file.targetLayer === 'page') layerDir = 'pages';
        else if (file.targetLayer === 'shared') layerDir = 'shared';

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

        const destRelativePath = applyTokens(file.path, file.tokens);
        const templatePath = `preset/${presetName}/${file.targetLayer}/${destRelativePath}`;

        return {
            type: 'file',
            path: `${layerDir}/${sliceNamePattern}/${destRelativePath}`,
            template: templatePath
        };
    });

    return `import { definePreset } from '@starodubenko/fsd-gen';

export default definePreset({
    actions: ${JSON.stringify(actions, null, 4)}
});
`;
}
