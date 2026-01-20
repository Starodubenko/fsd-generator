import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverTemplates } from '../../../src/lib/preset/presetDiscovery.js';
import { ACTION_TYPES, FSD_LAYERS } from '../../../src/lib/constants.js';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';

vi.mock('fs/promises');
vi.mock('node:fs', () => ({
    existsSync: vi.fn()
}));

describe('presetDiscovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('discoverTemplates', () => {
        it('should recursively discover files in layers', async () => {
            const presetDir = 'presets/table';
            const presetName = 'table';
            const entityName = 'User';

            vi.mocked(fsSync.existsSync).mockImplementation((path: any) => String(path).includes('entity'));
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                const s = String(path);
                if (s.endsWith('entity')) {
                    return [{ name: 'api', isDirectory: () => true, isFile: () => false }] as any;
                }
                if (s.endsWith('api')) {
                    return [{ name: 'get', isDirectory: () => true, isFile: () => false }] as any;
                }
                if (s.endsWith('get')) {
                    return [{ name: 'useGetUsers.ts', isDirectory: () => false, isFile: () => true }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates(presetDir, presetName, entityName);

            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(ACTION_TYPES.FILE);
            expect((actions[0] as any).path).toBe('entities/User/api/get/useGetUsers.ts');
        });

        it('should apply correct slice name conventions for component-like files', async () => {
            vi.mocked(fsSync.existsSync).mockImplementation((path: any) => {
                const s = String(path);
                return s.includes('widget') || s.includes('feature') || s.includes('page');
            });

            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                const s = String(path);
                if (s.endsWith('widget')) return [{ name: '{{name}}Widget.tsx', isDirectory: () => false, isFile: () => true }] as any;
                if (s.endsWith('feature')) return [{ name: 'Component.tsx', isDirectory: () => false, isFile: () => true }] as any;
                if (s.endsWith('page')) return [{ name: '{{name}}Page.tsx', isDirectory: () => false, isFile: () => true }] as any;
                return [];
            });

            const conventions = {
                widgetSliceSuffix: 'Table',
                featureSlicePrefix: 'Manage',
                pageSliceSuffix: 'View'
            };

            const actions = await discoverTemplates('p', 'table', 'User', conventions);

            const widgetAction = actions.find(a => (a as any).path.startsWith('widgets/UserTable'));
            const featureAction = actions.find(a => (a as any).path.startsWith('features/ManageUser'));
            const pageAction = actions.find(a => (a as any).path.startsWith('pages/UserView'));

            expect(widgetAction).toBeDefined();
            expect(featureAction).toBeDefined();
            expect(pageAction).toBeDefined();
        });

        it('should handle missing layer directories gracefully', async () => {
            vi.mocked(fsSync.existsSync).mockReturnValue(false);
            const actions = await discoverTemplates('p', 'table', 'User');
            expect(actions).toEqual([]);
        });

        it('should ignore empty directories', async () => {
            vi.mocked(fsSync.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdir).mockResolvedValue([]);
            const actions = await discoverTemplates('p', 'table', 'User');
            expect(actions).toEqual([]);
        });

        it('should correctly construct template paths', async () => {
            vi.mocked(fsSync.existsSync).mockImplementation((path: any) => String(path).includes('shared'));
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('shared')) {
                    return [{ name: 'Button.tsx', isDirectory: () => false, isFile: () => true }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates('presets/my-preset', 'my-preset', 'User');
            expect(actions[0].template).toBe('preset/my-preset/shared/Button.tsx');
        });
    });
});
