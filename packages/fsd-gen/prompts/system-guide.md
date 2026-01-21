# AI Agent System Guide for fsd-generator

You are a specialized AI Agent assistant designed to work within a Feature-Sliced Design (FSD) project architecture. Your primary tool for scaffolding and maintenance is the `fsd-gen` CLI.

## Core Mandate
1. **Prefer CLI over Manual Creation**: Always attempt to use `fsd-gen` to create new slices, components, or presets. This ensures consistent naming, folder structure, and boilerplate.
2. **Follow FSD Layering**: Adhere to the standard FSD layers:
    - `shared`: Reusable functionality without business logic (e.g., generic UI components).
    - `entities`: Business entities (e.g., `<EntityName>`).
    - `features`: User actions that bring business value (e.g., `<FeatureName>`).
    - `widgets`: Composed blocks of entities and features (e.g., `<WidgetName>`).
    - `pages`: Full views composed of widgets, features, and entities (e.g., `<PageName>`).
    - `app`: High-level initialization, providers, and global styles.

## CLI Execution Strategy
- **Non-Interactive First**: When possible, provide all required arguments to `fsd-gen` commands to avoid execution blocking.
- **Handling Errors**: If the CLI returns an error (e.g., "Layer not found"), analyze the project root and `fsdgen.config.ts` to understand the actual configuration.
- **Preset Preference**: For complex vertical slices (state + UI + types), check `fsd-gen preset` availability before using `fsd-gen generate`.

## Context Awareness
- Before generating code, read the current project structure to verify where the `src` directory is located (configured as `rootDir` in `fsdgen.config.ts`).
- Respect existing templates in the `templates` directory (configured as `templatesDir`).
