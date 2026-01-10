import { definePreset } from 'fsd-generator';


export default definePreset(({ name, config }) => {
    const aliases = config.aliases || {};
    const hasEntAlias = !!aliases['@entities'];
    const hasFeatAlias = !!aliases['@features'];
    const hasWidgetAlias = !!aliases['@widgets'];

    const entityImportPath = hasEntAlias ? `@entities/${name}` : `../../../entities/${name}`;
    // For API, usually it's inside entity/api or entity/model depending on structure.
    // The previous preset assumed entity root exports model types.
    // But check useGet... generated code. It imports from {{entityImportPath}}/model/types.

    // Feature slice name convention in this preset
    const featureSlice = `Manage${name}`;
    const featureImportPath = hasFeatAlias ? `@features/${featureSlice}` : `../../../features/${featureSlice}`;

    const widgetSlice = `${name}Table`;
    const widgetImportPath = hasWidgetAlias ? `@widgets/${widgetSlice}` : `../../../widgets/${widgetSlice}`;

    const baseName = name; // Variable for simple name

    return {
        variables: { baseName }, // Global variable
        actions: [
            {
                type: 'file',
                path: `entities/${name}/model/types.ts`,
                template: 'preset/table2/entity/model.ts'
            },
            {
                type: 'component',
                layer: 'entity',
                slice: name,
                name: name,
                template: 'preset/table2/entity/ui'
            },
            {
                type: 'component',
                layer: 'entity',
                slice: name,
                name: `useGet${name}s`,
                template: 'preset/table2/entity/api/get',
                variables: { entry: 'useGet', suffix: 's', entityImportPath }
            },
            {
                type: 'component',
                layer: 'entity',
                slice: name,
                name: `useCreate${name}`,
                template: 'preset/table2/entity/api/create',
                variables: { entry: 'useCreate', suffix: '', entityImportPath }
            },
            {
                type: 'component',
                layer: 'entity',
                slice: name,
                name: `useUpdate${name}`,
                template: 'preset/table2/entity/api/update',
                variables: { entry: 'useUpdate', suffix: '', entityImportPath }
            },
            {
                type: 'component',
                layer: 'entity',
                slice: name,
                name: `useDelete${name}`,
                template: 'preset/table2/entity/api/delete',
                variables: { entry: 'useDelete', suffix: '', entityImportPath }
            },
            {
                type: 'component',
                layer: 'feature',
                slice: `Manage${name}`,
                name: `Create${name}Button`,
                template: 'preset/table2/feature/buttons/create',
                variables: { prefix: 'Create', suffix: 'Button', apiImportPath: `${entityImportPath}/ui` }
            },
            {
                type: 'component',
                layer: 'feature',
                slice: `Manage${name}`,
                name: `Edit${name}Button`,
                template: 'preset/table2/feature/buttons/edit',
                variables: { prefix: 'Edit', suffix: 'Button', apiImportPath: `${entityImportPath}/ui` }
            },
            {
                type: 'component',
                layer: 'feature',
                slice: `Manage${name}`,
                name: `Delete${name}Button`,
                template: 'preset/table2/feature/buttons/delete',
                variables: { prefix: 'Delete', suffix: 'Button', apiImportPath: `${entityImportPath}/ui` }
            },
            {
                type: 'component',
                layer: 'widget',
                slice: `${name}Table`,
                name: `${name}Table`,
                template: 'preset/table2/widget/table',
                variables: { entityImportPath, featureImportPath }
            },
            {
                type: 'component',
                layer: 'page',
                slice: `${name}Page`,
                name: `${name}Page`,
                template: 'preset/table2/page/page',
                variables: { widgetImportPath, widgetName: `${name}Table` } // Using JS interpolation
            }
        ]
    };
});
