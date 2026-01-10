import styled from '@emotion/styled';
import { {{widgetName}} } from '{{widgetImportPath}}/ui/{{widgetName}}';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export const {{componentName}} = () => {
  return (
    <PageWrapper>
      <Title>{{componentName}} Management</Title>
      <{{widgetName}} />
    </PageWrapper>
  );
};
