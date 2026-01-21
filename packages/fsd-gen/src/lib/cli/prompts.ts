
import inquirer from 'inquirer';
import { listPresets } from '../templates/templateLoader.js';

/**
 * Prompts the user to select an FSD layer
 */
export async function promptLayer(): Promise<string> {
    const { layer } = await inquirer.prompt([
        {
            type: 'list',
            name: 'layer',
            message: 'Select FSD layer:',
            choices: ['entity', 'feature', 'widget', 'page', 'shared']
        }
    ]);
    return layer;
}

/**
 * Prompts the user to enter a slice name
 */
export async function promptSlice(): Promise<string> {
    const { slice } = await inquirer.prompt([
        {
            type: 'input',
            name: 'slice',
            message: 'Enter slice name (e.g. User):',
            validate: (input: string) => input ? true : 'Slice name is required'
        }
    ]);
    return slice;
}

/**
 * Prompts the user to select an available preset
 */
export async function promptPresetName(templatesDir?: string): Promise<string> {
    const availablePresets = await listPresets(templatesDir);
    const { presetName } = await inquirer.prompt([
        {
            type: 'list',
            name: 'presetName',
            message: 'Select a preset:',
            choices: availablePresets.length > 0 ? availablePresets : ['table']
        }
    ]);
    return presetName;
}

/**
 * Prompts the user to enter a name for a preset or entity
 */
export async function promptName(message: string = 'Enter the name (e.g. User):'): Promise<string> {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message,
            validate: (input: string) => input ? true : 'Name is required'
        }
    ]);
    return name;
}

/**
 * Prompts for a general interactive action
 */
export async function promptMainAction(): Promise<string> {
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
    return action;
}
