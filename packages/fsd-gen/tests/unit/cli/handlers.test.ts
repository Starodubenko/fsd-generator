
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as validateConfig from '../../../src/lib/config/validateConfig.js';
import * as handlers from '../../../src/lib/cli/handlers.js';
import * as prompts from '../../../src/lib/cli/prompts.js';
import * as configLoader from '../../../src/lib/config/loadConfig.js';
import * as generator from '../../../src/lib/generators/generate.js';
import * as presetGenerator from '../../../src/lib/generators/generatePreset.js';
import * as reverseInit from '../../../src/lib/reverse/init.js';
import * as reverseAnalyze from '../../../src/lib/reverse/analyze.js';
import * as reverseBuild from '../../../src/lib/reverse/build.js';

vi.mock('../../../src/lib/cli/prompts.js');
vi.mock('../../../src/lib/config/loadConfig.js');
vi.mock('../../../src/lib/generators/generate.js');
vi.mock('../../../src/lib/generators/generatePreset.js');
vi.mock('../../../src/lib/reverse/init.js');
vi.mock('../../../src/lib/reverse/analyze.js');
vi.mock('../../../src/lib/reverse/build.js');
vi.mock('../../../src/lib/config/validateConfig.js');
vi.mock('../../../src/lib/templates/templateLoader.js');

describe('CLI Handlers', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(configLoader.loadConfig).mockResolvedValue({ rootDir: 'src', templatesDir: 'templates' } as any);
        vi.mocked(validateConfig.validateConfig).mockReturnValue({ valid: true, config: { rootDir: 'src' } } as any);
    });

    describe('handleGenerate', () => {
        it('should call generateComponent with prompted values if missing', async () => {
            vi.mocked(prompts.promptLayer).mockResolvedValue('entity');
            vi.mocked(prompts.promptSlice).mockResolvedValue('User');

            await handlers.handleGenerate();

            expect(generator.generateComponent).toHaveBeenCalled();
            expect(prompts.promptLayer).toHaveBeenCalled();
            expect(prompts.promptSlice).toHaveBeenCalled();
        });

        it('should use provided values instead of prompts', async () => {
            await handlers.handleGenerate('feature', 'Auth');
            expect(prompts.promptLayer).not.toHaveBeenCalled();
            expect(prompts.promptSlice).not.toHaveBeenCalled();
            expect(generator.generateComponent).toHaveBeenCalled();
        });

        it('should throw error if config validation fails', async () => {
            vi.mocked(configLoader.loadConfig).mockResolvedValue({ rootDir: 'src' } as any);
            vi.mocked(validateConfig.validateConfig).mockReturnValue({ valid: false, error: 'invalid' });

            await expect(handlers.handleGenerate('entity', 'User')).rejects.toThrow('Invalid configuration: invalid');
        });

        it('should throw error if rootDir is missing in config', async () => {
            vi.mocked(configLoader.loadConfig).mockResolvedValue({} as any);
            vi.mocked(validateConfig.validateConfig).mockReturnValue({ valid: true, config: {} } as any);

            await expect(handlers.handleGenerate('entity', 'User')).rejects.toThrow('Invalid config: rootDir missing');
        });
    });

    describe('handlePreset', () => {
        it('should call generatePreset', async () => {
            await handlers.handlePreset('table', 'User');
            expect(presetGenerator.generatePreset).toHaveBeenCalledWith('table', 'User');
        });

        it('should use templatesDir from config', async () => {
            vi.mocked(configLoader.loadConfig).mockResolvedValue({ templatesDir: 'custom-templates' } as any);
            vi.mocked(prompts.promptPresetName).mockResolvedValue('table');
            await handlers.handlePreset(undefined, 'User');
            expect(prompts.promptPresetName).toHaveBeenCalledWith('custom-templates');
        });

        it('should prompt if name is missing', async () => {
            vi.mocked(prompts.promptName).mockResolvedValue('Product');
            await handlers.handlePreset('table');
            expect(prompts.promptName).toHaveBeenCalled();
            expect(presetGenerator.generatePreset).toHaveBeenCalledWith('table', 'Product');
        });
    });

    describe('handleReverseInit', () => {
        it('should call initReversePreset', async () => {
            await handlers.handleReverseInit('my-preset');
            expect(reverseInit.initReversePreset).toHaveBeenCalledWith('my-preset', 'templates', 'ejected');
        });

        it('should prompt for presetName if missing', async () => {
            vi.mocked(prompts.promptName).mockResolvedValue('new-preset');
            await handlers.handleReverseInit(undefined, { mode: 'short' });
            expect(prompts.promptName).toHaveBeenCalledWith('Enter the name for the new preset:');
            expect(reverseInit.initReversePreset).toHaveBeenCalledWith('new-preset', 'templates', 'short');
        });
    });

    describe('handleReverseAnalyze', () => {
        it('should call analyzeReversePreset', async () => {
            await handlers.handleReverseAnalyze('my-preset');
            expect(reverseAnalyze.analyzeReversePreset).toHaveBeenCalledWith('my-preset', 'templates');
        });

        it('should prompt if no presetName provided and presets exist', async () => {
            const loader = await import('../../../src/lib/templates/templateLoader.js');
            vi.mocked(loader.listPresets).mockResolvedValue(['preset1']);
            vi.mocked(prompts.promptPresetName).mockResolvedValue('preset1');

            await handlers.handleReverseAnalyze();

            expect(prompts.promptPresetName).toHaveBeenCalled();
            expect(reverseAnalyze.analyzeReversePreset).toHaveBeenCalledWith('preset1', 'templates');
        });

        it('should throw error if no presets found and no name provided', async () => {
            const loader = await import('../../../src/lib/templates/templateLoader.js');
            vi.mocked(loader.listPresets).mockResolvedValue([]);

            await expect(handlers.handleReverseAnalyze()).rejects.toThrow('No presets found');
        });
    });

    describe('handleReverseBuild', () => {
        it('should call buildReversePreset', async () => {
            await handlers.handleReverseBuild('my-preset', { mode: 'short' });
            expect(reverseBuild.buildReversePreset).toHaveBeenCalledWith('my-preset', 'templates', 'short');
        });

        it('should prompt if no presetName provided', async () => {
            const loader = await import('../../../src/lib/templates/templateLoader.js');
            vi.mocked(loader.listPresets).mockResolvedValue(['preset1']);
            vi.mocked(prompts.promptPresetName).mockResolvedValue('preset1');

            await handlers.handleReverseBuild();

            expect(prompts.promptPresetName).toHaveBeenCalled();
            expect(reverseBuild.buildReversePreset).toHaveBeenCalledWith('preset1', 'templates', undefined);
        });

        it('should throw if no presetName and no presets found', async () => {
            const loader = await import('../../../src/lib/templates/templateLoader.js');
            vi.mocked(loader.listPresets).mockResolvedValue([]);

            await expect(handlers.handleReverseBuild()).rejects.toThrow('No presets found');
        });
    });
});
