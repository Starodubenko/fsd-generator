
import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import * as prompts from '../../../src/lib/cli/prompts.js';
import * as templateLoader from '../../../src/lib/templates/templateLoader.js';

vi.mock('inquirer');
vi.mock('../../../src/lib/templates/templateLoader.js');

describe('CLI Prompts', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('promptLayer', () => {
        it('should prompt for FSD layer', async () => {
            vi.mocked(inquirer.prompt).mockResolvedValue({ layer: 'entity' });
            const result = await prompts.promptLayer();
            expect(result).toBe('entity');
            expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ name: 'layer', type: 'list' })
            ]));
        });
    });

    describe('promptSlice', () => {
        it('should prompt for slice name', async () => {
            vi.mocked(inquirer.prompt).mockResolvedValue({ slice: 'User' });
            const result = await prompts.promptSlice();
            expect(result).toBe('User');
            expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ name: 'slice', type: 'input' })
            ]));
        });

        it('should validate slice name', async () => {
            vi.mocked(inquirer.prompt).mockImplementation((async (questions: any) => {
                const validate = questions[0].validate;
                expect(validate('')).toBe('Slice name is required');
                expect(validate('User')).toBe(true);
                return { slice: 'User' };
            }) as any);
            await prompts.promptSlice();
        });
    });

    describe('promptPresetName', () => {
        it('should prompt for preset name from available presets', async () => {
            vi.mocked(templateLoader.listPresets).mockResolvedValue(['table', 'list']);
            vi.mocked(inquirer.prompt).mockResolvedValue({ presetName: 'table' });

            const result = await prompts.promptPresetName('templates');
            expect(result).toBe('table');
            expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ choices: ['table', 'list'] })
            ]));
        });

        it('should use default preset choice if none found', async () => {
            vi.mocked(templateLoader.listPresets).mockResolvedValue([]);
            vi.mocked(inquirer.prompt).mockResolvedValue({ presetName: 'table' });

            const result = await prompts.promptPresetName('templates');
            expect(result).toBe('table');
            expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ choices: ['table'] })
            ]));
        });
    });

    describe('promptName', () => {
        it('should prompt for name with custom message', async () => {
            vi.mocked(inquirer.prompt).mockResolvedValue({ name: 'Product' });
            const result = await prompts.promptName('Custom message');
            expect(result).toBe('Product');
            expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ message: 'Custom message' })
            ]));
        });

        it('should validate name', async () => {
            vi.mocked(inquirer.prompt).mockImplementation((async (questions: any) => {
                const validate = questions[0].validate;
                expect(validate('')).toBe('Name is required');
                expect(validate('Product')).toBe(true);
                return { name: 'Product' };
            }) as any);
            await prompts.promptName();
        });
    });

    describe('promptMainAction', () => {
        it('should prompt for main action', async () => {
            vi.mocked(inquirer.prompt).mockResolvedValue({ action: 'generate' });
            const result = await prompts.promptMainAction();
            expect(result).toBe('generate');
            expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ name: 'action', type: 'list' })
            ]));
        });
    });
});
