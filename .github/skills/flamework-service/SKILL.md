# Flamework Service Skill

**When to read this skill:**

- Creating a new server-side Service class with `@Service` decorator
- Implementing server-only game logic or systems
- Setting up dependency injection between services
- Working with server-side lifecycle methods

## Design Philosophy

**PREFER LIGHTWEIGHT, MINIMAL IMPLEMENTATIONS:**

1. **Single responsibility** - Each service does ONE thing well
2. **Signal-driven** - Use Signals and Events, avoid polling loops
3. **Framework features first** - Use Flamework's DI and networking, don't reinvent
4. **Minimal state** - Only track what you can't query from the source of truth
5. **Start simple** - Add complexity only when genuinely needed

## Core Concepts

### What is a Service?

A Flamework Service is a **server-only** singleton class that handles game logic, systems, and server-side operations. Services are automatically instantiated by Flamework when the server starts.

### Basic Service Pattern

```typescript
import { Service, OnStart, OnInit } from "@flamework/core";

@Service()
export class MyGameService implements OnStart, OnInit {
	// Lifecycle: Called first, before any onStart methods
	onInit() {
		// Initialize variables, but don't access other services yet
		print("MyGameService initializing...");
	}

	// Lifecycle: Called after all onInit methods complete
	onStart() {
		// Safe to access other services and start logic
		print("MyGameService started!");
	}
}
```

## Dependency Injection

Services can depend on other services through constructor injection:

```typescript
import { Service, OnStart } from "@flamework/core";

@Service()
export class DataService implements OnStart {
	onStart() {
		print("DataService ready");
	}

	public savePlayerData(player: Player, data: unknown) {
		// Save logic
	}
}

@Service()
export class PlayerService implements OnStart {
	// Inject DataService
	constructor(private readonly dataService: DataService) {}

	onStart() {
		// Can safely use dataService here
		this.dataService.savePlayerData(game.GetService("Players").GetPlayers()[0], {});
	}
}
```

## Using Signals for Events

**✅ Best Practice:** Use `@rbxts/signal` for custom events instead of polling or while loops.

```typescript
import { Service, OnStart } from "@flamework/core";
import Signal from "@rbxts/signal";

@Service()
export class RoundService implements OnStart {
	public readonly roundStarted = new Signal<(roundNumber: number) => void>();
	public readonly roundEnded = new Signal<(winner: Player) => void>();

	private currentRound = 0;

	onStart() {
		// Start the round system
		this.startNextRound();
	}

	private startNextRound() {
		this.currentRound++;
		this.roundStarted.Fire(this.currentRound);

		// Round logic...

		task.wait(60); // 60 second round
		this.roundEnded.Fire(game.GetService("Players").GetPlayers()[0]);
	}
}

// Other services can listen:
@Service()
export class ScoreService implements OnStart {
	constructor(private readonly roundService: RoundService) {}

	onStart() {
		this.roundService.roundEnded.Connect((winner) => {
			print(`${winner.Name} won the round!`);
		});
	}
}
```

## Common Patterns

### 1. Player Join/Leave Handling

```typescript
import { Service, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

@Service()
export class PlayerService implements OnStart {
	private playerData = new Map<Player, PlayerData>();

	onStart() {
		Players.PlayerAdded.Connect((player) => this.onPlayerJoin(player));
		Players.PlayerRemoving.Connect((player) => this.onPlayerLeave(player));
	}

	private onPlayerJoin(player: Player) {
		this.playerData.set(player, { coins: 0, level: 1 });
		print(`${player.Name} joined!`);
	}

	private onPlayerLeave(player: Player) {
		this.playerData.delete(player);
		print(`${player.Name} left!`);
	}
}
```

### 2. Networking with Services

```typescript
import { Service, OnStart } from "@flamework/core";
import { Events } from "shared/network/server-network";

@Service()
export class CombatService implements OnStart {
	onStart() {
		// Listen for client events
		Events.player.onAction.connect((player, actionName) => {
			if (actionName === "attack") {
				this.handleAttack(player);
			}
		});
	}

	private handleAttack(player: Player) {
		print(`${player.Name} attacked!`);
		// Notify all clients
		Events.notification.show.broadcast("Player attacked!", 3);
	}
}
```

## Anti-Patterns to Avoid

### ❌ Heavy Logic in Constructor

```typescript
// BAD - Constructor runs before other services are ready
constructor() {
	this.startGameLoop(); // Don't do this!
	Players.PlayerAdded.Connect(...); // Or this!
}
```

### ✅ Use onInit or onStart Instead

```typescript
// GOOD - Use lifecycle methods
onStart() {
	this.startGameLoop();
	Players.PlayerAdded.Connect(...);
}
```

### ❌ Manual Service Instantiation

```typescript
// BAD - Don't manually create services
const myService = new MyGameService();
```

### ✅ Use Dependency Injection

```typescript
// GOOD - Let Flamework inject it
constructor(private readonly myService: MyGameService) {}
```

### ❌ Polling Loops

```typescript
// BAD - Avoid while loops for checking state
while (true) {
	if (gameState === "Ready") {
		// do something
	}
	task.wait(0.1);
}
```

### ✅ Use Signals

```typescript
// GOOD - Use event-driven architecture
this.gameStateChanged.Connect((newState) => {
	if (newState === "Ready") {
		// do something
	}
});
```

## Lifecycle Order

1. **Constructor** - Services instantiated (avoid heavy logic)
2. **onInit()** - Services initialized (set up variables)
3. **onStart()** - Services started (safe to access other services)

## Key Takeaways

- Services are **server-only** singletons
- **Start minimal** - add features only when needed
- **Single responsibility** - one service, one purpose
- Use **dependency injection** for service dependencies
- Use **Signals** for events, not polling
- Keep constructors lightweight
- Do setup work in `onInit()` and `onStart()`
- Never manually instantiate services
