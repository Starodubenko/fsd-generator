import styled from '@emotion/styled';
import { mock{{componentName}}Data } from '{{entityImportPath}}/model/types';
import { Create{{componentName}}Button, Edit{{componentName}}Button, Delete{{componentName}}Button } from '{{featureImportPath}}/ui';

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

export const {{componentName}}Table = () => {
  return (
    <TableWrapper>
      <div style={{ marginBottom: '1rem' }}>
        <Create{{componentName}}Button />
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
          {mock{{componentName}}Data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                <Edit{{componentName}}Button id={item.id} />
                <Delete{{componentName}}Button id={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
