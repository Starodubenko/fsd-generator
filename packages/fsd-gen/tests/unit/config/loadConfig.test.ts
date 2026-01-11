import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, findConfigFile, mergeWithDefaults } from '../../../src/lib/config/loadConfig.js';
import fs from 'fs';
import { defaultConfig } from '../../../src/config/types.js';

vi.mock('fs');
const mockJiti = {
    import: vi.fn(),
};

vi.mock('jiti', () => ({
    createJiti: vi.fn(() => mockJiti)
}));

describe('loadConfig', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('findConfigFile', () => {
        it('should return path if config file exists', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            const path = findConfigFile('/test');
            expect(path).toContain('fsdgen.config.ts');
        });

        it('should return null if config file does not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            const path = findConfigFile('/test');
            expect(path).toBeNull();
        });
    });

    describe('mergeWithDefaults', () => {
        it('should merge user config with defaults', () => {
            const userConfig = { rootDir: 'custom' };
            const merged = mergeWithDefaults(userConfig);
            expect(merged.rootDir).toBe('custom');
            expect(merged.naming).toBe(defaultConfig.naming);
        });
    });

    describe('loadConfig', () => {
        it('should return defaultConfig if no config file is found', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            const config = await loadConfig('/empty');
            expect(config).toEqual(defaultConfig);
        });

        it('should load and merge config if file exists', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            mockJiti.import.mockResolvedValue({ rootDir: 'custom-src' });

            const config = await loadConfig('/test');
            expect(config.rootDir).toBe('custom-src');
        });

        it('should return defaultConfig if loading fails', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            mockJiti.import.mockRejectedValue(new Error('Load failed'));

            const config = await loadConfig('/fail');
            expect(config).toEqual(defaultConfig);
        });
    });
});
