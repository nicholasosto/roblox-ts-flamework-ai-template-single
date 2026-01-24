# WCS Skill Installation

This is a skill for Claude that provides comprehensive support for the WCS (Weapon Combat System) framework for Roblox.

## What This Skill Does

The WCS skill helps you create combat systems in Roblox using the WCS framework. It provides:

- Templates for Skills, Status Effects, Movesets, and Character setup
- Complete API reference documentation
- Code examples for both TypeScript (roblox-ts) and Luau
- Common patterns and troubleshooting guidance

## How to Install

Since this is a custom skill directory, you have a few options:

### Option 1: Manual Installation (if you have access to the skills directory)
Copy the `wcs-skill` folder to your Claude skills directory, typically located at:
- **Mac/Linux**: `~/.anthropic/claude-code/skills/`
- **Windows**: `%USERPROFILE%\.anthropic\claude-code\skills\`

Then rename it to just `wcs`:
```bash
mv wcs-skill ~/.anthropic/claude-code/skills/wcs
```

### Option 2: Use as Reference
Keep this folder as a reference and manually copy templates/documentation as needed when working on WCS projects.

### Option 3: Package as .skill file (already done)
The `wcs.skill` file in the same directory is a packaged version that can be imported if your Claude installation supports .skill file imports.

## Skill Contents

```
wcs-skill/
├── SKILL.md                              # Main skill documentation
├── assets/                               # Templates for quick start
│   ├── character-setup-template.ts       # Character initialization
│   ├── skill-template.ts                 # Comprehensive skill template
│   ├── status-effect-template.ts         # Status effect template
│   └── moveset-template.ts               # Moveset structure
└── references/                           # Detailed API documentation
    ├── skills-api.md                     # Skills API reference
    ├── status-effects-api.md             # Status Effects API reference
    ├── character-api.md                  # Character API reference
    ├── movesets-api.md                   # Movesets API reference
    └── installation.md                   # WCS installation guide
```

## Usage

Once installed, the skill will automatically activate when you ask Claude to help with:
- Creating combat systems in Roblox
- Building WCS skills, status effects, or movesets
- Setting up character combat wrappers
- Implementing damage systems, buffs, debuffs, etc.

Simply start a conversation with requests like:
- "Create a dash skill for WCS"
- "Help me build a stun status effect"
- "Set up WCS character wrapper for my game"
- "Create a warrior moveset with attack, block, and dash skills"

## Official WCS Resources

- **Documentation**: https://wad4444.github.io/WCS/
- **GitHub**: https://github.com/wad4444/WCS
- **npm Package**: https://www.npmjs.com/package/@rbxts/wcs
