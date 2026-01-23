# Technical Architecture

This document describes the technical implementation of the game, including project structure, patterns, and best practices.

---

## Technology Stack

- **Language:** TypeScript
- **Compiler:** roblox-ts 3.x
- **Framework:** Flamework 1.3.x
- **Sync Tool:** Rojo
- **Package Manager:** pnpm

---

## Project Structure

```
roblox-ts-flamework-template/
├── .github/
│   ├── instructions/          # Copilot instructions for code review
│   │   ├── code-review.instructions.md
│   │   └── roblox-ts.instructions.md
│   └── skills/               # Copilot skills for specific patterns
│       ├── flamework-service/
│       ├── flamework-component/
│       ├── flamework-controller/
│       ├── flamework-networking/
│       └── roblox-api/
├── .vscode/                  # VS Code configuration
│   ├── settings.json
│   ├── tasks.json
│   └── extensions.json
├── docs/                     # Documentation
│   ├── design/
│   └── technical/
├── game-assets/              # Asset management
│   ├── raw/
│   └── published/
├── src/                      # Source code
│   ├── client/              # Client-only code
│   │   ├── main.client.ts
│   │   └── controllers/
│   ├── server/              # Server-only code
│   │   ├── main.server.ts
│   │   └── services/
│   └── shared/              # Shared code
│       ├── network/
│       ├── types/
│       └── utils/
├── include/                  # Include files (git submodules, etc.)
├── types/                    # Custom type definitions
├── out/                      # Compiled output (git-ignored)
├── default.project.json      # Rojo project file
├── flamework.build          # Flamework build script
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md
```

---

## Architectural Patterns

### Dependency Injection

Flamework provides automatic dependency injection for Services and Controllers.

**Example:**

```typescript
@Service()
export class DataService {
	public saveData(player: Player, data: PlayerData) {
		// Implementation
	}
}

@Service()
export class PlayerService {
	// DataService is automatically injected
	constructor(private readonly dataService: DataService) {}

	onStart() {
		// Can now use dataService
		this.dataService.saveData(player, data);
	}
}
```

**Benefits:**

- No manual instantiation
- Easy testing (can inject mocks)
- Clear dependencies
- Lifecycle managed by framework

---

### Client-Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          CLIENT                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Controllers (UI, Input, Display)                  │     │
│  └──────────────┬─────────────────────────────────────┘     │
│                 │                                            │
│                 ▼                                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Client Network (Events.fire, Functions.invoke)    │     │
│  └──────────────┬─────────────────────────────────────┘     │
└─────────────────┼─────────────────────────────────────────────
                  │  Network Boundary
──────────────────┼─────────────────────────────────────────────
│  ┌──────────────▼─────────────────────────────────────┐     │
│  │  Server Network (Events.connect, Functions.set)    │     │
│  └──────────────┬─────────────────────────────────────┘     │
│                 │                                            │
│                 ▼                                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Services (Game Logic, Validation, State)          │     │
│  └────────────────────────────────────────────────────┘     │
│                         SERVER                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles:**

- **Server Authority:** Server validates all client actions
- **Client Prediction:** Client shows immediate feedback
- **Server Correction:** Server corrects client if prediction wrong
- **No Trust:** Never trust client data

---

### Networking Pattern

All networking is defined in `src/shared/network/`:

```typescript
// flamework-remotes.ts - Define ONCE
export interface ClientToServerEvents {
	player: {
		action: (data: string) => void;
	};
}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();

// server-network.ts - Server export
export const Events = GlobalEvents.createServer();

// client-network.ts - Client export
export const Events = GlobalEvents.createClient();
```

**Usage:**

```typescript
// Server
import { Events } from "shared/network/server-network";
Events.player.action.connect((player, data) => { ... });

// Client
import { Events } from "shared/network/client-network";
Events.player.action.fire("data");
```

---

### Component-Based Design

Components attach logic to specific instances via CollectionService tags.

```typescript
interface Attributes {
	Speed: number;
}

@Component({ tag: "Spinner" })
export class SpinnerComponent extends BaseComponent<Attributes, BasePart> {
	private connection?: RBXScriptConnection;

	onStart() {
		// Attach behavior to this instance
		this.connection = RunService.Heartbeat.Connect((dt) => {
			const rotation = this.attributes.Speed * dt;
			this.instance.CFrame = this.instance.CFrame.mul(CFrame.Angles(0, rotation, 0));
		});
	}

	destroy() {
		// Clean up
		this.connection?.Disconnect();
	}
}
```

**Usage in Studio:**

1. Add tag "Spinner" to a Part
2. Add attribute "Speed: number"
3. Component automatically attaches

---

## Data Flow

### Player Join Flow

1. Player joins server
2. `PlayerService.onPlayerJoin()` called
3. `DataService.loadPlayerData()` retrieves data from DataStore
4. Data validated and applied to player
5. `Events.data.update.fire(player, data)` sends to client
6. Client `PlayerDataController` updates UI

