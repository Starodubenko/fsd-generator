# fsd-gen

A powerful CLI tool for scaffolding **Feature-Sliced Design (FSD)** components, slices, and layers. It automates boilerplate creation, manages dependencies, ensures consistent structure, and supports complex presets.

## 🚀 Features

- **FSD Compliance**: Automatically generates correct folder structures.
- **Smart Presets**: Generate entire vertical slices with one command (e.g., `preset table`).
- **Path Resolution**: Built-in support for FSD aliases (`@entities`, `@features`, etc.).
- **Interactive Mode**: User-friendly prompts for missing arguments.
- **Customizable**: `fsdgen.config.ts` for project-specific settings.

## 📦 Installation

```bash
npm install -D @starodubenko/fsd-gen
```

## 🛠 Usage

### Basic Component Generation

```bash
npx @starodubenko/fsd-gen generate <layer> <slice> [name]
```

**Example:**
```bash
npx @starodubenko/fsd-gen generate entity User UserCard
```

### Generating from Presets

Presets generate multiple related components across layers.

```bash
npx @starodubenko/fsd-gen preset table Product
```

### Reverse Preset Generation (Beta)

Reverse engineer existing code into reusable presets.

1.  **Initialize**: `fsd-gen reverse:init <preset-name> [--mode short|ejected]`
2.  **Analyze**: `fsd-gen reverse:analyze <preset-name>`
3.  **Build**: `fsd-gen reverse:build <preset-name> [--mode short|ejected]`

#### Configuration Examples

**Single Root:**
```typescript
export default {
  root: 'src/entities/User',
  targetLayer: 'entity'
};
```

**Multiple Roots with Conflict Resolution:**
```typescript
export default {
  root: [
    'src/entities/User',
    'src/features/User',  // Auto-resolved as User1
    'src/widgets/User'    // Auto-resolved as User2
  ],
  targetLayer: 'entity'
};
```

**Multiple Layers with Array Support:**
```typescript
export default {
  layers: [
    { root: 'src/entities/User', targetLayer: 'entity' },
    { 
      root: ['src/features/Auth', 'src/features/Payment'],
      targetLayer: 'feature' 
    }
  ]
};
```

**Features:**
- **Multi-Root Support**: Analyze multiple directories at once
- **Automatic Conflict Resolution**: Numeric suffixes (User, User1, User2)
- **Folder Name Normalization**: `user-action` → `UserAction`, `user_profile` → `UserProfile`
- **TypeScript Config**: Type-safe `preset.config.ts` with enums


#### Modes
-   **short** (default): Generates a thin `preset.ts` that auto-discovers templates at runtime.
-   **ejected**: Compiles and copies all source files into the preset folder as static templates.

#### TypeScript Preset Configs

The `reverse:analyze` command generates a type-safe `preset.config.ts` file using enums:

```typescript
import type { ReversePresetConfig } from '@starodubenko/fsd-gen';
import { EntityToken, FsdLayer } from '@starodubenko/fsd-gen';

export default {
    files: [{
        path: "index.ts",
        targetLayer: FsdLayer.ENTITY,  // Type-safe layer
        tokens: {
            "User": EntityToken.NAME    // Type-safe token
        }
    }]
} satisfies ReversePresetConfig;
```

**Available Enums:**

- **`EntityToken`**: Token types for code generation
  - `NAME` / `ENTITY_NAME` - PascalCase (e.g., `User`)
  - `ENTITY_NAME_CAMEL` - camelCase (e.g., `user`)
  - `ENTITY_NAME_LOWER` - lowercase (e.g., `user`)
  - `ENTITY_NAME_UPPER` - UPPERCASE (e.g., `USER`)
  - `ENTITY_NAME_KEBAB` - kebab-case (e.g., `user-profile`)

- **`FsdLayer`**: FSD architectural layers
  - `ENTITY` - Business entities
  - `FEATURE` - User interactions
  - `WIDGET` - Composite UI blocks
  - `PAGE` - Application pages
  - `SHARED` - Reusable utilities

## ⚙️ Configuration

Create an `fsdgen.config.ts` in your project root:

```typescript
import { defineConfig } from '@starodubenko/fsd-gen';

export default defineConfig({
  /**
   * Root directory of the source code.
   * Defaults to "src".
   */
  rootDir: 'src',

  /**
   * Target directory for generated code.
   * If not specified, defaults to rootDir.
   * Useful for generating code to a different location.
   */
  targetDir: 'src',  // Optional: generate to a different directory

  /**
   * Alias configuration.
   * Maps import aliases to their relative paths from root.
   */
  aliases: {
    '@entities': './src/entities',
    '@features': './src/features',
    '@widgets': './src/widgets',
    '@pages': './src/pages',
    '@shared': './src/shared',
  },

  /**
   * Directory containing custom templates.
   * Can be relative to the config file.
   */
  templatesDir: './.fsd-templates',

  /**
   * Naming convention enforcement.
   * "strict" | "warn" | "off"
   */
  naming: 'warn',
});
```

