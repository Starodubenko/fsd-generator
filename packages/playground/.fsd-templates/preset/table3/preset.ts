import { definePreset } from '@starodubenko/fsd-gen';

export default definePreset({
    actions: [
    {
        "type": "file",
        "path": "entities/{{name}}/index.ts",
        "template": "preset/table3/entity/index.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/model/index.ts",
        "template": "preset/table3/entity/model/index.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/model/model.ts",
        "template": "preset/table3/entity/model/model.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/index.ts",
        "template": "preset/table3/entity/ui/index.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/useCreate{{name}}.ts",
        "template": "preset/table3/entity/ui/useCreate{{name}}.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/useDelete{{name}}.ts",
        "template": "preset/table3/entity/ui/useDelete{{name}}.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/useGet{{name}}s.ts",
        "template": "preset/table3/entity/ui/useGet{{name}}s.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/{{name}}.tsx",
        "template": "preset/table3/entity/ui/{{name}}.tsx"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/useUpdate{{name}}.ts",
        "template": "preset/table3/entity/ui/useUpdate{{name}}.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/index.ts",
        "template": "preset/table3/feature/index.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/Create{{name}}.styles.ts",
        "template": "preset/table3/feature/ui/Create{{name}}.styles.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/Create{{name}}.tsx",
        "template": "preset/table3/feature/ui/Create{{name}}.tsx"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/Delete{{name}}.styles.ts",
        "template": "preset/table3/feature/ui/Delete{{name}}.styles.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/Delete{{name}}.tsx",
        "template": "preset/table3/feature/ui/Delete{{name}}.tsx"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/Edit{{name}}.styles.ts",
        "template": "preset/table3/feature/ui/Edit{{name}}.styles.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/Edit{{name}}.tsx",
        "template": "preset/table3/feature/ui/Edit{{name}}.tsx"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/index.ts",
        "template": "preset/table3/feature/ui/index.ts"
    },
    {
        "type": "file",
        "path": "widgets/{{name}}Widget/index.ts",
        "template": "preset/table3/widget/index.ts"
    },
    {
        "type": "file",
        "path": "widgets/{{name}}Widget/ui/index.ts",
        "template": "preset/table3/widget/ui/index.ts"
    },
    {
        "type": "file",
        "path": "widgets/{{name}}Widget/ui/{{name}}Widget.tsx",
        "template": "preset/table3/widget/ui/{{name}}Widget.tsx"
    },
    {
        "type": "file",
        "path": "pages/{{name}}Page/index.ts",
        "template": "preset/table3/page/index.ts"
    },
    {
        "type": "file",
        "path": "pages/{{name}}Page/ui/index.ts",
        "template": "preset/table3/page/ui/index.ts"
    },
    {
        "type": "file",
        "path": "pages/{{name}}Page/ui/{{name}}Page.tsx",
        "template": "preset/table3/page/ui/{{name}}Page.tsx"
    }
]
});
