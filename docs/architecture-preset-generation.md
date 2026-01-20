# Architecture: Reverse Preset Generation

## Core Philosophy
Reverse preset generation allows developers to take an existing, well-implemented FSD slice (the "etalon") and instantly turn it into a reusable generator preset. This process is split into distinct stages to give developers full control over tokenization and structure.

## Detailed Workflow

### Stage 1: Initialization (`reverse:init`)
Sets up a new preset workspace.

*   **Command**: `fsd-gen reverse:init <preset-name> [--mode short|ejected]`
*   **Modes**:
    *   `short` (default): Minimizes generated code. Templates are auto-discovered from the source directory at generation time.
    *   `ejected`: Copies all source files into the preset directory as templates. Best for manual template patching.
*   **Action**: Creates `templates/preset/<preset-name>/preset.source.ts`.

### Stage 2: Configuration (`preset.source.ts`)
The user defines which parts of the codebase should be templated.

```typescript
// templates/preset/my-preset/preset.source.ts
export default {
    globalRoot: '../../../src', // Base path for all layers
    layers: [
        { root: 'entities/User', targetLayer: 'entity' },
        { root: 'features/ManageUser', targetLayer: 'feature' }
    ],
    options: { language: 'typescript' }
}
```

### Stage 3: Analysis (`reverse:analyze`)
Parses the source code to find tokens (names, components, hooks) to replace.

*   **Command**: `fsd-gen reverse:analyze <preset-name>`
*   **Action**: Scans the etalon, identifies identifying strings (e.g., "User"), and generates `preset.config.json`.

### Stage 4: Building (`reverse:build`)
Produces the final executable preset.

*   **Command**: `fsd-gen reverse:build <preset-name> [--mode short|ejected]`
*   **Action**:
    *   **Short Mode**: Writes a thin `preset.ts` that uses `discoveryMode: 'auto'`. Templates are discovered recursively from the source root.
    *   **Ejected Mode**: Applies tokens to file contents and names, then copies them into the preset folder as static templates.

## Discovery & Naming Algorithm
The generator uses a **recursive scanning** algorithm for auto-discovery:
1.  **Slice Level**: For each layer (e.g., `feature`), it determines the slice name based on conventions (e.g., `Manage{{name}}`).
2.  **Recursive Scan**: It traverses the entire directory tree of the etalon slice.
3.  **File Mapping**: Every file found is mapped to an action.
4.  **Tokenization**: Segment-like paths (like `ui`, `model`) are preserved, while identifiers within filenames and contents are tokenized.

## Benefits
- **Zero-Boilerplate**: `short` mode allows creating presets in seconds.
- **AST-Aware**: Analysis identifies components and hooks for intelligent renaming.
- **FSD Native**: Fully understands slices, segments, and layers.
