import styled from '@emotion/styled';
import { useUpdate{{componentName}} } from '{{apiImportPath}}';

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

export const Edit{{componentName}}Button = ({ id }: { id: string }) => {
  const { mutate, isLoading } = useUpdate{{componentName}}();
  return (
    <Button onClick={() => mutate(id, {})} disabled={isLoading}>
      {isLoading ? 'Saving...' : 'Edit'}
    </Button>
  );
};
