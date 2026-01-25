# Flamework Component Skill

**When to read this skill:**

- Creating UI components or game object behaviors
- Working with Roblox instances that have attributes
- Need to attach logic to specific instances in the workspace
- Managing component lifecycle (creation, updates, destruction)

## Design Philosophy

**PREFER LIGHTWEIGHT, MINIMAL IMPLEMENTATIONS:**

1. **Components own their own state** - Let the instance/attributes be the source of truth
2. **Self-contained** - Components should manage themselves, not rely on external controllers tracking them
3. **Reactive** - Use `onAttributeChanged()` instead of polling or external state
4. **Minimal API** - Expose only what other systems genuinely need
5. **Clean lifecycle** - Setup in `onStart()`, cleanup in `destroy()`, nothing else

## Core Concepts

### What is a Component?

A Flamework Component is a class that attaches logic to Roblox instances. Components can be used on both client and server, and they listen for instances with specific attributes.

### Basic Component Pattern

```typescript
import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";

interface Attributes {
	Health: number;
	MaxHealth: number;
}

@Component({
	tag: "Damageable", // Instances need CollectionService tag "Damageable"
})
export class DamageableComponent extends BaseComponent<Attributes> implements OnStart {
	onStart() {
		print(`Damageable component attached to ${this.instance.Name}`);
		print(`Health: ${this.attributes.Health}/${this.attributes.MaxHealth}`);
	}
}
```

## Attributes Interface

**✅ Best Practice:** Always define an Attributes interface for type safety.

```typescript
interface Attributes {
	Speed: number;
	Color: Color3;
	Enabled: boolean;
}

@Component({ tag: "MovingPart" })
export class MovingPartComponent extends BaseComponent<Attributes, Part> {
	// `this.attributes` is now typed!
	// `this.instance` is typed as Part

	onStart() {
		this.instance.Color = this.attributes.Color;
		this.move();
	}

	private move() {
		if (!this.attributes.Enabled) return;

		const speed = this.attributes.Speed;
		// Movement logic...
	}
}
```

## Listening for Attribute Changes

```typescript
import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";

interface Attributes {
	Brightness: number;
	LightEnabled: boolean;
}

@Component({ tag: "DynamicLight" })
export class DynamicLightComponent extends BaseComponent<Attributes, Part> implements OnStart {
	private light?: SpotLight;

	onStart() {
		// Create light
		this.light = new Instance("SpotLight");
		this.light.Parent = this.instance;

		// Set initial values
		this.updateLight();

		// Listen for attribute changes
		this.onAttributeChanged("Brightness", (newValue) => {
			if (this.light) {
				this.light.Brightness = newValue;
			}
		});

		this.onAttributeChanged("LightEnabled", (enabled) => {
			if (this.light) {
				this.light.Enabled = enabled;
			}
		});
	}

	private updateLight() {
		if (!this.light) return;
		this.light.Brightness = this.attributes.Brightness;
		this.light.Enabled = this.attributes.LightEnabled;
	}
}
```

## Component Lifecycle

```typescript
import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";

interface Attributes {
	RotationSpeed: number;
}

@Component({ tag: "Spinner" })
export class SpinnerComponent extends BaseComponent<Attributes, BasePart> implements OnStart {
	private connection?: RBXScriptConnection;

	// 1. Constructor - Component created
	constructor() {
		super();
		print("Spinner constructed");
	}

	// 2. onStart - Safe to start logic
	onStart() {
		print("Spinner started");
		this.startSpinning();
	}

	// 3. onDestroy - Cleanup when component removed
	destroy() {
		print("Spinner destroyed - cleaning up");
		if (this.connection) {
			this.connection.Disconnect();
		}
	}

	private startSpinning() {
		const RunService = game.GetService("RunService");
		this.connection = RunService.Heartbeat.Connect((dt) => {
			const rotation = this.attributes.RotationSpeed * dt;
			this.instance.CFrame = this.instance.CFrame.mul(CFrame.Angles(0, rotation, 0));
		});
	}
}
```

## Dependency Injection in Components

Components can depend on Services:

```typescript
import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { SoundService } from "server/services/sound-service";

interface Attributes {
	SoundId: string;
	Volume: number;
}

@Component({ tag: "SoundEmitter" })
export class SoundEmitterComponent extends BaseComponent<Attributes, Part> implements OnStart {
	// Inject service
	constructor(private readonly soundService: SoundService) {
		super();
	}

	onStart() {
		// Use the injected service
		this.soundService.playSound(this.attributes.SoundId, this.instance.Position);
	}
}
```

