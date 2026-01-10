import styled from '@emotion/styled';
import { AliasedTableTable } from '../../../widgets/AliasedTableTable/ui/AliasedTableTable';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const AliasedTablePage = () => {
  return (
    <PageWrapper>
      <Title>AliasedTable Management</Title>
      <AliasedTableTable />
    </PageWrapper>
  );
};
