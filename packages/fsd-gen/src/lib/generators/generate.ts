import { mkdir, writeFile } from 'fs/promises';
import { dirname, basename } from 'path';
import { FsdPaths } from '../naming/resolvePaths.js';
import { updateBarrel } from '../barrels/updateBarrels.js';
import { loadTemplate, processTemplate } from '../templates/templateLoader.js';

export interface TemplateContext {
  componentName: string;
  sliceName: string;
  layer: string;
}

export async function generateComponent(
  paths: FsdPaths,
  context: TemplateContext,
  templateOverride?: string
) {
  // Determine template type based on layer
  const defaultTemplates: Record<string, string> = {
    shared: 'ui-basic',
    entity: 'model-ui-basic',
    feature: 'ui-model-basic',
    widget: 'ui-basic',
    page: 'ui-basic',
  };

  // If templateOverride is provided (e.g. 'preset/table/entity/model'), use it directly.
  // Otherwise resolve standard template.
  const templatePath = templateOverride || defaultTemplates[context.layer] || 'ui-basic';
  const layerArg = templateOverride ? '' : context.layer;

  console.log(`Using template: ${templateOverride ? templatePath : context.layer + '/' + templatePath}`);

  const { component, styles } = await loadTemplate(layerArg, templatePath);

  const variables = {
    ...context,
    componentName: context.componentName,
  };

  const componentContent = processTemplate(component, variables);
  const stylesContent = processTemplate(styles, variables);

  const componentFile = `${paths.componentPath}.tsx`;
  const stylesFile = `${paths.componentPath}.styles.ts`;

  await ensureDir(paths.uiPath);
  await writeFile(componentFile, componentContent);

  if (stylesContent && stylesContent.trim().length > 0) {
    await writeFile(stylesFile, stylesContent);
    console.log(`Created ${stylesFile}`);
  }
  console.log(`Created ${componentFile}`);

  // Update barrels
  // Update barrels
  const exportName = basename(paths.componentPath);
  updateBarrel(paths.uiPath, context.componentName, exportName);
  updateBarrel(paths.slicePath, 'ui', 'ui');
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}
