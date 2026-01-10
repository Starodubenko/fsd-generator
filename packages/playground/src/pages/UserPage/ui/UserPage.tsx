import styled from '@emotion/styled';
import { UserTable } from '../../../widgets/UserTable/ui/UserTable';

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
      <UserTable />
    </PageWrapper>
  );
};
