import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Character, DamageContainer, GetRegisteredSkillConstructor } from "@rbxts/wcs";
import { createLogger } from "shared/utils";
import { NPCAttributes, NPCDefinition } from "shared/npc/npc-types";
import { getNPCDefinition } from "shared/npc/npc-catalog";

const log = createLogger("component:NPC");

/**
 * Base NPC Component
 * Handles WCS integration, health, damage, and death
 *
 * Tag: "npc:Base"
 * Required Attributes:
 *   - npcDefinitionId: string (ID from NPC_CATALOG)
 *   - npcUUID: string (unique instance ID)
 *   - spawnX, spawnY, spawnZ: number (spawn position)
 */
@Component({ tag: "npc:Base" })
export class NPCComponent extends BaseComponent<NPCAttributes, Model> implements OnStart {
	// WCS integration
	private wcsCharacter?: Character;

	// Cached definition
	private definition?: NPCDefinition;

	// State
	private isDead = false;

	// References
	private humanoid?: Humanoid;
	private rootPart?: BasePart;

	onStart(): void {
		const defId = this.attributes.npcDefinitionId;
		this.definition = getNPCDefinition(defId);

		if (!this.definition) {
			log.warn(`NPC definition not found: ${defId}`);
			return;
		}

		log.info(`NPCComponent started for ${this.definition.displayName} (${this.attributes.npcUUID})`);

		// Get humanoid and root part
		this.humanoid = this.instance.FindFirstChildOfClass("Humanoid");
		this.rootPart = this.instance.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

		if (!this.humanoid || !this.rootPart) {
			log.warn(`NPC ${defId} missing Humanoid or HumanoidRootPart`);
			return;
		}

		// Configure humanoid from definition
		this.configureHumanoid();

		// Create WCS Character wrapper
		this.setupWCS();

		// Setup death handling
		this.setupDeathHandler();
	}

	/**
	 * Configure humanoid stats from definition
	 */
	private configureHumanoid(): void {
		if (!this.humanoid || !this.definition) return;

		this.humanoid.MaxHealth = this.definition.baseStats.maxHealth;
		this.humanoid.Health = this.definition.baseStats.maxHealth;
		this.humanoid.WalkSpeed = this.definition.baseStats.walkSpeed;

		// Disable some player-specific features
		this.humanoid.BreakJointsOnDeath = false;
	}

	/**
	 * Setup WCS Character and register abilities
	 */
	private setupWCS(): void {
		if (!this.definition) return;

		// Create WCS character wrapper
		this.wcsCharacter = new Character(this.instance);

		// Register abilities from definition
		for (const abilityId of this.definition.combat.abilities) {
			const SkillConstructor = GetRegisteredSkillConstructor(abilityId);
			if (SkillConstructor) {
				new SkillConstructor(this.wcsCharacter);
				log.debug(`Registered ability ${abilityId} for NPC ${this.definition.id}`);
			} else {
				log.warn(`Ability not found: ${abilityId} for NPC ${this.definition.id}`);
			}
		}

		// Handle damage taken
		this.wcsCharacter.DamageTaken.Connect((container) => this.onDamageTaken(container));

		log.debug(`WCS setup complete for ${this.definition.displayName}`);
	}

	/**
	 * Handle incoming damage
	 */
	private onDamageTaken(container: DamageContainer): void {
		if (this.isDead || !this.humanoid || !this.definition) return;

		// Apply defense reduction
		const defense = this.definition.baseStats.defense;
		const reduction = defense / (defense + 100); // Diminishing returns formula
		const finalDamage = container.Damage * (1 - reduction);

		// Apply to humanoid
		this.humanoid.TakeDamage(finalDamage);

		log.debug(
			`${this.definition.displayName} took ${math.floor(finalDamage)} damage ` +
				`(${container.Damage} raw, ${math.floor(reduction * 100)}% reduced). ` +
				`Health: ${math.floor(this.humanoid.Health)}/${this.humanoid.MaxHealth}`,
		);

		// Visual feedback
		this.flashOnHit();
	}

	/**
	 * Visual feedback when hit
	 */
	private flashOnHit(): void {
		// Find body parts to flash
		const parts = this.instance.GetDescendants().filter((d): d is BasePart => {
			return d.IsA("BasePart") && d.Name !== "HumanoidRootPart";
		});

		// Store original colors and flash red
		const originalColors = new Map<BasePart, Color3>();
		for (const part of parts) {
			originalColors.set(part, part.Color);
			part.Color = Color3.fromRGB(255, 100, 100);
		}

		// Restore after short delay
		task.delay(0.1, () => {
			for (const [part, color] of originalColors) {
				if (part && part.Parent) {
					part.Color = color;
				}
			}
		});
	}

	/**
	 * Setup death handling
	 */
	private setupDeathHandler(): void {
		if (!this.humanoid) return;

		this.humanoid.Died.Once(() => {
			this.onDeath();
		});
	}

	/**
	 * Handle NPC death
	 */
	private onDeath(): void {
		if (this.isDead) return;
		this.isDead = true;

		log.info(`${this.definition?.displayName ?? "NPC"} died`);

		// Cleanup WCS
		if (this.wcsCharacter) {
			this.wcsCharacter.Destroy();
			this.wcsCharacter = undefined;
		}

		// Fire death event (NPCService will handle loot and respawn)
		// The instance will be destroyed by NPCService
	}

	/**
	 * Get the WCS Character wrapper
	 */
	public getWCSCharacter(): Character | undefined {
		return this.wcsCharacter;
	}

	/**
	 * Get the NPC definition
	 */
	public getDefinition(): NPCDefinition | undefined {
		return this.definition;
	}

	/**
	 * Get spawn position from attributes
	 */
	public getSpawnPosition(): Vector3 {
		return new Vector3(this.attributes.spawnX, this.attributes.spawnY, this.attributes.spawnZ);
	}

	/**
	 * Check if NPC is dead
	 */
	public getIsDead(): boolean {
		return this.isDead;
	}

	/**
	 * Get the humanoid
	 */
	public getHumanoid(): Humanoid | undefined {
		return this.humanoid;
	}

	/**
	 * Get the root part
	 */
	public getRootPart(): BasePart | undefined {
		return this.rootPart;
	}

	destroy(): void {
		if (this.wcsCharacter) {
			this.wcsCharacter.Destroy();
		}
	}
}
