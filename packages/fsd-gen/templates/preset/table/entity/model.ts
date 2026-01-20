import type { GeneratorContext } from '../../../../src/config/types.js';

export default (ctx: GeneratorContext) => {
    const { base: { baseName } } = ctx;
    return `export interface ${baseName} {
    id: string;
    name: string;
}

export const mock${baseName}Data: ${baseName}[] = [
    { id: '1', name: 'Test ${baseName} 1' },
    { id: '2', name: 'Test ${baseName} 2' },
];
`;
};
