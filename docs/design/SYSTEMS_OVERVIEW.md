# Systems Overview

This document provides an overview of the major systems in the game and how they interact.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         GAME SYSTEMS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   Player     │◄────►│   Combat     │◄────►│  Enemy   │  │
│  │   System     │      │   System     │      │  System  │  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
│         │                      │                     │       │
│         │                      ▼                     │       │
│         │              ┌──────────────┐              │       │
│         └─────────────►│   Progress   │◄─────────────┘       │
│                        │   System     │                      │
│                        └──────────────┘                      │
│                                │                             │
│                                ▼                             │
│                        ┌──────────────┐                      │
│                        │     Data     │                      │
│                        │   Storage    │                      │
│                        └──────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Systems

### 1. Player System

**Purpose:** Manages player state, inventory, and character data.

**Key Responsibilities:**

- Player join/leave handling
- Character spawning
- Inventory management
- Player data persistence
- Player stats tracking

**Implementation:**

- Server: `PlayerService`
- Client: `PlayerDataController`

**Data Structure:**

```typescript
interface PlayerData {
	userId: number;
	displayName: string;
	level: number;
	experience: number;
	coins: number;
	inventory: Item[];
	stats: PlayerStats;
}
```

**Dependencies:**

- Data Storage System
- Progress System
- Combat System (for stats)

---

### 2. Combat System

**Purpose:** Handles all combat interactions, damage calculation, and effects.

**Key Responsibilities:**

- Damage calculation
- Hit detection
- Status effects
- Combat animations
- Cooldown management

**Implementation:**

- Server: `CombatService`
- Client: `CombatController` (visual effects only)

**Key Mechanics:**

- Base damage formula: `damage = attack * (1 - defense/100)`
- Critical hits: [Rate and multiplier]
- Status effects: [Types and durations]

**Dependencies:**

- Player System (for stats)
- Enemy System (for targeting)
- Animation System

---

### 3. Progress System

**Purpose:** Tracks and manages player progression, leveling, and achievements.

**Key Responsibilities:**

- Experience calculation
- Level-up logic
- Achievement tracking
- Reward distribution
- Quest management (if applicable)

**Implementation:**

- Server: `ProgressService`
- Client: `ProgressController` (UI updates)

**Level Curve:**

- Formula: `xpRequired = baseXP * (level ^ exponent)`
- Base XP: [Number]
- Exponent: [Number]

**Dependencies:**

- Player System
- Data Storage System

---

### 4. Enemy System

**Purpose:** Manages enemy spawning, AI behavior, and loot drops.

**Key Responsibilities:**

- Enemy spawning
- AI pathfinding
- Combat AI
- Loot table management
- Enemy scaling

**Implementation:**

- Server: `EnemyService`
- Components: `EnemyComponent` (per enemy)

**AI Behavior:**

1. Idle state
2. Detection/Aggro state
3. Chase state
4. Attack state
5. Death state

**Dependencies:**

- Combat System
- Progress System (for rewards)

---

### 5. Data Storage System

**Purpose:** Handles all data persistence to Roblox DataStores.

**Key Responsibilities:**

- Save player data
- Load player data
- Auto-save system
- Data validation
- Backup/recovery

**Implementation:**

- Server: `DataService`

**Save Strategy:**

- Auto-save every: [X minutes]
- Save on player leave
- Periodic backups
- Retry logic for failures

**Data Schema Versioning:**

- Current version: [1.0]
- Migration strategy: [How to handle schema changes]

**Dependencies:**

- Player System

---

### 6. UI System

**Purpose:** Manages all user interface elements and interactions.

**Key Responsibilities:**

- HUD management
- Menu systems
- Notifications
- Dialog/NPC interactions
- Settings

**Implementation:**

- Client: `UIController`, various UI components

**UI Layers:**

1. HUD (always visible)
2. Menus (toggle)
3. Dialogs (modal)
4. Notifications (temporary)

**Dependencies:**

- All systems (displays their data)

---

### 7. Networking System

**Purpose:** Handles all client-server communication.

**Key Responsibilities:**

- Define all events
- Define all functions
- Type-safe networking
- Validation

**Implementation:**

- Shared: `flamework-remotes.ts`
- Server: `server-network.ts`
- Client: `client-network.ts`

**Event Categories:**

- Player events
- Combat events
- UI events
- Data events

**Dependencies:**

- Used by all systems

---

## System Interactions

### Example Flow: Player Attacks Enemy

1. **Client:** Player clicks attack button
    - `InputController` detects input
    - `Events.combat.attack.fire(targetPosition)`

2. **Server:** Receives attack event
    - `CombatService` validates attack
    - Checks cooldown
    - Calculates damage
    - `EnemyService` applies damage to enemy

3. **Server:** Enemy defeated
    - `EnemyService` handles death
    - `ProgressService` awards XP
    - `PlayerService` grants loot
    - `Events.ui.showNotification.fire(player, "Enemy defeated!")`

4. **Client:** Shows feedback
    - `UIController` displays notification
    - `CombatController` plays victory animation
    - `ProgressController` updates XP bar

---

## Adding a New System

When adding a new system:

1. **Define the purpose** - What problem does it solve?
2. **List responsibilities** - What does it manage?
3. **Identify dependencies** - What other systems does it need?
4. **Create service/controller** - Server and/or client implementation
5. **Define data structures** - Types and interfaces
6. **Add networking** - If client-server communication needed
7. **Update this document** - Document the new system

---

## System Health Checklist

Use this to verify systems are properly designed:

- [ ] **Single Responsibility** - Each system has one clear purpose
- [ ] **Loose Coupling** - Systems don't directly depend on implementation details
- [ ] **Dependency Injection** - Systems are injected, not manually created
- [ ] **Client Authority** - Client only handles UI/input, server has authority
- [ ] **Type Safety** - All interfaces properly defined
- [ ] **Error Handling** - Systems gracefully handle failures
- [ ] **Performance** - No performance bottlenecks
- [ ] **Testability** - System behavior is verifiable

---

**Document Version:** 1.0  
**Last Updated:** [Date]  
**Author:** [Your name]
