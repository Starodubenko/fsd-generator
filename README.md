# FSD Generator

[![npm version](https://img.shields.io/npm/v/@starodubenko/fsd-gen.svg)](https://www.npmjs.com/package/@starodubenko/fsd-gen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/rodionstarodubenko/fsd-generator)
[![Downloads](https://img.shields.io/npm/dt/@starodubenko/fsd-gen.svg)](https://www.npmjs.com/package/@starodubenko/fsd-gen)

A powerful CLI tool for scaffolding **Feature-Sliced Design (FSD)** components, slices, and layers. It automates boilerplate creation, manages dependencies, ensures consistent structure, and supports complex presets like full CRUD tables.

## 🚀 Key Features

*   **FSD Compliance**: Automatically generates correct folder structures for `entities`, `features`, `widgets`, `pages`, and `shared`.
*   **Smart Presets**: Generate entire vertical slices (e.g., `Table` preset creates Entity + Feature buttons + Widget Table + Page + Route).
*   **Aliases Support**: Built-in support for FSD aliases (`@entities`, `@features`, etc.) for cleaner imports.
*   **Interactive Mode**: User-friendly prompts (via Inquirer) if arguments are missing.
*   **Configurable**: `fsdgen.config.ts` for customizing paths, root directories, and aliases.
*   **Monorepo Ready**: Designed to work in modern monorepo workspaces.

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd fsd-generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the generator:**
    ```bash
    npm run build --workspace=@starodubenko/fsd-gen
    ```

## 🛠 Usage

You can run the generator using the npm script from the root or within usage workspaces.

### Basic Generation

Generate individual components for specific FSD layers.

```bash
# Syntax
npm run gen -- <layer> <slice> [componentName]
```

**Examples:**

```bash
# Generate a 'User' entity (Model + UI)
npm run gen -- entity User

# Generate a 'Login' feature with 'LoginForm' component
npm run gen -- feature Login LoginForm

# Generate a 'Header' widget
npm run gen -- widget Header
```

### Using Presets

Presets allow you to generate multiple related components across different layers to form a complete feature set.

#### Table Preset (`preset table`)
Generates a complete CRUD table implementation, including:
*   **Entity**: Data types (`model/types.ts`), UI component, and API hooks (`useGet...`, `useCreate...`, `useUpdate...`, `useDelete...`).
*   **Feature**: `Create`, `Edit`, and `Delete` buttons connected to the API hooks.
*   **Widget**: A Table component that displays data and integrates the Feature buttons.
*   **Page**: A dedicated page component wrapping the widget.
*   **Route**: Automatically injects a new route (e.g., `/users`) into `App.tsx`.

**Usage:**

```bash
npm run gen -- preset table <SliceName>
```

**Example:**

```bash
npm run gen -- preset table Product
```
*This command will generate `Product` entity, `ManageProduct` features, `ProductTable` widget, and `ProductPage` page.*

## ⚙️ Configuration

The generator searches for `fsdgen.config.ts` in your project root.

**Example `fsdgen.config.ts`:**

```typescript
import { defineConfig } from '@starodubenko/fsd-gen';

export default defineConfig({
  // Directory where FSD layers are located (default: 'src')
  rootDir: 'src',

  // FSD Layer Aliases (optional)
  // If configured, the generator will use these aliases for imports instead of relative paths.
  aliases: {
    '@entities': '@entities',
    '@features': '@features',
    '@widgets': '@widgets',
    '@pages': '@pages',
    '@shared': '@shared',
  }
});
```

*Note: You must also configure `tsconfig.json` and your bundler (e.g., Vite) to support these aliases.*

## 📂 Project Structure

This project is a monorepo setup:

*   **`packages/fsd-gen`**: Source code for the CLI generator tool.
*   **`packages/playground`**: A sample React application serving as a testbed for the generator.

## 🤝 Development

To contribute or modify the generator:

1.  Make changes in `packages/fsd-gen`.
2.  Rebuild the generator: `npm run build --workspace=fsd-gen`.
3.  Test your changes in the playground: `npm run gen --workspace=playground-app -- <args>`.

## 📄 License

MIT
