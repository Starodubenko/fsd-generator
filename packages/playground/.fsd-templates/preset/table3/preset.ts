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
        "path": "entities/{{name}}/ui/useCreate{{entityName}}.ts",
        "template": "preset/table3/entity/ui/useCreate{{entityName}}.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/useDelete{{entityName}}.ts",
        "template": "preset/table3/entity/ui/useDelete{{entityName}}.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/useGet{{entityName}}.ts",
        "template": "preset/table3/entity/ui/useGet{{entityName}}.ts"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/{{entityName}}.tsx",
        "template": "preset/table3/entity/ui/{{entityName}}.tsx"
    },
    {
        "type": "file",
        "path": "entities/{{name}}/ui/useUpdate{{entityName}}.ts",
        "template": "preset/table3/entity/ui/useUpdate{{entityName}}.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/index.ts",
        "template": "preset/table3/feature/index.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/CreateUser.styles.ts",
        "template": "preset/table3/feature/ui/CreateUser.styles.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/CreateUser.tsx",
        "template": "preset/table3/feature/ui/CreateUser.tsx"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/DeleteUser.styles.ts",
        "template": "preset/table3/feature/ui/DeleteUser.styles.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/DeleteUser.tsx",
        "template": "preset/table3/feature/ui/DeleteUser.tsx"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/EditUser.styles.ts",
        "template": "preset/table3/feature/ui/EditUser.styles.ts"
    },
    {
        "type": "file",
        "path": "features/Manage{{name}}/ui/EditUser.tsx",
        "template": "preset/table3/feature/ui/EditUser.tsx"
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
        "path": "widgets/{{name}}Widget/ui/{{entityName}}.tsx",
        "template": "preset/table3/widget/ui/{{entityName}}.tsx"
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
        "path": "pages/{{name}}Page/ui/{{entityName}}.tsx",
        "template": "preset/table3/page/ui/{{entityName}}.tsx"
    }
]
});
