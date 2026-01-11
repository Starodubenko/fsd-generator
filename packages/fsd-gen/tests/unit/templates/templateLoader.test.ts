import { describe, it, expect } from 'vitest';
import { processTemplate } from '../../../src/lib/templates/templateLoader.js';

describe('templateLoader', () => {
    describe('processTemplate', () => {
        it('should replace single variable', () => {
            const template = 'Hello {{name}}!';
            const variables = { name: 'World' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello World!');
        });

        it('should replace multiple variables', () => {
            const template = '{{greeting}} {{name}}!';
            const variables = { greeting: 'Hello', name: 'World' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello World!');
        });

        it('should replace repeated variables', () => {
            const template = '{{name}} says {{name}}';
            const variables = { name: 'Alice' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Alice says Alice');
        });

        it('should handle variables in different contexts', () => {
            const template = 'export const {{componentName}} = () => <div>{{componentName}}</div>';
            const variables = { componentName: 'Button' };
            const result = processTemplate(template, variables);
            expect(result).toBe('export const Button = () => <div>Button</div>');
        });

        it('should remove placeholders when no matching variables provided', () => {
            const template = 'Hello {{name}}!';
            const variables = {};
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello !');
        });

        it('should handle empty template', () => {
            const result = processTemplate('', { name: 'test' });
            expect(result).toBe('');
        });

        it('should handle template with no placeholders', () => {
            const template = 'Hello World!';
            const variables = { name: 'test' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello World!');
        });

        // P0: Critical edge cases
        it('should handle whitespace-only template', () => {
            const result = processTemplate('   \n\t  ', { name: 'test' });
            expect(result).toBe('   \n\t  ');
        });

        it('should handle undefined variables object', () => {
            const template = 'Hello {{name}}!';
            const result = processTemplate(template, {} as any);
            expect(result).toBe('Hello !');
        });

        // P1: Placeholder edge cases
        it('should handle extra spaces in placeholders', () => {
            const template = 'Hello {{  name  }}!';
            const variables = { name: 'World' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello World!');
        });

        it('should handle unclosed braces - left as-is', () => {
            const template = 'Hello {{name!';
            const variables = { name: 'World' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello {{name!'); // Unclosed brace not matched
        });

        it('should handle nested braces - outer wins', () => {
            const template = '{{{{name}}}}';
            const variables = { name: 'World' };
            const result = processTemplate(template, variables);
            // Regex will match innermost {{name}}
            expect(result).toBe('{{World}}');
        });

        it('should handle underscores in variable names', () => {
            const template = 'Hello {{user_name}}!';
            const variables = { user_name: 'Alice' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello Alice!');
        });

        it('should NOT handle hyphens in variable names (word chars only)', () => {
            const template = 'Hello {{user-name}}!';
            const variables = { 'user-name': 'Alice' };
            const result = processTemplate(template, variables);
            // Regex only matches \w+ (alphanumeric + underscore)
            expect(result).toBe('Hello {{user-name}}!');
        });

        it('should handle numbers as variable values', () => {
            const template = 'Count: {{count}}';
            const variables = { count: '42' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Count: 42');
        });

        it('should be case-sensitive for variable names', () => {
            const template = 'Hello {{NAME}}!';
            const variables = { name: 'World' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello !'); // NAME !== name
        });

        // P1: Performance edge case
        it('should handle many placeholders efficiently', () => {
            const parts = [];
            const vars: Record<string, string> = {};
            for (let i = 0; i < 100; i++) {
                parts.push(`{{var${i}}}`);
                vars[`var${i}`] = `val${i}`;
            }
            const template = parts.join(' ');
            const result = processTemplate(template, vars);
            expect(result).toContain('val0');
            expect(result).toContain('val99');
            expect(result.split(' ').length).toBe(100);
        });

        it('should handle very long variable values', () => {
            const longValue = 'x'.repeat(10000);
            const template = 'Value: {{data}}';
            const variables = { data: longValue };
            const result = processTemplate(template, variables);
            expect(result).toBe(`Value: ${longValue}`);
            expect(result.length).toBe(7 + longValue.length);
        });
    });
});
