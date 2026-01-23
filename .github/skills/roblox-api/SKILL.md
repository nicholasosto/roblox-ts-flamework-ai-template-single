# Roblox API Skill

**When to read this skill:**

- Working with Roblox instances (Parts, Models, Characters, etc.)
- Performing operations on Humanoids, Players, or game objects
- Need to clear, destroy, or manipulate instances efficiently
- Wondering if there's a native method for a common operation

## Core Principle

**Use native Roblox methods instead of manual iteration whenever possible.**

Many developers write manual loops to accomplish tasks that Roblox already provides efficient methods for. This leads to verbose code, potential bugs, and worse performance.

## Common Operations

### 1. Clearing Children from an Instance

#### ❌ Manual Iteration (Don't Do This)

```typescript
// BAD - Manual iteration is verbose and slower
const folder = workspace.FindFirstChild("ItemsFolder");
if (folder) {
	for (const child of folder.GetChildren()) {
		child.Destroy();
	}
}
```

#### ✅ Use ClearAllChildren()

```typescript
// GOOD - Native method is cleaner and faster
const folder = workspace.FindFirstChild("ItemsFolder");
if (folder) {
	folder.ClearAllChildren();
}
```

### 2. Removing Character Accessories

#### ❌ Manual Iteration

```typescript
// BAD - Manual removal is error-prone
const character = player.Character;
if (character) {
	for (const child of character.GetChildren()) {
		if (child.IsA("Accessory")) {
			child.Destroy();
		}
	}
}
```

#### ✅ Use RemoveAccessories()

```typescript
// GOOD - Humanoid has a built-in method
const character = player.Character;
if (character) {
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		humanoid.RemoveAccessories();
	}
}
```

### 3. Getting Players Service

#### ❌ Manual Instance Access

```typescript
// BAD - Direct game access without typing
const players = game.GetService("Players") as Players;
```

#### ✅ Import from @rbxts/services

```typescript
// GOOD - Type-safe service access
import { Players } from "@rbxts/services";

// Now just use Players directly
Players.PlayerAdded.Connect((player) => {
	print(player.Name);
});
```

### 4. Finding Specific Instance Types

#### ❌ Manual Search with Type Checking

```typescript
// BAD - Manual iteration and type checking
let humanoid: Humanoid | undefined;
for (const child of character.GetChildren()) {
	if (child.IsA("Humanoid")) {
		humanoid = child as Humanoid;
		break;
	}
}
```

#### ✅ Use FindFirstChildOfClass()

```typescript
// GOOD - Native method finds and types correctly
const humanoid = character.FindFirstChildOfClass("Humanoid");
if (humanoid) {
	humanoid.Health = 100;
}
```

### 5. Checking if Instance is Descendant

#### ❌ Manual Parent Chain Walking

```typescript
// BAD - Manually walking up the tree
function isDescendantOf(instance: Instance, ancestor: Instance): boolean {
	let current = instance.Parent;
	while (current !== undefined) {
		if (current === ancestor) return true;
		current = current.Parent;
	}
	return false;
}
```

#### ✅ Use IsDescendantOf()

```typescript
// GOOD - Native method
if (part.IsDescendantOf(workspace)) {
	print("Part is in workspace!");
}
```

## Humanoid Methods

Humanoids have many useful built-in methods:

```typescript
import { Players } from "@rbxts/services";

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => {
		const humanoid = character.WaitForChild("Humanoid") as Humanoid;

		// Built-in humanoid methods
		humanoid.RemoveAccessories(); // Remove all accessories
		humanoid.TakeDamage(10); // Apply damage
		humanoid.ApplyDescription(humanoidDescription); // Apply appearance
		humanoid.UnequipTools(); // Unequip all tools

		// Check states
		const isRunning = humanoid.GetState() === Enum.HumanoidStateType.Running;

		// Change walkspeed
		humanoid.WalkSpeed = 32;
	});
});
```

## Instance Utility Methods

