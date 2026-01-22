
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { createJiti } from 'jiti';
import { basename, join } from 'path';
import { EntityToken } from './constants.js';
import { PresetConfig, PresetConfigFile, PresetConfigTokenMap, PresetSourceConfig, PresetSourceItem, NormalizedPresetSourceItem } from './types.js';

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
 * Loads the reverse engineering preset configuration (preset.config.ts or preset.config.json)
 */
export async function loadPresetConfig(presetDir: string): Promise<PresetConfig> {
    // Try TypeScript config first
    const tsConfigPath = join(presetDir, 'preset.config.ts');
    if (existsSync(tsConfigPath)) {
        const jiti = createJiti(import.meta.url);
        const configModule = await jiti.import(tsConfigPath);
        return (configModule as { default: PresetConfig }).default || (configModule as PresetConfig);
    }

    // Fallback to JSON config for backward compatibility
    const jsonConfigPath = join(presetDir, 'preset.config.json');
    if (existsSync(jsonConfigPath)) {
        const presetConfigRaw = await readFile(jsonConfigPath, 'utf-8');
        return JSON.parse(presetConfigRaw);
    }

    throw new Error(`Missing preset config file: ${tsConfigPath} or ${jsonConfigPath}`);
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
export function normalizeLayers(sourceConfig: PresetSourceConfig): NormalizedPresetSourceItem[] {
    const result: NormalizedPresetSourceItem[] = [];

    // Helper to ensure we have a string root
    const toS = (v: any) => String(v);

    if (sourceConfig.layers && Array.isArray(sourceConfig.layers)) {
        for (const layer of sourceConfig.layers) {
            if (!layer || !layer.root) continue;

            // Flatten deeply nested arrays explicitly
            const roots = (Array.isArray(layer.root) ? layer.root : [layer.root]).flat(Infinity);

            if (roots.length === 1) {
                result.push({ root: toS(roots[0]), targetLayer: layer.targetLayer });
            } else if (roots.length > 1) {
                const basenames = roots.map(r => basename(toS(r)));
                const nameCount = new Map();
                const nameIndices = new Map();
                basenames.forEach(name => { nameCount.set(name, (nameCount.get(name) || 0) + 1); });

                roots.forEach((rawRoot, index) => {
                    const root = toS(rawRoot);
                    const name = basenames[index];
                    const count = nameCount.get(name) || 1;
                    if (count > 1) {
                        const currentIndex = nameIndices.get(name) || 0;
                        nameIndices.set(name, currentIndex + 1);
                        const resolvedName = currentIndex === 0 ? name : `${name}${currentIndex}`;
                        result.push({ root, targetLayer: layer.targetLayer, resolvedName });
                    } else {
                        result.push({ root, targetLayer: layer.targetLayer });
                    }
                });
            }
        }
    } else if (sourceConfig.root) {
        // Flatten deeply nested arrays explicitly
        const roots = (Array.isArray(sourceConfig.root) ? sourceConfig.root : [sourceConfig.root]).flat(Infinity);
        const targetLayer = sourceConfig.targetLayer || 'entity';

        if (roots.length === 1) {
            result.push({ root: toS(roots[0]), targetLayer });
        } else if (roots.length > 1) {
            const basenames = roots.map(r => basename(toS(r)));
            const nameCount = new Map();
            const nameIndices = new Map();
            basenames.forEach(name => { nameCount.set(name, (nameCount.get(name) || 0) + 1); });

            roots.forEach((rawRoot, index) => {
                const root = toS(rawRoot);
                const name = basenames[index];
                const count = nameCount.get(name) || 1;
                if (count > 1) {
                    const currentIndex = nameIndices.get(name) || 0;
                    nameIndices.set(name, currentIndex + 1);
                    const resolvedName = currentIndex === 0 ? name : `${name}${currentIndex}`;
                    result.push({ root, targetLayer, resolvedName });
                } else {
                    result.push({ root, targetLayer });
                }
            });
        }
    }
    return result;
}

/**
 * Identifies the main entity token (mapping to {{name}} or {{entityName}})
 */
export function detectEntityToken(presetConfig: PresetConfig): string {
    for (const file of presetConfig.files) {
        for (const [token, replacement] of Object.entries(file.tokens)) {
            if (replacement === EntityToken.NAME ||
                replacement === EntityToken.ENTITY_NAME ||
                replacement === EntityToken.ENTITY_NAME_CAMEL ||
                replacement === EntityToken.ENTITY_NAME_LOWER ||
                replacement === EntityToken.ENTITY_NAME_UPPER ||
                replacement === EntityToken.ENTITY_NAME_KEBAB) {
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
export function guessConventions(layers: NormalizedPresetSourceItem[], entityToken: string): Record<string, string> {
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
    layers: NormalizedPresetSourceItem[],
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
