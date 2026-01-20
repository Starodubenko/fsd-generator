
import styled from '@emotion/styled';
import type { {{name}} } from '@entities/{{name}}/model/model';
import { useUpdate{{name}} } from '@entities/{{name}}/ui';

const Button = styled.button`
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
`;

export const Edit{{name}}Button = ({ id }: { id: string }) => {
  const { mutate, isLoading } = useUpdate{{name}}();
  return (
    <Button onClick={() => mutate({ id, ...{ name: 'Updated' } } as Partial<{{name}}>)} disabled={isLoading}>
      {isLoading ? 'Editing...' : 'Edit'}
    </Button>
  );
};
