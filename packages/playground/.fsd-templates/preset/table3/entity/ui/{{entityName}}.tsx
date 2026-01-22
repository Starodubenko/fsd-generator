
import styled from '@emotion/styled';
import type { {{entityName}} as {{entityName}}Type } from '../model/model';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const {{entityName}} = (props: { data: {{entityName}}Type }) => {
  return <Root>{props.data.name}</Root>;
};
