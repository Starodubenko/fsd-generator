import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverTemplates, createFileAction } from '../../../src/lib/preset/presetDiscovery.js';
import { ACTION_TYPES, FSD_LAYERS, FSD_SEGMENTS, PRESET_DIRS } from '../../../src/lib/constants.js';
import * as fs from 'node:fs/promises';

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
                    // Return both 'get' and 'create' to cover both branches
                    return [
                        { name: 'get', isDirectory: () => true, isFile: () => false },
                        { name: 'create', isDirectory: () => true, isFile: () => false }
                    ] as any;
                }
                return [];
            });

            const actions = await discoverTemplates(presetDir, presetName, entityName);

            const getAction = actions.find(a => (a as any).name === 'useGetUsers') as any;
            const createAction = actions.find(a => (a as any).name === 'useCreateUser') as any;

            expect(getAction).toBeDefined();
            expect(createAction).toBeDefined();
            expect(createAction.name).toBe('useCreateUser'); // Checks that 's' is not added
        });

        it('should identify feature buttons as COMPONENT actions', async () => {
            const presetDir = 'presets/table';
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('feature')) {
                    return [{ name: PRESET_DIRS.BUTTONS, isDirectory: () => true, isFile: () => false }] as any;
                }
                if (String(path).endsWith(PRESET_DIRS.BUTTONS)) {
                    return [{ name: 'create', isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates(presetDir, 'table', 'User');
            const featureAction = actions.find(a => (a as any).layer === FSD_LAYERS.FEATURE) as any;
            expect(featureAction).toBeDefined();
            expect(featureAction.name).toBe('CreateUserButton');
        });

        it('should identify page templates as COMPONENT actions', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('page')) {
                    return [{ name: 'page', isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates('p', 'table', 'User');
            expect((actions[0] as any).layer).toBe(FSD_LAYERS.PAGE);
        });

        it('should identify shared components', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('shared')) {
                    return [{ name: 'Button', isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates('p', 'table', 'User');
            expect((actions[0] as any).layer).toBe(FSD_LAYERS.SHARED);
            expect((actions[0] as any).slice).toBe('Button');
        });

        it('should identify .ts files as FILE actions', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('entity')) {
                    return [{ name: 'types.ts', isDirectory: () => false, isFile: () => true }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates('p', 'table', 'User');
            expect(actions[0].type).toBe(ACTION_TYPES.FILE);
        });

        it('should handle custom conventions', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('widget')) {
                    return [{ name: PRESET_DIRS.TABLE, isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });

            const conventions = { widgetSliceSuffix: 'Grid', featureSlicePrefix: 'MyPrefix', pageSliceSuffix: 'View' };

            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('widget')) return [{ name: PRESET_DIRS.TABLE, isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith('feature')) return [{ name: PRESET_DIRS.BUTTONS, isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith(PRESET_DIRS.BUTTONS)) return [{ name: 'create', isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith('page')) return [{ name: 'page', isDirectory: () => true, isFile: () => false }] as any;
                return [];
            });

            const actions = await discoverTemplates('p', 'table', 'User', conventions);

            const widgetAction = actions.find(a => (a as any).layer === FSD_LAYERS.WIDGET) as any;
            const featureAction = actions.find(a => (a as any).layer === FSD_LAYERS.FEATURE) as any;
            const pageAction = actions.find(a => (a as any).layer === FSD_LAYERS.PAGE) as any;

            expect(widgetAction.slice).toBe('UserGrid');
            expect(featureAction.slice).toBe('MyPrefixUser');
            expect(pageAction.slice).toBe('UserView');
        });

        it('should handle unknown API hooks with generic naming', async () => {
            const presetDir = 'presets/test';
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path) => {
                if (String(path).endsWith('entity')) return [{ name: 'api', isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith('api')) return [{ name: 'customOp', isDirectory: () => true, isFile: () => false }] as any;
                return [];
            });

            const actions = await discoverTemplates(presetDir, 'test', 'User');
            const action = actions.find(a => (a as any).name === 'useCustomOpUser');
            expect(action).toBeDefined();
        });

        it('should use default conventions for widget table', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path) => {
                if (String(path).endsWith('widget')) return [{ name: PRESET_DIRS.TABLE, isDirectory: () => true, isFile: () => false }] as any;
                return [];
            });

            const actions = await discoverTemplates('p', 'table', 'User');
            const action = actions.find(a => (a as any).layer === 'widget');
            expect((action as any).slice).toBe('UserTable');
        });

        it('should ignore non-directory entries in API and Button folders', async () => {
            const presetDir = 'presets/test';
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path) => {
                if (String(path).endsWith('entity')) return [{ name: 'api', isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith('api')) return [{ name: 'readme.md', isDirectory: () => false, isFile: () => true }] as any;

                if (String(path).endsWith('feature')) return [{ name: 'buttons', isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith('buttons')) return [{ name: 'readme.md', isDirectory: () => false, isFile: () => true }] as any;

                return [];
            });

            const actions = await discoverTemplates(presetDir, 'test', 'User');
            const apiActions = actions.filter(a => (a as any).layer === 'entity' && (a as any).type === 'hook');
            const buttonActions = actions.filter(a => (a as any).layer === 'feature' && (a as any).name?.includes('Button'));

            expect(apiActions.length).toBe(0);
            expect(buttonActions.length).toBe(0);
        });

        it('should ignore non-matching directories in feature, widget, and page layers', async () => {
            const presetDir = 'presets/test';
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path) => {
                if (String(path).endsWith('feature')) return [{ name: 'random-feature', isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith('widget')) return [{ name: 'random-widget', isDirectory: () => true, isFile: () => false }] as any;
                if (String(path).endsWith('page')) return [{ name: 'random-page', isDirectory: () => true, isFile: () => false }] as any;
                return [];
            });

            const actions = await discoverTemplates(presetDir, 'test', 'User');
            expect(actions.length).toBe(0);
        });
    });

    describe('createFileAction', () => {

        it('should default to "pages" plural for unknown layer', () => {
            const entry = { name: 'test.ts' } as any;
            const action = createFileAction(entry, 'unknown_layer', 'User', 'preset');
            expect(action.path).toContain('pages/User/model/test.ts');
        });

        it('should identify UI segment in entity layer', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('entity')) {
                    return [{ name: FSD_SEGMENTS.UI, isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });

            const actions = await discoverTemplates('p', 'table', 'User');
            expect(actions.some(a => (a as any).type === ACTION_TYPES.COMPONENT && (a as any).layer === FSD_LAYERS.ENTITY)).toBe(true);
        });

        it('should handle missing layer directory', async () => {
            vi.mocked(fs.stat).mockRejectedValue(new Error('no dir'));
            const actions = await discoverTemplates('p', 'table', 'User');
            expect(actions).toEqual([]);
        });

        it('should handle random directory in entity layer', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('entity')) {
                    return [{ name: 'random', isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });
            const actions = await discoverTemplates('p', 'table', 'User');
            expect(actions.length).toBe(0);
        });

        it('should handle random hook names', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('entity')) {
                    return [{ name: 'api', isDirectory: () => true, isFile: () => false }] as any;
                }
                if (String(path).endsWith('api')) {
                    return [{ name: 'custom', isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });
            const actions = await discoverTemplates('p', 'table', 'User');
            expect((actions[0] as any).name).toBe('useCustomUser');
        });

        it('should handle shared directory with same name as layer', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
            vi.mocked(fs.readdir).mockImplementation(async (path: any) => {
                if (String(path).endsWith('shared')) {
                    return [{ name: 'shared', isDirectory: () => true, isFile: () => false }] as any;
                }
                return [];
            });
            const actions = await discoverTemplates('p', 'table', 'User');
            expect((actions[0] as any).slice).toBe('User');
        });

        it('should handle non-directory entries gracefully', async () => {
            vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => false } as any);
            const actions = await discoverTemplates('p', 'table', 'User');
            expect(actions).toEqual([]);
        });
    });
});
