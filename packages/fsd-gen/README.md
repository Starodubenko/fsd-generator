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

### Using Presets

Presets generate multiple related components across layers.

```bash
npx @starodubenko/fsd-gen preset table Product
```

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
