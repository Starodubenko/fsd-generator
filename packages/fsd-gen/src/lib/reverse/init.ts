
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function initReversePreset(presetName: string, templatesDir: string, mode: 'short' | 'ejected' = 'ejected') {
    const presetDir = join(templatesDir, 'preset', presetName);

    if (existsSync(presetDir)) {
        throw new Error(`Preset "${presetName}" already exists at ${presetDir}`);
    }

    await mkdir(presetDir, { recursive: true });

    const sourceConfigContent = `import type { PresetSourceConfig } from '@starodubenko/fsd-gen';

const config: PresetSourceConfig = {
    // The root of the reference code (etalon)
    // Example: '../../src/entities/User'
    root: '../../src/entities/YourEntity',
    
    mode: '${mode}',

    options: {
        language: 'typescript'
    }
};

export default config;
`;

    const sourcePath = join(presetDir, 'preset.source.ts');
    await writeFile(sourcePath, sourceConfigContent, 'utf-8');

    console.log(`Created new preset workspace at: ${presetDir}`);
    console.log(`Please edit ${sourcePath} to point to your reference code.`);
}
