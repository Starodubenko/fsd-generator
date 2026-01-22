export { defineConfig } from './config/defineConfig.js';
export { definePreset, type ConventionConfig, type FsdGenConfig, type GeneratorContext, type PresetAction, type PresetConfig, type PresetConfigArgs, type PresetConfigFn, type PresetHelperOptions, type PresetHelpers, type TemplateContext } from './config/types.js';
export { createPresetHelpers } from './lib/helpers/presetHelpers.js';

// Reverse engineering exports
export { EntityToken, FsdLayer, isEntityToken, isFsdLayer, type EntityTokenValue, type FsdLayerValue } from './lib/reverse/constants.js';
export type { PresetConfigFile, PresetConfigTokenMap, PresetSourceConfig, PresetConfig as ReversePresetConfig } from './lib/reverse/types.js';

