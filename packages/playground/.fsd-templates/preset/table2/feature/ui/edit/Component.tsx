
import type { GeneratorContext } from '@starodubenko/fsd-gen';

export default (ctx: GeneratorContext) => {
  const {
    base: { baseName },
    template: { componentName },
    layer: { 
      entity: { apiPath: apiImportPath, importPath: entityImportPath }
    }
  } = ctx;
  return `
import styled from '@emotion/styled';
import type { ${baseName} } from '${entityImportPath}/model/model';
import { useUpdate${baseName} } from '${apiImportPath}';

const Button = styled.button\`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
\`;

export const ${componentName}Button = ({ id }: { id: string }) => {
  const { mutate, isLoading } = useUpdate${baseName}();
  return (
    <Button onClick={() => mutate({ id, ...{ name: 'Updated' } } as Partial<${baseName}>)} disabled={isLoading}>
      {isLoading ? 'Editing...' : 'Edit'}
    </Button>
  );
};
`;
};
