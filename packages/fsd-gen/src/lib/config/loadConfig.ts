import { join } from 'path';
import { existsSync } from 'fs';
import { createJiti } from 'jiti';
import { FsdGenConfig, defaultConfig } from '../../config/types.js';

export async function loadConfig(cwd: string = process.cwd()): Promise<FsdGenConfig> {
    const configPath = join(cwd, 'fsdgen.config.ts');

    if (!existsSync(configPath)) {
        return defaultConfig;
    }

    try {
        const jiti = createJiti(import.meta.url);
        const imported = await jiti.import(configPath, { default: true }) as FsdGenConfig;

        return {
            ...defaultConfig,
            ...imported,
        };
    } catch (error) {
        console.error('Failed to load config:', error);
        return defaultConfig;
    }
}
