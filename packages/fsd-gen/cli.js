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
    .argument('[layer]', 'Layer (entity, feature, widget, page, shared)')
    .argument('[slice]', 'Slice name (or path for shared)')
    .argument('[name]', 'Component name (optional for some layers)')
    .action(async (layer, slice, name) => {
        try {
            if (!layer || !slice) {
                const inquirer = (await import('inquirer')).default;
                const questions = [];

                if (!layer) {
                    questions.push({
                        type: 'list',
                        name: 'layer',
                        message: 'Select FSD layer:',
                        choices: ['entity', 'feature', 'widget', 'page', 'shared']
                    });
                }

                if (!slice) {
                    questions.push({
                        type: 'input',
                        name: 'slice',
                        message: 'Enter slice name (e.g. User):',
                        validate: input => input ? true : 'Slice name is required'
                    });
                }

                const answers = await inquirer.prompt(questions);
                layer = layer || answers.layer;
                slice = slice || answers.slice;
            }

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
            const derivedName = name || basename(slice);
            const componentName = toPascalCase(derivedName);

            if (!validation.config || !validation.config.rootDir) {
                throw new Error('Invalid config: rootDir missing');
            }

            const paths = resolveFsdPaths(validation.config.rootDir, layer, slice, componentName);

            console.log('Paths:', JSON.stringify(paths, null, 2));

            const { generateComponent } = await import('./dist/lib/generators/generate.js');
            const { createPresetHelpers } = await import('./dist/lib/helpers/presetHelpers.js');
            const helpers = createPresetHelpers(slice, config);

            await generateComponent(paths, {
                ...helpers,
                componentName,
                sliceName: slice,
                layer,
                template: {
                    componentName,
                    sliceName: slice,
                    layer
                }
            });
        } catch (error) {
            console.error('Generation failed:', error);
            process.exit(1);
        }
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


program
    .command('reverse:init')
    .argument('[presetName]', 'Name of the new preset to initialize')
    .option('-m, --mode <mode>', 'preset mode (short, ejected)', 'ejected')
    .description('Initialize a workspace for reverse-engineering a preset')
    .action(async (presetName, options) => {
        try {
            const { loadConfig } = await import('./dist/lib/config/loadConfig.js');
            const config = await loadConfig();

            if (!presetName) {
                const inquirer = (await import('inquirer')).default;
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'presetName',
                        message: 'Enter the name for the new preset:',
                        validate: input => input ? true : 'Preset name is required'
                    }
                ]);
                presetName = answers.presetName;
            }

            const { initReversePreset } = await import('./dist/lib/reverse/init.js');
            await initReversePreset(presetName, config.templatesDir, options.mode);
        } catch (error) {
            console.error('Init failed:', error);
            process.exit(1);
        }
    });


program
    .command('reverse:analyze')
    .argument('[presetName]', 'Name of the preset to analyze')
    .description('Analyze the source code and generate a preset configuration')
    .action(async (presetName) => {
        try {
            const { loadConfig } = await import('./dist/lib/config/loadConfig.js');
            const config = await loadConfig();

            if (!presetName) {
                const inquirer = (await import('inquirer')).default;
                const { listPresets } = await import('./dist/lib/templates/templateLoader.js');
                const availablePresets = await listPresets(config.templatesDir);

                if (availablePresets.length === 0) {
                    console.error('No presets found. Run "fsd-gen reverse:init <name>" first.');
                    process.exit(1);
                }

                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'presetName',
                        message: 'Select a preset to analyze:',
                        choices: availablePresets
                    }
                ]);
                presetName = answers.presetName;
            }

            const { analyzeReversePreset } = await import('./dist/lib/reverse/analyze.js');
            await analyzeReversePreset(presetName, config.templatesDir);
        } catch (error) {
            console.error('Analysis failed:', error);
            process.exit(1);
        }
    });


program
    .command('reverse:build')
    .argument('[presetName]', 'Name of the preset to build')
    .option('-m, --mode <mode>', 'preset mode (short, ejected)')
    .description('Generate the final preset templates from configuration')
    .action(async (presetName, options) => {
        try {
            const { loadConfig } = await import('./dist/lib/config/loadConfig.js');
            const config = await loadConfig();

            if (!presetName) {
                const inquirer = (await import('inquirer')).default;
                const { listPresets } = await import('./dist/lib/templates/templateLoader.js');
                const availablePresets = await listPresets(config.templatesDir);

                if (availablePresets.length === 0) {
                    console.error('No presets found.');
                    process.exit(1);
                }

                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'presetName',
                        message: 'Select a preset to build:',
                        choices: availablePresets
                    }
                ]);
                presetName = answers.presetName;
            }

            const { buildReversePreset } = await import('./dist/lib/reverse/build.js');
            await buildReversePreset(presetName, config.templatesDir, options.mode);
        } catch (error) {
            console.error('Build failed:', error);
            process.exit(1);
        }
    });

async function runInteractiveMenu() {
    const inquirer = (await import('inquirer')).default;
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                { name: 'Generate a new FSD slice or component', value: 'generate' },
                { name: 'Generate a full vertical slice using a preset', value: 'preset' },
                { name: 'Initialize a new reverse-engineered preset', value: 'reverse:init' },
                { name: 'Analyze source code for a preset', value: 'reverse:analyze' },
                { name: 'Build templates for a reverse preset', value: 'reverse:build' },
                { name: 'Exit', value: 'exit' }
            ]
        }
    ]);

    if (action === 'exit') {
        process.exit(0);
    }

    // Call the corresponding command action by parsing fake argv
    program.parse(['node', 'cli.js', action]);
}

if (process.argv.length <= 2) {
    runInteractiveMenu();
} else {
    program.parse();
}
