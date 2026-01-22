import type { ReversePresetConfig } from '@starodubenko/fsd-gen';
import { EntityToken, FsdLayer } from '@starodubenko/fsd-gen';

export default {
    "files": [
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            
        }
    },
    {
        "path": "model/index.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            
        }
    },
    {
        "path": "model/model.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            "User": EntityToken.ENTITY_NAME,
      "Users": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useCreateUser.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useDeleteUser.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useGetUsers.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            "User": EntityToken.ENTITY_NAME,
      "Users": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/User.tsx",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/useUpdateUser.ts",
        "targetLayer": FsdLayer.ENTITY,
        "tokens": {
            "User": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/CreateUser.styles.ts",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/CreateUser.tsx",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/DeleteUser.styles.ts",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/DeleteUser.tsx",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/EditUser.styles.ts",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/EditUser.tsx",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.FEATURE,
        "tokens": {
            
        }
    },
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.WIDGET,
        "tokens": {
            
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.WIDGET,
        "tokens": {
            "UserWidget": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/UserWidget.tsx",
        "targetLayer": FsdLayer.WIDGET,
        "tokens": {
            "UserWidget": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "index.ts",
        "targetLayer": FsdLayer.PAGE,
        "tokens": {
            
        }
    },
    {
        "path": "ui/index.ts",
        "targetLayer": FsdLayer.PAGE,
        "tokens": {
            "UserPage": EntityToken.ENTITY_NAME
        }
    },
    {
        "path": "ui/UserPage.tsx",
        "targetLayer": FsdLayer.PAGE,
        "tokens": {
            "UserPage": EntityToken.ENTITY_NAME
        }
    }
    ]
} satisfies ReversePresetConfig;
