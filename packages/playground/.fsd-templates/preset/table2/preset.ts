import { definePreset, createPresetHelpers } from '@starodubenko/fsd-gen';


export default definePreset(({ name, config }) => {
    const helpers = createPresetHelpers(name, config, {
        featurePrefix: 'Manage',
        widgetSuffix: 'Widget',
        pageSuffix: 'Page'
    });

    return {
        discoveryMode: 'auto',
        variables: {
            ...helpers,
        },
        conventions: {
            featureSlicePrefix: 'Manage',
            widgetSliceSuffix: 'Widget',
            pageSliceSuffix: 'Page'
        },
        routing: {
            path: `/${name.toLowerCase()}`,
        }
    };
});
