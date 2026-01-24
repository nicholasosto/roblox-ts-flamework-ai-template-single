# WCS Installation Guide

## NPM Installation (TypeScript/roblox-ts)

Install WCS via npm:

```bash
npm i @rbxts/wcs@latest
```

**Important**: WCS depends on packages from `@flamework` npm org. Add this to your Rojo project file:

```json
"@flamework": {
	"$path": "node_modules/@flamework"
}
```

## Wally Installation (Luau)

Add to your `wally.toml` under `[dependencies]`:

```toml
[dependencies]
wcs = "cheetiedotpy/wcs@2.5.0"
```

Then run:
```bash
wally install
```

## Roblox Studio Installation (No Rojo)

1. Go to [WCS GitHub Releases](https://github.com/wad4444/WCS/releases)
2. Download the `.rbxm` file from the latest release
3. In Roblox Studio, right-click ReplicatedStorage
4. Select "Insert from File"
5. Choose the downloaded `.rbxm` file

## Verification

After installation, verify WCS is available:

### TypeScript
```ts
import { Character, Skill, StatusEffect } from "@rbxts/wcs";
```

### Luau
```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local WCS = require(ReplicatedStorage.WCS)
```

## Project Structure Recommendations

### TypeScript Project
```
src/
├── shared/
│   ├── skills/
│   │   ├── attack.ts
│   │   ├── dash.ts
│   │   └── block.ts
│   ├── statusEffects/
│   │   ├── stun.ts
│   │   ├── speedBoost.ts
│   │   └── shield.ts
│   └── movesets/
│       ├── warrior.ts
│       ├── mage.ts
│       └── rogue.ts
├── server/
│   └── characterSetup.server.ts
└── client/
    └── ui.client.ts
```

### Luau Project
```
ReplicatedStorage/
├── WCS/ (module)
├── Skills/
│   ├── Attack
│   ├── Dash
│   └── Block
├── StatusEffects/
│   ├── Stun
│   ├── SpeedBoost
│   └── Shield
└── Movesets/
    ├── Warrior
    ├── Mage
    └── Rogue

ServerScriptService/
└── CharacterSetup

StarterPlayer/
└── StarterPlayerScripts/
    └── UI
```

## Next Steps

After installation:

1. **Set up Characters** - Create Character wrappers for player characters
2. **Create Skills** - Define your first combat abilities
3. **Create Status Effects** - Add buffs, debuffs, and side effects
4. **Create Movesets** - Group skills into character classes
5. **Test** - Try starting skills and applying status effects

See the main SKILL.md for detailed workflows and examples.