### Combat Flow

1. Client detects input (e.g., click to attack)
2. `InputController` fires `Events.combat.attack.fire(target)`
3. Server `CombatService` receives event
4. Server validates:
    - Is player allowed to attack?
    - Is target valid?
    - Is cooldown expired?
5. Server calculates damage
6. Server applies damage to target
7. Server broadcasts results to clients
8. Clients show visual feedback

---

## Code Organization

### When to Create a Service

**Server-only** classes that handle:

- Game logic
- Player management
- Data persistence
- Server-side systems

**Example:** `PlayerService`, `CombatService`, `DataService`

### When to Create a Controller

**Client-only** classes that handle:

- UI management
- Input handling
- Visual effects
- Client-side state

**Example:** `UIController`, `InputController`, `CameraController`

### When to Create a Component

**Instance-attached** classes that handle:

- Behavior for specific objects
- Attribute-driven logic
- Reusable instance behaviors

**Example:** `DoorComponent`, `ButtonComponent`, `EnemyComponent`

### When to Use Shared

Code that **both client and server** need:

- Type definitions
- Constants
- Utility functions
- Networking interfaces

**Example:** Types, networking, utility functions

---

## Performance Considerations

### Server Performance

- **Batch Operations:** Group operations when possible
- **Lazy Loading:** Only load data when needed
- **Pooling:** Reuse objects instead of creating/destroying
- **Indexing:** Use Maps for O(1) lookups instead of arrays

### Client Performance

- **UI Updates:** Throttle frequent updates
- **Visual Effects:** Limit particle count
- **Asset Loading:** Preload critical assets
- **Memory Management:** Clean up unused UI elements

### Network Performance

- **Batching:** Combine multiple updates into one event
- **Compression:** Send minimal data
- **Throttling:** Rate-limit client requests
- **Reliable Ordering:** Use RemoteFunctions only when needed

---

## Testing Strategy

### Manual Testing

1. **Unit Tests:** Test individual services/controllers
2. **Integration Tests:** Test system interactions
3. **Playtesting:** Test full player experience

### Automated Testing (Future)

- Set up test framework (e.g., TestEZ)
- Write unit tests for critical systems
- CI/CD integration

---

## Build & Deploy Process

### Development Workflow

```bash
# 1. Install dependencies
pnpm install

# 2. Start development
pnpm run dev  # Runs watch + serve

# 3. Connect Studio to Rojo (localhost:34872)

# 4. Make changes, test in Studio

# 5. Commit to git when ready
```

### Build Process

1. TypeScript code in `src/` compiled by roblox-ts
2. Output goes to `out/` directory
3. Flamework transformer processes decorators
4. Rojo syncs `out/` to Studio via project file

### Deployment

1. Publish place from Roblox Studio
2. Or use Rojo to build `.rbxl` file
3. Upload to Roblox

---

## Configuration Files

### tsconfig.json

- Enables strict mode
- Adds Flamework transformer
- Sets output to `out/`

### default.project.json

- Maps `out/server` → ServerScriptService.TS
- Maps `out/shared` → ReplicatedStorage.TS
- Maps `out/client` → StarterPlayerScripts.TS

### package.json

- Defines dependencies
- Defines npm scripts
- Project metadata

---

## Security Considerations

### Server Validation

**Always validate:**

- Player has permission
- Action is valid
- Data is expected type
- Rate limiting not exceeded

**Example:**

```typescript
Events.player.action.connect((player, data) => {
	// Validate type
	if (typeIs(data, "string")) {
		// Validate content
		if (data.size() <= 100) {
			// Process action
		}
	}
});
```

### Data Sanitization

- Validate all client input
- Use type checking (`@rbxts/t`)
- Whitelist allowed values
- Limit string lengths

### Anti-Exploit Measures

- Server authority for all game state
- Rate limiting on remote events
- Sanity checks on player positions/stats
- Don't trust client calculations

---

## Troubleshooting

### Common Issues

**TypeScript errors:**

- Check tsconfig.json is correct
- Verify all dependencies installed
- Check import paths

**Networking not working:**

- Verify only ONE createServer/createClient call
- Check types match between client and server
- Ensure paths are imported correctly

**Flamework not finding decorators:**

- Check Flamework.addPaths() includes directory
- Verify transformer in tsconfig.json
- Ensure decorator syntax is correct

**Rojo not syncing:**

- Check Rojo connection (green indicator)
- Verify default.project.json paths
- Try reconnecting

---

## Future Improvements

- [ ] Add automated testing
- [ ] Set up CI/CD pipeline
- [ ] Add logging/analytics
- [ ] Implement error tracking
- [ ] Add hot-reloading for faster iteration
- [ ] Create asset pipeline tools

---

**Document Version:** 1.0  
**Last Updated:** [Date]  
**Author:** [Your name]
