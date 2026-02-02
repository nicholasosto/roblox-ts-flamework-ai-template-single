import { Service, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage } from "@rbxts/services";
import { Character, DamageContainer, CreateServer, GetRegisteredSkillConstructor } from "@rbxts/wcs";
import { createLogger } from "shared/utils/logger";
import { ServerSignals } from "../../shared/network/server-network";
import { OwnedItem, ABILITY_SLOT_KEYS } from "../../shared/interfaces";
import { InventoryService } from "./inventory-service";

const logger = createLogger("WCSService");

/**
 * WCS Combat Service
 * Handles server-side WCS initialization and character management.
 *
 * Skills are registered/deregistered dynamically based on equipped abilities.
 * When an ability is equipped to an AbilitySlot, the corresponding WCS skill
 * is instantiated on the character. When unequipped, it's destroyed.
 */
@Service()
export class WCSService implements OnStart {
	private wcsServer = CreateServer();

	// Track WCS Characters by player for skill management
	private playerCharacters = new Map<Player, Character>();

	// Track registered skills per player for diffing
	private playerSkills = new Map<Player, Set<string>>();

	constructor(private readonly inventoryService: InventoryService) {}

	onStart() {
		logger.info("WCS Service starting...");

		// Register skills directory (WCS needs to know where skills are)
		// This will scan the folder and run SkillDecorator on all skills
		this.wcsServer.RegisterDirectory(ReplicatedStorage.WaitForChild("TS").WaitForChild("combat") as Folder);

		// Start the WCS server - MUST be called before creating characters
		this.wcsServer.Start();
		logger.info("WCS Server started");

		// Set up character creation for players
		Players.PlayerAdded.Connect((player) => this.onPlayerAdded(player));
		Players.PlayerRemoving.Connect((player) => this.onPlayerRemoving(player));

		// Handle existing players (in case of late server start)
		for (const player of Players.GetPlayers()) {
			this.onPlayerAdded(player);
		}

		this.registerServerSignals();
		logger.info("WCS Service initialized");
	}

	private registerServerSignals() {
		// Update skills when backpack changes
		ServerSignals.backpackUpdated.Connect((player: Player, backpack: OwnedItem[]) => {
			this.updatePlayerSkills(player, backpack);
		});
	}

	/**
	 * Update player's WCS skills based on equipped abilities
	 * Uses diffing to only add/remove changed skills
	 */
	private updatePlayerSkills(player: Player, backpack: OwnedItem[]): void {
		const wcsCharacter = this.playerCharacters.get(player);
		if (!wcsCharacter) {
			logger.warn(`No WCS character for ${player.Name}, skipping skill update`);
			return;
		}

		// Find all equipped abilities (in AbilitySlot1-5, not "Backpack")
		const equippedAbilities = new Set<string>();
		for (const item of backpack) {
			if (item.ItemCategory === "Ability" && item.CurrentSlotKey !== "Backpack") {
				// Verify it's actually in an ability slot
				if (ABILITY_SLOT_KEYS.includes(item.CurrentSlotKey as (typeof ABILITY_SLOT_KEYS)[number])) {
					equippedAbilities.add(item.CatalogId);
				}
			}
		}

		// Get previously registered skills
		const previousSkills = this.playerSkills.get(player) ?? new Set<string>();

		// Determine what to add and remove
		const toAdd: string[] = [];
		const toRemove: string[] = [];

		for (const skillId of equippedAbilities) {
			if (!previousSkills.has(skillId)) {
				toAdd.push(skillId);
			}
		}

		for (const skillId of previousSkills) {
			if (!equippedAbilities.has(skillId)) {
				toRemove.push(skillId);
			}
		}

		// Remove unequipped skills
		for (const skillId of toRemove) {
			this.removeSkillFromCharacter(wcsCharacter, skillId);
		}

		// Add newly equipped skills
		for (const skillId of toAdd) {
			this.addSkillToCharacter(wcsCharacter, skillId);
		}

		// Update tracking
		this.playerSkills.set(player, equippedAbilities);

		if (toAdd.size() > 0 || toRemove.size() > 0) {
			logger.info(`Updated skills for ${player.Name}: +[${toAdd.join(", ")}] -[${toRemove.join(", ")}]`);
		}
	}

	private addSkillToCharacter(wcsCharacter: Character, skillId: string): void {
		const SkillConstructor = GetRegisteredSkillConstructor(skillId);
		if (SkillConstructor) {
			new SkillConstructor(wcsCharacter);
			logger.debug(`Added skill ${skillId} to ${wcsCharacter.Instance.Name}`);
		} else {
			logger.warn(`Skill constructor not found for: ${skillId}`);
		}
	}

	private removeSkillFromCharacter(wcsCharacter: Character, skillId: string): void {
		const SkillConstructor = GetRegisteredSkillConstructor(skillId);
		if (SkillConstructor) {
			const skill = wcsCharacter.GetSkillFromConstructor(SkillConstructor);
			if (skill) {
				skill.Destroy();
				logger.debug(`Removed skill ${skillId} from ${wcsCharacter.Instance.Name}`);
			}
		}
	}

	private onPlayerAdded(player: Player) {
		// Handle character spawning
		player.CharacterAdded.Connect((characterModel) => {
			this.setupCharacter(player, characterModel);
		});

		// Handle existing character
		if (player.Character) {
			this.setupCharacter(player, player.Character);
		}
	}

	private onPlayerRemoving(player: Player) {
		// Clean up tracking
		this.playerCharacters.delete(player);
		this.playerSkills.delete(player);
		logger.debug(`Cleaned up WCS state for ${player.Name}`);
	}

	private setupCharacter(player: Player, characterModel: Model) {
		// Create WCS Character wrapper
		const wcsCharacter = new Character(characterModel);
		this.playerCharacters.set(player, wcsCharacter);
		this.playerSkills.set(player, new Set());

		logger.info(`Created WCS Character for ${characterModel.Name}`);

		// Request current backpack to sync equipped skills
		// This handles both initial spawn and respawn cases
		const backpack = this.inventoryService.getPlayerBackpack(player);
		if (backpack) {
			this.updatePlayerSkills(player, backpack);
			logger.info(`Synced skills for ${player.Name} on character setup`);
		}

		// Clean up on death
		const humanoid = characterModel.WaitForChild("Humanoid") as Humanoid;
		humanoid.Died.Once(() => {
			this.playerCharacters.delete(player);
			this.playerSkills.delete(player);
			wcsCharacter.Destroy();
			logger.info(`Destroyed WCS Character for ${characterModel.Name}`);
		});

		// Listen for damage events
		wcsCharacter.DamageTaken.Connect((damageContainer: DamageContainer) => {
			logger.info(`${characterModel.Name} took ${damageContainer.Damage} damage`);
		});

		wcsCharacter.DamageDealt.Connect((target: Character | undefined, damageContainer: DamageContainer) => {
			if (target) {
				logger.info(`${characterModel.Name} dealt ${damageContainer.Damage} damage to ${target.Instance.Name}`);
			}
		});
	}
}
