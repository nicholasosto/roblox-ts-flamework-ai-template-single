---
name: wcs
description: WCS (Weapon Combat System) - Combat system framework for roblox-ts and Luau. Use when creating combat systems, abilities, skills, attacks, spells, status effects (buffs/debuffs/stuns/slows), movesets, character combat wrappers, or implementing any combat mechanics in Roblox games. Handles replication, cooldowns, damage, humanoid property modification, and client-server communication for combat systems.
---

# WCS (Weapon Combat System) Framework

WCS is a combat system framework for Roblox that provides abstraction for creating any kind of combat system. It handles replication, skill creation, status effects, and server requests automatically.

## Installation

See [references/installation.md](references/installation.md) for detailed installation instructions.

**Quick start**:
```bash
npm i @rbxts/wcs@latest  # TypeScript
```

Or add to `wally.toml`:
```toml
wcs = "cheetiedotpy/wcs@2.5.0"  # Luau
```

## Core Concepts

WCS has four main components:

1. **Character** - Wrapper for Roblox character models
2. **Skills** - Combat abilities (attacks, spells, special moves)
3. **Status Effects** - Buffs, debuffs, and side effects
4. **Movesets** - Groups of skills for character classes

## Quick Start Workflow

### 1. Set Up Characters

Create WCS Character wrappers for players:

**TypeScript**:
```ts
import { Players } from "@rbxts/services";
import { Character } from "@rbxts/wcs";

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((charModel) => {
		const wcsChar = new Character(charModel);

		const humanoid = charModel.WaitForChild("Humanoid") as Humanoid;
		humanoid.Died.Once(() => wcsChar.Destroy());
	});
});
```

**Luau**:
```lua
local Players = game:GetService("Players")
local WCS = require(ReplicatedStorage.WCS)

Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(charModel)
		local wcsChar = WCS.Character.new(charModel)

		local humanoid = charModel:WaitForChild("Humanoid")
		humanoid.Died:Once(function()
			wcsChar:Destroy()
		end)
	end)
end)
```

See [assets/character-setup-template.ts](assets/character-setup-template.ts) for a complete template.

### 2. Create Skills

Skills are abilities that characters can use (attacks, spells, dashes, etc.).

**TypeScript**:
```ts
import { Skill, SkillDecorator } from "@rbxts/wcs";

@SkillDecorator
export class Attack extends Skill {
	public OnStartServer() {
		print("Attack!");
		this.ApplyCooldown(1); // 1 second cooldown
	}

	public OnStartClient() {
		// Play attack animation
	}
}
```

**Luau**:
```lua
local WCS = require(ReplicatedStorage.WCS)
local Attack = WCS.RegisterSkill("Attack")

function Attack:OnStartServer()
	print("Attack!")
	self:ApplyCooldown(1)
end

function Attack:OnStartClient()
	-- Play attack animation
end

return Attack
```

See [assets/skill-template.ts](assets/skill-template.ts) for a detailed template.

**Key skill methods to override**:
- `OnStartServer()` - Main skill logic (server)
- `OnStartClient()` - Visual effects, animations (client)
- `ShouldStart()` - Return false to prevent skill activation
- `OnEndServer()` / `OnEndClient()` - Cleanup when skill ends

**For complete Skills API**, see [references/skills-api.md](references/skills-api.md).

### 3. Create Status Effects

Status effects modify character properties or behavior (buffs, debuffs, stuns, damage over time).

**TypeScript**:
```ts
import { StatusEffect, StatusEffectDecorator } from "@rbxts/wcs";

@StatusEffectDecorator
export class SpeedBoost extends StatusEffect {
	public OnStartServer() {
		this.SetHumanoidData({
			WalkSpeed: 32
		});
	}
}
```

**Luau**:
```lua
local WCS = require(ReplicatedStorage.WCS)
local SpeedBoost = WCS.RegisterStatusEffect("SpeedBoost")

function SpeedBoost:OnStartServer()
	self:SetHumanoidData({
		WalkSpeed = 32
	})
end

return SpeedBoost
```

See [assets/status-effect-template.ts](assets/status-effect-template.ts) for a detailed template.

**Key status effect methods**:
- `SetHumanoidData()` - Modify WalkSpeed, JumpPower, etc.
- `HandleDamage()` - Modify damage taken/dealt
- `Start(duration?)` - Start the effect, optionally with auto-end timer

**For complete Status Effects API**, see [references/status-effects-api.md](references/status-effects-api.md).

### 4. Apply Skills to Characters

Add skills to characters individually or via movesets.

**Individual skills**:
```ts
import { Attack } from "./skills/attack";

const character = new Character(characterModel);
new Attack(character); // Adds attack skill
```

