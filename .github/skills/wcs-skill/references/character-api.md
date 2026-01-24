# Character API Reference

## Creating a Character

```ts
import { Character } from "@rbxts/wcs";

const wcsCharacter = new Character(characterModel);
```

Character wraps a Roblox character Model and must contain a Humanoid.

## Static Methods

### `Character.GetCharacterFromInstance(instance): Character?`
Retrieves the WCS Character associated with a Roblox instance.

### `Character.GetLocalCharacter(): Character?`
Retrieves the WCS Character for the local player (client only).

### `Character.GetCharacterMap(): Map<Instance, Character>`
Returns a map of all instances to their WCS Characters.

## Static Events

### `Character.CharacterCreated`
Fires when any Character is created.
**Parameters**: `(Character)`

### `Character.CharacterDestroyed`
Fires when any Character is destroyed.
**Parameters**: `(Character)`

## Key Properties

### `Instance` (readonly)
The Roblox character Model this WCS Character wraps.

### `Humanoid` (readonly)
The Humanoid instance from the character Model.

### `Player` (readonly)
The Player associated with this character (if any).

### `DisableSkills` (boolean)
If true, skills cannot be started. Default: false.

## Skill Management

### `GetSkills(): Skill[]`
Returns all skills on the character.

### `GetAllActiveSkills(): Skill[]`
Returns only currently active skills.

### `GetSkillFromString(name: string): Skill?`
Retrieves a skill by its name.

### `GetSkillFromConstructor(constructor): Skill?`
Retrieves a skill instance by its constructor.

### `GetSkillsDerivedFrom(constructor): Skill[]`
Retrieves all skills that extend from a constructor.

## Status Effect Management

### `GetAllStatusEffects(): StatusEffect[]`
Returns all status effects on the character.

### `GetAllActiveStatusEffects(): StatusEffect[]`
Returns only currently active status effects.

### `GetAllStatusEffectsOfType(constructor): StatusEffect[]`
Returns all status effects of a specific type.

### `GetAllActiveStatusEffectsOfType(constructor): StatusEffect[]`
Returns active status effects of a specific type.

### `HasStatusEffects(statuses): boolean`
Checks if character has any active status effects of specified types.

## Moveset Management

### `ApplyMoveset(moveset)`
Applies a moveset to the character. Removes the previous moveset if one exists.

**Parameters**: `moveset: Moveset | string`

### `GetMoveset(): Moveset?`
Returns the current moveset object.

### `GetMovesetName(): string?`
Returns the current moveset's name.

### `GetMovesetSkills(name?: string): Skill[]`
Gets skills that belong to a moveset. Defaults to current moveset.

### `ClearMoveset()`
Clears the current moveset and destroys all its skills.

### `ApplySkillsFromMoveset(moveset)`
Adds skills from a moveset without actually setting the moveset.

## Humanoid Property Management

### `SetDefaultProps(props)`
Sets default humanoid properties.

**Example**:
```ts
character.SetDefaultProps({
	WalkSpeed: 16,
	JumpPower: 50
});
```

### `GetDefaultProps(): AffectableHumanoidProps`
Returns the default humanoid properties.

### `GetAppliedProps(): AffectableHumanoidProps`
Returns the currently applied humanoid properties (after status effect modifications).

## Damage System

### `TakeDamage(container): DamageContainer`
Calculates damage based on status effects and fires DamageTaken event.
Returns the container with calculated damage.

### `PredictDamage(container): DamageContainer`
Calculates damage without actually applying it or firing events.

### `Destroy()`
Destroys the Character and performs cleanup. Call this when the Humanoid dies.

## Events

### `SkillAdded`
Fires when a skill is added to the character.
**Parameters**: `(Skill)`

### `SkillRemoved`
Fires when a skill is removed.
**Parameters**: `(Skill)`

### `SkillStarted`
Fires when a skill starts.
**Parameters**: `(Skill)`

### `SkillEnded`
Fires when a skill ends.
**Parameters**: `(Skill)`

### `StatusEffectAdded`
Fires when a status effect is added.
**Parameters**: `(StatusEffect)`

### `StatusEffectRemoved`
Fires when a status effect is removed.
**Parameters**: `(StatusEffect)`

### `StatusEffectStarted`
Fires when a status effect starts.
**Parameters**: `(StatusEffect)`

### `StatusEffectEnded`
Fires when a status effect ends.
**Parameters**: `(StatusEffect)`

### `HumanoidPropertiesUpdated`
Fires when humanoid data changes due to status effects.
**Parameters**: `(AffectableHumanoidProps)`

### `DamageTaken`
Fires when character takes damage.
**Parameters**: `(DamageContainer)`

### `DamageDealt`
Fires when character's skills/status effects damage another character.
**Parameters**: `(DamageContainer)`

### `MovesetChanged`
Fires when character's moveset changes.
**Parameters**: `(NewMoveset: string?, OldMoveset: string?)`

### `Destroyed`
Fires when character is destroyed.

## Common Patterns

### Basic Character Setup
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

### Apply Individual Skills
```ts
const character = new Character(characterModel);
new Attack(character);
new Dash(character);
new Block(character);
```

### Apply Moveset
```ts
const character = new Character(characterModel);
character.ApplyMoveset(WarriorMoveset);

// Later, switch movesets:
character.ApplyMoveset(MageMoveset); // Automatically removes warrior skills
```

### Listen to Skill Events
```ts
character.SkillStarted.Connect((skill) => {
	print(`${skill.Name} started!`);
});

character.SkillEnded.Connect((skill) => {
	print(`${skill.Name} ended!`);
});
```

### Damage System
```ts
// Deal damage to a character
const damageContainer = mySkill.CreateDamageContainer(25);
targetCharacter.TakeDamage(damageContainer);

// Listen for damage events
character.DamageTaken.Connect((container) => {
	print(`Took ${container.Damage} damage!`);
});

character.DamageDealt.Connect((container) => {
	print(`Dealt ${container.Damage} damage!`);
});
```

### Check Active Skills/Status Effects
```ts
// Check if character has a specific status
if (character.HasStatusEffects([Stunned])) {
	print("Character is stunned!");
}

// Get all active skills
const activeSkills = character.GetAllActiveSkills();

// Get specific status effect
const shields = character.GetAllActiveStatusEffectsOfType(Shield);
```
