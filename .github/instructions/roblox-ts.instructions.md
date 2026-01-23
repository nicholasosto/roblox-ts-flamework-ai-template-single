# Roblox-TS + Flamework Project Instructions

This file provides general guidance for working with this Roblox-TS game project using the Flamework framework.

## Project Overview

This is a **single-package** Roblox game project that uses:
- **roblox-ts** - TypeScript compiler for Roblox
- **Flamework** - Dependency injection and networking framework
- **Rojo** - Syncs code to Roblox Studio
- **pnpm** - Package manager

## Development Workflow

### Starting Development

1. **Terminal 1:** Start TypeScript compiler in watch mode
   ```bash
   pnpm run watch
   ```

2. **Terminal 2:** Start Rojo server
   ```bash
   pnpm run serve
   ```

3. **Roblox Studio:** Connect via Rojo plugin to `localhost:34872`

Or use the combined command:
```bash
pnpm run dev
```

### Making Changes

1. Edit TypeScript files in `src/`
2. Compiler automatically rebuilds to `out/`
3. Rojo syncs changes to Studio
4. Test in Studio

## Directory Structure

```
src/
├── client/          Client-only code (LocalScripts)
│   ├── main.client.ts
│   └── controllers/ Client-side controllers
├── server/          Server-only code (Scripts)
│   ├── main.server.ts
│   └── services/    Server-side services
└── shared/          Shared code (ModuleScripts)
    ├── network/     Networking definitions
    ├── types/       Type definitions
    └── utils/       Utility functions
```

## Code Organization Rules

### Client vs Server vs Shared

**Client (`src/client/`):**
- UI logic
- Input handling
- Client-side effects (camera, sounds)
- Controllers only

**Server (`src/server/`):**
- Game logic and validation
- Player data management
- Server authority
- Services only

**Shared (`src/shared/`):**
- Type definitions
- Networking interfaces
- Utility functions
- Constants
- Can be used by both client and server

### When to Create a Service (Server)

Create a Service when you need:
- Server-side game logic
- Player data management
- Game state management
- Server-side event handling

Example: `PlayerDataService`, `RoundService`, `CombatService`

### When to Create a Controller (Client)

Create a Controller when you need:
- UI management
- Input handling
- Client-side state
- Audio/visual effects

Example: `UIController`, `InputController`, `CameraController`

### When to Create a Component

Create a Component when you need:
- Logic attached to specific instances
- Behavior driven by attributes
- Reusable instance behaviors

Example: `DoorComponent`, `ButtonComponent`, `CollectibleComponent`

## Networking Pattern

**IMPORTANT:** Define networking interfaces ONCE in shared, export separately for client/server.

```
shared/network/
├── flamework-remotes.ts    Define all events/functions here
├── server-network.ts        Export Events, Functions for server
└── client-network.ts        Export Events, Functions for client
```

### Adding a New Network Event

1. Add to interface in `flamework-remotes.ts`:
```typescript
export interface ClientToServerEvents {
	player: {
		newAction: (data: string) => void; // Add this
	};
}
```

2. Use in service/controller:
```typescript
// Server
import { Events } from "shared/network/server-network";
Events.player.newAction.connect((player, data) => { ... });

// Client
import { Events } from "shared/network/client-network";
Events.player.newAction.fire("data");
```

## Using GitHub Skills

This project includes Copilot skills for common patterns. Reference them when:

- **Creating Services** → See `.github/skills/flamework-service/SKILL.md`
- **Creating Components** → See `.github/skills/flamework-component/SKILL.md`
- **Creating Controllers** → See `.github/skills/flamework-controller/SKILL.md`
- **Setting up Networking** → See `.github/skills/flamework-networking/SKILL.md`
- **Using Roblox APIs** → See `.github/skills/roblox-api/SKILL.md`

## Common Commands

```bash
# Install dependencies
pnpm install

# Build once
pnpm run build

# Build and watch for changes
pnpm run watch

# Start Rojo server
pnpm run serve

# Start both watch and serve
pnpm run dev

# Lint code
pnpm run lint

# Format code
pnpm run format
```

## TypeScript Configuration

- Strict mode enabled
- Experimental decorators enabled (required for Flamework)
- Flamework transformer configured
- Output directory: `out/`

## Rojo Configuration

The `default.project.json` maps:
- `out/server` → ServerScriptService.TS
- `out/shared` → ReplicatedStorage.TS
- `out/client` → StarterPlayer.StarterPlayerScripts.TS

## Best Practices

1. **Use native Roblox methods** - Check API before writing manual loops
2. **Import services** from `@rbxts/services`
3. **Single network export** - Never call createServer/createClient multiple times
4. **Lifecycle methods** - Use onInit/onStart, not constructors
5. **Type everything** - Avoid `any`, define interfaces
6. **Clean up** - Disconnect events in component destroy()
7. **Server authority** - Server validates all client actions

## Troubleshooting

### "Module not found" errors
- Run `pnpm install`
- Check import paths are correct
- Verify file is in correct directory (client/server/shared)

### Changes not appearing in Studio
- Check Rojo is connected (green indicator)
- Verify TypeScript compiled (check terminal for errors)
- Try reconnecting Rojo

### Networking not working
- Verify you're importing from correct file (server-network vs client-network)
- Check interface definitions match
- Ensure only ONE createServer/createClient call

### Flamework not finding decorators
- Verify `Flamework.addPaths()` includes the directory
- Check decorator is correctly applied
- Ensure transformer is in tsconfig.json

## Documentation

- [Roblox-TS Docs](https://roblox-ts.com/)
- [Flamework Docs](https://flamework.fireboltofdeath.dev/)
- [Rojo Docs](https://rojo.space/)
- [Roblox API Reference](https://create.roblox.com/docs/reference/engine)

## Getting Help

1. Check the skills in `.github/skills/`
2. Check the documentation in `docs/`
3. Review code-review checklist in `.github/instructions/code-review.instructions.md`
4. Search Roblox-TS or Flamework Discord
