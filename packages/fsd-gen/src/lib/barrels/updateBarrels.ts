/**
 * Utility functions for updating barrel (index.ts) files.
 * 
 * Ensures that newly generated slices, segments, or components are automatically
 * exported from their parent directories, maintaining clean import paths compliant
 * with Feature-Sliced Design public API capability.
 */
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { FILE_EXTENSIONS } from '../constants.js';

export function updateBarrel(directory: string, exportName: string, exportPath: string) {
    const indexFile = join(directory, FILE_EXTENSIONS.INDEX);
    let content = '';

    if (existsSync(indexFile)) {
        content = readFileSync(indexFile, 'utf-8');
    }

    // Check if export already exists
    const exportStatement = `export * from './${exportPath}';`;

    // Prevent index from exporting itself
    if (exportPath === 'index') {
        return;
    }

    // A more precise check for the exact export statement
    if (content.includes(exportStatement)) {
        return;
    }

    const newContent = content + (content.endsWith('\n') || content === '' ? '' : '\n') + exportStatement + '\n';
    writeFileSync(indexFile, newContent);
    console.log(`Updated ${indexFile}`);
}
