import styled from '@emotion/styled';
import { useCreateTestTable } from '../../../entities/TestTable/api';

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

export const CreateTestTableButton = () => {
  const { mutate, isLoading } = useCreateTestTable();
  return (
    <Button onClick={() => mutate({ /* mock data */ } as any)} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create TestTable'}
    </Button>
  );
};
