#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

const program = new Command();

program
    .name('fsd-gen')
    .description(pkg.description || 'FSD Component Generator')
    .version(pkg.version);

program
    .command('generate')
    .alias('g')
    .description('Generate a new FSD slice or component')
    .argument('<layer>', 'Layer (entity, feature, widget, page, shared)')
    .argument('<slice>', 'Slice name (or path for shared)')
    .argument('[name]', 'Component name (optional for some layers)')
    .action(async (layer, slice, name) => {
        const { loadConfig } = await import('./dist/lib/config/loadConfig.js');
        const { validateConfig } = await import('./dist/lib/config/validateConfig.js');

        console.log('Loading configuration...');
        const config = await loadConfig();

        const validation = validateConfig(config);
        if (!validation.valid) {
            console.error('Invalid configuration:', validation.error);
            process.exit(1);
        }

        console.log(`Generating ${layer}/${slice}/${name || ''}...`);

        const { resolveFsdPaths } = await import('./dist/lib/naming/resolvePaths.js');
        const { toPascalCase } = await import('./dist/lib/naming/names.js');
        const { basename } = await import('path');

        // If name is provided, use it.
        // If not, derive from slice.
        // If slice contains slashes (e.g. shared/ui/Button), take basename (Button).
        const derivedName = name || basename(slice);
        const componentName = toPascalCase(derivedName);

        if (!validation.config || !validation.config.rootDir) {
            throw new Error('Invalid config: rootDir missing');
        }

        const paths = resolveFsdPaths(validation.config.rootDir, layer, slice, componentName);

        console.log('Paths:', JSON.stringify(paths, null, 2));

        const { generateComponent } = await import('./dist/lib/generators/generate.js');
        await generateComponent(paths, { componentName, sliceName: slice, layer });
    });

program
    .command('preset')
    .argument('[presetName]', 'Name of the preset (e.g. table)')
    .argument('[name]', 'Name of the entity/feature/etc')
    .description('Generate a full vertical slice using a preset')
    .action(async (presetName, name) => {
        try {
            // Load config to get templatesDir
            const { loadConfig } = await import('./dist/lib/config/loadConfig.js');
            const config = await loadConfig();

            if (!presetName || !name) {
                const inquirer = (await import('inquirer')).default;
                const { listPresets } = await import('./dist/lib/templates/templateLoader.js');

                const availablePresets = await listPresets(config.templatesDir);

                const questions = [];

                if (!presetName) {
                    questions.push({
                        type: 'list',
                        name: 'presetName',
                        message: 'Select a preset:',
                        choices: availablePresets.length > 0 ? availablePresets : ['table']
                    });
                }

                if (!name) {
                    questions.push({
                        type: 'input',
                        name: 'name',
                        message: 'Enter the name (e.g. User):',
                        validate: input => input ? true : 'Name is required'
                    });
                }

                const answers = await inquirer.prompt(questions);
                presetName = presetName || answers.presetName;
                name = name || answers.name;
            }

            const { generatePreset } = await import('./dist/lib/generators/generatePreset.js');
            await generatePreset(presetName, name);
        } catch (error) {
            console.error('Preset generation failed:', error);
            process.exit(1);
        }
    });

program.parse();
