# Roblox-TS Flamework Game Template

A single-package Roblox-TS game project using the Flamework framework.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Roblox Studio
- Rojo VS Code extension

### Installation

```bash
pnpm install
```

### Development Workflow

1. **Start the dev environment:**

    ```bash
    pnpm run dev
    ```

    This runs both the TypeScript compiler in watch mode and the Rojo server.

2. **Connect Roblox Studio:**
    - Open Roblox Studio
    - Install the Rojo plugin if you haven't already
    - Click "Connect" in the Rojo plugin
    - The default address is `localhost:34872`

3. **Make changes:**
    - Edit TypeScript files in `src/`
    - Changes are automatically compiled and synced to Studio

### Manual Commands

- `pnpm run build` - Build once
- `pnpm run watch` - Watch mode only
- `pnpm run serve` - Rojo server only
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier

## Project Structure

- `src/client/` - Client-side code (LocalScripts)
- `src/server/` - Server-side code (Scripts)
- `src/shared/` - Shared code (ModuleScripts)
- `docs/` - Game design and technical documentation
- `game-assets/` - Asset management
- `.github/skills/` - Copilot skills for Flamework patterns
- `.github/instructions/` - Code review guidelines

## Tech Stack

- **roblox-ts 3.x** - TypeScript to Luau compiler
- **Flamework 1.3.x** - Dependency injection and networking framework
- **Rojo** - Sync files to Roblox Studio
- **pnpm** - Fast package manager

## Documentation

- [Game Design](docs/design/GAME_DESIGN.md)
- [Technical Architecture](docs/technical/ARCHITECTURE.md)
- [Systems Overview](docs/design/SYSTEMS_OVERVIEW.md)

## MCP Server Setup (Optional)

For enhanced development with AI assistants:

1. **Context7** - Library documentation lookup
2. **GitHub MCP** - Issue and PR management

Add these to your MCP settings for better context when working on this project.
