import { BaseComponent, Component } from "@flamework/components";
import { OnStart, OnTick } from "@flamework/core";
import { Players } from "@rbxts/services";
import { GetRegisteredSkillConstructor } from "@rbxts/wcs";
import { createLogger } from "shared/utils";
import { NPCAttributes, NPCAIState, NPCDefinition } from "shared/npc/npc-types";
import { getNPCDefinition } from "shared/npc/npc-catalog";
import { NPCComponent } from "./npc-component";

const log = createLogger("component:NPC-AI");

/**
 * NPC AI Component
 * Handles AI state machine: idle, chase, attack, return
 *
 * Tag: "npc:AI"
 * Requires: "npc:Base" component on same instance
 */
@Component({ tag: "npc:AI" })
export class NPCAIComponent extends BaseComponent<NPCAttributes, Model> implements OnStart, OnTick {
	// State machine
	private currentState: NPCAIState = "idle";
	private stateTimer = 0;

	// Target tracking
	private currentTarget?: Player;

	// Combat
	private attackCooldown = 0;
	private lastAbilityIndex = -1;

	// References (set in onStart)
	private npcComponent?: NPCComponent;
	private definition?: NPCDefinition;
	private humanoid?: Humanoid;
	private rootPart?: BasePart;

	// Pathfinding
	private moveConnection?: RBXScriptConnection;

	onStart(): void {
		const defId = this.attributes.npcDefinitionId;
		this.definition = getNPCDefinition(defId);

		if (!this.definition) {
			log.warn(`AI: NPC definition not found: ${defId}`);
			return;
		}

		// Skip AI for stationary NPCs
		if (this.definition.aiType === "stationary") {
			log.debug(`AI: Skipping AI for stationary NPC ${defId}`);
			return;
		}

		// Get references
		this.humanoid = this.instance.FindFirstChildOfClass("Humanoid");
		this.rootPart = this.instance.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

		if (!this.humanoid || !this.rootPart) {
			log.warn(`AI: Missing Humanoid or HumanoidRootPart for ${defId}`);
			return;
		}

		log.info(`AI started for ${this.definition.displayName}`);
	}

	/**
	 * Set the NPC component reference (called by NPCService after both components are ready)
	 */
	public setNPCComponent(component: NPCComponent): void {
		this.npcComponent = component;
	}

	onTick(dt: number): void {
		if (!this.definition || this.definition.aiType === "stationary") return;
		if (!this.humanoid || !this.rootPart) return;
		if (this.npcComponent?.getIsDead()) return;

		// Update cooldowns
		this.attackCooldown = math.max(0, this.attackCooldown - dt);
		this.stateTimer += dt;

		// Run state machine
		switch (this.currentState) {
			case "idle":
				this.updateIdle();
				break;
			case "chase":
				this.updateChase();
				break;
			case "attack":
				this.updateAttack();
				break;
			case "return":
				this.updateReturn();
				break;
		}
	}

	/**
	 * IDLE state - look for targets
	 */
	private updateIdle(): void {
		if (!this.definition || !this.rootPart) return;

		// Only hostile and neutral (when provoked) NPCs look for targets
		if (this.definition.aiType === "passive") return;

		// Find nearest player in aggro range
		const target = this.findNearestPlayer(this.definition.combat.aggroRange);

		if (target) {
			this.currentTarget = target;
			this.transitionTo("chase");
		}
	}

	/**
	 * CHASE state - move toward target
	 */
	private updateChase(): void {
		if (!this.definition || !this.rootPart || !this.humanoid) return;

		// Check if target is still valid
		if (!this.currentTarget || !this.currentTarget.Character) {
			this.currentTarget = undefined;
			this.transitionTo("return");
			return;
		}

		const targetRoot = this.currentTarget.Character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (!targetRoot) {
			this.currentTarget = undefined;
			this.transitionTo("return");
			return;
		}

		const distance = this.rootPart.Position.sub(targetRoot.Position).Magnitude;
		const spawnPos = this.getSpawnPosition();
		const distanceFromSpawn = this.rootPart.Position.sub(spawnPos).Magnitude;

		// Check leash range
		if (this.definition.leashRange > 0 && distanceFromSpawn > this.definition.leashRange) {
			log.debug(`${this.definition.displayName} leashed - returning to spawn`);
			this.currentTarget = undefined;
			this.transitionTo("return");
			return;
		}

		// Check deaggro range
		if (distance > this.definition.combat.deaggroRange) {
			this.currentTarget = undefined;
			this.transitionTo("return");
			return;
		}

		// Check attack range
		if (distance <= this.definition.combat.attackRange) {
			this.transitionTo("attack");
			return;
		}

		// Move toward target
		this.humanoid.MoveTo(targetRoot.Position);
	}

