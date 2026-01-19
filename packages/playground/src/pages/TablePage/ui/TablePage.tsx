
import styled from '@emotion/styled';
import { TableTable } from '@widgets/TableTable/ui/';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const TablePage = () => {
  return (
    <PageWrapper>
      <Title>Table Management</Title>
      <TableTable />
    </PageWrapper>
  );
};
