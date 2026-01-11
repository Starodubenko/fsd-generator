/**
 * Naming utility functions.
 * 
 * Provides standard functions for string manipulation, such as converting strings
 * to PascalCase for component names or handling other case conversions required by FSD.
 */
export function toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, '').toUpperCase());
}

export function toCamelCase(str: string): string {
    return str.replace(/-\w/g, (clear) => clear[1].toUpperCase());
}

export function toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
