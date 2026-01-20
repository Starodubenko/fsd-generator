
import styled from '@emotion/styled';
import { useGet{{name}}s } from '@entities/{{name}}/ui';
import { Create{{name}}Button, Edit{{name}}Button, Delete{{name}}Button } from '@features/Manage{{name}}/ui';

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

export const {{name}}Widget = () => {
  const { data, isLoading, error } = useGet{{name}}s();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <TableWrapper>
        <div style={{ marginBottom: '1rem' }}>
        <Create{{name}}Button />
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
                <Edit{{name}}Button id={item.id} />
                <Delete{{name}}Button id={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
