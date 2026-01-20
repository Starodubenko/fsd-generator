import type { GeneratorContext } from '../../../src/config/types.js';

export default (ctx: GeneratorContext) => {
  const {
      base: { baseName },
      template: { componentName }
  } = ctx;

  return `
import styled from '@emotion/styled';

export const ${componentName}Root = styled.div\`
  padding: 1rem;
  border: 1px solid #ccc;
\`;

export interface ${componentName}Props {
  className?: string;
}

export const ${componentName} = ({ className }: ${componentName}Props) => {
  return (
    <${componentName}Root className={className}>
      ${componentName} Entity
    </${componentName}Root>
  );
};
`;
};
