# AI Agent Guide: Reverse Engineering Presets

Use these instructions to extract reusable presets from existing high-quality code. This is useful when you've manually built a complex pattern and want to automate its future creation.

## Workflow: `init` -> `analyze` -> `build`

### 1. Initialize Workspace: `reverse:init`
```bash
fsd-gen reverse:init <presetName>
```
- Creates a workspace in `templates/preset/<presetName>`.
- **Action**: You must then edit `preset.source.ts` in that directory to point to the reference code you want to analyze.

### 2. Analyze Source: `reverse:analyze`
```bash
fsd-gen reverse:analyze <presetName>
```
- Scans the reference source code.
- Detects reusable variables and FSD layer structures.
- Generates `preset.config.json`.
- **Action**: Review the generated config to ensure all variables (e.g., component names) are correctly identified for substitution.

### 3. Build Final Preset: `reverse:build`
```bash
fsd-gen reverse:build <presetName>
```
- Converts the source files into templates with `{{tags}}`.
- Finalizes the preset for use with `fsd-gen preset`.

### Agent Decision Logic
- **When to Reverse?**: If you find yourself manually copying and pasting the same 5-10 files for every new entity, it's time to create a preset.
- **Reference Code**: Always use the cleanest, most "templated" version of your code as the source for the reverse process.
