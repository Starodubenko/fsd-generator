import { join, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export function updateBarrel(directory: string, exportName: string, exportPath: string) {
    const indexFile = join(directory, 'index.ts');
    let content = '';

    if (existsSync(indexFile)) {
        content = readFileSync(indexFile, 'utf-8');
    }

    // Check if export already exists
    const exportStatement = `export * from './${exportPath}';`;
    // Or named export: export { Name } from './Path';
    // Spec says: "Автообновление barrel-файлов ... создаёт index.ts, добавляет export, не дублирует"

    // A simple heuristic: check if the string exists.
    if (content.includes(exportPath)) {
        return;
    }

    const newContent = content + (content.endsWith('\n') || content === '' ? '' : '\n') + exportStatement + '\n';
    writeFileSync(indexFile, newContent);
    console.log(`Updated ${indexFile}`);
}
