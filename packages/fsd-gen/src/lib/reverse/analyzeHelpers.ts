
import { resolve } from 'path';
import { EntityToken } from './constants.js';

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
        tokens[variations.pascal] = EntityToken.ENTITY_NAME;
    }

    // Only add camel if it differs from pascal (e.g. "User" vs "user")
    if (variations.camel !== variations.pascal && content.includes(variations.camel)) {
        tokens[variations.camel] = EntityToken.ENTITY_NAME_CAMEL;
    }

    if (variations.lower !== variations.camel && variations.lower !== variations.pascal && content.includes(variations.lower)) {
        tokens[variations.lower] = EntityToken.ENTITY_NAME_LOWER;
    }

    if (variations.upper !== variations.pascal && content.includes(variations.upper)) {
        tokens[variations.upper] = EntityToken.ENTITY_NAME_UPPER;
    }

    if (variations.kebab !== variations.camel && content.includes(variations.kebab)) {
        tokens[variations.kebab] = EntityToken.ENTITY_NAME_KEBAB;
    }

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
