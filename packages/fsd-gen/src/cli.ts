#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
    handleGenerate,
    handlePreset,
    handleReverseInit,
    handleReverseAnalyze,
    handleReverseBuild
} from './lib/cli/handlers.js';
import { promptMainAction } from './lib/cli/prompts.js';

interface PackageJson {
    version: string;
    description?: string;
}

interface ReverseOptions {
    mode?: 'short' | 'ejected';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In source, package.json is one level up from src/ (at the package root)
const pkgPath = join(__dirname, '..', 'package.json');
const pkg: PackageJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));

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
    .action(async (layer: string | undefined, slice: string | undefined, name: string | undefined) => {
        try {
            await handleGenerate(layer, slice, name);
        } catch (error: any) {
            console.error(error.message || error);
            process.exit(1);
        }
    });

program
    .command('preset')
    .argument('[presetName]', 'Name of the preset (e.g. table)')
    .argument('[name]', 'Name of the entity/feature/etc')
    .description('Generate a full vertical slice using a preset')
    .action(async (presetName: string | undefined, name: string | undefined) => {
        try {
            await handlePreset(presetName, name);
        } catch (error: any) {
            console.error(error.message || error);
            process.exit(1);
        }
    });

program
    .command('reverse:init')
    .argument('[presetName]', 'Name of the new preset to initialize')
    .option('-m, --mode <mode>', 'preset mode (short, ejected)', 'ejected')
    .description('Initialize a workspace for reverse-engineering a preset')
    .action(async (presetName: string | undefined, options: ReverseOptions) => {
        try {
            await handleReverseInit(presetName, options);
        } catch (error: any) {
            console.error(error.message || error);
            process.exit(1);
        }
    });

program
    .command('reverse:analyze')
    .argument('[presetName]', 'Name of the preset to analyze')
    .description('Analyze the source code and generate a preset configuration')
    .action(async (presetName: string | undefined) => {
        try {
            await handleReverseAnalyze(presetName);
        } catch (error: any) {
            console.error(error.message || error);
            process.exit(1);
        }
    });

program
    .command('reverse:build')
    .argument('[presetName]', 'Name of the preset to build')
    .option('-m, --mode <mode>', 'preset mode (short, ejected)')
    .description('Generate the final preset templates from configuration')
    .action(async (presetName: string | undefined, options: ReverseOptions) => {
        try {
            await handleReverseBuild(presetName, options);
        } catch (error: any) {
            console.error(error.message || error);
            process.exit(1);
        }
    });

async function runInteractiveMenu(): Promise<void> {
    const action = await promptMainAction();

    if (action === 'exit') {
        process.exit(0);
    }

    // Pass the selected action as a command
    program.parse(['node', 'cli.js', action]);
}

if (process.argv.length <= 2) {
    runInteractiveMenu().catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });
} else {
    program.parse();
}
