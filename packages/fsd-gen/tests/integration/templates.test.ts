import { describe, it, expect } from 'vitest';
import { processTemplate } from '../../src/lib/templates/templateLoader.js';

describe('Integration: Template Processing Scenarios', () => {
    it('should process nested template replacements correctly', () => {
        // Stage 1: Process component template
        const componentVars = {
            componentName: 'UserCard',
            sliceName: 'User',
        };

        const stage1Template = 'export const {{componentName}} from "{{sliceName}}/{{componentName}}"';
        const stage1Result = processTemplate(stage1Template, componentVars);

        expect(stage1Result).toBe('export const UserCard from "User/UserCard"');

        // Stage 2: Use stage 1 result as part of new template
        const stage2Vars = {
            imports: stage1Result,
            author: 'TeamB',
        };

        const stage2Template = '// Author: {{author}}\n{{imports}}';
        const stage2Result = processTemplate(stage2Template, stage2Vars);

        expect(stage2Result).toContain('// Author: TeamB');
        expect(stage2Result).toContain('export const UserCard');
    });

    it('should handle complex templates with many variable types', () => {
        const template = `
/**
 * @component {{componentName}}
 * @author {{author}}
 * @version {{version}}
 * @layer {{layer}}
 * @theme {{theme}}
 */

import { FC } from 'react';
import styles from './{{componentName}}.styles';

export interface {{componentName}}Props {
  variant: '{{variant}}';
  size: '{{size}}';
}

export const {{componentName}}: FC<{{componentName}}Props> = (props) => {
  return <div className={styles.{{componentName}}}>{props.children}</div>;
};
    `.trim();

        const variables = {
            componentName: 'Button',
            author: 'UITeam',
            version: '2.0',
            layer: 'shared',
            theme: 'material',
            variant: 'primary',
            size: 'medium',
        };

        const result = processTemplate(template, variables);

        expect(result).toContain('@component Button');
        expect(result).toContain('@author UITeam');
        expect(result).toContain('@version 2.0');
        expect(result).toContain('@layer shared');
        expect(result).toContain('@theme material');
        expect(result).toContain("variant: 'primary'");
        expect(result).toContain("size: 'medium'");
        expect(result).toContain('import styles from \'./Button.styles\'');
        expect(result).toContain('export const Button: FC<ButtonProps>');
        expect(result).toContain('className={styles.Button}');
    });

    it('should process template with no variables available by removing placeholders', () => {
        const template = 'Hello {{name}}, your role is {{role}}.';
        const result = processTemplate(template, {});

        expect(result).toBe('Hello , your role is .');
    });
});
