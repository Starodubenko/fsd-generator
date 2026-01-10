import styled from '@emotion/styled';

export const {{componentName}}Root = styled.div`
  display: flex;
`;

export interface {{componentName}}Props {
  className?: string;
  children?: React.ReactNode;
}

export const {{componentName}} = ({ className, children }: {{componentName}}Props) => {
  return (
    <{{componentName}}Root className={className}>
      {children}
    </{{componentName}}Root>
  );
};
