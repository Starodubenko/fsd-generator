import { TemplateContext } from '@starodubenko/fsd-gen';

export default (ctx: TemplateContext) => `
import styled from '@emotion/styled';
import type { ${ctx.baseName} } from '${ctx.entityImportPath}/model/model';
import { useCreate${ctx.baseName} } from '${ctx.apiImportPath}';

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

export const ${ctx.componentName} = () => {
  const { mutate, isLoading } = useCreate${ctx.baseName}();
  return (
    <Button onClick={() => mutate({ /* mock data */ } as unknown as Omit<${ctx.baseName}, 'id'>)} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create ${ctx.baseName}'}
    </Button>
  );
};
`;
