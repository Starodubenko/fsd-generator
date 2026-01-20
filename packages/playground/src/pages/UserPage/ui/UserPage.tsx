
import styled from '@emotion/styled';
import { UserWidget } from '@widgets/UserWidget/ui';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const UserPage = () => {
  return (
    <PageWrapper>
      <Title>User Management</Title>
      <UserWidget />
    </PageWrapper>
  );
};
