import styled from '@emotion/styled';

export const {{componentName}}Root = styled.div`
  padding: 1rem;
`;

export interface {{componentName}}Props {
  className?: string;
}

export const {{componentName}} = ({ className }: {{componentName}}Props) => {
  return (
    <{{componentName}}Root className={className}>
      Feature: {{componentName}}
    </{{componentName}}Root>
  );
};
