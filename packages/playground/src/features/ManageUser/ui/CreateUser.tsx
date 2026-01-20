
import styled from '@emotion/styled';
import type { User } from '@entities/User/model/model';
import { useCreateUser } from '@entities/User/ui';

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

export const CreateUserButton = () => {
  const { mutate, isLoading } = useCreateUser();
  return (
    <Button onClick={() => mutate({ /* mock data */ } as unknown as Omit<User, 'id'>)} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create User'}
    </Button>
  );
};
