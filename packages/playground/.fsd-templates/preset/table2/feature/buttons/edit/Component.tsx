import { TemplateContext } from '@starodubenko/fsd-gen';

export default (ctx: TemplateContext) => `
import styled from '@emotion/styled';
import type { ${ctx.baseName} } from '${ctx.entityImportPath}/model/model';
import { useUpdate${ctx.baseName} } from '${ctx.apiImportPath}';

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

export const ${ctx.componentName} = ({ id }: { id: string }) => {
  const { mutate, isLoading } = useUpdate${ctx.baseName}();
  return (
    <Button onClick={() => mutate({ id, ...{ name: 'Updated' } } as Partial<${ctx.baseName}>)} disabled={isLoading}>
      {isLoading ? 'Editing...' : 'Edit'}
    </Button>
  );
};
`;
