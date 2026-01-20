import type { GeneratorContext } from '@starodubenko/fsd-gen';

export default (ctx: GeneratorContext) => {
  const {
    base: { baseName },
    template: { componentName },
    layer: {
      widget: { importPath: widgetImportPath, slice: widgetSlice }
    }
  } = ctx;

  return `
import styled from '@emotion/styled';
import { ${widgetSlice} } from '${widgetImportPath}/ui';

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
      <${widgetSlice} />
    </PageWrapper>
  );
};
`;
};
