import styled from '@emotion/styled';
import type { Product } from '@entities/Product/model/model';
import { useUpdateProduct } from '@entities/Product/ui';

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

export const EditProductButton = ({ id }: { id: string }) => {
  const { mutate, isLoading } = useUpdateProduct();
  return (
    <Button onClick={() => mutate({ id, ...{ name: 'Updated' } } as Partial<Product>)} disabled={isLoading}>
      {isLoading ? 'Editing...' : 'Edit'}
    </Button>
  );
};
