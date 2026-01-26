import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processTemplate, resolveTemplateDirs, findTemplateDir, loadTemplate, listPresets, resolvePresetDir } from '../../../src/lib/templates/templateLoader.js';
import * as fs from 'node:fs/promises';

vi.mock('fs/promises');

describe('templateLoader', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('resolveTemplateDirs', () => {
        it('should return internal dir by default', () => {
            const dirs = resolveTemplateDirs();
            expect(dirs.some(d => d.endsWith('templates'))).toBe(true);
        });

        it('should prepend custom dir if provided', () => {
            const dirs = resolveTemplateDirs('/custom');
            expect(dirs[0]).toBe('/custom');
            expect(dirs.length).toBe(2);
        });
    });

    describe('findTemplateDir', () => {
        it('should return the first existing template dir', async () => {
            vi.mocked(fs.stat).mockRejectedValueOnce(new Error('no')).mockResolvedValueOnce({} as any);
            const path = await findTemplateDir('layer', 'type', ['/dir1', '/dir2']);
            expect(path).toBe('/dir2/layer/type');
        });

        it('should return null if none found', async () => {
            vi.mocked(fs.stat).mockRejectedValue(new Error('no'));
            const path = await findTemplateDir('layer', 'type', ['/dir1']);
            expect(path).toBeNull();
        });

        it('should handle empty layer string (flat structure)', async () => {
            vi.mocked(fs.stat).mockResolvedValue({} as any);
            const path = await findTemplateDir('', 'type', ['/dir']);
            expect(path).toBe('/dir/type');
        });
    });

    describe('loadTemplate', () => {
        it('should load component and styles', async () => {
            vi.mocked(fs.stat).mockResolvedValue({} as any);
            // Readdir called inside readComponentTemplate
            vi.mocked(fs.readdir).mockResolvedValue(['Component.tsx'] as any);

            vi.mocked(fs.readFile).mockResolvedValueOnce('comp content').mockResolvedValueOnce('styles content');

            const result = await loadTemplate('layer', 'type', '/custom');
            expect(result).toEqual({ component: 'comp content', styles: 'styles content' });
        });

        it('should return empty styles if file missing', async () => {
            vi.mocked(fs.stat).mockResolvedValue({} as any);
            // Readdir called inside readComponentTemplate
            vi.mocked(fs.readdir).mockResolvedValue(['Component.tsx'] as any);

            vi.mocked(fs.readFile)
                .mockResolvedValueOnce('comp content')
                .mockRejectedValueOnce(new Error('no styles'));

            const result = await loadTemplate('layer', 'type');
            expect(result.styles).toBe('');
        });

        it('should throw error if template dir not found', async () => {
            vi.mocked(fs.stat).mockRejectedValue(new Error('no'));
            await expect(loadTemplate('layer', 'type')).rejects.toThrow('Template not found');
        });
    });

    describe('listPresets', () => {
        it('should list directories in preset root', async () => {
            vi.mocked(fs.readdir).mockResolvedValue([
                { name: 'table', isDirectory: () => true },
                { name: 'file.txt', isDirectory: () => false }
            ] as any);

            const presets = await listPresets();
            expect(presets).toContain('table');
            expect(presets).not.toContain('file.txt');
        });

        it('should list directories in custom and internal presets', async () => {
            vi.mocked(fs.readdir).mockImplementation(async (path) => {
                if (String(path).includes('custom')) {
                    return [{ name: 'custom-preset', isDirectory: () => true }] as any;
                }
                return [{ name: 'table', isDirectory: () => true }] as any;
            });

            const presets = await listPresets('/custom');
            expect(presets).toContain('custom-preset');
            expect(presets).toContain('table');
        });

        it('should handle missing preset directory gracefully', async () => {
            vi.mocked(fs.readdir).mockRejectedValue(new Error('no dir'));
            const presets = await listPresets();
            expect(presets).toEqual([]);
        });
    });

    describe('resolvePresetDir', () => {
        it('should prioritize custom preset directory', async () => {
            vi.mocked(fs.stat).mockResolvedValue({} as any);
            const path = await resolvePresetDir('custom-preset', '/custom');
            expect(path).toBe('/custom/preset/custom-preset');
        });

        it('should return path if preset exists', async () => {
            vi.mocked(fs.stat).mockResolvedValue({} as any);
            const path = await resolvePresetDir('table', '/custom');
            expect(path).toBe('/custom/preset/table');
        });

        it('should return null if preset not found', async () => {
            vi.mocked(fs.stat).mockRejectedValue(new Error('no'));
            const path = await resolvePresetDir('table');
            expect(path).toBeNull();
        });
    });

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

        it('should handle variables with dot notation', () => {
            const template = 'Hello {{user.name}}!';
            const variables = { 'user.name': 'Alice' };
            const result = processTemplate(template, variables);
            expect(result).toBe('Hello Alice!');
        });
    });
});
