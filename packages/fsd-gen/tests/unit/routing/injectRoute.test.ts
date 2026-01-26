import { describe, it, expect, vi, beforeEach } from 'vitest';
import { injectRoute } from '../../../src/lib/routing/injectRoute.js';
import { readFile, writeFile } from 'node:fs/promises';
import { ROUTING } from '../../../src/lib/constants.js';

vi.mock('fs/promises');

describe('injectRoute', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should inject a route and import into App.tsx', async () => {
        const content = `import { Other } from './Other';\n<Routes>\n  ${ROUTING.MARKER}\n</Routes>`;
        vi.mocked(readFile).mockResolvedValue(content);

        await injectRoute({
            targetDir: 'src',
            path: '/test',
            componentName: 'TestPage',
            importPath: '@pages/TestPage'
        });

        expect(writeFile).toHaveBeenCalled();
        const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
        expect(writtenContent).toContain(`import { TestPage } from '@pages/TestPage';`);
        expect(writtenContent).toContain('<Route path="/test" element={<TestPage />} />');
    });

    it('should skip if route already exists', async () => {
        const content = `import { Home } from './Home';\n<Routes>\n  <Route path="/test" element={<Home />} />\n  ${ROUTING.MARKER}\n</Routes>`;
        vi.mocked(readFile).mockResolvedValue(content);
        const spy = vi.spyOn(console, 'log').mockImplementation(() => { });

        await injectRoute({ targetDir: 'src', path: '/test', componentName: 'Test', importPath: '@pages/Test' });

        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Route for path "/test" already exists'));
        expect(writeFile).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should skip if import already exists', async () => {
        const content = `import { Test } from '@pages/Test';\n${ROUTING.MARKER}`;
        vi.mocked(readFile).mockResolvedValue(content);
        const spy = vi.spyOn(console, 'log').mockImplementation(() => { });

        await injectRoute({ targetDir: 'src', path: '/new', componentName: 'Test', importPath: '@pages/Test' });

        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Import for Test already exists'));
        expect(writeFile).toHaveBeenCalled(); // Still injects the route
        spy.mockRestore();
    });

    it('should handle file with no imports', async () => {
        const content = `${ROUTING.MARKER}`;
        vi.mocked(readFile).mockResolvedValue(content);

        await injectRoute({ targetDir: 'src', path: '/test', componentName: 'Test', importPath: '@pages/Test' });

        expect(writeFile).toHaveBeenCalled();
        const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
        expect(writtenContent).not.toContain('import'); // No import added if no place to insert
    });

    it('should warn if marker is missing', async () => {
        vi.mocked(readFile).mockResolvedValue('no marker here');
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        await injectRoute({ targetDir: 'src', path: '/test', componentName: 'Test', importPath: '@pages/Test' });

        expect(spy).toHaveBeenCalledWith(expect.stringContaining('comment not found in src/App.tsx'));
        expect(writeFile).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should handle ENOENT and warn', async () => {
        vi.mocked(readFile).mockRejectedValue({ code: 'ENOENT' });
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        await injectRoute({ targetDir: 'src', path: '/test', componentName: 'Test', importPath: '@pages/Test' });

        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Routing target file not found: src/App.tsx'));
        spy.mockRestore();
    });

    it('should throw other errors', async () => {
        vi.mocked(readFile).mockRejectedValue(new Error('boom'));
        await expect(injectRoute({ targetDir: 'src', path: '/t', componentName: 'C', importPath: 'I' })).rejects.toThrow('boom');
    });
});
