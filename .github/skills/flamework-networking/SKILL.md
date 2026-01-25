# Flamework Networking Skill

**When to read this skill:**

- Setting up client-server communication
- Creating remote events or functions
- Sending data between client and server
- Debugging networking issues

## Design Philosophy

**PREFER LIGHTWEIGHT, SIGNAL-DRIVEN ARCHITECTURE:**

1. **Events over state sync** - Fire events when things change, don't poll for state
2. **Thin handlers** - Network handlers should validate and delegate, not contain logic
3. **Minimal payloads** - Send only what's needed, derive the rest
4. **ClientSignals for local events** - Use client-side signals to decouple UI from networking
5. **Single source of truth** - Define once in shared, import everywhere

## Core Concepts

### Flamework Networking Architecture

Flamework provides a type-safe networking layer that wraps Roblox RemoteEvents and RemoteFunctions. The key principle: **Define once, use everywhere.**

### The Single Source of Truth Pattern

**✅ CRITICAL:** Create networking definitions in ONE file, then export separate client and server instances.

```
src/shared/network/
├── flamework-remotes.ts     ← Define all events/functions here
├── server-network.ts         ← Server-side exports
└── client-network.ts         ← Client-side exports
```

## Setting Up Networking

### Step 1: Define Interfaces (flamework-remotes.ts)

```typescript
import { Networking } from "@flamework/networking";

// Events FROM client TO server
export interface ClientToServerEvents {
	player: {
		// Client tells server about actions
		performAction: (actionName: string, data: unknown) => void;
		requestRespawn: () => void;
	};
	combat: {
		attack: (targetPosition: Vector3) => void;
	};
}

// Events FROM server TO client
export interface ServerToClientEvents {
	ui: {
		// Server tells client to show UI
		showNotification: (message: string, duration: number) => void;
		updateHealth: (health: number, maxHealth: number) => void;
	};
}

// Functions: Client CALLS, Server RESPONDS
export interface ServerFunctions {
	data: {
		// Client requests data, server returns it
		getPlayerData: (dataId: string) => Promise<PlayerData>;
		purchaseItem: (itemId: string) => Promise<boolean>;
	};
}

// Functions: Server CALLS, Client RESPONDS (rare)
export interface ClientFunctions {
	validation: {
		// Server asks client to validate something
		confirmAction: (actionType: string) => Promise<boolean>;
	};
}

// Export the networking instances
export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
```

### Step 2: Create Server Exports (server-network.ts)

```typescript
import { GlobalEvents, GlobalFunctions } from "./flamework-remotes";

// Create server-side instances ONCE
export const Events = GlobalEvents.createServer();
export const Functions = GlobalFunctions.createServer();
```

### Step 3: Create Client Exports (client-network.ts)

```typescript
import { GlobalEvents, GlobalFunctions } from "./flamework-remotes";

// Create client-side instances ONCE
export const Events = GlobalEvents.createClient();
export const Functions = GlobalFunctions.createClient();
```

## Using Networking: Server Side

### Listening for Client Events

```typescript
import { Service, OnStart } from "@flamework/core";
import { Events } from "shared/network/server-network";

@Service()
export class CombatService implements OnStart {
	onStart() {
		// Listen for combat events from clients
		Events.combat.attack.connect((player, targetPosition) => {
			print(`${player.Name} attacked at ${targetPosition}`);
			this.handleAttack(player, targetPosition);
		});
	}

	private handleAttack(player: Player, position: Vector3) {
		// Validate and process attack
		// ...

		// Broadcast to all clients
		Events.ui.updateHealth.broadcast(75, 100);

		// Or send to specific player
		Events.ui.showNotification(player, "Attack successful!", 2);
	}
}
```

### Implementing Server Functions

```typescript
import { Service, OnStart } from "@flamework/core";
import { Functions } from "shared/network/server-network";
import { PlayerData } from "shared/types";

@Service()
export class DataService implements OnStart {
	private playerData = new Map<Player, PlayerData>();

	onStart() {
		// Implement server function
		Functions.data.getPlayerData.setCallback((player, dataId) => {
			const data = this.playerData.get(player);
			if (!data) {
				return Promise.reject("Data not found");
			}
			return Promise.resolve(data);
		});

		Functions.data.purchaseItem.setCallback((player, itemId) => {
			// Process purchase
			const success = this.processPurchase(player, itemId);
			return Promise.resolve(success);
		});
	}

	private processPurchase(player: Player, itemId: string): boolean {
		// Purchase logic
		return true;
	}
}
```

## Using Networking: Client Side

### Sending Events to Server

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Events } from "shared/network/client-network";
import { UserInputService } from "@rbxts/services";

