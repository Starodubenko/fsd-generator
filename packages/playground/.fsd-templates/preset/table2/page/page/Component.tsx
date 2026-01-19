import { TemplateContext } from '@starodubenko/fsd-gen';

export default (ctx: TemplateContext) => `
import styled from '@emotion/styled';
import { ${ctx.widgetSlice} } from '${ctx.widgetImportPath}/ui/';

const PageWrapper = styled.div\`
  padding: 2rem;
\`;

const Title = styled.h1\`
  margin-bottom: 2rem;
\`;

export const ${ctx.componentName} = () => {
  return (
    <PageWrapper>
      <Title>${ctx.baseName} Management</Title>
      <${ctx.widgetSlice} />
    </PageWrapper>
  );
};
`;
