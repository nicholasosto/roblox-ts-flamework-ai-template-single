# Skills API Reference

## Creating a Skill

### TypeScript
```ts
import { Skill, SkillDecorator } from "@rbxts/wcs";

@SkillDecorator
export class Attack extends Skill {}
```

### Luau
```lua
local WCS = require(ReplicatedStorage.WCS)
local Attack = WCS.RegisterSkill("Attack")
return Attack
```

## Key Properties

### `Character` (readonly)
The Character object this skill is tied to.

### `Player` (readonly)
The Player object associated with the skill.

### `Name` (readonly)
The skill's name (string).

### `CheckOthersActive` (boolean)
If true, checks that other skills are not active before Start() proceeds. Default: true.

### `CheckedByOthers` (boolean)
If true, other skills will check if this skill is active before they start. Default: true.

### `MutualExclusives` (Constructor<AnyStatus>[])
Array of StatusEffect constructors. If any are applied to the Character, Start() will not proceed.

### `Requirements` (Constructor<AnyStatus>[])
Array of StatusEffect constructors that must be applied to the Character for Start() to proceed.

### `ParamValidators` (Validator[])
Array of validator functions that validate starter params.

## Key Methods

### `Start(params?)`
**Server**: Starts the skill.
**Client**: Sends request to server to start the skill.

### `End()` / `Stop()`
Force end the skill. Automatically called after OnStartServer() completes.

### `ApplyCooldown(seconds: number)`
Applies a cooldown to the skill (server only).

### `ExtendCooldown(seconds: number)`
Extends current cooldown (server only).

### `CancelCooldown()`
Cancels current cooldown.

### `CreateDamageContainer(damage: number)`
Creates a damage container with this skill as the source.

### `GetState()`
Returns the current skill state: `{ IsActive: boolean }`

### `SetMetadata(meta)` / `GetMetadata()` / `ClearMetadata()`
Manage skill metadata (replicated from server to client).

## Lifecycle Hooks (Override These)

### `OnConstruct(...args)`
Called after instantiation on both client and server.

### `OnConstructServer(...args)`
Called after instantiation on server only.

### `OnConstructClient(...args)`
Called after instantiation on client only.

### `ShouldStart(): boolean`
Return false to prevent the skill from starting. Called before Start().

### `OnStartServer(params?)`
Called when skill starts on server. This is where main skill logic goes.

### `OnStartClient(params?)`
Called when skill starts on client. Use for visual effects, animations, sounds.

### `AssumeStart(params?)`
Called on client right after Start() request is sent, assuming the skill will start.

### `OnEndServer()`
Called when skill ends on server. Use for cleanup.

### `OnEndClient()`
Called when skill ends on client. Use for cleanup.

## Events

### `Started`
Fires when skill starts (client and server).

### `Ended`
Fires when skill ends (client and server).

### `StateChanged`
Fires when skill state changes.
**Parameters**: `(NewState, OldState)`

### `MetadataChanged`
Fires when metadata changes.
**Parameters**: `(NewMeta, OldMeta)`

### `Destroyed`
Fires when skill is destroyed/removed from character.

## Common Patterns

### Basic Attack Skill
```ts
@SkillDecorator
export class Attack extends Skill {
	public OnStartServer() {
		print("Attack!");
		this.ApplyCooldown(1);
	}
}
```

### Skill with Parameters
```ts
@SkillDecorator
export class Fireball extends Skill {
	public OnStartServer(target: Vector3) {
		// Spawn fireball towards target
		this.ApplyCooldown(3);
	}
}

// Usage: skill.Start(targetPosition)
```

### Skill with Requirements
```ts
@SkillDecorator
export class UltimateAttack extends Skill {
	public OnConstruct() {
		this.Requirements = [PoweredUp]; // Requires PoweredUp status
		this.MutualExclusives = [Stunned]; // Can't use while stunned
	}

	public OnStartServer() {
		// Ultimate attack logic
		this.ApplyCooldown(10);
	}
}
```

### Holdable Skill (Channeled)
For skills that continue while held:
```ts
import { HoldableSkill, HoldableSkillDecorator } from "@rbxts/wcs";

@HoldableSkillDecorator
export class Channel extends HoldableSkill {
	public MaxHoldTime = 5;

	public OnStartServer() {
		print("Started channeling");
	}

	public OnEndServer() {
		print("Stopped channeling");
	}
}
```
