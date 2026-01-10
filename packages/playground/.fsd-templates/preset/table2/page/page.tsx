import styled from '@emotion/styled';
import { {{componentName}}Table } from '../../widgets/{{componentName}}Table/ui/{{componentName}}Table';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const {{componentName}}Page = () => {
  return (
    <PageWrapper>
      <Title>{{componentName}} Management</Title>
      <{{componentName}}Table />
    </PageWrapper>
  );
};
