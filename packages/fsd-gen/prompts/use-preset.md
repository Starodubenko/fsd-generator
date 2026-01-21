# AI Agent Guide: Using Presets for Vertical Scaffolding

Use presets when you need to generate a coordinated set of files across multiple FSD layers (e.g., a Table with its Entity, Feature, and Page).

## Command: `fsd-gen preset`

### Usage Scenario
- **Generating a Vertical Slice**:
  ```bash
  fsd-gen preset <presetName> <name>
  ```
  Example: `fsd-gen preset <PresetName> <SliceName>` generates all files defined in the "<PresetName>" preset, substituting `{{name}}` with "<SliceName>".

### Agent Decision Logic
1. **Check Available Presets**: List directories in the `templates/preset` folder to see what is available (e.g., `table`, `form`, `crud`).
2. **Match Business Requirement**: 
   - Need a list with sorting/filtering? -> Check if a `table` preset exists.
   - Need an entity with full CRUD? -> Check if a `crud` preset exists.
3. **Analyze Variables**: Read the preset's `preset.config.json` (if it exists) to understand which variables will be substituted. By default, `{{name}}` (and its case variations like `{{Name}}`, `{{name_kebab}}`) is the primary variable.

### Variable Substitution
Preserve these naming conventions in your mind:
- `{{name}}` -> camelCase (e.g., `userProfile`)
- `{{Name}}` -> PascalCase (e.g., `UserProfile`)
- `{{name_kebab}}` -> kebab-case (e.g., `user-profile`)
- `{{name_snake}}` -> snake_case (e.g., `user_profile`)
