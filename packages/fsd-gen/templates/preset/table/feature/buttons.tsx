import type { GeneratorContext } from '../../../../src/config/types.js';

export default (ctx: GeneratorContext) => {
    const { base: { baseName } } = ctx;
    return `import styled from '@emotion/styled';

const Button = styled.button\`
  padding: 8px 16px;
  margin: 0 4px;
  cursor: pointer;
\`;

export const Create${baseName}Button = () => <Button>Create</Button>;
export const Edit${baseName}Button = () => <Button>Edit</Button>;
export const Delete${baseName}Button = () => <Button>Delete</Button>;
`;
};
