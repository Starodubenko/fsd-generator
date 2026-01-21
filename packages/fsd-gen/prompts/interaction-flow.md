# AI Agent Interaction Flow: fsd-gen Sequence

This guide describes the standard sequence of actions an agent (or team of agents) should follow when using the `fsd-gen` CLI.

## Standard Sequence Flow

### 1. Discovery Phase
- **Action**: Inspect the current project structure.
- **Goal**: Find `rootDir` and `templatesDir` (usually in `fsdgen.config.ts`).
- **Commands**: `ls -F`, `cat fsdgen.config.ts`.

### 2. Strategy Phase
- **Action**: Decide between `generate` and `preset`.
- **Goal**: Minimize manual coding. If a pattern exists (e.g., CRUD), use a preset.
- **Commands**: `ls templates/preset` to see available specialized scaffolding.

### 3. Execution Phase
- **Action**: Run the CLI tool.
- **Goal**: Atomic, non-interactive command execution.
- **Example**: `fsd-gen generate <layer> <slice> <componentName>`.

### 4. Verification & Polish Phase
- **Action**: Validate the output.
- **Goal**: Ensure the generated boilerplate is ready for business logic.
- **Verification Steps**:
    1. **Structure Check**: `ls -R <path/to/slice>` - verify `ui`, `model`, `lib`, and `index.ts` exist.
    2. **Public API Check**: `cat <path/to/slice>/index.ts` - ensure the main component/slice is exported.
    3. **Syntax Check**: Run `yarn lint` or `tsc` to ensure the generated code doesn't break the build.
    4. **Functional Check**: If a preset was used, check if routes were injected or if the component renders.

## Automation & Branching
- **Success Path**: Verification passes -> Proceed to inject business logic.
- **Failure Path (Missing Config)**: CLI errors -> Run `fsd-gen reverse:init <new_preset_name>` if you think you've found a new reusable pattern that should be a preset.
- **Failure Path (Incorrect Layer)**: Architect mistakenly chose a layer that doesn't fit the business logic -> Delete generated files and re-run with the correct `<layer>`.

## Summary Table of Verified States

| Phase | Agent Action | Success Criteria |
| :--- | :--- | :--- |
| **Discovery** | `ls`, `cat config` | Environment loaded correctly. |
| **Execution** | `fsd-gen <command> <args>` | Command exits with 0 and creates files. |
| **Verification** | `ls -R <path>`, `cat <index_path>` | FSD structure is valid, exports are correct. |
| **Finalization** | Manual code edits | Business logic integrated, tests pass. |
