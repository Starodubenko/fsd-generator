import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverTemplates } from '../../../src/lib/preset/presetDiscovery.js';
import { ACTION_TYPES, FSD_LAYERS, FSD_SEGMENTS, PRESET_DIRS } from '../../../src/lib/constants.js';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('presetDiscovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('discoverTemplates', () => {
        it('should identify API directories as HOOK actions', async () => {
            const presetDir = 'presets/table';
            const presetName = 'table';
            const entityName = 'User';

            // Mock scanLayerDirectory for 'entity' layer
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('entity')) {
                    return [{ name: 'api', isDirectory: () => true, isFile: () => false }] as any;
                }
                if (String(path).endsWith('api')) {
                    return [{ name: 'get', isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates(presetDir, presetName, entityName);

            const apiAction = actions.find(a => a.type === ACTION_TYPES.HOOK) as any;
            expect(apiAction).toBeDefined();
            expect(apiAction?.layer).toBe(FSD_LAYERS.ENTITY);
            expect(apiAction?.template).toContain(`${FSD_SEGMENTS.API}/get`);
        });

        it('should identify UI widgets as COMPONENT actions', async () => {
            const presetDir = 'presets/table';
            const presetName = 'table';
            const entityName = 'User';

            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('widget')) {
                    return [{ name: PRESET_DIRS.TABLE, isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates(presetDir, presetName, entityName);

            const widgetAction = actions.find(a => a.type === ACTION_TYPES.COMPONENT && a.layer === FSD_LAYERS.WIDGET) as any;
            expect(widgetAction).toBeDefined();
            expect(widgetAction?.slice).toBe(`${entityName}Table`);
        });
    });
});
