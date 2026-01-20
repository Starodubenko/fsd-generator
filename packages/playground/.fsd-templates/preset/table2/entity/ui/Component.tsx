import type { GeneratorContext } from '@starodubenko/fsd-gen';

export default (ctx: GeneratorContext) => {
  const {
    template: { componentName }
  } = ctx;

  return `
import styled from '@emotion/styled';
import type { ${componentName} as ${componentName}Type } from '../model/model';

const Root = styled.div\`
    padding: 10px;
    border: 1px solid #ccc;
\`;

export const ${componentName} = (props: { data: ${componentName}Type }) => {
  return <Root>{props.data.name}</Root>;
};
`;
};
