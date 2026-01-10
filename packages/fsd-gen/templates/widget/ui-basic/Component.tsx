import styled from '@emotion/styled';

export const {{componentName}}Root = styled.div`
  display: grid;
  gap: 1rem;
`;

export interface {{componentName}}Props {
  className?: string;
}

export const {{componentName}} = ({ className }: {{componentName}}Props) => {
  return (
    <{{componentName}}Root className={className}>
      Widget: {{componentName}}
    </{{componentName}}Root>
  );
};
