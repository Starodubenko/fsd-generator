import { definePreset, createPresetHelpers } from '@starodubenko/fsd-gen';


export default definePreset(({ name, config }) => {
    const helpers = createPresetHelpers(name, config, {
        featurePrefix: 'Manage',
        widgetSuffix: 'Table',
        pageSuffix: 'Page'
    });

    return {
        discoveryMode: 'auto',
        variables: {
            ...helpers,
            // Computed paths used by templates
            apiImportPath: `${helpers.entityImportPath}/ui`,
        },
        conventions: {
            featureSlicePrefix: 'Manage',
            widgetSliceSuffix: 'Table',
            pageSliceSuffix: 'Page'
        },
        routing: {
            path: `/${name.toLowerCase()}`,
        }
    };
});
