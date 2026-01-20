
import styled from '@emotion/styled';
import type { User as UserType } from '../model/model';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const User = (props: { data: UserType }) => {
  return <Root>{props.data.name}</Root>;
};
