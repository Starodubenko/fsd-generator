export function toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, '').toUpperCase());
}

export function toCamelCase(str: string): string {
    return str.replace(/-\w/g, (clear) => clear[1].toUpperCase());
}

export function toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
