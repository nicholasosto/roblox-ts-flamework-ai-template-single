# Movesets API Reference

## What are Movesets?

Movesets allow you to group and manage skills easily by composing them into special WCS objects. Applying a moveset to a character adds all its skills at once. Clearing or applying another moveset removes them.

**Key Rule**: A character can only have ONE moveset applied at a time.

## Creating a Moveset

### TypeScript
```ts
import { CreateMoveset } from "@rbxts/wcs";
import { Fireball, Manashot, Flight } from "./skills";

export = CreateMoveset("Mage", [Fireball, Manashot, Flight]);
```

### Luau
```lua
local WCS = require(ReplicatedStorage.WCS)
local Skills = ReplicatedStorage.Skills

local Fireball = require(Skills.Fireball)
local Manashot = require(Skills.Manashot)
local Flight = require(Skills.Flight)

return WCS.CreateMoveset("Mage", {Fireball, Manashot, Flight})
```

## Moveset Properties

### `Name` (readonly)
The moveset's name (string).

### `Skills` (Constructor<AnySkill>[])
Array of skill constructors in this moveset.

### `ConstructorParams`
Constructor parameters passed to CreateMoveset().

## Moveset Events

### `OnCharacterAdded`
Fires when the moveset is applied to a Character.
**Parameters**: `(Character)`

### `OnCharacterRemoved`
Fires when the moveset is removed from a Character.
**Parameters**: `(Character)`

## Applying Movesets

### Apply to Character
```ts
import { Character } from "@rbxts/wcs";
import MageMoveset from "./movesets/mage";

const character = new Character(characterModel);
character.ApplyMoveset(MageMoveset);
```

### Apply Skills Without Setting Moveset
```ts
// Adds skills but doesn't set the moveset
character.ApplySkillsFromMoveset(MageMoveset);

// Character.GetMoveset() returns undefined
// But the skills are still added to the character
```

### Clear Current Moveset
```ts
// Removes all skills from current moveset
character.ClearMoveset();
```

### Switch Movesets
```ts
// Applying a new moveset automatically clears the old one
character.ApplyMoveset(WarriorMoveset);

// Later:
character.ApplyMoveset(MageMoveset); // Warrior skills removed, Mage skills added
```

## Common Patterns

### Class-Based System
```ts
// movesets/warrior.ts
export = CreateMoveset("Warrior", [
	Slash,
	Block,
	Charge,
	BattleCry
]);

// movesets/mage.ts
export = CreateMoveset("Mage", [
	Fireball,
	IceBlast,
	Teleport,
	ManaShield
]);

// movesets/rogue.ts
export = CreateMoveset("Rogue", [
	Backstab,
	Stealth,
	PoisonDart,
	Evade
]);
```

### Dynamic Class Switching
```ts
import Warrior from "./movesets/warrior";
import Mage from "./movesets/mage";
import Rogue from "./movesets/rogue";

function switchClass(character: Character, className: string) {
	switch (className) {
		case "Warrior":
			character.ApplyMoveset(Warrior);
			break;
		case "Mage":
			character.ApplyMoveset(Mage);
			break;
		case "Rogue":
			character.ApplyMoveset(Rogue);
			break;
	}
}
```

### Moveset with Events
```ts
import { CreateMoveset } from "@rbxts/wcs";
import { Skill1, Skill2 } from "./skills";

const MyMoveset = CreateMoveset("MyMoveset", [Skill1, Skill2]);

MyMoveset.OnCharacterAdded.Connect((character) => {
	print(`Moveset applied to ${character.Instance.Name}`);
});

MyMoveset.OnCharacterRemoved.Connect((character) => {
	print(`Moveset removed from ${character.Instance.Name}`);
});

export = MyMoveset;
```

### Checking Current Moveset
```ts
const currentMoveset = character.GetMoveset();
if (currentMoveset) {
	print(`Current moveset: ${currentMoveset.Name}`);

	const skills = character.GetMovesetSkills();
	print(`Skills in moveset: ${skills.size()}`);
}
```

### Get Moveset by Name
```ts
// Get skills from a specific moveset (not necessarily the current one)
const mageSkills = character.GetMovesetSkills("Mage");
```

### Listen to Moveset Changes
```ts
character.MovesetChanged.Connect((newMoveset, oldMoveset) => {
	print(`Changed from ${oldMoveset} to ${newMoveset}`);
});
```

## Best Practices

1. **Use movesets for character classes/loadouts** - Group related skills together
2. **One moveset per character** - Don't try to apply multiple movesets
3. **Use ApplySkillsFromMoveset sparingly** - Usually you want the moveset applied
4. **Clear before destroying** - If needed, call ClearMoveset() before character.Destroy()
5. **Name movesets clearly** - Use descriptive names like "Warrior", "Mage", "Level1Boss"

## Comparison: Moveset vs Individual Skills

### With Moveset:
```ts
// Define once
const WarriorMoveset = CreateMoveset("Warrior", [Slash, Block, Charge]);

// Apply to many characters
character1.ApplyMoveset(WarriorMoveset);
character2.ApplyMoveset(WarriorMoveset);

// Easy to switch
character1.ApplyMoveset(MageMoveset);
```

### Without Moveset:
```ts
// Apply individually (tedious)
new Slash(character1);
new Block(character1);
new Charge(character1);

// Hard to switch - must track and destroy each skill
const slash = character1.GetSkillFromConstructor(Slash);
slash?.Destroy();
const block = character1.GetSkillFromConstructor(Block);
block?.Destroy();
// ...
```

**Use movesets when**: You have groups of skills that belong together
**Use individual skills when**: Skills are independent or character-specific
