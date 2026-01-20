
import styled from '@emotion/styled';
import { {{name}}Widget } from '@widgets/{{name}}Widget/ui';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const {{name}}Page = () => {
  return (
    <PageWrapper>
      <Title>{{name}} Management</Title>
      <{{name}}Widget />
    </PageWrapper>
  );
};