## Common Patterns

### 1. UI Component (Client-Side)

```typescript
import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";

interface Attributes {
	Title: string;
	Visible: boolean;
}

@Component({ tag: "MenuUI" })
export class MenuUIComponent extends BaseComponent<Attributes, ScreenGui> implements OnStart {
	private titleLabel?: TextLabel;

	onStart() {
		// Find UI elements
		this.titleLabel = this.instance.FindFirstChild("Title") as TextLabel;

		if (this.titleLabel) {
			this.titleLabel.Text = this.attributes.Title;
		}

		this.instance.Enabled = this.attributes.Visible;

		// Listen for visibility changes
		this.onAttributeChanged("Visible", (visible) => {
			this.instance.Enabled = visible;
		});
	}
}
```

### 2. Collectible Item (Server-Side)

```typescript
import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

interface Attributes {
	CoinValue: number;
	Respawns: boolean;
	RespawnTime: number;
}

@Component({ tag: "Coin" })
export class CoinComponent extends BaseComponent<Attributes, BasePart> implements OnStart {
	onStart() {
		this.instance.Touched.Connect((otherPart) => {
			const player = Players.GetPlayerFromCharacter(otherPart.Parent);
			if (player) {
				this.collect(player);
			}
		});
	}

	private collect(player: Player) {
		print(`${player.Name} collected ${this.attributes.CoinValue} coins!`);

		// Hide the coin
		this.instance.Transparency = 1;
		this.instance.CanCollide = false;

		// Respawn if enabled
		if (this.attributes.Respawns) {
			task.wait(this.attributes.RespawnTime);
			this.instance.Transparency = 0;
			this.instance.CanCollide = true;
		} else {
			this.instance.Destroy();
		}
	}
}
```

## Anti-Patterns to Avoid

### ❌ Missing Cleanup in destroy()

```typescript
// BAD - Connections not cleaned up
onStart() {
	this.instance.Touched.Connect(() => { ... });
	// No cleanup in destroy()!
}
```

### ✅ Always Clean Up Resources

```typescript
// GOOD - Store and disconnect connections
private touchConnection?: RBXScriptConnection;

onStart() {
	this.touchConnection = this.instance.Touched.Connect(() => { ... });
}

destroy() {
	if (this.touchConnection) {
		this.touchConnection.Disconnect();
	}
}
```

### ❌ Not Using Attributes Interface

```typescript
// BAD - Untyped, error-prone
@Component({ tag: "MyComponent" })
export class MyComponent extends BaseComponent {
	onStart() {
		const speed = this.instance.GetAttribute("Speed"); // any type
	}
}
```

### ✅ Type Your Attributes

```typescript
// GOOD - Type-safe
interface Attributes {
	Speed: number;
}

@Component({ tag: "MyComponent" })
export class MyComponent extends BaseComponent<Attributes> {
	onStart() {
		const speed = this.attributes.Speed; // typed as number
	}
}
```

### ❌ Forgetting Instance Type

```typescript
// BAD - instance is generic Instance
@Component({ tag: "Door" })
export class DoorComponent extends BaseComponent<Attributes> {
	onStart() {
		this.instance.Anchored = true; // Error! Generic Instance has no Anchored
	}
}
```

### ✅ Specify Instance Type

```typescript
// GOOD - instance is specifically a Part
@Component({ tag: "Door" })
export class DoorComponent extends BaseComponent<Attributes, Part> {
	onStart() {
		this.instance.Anchored = true; // Works!
	}
}
```

## Setting Up Components in Studio

1. **Add the CollectionService tag** to instances in Studio
2. **Set attributes** on the instance (match your Attributes interface)
3. Component automatically attaches when Flamework starts

Example in Studio:

- Tag: `"Spinner"`
- Attribute: `RotationSpeed: number = 2`

## Key Takeaways

- Components attach logic to specific instances via CollectionService tags
- **Components own their state** - don't duplicate in controllers
- **Self-contained** - components manage themselves
- Always define an **Attributes interface** for type safety
- Specify the **instance type** as the second generic parameter
- Use `onAttributeChanged()` to react to attribute updates
- **Always clean up** in the `destroy()` method
- Components can inject Services for shared logic
- Can be used on both client and server
