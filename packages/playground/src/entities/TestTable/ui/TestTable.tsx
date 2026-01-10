import styled from '@emotion/styled';
import type { TestTable as TestTableType } from '../model/types';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const TestTable = (props: { data: TestTableType }) => {
  return <Root>{props.data.name}</Root>;
};
