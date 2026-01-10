import styled from '@emotion/styled';
import type { Product as ProductType } from '../model/model';

const Root = styled.div`
    padding: 10px;
    border: 1px solid #ccc;
`;

export const Product = (props: { data: ProductType }) => {
  return <Root>{props.data.name}</Root>;
};
