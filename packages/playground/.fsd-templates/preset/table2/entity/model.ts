import { TemplateContext } from '@starodubenko/fsd-gen';

export default (ctx: TemplateContext) => `
export interface ${ctx.componentName} {
    id: string;
    name: string;
}

export const mock${ctx.componentName}Data: ${ctx.componentName}[] = [
    { id: '1', name: 'Test ${ctx.componentName} 1' },
    { id: '2', name: 'Test ${ctx.componentName} 2' },
];
`;
