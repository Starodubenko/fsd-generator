import type { ReversePresetConfig } from '@starodubenko/fsd-gen';
import { EntityToken, FsdLayer } from '@starodubenko/fsd-gen';

export default {
    "files": [
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            
        }
    },
    {
        "path": "model/index.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            
        }
    },
    {
        "path": "model/model.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            "User": EntityToken.ENTITY_NAME,
      "Users": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useCreateUser.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useDeleteUser.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useGetUsers.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            "User": EntityToken.ENTITY_NAME,
      "Users": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/User.tsx",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useUpdateUser.ts",
        "targetLayer": FsdLayer.ENTITY,
        "sourceRoot": "entities/User",
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "ui/CreateUser.styles.ts",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "ui/CreateUser.tsx",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "ui/DeleteUser.styles.ts",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "ui/DeleteUser.tsx",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "ui/EditUser.styles.ts",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "ui/EditUser.tsx",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.FEATURE,
        "sourceRoot": "features/ManageUser",
        "tokens": {
            
        }
    },
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.WIDGET,
        "sourceRoot": "widgets/UserWidget",
        "tokens": {
            
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.WIDGET,
        "sourceRoot": "widgets/UserWidget",
        "tokens": {
            "UserWidget": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/UserWidget.tsx",
        "targetLayer": FsdLayer.WIDGET,
        "sourceRoot": "widgets/UserWidget",
        "tokens": {
            "UserWidget": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.PAGE,
        "sourceRoot": "pages/UserPage",
        "tokens": {
            
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.PAGE,
        "sourceRoot": "pages/UserPage",
        "tokens": {
            "UserPage": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/UserPage.tsx",
        "targetLayer": FsdLayer.PAGE,
        "sourceRoot": "pages/UserPage",
        "tokens": {
            "UserPage": EntityToken.ENTITY_NAME
        }
    }
    ]
} satisfies ReversePresetConfig;
