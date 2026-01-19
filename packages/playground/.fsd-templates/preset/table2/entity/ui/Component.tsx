import { TemplateContext } from '@starodubenko/fsd-gen';

export default (ctx: TemplateContext) => `
import styled from '@emotion/styled';
import type { ${ctx.componentName} as ${ctx.componentName}Type } from '../model/model';

const Root = styled.div\`
    padding: 10px;
    border: 1px solid #ccc;
\`;

export const ${ctx.componentName} = (props: { data: ${ctx.componentName}Type }) => {
  return <Root>{props.data.name}</Root>;
};
`;
