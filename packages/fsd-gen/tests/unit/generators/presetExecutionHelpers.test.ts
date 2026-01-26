
import { describe, it, expect, vi } from 'vitest';
import {
    prepareTemplateVariables,
    resolvePresetActions,
    handleRouteInjection
} from '../../../src/lib/generators/presetExecutionHelpers.js';
import * as discovery from '../../../src/lib/preset/presetDiscovery.js';
import * as routing from '../../../src/lib/routing/injectRoute.js';

describe('presetExecutionHelpers', () => {
    describe('prepareTemplateVariables', () => {
        it('should generate all naming variations', () => {
            const vars = prepareTemplateVariables('UserProfile', { theme: 'dark' }, { role: 'admin' }) as any;
            expect(vars.name).toBe('UserProfile');
            expect(vars.componentName).toBe('UserProfile');
            expect(vars.nameLower).toBe('userprofile');
            expect(vars.nameUpper).toBe('USERPROFILE');
            expect(vars.nameKebab).toBe('user-profile');
            expect(vars.entityName).toBe('UserProfile');
            expect(vars.entityNameCamel).toBe('userProfile');
            expect(vars.entityNameLower).toBe('userprofile');
            expect(vars.entityNameUpper).toBe('USERPROFILE');
            expect(vars.entityNameKebab).toBe('user-profile');
            expect(vars.theme).toBe('dark');
            expect(vars.role).toBe('admin');
        });
    });

    describe('resolvePresetActions', () => {
        it('should use discoverTemplates in AUTO mode', async () => {
            const spy = vi.spyOn(discovery, 'discoverTemplates').mockResolvedValue([{ type: 'file', path: 'p', template: 't' }] as any);
            const config = { discoveryMode: 'auto' } as any;

            const actions = await resolvePresetActions(config, 'dir', 'preset', 'User');
            expect(spy).toHaveBeenCalled();
            expect(actions.length).toBe(1);
        });

        it('should return manual actions if not AUTO mode', async () => {
            const config = { discoveryMode: 'manual', actions: [{ type: 'file' }] } as any;
            const actions = await resolvePresetActions(config, 'dir', 'preset', 'User');
            expect(actions.length).toBe(1);
        });
    });

    describe('handleRouteInjection', () => {
        it('should skip if no routing config', async () => {
            const spy = vi.spyOn(routing, 'injectRoute');
            await handleRouteInjection({} as any, [], 'User', {}, {});
            expect(spy).not.toHaveBeenCalled();
        });

        it('should warn and skip if no page action found', async () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const config = { routing: { path: '/' } } as any;
            await handleRouteInjection(config, [], 'User', {}, {});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('no page template found'));
        });

        it('should inject route for page actions', async () => {
            const spy = vi.spyOn(routing, 'injectRoute').mockResolvedValue(undefined);
            const config = { routing: { path: '/{{nameLower}}' } } as any;
            const actions = [
                { type: 'component', layer: 'page', slice: 'User{{name}}' }
            ] as any;

            await handleRouteInjection(config, actions, 'Profile', {}, { rootDir: 'src' });
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({
                path: '/profile',
                importPath: '@pages/UserProfile'
            }));
        });
    });
});
