import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prepareActionVariables, executeHookAction, executeStylesAction, executeActions } from '../../../src/lib/preset/actionExecution.js';
import { ACTION_TYPES } from '../../../src/lib/constants.js';
import * as generate from '../../../src/lib/generators/generate.js';
import * as resolvePaths from '../../../src/lib/naming/resolvePaths.js';
import * as templateLoader from '../../../src/lib/templates/templateLoader.js';

vi.mock('../../../src/lib/generators/generate.js');
vi.mock('../../../src/lib/naming/resolvePaths.js');
vi.mock('../../../src/lib/templates/templateLoader.js');
vi.mock('../../../src/lib/barrels/updateBarrels.js');
vi.mock('fs/promises');

describe('actionExecution', () => {
    describe('prepareActionVariables', () => {
        it('should merge global and action-specific variables', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {
                    icon: 'user-icon',
                    theme: 'dark',
                },
            };

            const globalVars = {
                author: 'Team',
                version: '1.0',
            };

            const result = prepareActionVariables(action, 'User', globalVars);

            expect(result).toEqual({
                name: 'User',
                componentName: 'User',
                author: 'Team',
                version: '1.0',
                icon: 'user-icon',
                theme: 'dark',
            });
        });

        it('should prioritize action variables over global variables', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {
                    theme: 'light',
                },
            };

            const globalVars = {
                theme: 'dark',
            };

            const result = prepareActionVariables(action, 'User', globalVars);

            expect(result.theme).toBe('light');
        });

        it('should handle action with no variables', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
            };

            const globalVars = {
                author: 'Team',
            };

            const result = prepareActionVariables(action, 'User', globalVars);

            expect(result).toEqual({
                name: 'User',
                componentName: 'User',
                author: 'Team',
            });
        });

        it('should handle empty global variables', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {
                    icon: 'user-icon',
                },
            };

            const result = prepareActionVariables(action, 'TestEntity', {});

            expect(result).toEqual({
                name: 'TestEntity',
                componentName: 'TestEntity',
                icon: 'user-icon',
            });
        });

        // P0: Critical edge cases
        it('should handle empty name parameter', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
            };

            const result = prepareActionVariables(action, '', {});

            expect(result).toEqual({
                name: '',
                componentName: '',
            });
        });

        it('should handle action.variables being undefined', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: undefined,
            };

            const result = prepareActionVariables(action as any, 'User', { author: 'Team' });

            expect(result).toEqual({
                name: 'User',
                componentName: 'User',
                author: 'Team',
            });
        });

        // P1: Variable type conflicts
        it('should handle conflicting variable types (last wins)', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {
                    count: 'string-42', // String value
                },
            };

            const globalVars = {
                count: '10', // Different string value
            };

            const result = prepareActionVariables(action, 'User', globalVars);
            expect(result.count).toBe('string-42'); // Action wins
        });

        // P1: Reserved name collisions
        it('should allow overriding reserved "name" from action variables', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {
                    name: 'CustomName', // Tries to override
                },
            };

            const result = prepareActionVariables(action, 'User', {});
            // Action variables come last, so they win
            expect(result.name).toBe('CustomName');
        });

        it('should allow overriding "componentName" from action variables', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {
                    componentName: 'OverriddenComponent',
                },
            };

            const result = prepareActionVariables(action, 'User', {});
            expect(result.componentName).toBe('OverriddenComponent');
        });

        // P1: Large variable sets
        it('should handle many variables efficiently', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {},
            };

            const globalVars: Record<string, string> = {};
            for (let i = 0; i < 100; i++) {
                globalVars[`var${i}`] = `value${i}`;
            }

            const result = prepareActionVariables(action, 'User', globalVars);

            expect(result.name).toBe('User');
            expect(result.var0).toBe('value0');
            expect(result.var99).toBe('value99');
            expect(Object.keys(result).length).toBeGreaterThan(100); // name, componentName + 100 vars
        });

        // P1: Special characters in variable names/values
        it('should handle special characters in variable values', () => {
            const action = {
                type: 'component' as const,
                layer: 'entity' as const,
                slice: 'User',
                name: 'UserCard',
                template: 'preset/test/entity/ui',
                variables: {
                    path: '../../../malicious',
                    style: '<script>alert("xss")</script>',
                },
            };

            const result = prepareActionVariables(action, 'User', {});

            // No sanitization - passes through as-is
            expect(result.path).toBe('../../../malicious');
            expect(result.style).toBe('<script>alert("xss")</script>');
        });
    });
});

describe('execution handlers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockConfig = { rootDir: 'src', templatesDir: '.fsd-templates' };
    const mockPaths = { slicePath: 's', uiPath: 'u', componentPath: 'c' };

    it('should execute hook action correctly', async () => {
        const action = { type: ACTION_TYPES.HOOK, layer: 'entity', slice: 'User', name: 'useUser', template: 't' };
        vi.mocked(templateLoader.processTemplate).mockImplementation((t) => t);
        vi.mocked(resolvePaths.resolveFsdPaths).mockReturnValue(mockPaths as any);

        await executeHookAction(action, {}, mockConfig as any);

        expect(generate.generateHook).toHaveBeenCalledWith(mockPaths, expect.any(Object), 't', '.fsd-templates');
    });

    it('should execute styles action correctly', async () => {
        const action = { type: ACTION_TYPES.STYLES, layer: 'feature', slice: 'Search', name: 'Search.styles', template: 'st' };
        vi.mocked(templateLoader.processTemplate).mockImplementation((t) => t);
        vi.mocked(resolvePaths.resolveFsdPaths).mockReturnValue(mockPaths as any);

        await executeStylesAction(action, {}, mockConfig as any);

        expect(generate.generateStyles).toHaveBeenCalledWith(mockPaths, expect.any(Object), 'st', '.fsd-templates');
    });
});

describe('executeActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should dispatch HOOK and STYLES actions correctly', async () => {
        const actions = [
            { type: ACTION_TYPES.HOOK, layer: 'entity', slice: 'U', template: 't1' },
            { type: ACTION_TYPES.STYLES, layer: 'entity', slice: 'U', template: 't2' }
        ];
        vi.mocked(templateLoader.processTemplate).mockImplementation((t) => t);
        vi.mocked(resolvePaths.resolveFsdPaths).mockReturnValue({} as any);

        await executeActions(actions as any, 'User', {}, { rootDir: 'src' } as any);

        expect(generate.generateHook).toHaveBeenCalled();
        expect(generate.generateStyles).toHaveBeenCalled();
    });
});
