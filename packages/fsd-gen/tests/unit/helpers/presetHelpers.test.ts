import { describe, it, expect } from 'vitest';
import { createPresetHelpers } from '../../../src/lib/helpers/presetHelpers.js';
import { FsdGenConfig, PresetHelpers } from '../../../src/config/types.js';

describe('presetHelpers', () => {
    describe('createPresetHelpers', () => {
        it('should return all required PresetHelpers fields', () => {
            const name = 'TestEntity';
            const config: FsdGenConfig = {
                rootDir: 'src',
                aliases: { '@': './src' }
            };

            const helpers = createPresetHelpers(name, config);

            expect(helpers).toHaveProperty('base');
            expect(helpers).toHaveProperty('layer');
            expect(helpers.base).toHaveProperty('name');
            expect(helpers.layer).toHaveProperty('entity');
            expect(helpers.layer).toHaveProperty('features');
            expect(helpers.layer).toHaveProperty('widget');
            expect(helpers.layer).toHaveProperty('page');
        });

        it('should correctly format paths and names with defaults', () => {
            const name = 'User';
            const config: FsdGenConfig = {};
            const helpers = createPresetHelpers(name, config);

            expect(helpers.base.baseName).toBe('User');
            expect(helpers.base.name).toBe('User');
            expect(helpers.layer.entity.importPath).toBe('../../../entities/User');
            expect(helpers.layer.entity.apiPath).toBe('../../../entities/User/ui');
            expect(helpers.layer.features.slice).toBe('ManageUser');
            expect(helpers.layer.features.importPath).toBe('../../../features/ManageUser');
            expect(helpers.layer.widget.slice).toBe('User');
            expect(helpers.layer.widget.importPath).toBe('../../../widgets/User');
            expect(helpers.layer.page.slice).toBe('UserPage');
            expect(helpers.layer.page.importPath).toBe('../../../pages/UserPage');
        });

        it('should use aliases if provided in config', () => {
            const name = 'User';
            const config: FsdGenConfig = {
                aliases: {
                    '@entities': 'src/entities',
                    '@features': 'src/features',
                    '@widgets': 'src/widgets',
                    '@pages': 'src/pages'
                }
            };
            const helpers = createPresetHelpers(name, config);

            expect(helpers.layer.entity.importPath).toBe('@entities/User');
            expect(helpers.layer.features.importPath).toBe('@features/ManageUser');
            expect(helpers.layer.widget.importPath).toBe('@widgets/User');
            expect(helpers.layer.page.importPath).toBe('@pages/UserPage');
        });
    });
});
