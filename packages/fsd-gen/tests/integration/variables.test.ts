import { describe, it, expect } from 'vitest';
import { prepareActionVariables } from '../../src/lib/preset/actionExecution.js';

describe('Integration: Variable Cascading Scenarios', () => {
    it('should correctly cascade global -> action -> runtime variables', () => {
        const globalVars = {
            theme: 'dark',
            author: 'TeamA',
            version: '1.0',
        };

        const action = {
            type: 'component' as const,
            layer: 'feature' as const,
            slice: 'Authentication',
            name: 'LoginForm',
            template: 'ui',
            variables: {
                theme: 'light', // Override global
                icon: 'lock',
            },
        };

        // Stage 1: Prepare action variables
        const vars1 = prepareActionVariables(action, 'Authentication', globalVars);

        expect(vars1.theme).toBe('light'); // Action overrides global
        expect(vars1.author).toBe('TeamA'); // From global
        expect(vars1.icon).toBe('lock'); // From action

        // Stage 2: Simulating runtime override (e.g. from CLI or dynamic context)
        const finalVars = {
            ...vars1,
            theme: 'auto', // Final runtime override
            timestamp: '2024-01-01',
        };

        expect(finalVars.theme).toBe('auto');
        expect(finalVars.timestamp).toBe('2024-01-01');
    });

    it('should correctly prioritize variables through a full cascading chain', () => {
        const globalVars = { appName: 'MyApp', theme: 'dark', version: '1.0' };
        const action = {
            type: 'component' as const,
            layer: 'entity' as const,
            slice: 'User',
            name: 'User',
            template: 'ui',
            variables: {
                theme: 'light', // Overrides global
                feature: 'Auth'
            }
        };

        const vars = prepareActionVariables(action, 'User', globalVars) as any;

        const finalVars = {
            ...vars,
            version: '2.0', // Overrides global
            feature: 'Profile' // Overrides action
        };

        expect(finalVars.appName).toBe('MyApp');
        expect(finalVars.theme).toBe('light');
        expect(finalVars.version).toBe('2.0');
        expect(finalVars.feature).toBe('Profile');
    });

    it('should handle full workflow with all empty/undefined values', () => {
        const action = {
            type: 'component' as const,
            layer: 'entity' as const,
            slice: '',
            name: '',
            template: '',
        };

        const vars = prepareActionVariables(action, '', {});

        expect(vars.name).toBe('');
        expect(vars.componentName).toBe('');
        expect(Object.keys(vars).length).toBe(2);
    });
});
