import styled from '@emotion/styled';
import { mockAliasedTable2Data } from '@entities/AliasedTable2/model/types';
import { CreateAliasedTable2Button, EditAliasedTable2Button, DeleteAliasedTable2Button } from '@features/ManageAliasedTable2/ui';

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

export const AliasedTable2Table = () => {
  return (
    <TableWrapper>
      <div style={{ marginBottom: '1rem' }}>
        <CreateAliasedTable2Button />
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
          {mockAliasedTable2Data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                <EditAliasedTable2Button id={item.id} />
                <DeleteAliasedTable2Button id={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
