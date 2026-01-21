
import { resolve } from 'path';

/**
 * Generates naming variations for a given subject string
 */
export function generateVariations(subject: string) {
    const pascal = subject.charAt(0).toUpperCase() + subject.slice(1);
    const camel = subject.charAt(0).toLowerCase() + subject.slice(1);
    const lower = subject.toLowerCase();
    const upper = subject.toUpperCase();

    // Simple kebab conversion (UserProfile -> user-profile)
    const kebab = camel.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

    return { pascal, camel, lower, upper, kebab };
}

/**
 * Identifies potential tokens in content based on variations
 */
export function identifyTokens(content: string, variations: ReturnType<typeof generateVariations>): Record<string, string> {
    const tokens: Record<string, string> = {};

    if (content.includes(variations.pascal)) {
        tokens[variations.pascal] = '{{entityName}}';
    }

    // Only add camel if it differs from pascal (e.g. "User" vs "user" - wait, User/User is same)
    if (variations.camel !== variations.pascal && content.includes(variations.camel)) {
        tokens[variations.camel] = '{{entityNameCamel}}';
    }

    // We can add more variations here if needed (kebab, upper, etc.)
    return tokens;
}

/**
 * Resolves the absolute source root path
 */
export function resolveSourceRoot(presetDir: string, globalRoot?: string, layerRoot: string = ''): string {
    let basePath = presetDir;
    if (globalRoot) {
        basePath = resolve(presetDir, globalRoot);
    }
    return resolve(basePath, layerRoot);
}
