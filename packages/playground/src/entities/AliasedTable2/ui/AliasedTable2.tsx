import styled from '@emotion/styled';
import type { AliasedTable2 as AliasedTable2Type } from '../model/types';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const AliasedTable2 = (props: { data: AliasedTable2Type }) => {
  return <Root>{props.data.name}</Root>;
};
