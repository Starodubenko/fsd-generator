
import { DISCOVERY_MODES, ACTION_TYPES, FSD_LAYERS } from '../constants.js';
import { discoverTemplates } from '../preset/presetDiscovery.js';
import { processTemplate } from '../templates/templateLoader.js';
import { injectRoute } from '../routing/injectRoute.js';
import {
    PresetAction,
    PresetConfig,
    FsdGenConfig,
    PresetComponentAction
} from '../../config/types.js';

/**
 * Prepares a standard set of naming variables for template processing
 */
export function prepareTemplateVariables(
    name: string,
    globalVars: Record<string, any> = {},
    actionVars: Record<string, any> = {}
) {
    return {
        name,
        componentName: name,
        nameLower: name.toLowerCase(),
        nameUpper: name.toUpperCase(),
        nameKebab: name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
        entityName: name,
        entityNameCamel: name.charAt(0).toLowerCase() + name.slice(1),
        entityNameLower: name.toLowerCase(),
        entityNameUpper: name.toUpperCase(),
        entityNameKebab: name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
        ...globalVars,
        ...actionVars
    };
}

/**
 * Resolves preset actions based on discovery mode
 */
export async function resolvePresetActions(
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

/**
 * Handles automatic route injection for page components
 */
export async function handleRouteInjection(
    presetConfig: PresetConfig,
    actions: PresetAction[],
    name: string,
    globalVars: Record<string, any>,
    config: FsdGenConfig
): Promise<void> {
    if (!presetConfig.routing) {
        return;
    }

    const pageActions = actions.filter(action =>
        action.type === ACTION_TYPES.COMPONENT && action.layer === FSD_LAYERS.PAGE
    ) as PresetComponentAction[];

    if (pageActions.length === 0) {
        console.warn('⚠️  Warning: Routing config provided but no page template found');
        return;
    }

    const rootDir = config.rootDir || 'src';

    for (const pageAction of pageActions) {
        const variables = prepareTemplateVariables(name, globalVars, pageAction.variables);

        const pageSlice = processTemplate(pageAction.slice || '', variables);
        const componentName = processTemplate(
            presetConfig.routing.componentName || pageAction.name || pageAction.slice || '',
            variables
        );
        const importPath = processTemplate(
            presetConfig.routing.importPath || (pageSlice ? `@pages/${pageSlice}` : ''),
            variables
        );
        const routePath = processTemplate(presetConfig.routing.path || '', variables);

        await injectRoute({
            rootDir,
            path: routePath,
            importPath,
            componentName,
            appFile: presetConfig.routing.appFile ? processTemplate(presetConfig.routing.appFile, variables) : undefined
        });
    }
}
