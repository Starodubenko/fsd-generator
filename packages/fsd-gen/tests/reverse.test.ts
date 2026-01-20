
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdir, writeFile, rm, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { initReversePreset } from '../src/lib/reverse/init';
import { analyzeReversePreset } from '../src/lib/reverse/analyze';
import { buildReversePreset } from '../src/lib/reverse/build';
import { PresetSourceConfig } from '../src/lib/reverse/types';

describe('Reverse Preset Generation', () => {
    const testDir = join(__dirname, 'tmp-reverse-test');
    const templatesDir = join(testDir, 'templates');
    const etalonDir = join(testDir, 'etalon', 'entity', 'User');

    beforeEach(async () => {
        await mkdir(templatesDir, { recursive: true });
        await mkdir(join(etalonDir, 'ui'), { recursive: true });
        await mkdir(join(etalonDir, 'model'), { recursive: true });

        // Create etalon files
        await writeFile(
            join(etalonDir, 'ui', 'UserCard.tsx'),
            `export const UserCard = () => { return <div>User Card</div>; };`
        );
        // Complex file with multiple tokens
        await writeFile(
            join(etalonDir, 'model', 'types.ts'),
            `export interface User { id: string; name: string; }
             export interface UserProfile extends User { bio: string; }`
        );
        // Style file
        await writeFile(
            join(etalonDir, 'ui', 'UserCard.module.css'),
            `.userCard { color: red; } .user { display: block; }`
        );
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe('init', () => {
        it('should create workspace and source file', async () => {
            const presetName = 'init-happy';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);
            expect(existsSync(join(presetDir, 'preset.source.ts'))).toBe(true);
        });

        it('should fail if preset already exists', async () => {
            const presetName = 'init-fail';
            await initReversePreset(presetName, templatesDir);
            await expect(initReversePreset(presetName, templatesDir)).rejects.toThrow('already exists');
        });
    });

    describe('analyze', () => {
        it('should fail if source config is missing', async () => {
            const presetName = 'analyze-missing';
            const presetDir = join(templatesDir, 'preset', presetName);
            await mkdir(presetDir, { recursive: true });
            await expect(analyzeReversePreset(presetName, templatesDir)).rejects.toThrow('source config not found');
        });

        it('should fail if root path does not exist', async () => {
            const presetName = 'analyze-bad-root';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);

            // Mock config pointing to non-existent path
            const sourceConfig: PresetSourceConfig = { root: '/non/existent/path' };
            await writeFile(join(presetDir, 'preset.source.ts'), `export default ${JSON.stringify(sourceConfig)};`);

            await expect(analyzeReversePreset(presetName, templatesDir)).rejects.toThrow('Source root path does not exist');
        });

        it('should fail if neither root nor layers are defined', async () => {
            const presetName = 'analyze-no-root-layers';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);

            // Mock invalid config (empty object) manually to bypass type check
            await writeFile(join(presetDir, 'preset.source.ts'), `export default { options: {} };`);

            await expect(analyzeReversePreset(presetName, templatesDir)).rejects.toThrow('define "root" or "layers"');
        });

        it('should support globalRoot and multiple layers', async () => {
            const presetName = 'analyze-layers';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);

            const globalRoot = '../../../'; // relative to presetDir

            const sourceConfig: PresetSourceConfig = {
                globalRoot: globalRoot,
                layers: [
                    { root: 'etalon/entity/User', targetLayer: 'entity' }
                ]
            };
            await writeFile(join(presetDir, 'preset.source.ts'), `export default ${JSON.stringify(sourceConfig)};`);

            await analyzeReversePreset(presetName, templatesDir);

            const configPath = join(presetDir, 'preset.config.json');
            expect(existsSync(configPath)).toBe(true);
            const config = JSON.parse(await readFile(configPath, 'utf-8'));

            expect(config.files.length).toBeGreaterThan(0);
            expect(config.files[0].targetLayer).toBe('entity');
        });
    });

    describe('build', () => {
        it('should fail if preset.config.json is missing', async () => {
            const presetName = 'build-missing-config';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);
            // We create source.ts but NOT config.json
            const sourceConfig: PresetSourceConfig = { root: etalonDir };
            await writeFile(join(presetDir, 'preset.source.ts'), `export default ${JSON.stringify(sourceConfig)};`);

            await expect(buildReversePreset(presetName, templatesDir)).rejects.toThrow('Missing preset source or config files');
        });

        it('should skip missing source files with warning', async () => {
            const presetName = 'build-skip-missing';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);

            const sourceConfig: PresetSourceConfig = { root: etalonDir };
            await writeFile(join(presetDir, 'preset.source.ts'), `export default ${JSON.stringify(sourceConfig)};`);

            const presetConfig = {
                files: [
                    {
                        path: 'non-existent-file.ts',
                        tokens: {},
                        targetLayer: 'entity'
                    }
                ]
            };
            await writeFile(join(presetDir, 'preset.config.json'), JSON.stringify(presetConfig));

            // Should not throw, just log warning
            await buildReversePreset(presetName, templatesDir);
            // No output file generated for this input
            expect(existsSync(join(presetDir, 'entity', 'non-existent-file.ts'))).toBe(false);
        });

        it('should skip if layer config is missing', async () => {
            const presetName = 'build-skip-layer';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);

            const sourceConfig: PresetSourceConfig = { root: etalonDir };
            await writeFile(join(presetDir, 'preset.source.ts'), `export default ${JSON.stringify(sourceConfig)};`);

            const presetConfig = {
                files: [
                    {
                        path: 'some-file.ts',
                        tokens: {},
                        targetLayer: 'unknown-layer' // This layer doesn't exist in sourceConfig
                    }
                ]
            };
            await writeFile(join(presetDir, 'preset.config.json'), JSON.stringify(presetConfig));

            await buildReversePreset(presetName, templatesDir);
            // Should complete without error
        });

        it('should substitute tokens correctly prioritizing longer matches', async () => {
            const presetName = 'build-priority';
            const presetDir = join(templatesDir, 'preset', presetName);
            // Setup a manual config scenario
            await initReversePreset(presetName, templatesDir);
            const sourceConfig: PresetSourceConfig = { root: etalonDir, targetLayer: 'entity' };
            await writeFile(join(presetDir, 'preset.source.ts'), `export default ${JSON.stringify(sourceConfig)};`);

            // Verify priority: "UserProfile" vs "User"
            const presetConfig = {
                files: [
                    {
                        path: 'model/types.ts',
                        targetLayer: 'entity',
                        tokens: {
                            'User': '{{entityName}}',
                            'UserProfile': '{{entityName}}ProfileCustom'
                        }
                    }
                ]
            };
            await writeFile(join(presetDir, 'preset.config.json'), JSON.stringify(presetConfig));

            await buildReversePreset(presetName, templatesDir);

            const resultPath = join(presetDir, 'entity', 'model', 'types.ts');
            const content = await readFile(resultPath, 'utf-8');

            // "User" -> "{{entityName}}"
            expect(content).toContain('interface {{entityName}} {');
            // "UserProfile" -> "{{entityName}}ProfileCustom"
            expect(content).toContain('interface {{entityName}}ProfileCustom extends');
        });

        it('should support globalRoot during build', async () => {
            const presetName = 'build-global-root';
            const presetDir = join(templatesDir, 'preset', presetName);
            await initReversePreset(presetName, templatesDir);

            const globalRoot = '../../../';
            const sourceConfig: PresetSourceConfig = {
                globalRoot: globalRoot,
                layers: [{ root: 'etalon/entity/User', targetLayer: 'entity' }]
            };
            await writeFile(join(presetDir, 'preset.source.ts'), `export default ${JSON.stringify(sourceConfig)};`);

            const presetConfig = {
                files: [
                    {
                        path: 'ui/UserCard.tsx',
                        targetLayer: 'entity',
                        tokens: { 'User': '{{entityName}}' }
                    }
                ]
            };
            await writeFile(join(presetDir, 'preset.config.json'), JSON.stringify(presetConfig));

            await buildReversePreset(presetName, templatesDir);

            const expectedPath = join(presetDir, 'entity', 'ui', '{{entityName}}Card.tsx');
            expect(existsSync(expectedPath)).toBe(true);
        });
    });
});
