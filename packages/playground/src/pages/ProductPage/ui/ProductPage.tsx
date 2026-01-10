import styled from '@emotion/styled';
import { ProductTable } from '@widgets/ProductTable/ui/';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const ProductPage = () => {
  return (
    <PageWrapper>
      <Title>Product Management</Title>
      <ProductTable />
    </PageWrapper>
  );
};
