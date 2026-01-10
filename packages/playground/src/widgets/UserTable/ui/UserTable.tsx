import styled from '@emotion/styled';
import { mockUserData } from '../../../entities/User/model/types';
import { CreateUserButton, EditUserButton, DeleteUserButton } from '../../../features/ManageUser/ui';

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

export const UserTable = () => {
  return (
    <TableWrapper>
      <div style={{ marginBottom: '1rem' }}>
        <CreateUserButton />
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
          {mockUserData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                <EditUserButton id={item.id} />
                <DeleteUserButton id={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
