# Status Effects API Reference

## Creating a Status Effect

### TypeScript
```ts
import { StatusEffect, StatusEffectDecorator } from "@rbxts/wcs";

@StatusEffectDecorator
export class Stun extends StatusEffect {}
```

### Luau
```lua
local WCS = require(ReplicatedStorage.WCS)
local Stun = WCS.RegisterStatusEffect("Stun")
return Stun
```

## Key Properties

### `Character` (readonly)
The Character object this status effect is tied to.

### `Player` (readonly)
The Player object associated with the status effect.

### `Name` (readonly)
The status effect's name (string).

### `DestroyOnEnd` (boolean)
If true, calls Destroy() when End() is fired. Default: true.

### `DamageModificationPriority` (number)
Priority for HandleDamage() application. Higher = applies later. Default: 1.

## Key Methods

### `Start(duration?: number)`
Starts the status effect. If duration is provided, automatically ends after that many seconds.

### `End()` / `Stop()`
Ends the status effect.

### `Pause()`
Pauses the internal timer. Warns if duration wasn't provided in Start().

### `Resume()`
Resumes the internal timer.

### `SetHumanoidData(data, priority?)`
Sets humanoid properties (WalkSpeed, JumpPower, etc). Higher priority values override lower ones.

**Example**:
```ts
this.SetHumanoidData({
	WalkSpeed: 32,
	JumpPower: 100
}, 2);
```

### `ClearHumanoidData()`
Clears the currently set humanoid data.

### `GetHumanoidData()`
Retrieves the currently set humanoid data.

### `SetMetadata(meta)` / `GetMetadata()` / `ClearMetadata()`
Manage status effect metadata (replicated from server to client).

### `GetState()`
Returns: `{ IsActive: boolean }`

### `GetStartTimestamp()` / `GetEndTimestamp()`
Returns the start/end timestamp if the internal timer is active.

## Lifecycle Hooks (Override These)

### `OnConstructServer(...args)`
Called after instantiation on server only.

### `OnConstructClient(...args)`
Called after instantiation on client only.

### `OnStartServer()`
Called when status effect starts on server.

### `OnStartClient()`
Called when status effect starts on client. Use for visual effects.

### `OnEndServer()`
Called when status effect ends on server.

### `OnEndClient()`
Called when status effect ends on client.

### `HandleDamage(modified: number, original: number, source?): number`
Modify damage taken/dealt by this character.
- `modified`: Previously modified damage (by other status effects)
- `original`: Original damage value
- `source`: Damage source (skill/status or nil)

**Return**: Modified damage value

## Events

### `Started`
Fires when status effect starts.

### `Ended`
Fires when status effect ends.

### `StateChanged`
Fires when state changes.
**Parameters**: `(NewState, OldState)`

### `HumanoidDataChanged`
Fires when humanoid data changes.
**Parameters**: `(NewData, OldData)`

### `MetadataChanged`
Fires when metadata changes.
**Parameters**: `(NewMeta, OldMeta)`

### `Destroyed`
Fires when status effect is destroyed/removed.

## Common Patterns

### Timed Speed Boost
```ts
@StatusEffectDecorator
export class SpeedBoost extends StatusEffect {
	public OnStartServer() {
		this.SetHumanoidData({
			WalkSpeed: 32
		});
	}
}

// Usage:
const boost = new SpeedBoost(character);
boost.Start(5); // Lasts 5 seconds, auto-ends
```

### Damage Reduction
```ts
@StatusEffectDecorator
export class Shield extends StatusEffect {
	public DamageModificationPriority = 10; // Apply late

	public HandleDamage(modified: number, original: number) {
		return modified * 0.5; // Reduce damage by 50%
	}
}
```

### Stun Effect
```ts
@StatusEffectDecorator
export class Stun extends StatusEffect {
	public OnStartServer() {
		this.SetHumanoidData({
			WalkSpeed: 0,
			JumpPower: 0
		});
		this.Character.DisableSkills = true;
	}

	public OnEndServer() {
		this.Character.DisableSkills = false;
	}
}
```

### Damage Over Time
```ts
@StatusEffectDecorator
export class Burn extends StatusEffect {
	private interval?: () => void;

	public OnStartServer() {
		let elapsed = 0;
		this.interval = setInterval(() => {
			const damage = this.CreateDamageContainer(5);
			this.Character.TakeDamage(damage);

			elapsed += 1;
			if (elapsed >= 5) this.End();
		}, 1000);
	}

	public OnEndServer() {
		if (this.interval) clearInterval(this.interval);
	}

	private CreateDamageContainer(dmg: number) {
		return {
			Damage: dmg,
			Source: this
		};
	}
}
```

### Permanent Status (Manual End)
```ts
const status = new MyStatus(character);
status.Start(); // No duration - must call status.End() manually

// Later:
status.End();
```

### Prevent Auto-Destroy
```ts
@StatusEffectDecorator
export class Persistent extends StatusEffect {
	public OnConstructServer() {
		this.DestroyOnEnd = false; // Won't auto-destroy on End()
	}

	public OnStartServer() {
		// Status logic
	}
}

// Must manually destroy when done:
const status = new Persistent(character);
status.Start(5);
// After it ends, manually:
status.Destroy();
```