**Using movesets** (recommended for groups of skills):
```ts
import { CreateMoveset } from "@rbxts/wcs";
import { Attack, Dash, Block } from "./skills";

// Define moveset
export = CreateMoveset("Warrior", [Attack, Dash, Block]);

// Apply to character
character.ApplyMoveset(WarriorMoveset);
```

See [assets/moveset-template.ts](assets/moveset-template.ts) for a moveset template.

**For complete Movesets API**, see [references/movesets-api.md](references/movesets-api.md).

### 5. Start Skills and Apply Status Effects

**Start a skill from client**:
```ts
// Client calls Start(), automatically sends request to server
const attack = character.GetSkillFromConstructor(Attack);
attack?.Start();
```

**Apply status effect from a skill**:
```ts
@SkillDecorator
export class Dash extends Skill {
	public OnStartServer() {
		// Apply speed boost for 2 seconds
		const boost = new SpeedBoost(this.Character);
		boost.Start(2);

		this.ApplyCooldown(5);
	}
}
```

## Common Patterns

### Skill with Parameters
```ts
@SkillDecorator
export class Fireball extends Skill {
	public OnStartServer(target: Vector3) {
		// Spawn projectile toward target
		this.ApplyCooldown(3);
	}
}

// Usage:
skill.Start(targetPosition);
```

### Skill with Requirements
```ts
@SkillDecorator
export class UltimateAttack extends Skill {
	public OnConstruct() {
		this.Requirements = [PoweredUp]; // Must have PoweredUp status
		this.MutualExclusives = [Stunned]; // Can't use while stunned
	}
}
```

### Damage System
```ts
// Create and deal damage
const damage = mySkill.CreateDamageContainer(25);
targetCharacter.TakeDamage(damage);

// Listen for damage events
character.DamageTaken.Connect((container) => {
	print(`Took ${container.Damage} damage`);
});
```

### Damage Modification (Status Effect)
```ts
@StatusEffectDecorator
export class Shield extends StatusEffect {
	public DamageModificationPriority = 10;

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
		// Humanoid properties auto-restore
	}
}
```

### Holdable/Channeled Skill
```ts
import { HoldableSkill, HoldableSkillDecorator } from "@rbxts/wcs";

@HoldableSkillDecorator
export class Channel extends HoldableSkill {
	public MaxHoldTime = 5;

	public OnStartServer() {
		print("Channeling...");
	}

	public OnEndServer() {
		print("Stopped channeling");
	}
}
```

### Switch Movesets (Class System)
```ts
// Apply warrior moveset
character.ApplyMoveset(WarriorMoveset);

// Later, switch to mage (warrior skills auto-removed)
character.ApplyMoveset(MageMoveset);
```

## Reference Documentation

For detailed API documentation:

- **[Character API](references/character-api.md)** - Character methods, events, properties
- **[Skills API](references/skills-api.md)** - Skill lifecycle, methods, common patterns
- **[Status Effects API](references/status-effects-api.md)** - Status effect methods, humanoid data, damage modification
- **[Movesets API](references/movesets-api.md)** - Creating and managing movesets
- **[Installation](references/installation.md)** - Detailed installation guide

## Templates

Start quickly with these templates:

- **[Skill Template](assets/skill-template.ts)** - Comprehensive skill with all lifecycle hooks
- **[Status Effect Template](assets/status-effect-template.ts)** - Status effect with humanoid data and damage modification
- **[Moveset Template](assets/moveset-template.ts)** - Basic moveset structure
- **[Character Setup Template](assets/character-setup-template.ts)** - Complete character initialization

## Language Support

WCS supports both **TypeScript** (via roblox-ts) and **Luau**.

**Main syntax differences**:
- TypeScript: `@SkillDecorator` / Luau: `WCS.RegisterSkill()`
- TypeScript: `new Skill(character)` / Luau: `Skill.new(character)`
- TypeScript: `this.Method()` / Luau: `self:Method()`

Both languages have identical functionality and APIs.

## Official Resources

- **Documentation**: https://wad4444.github.io/WCS/
- **GitHub**: https://github.com/wad4444/WCS
- **DevForum**: Search "WCS combat system" on Roblox DevForum
- **Example Project**: https://github.com/g1mmethemoney/WCS-Example

## Troubleshooting

**Skills not starting**:
- Check `CheckOthersActive` property (default: true)
- Verify no `MutualExclusives` status effects are active
- Ensure `Requirements` status effects are present
- Check if `Character.DisableSkills` is true

**Status effects not working**:
- Verify `Start()` was called after instantiation
- Check `DestroyOnEnd` property (default: true)
- Ensure proper server-side application (client status effects don't replicate)

**Replication issues**:
- Skills start on server when called from client (automatic)
- Status effects only replicate when created on server
- Use `SetMetadata()` to sync custom data from server to client

**Cooldowns not working**:
- Call `ApplyCooldown()` only on server
- Cooldowns don't sync to client by default
- Use `GetDebounceEndTimestamp()` to check cooldown status