@Controller()
export class InputController implements OnStart {
	onStart() {
		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;

			if (input.KeyCode === Enum.KeyCode.Space) {
				// Send attack event to server
				Events.combat.attack.fire(new Vector3(0, 0, 0));
			}

			if (input.KeyCode === Enum.KeyCode.R) {
				// Request respawn
				Events.player.requestRespawn.fire();
			}
		});
	}
}
```

### Listening for Server Events

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Events } from "shared/network/client-network";

@Controller()
export class UIController implements OnStart {
	onStart() {
		// Listen for UI updates from server
		Events.ui.showNotification.connect((message, duration) => {
			print(`Notification: ${message} for ${duration}s`);
			this.displayNotification(message, duration);
		});

		Events.ui.updateHealth.connect((health, maxHealth) => {
			print(`Health: ${health}/${maxHealth}`);
			this.updateHealthBar(health, maxHealth);
		});
	}

	private displayNotification(message: string, duration: number) {
		// Show notification UI
	}

	private updateHealthBar(health: number, maxHealth: number) {
		// Update health bar UI
	}
}
```

### Calling Server Functions

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Functions } from "shared/network/client-network";

@Controller()
export class ShopController implements OnStart {
	public async purchaseItem(itemId: string) {
		try {
			// Call server function
			const success = await Functions.data.purchaseItem(itemId);

			if (success) {
				print(`Successfully purchased ${itemId}`);
			} else {
				print("Purchase failed!");
			}
		} catch (error) {
			warn(`Purchase error: ${error}`);
		}
	}

	public async loadPlayerData() {
		try {
			const data = await Functions.data.getPlayerData("player_stats");
			print(`Loaded data: ${data}`);
			return data;
		} catch (error) {
			warn(`Failed to load data: ${error}`);
		}
	}
}
```

## Namespacing Pattern

**✅ Best Practice:** Group related events into namespaces for organization.

```typescript
export interface ClientToServerEvents {
	// Namespace by feature
	player: {
		jump: () => void;
		crouch: () => void;
	};
	combat: {
		attack: (target: Vector3) => void;
		block: () => void;
	};
	inventory: {
		equipItem: (itemId: string) => void;
		dropItem: (itemId: string) => void;
	};
}
```

## Broadcasting Patterns

```typescript
// Server-side broadcasting options

// 1. Broadcast to ALL clients
Events.ui.showNotification.broadcast("Server announcement!", 5);

// 2. Send to specific player
Events.ui.showNotification(player, "Welcome!", 3);

// 3. Send to multiple players
const players = [player1, player2, player3];
for (const p of players) {
	Events.ui.showNotification(p, "Team message!", 2);
}

// 4. Broadcast EXCEPT specific player
Events.ui.showNotification.except(player, "Other players see this!", 4);
```

## Anti-Patterns to Avoid

### ❌ Multiple createServer/createClient Calls

```typescript
// BAD - Creates duplicate remotes!
// In ServiceA:
const Events = GlobalEvents.createServer(); // First instance

// In ServiceB:
const Events = GlobalEvents.createServer(); // Second instance - WRONG!
```

### ✅ Single Export, Import Everywhere

```typescript
// GOOD - server-network.ts (created ONCE)
export const Events = GlobalEvents.createServer();

// Import it in every service
import { Events } from "shared/network/server-network";
```

### ❌ Not Using Namespaces

```typescript
// BAD - Flat structure gets messy
export interface ClientToServerEvents {
	playerJump: () => void;
	playerCrouch: () => void;
	combatAttack: () => void;
	combatBlock: () => void;
	// Gets hard to manage...
}
```

### ✅ Use Namespaces

```typescript
// GOOD - Organized by feature
export interface ClientToServerEvents {
	player: {
		jump: () => void;
		crouch: () => void;
	};
	combat: {
		attack: () => void;
		block: () => void;
	};
}
```

### ❌ Not Handling Function Errors

```typescript
// BAD - No error handling
const data = await Functions.data.getPlayerData("123");
// What if it fails?
```

### ✅ Always Handle Errors

```typescript
// GOOD - Proper error handling
try {
	const data = await Functions.data.getPlayerData("123");
	print(data);
} catch (error) {
	warn(`Failed to get data: ${error}`);
}
```

### ❌ Sending Instances Over Network

```typescript
// BAD - Can't send instances!
Events.data.sendPart.fire(workspace.Part); // Error!
```

### ✅ Send Data, Not Instances

```typescript
// GOOD - Send data about the part
Events.data.sendPartInfo.fire(workspace.Part.Name, workspace.Part.Position);
```

## Type Safety Benefits

```typescript
// TypeScript will catch these errors at compile time:

// ❌ Wrong parameter type
Events.combat.attack.fire("not a Vector3"); // Error!

// ❌ Wrong parameter count
Events.player.requestRespawn.fire("extra param"); // Error!

// ❌ Typo in event name
Events.combat.atack.fire(pos); // Error! (typo: 'atack')

// ✅ Correct usage
Events.combat.attack.fire(new Vector3(0, 0, 0)); // Works!
```

## Key Takeaways

- Define networking interfaces in **ONE** file (flamework-remotes.ts)
- Create server and client exports in separate files
- **Never** call `createServer()` or `createClient()` more than once
- **Events over polling** - fire when things change
- **Thin handlers** - validate and delegate, don't embed logic
- Use **namespaces** to organize events by feature
- Use **ClientSignals** to decouple local UI from network events
- Always handle errors when calling functions
- Can't send Roblox instances over network - send data instead
- Server can broadcast to all, specific players, or all except one
- Type safety catches errors at compile time
