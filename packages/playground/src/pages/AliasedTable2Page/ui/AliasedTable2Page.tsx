import styled from '@emotion/styled';
import { AliasedTable2Table } from '@widgets/AliasedTable2Table/ui/AliasedTable2Table';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const AliasedTable2Page = () => {
  return (
    <PageWrapper>
      <Title>AliasedTable2 Management</Title>
      <AliasedTable2Table />
    </PageWrapper>
  );
};
