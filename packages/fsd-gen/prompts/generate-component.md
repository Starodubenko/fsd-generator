# AI Agent Guide: Generating Components & Slices

Use this guide when you need to create a single component or a basic FSD slice.

## Command: `fsd-gen generate` (Alias: `g`)

### Usage Scenarios
- **Creating a new Entity/Feature/Widget/Page**:
  ```bash
  fsd-gen generate <layer> <slice>
  ```
  Example: `fsd-gen generate entity <EntityName>` creates `src/entities/<EntityName>`.

- **Creating a Component inside a Slice**:
  ```bash
  fsd-gen generate <layer> <slice> <componentName>
  ```
  Example: `fsd-gen generate feature <FeatureName> <ComponentName>` creates `src/features/<FeatureName>/ui/<ComponentName>`.

- **Creating Shared Utilities/UI**:
  ```bash
  fsd-gen generate shared <path/to/component>
  ```
  Example: `fsd-gen generate shared ui/<ButtonName>` creates `src/shared/ui/<ButtonName>`.

### Agent Decision Logic
1. **Identify the Layer**: 
   - Is it a business entity? -> `entity`
   - Is it a user action? -> `feature`
   - Is it a complex UI block? -> `widget`
   - Is it a whole view? -> `page`
   - Is it highly reusable and generic? -> `shared`
2. **Determine Slice Name**: Use PascalCase (e.g., `OrderDetails`).
3. **Optional Component Name**: If you only need a specific UI part within a slice, provide the 3rd argument.

### Boilerplate Content
The tool will automatically generate:
- A UI component (.tsx)
- Public API (index.ts)
- Basic styles (if configured in templates)
- Necessary FSD subfolders (ui, model, lib)