**Configuration Options:**

- **`rootDir`** (default: `"src"`): Root directory of your source code. Used for path resolution and imports.
- **`targetDir`** (default: `rootDir`): Directory where generated code will be placed. Useful for generating to a different location than your source code.
- **`aliases`**: Import path aliases for FSD layers.
- **`templatesDir`**: Location of custom templates.
- **`naming`**: Naming convention enforcement level.

**Practical Examples:**

```typescript
// Example 1: Generate to a separate output directory
export default defineConfig({
  rootDir: 'src',
  targetDir: 'generated',  // Code will be generated to ./generated/
});

// Example 2: Generate to a different project
export default defineConfig({
  rootDir: 'src',
  targetDir: '../backend/src',  // Generate to sibling project
});

// Example 3: Default behavior (targetDir = rootDir)
export default defineConfig({
  rootDir: 'src',
  // targetDir not specified, defaults to 'src'
});
```

## 📂 Template Structure

To customize templates, creating a `templatesDir` (e.g., `.fsd-templates`) allows you to override default templates. The structure should mirror the generator's internal organization:

```
.fsd-templates/
├── entity/
│   └── model-ui/          # Template name (e.g., used by default or specified)
│       └── sub/           # Optional subdirectory
│           └── Component.tsx
├── feature/
│   └── ...
├── page/
│   └── ...
├── widget/
│   └── ...
└── preset/
    └── my-preset/         # Custom preset
        ├── entity/
        ├── feature/
        └── preset.ts      # Preset definition
```

## 📝 Templated Component Example

Templates can either be standard files using **EJS** syntax or **TypeScript functions** that return the file content string.


**Example: `Component.tsx`**

```tsx
import type { GeneratorContext } from '@starodubenko/fsd-gen';

export default ({
  base: { baseName },
  template: { componentName },
  layer: {
    entity: { apiPath: apiImportPath, importPath: entityImportPath }
  }
}: GeneratorContext) => `
import styled from '@emotion/styled';
import type { ${baseName} } from '${entityImportPath}/model/model';
import { useCreate${baseName} } from '${apiImportPath}';

const Button = styled.button\`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
\`;

export const ${componentName}Button = () => {
  const { mutate, isLoading } = useCreate${baseName}();
  return (
    <Button onClick={() => mutate({ /* mock data */ } as unknown as Omit<${baseName}, 'id'>)} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create ${baseName}'}
    </Button>
  );
};
`;
```

**Available Variables (`GeneratorContext`):**

Assuming input name is **"User"** and default configuration:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `componentName` | Name of the component being generated | `UserCard` |
| `sliceName` | Name of the current slice | `User` |
| `layer` | Current FSD layer | `entity` |
| `base.name` | Original user input name | `User` |
| `layer.entity.importPath` | Resolved import path for entity | `@entities/User` |
| `layer.features.slice` | Feature slice name (with prefix) | `ManageUser` |
| `layer.features.importPath` | Feature import path | `@features/ManageUser` |
| `layer.widget.slice` | Widget slice name | `User` |
| `layer.widget.importPath` | Widget import path | `@widgets/User` |
| `layer.page.slice` | Page slice name (with suffix) | `UserPage` |
| `layer.page.importPath` | Page import path | `@pages/UserPage` |

> **Note:** Paths vary based on your `aliases` configuration.

## 🔧 Advanced Preset Configuration

You can define sophisticated presets with custom logic, naming conventions, and routing.

**Example `preset.ts`:**

```typescript
import { definePreset, createPresetHelpers } from '@starodubenko/fsd-gen';

export default definePreset(({ name, config }) => {
    // Generate helpers with custom naming conventions
    const helpers = createPresetHelpers(name, config, {
        featurePrefix: 'Manage',
        widgetSuffix: 'Widget',
        pageSuffix: 'Page'
    });

    return {
        // Automatically scan folders in this preset directory
        discoveryMode: 'auto',
        
        // Expose helpers as variables to all templates
        variables: {
            ...helpers,
        },
        
        // enforce naming conventions for discovery
        conventions: {
            featureSlicePrefix: 'Manage',
            widgetSliceSuffix: 'Widget',
            pageSliceSuffix: 'Page'
        },
        
        // Configure automatic routing (e.g. for App.tsx injection)
        routing: {
            path: `/${name.toLowerCase()}`,
        }
    };
});
```

**Available Variables (`GeneratorContext`) with Custom Config:**

Assuming input name is **"User"** and the configuration above:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `base.name` | Original user input name | `User` |
| `layer.features.slice` | Feature slice name (prefix 'Manage') | `ManageUser` |
| `layer.features.importPath` | Feature import path | `@features/ManageUser` |
| `layer.widget.slice` | Widget slice name (suffix 'Widget') | `UserWidget` |
| `layer.widget.importPath` | Widget import path | `@widgets/UserWidget` |
| `layer.page.slice` | Page slice name (suffix 'Page') | `UserPage` |
| `layer.page.importPath` | Page import path | `@pages/UserPage` |



## License

MIT
