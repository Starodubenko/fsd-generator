/**
 * Core generator functions for creating FSD components, slices, and blocks.
 * 
 * Orchestrates the creation of directories, files, and barrel updates for individual
 * entities (components, styles, hooks) within a specific layer and slice.
 */
import { mkdir, writeFile } from 'fs/promises';
import { basename } from 'path';
import { FsdPaths } from '../naming/resolvePaths.js';
import { updateBarrel } from '../barrels/updateBarrels.js';
import { loadTemplate, processTemplate } from '../templates/templateLoader.js';
import { DEFAULT_TEMPLATES, DEFAULT_TEMPLATE, FSD_SEGMENTS, FILE_EXTENSIONS, ACTION_TYPES } from '../constants.js';

import { TemplateContext } from '../../config/types.js';
import { loadConfig } from '../config/loadConfig.js';

/**
 * Resolve which template to use for the given layer
 * @returns Object with templatePath and layerArg for template loading
 */
export function resolveTemplateType(
  layer: string,
  templateOverride?: string
): { templatePath: string; layerArg: string } {
  if (templateOverride) {
    return { templatePath: templateOverride, layerArg: '' };
  }

  const templatePath = DEFAULT_TEMPLATES[layer] || DEFAULT_TEMPLATE;
  return { templatePath, layerArg: layer };
}

/**
 * Ensure directory exists
 */
export async function ensureDirectory(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/**
 * Write component file to disk
 */
export async function writeComponentFile(path: string, content: string): Promise<void> {
  await writeFile(path, content);
  console.log(`Created ${path}`);
}

/**
 * Write styles file to disk (only if content is non-empty)
 */
export async function writeStylesFile(path: string, content: string): Promise<void> {
  if (content && content.trim().length > 0) {
    await writeFile(path, content);
    console.log(`Created ${path}`);
  }
}

/**
 * Update barrel files for a generated block
 */
export function updateBarrelsForBlock(
  slicePath: string,
  uiPath: string,
  componentName: string,
  exportName: string,
  type: (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES]
): void {
  updateBarrel(uiPath, componentName, exportName);

  if (type === ACTION_TYPES.COMPONENT || type === ACTION_TYPES.HOOK || type === ACTION_TYPES.STYLES) {
    updateBarrel(slicePath, FSD_SEGMENTS.UI, FSD_SEGMENTS.UI);
  }
}

/**
 * Generate a hook from a template
 */
export async function generateHook(
  paths: FsdPaths,
  context: TemplateContext,
  templatePath: string,
  templatesDir?: string
) {
  const effectiveTemplatesDir = templatesDir || (await loadConfig()).templatesDir;
  const { component: hookTemplate } = await loadTemplate('', templatePath, effectiveTemplatesDir);

  const content = processTemplate(hookTemplate, context);
  const hookFile = `${paths.componentPath}${FILE_EXTENSIONS.TYPESCRIPT}`;

  await ensureDirectory(paths.uiPath);
  await writeFile(hookFile, content);
  console.log(`Created ${hookFile}`);

  updateBarrelsForBlock(paths.slicePath, paths.uiPath, context.componentName, context.componentName, ACTION_TYPES.HOOK);
}

/**
 * Generate styles from a template
 */
export async function generateStyles(
  paths: FsdPaths,
  context: TemplateContext,
  templatePath: string,
  templatesDir?: string
) {
  const effectiveTemplatesDir = templatesDir || (await loadConfig()).templatesDir;
  const { styles: stylesTemplate } = await loadTemplate('', templatePath, effectiveTemplatesDir);

  const content = processTemplate(stylesTemplate, context);
  const stylesFile = `${paths.componentPath}${FILE_EXTENSIONS.STYLES}`;

  await ensureDirectory(paths.uiPath);
  await writeStylesFile(stylesFile, content);

  updateBarrelsForBlock(paths.slicePath, paths.uiPath, context.componentName, context.componentName, ACTION_TYPES.STYLES);
}

/**
 * Generate a component from a template
 * Orchestrates template loading, rendering, and file writing
 */
export async function generateComponent(
  paths: FsdPaths,
  context: TemplateContext,
  templateOverride?: string,
  templatesDir?: string
) {
  // Step 1: Resolve template type
  const { templatePath, layerArg } = resolveTemplateType(context.template.layer, templateOverride);
  console.log(`Using template: ${templateOverride ? templatePath : context.template.layer + '/' + templatePath}`);

  // Step 2: Get templates directory
  const effectiveTemplatesDir = templatesDir || (await loadConfig()).templatesDir;

  // Step 3: Load template
  const { component, styles } = await loadTemplate(layerArg, templatePath, effectiveTemplatesDir);

  // Step 4: Render templates
  const componentContent = processTemplate(component, context);
  const stylesContent = processTemplate(styles, context);

  // Step 5: Write files
  const componentFile = `${paths.componentPath}${FILE_EXTENSIONS.TSX}`;
  const stylesFile = `${paths.componentPath}${FILE_EXTENSIONS.STYLES}`;

  await ensureDirectory(paths.uiPath);
  await writeComponentFile(componentFile, componentContent);
  await writeStylesFile(stylesFile, stylesContent);

  // Step 6: Update barrels
  const exportName = basename(paths.componentPath);
  updateBarrelsForBlock(paths.slicePath, paths.uiPath, context.componentName, exportName, ACTION_TYPES.COMPONENT);
}
