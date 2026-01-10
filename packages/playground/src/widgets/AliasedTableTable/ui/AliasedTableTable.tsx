import styled from '@emotion/styled';
import { mockAliasedTableData } from '@entities/AliasedTable/model/types';
import { CreateAliasedTableButton, EditAliasedTableButton, DeleteAliasedTableButton } from '@features/ManageAliasedTable/ui';

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

export const AliasedTableTable = () => {
  return (
    <TableWrapper>
      <div style={{ marginBottom: '1rem' }}>
        <CreateAliasedTableButton />
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
          {mockAliasedTableData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                <EditAliasedTableButton id={item.id} />
                <DeleteAliasedTableButton id={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
