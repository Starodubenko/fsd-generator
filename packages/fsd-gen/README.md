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
npm install -D fsd-gen
```

## 🛠 Usage

### Basic Component Generation

```bash
npx fsd-gen generate <layer> <slice> [name]
```

**Example:**
```bash
npx fsd-gen generate entity User UserCard
```

### Using Presets

Presets generate multiple related components across layers.

```bash
npx fsd-gen preset table Product
```

## ⚙️ Configuration

Create an `fsdgen.config.ts` in your project root:

```typescript
import { defineConfig } from 'fsd-gen';

export default defineConfig({
  rootDir: 'src',
  aliases: {
    '@entities': './src/entities',
    '@features': './src/features',
    '@widgets': './src/widgets',
    '@pages': './src/pages',
    '@shared': './src/shared',
  }
});
```

## License

MIT
