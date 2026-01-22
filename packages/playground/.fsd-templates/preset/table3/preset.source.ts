import type { PresetSourceConfig } from '@starodubenko/fsd-gen';

const config: PresetSourceConfig = {
    // The references code (etalon)
    // Relative to this file: ../../../src
    globalRoot: '../../../src',

    layers: [
        {
            root: ['entities/User'],
            targetLayer: 'entity'
        },
        {
            root: 'features/ManageUser',
            targetLayer: 'feature'
        },
        {
            root: 'widgets/UserWidget',
            targetLayer: 'widget'
        },
        {
            root: 'pages/UserPage',
            targetLayer: 'page'
        }
    ],

    options: {
        language: 'typescript'
    }
};

export default config;
