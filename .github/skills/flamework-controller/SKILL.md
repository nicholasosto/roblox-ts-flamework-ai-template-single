# Flamework Controller Skill

**When to read this skill:**

- Creating client-side game logic or UI controllers
- Managing client-only state and interactions
- Handling player input on the client
- Working with client-side lifecycle methods

## Design Philosophy

**PREFER LIGHTWEIGHT, MINIMAL IMPLEMENTATIONS:**

1. **Stateless over stateful** - Query components/instances on-demand instead of caching
2. **Signal-driven** - Use `ClientSignals` to trigger actions, not manual state tracking
3. **Framework features first** - Use `Components.getAllComponents()` instead of custom registries
4. **Simple over clever** - Start minimal, add complexity only when genuinely needed

## Core Concepts

### What is a Controller?

A Flamework Controller is a **client-only** singleton class that handles client-side game logic, UI management, and player interactions. Controllers are the client-side equivalent of Services.

### Minimal Controller Pattern (Preferred)

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { ClientSignals } from "shared/network/client-network";
import { GameScreen } from "client/components/ui";
import { ScreenKey } from "shared/types";

@Controller()
export class UIController implements OnStart {
	constructor(private components: Components) {}

	onStart(): void {
		// Register signal handlers - that's it!
		ClientSignals.toggleScreenRequest.Connect((screenKey?: ScreenKey) => this.onToggleScreen(screenKey));
	}

	private onToggleScreen(screenKey?: ScreenKey): void {
		// Query components on-demand - no caching needed
		this.components.getAllComponents<GameScreen>().forEach((screen) => {
			if (screenKey === screen.screenKey) {
				screen.isVisible() ? screen.hide() : screen.show();
			} else {
				screen.hide();
			}
		});
	}
}
```

### Why This Pattern?

- **No state to track** - Components know their own visibility
- **No cache to invalidate** - Fresh query every time
- **Signal-driven** - External systems fire signals, controller reacts
- **~30 lines** vs 200+ for a stateful implementation

### Basic Controller Pattern

```typescript
import { Controller, OnStart, OnInit } from "@flamework/core";

@Controller()
export class PlayerUIController implements OnStart, OnInit {
	// Lifecycle: Called first, before any onStart methods
	onInit() {
		// Initialize variables, but don't access other controllers yet
		print("PlayerUIController initializing...");
	}

	// Lifecycle: Called after all onInit methods complete
	onStart() {
		// Safe to access other controllers and start logic
		print("PlayerUIController started!");
	}
}
```

## Dependency Injection

Controllers can depend on other controllers through constructor injection:

```typescript
import { Controller, OnStart } from "@flamework/core";

@Controller()
export class UIController implements OnStart {
	public showNotification(message: string, duration: number) {
		print(`Notification: ${message}`);
		// UI logic...
	}

	onStart() {
		print("UIController ready");
	}
}

@Controller()
export class GameController implements OnStart {
	// Inject UIController
	constructor(private readonly uiController: UIController) {}

	onStart() {
		// Can safely use uiController here
		this.uiController.showNotification("Game started!", 3);
	}
}
```

## Client-Side Networking

Controllers handle client-to-server communication and receive server-to-client events:

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Events, Functions } from "shared/network/client-network";

@Controller()
export class CombatController implements OnStart {
	onStart() {
		// Listen for events from server
		Events.notification.show.connect((message, duration) => {
			print(`Server notification: ${message}`);
			// Show UI notification
		});
	}

	public performAttack() {
		// Send event to server
		Events.player.onAction.fire("attack");
		print("Attack sent to server!");
	}

	public async requestData(dataId: string) {
		// Call server function
		const data = await Functions.data.getData(dataId);
		print(`Received data: ${data}`);
		return data;
	}
}
```

## Input Handling

```typescript
import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";

@Controller()
export class InputController implements OnStart {
	constructor(private readonly combatController: CombatController) {}

	onStart() {
		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;

			if (input.KeyCode === Enum.KeyCode.Space) {
				this.combatController.performAttack();
			}
		});
	}
}
```

## Common Patterns

### 1. UI Management

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

@Controller()
export class MainMenuController implements OnStart {
	private menuGui?: ScreenGui;
	private playButton?: TextButton;

	onStart() {
		const player = Players.LocalPlayer;
		this.menuGui = player.WaitForChild("PlayerGui").WaitForChild("MainMenu") as ScreenGui;
		this.playButton = this.menuGui.WaitForChild("PlayButton") as TextButton;

		this.setupUI();
	}

	private setupUI() {
		if (!this.playButton) return;

		this.playButton.MouseButton1Click.Connect(() => {
			this.onPlayClicked();
		});
	}

	private onPlayClicked() {
		print("Play button clicked!");
		// Hide menu, start game, etc.
		if (this.menuGui) {
			this.menuGui.Enabled = false;
		}
	}

	public showMenu() {
		if (this.menuGui) {
			this.menuGui.Enabled = true;
		}
	}

	public hideMenu() {
		if (this.menuGui) {
			this.menuGui.Enabled = false;
		}
	}
}
```

### 2. Camera Controller

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Workspace, RunService } from "@rbxts/services";

@Controller()
export class CameraController implements OnStart {
	private camera = Workspace.CurrentCamera!;
	private updateConnection?: RBXScriptConnection;

	onStart() {
		this.camera.CameraType = Enum.CameraType.Scriptable;
		this.startCameraUpdate();
	}

	private startCameraUpdate() {
		this.updateConnection = RunService.RenderStepped.Connect((dt) => {
			// Custom camera logic
			this.updateCamera(dt);
		});
	}

	private updateCamera(deltaTime: number) {
		// Camera update logic
	}

	public setCameraPosition(position: Vector3) {
		this.camera.CFrame = new CFrame(position);
	}

	public destroy() {
		if (this.updateConnection) {
			this.updateConnection.Disconnect();
		}
	}
}
```

