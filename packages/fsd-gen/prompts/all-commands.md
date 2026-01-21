# fsd-gen CLI: AI Agent Cheat Sheet

Quick reference for all available commands. Use these exactly as shown.

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `fsd-gen generate` (or `g`) | `[layer]` `[slice]` `[name]` | Scaffolds a single FSD component or slice. |
| `fsd-gen preset` | `[presetName]` `[name]` | Generates multiple files across layers based on a preset. |
| `fsd-gen reverse:init` | `[presetName]` | Prepares a workspace to create a new preset from source code. |
| `fsd-gen reverse:analyze` | `[presetName]` | Analyzes source code and creates a preset configuration. |
| `fsd-gen reverse:build` | `[presetName]` | Builds final templates from the analyzed source configuration. |

## Options
- `-V, --version`: Show version.
- `-h, --help`: Show help for any command.
- `--mode <mode>`: Used in `reverse` commands (values: `short`, `ejected`).

## Pro-Tips for Agents
- **Static Analysis**: Before running `fsd-gen generate`, run `ls src` to confirm you are in the correct directory.
- **No Arguments?**: Running `fsd-gen` alone starts the interactive menu. Only use this if you are prepared to handle interactive prompts (piping input).
- **Public API**: `fsd-gen` always creates an `index.ts`. Ensure you use it for cross-slice imports.
