/**
 * Configuration validation logic.
 * 
 * Uses Zod schemas to ensure the loaded configuration meets the required
 * structure and constraints before the generator proceeds.
 */
import { FsdGenConfig } from '../../config/types.js';
import { z } from 'zod';

const configSchema = z.object({
    rootDir: z.string().optional(),
    aliases: z.record(z.string(), z.string()).optional(),
    naming: z.enum(['error', 'warn', 'autoFix']).optional(),
});

export function validateConfig(config: unknown): { valid: boolean; error?: string; config?: FsdGenConfig } {
    const result = configSchema.safeParse(config);

    if (!result.success) {
        return {
            valid: false,
            error: result.error.message
        };
    }

    return {
        valid: true,
        config: result.data as FsdGenConfig
    };
}
