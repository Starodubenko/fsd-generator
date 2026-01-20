import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverTemplates } from '../../../src/lib/preset/presetDiscovery.js';
import { FSD_LAYERS } from '../../../src/lib/constants.js';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';

vi.mock('fs/promises');
vi.mock('node:fs', () => ({
    existsSync: vi.fn()
}));

describe('featureDiscovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should discover feature files recursively', async () => {
        const presetDir = 'presets/table';
        vi.mocked(fsSync.existsSync).mockImplementation((path: any) => String(path).includes('feature'));
        vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
            const s = String(path);
            if (s.endsWith('feature')) {
                return [{ name: 'ui', isDirectory: () => true, isFile: () => false }] as any;
            }
            if (s.endsWith('ui')) {
                return [
                    { name: 'Component.tsx', isDirectory: () => false, isFile: () => true },
                    { name: 'Button.tsx', isDirectory: () => false, isFile: () => true }
                ] as any;
            }
            return [];
        });

        const actions = await discoverTemplates(presetDir, 'table', 'User');
        const featureActions = actions.filter(a => (a as any).path.startsWith('features/ManageUser'));

        expect(featureActions).toHaveLength(2);
    });

    it('should handle custom feature prefix', async () => {
        const presetDir = 'presets/table';
        vi.mocked(fsSync.existsSync).mockImplementation((path: any) => String(path).includes('feature'));
        vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
            if (String(path).endsWith('feature')) {
                return [{ name: 'Component.tsx', isDirectory: () => false, isFile: () => true }] as any;
            }
            return [];
        });

        const conventions = { featureSlicePrefix: 'MyPrefix' };
        const actions = await discoverTemplates(presetDir, 'table', 'User', conventions);
        const featureAction = actions.find(a => (a as any).path.startsWith('features/MyPrefixUser'));

        expect(featureAction).toBeDefined();
    });
});
