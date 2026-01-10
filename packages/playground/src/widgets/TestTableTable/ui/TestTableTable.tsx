import styled from '@emotion/styled';
import { mockTestTableData } from '../../../entities/TestTable/model/types';
import { CreateTestTableButton, EditTestTableButton, DeleteTestTableButton } from '../../../features/ManageTestTable/ui';

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

export const TestTableTable = () => {
  return (
    <TableWrapper>
      <div style={{ marginBottom: '1rem' }}>
        <CreateTestTableButton />
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
          {mockTestTableData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                <EditTestTableButton id={item.id} />
                <DeleteTestTableButton id={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
