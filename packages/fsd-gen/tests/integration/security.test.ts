import { describe, it, expect } from 'vitest';
import { resolveFsdPaths } from '../../src/lib/naming/resolvePaths.js';
import { processTemplate } from '../../src/lib/templates/templateLoader.js';

describe('Integration: Security Scenarios', () => {
    it('should document path traversal normalization when slice is resolved from variable', () => {
        const action = {
            type: 'component' as const,
            layer: 'feature' as const,
            slice: '{{maliciousPath}}',
            name: 'Comp',
            template: 'ui',
            variables: {
                maliciousPath: '../../malicious'
            }
        };

        const slice = processTemplate(action.slice, action.variables);
        const paths = resolveFsdPaths('src', action.layer, slice, 'Comp');

        // path.join('src', 'features', '../../malicious') -> 'malicious'
        expect(paths.slicePath).toBe('malicious');
        expect(paths.componentPath).toBe('malicious/ui/Comp');
    });

    it('should process variables containing code-like strings without escaping (Injection Simulation)', () => {
        const template = 'const data = "{{jsonValue}}";';
        const variables = {
            jsonValue: '"); alert("XSS"); ("'
        };

        const result = processTemplate(template, variables);

        // Literal replacement
        expect(result).toBe('const data = ""); alert("XSS"); ("";');
    });
});
