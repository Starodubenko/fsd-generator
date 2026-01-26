
import { describe, it, expect } from 'vitest';
import { EntityToken } from '../../../src/lib/reverse/constants.js';
import { prepareTemplateVariables } from '../../../src/lib/generators/presetExecutionHelpers.js';
import { processTemplate } from '../../../src/lib/templates/templateLoader.js';

describe('EntityToken Integration', () => {
    it('should correctly replace all EntityToken types in a template', () => {
        // 1. Construct a template using all token constants
        const template = `
            Name: ${EntityToken.NAME}
            EntityName: ${EntityToken.ENTITY_NAME}
            Camel: ${EntityToken.ENTITY_NAME_CAMEL}
            Lower: ${EntityToken.ENTITY_NAME_LOWER}
            Upper: ${EntityToken.ENTITY_NAME_UPPER}
            Kebab: ${EntityToken.ENTITY_NAME_KEBAB}
        `;

        // 2. Prepare variables for a sample entity
        const entityName = 'UserProfile';
        // cast to any because we know prepareTemplateVariables returns more than what might be typed if not updated everywhere
        const variables = prepareTemplateVariables(entityName) as any;

        // 3. Process the template
        const result = processTemplate(template, variables);

        // 4. Verify replacements
        expect(result).toContain('Name: UserProfile');
        expect(result).toContain('EntityName: UserProfile');
        expect(result).toContain('Camel: userProfile');
        expect(result).toContain('Lower: userprofile');
        expect(result).toContain('Upper: USERPROFILE');
        expect(result).toContain('Kebab: user-profile');
    });

    it('should handle dot notation tokens if used manually (though not in EntityToken constants)', () => {
        const template = 'Dot: {{entityName.length}}'; // Just testing that dot access works on the object
        const variables = { entityName: { length: '11' } };
        const result = processTemplate(template, variables);
        expect(result).toContain('Dot: 11');
    });
});
