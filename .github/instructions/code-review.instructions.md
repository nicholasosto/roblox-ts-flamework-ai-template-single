---
applyTo: "**/*.ts"
---

# Code Review Checklist for Roblox-TS + Flamework

## Code Philosophy

- [ ] **Prefer lightweight, minimal implementations**
    - Start simple, add complexity only when needed
    - Avoid premature optimization or over-engineering
    - Fewer lines of code = fewer bugs

- [ ] **Leverage framework features over custom state management**
    - Use Flamework's `Components.getAllComponents()` for discovery
    - Use `ClientSignals` / `ServerSignals` for event-driven architecture
    - Prefer querying components on-demand over caching

- [ ] **Stateless when possible**
    - Avoid tracking state that the framework already tracks
    - Query current state from source of truth (components, instances)
    - Only cache when performance genuinely requires it

- [ ] **Signal-driven architecture**
    - Use `@rbxts/signal` or `ClientSignals` to trigger actions
    - Avoid polling loops and manual state synchronization
    - Let events flow through the system

## Roblox API Usage

- [ ] **Not manually destroying auto-destroyed instances**
    - Example: Player Characters are cleaned up automatically
- [ ] **Using native methods instead of manual iteration**
    - Use `ClearAllChildren()` instead of looping and destroying
    - Use `RemoveAccessories()` instead of manually filtering and removing
    - Use `FindFirstChildOfClass()` instead of manual type checking loops

- [ ] **Importing services from @rbxts/services**
    - ✅ `import { Players } from "@rbxts/services";`
    - ❌ `const Players = game.GetService("Players");`

- [ ] **Not sending instances over network**
    - Send data (name, position, etc.) instead of instance references

## Flamework Patterns

- [ ] **Single network instance export**
    - Only call `createServer()` or `createClient()` ONCE
    - Import from server-network.ts or client-network.ts

- [ ] **Using Signals for events, not polling loops**
    - ✅ Use `@rbxts/signal` for custom events
    - ❌ Avoid `while(true)` loops checking state

- [ ] **Proper lifecycle method usage**
    - Keep constructors lightweight
    - Use `onInit()` for initialization
    - Use `onStart()` for logic that needs other services/controllers

- [ ] **Dependency injection for services/controllers**
    - ✅ Inject via constructor
    - ❌ Don't manually instantiate with `new`

- [ ] **Component cleanup in destroy()**
    - Always disconnect connections in component `destroy()` method
    - Clean up spawned instances

## TypeScript Best Practices

- [ ] **No unused variables**
    - Remove or prefix with underscore: `_unusedParam`

- [ ] **No explicit `any` types**
    - Use proper types or `unknown` if type is truly unknown

- [ ] **Using optional chaining where appropriate**
    - ✅ `player.Character?.FindFirstChild("Humanoid")`
    - Better than nested if checks

- [ ] **Proper async/await usage**
    - Always await Promises or use `.then()`
    - Handle errors with try/catch

- [ ] **Type safety with Flamework**
    - Define Attributes interface for components
    - Type networking interfaces properly
    - Specify instance types in components: `BaseComponent<Attributes, Part>`

## Performance

- [ ] **Not creating instances in loops**
    - Pre-create and reuse when possible
    - Use object pooling for frequently created/destroyed objects

- [ ] **Using WaitForChild() appropriately**
    - Don't use in hot loops
    - Consider FindFirstChild() with existence check for non-critical paths

- [ ] **Efficient event handling**
    - Disconnect events when no longer needed
    - Use `once` pattern for one-time events

## Security (Server-side)

- [ ] **Validating client input**
    - Never trust data from client events
    - Validate types, ranges, and permissions

- [ ] **Rate limiting client requests**
    - Prevent spam/abuse of remote events

- [ ] **Server authority for game state**
    - Server decides what's valid, not client

## WCS Combat Patterns

- [ ] **WCS Server/Client started before characters**
    - Call `CreateServer().Start()` / `CreateClient().Start()` before creating WCS Characters
    - Register skill directories with `RegisterDirectory()`

- [ ] **Skills in shared/, not client/ or server/**
    - WCS skills must be accessible to both sides
    - Put skills in `src/shared/combat/skills/`

- [ ] **Client visuals independent of skill lifecycle**
    - Use `task.spawn()` for visuals that outlive the skill
    - Don't cleanup projectile visuals in `OnEndClient()` if they're still flying

- [ ] **Server-authoritative hit detection**
    - Raycasts/damage on server, visuals on client
    - Filter character from own projectile raycasts

## Organization

- [ ] **Files in correct directories**
    - Server code in `src/server/`
    - Client code in `src/client/`
    - Shared code in `src/shared/`

- [ ] **Proper namespacing in networking**
    - Group related events logically
    - Use descriptive namespace names

- [ ] **Single responsibility**
    - Services/controllers should have one clear purpose
    - Break up large files into smaller, focused ones

## Common Mistakes to Avoid

### ❌ Multiple Network Instances

```typescript
// DON'T create multiple server/client instances
const Events = GlobalEvents.createServer(); // In file 1
const Events = GlobalEvents.createServer(); // In file 2 - WRONG!
```

### ❌ Manual Iteration for Native Methods

```typescript
// DON'T manually iterate when native methods exist
for (const child of folder.GetChildren()) {
	child.Destroy();
}
// USE: folder.ClearAllChildren();
```

### ❌ Heavy Constructor Logic

```typescript
// DON'T put logic in constructors
@Service()
class BadService {
	constructor() {
		this.startGameLoop(); // WRONG - use onStart()
	}
}
```

### ❌ Not Cleaning Up Components

```typescript
// DON'T forget to disconnect in destroy()
@Component({ tag: "MyComponent" })
class BadComponent {
	onStart() {
		RunService.Heartbeat.Connect(() => { ... }); // Never disconnected!
	}
}
```

## Review Questions

Before approving code, ask:

1. **Could this use a native Roblox method?**
2. **Is this following Flamework patterns?**
3. **Are there any memory leaks (undisconnected events)?**
4. **Is client input validated on the server?**
5. **Are types properly defined?**
6. **Is the code in the right directory (client/server/shared)?**

## When to Read Skills

If reviewing code involving:

- Services → Read `flamework-service/SKILL.md`
- Components → Read `flamework-component/SKILL.md`
- Controllers → Read `flamework-controller/SKILL.md`
- Networking → Read `flamework-networking/SKILL.md`
- Roblox APIs → Read `roblox-api/SKILL.md`
