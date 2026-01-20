import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverTemplates } from '../../../src/lib/preset/presetDiscovery.js';
import { FSD_LAYERS } from '../../../src/lib/constants.js';
import * as fs from 'node:fs/promises';

vi.mock('fs/promises');

describe('featureDiscovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle kebab-case feature directories', async () => {
        const presetDir = 'presets/table';
        vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
        vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
            if (String(path).endsWith('feature')) {
                return [{ name: 'ui', isDirectory: () => true, isFile: () => false }] as any;
            }
            if (String(path).endsWith('ui')) {
                return [{ name: 'custom-action', isDirectory: () => true, isFile: () => false }] as any;
            }
            return [];
        });

        const actions = await discoverTemplates(presetDir, 'table', 'User');
        const featureAction = actions.find(a => (a as any).layer === FSD_LAYERS.FEATURE) as any;

        expect(featureAction).toBeDefined();
        // custom-action -> Custom-actionUser
        expect(featureAction.name).toBe('Custom-actionUser');
    });

    it('should handle standard action names without adding "Button" suffix', async () => {
        const presetDir = 'presets/table';
        vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
        vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
            if (String(path).endsWith('feature')) {
                return [{ name: 'buttons', isDirectory: () => true, isFile: () => false }] as any;
            }
            if (String(path).endsWith('buttons')) {
                return [{ name: 'create', isDirectory: () => true, isFile: () => false }] as any;
            }
            return [];
        });

        const actions = await discoverTemplates(presetDir, 'table', 'User');
        const featureAction = actions.find(a => (a as any).layer === FSD_LAYERS.FEATURE) as any;

        expect(featureAction).toBeDefined();
        // create -> CreateUser (no "Button" suffix)
        expect(featureAction.name).toBe('CreateUser');
    });

    it('should discover multiple feature components in a group', async () => {
        const presetDir = 'presets/table';
        vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
        vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
            if (String(path).endsWith('feature')) {
                return [{ name: 'ui', isDirectory: () => true, isFile: () => false }] as any;
            }
            if (String(path).endsWith('ui')) {
                return [
                    { name: 'create', isDirectory: () => true, isFile: () => false },
                    { name: 'edit', isDirectory: () => true, isFile: () => false },
                    { name: 'delete', isDirectory: () => true, isFile: () => false },
                ] as any;
            }
            return [];
        });

        const actions = await discoverTemplates(presetDir, 'table', 'User');
        const featureActions = actions.filter(a => (a as any).layer === FSD_LAYERS.FEATURE);

        expect(featureActions).toHaveLength(3);
        const names = featureActions.map((a: any) => a.name).sort();
        expect(names).toEqual(['CreateUser', 'DeleteUser', 'EditUser']);
    });
});
