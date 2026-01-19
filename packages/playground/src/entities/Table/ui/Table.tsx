
import styled from '@emotion/styled';
import type { Table as TableType } from '../model/model';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const Table = (props: { data: TableType }) => {
  return <Root>{props.data.name}</Root>;
};
