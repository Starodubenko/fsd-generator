import styled from '@emotion/styled';
import { useGetProducts } from '@entities/Product/ui';
import { CreateProductButton, EditProductButton, DeleteProductButton } from '@features/ManageProduct/ui';

const TableWrapper = styled.div`
  border: 1px solid #eee;
  padding: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
`;

export const ProductTable = () => {
  const { data, isLoading, error } = useGetProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <TableWrapper>
        <div style={{ marginBottom: '1rem' }}>
        <CreateProductButton />
      </div>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                <EditProductButton id={item.id} />
                <DeleteProductButton id={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
