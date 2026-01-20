import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readComponentTemplate, processTemplate } from '../../src/lib/templates/templateLoader.js';
import { TemplateContext } from '../../src/config/types.js';

// Mock fs/promises and jiti
vi.mock('fs/promises', () => ({
    readFile: vi.fn(),
    stat: vi.fn(),
}));

const { mockJiti } = vi.hoisted(() => ({
    mockJiti: {
        import: vi.fn(),
    },
}));

vi.mock('jiti', () => ({
    createJiti: () => mockJiti,
}));

// Mock path and url
vi.mock('url', () => ({
    fileURLToPath: (url: string) => '/mock/path/file.ts',
}));
vi.mock('path', async () => {
    const actual = await vi.importActual('path');
    return {
        ...actual,
        dirname: () => '/mock/path',
        resolve: (...args: string[]) => args.join('/'),
        join: (...args: string[]) => args.join('/'),
    };
});

describe('templateLoader', () => {
    describe('processTemplate', () => {
        it('should replace variables in string content', () => {
            const content = 'Hello {{ name }}!';
            const variables = { name: 'World' };
            const result = processTemplate(content, variables);
            expect(result).toBe('Hello World!');
        });

        it('should execute function content with context', () => {
            const content = (ctx: TemplateContext) => `Hello ${ctx.componentName}`;
            const context = { componentName: 'Button', sliceName: 'ui', layer: 'shared' } as TemplateContext;
            const result = processTemplate(content, context);
            expect(result).toBe('Hello Button');
        });
    });
});
