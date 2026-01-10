export interface { { componentName } } {
    id: string;
    name: string;
}

export const mock{{ componentName }}Data: { { componentName } } [] = [
    { id: '1', name: 'Test {{componentName}} 1' },
    { id: '2', name: 'Test {{componentName}} 2' },
];