	/**
	 * ATTACK state - use abilities on target
	 */
	private updateAttack(): void {
		if (!this.definition || !this.rootPart || !this.humanoid) return;

		// Check if target is still valid
		if (!this.currentTarget || !this.currentTarget.Character) {
			this.currentTarget = undefined;
			this.transitionTo("return");
			return;
		}

		const targetRoot = this.currentTarget.Character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (!targetRoot) {
			this.currentTarget = undefined;
			this.transitionTo("return");
			return;
		}

		const distance = this.rootPart.Position.sub(targetRoot.Position).Magnitude;

		// If out of attack range, chase again
		if (distance > this.definition.combat.attackRange * 1.2) {
			this.transitionTo("chase");
			return;
		}

		// Face the target
		this.faceTarget(targetRoot.Position);

		// Stop moving while attacking
		this.humanoid.MoveTo(this.rootPart.Position);

		// Try to use an ability
		if (this.attackCooldown <= 0) {
			this.tryUseAbility();
		}
	}

	/**
	 * RETURN state - go back to spawn
	 */
	private updateReturn(): void {
		if (!this.definition || !this.rootPart || !this.humanoid) return;

		const spawnPos = this.getSpawnPosition();
		const distance = this.rootPart.Position.sub(spawnPos).Magnitude;

		// Check if we're back at spawn
		if (distance < 3) {
			// Heal to full when returning
			this.humanoid.Health = this.humanoid.MaxHealth;
			this.transitionTo("idle");
			return;
		}

		// Check for new targets while returning (hostile only)
		if (this.definition.aiType === "hostile") {
			const target = this.findNearestPlayer(this.definition.combat.aggroRange * 0.5);
			if (target) {
				this.currentTarget = target;
				this.transitionTo("chase");
				return;
			}
		}

		// Move toward spawn
		this.humanoid.MoveTo(spawnPos);
	}

	/**
	 * Try to use an ability
	 */
	private tryUseAbility(): void {
		if (!this.definition || !this.npcComponent) return;

		const wcsCharacter = this.npcComponent.getWCSCharacter();
		if (!wcsCharacter) return;

		const abilities = this.definition.combat.abilities;
		if (abilities.size() === 0) return;

		// Pick a random ability (avoid repeating the same one if possible)
		let abilityIndex = math.random(0, abilities.size() - 1);
		if (abilities.size() > 1 && abilityIndex === this.lastAbilityIndex) {
			abilityIndex = (abilityIndex + 1) % abilities.size();
		}
		this.lastAbilityIndex = abilityIndex;

		const abilityId = abilities[abilityIndex];
		const SkillConstructor = GetRegisteredSkillConstructor(abilityId);

		if (SkillConstructor) {
			const skill = wcsCharacter.GetSkillFromConstructor(SkillConstructor);
			if (skill && skill.GetState().IsActive === false) {
				skill.Start();
				this.attackCooldown = this.definition.combat.attackCooldown;
				log.debug(`${this.definition.displayName} used ${abilityId}`);
			}
		}
	}

	/**
	 * Face toward a position
	 */
	private faceTarget(targetPosition: Vector3): void {
		if (!this.rootPart) return;

		const direction = targetPosition.sub(this.rootPart.Position);
		const lookAt = new Vector3(direction.X, 0, direction.Z).Unit;

		if (lookAt.Magnitude > 0) {
			const newCFrame = CFrame.lookAt(this.rootPart.Position, this.rootPart.Position.add(lookAt));
			this.rootPart.CFrame = newCFrame;
		}
	}

	/**
	 * Find nearest player within range
	 */
	private findNearestPlayer(range: number): Player | undefined {
		if (!this.rootPart) return undefined;

		let nearest: Player | undefined;
		let nearestDistance = range;

		for (const player of Players.GetPlayers()) {
			const character = player.Character;
			if (!character) continue;

			const humanoid = character.FindFirstChildOfClass("Humanoid");
			if (!humanoid || humanoid.Health <= 0) continue;

			const root = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
			if (!root) continue;

			const distance = this.rootPart.Position.sub(root.Position).Magnitude;
			if (distance < nearestDistance) {
				nearest = player;
				nearestDistance = distance;
			}
		}

		return nearest;
	}

	/**
	 * Get spawn position from attributes
	 */
	private getSpawnPosition(): Vector3 {
		return new Vector3(this.attributes.spawnX, this.attributes.spawnY, this.attributes.spawnZ);
	}

	/**
	 * Transition to a new state
	 */
	private transitionTo(newState: NPCAIState): void {
		if (this.currentState === newState) return;

		log.debug(`${this.definition?.displayName ?? "NPC"}: ${this.currentState} → ${newState}`);
		this.currentState = newState;
		this.stateTimer = 0;
	}

	/**
	 * Get current AI state
	 */
	public getCurrentState(): NPCAIState {
		return this.currentState;
	}

	/**
	 * Get current target
	 */
	public getCurrentTarget(): Player | undefined {
		return this.currentTarget;
	}

	/**
	 * Force aggro on a specific player (for neutral NPCs when attacked)
	 */
	public aggroOn(player: Player): void {
		if (!this.definition) return;
		if (this.definition.aiType === "passive" || this.definition.aiType === "stationary") return;

		this.currentTarget = player;
		this.transitionTo("chase");
	}

	destroy(): void {
		this.moveConnection?.Disconnect();
	}
}