```typescript
// Clone instances
const copy = originalPart.Clone();

// Wait for children
const head = character.WaitForChild("Head") as Part;

// Find first ancestor of type
const model = part.FindFirstAncestorOfClass("Model");

// Get descendants of type
const allParts = model.GetDescendants().filter((d) => d.IsA("BasePart")) as BasePart[];

// Clear all children efficiently
folder.ClearAllChildren();

// Check class type
if (instance.IsA("Part")) {
	// TypeScript now knows this is a Part
	instance.Anchored = true;
}
```

## Service Access Pattern

Always import services from `@rbxts/services`:

```typescript
import {
	Players,
	Workspace,
	ReplicatedStorage,
	ServerScriptService,
	RunService,
	UserInputService,
	TweenService,
	CollectionService
} from "@rbxts/services";

// Usage is clean and typed
Players.PlayerAdded.Connect((player) => { ... });

if (RunService.IsServer()) {
	// Server-only code
}

const tween = TweenService.Create(part, new TweenInfo(1), { Position: new Vector3(0, 10, 0) });
tween.Play();
```

## Model Methods

```typescript
const model = new Instance("Model");

// Get primary part
const primaryPart = model.PrimaryPart;

// Move entire model
if (primaryPart) {
	model.SetPrimaryPartCFrame(new CFrame(0, 10, 0));
}

// Get bounding box
const [cframe, size] = model.GetBoundingBox();

// Break joints
model.BreakJoints();
```

## Collection Service

For tagged instances, use CollectionService:

```typescript
import { CollectionService } from "@rbxts/services";

// Get all instances with tag
const coins = CollectionService.GetTagged("Coin");

for (const coin of coins) {
	if (coin.IsA("BasePart")) {
		coin.Transparency = 0.5;
	}
}

// Listen for new tagged instances
CollectionService.GetInstanceAddedSignal("Coin").Connect((instance) => {
	print(`New coin added: ${instance.Name}`);
});

// Add/remove tags
CollectionService.AddTag(part, "Collectible");
CollectionService.RemoveTag(part, "Collectible");
```

## Common Native Methods Reference

| Task                | Native Method             | Manual Alternative        |
| ------------------- | ------------------------- | ------------------------- |
| Clear children      | `ClearAllChildren()`      | Loop + Destroy()          |
| Remove accessories  | `RemoveAccessories()`     | Loop + filter + Destroy() |
| Find by class       | `FindFirstChildOfClass()` | Loop + IsA() check        |
| Check descendant    | `IsDescendantOf()`        | Walk parent chain         |
| Get all descendants | `GetDescendants()`        | Recursive search          |
| Apply damage        | `TakeDamage()`            | `Health -= damage`        |
| Unequip tools       | `UnequipTools()`          | Loop through backpack     |

## Anti-Patterns Summary

### ❌ What to Avoid

- Manual iteration when native methods exist
- Using `game.GetService("ServiceName")` instead of importing from `@rbxts/services`
- Manually walking parent chains
- Manually filtering by instance type
- Reinventing built-in functionality

### ✅ What to Do

- Use native methods (ClearAllChildren, RemoveAccessories, etc.)
- Import services from `@rbxts/services`
- Use FindFirstChildOfClass, IsDescendantOf, etc.
- Check Roblox API documentation before implementing
- Use CollectionService for tagged instances

## Finding Native Methods

When you need to do something, ask:

1. **Does this instance type have a built-in method for this?**
    - Check the Roblox API documentation
    - Humanoid methods, Model methods, Instance methods

2. **Is there a service that handles this?**
    - CollectionService for tags
    - TweenService for animations
    - RunService for frame updates

3. **Can I use GetDescendants() or FindFirstChild()?**
    - Roblox's native search is optimized

## Key Takeaways

- **Always check for native methods first** before writing manual loops
- Import services from `@rbxts/services` for type safety
- Use `ClearAllChildren()` instead of manual deletion loops
- Use `RemoveAccessories()` for humanoids
- Use `FindFirstChildOfClass()` for type-specific searches
- Use `IsDescendantOf()` for hierarchy checks
- Humanoids have many useful built-in methods
- Native methods are faster and more reliable than manual implementations
