import { resolve } from 'path';
import { loadConfig } from '../config/loadConfig.js';
import { resolvePresetDir, processTemplate } from '../templates/templateLoader.js';
import { loadPresetConfig } from '../preset/presetLoading.js';
import { discoverTemplates } from '../preset/presetDiscovery.js';
import { executeActions } from '../preset/actionExecution.js';
import { injectRoute } from '../routing/injectRoute.js';
import { DISCOVERY_MODES, ACTION_TYPES, FSD_LAYERS } from '../constants.js';
import { PresetAction, PresetConfig, FsdGenConfig, PresetComponentAction } from '../../config/types.js';

/**
 * Resolve preset actions based on discovery mode
 */
async function resolvePresetActions(
    presetConfig: PresetConfig,
    presetDir: string,
    presetName: string,
    name: string
): Promise<PresetAction[]> {
    if (presetConfig.discoveryMode === DISCOVERY_MODES.AUTO) {
        console.log('Auto-discovering templates...');
        const discoveredActions = await discoverTemplates(
            presetDir,
            presetName,
            name,
            presetConfig.conventions
        );
        console.log(`Found ${discoveredActions.length} templates`);
        return discoveredActions;
    }

    return presetConfig.actions || [];
}

async function handleRouteInjection(
    presetConfig: PresetConfig,
    actions: PresetAction[],
    name: string,
    globalVars: Record<string, any>,
    config: FsdGenConfig
): Promise<void> {
    if (!presetConfig.routing) {
        return;
    }

    // Find all page actions
    const pageActions = actions.filter(action =>
        action.type === ACTION_TYPES.COMPONENT && action.layer === FSD_LAYERS.PAGE
    ) as PresetComponentAction[];

    if (pageActions.length === 0) {
        console.warn('⚠️  Warning: Routing config provided but no page template found');
        return;
    }

    for (const pageAction of pageActions) {
        // Prepare variables for this specific action
        const variables = {
            name,
            componentName: name,
            nameLower: name.toLowerCase(),
            nameUpper: name.toUpperCase(),
            nameKebab: name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
            ...globalVars,
            ...pageAction.variables
        };

        const pageSlice = processTemplate(pageAction.slice, variables);
        const componentName = presetConfig.routing.componentName ||
            processTemplate(pageAction.name || pageAction.slice, variables);
        const importPath = presetConfig.routing.importPath || `@pages/${pageSlice}`;

        // Support dynamic paths using variables (e.g. /{{name}})
        const routePath = processTemplate(presetConfig.routing.path, variables);

        await injectRoute({
            rootDir: config.rootDir || 'src',
            path: routePath,
            importPath,
            componentName,
            appFile: presetConfig.routing.appFile
        });
    }
}

/**
 * Generate files from a preset
 * Main orchestrator function that coordinates all preset generation steps
 */
export async function generatePreset(presetName: string, name: string): Promise<void> {
    console.log(`Generating preset '${presetName}' for '${name}'...`);

    // Step 1: Load configuration
    const config = await loadConfig();
    const templatesDir = config.templatesDir ? resolve(process.cwd(), config.templatesDir) : undefined;

    // Step 2: Resolve preset directory
    const presetDir = await resolvePresetDir(presetName, templatesDir);
    if (!presetDir) {
        throw new Error(`Preset '${presetName}' not found`);
    }

    // Step 3: Load preset configuration
    const presetConfig = await loadPresetConfig(presetDir, name, config);
    if (!presetConfig) {
        throw new Error(`No preset configuration found in ${presetDir}`);
    }

    // Step 4: Determine actions (auto-discovery or manual)
    const actions = await resolvePresetActions(presetConfig, presetDir, presetName, name);

    if (!actions || actions.length === 0) {
        console.warn('No actions found in preset configuration');
        return;
    }

    // Step 5: Execute all actions
    const globalVars = presetConfig.variables || {};
    await executeActions(actions, name, globalVars, config);

    // Step 6: Handle routing injection if configured
    await handleRouteInjection(presetConfig, actions, name, globalVars, config);

    console.log('Preset generation complete.');
}
