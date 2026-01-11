import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateBarrel } from '../../../src/lib/barrels/updateBarrels.js';
import fs from 'fs';

vi.mock('fs');

describe('updateBarrel', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should create index file if it does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        updateBarrel('/dir', 'Comp', 'Comp');

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('index.ts'),
            expect.stringContaining("export * from './Comp';")
        );
    });

    it('should append to existing index file', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue("export * from './Old';\n");

        updateBarrel('/dir', 'New', 'New');

        const call = vi.mocked(fs.writeFileSync).mock.calls[0];
        expect(call[1]).toContain("export * from './Old';");
        expect(call[1]).toContain("export * from './New';");
    });

    it('should add newline if existing content does not end with one', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue("export * from './Old'");

        updateBarrel('/dir', 'New', 'New');

        const call = vi.mocked(fs.writeFileSync).mock.calls[0];
        expect(call[1]).toBe("export * from './Old'\nexport * from './New';\n");
    });

    it('should skip if export already exists', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue("export * from './Comp';");

        updateBarrel('/dir', 'Comp', 'Comp');

        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
});