### 3. Sound Controller

```typescript
import { Controller, OnStart } from "@flamework/core";
import { SoundService } from "@rbxts/services";

@Controller()
export class SoundController implements OnStart {
	private sounds = new Map<string, Sound>();

	onStart() {
		this.loadSounds();
	}

	private loadSounds() {
		// Load commonly used sounds
		this.registerSound("click", "rbxassetid://12345");
		this.registerSound("victory", "rbxassetid://67890");
	}

	private registerSound(name: string, assetId: string) {
		const sound = new Instance("Sound");
		sound.SoundId = assetId;
		sound.Parent = SoundService;
		this.sounds.set(name, sound);
	}

	public playSound(name: string) {
		const sound = this.sounds.get(name);
		if (sound) {
			sound.Play();
		} else {
			warn(`Sound not found: ${name}`);
		}
	}

	public stopSound(name: string) {
		const sound = this.sounds.get(name);
		if (sound) {
			sound.Stop();
		}
	}
}
```

### 4. Data Synchronization

```typescript
import { Controller, OnStart } from "@flamework/core";
import { Events } from "shared/network/client-network";
import { PlayerData } from "shared/types";

@Controller()
export class PlayerDataController implements OnStart {
	private playerData?: PlayerData;

	onStart() {
		// Listen for data updates from server
		Events.data.update.connect((data: PlayerData) => {
			this.playerData = data;
			print(`Player data updated: ${data.coins} coins, Level ${data.level}`);
		});
	}

	public getPlayerData(): PlayerData | undefined {
		return this.playerData;
	}
}
```

## Anti-Patterns to Avoid

### ❌ Over-engineered State Management

```typescript
// BAD - Too much internal state when components track their own
@Controller()
export class OverEngineeredUIController {
	private currentScreen: ScreenKey | undefined;
	private screens = new Map<ScreenKey, GameScreen>();
	public readonly screenChanged = new Signal();
	public readonly screenOpened = new Signal();
	public readonly screenClosed = new Signal();

	// 200+ lines of state management...
}
```

### ✅ Query On-Demand, Let Components Own State

```typescript
// GOOD - Stateless, signal-driven, minimal
@Controller()
export class LightweightUIController {
	constructor(private components: Components) {}

	onStart(): void {
		ClientSignals.toggleScreenRequest.Connect((key) => this.toggle(key));
	}

	private toggle(key?: ScreenKey): void {
		this.components.getAllComponents<GameScreen>().forEach((screen) => {
			key === screen.screenKey ? screen.toggle() : screen.hide();
		});
	}
}
```

### ❌ Heavy Logic in Constructor

```typescript
// BAD - Constructor runs before other controllers are ready
constructor() {
	this.setupUI(); // Don't do this!
	UserInputService.InputBegan.Connect(...); // Or this!
}
```

### ✅ Use onInit or onStart Instead

```typescript
// GOOD - Use lifecycle methods
onStart() {
	this.setupUI();
	UserInputService.InputBegan.Connect(...);
}
```

### ❌ Manual Controller Instantiation

```typescript
// BAD - Don't manually create controllers
const myController = new MyGameController();
```

### ✅ Use Dependency Injection

```typescript
// GOOD - Let Flamework inject it
constructor(private readonly myController: MyGameController) {}
```

### ❌ Server Operations on Client

```typescript
// BAD - Don't try to modify server-owned instances
@Controller()
export class BadController {
	onStart() {
		const serverPart = Workspace.FindFirstChild("ServerPart") as Part;
		serverPart.Destroy(); // This won't replicate!
	}
}
```

### ✅ Request Server to Modify

```typescript
// GOOD - Ask server to make changes
@Controller()
export class GoodController {
	onStart() {
		// Send request to server
		Events.game.destroyPart.fire("ServerPart");
	}
}
```

### ❌ Not Handling Async Functions

```typescript
// BAD - Not awaiting or handling promise
onStart() {
	Functions.data.getData("123"); // Promise ignored!
}
```

### ✅ Properly Handle Async

```typescript
// GOOD - Await the result
async onStart() {
	const data = await Functions.data.getData("123");
	print(data);
}

// Or use .then()
onStart() {
	Functions.data.getData("123").then((data) => {
		print(data);
	});
}
```

## Lifecycle Order

1. **Constructor** - Controllers instantiated (avoid heavy logic)
2. **onInit()** - Controllers initialized (set up variables)
3. **onStart()** - Controllers started (safe to access other controllers)

## Key Differences from Services

| Services              | Controllers           |
| --------------------- | --------------------- |
| Server-only           | Client-only           |
| Handle game logic     | Handle UI and input   |
| Process server events | Process client events |
| Modify game state     | Display game state    |

## Key Takeaways

- Controllers are **client-only** singletons
- **Start minimal** - add complexity only when needed
- **Prefer stateless** - query components on-demand
- **Signal-driven** - react to `ClientSignals`, don't poll
- Use **dependency injection** for controller dependencies
- Handle player input and UI in controllers
- Use client-side networking to communicate with server
- Keep constructors lightweight
- Do setup work in `onInit()` and `onStart()`
- Never manually instantiate controllers
- Don't try to modify server-owned instances directly
