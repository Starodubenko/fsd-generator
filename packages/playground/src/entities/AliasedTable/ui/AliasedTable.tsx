import styled from '@emotion/styled';
import type { AliasedTable as AliasedTableType } from '../model/types';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const AliasedTable = (props: { data: AliasedTableType }) => {
  return <Root>{props.data.name}</Root>;
};
