import styled from '@emotion/styled';
import type { {{componentName}} as {{componentName}}Type } from '../model/types';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const {{componentName}} = (props: { data: {{componentName}}Type }) => {
  return <Root>{props.data.name}</Root>;
};
