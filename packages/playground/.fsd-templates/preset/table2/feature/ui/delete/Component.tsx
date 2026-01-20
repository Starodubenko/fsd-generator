import type { GeneratorContext } from '@starodubenko/fsd-gen';

export default (ctx: GeneratorContext) => {
  const {
    base: { baseName },
    template: { componentName },
    layer: {
      entity: { apiPath: apiImportPath }
    }
  } = ctx;

  return `
import styled from '@emotion/styled';
import { useDelete${baseName} } from '${apiImportPath}';

const Button = styled.button\`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  border: none;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #c82333;
  }
\`;

export const ${componentName}Button = ({ id }: { id: string }) => {
  const { mutate, isLoading } = useDelete${baseName}();
  return (
    <Button onClick={() => mutate(id)} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete'}
    </Button>
  );
};
`;
};
