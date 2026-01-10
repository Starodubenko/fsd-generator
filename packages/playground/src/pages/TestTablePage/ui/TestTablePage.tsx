import styled from '@emotion/styled';
import { TestTableTable } from '../../../widgets/TestTableTable/ui/TestTableTable';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const TestTablePage = () => {
  return (
    <PageWrapper>
      <Title>TestTable Management</Title>
      <TestTableTable />
    </PageWrapper>
  );
};
