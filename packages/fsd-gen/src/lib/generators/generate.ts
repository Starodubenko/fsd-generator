import { mkdir, writeFile } from 'fs/promises';
import { dirname, basename } from 'path';
import { FsdPaths } from '../naming/resolvePaths.js';
import { updateBarrel } from '../barrels/updateBarrels.js';
import { loadTemplate, processTemplate } from '../templates/templateLoader.js';
import { DEFAULT_TEMPLATES, DEFAULT_TEMPLATE, FSD_SEGMENTS, FILE_EXTENSIONS } from '../constants.js';

export interface TemplateContext {
  componentName: string;
  sliceName: string;
  layer: string;
}

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
 * Update barrel files for the component
 */
export function updateBarrelsForComponent(paths: FsdPaths, context: TemplateContext): void {
  const exportName = basename(paths.componentPath);
  updateBarrel(paths.uiPath, context.componentName, exportName);
  updateBarrel(paths.slicePath, FSD_SEGMENTS.UI, FSD_SEGMENTS.UI);
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
  const { templatePath, layerArg } = resolveTemplateType(context.layer, templateOverride);
  console.log(`Using template: ${templateOverride ? templatePath : context.layer + '/' + templatePath}`);

  // Step 2: Get templates directory
  let effectiveTemplatesDir = templatesDir;
  if (!effectiveTemplatesDir) {
    const config = await loadConfig();
    effectiveTemplatesDir = config.templatesDir;
  }

  // Step 3: Load template
  const { component, styles } = await loadTemplate(layerArg, templatePath, effectiveTemplatesDir);

  // Step 4: Prepare variables
  const variables = {
    ...context,
    componentName: context.componentName,
  };

  // Step 5: Render templates
  const componentContent = processTemplate(component, variables);
  const stylesContent = processTemplate(styles, variables);

  // Step 6: Write files
  const componentFile = `${paths.componentPath}${FILE_EXTENSIONS.TSX}`;
  const stylesFile = `${paths.componentPath}${FILE_EXTENSIONS.STYLES}`;

  await ensureDirectory(paths.uiPath);
  await writeComponentFile(componentFile, componentContent);
  await writeStylesFile(stylesFile, stylesContent);

  // Step 7: Update barrels
  updateBarrelsForComponent(paths, context);
}
