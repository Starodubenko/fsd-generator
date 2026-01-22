
export interface {{entityName}} {
    id: string;
    name: string;
}

export const mock{{entityName}}Data: {{entityName}}[] = [
    { id: '1', name: 'Test {{entityName}} 1' },
    { id: '2', name: 'Test {{entityName}} 2' },
];
