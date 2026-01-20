
import styled from '@emotion/styled';
import type { {{name}} } from '@entities/{{name}}/model/model';
import { useCreate{{name}} } from '@entities/{{name}}/ui';

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

export const Create{{name}}Button = () => {
  const { mutate, isLoading } = useCreate{{name}}();
  return (
    <Button onClick={() => mutate({ /* mock data */ } as unknown as Omit<{{name}}, 'id'>)} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create {{name}}'}
    </Button>
  );
};
