import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadPresetConfig, loadPresetTs, loadPresetJson, evaluatePresetConfig } from '../../../src/lib/preset/presetLoading.js';
import { readFile, stat } from 'fs/promises';

vi.mock('fs/promises');
const mockJiti = {
    import: vi.fn(),
};

vi.mock('jiti', () => ({
    createJiti: vi.fn(() => mockJiti)
}));

describe('presetLoading', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('loadPresetTs', () => {
        it('should load preset config from default export', async () => {
            vi.mocked(stat).mockResolvedValue({} as any);
            mockJiti.import.mockResolvedValue({ default: { name: 'test' } });

            const result = await loadPresetTs('/dir');
            expect((result as any).name).toBe('test');
        });

        it('should load preset config from raw export if default missing', async () => {
            vi.mocked(stat).mockResolvedValue({} as any);
            mockJiti.import.mockResolvedValue({ name: 'test-raw' });

            const result = await loadPresetTs('/dir');
            expect((result as any).name).toBe('test-raw');
        });

        it('should return null if preset.ts does not exist', async () => {
            vi.mocked(stat).mockRejectedValue(new Error('no file'));
            const config = await loadPresetTs('/dir');
            expect(config).toBeNull();
        });
    });

    describe('loadPresetJson', () => {
        it('should load and parse preset.json', async () => {
            vi.mocked(readFile).mockResolvedValue('{"name": "json-test"}');
            const result = await loadPresetJson('/dir');
            expect((result as any)?.name).toBe('json-test');
        });

        it('should return null if file missing or invalid', async () => {
            vi.mocked(readFile).mockRejectedValue(new Error('no'));
            const result = await loadPresetJson('/dir');
            expect(result).toBeNull();
        });
    });

    describe('evaluatePresetConfig', () => {
        it('should call function if config is a function', () => {
            const configFn = vi.fn().mockReturnValue({ name: 'fn-test' });
            const result = evaluatePresetConfig(configFn as any, {} as any);
            expect((result as any).name).toBe('fn-test');
            expect(configFn).toHaveBeenCalled();
        });

        it('should return config as-is if not a function', () => {
            const config = { name: 'static' };
            const result = evaluatePresetConfig(config as any, {} as any);
            expect((result as any).name).toBe('static');
        });
    });

    describe('loadPresetConfig', () => {
        it('should try TS then JSON', async () => {
            vi.mocked(stat).mockRejectedValue(new Error('no ts')); // TS fails
            vi.mocked(readFile).mockResolvedValue('{"name": "json-fallback"}'); // JSON works

            const result = await loadPresetConfig('/dir', 'test', {} as any);
            expect((result as any)?.name).toBe('json-fallback');
        });

        it('should return null if both fail', async () => {
            vi.mocked(stat).mockRejectedValue(new Error('no ts'));
            vi.mocked(readFile).mockRejectedValue(new Error('no json'));

            const result = await loadPresetConfig('/dir', 'test', {} as any);
            expect(result).toBeNull();
        });

        it('should prioritize TS file and skip JSON check', async () => {
            vi.mocked(stat).mockResolvedValue({} as any);
            mockJiti.import.mockResolvedValue({ default: { name: 'ts-priority' } });

            // Should not read JSON file
            const result = await loadPresetConfig('/dir', 'test', {} as any);
            expect((result as any)?.name).toBe('ts-priority');
            expect(readFile).not.toHaveBeenCalled();
        });
    });
});
