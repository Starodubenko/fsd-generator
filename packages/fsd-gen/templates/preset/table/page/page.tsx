import type { GeneratorContext } from '../../../../src/config/types.js';

export default (ctx: GeneratorContext) => {
  const {
      base: { baseName },
      template: { componentName },
      layer: {
          widget: { importPath: widgetImportPath, slice: widgetSlice }
      }
  } = ctx;

  // Ideally the widget name would be dynamic, but in this specific preset it's often Table
  // However, the componentName here is the Page component name (e.g. UserPage)
  // The widget slice/component might be UserTable.
  
  // We need the widget component name. 
  // In the 'table' preset, the widget is typically `${baseName}Table`.
  const widgetComponent = `${baseName}Table`;

  return `
import styled from '@emotion/styled';
import { ${widgetComponent} } from '${widgetImportPath}';

const PageWrapper = styled.div\`
  padding: 2rem;
\`;

const Title = styled.h1\`
  margin-bottom: 2rem;
\`;

export const ${componentName} = () => {
  return (
    <PageWrapper>
      <Title>${baseName} Management</Title>
      <${widgetComponent} />
    </PageWrapper>
  );
};
`;
};
