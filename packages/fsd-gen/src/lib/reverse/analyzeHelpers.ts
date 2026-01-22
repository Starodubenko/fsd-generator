

import { resolve } from 'path';
import { EntityToken } from './constants.js';

/**
 * Converts a string to PascalCase.
 * Handles kebab-case, snake_case, camelCase, and space-separated strings.
 * Examples:
 *   "user-action" -> "UserAction"
 *   "user_profile" -> "UserProfile"
 *   "user action" -> "UserAction"
 *   "userAction" -> "UserAction"
 */
export function toPascalCase(str: string): string {
    // First, split by common delimiters (hyphens, underscores, spaces)
    const words = str.split(/[-_\s]+/);

    // If we got multiple words, capitalize each
    if (words.length > 1) {
        return words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    // If single word, just ensure first letter is uppercase
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simple pluralization - adds 's' or handles common patterns
 * Examples: User -> Users, Category -> Categories, Box -> Boxes
 */
export function pluralize(word: string): string {
    if (!word) return word;

    // Check for special endings that need 'es' FIRST (like 'ss', 'x', 'ch', 'sh')
    if (word.endsWith('ss') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
        return word + 'es'; // Class -> Classes, Box -> Boxes, Batch -> Batches
    }

    // Already plural (ends with 's' but not 'ss')
    if (word.endsWith('s')) return word;

    // Common patterns
    if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2]?.toLowerCase())) {
        return word.slice(0, -1) + 'ies'; // Category -> Categories
    }

    return word + 's'; // User -> Users
}

/**
 * Simple singularization - removes 's' or handles common patterns
 * Examples: Users -> User, Categories -> Category, Boxes -> Box
 */
export function singularize(word: string): string {
    if (!word) return word;

    // Common patterns
    if (word.endsWith('ies')) {
        if (word.length > 4) {
            return word.slice(0, -3) + 'y'; // Categories -> Category
        }
        // Short words like 'Ties' -> 'Tie' (remove 's') or handle as special
    }

    if (word.endsWith('xes') || word.endsWith('ches') || word.endsWith('shes') || word.endsWith('sses')) {
        return word.slice(0, -2); // Boxes -> Box, Batches -> Batch
    }

    if (word.endsWith('s') && !word.endsWith('ss')) {
        return word.slice(0, -1); // Users -> User
    }

    return word; // Already singular or special case
}

/**
 * Generates naming variations for a given subject string.
 * Now includes plural and singular forms.
 */
export function generateVariations(subject: string) {
    const pascal = subject.charAt(0).toUpperCase() + subject.slice(1);
    const camel = subject.charAt(0).toLowerCase() + subject.slice(1);
    const lower = subject.toLowerCase();
    const upper = subject.toUpperCase();

    // Simple kebab conversion (UserProfile -> user-profile)
    const kebab = camel.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

    // Generate plural and singular forms
    const plural = pluralize(pascal);
    const singular = singularize(pascal);

    const pluralCamel = plural.charAt(0).toLowerCase() + plural.slice(1);
    const pluralLower = plural.toLowerCase();
    const pluralUpper = plural.toUpperCase();
    const pluralKebab = pluralCamel.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

    const singularCamel = singular.charAt(0).toLowerCase() + singular.slice(1);
    const singularLower = singular.toLowerCase();
    const singularUpper = singular.toUpperCase();
    const singularKebab = singularCamel.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

    return {
        pascal, camel, lower, upper, kebab,
        plural, pluralCamel, pluralLower, pluralUpper, pluralKebab,
        singular, singularCamel, singularLower, singularUpper, singularKebab
    };
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

    // Add plural variations if different from original
    if (variations.plural !== variations.pascal && content.includes(variations.plural)) {
        tokens[variations.plural] = EntityToken.ENTITY_NAME;
    }
    if (variations.pluralCamel !== variations.camel && content.includes(variations.pluralCamel)) {
        tokens[variations.pluralCamel] = EntityToken.ENTITY_NAME_CAMEL;
    }
    if (variations.pluralLower !== variations.lower && content.includes(variations.pluralLower)) {
        tokens[variations.pluralLower] = EntityToken.ENTITY_NAME_LOWER;
    }
    if (variations.pluralUpper !== variations.upper && content.includes(variations.pluralUpper)) {
        tokens[variations.pluralUpper] = EntityToken.ENTITY_NAME_UPPER;
    }
    if (variations.pluralKebab !== variations.kebab && content.includes(variations.pluralKebab)) {
        tokens[variations.pluralKebab] = EntityToken.ENTITY_NAME_KEBAB;
    }

    // Add singular variations if different from original and plural
    if (variations.singular !== variations.pascal && variations.singular !== variations.plural && content.includes(variations.singular)) {
        tokens[variations.singular] = EntityToken.ENTITY_NAME;
    }
    if (variations.singularCamel !== variations.camel && variations.singularCamel !== variations.pluralCamel && content.includes(variations.singularCamel)) {
        tokens[variations.singularCamel] = EntityToken.ENTITY_NAME_CAMEL;
    }
    if (variations.singularLower !== variations.lower && variations.singularLower !== variations.pluralLower && content.includes(variations.singularLower)) {
        tokens[variations.singularLower] = EntityToken.ENTITY_NAME_LOWER;
    }
    if (variations.singularUpper !== variations.upper && variations.singularUpper !== variations.pluralUpper && content.includes(variations.singularUpper)) {
        tokens[variations.singularUpper] = EntityToken.ENTITY_NAME_UPPER;
    }
    if (variations.singularKebab !== variations.kebab && variations.singularKebab !== variations.pluralKebab && content.includes(variations.singularKebab)) {
        tokens[variations.singularKebab] = EntityToken.ENTITY_NAME_KEBAB;
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
