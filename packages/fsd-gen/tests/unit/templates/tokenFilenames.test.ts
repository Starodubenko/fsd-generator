
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as templateLoader from '../../../src/lib/templates/templateLoader.js';
import * as actionExecution from '../../../src/lib/preset/actionExecution.js';
import * as fs from 'node:fs/promises';
import { join } from 'path';

vi.mock('node:fs/promises');

describe('Template Token Filename Discovery', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const tokens = [
        '{{name}}',
        '{{entityName}}',
        '{{entityNameCamel}}',
        '{{entityNameLower}}',
        '{{entityNameUpper}}',
        '{{entityNameKebab}}'
    ];

    const tokenToVar = (token: string) => token.replace(/[{}]/g, '');

    describe('readComponentTemplate (via loadTemplate)', () => {
        tokens.forEach(token => {
            it(`should find component template named ${token}.tsx`, async () => {
                vi.mocked(fs.stat).mockResolvedValue({} as any);
                vi.mocked(fs.readdir).mockResolvedValue([`${token}.tsx`] as any);
                vi.mocked(fs.readFile).mockResolvedValue('content');

                const result = await templateLoader.loadTemplate('layer', 'type');
                expect(result.component).toBe('content');
                expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining(`${token}.tsx`), 'utf-8');
            });
        });
    });

    describe('findTemplateDir literal-first', () => {
        tokens.forEach(token => {
            const varName = tokenToVar(token);
            it(`should find literal directory with token ${token} first`, async () => {
                vi.mocked(fs.stat).mockImplementation(async (p: any) => {
                    if (String(p).includes(token)) return {} as any;
                    throw new Error('Not found');
                });

                const variables = { [varName]: 'User' };
                const path = await templateLoader.findTemplateDir('layer', token, ['/dir'], variables);

                expect(path).toBe(join('/dir/layer', token));
            });

            it(`should fallback to resolved directory for token ${token}`, async () => {
                vi.mocked(fs.stat).mockImplementation(async (p: any) => {
                    if (String(p).includes('User')) return {} as any;
                    throw new Error('Not found');
                });

                const variables = { [varName]: 'User' };
                const path = await templateLoader.findTemplateDir('layer', token, ['/dir'], variables);

                expect(path).toBe('/dir/layer/User');
            });
        });
    });

    describe('loadFileTemplate literal-first', () => {
        tokens.forEach(token => {
            const varName = tokenToVar(token);
            const filename = `${token}.ts`;
            const resolvedFilename = 'User.ts';

            it(`should prioritize literal filename with token ${token}`, async () => {
                vi.mocked(fs.stat).mockImplementation(async (p: any) => {
                    if (String(p).includes(filename)) return {} as any;
                    throw new Error('Not found');
                });
                vi.mocked(fs.readFile).mockResolvedValue('literal content');

                const content = await actionExecution.loadFileTemplate(filename, '/custom', { [varName]: 'User' });

                expect(content).toBe('literal content');
                expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining(filename), 'utf-8');
            });

            it(`should fallback to resolved filename for token ${token}`, async () => {
                vi.mocked(fs.stat).mockImplementation(async (p: any) => {
                    if (String(p).includes(filename)) throw new Error('Not found');
                    return { isFile: () => true } as any;
                });
                vi.mocked(fs.readFile).mockImplementation(async (p: any) => {
                    if (String(p).includes(filename)) throw new Error('Not found');
                    if (String(p).includes(resolvedFilename)) return 'resolved content';
                    throw new Error('Not found');
                });

                const content = await actionExecution.loadFileTemplate(filename, '/custom', { [varName]: 'User' });

                expect(content).toBe('resolved content');
                expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining(resolvedFilename), 'utf-8');
            });
        });
    });
});
