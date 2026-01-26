import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePreset } from '../../../src/lib/generators/generatePreset.js';
import * as loadConfigModule from '../../../src/lib/config/loadConfig.js';
import * as templateLoaderModule from '../../../src/lib/templates/templateLoader.js';
import * as presetLoadingModule from '../../../src/lib/preset/presetLoading.js';
import * as presetDiscoveryModule from '../../../src/lib/preset/presetDiscovery.js';
import * as actionExecutionModule from '../../../src/lib/preset/actionExecution.js';
import * as injectRouteModule from '../../../src/lib/routing/injectRoute.js';
import { DISCOVERY_MODES, ACTION_TYPES, FSD_LAYERS } from '../../../src/lib/constants.js';

vi.mock('../../../src/lib/config/loadConfig.js');
vi.mock('../../../src/lib/templates/templateLoader.js');
vi.mock('../../../src/lib/preset/presetLoading.js');
vi.mock('../../../src/lib/preset/presetDiscovery.js');
vi.mock('../../../src/lib/preset/actionExecution.js');
vi.mock('../../../src/lib/routing/injectRoute.js');

describe('generatePreset', () => {
    const mockConfig = { rootDir: 'src', templatesDir: '.templates' };
    const mockPresetConfig = {
        discoveryMode: DISCOVERY_MODES.MANUAL,
        actions: [{ type: ACTION_TYPES.COMPONENT, layer: FSD_LAYERS.ENTITY, slice: 'User', template: 't' }],
        variables: { global: 'val' }
    };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(loadConfigModule.loadConfig).mockResolvedValue(mockConfig as any);
        vi.mocked(templateLoaderModule.resolvePresetDir).mockResolvedValue('/path/to/preset');
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(mockConfig as any); // Bug in previous implementation? It returns PresetConfig
        vi.mocked(templateLoaderModule.processTemplate).mockImplementation(t => t);
    });

    it('should throw error if preset directory is not found', async () => {
        vi.mocked(templateLoaderModule.resolvePresetDir).mockResolvedValue(null);
        await expect(generatePreset('invalid', 'User')).rejects.toThrow("Preset 'invalid' not found");
    });

    it('should throw error if preset configuration is not found', async () => {
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(null as any);
        await expect(generatePreset('table', 'User')).rejects.toThrow("No preset configuration found");
    });

    it('should call discoverTemplates when discoveryMode is AUTO', async () => {
        const autoConfig = { ...mockPresetConfig, discoveryMode: DISCOVERY_MODES.AUTO };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(autoConfig as any);
        vi.mocked(presetDiscoveryModule.discoverTemplates).mockResolvedValue([]);

        await generatePreset('table', 'User');
        expect(presetDiscoveryModule.discoverTemplates).toHaveBeenCalled();
    });

    it('should handle routing warning if no page action is found for routing config', async () => {
        const presetConfigWithRouting = {
            ...mockPresetConfig,
            routing: { path: '/test', componentName: 'TestPage' },
            actions: [{ type: ACTION_TYPES.COMPONENT, layer: FSD_LAYERS.ENTITY, slice: 'User' }] // No PAGE action
        };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(presetConfigWithRouting as any);
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        await generatePreset('table', 'User');
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Routing config provided but no page template found'));
        expect(injectRouteModule.injectRoute).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should skip routing if not configured', async () => {
        const presetConfigWithoutRouting = {
            ...mockPresetConfig,
            actions: [{ type: ACTION_TYPES.COMPONENT, layer: FSD_LAYERS.ENTITY, slice: 'User' }]
        };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(presetConfigWithoutRouting as any);

        await generatePreset('table', 'User');
        expect(injectRouteModule.injectRoute).not.toHaveBeenCalled();
    });

    it('should execute actions and handle routing with custom options', async () => {
        const routingConfig = {
            ...mockPresetConfig,
            routing: {
                path: '/custom',
                componentName: 'CustomPage',
                importPath: '@/custom',
                appFile: 'CustomApp.tsx'
            },
            actions: [{ type: ACTION_TYPES.COMPONENT, layer: FSD_LAYERS.PAGE, slice: 'Custom' }]
        };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(routingConfig as any);
        vi.mocked(loadConfigModule.loadConfig).mockResolvedValue({ rootDir: 'app' } as any);

        await generatePreset('table', 'User');

        expect(injectRouteModule.injectRoute).toHaveBeenCalledWith(expect.objectContaining({
            targetDir: 'app',
            path: '/custom',
            componentName: 'CustomPage',
            importPath: '@/custom',
            appFile: 'CustomApp.tsx'
        }));
    });

    it('should use default rootDir if not in config', async () => {
        const routingConfig = {
            ...mockPresetConfig,
            routing: { path: '/test' },
            actions: [{ type: ACTION_TYPES.COMPONENT, layer: FSD_LAYERS.PAGE, slice: 'Test' }]
        };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(routingConfig as any);
        vi.mocked(loadConfigModule.loadConfig).mockResolvedValue({} as any);

        await generatePreset('table', 'User');

        expect(injectRouteModule.injectRoute).toHaveBeenCalledWith(expect.objectContaining({
            targetDir: 'src'
        }));
    });

    it('should execute actions and handle routing', async () => {
        const routingConfig = {
            ...mockPresetConfig,
            actions: [
                { type: ACTION_TYPES.COMPONENT, layer: FSD_LAYERS.PAGE, slice: 'UserPage', template: 't' }
            ],
            routing: { path: '/users', componentName: 'UserPage' }
        };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(routingConfig as any);

        await generatePreset('table', 'User');

        expect(actionExecutionModule.executeActions).toHaveBeenCalled();
        expect(injectRouteModule.injectRoute).toHaveBeenCalledWith(expect.objectContaining({
            path: '/users',
            componentName: 'UserPage'
        }));
    });

    it('should warn if no actions are found', async () => {
        const emptyConfig = { ...mockPresetConfig, actions: [] };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(emptyConfig as any);
        const spy = vi.spyOn(console, 'warn');

        await generatePreset('table', 'User');
        expect(spy).toHaveBeenCalledWith('No actions found in preset configuration');
    });

    it('should handle undefined actions (manual mode)', async () => {
        const undefinedActionsConfig = { ...mockPresetConfig, actions: undefined };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(undefinedActionsConfig as any);
        const spy = vi.spyOn(console, 'warn');

        await generatePreset('table', 'User');
        expect(spy).toHaveBeenCalledWith('No actions found in preset configuration');
    });

    it('should handle routing warning if no page is found', async () => {
        const routingNoPageStore = {
            ...mockPresetConfig,
            routing: { path: '/users' }
        };
        vi.mocked(presetLoadingModule.loadPresetConfig).mockResolvedValue(routingNoPageStore as any);
        const spy = vi.spyOn(console, 'warn');

        await generatePreset('table', 'User');
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Routing config provided but no page template found'));
    });
});
