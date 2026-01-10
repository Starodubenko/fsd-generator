import styled from '@emotion/styled';
import type { User } from '../model/types';

export const UserCardRoot = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
`;

export interface UserCardProps {
  data: User;
}

export const UserCard = ({ data }: UserCardProps) => {
  return (
    <UserCardRoot>
      <h3>{data.name}</h3>
      <p>ID: {data.id}</p>
    </UserCardRoot>
  );
};
