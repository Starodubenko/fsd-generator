# FSD-GEN  
## CLI Generator for React Components via Feature-Sliced Design

---

## 1. Purpose

`fsd-gen` is a CLI generator for React components in projects using the **Feature-Sliced Design (FSD)** architecture.

Generator Goals:
- Speed up the creation of new components
- Ensure a consistent architecture
- Eliminate manual errors in the project structure
- Automate routine tasks (templates, imports, barrel files)
- Enforce architectural discipline

---

## 2. Technical Requirements

### Technologies Used
- Node.js ≥ 18
- React + TypeScript
- `@emotion/styled`

### Restrictions (Mandatory)
- ❌ Material UI
- ❌ CSS / SCSS / CSS Modules
- ❌ `css()` helpers
- ❌ inline styles

### Allowed
- only `styled.div\`...\`` (template literals)
- strict typing
- `Record<Variant, string>` for variants

---

## 3. Generator Architecture

```
fsd-gen/
  cli.js
  src/
    config/
      types.ts
      defineConfig.ts
    lib/
      config/
        loadConfig.ts
        defaultConfig.ts
        deepMerge.ts
        validateConfig.ts
        warnConfig.ts
      naming/
      aliases/
      graph/
      barrels/
      preview/
      conflicts/
      templates/
  templates/
    shared/
    entity/
    feature/
    widget/
    page/
```

---

## 4. Generator Configuration

### 4.1 Configuration Format

In the project root:

```ts
import { defineConfig } from "fsd-gen";

export default defineConfig({
  rootDir: "src",
});
```

### 4.2 TypeScript Support

- `fsdgen.config.ts` is supported via **optional `tsx`**
- If `tsx` is not installed, the generator provides a clear error message

### 4.3 Settings Priority

1. CLI user answers
2. Project config
3. Generator defaults

---

## 5. Main Features

### 5.1 Dependency Graph

The generator builds a dependency graph between layers:

```
entity → feature → widget → page
```

Each node:
- layer
- slice
- component name
- template

Used for the correct generation order and passing dependencies to templates.

---

### 5.2 Alias-awareness

Automatic handling of import aliases.

Sources:
1. manual aliases from config
2. tsconfig paths
3. fallback `@/` → rootDir

---

### 5.3 Auto-updating barrel files

The generator automatically:
- creates `index.ts`
- adds exports
- avoids duplicates

---

### 5.4 Naming Policy Enforcement

Control of:
- component names
- slices
- suffixes (`Page`, `Widget`)
- variants

Modes: `error | warn | autoFix`

---

### 5.5 Preview / Explain Mode

Before generation, it shows:
- file list
- order
- dependencies
- conflicts

Dry-run does not write anything to disk.

---

### 5.6 Interactive Rename

During conflicts:
- ask
- rename
- merge
- abort

---

---

### 5.7 Reverse Preset Generation

The generator allows turning existing code (Etalon) into reusable presets.

Commands:
1. `reverse:init <name> [--mode short|ejected]` — workspace initialization.
2. `reverse:analyze <name>` — AST analysis of code and search for tokens to replace.
3. `reverse:build <name> [--mode short|ejected]` — final preset build.

Modes:
- **short**: Creates a compact `preset.ts` with `discoveryMode: 'auto'`. Templates are searched recursively in the source code at generation time.
- **ejected**: Copies all source code files to the preset folder, applying replacements and turning them into static templates.

Support for `globalRoot` and multiple layers in `preset.source.ts` allows building complex presets spanning multiple FSD layers at once.

---

### 5.8 Recursive Auto-Discovery

The `discoveryMode: 'auto'` mechanism has been improved to support arbitrary nesting:
1. Recursive scanning of all files in the slice directory.
2. Automatic application of naming rules (prefixes/suffixes) only to main components/pages.
3. Preservation of segment file structures (`ui`, `model`, `api`, etc.).

---

### 5.9 Improved Barrel Files

The logic for updating `index.ts` has become more reliable:
- **Exact substring matching**: Prevents skipping an export if its name is part of another (e.g., `Comp` will not be skipped if `Complete` exists).
- **Self-export prevention**: `index.ts` no longer tries to export itself.

---

## 6. Generation Templates

Each UI template creates:

```
ui/
  Component.tsx
  Component.styles.ts
```

Variant-pattern:

```ts
type Variant = "primary" | "secondary";

const variantStyles: Record<Variant, string> = {
  primary: `...`,
  secondary: `...`,
};

export const Root = styled.div<{ variant: Variant }>`
  ${({ variant }) => variantStyles[variant]}
`;
```

---

## 7. Supported Templates

- shared: ui-basic, ui-polymorphic, ui-primitive
- entity: model-ui-basic, model-ui-readonly
- feature: ui-model-basic, ui-model-confirm, ui-model-form
- widget: ui-basic, ui-layout, ui-data
- page: ui-basic, ui-layout, ui-routing-shell

---

## 8. Errors and Warnings

Fatal:
- invalid config
- unknown layers

Warnings:
- missing templates
- empty variants

---

## 9. Acceptance Criteria

The generator:
- works with `defineConfig`
- respects FSD
- uses aliases
- updates barrel files
- supports preview and dry-run

---

## 10. Conclusion

`fsd-gen` is an architectural tool, not just a generator.
