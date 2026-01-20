
import styled from '@emotion/styled';
import type { {{name}} as {{name}}Type } from '../model/model';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const {{name}} = (props: { data: {{name}}Type }) => {
  return <Root>{props.data.name}</Root>;
};
