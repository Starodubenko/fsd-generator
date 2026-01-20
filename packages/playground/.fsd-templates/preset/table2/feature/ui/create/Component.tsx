import type { GeneratorContext } from '@starodubenko/fsd-gen';

export default ({
  base: { baseName },
  template: { componentName },
  layer: {
    entity: { apiPath: apiImportPath, importPath: entityImportPath }
  }
}: GeneratorContext) => `
import styled from '@emotion/styled';
import type { ${baseName} } from '${entityImportPath}/model/model';
import { useCreate${baseName} } from '${apiImportPath}';

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

export const ${componentName}Button = () => {
  const { mutate, isLoading } = useCreate${baseName}();
  return (
    <Button onClick={() => mutate({ /* mock data */ } as unknown as Omit<${baseName}, 'id'>)} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create ${baseName}'}
    </Button>
  );
};
`;

